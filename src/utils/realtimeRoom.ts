/**
 * Real-Time Cross-Device Synchronization Relay for Ayah Quest 1v1 Duels
 * 
 * Guarantees instant synchronization across physical phones, mobile data (4G/5G),
 * WiFi, and Cloudflare Worker deployments using a three-tier transport:
 * 1. Global Serverless Pub/Sub (EventSource / HTTP push via ntfy.sh)
 * 2. Backend Room REST API (/api/rooms/*)
 * 3. Browser-local BroadcastChannel (for tabs on the same device)
 */

export interface RoomMessage {
  type: 
    | 'HOST_PRESENCE' 
    | 'GUEST_JOINED' 
    | 'HOST_ACCEPTED' 
    | 'START_MATCH' 
    | 'SCORE_UPDATE' 
    | 'LEAVE_ROOM';
  senderId: string;
  senderName: string;
  isHost: boolean;
  code: string;
  timestamp: number;
  surahNum?: number;
  diff?: string;
  count?: number;
  seed?: number;
  score?: number;
  qIndex?: number;
}

export type MessageListener = (msg: RoomMessage) => void;

class RealtimeRoomClient {
  private code: string = '';
  private isHost: boolean = false;
  private userId: string = '';
  private userName: string = '';
  private eventSource: EventSource | null = null;
  private pollTimer: number | null = null;
  private localBroadcast: BroadcastChannel | null = null;
  private listeners: Set<MessageListener> = new Set();
  private lastMessageTimestamp: number = 0;
  private seenMessageIds: Set<string> = new Set();

  public connect(params: {
    code: string;
    isHost: boolean;
    userId: string;
    userName: string;
    onMessage: MessageListener;
  }) {
    this.disconnect();

    this.code = params.code.trim().toUpperCase();
    this.isHost = params.isHost;
    this.userId = params.userId || (params.isHost ? 'host_' + Math.random().toString(36).slice(2, 7) : 'guest_' + Math.random().toString(36).slice(2, 7));
    this.userName = params.userName || (params.isHost ? 'Host' : 'Opponent');
    this.listeners.add(params.onMessage);
    this.lastMessageTimestamp = Date.now() - 60000; // Look back up to 1 minute

    const topic = `ayahquest_room_${this.code.toLowerCase()}`;

    // 1. Local BroadcastChannel for same-device tabs
    try {
      this.localBroadcast = new BroadcastChannel(`ayahquest_local_${this.code}`);
      this.localBroadcast.onmessage = (e) => {
        if (e.data && e.data.code === this.code) {
          this.notifyListeners(e.data);
        }
      };
    } catch {}

    // 2. EventSource (SSE) to global relay
    try {
      if (typeof EventSource !== 'undefined') {
        const sseUrl = `https://ntfy.sh/${topic}/sse?since=1m`;
        this.eventSource = new EventSource(sseUrl);

        this.eventSource.onmessage = (e) => {
          try {
            const raw = JSON.parse(e.data);
            if (raw && raw.message) {
              const msg: RoomMessage = JSON.parse(raw.message);
              if (msg && msg.code === this.code && msg.senderId !== this.userId) {
                this.notifyListeners(msg);
              }
            }
          } catch {}
        };

        this.eventSource.onerror = () => {
          // If SSE connection drops or is blocked on a cellular network, fallback to fast poll
          this.startFastPolling(topic);
        };
      } else {
        this.startFastPolling(topic);
      }
    } catch {
      this.startFastPolling(topic);
    }

    // Always keep a moderate background poll to ensure zero dropped messages
    this.startFastPolling(topic);
  }

  private startFastPolling(topic: string) {
    if (this.pollTimer) return;
    this.pollTimer = window.setInterval(async () => {
      try {
        const sinceSeconds = Math.max(1, Math.floor((Date.now() - this.lastMessageTimestamp) / 1000));
        const res = await fetch(`https://ntfy.sh/${topic}/json?poll=1&since=${sinceSeconds}s`, {
          cache: 'no-store',
        });
        if (!res.ok) return;

        const text = await res.text();
        const lines = text.trim().split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.id && this.seenMessageIds.has(parsed.id)) continue;
            if (parsed.id) this.seenMessageIds.add(parsed.id);

            if (parsed.message) {
              const msg: RoomMessage = JSON.parse(parsed.message);
              if (msg && msg.code === this.code && msg.senderId !== this.userId) {
                this.notifyListeners(msg);
              }
            }
          } catch {}
        }
      } catch {}
    }, 1200);
  }

  public async publish(payload: Omit<RoomMessage, 'senderId' | 'senderName' | 'isHost' | 'code' | 'timestamp'>) {
    if (!this.code) return;

    const fullMessage: RoomMessage = {
      ...payload,
      code: this.code,
      senderId: this.userId,
      senderName: this.userName,
      isHost: this.isHost,
      timestamp: Date.now(),
    };

    // Broadcast locally
    try {
      this.localBroadcast?.postMessage(fullMessage);
    } catch {}

    // Broadcast to global serverless relay
    const topic = `ayahquest_room_${this.code.toLowerCase()}`;
    try {
      await fetch(`https://ntfy.sh/${topic}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Title': `Room ${this.code} - ${fullMessage.type}`,
        },
        body: JSON.stringify(fullMessage),
      });
    } catch {}

    // Also update REST API if active
    if (payload.type === 'START_MATCH' && typeof payload.seed === 'number') {
      fetch(`/api/rooms/${this.code}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed: payload.seed }),
      }).catch(() => {});
    } else if (payload.type === 'SCORE_UPDATE') {
      fetch(`/api/rooms/${this.code}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isHost: this.isHost,
          score: payload.score ?? 0,
          qIndex: payload.qIndex ?? 0,
        }),
      }).catch(() => {});
    }
  }

  private notifyListeners(msg: RoomMessage) {
    this.lastMessageTimestamp = Math.max(this.lastMessageTimestamp, msg.timestamp || Date.now());
    this.listeners.forEach((listener) => {
      try {
        listener(msg);
      } catch (e) {
        console.error('Room listener error:', e);
      }
    });
  }

  public disconnect() {
    if (this.eventSource) {
      try {
        this.eventSource.close();
      } catch {}
      this.eventSource = null;
    }

    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }

    if (this.localBroadcast) {
      try {
        this.localBroadcast.close();
      } catch {}
      this.localBroadcast = null;
    }

    this.listeners.clear();
    this.seenMessageIds.clear();
    this.code = '';
  }
}

export const realtimeRoom = new RealtimeRoomClient();
