import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

interface DuelRoom {
  code: string;
  hostName: string;
  hostId: string;
  guestName?: string;
  guestId?: string;
  surahNum: number;
  diff: string;
  questionCount: number;
  seed: number;
  status: 'waiting' | 'ready' | 'playing' | 'finished';
  hostScore: number;
  hostQIndex: number;
  guestScore: number;
  guestQIndex: number;
  createdAt: number;
  lastUpdated: number;
}

const rooms = new Map<string, DuelRoom>();

// Clean up stale rooms older than 3 hours
setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms.entries()) {
    if (now - room.lastUpdated > 3 * 60 * 60 * 1000) {
      rooms.delete(code);
    }
  }
}, 15 * 60 * 1000);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Health Check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', activeRooms: rooms.size });
  });

  // -------------------------------------------------------------
  // Real-time 1v1 Room Sync Endpoints
  // -------------------------------------------------------------

  // 1. Create a new Live Room (Host)
  app.post('/api/rooms/create', (req, res) => {
    const { code, hostName, hostId, surahNum, diff, questionCount, seed } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Room code is required' });
    }

    const cleanCode = String(code).trim().toUpperCase();
    const newRoom: DuelRoom = {
      code: cleanCode,
      hostName: hostName || 'Host',
      hostId: hostId || 'host_user',
      guestName: undefined,
      guestId: undefined,
      surahNum: typeof surahNum === 'number' ? surahNum : 0,
      diff: diff || 'hafiz',
      questionCount: typeof questionCount === 'number' ? questionCount : 5,
      seed: typeof seed === 'number' ? seed : Math.floor(Math.random() * 10000) + 1,
      status: 'waiting',
      hostScore: 0,
      hostQIndex: 0,
      guestScore: 0,
      guestQIndex: 0,
      createdAt: Date.now(),
      lastUpdated: Date.now(),
    };

    rooms.set(cleanCode, newRoom);
    return res.json({ success: true, isHost: true, room: newRoom });
  });

  // 2. Join an existing Live Room (Guest / Opponent)
  app.post('/api/rooms/join', (req, res) => {
    const { code, guestName, guestId } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Room code is required' });
    }

    const cleanCode = String(code).trim().toUpperCase();
    const room = rooms.get(cleanCode);

    if (!room) {
      // If room not found on server yet (e.g. Host just created locally), auto-create a placeholder room so friend isn't locked out
      const placeholderRoom: DuelRoom = {
        code: cleanCode,
        hostName: 'Host Companion',
        hostId: 'host_pending',
        guestName: guestName || 'Guest Companion',
        guestId: guestId || 'guest_user',
        surahNum: 0,
        diff: 'hafiz',
        questionCount: 5,
        seed: Math.floor(Math.random() * 10000) + 1,
        status: 'ready',
        hostScore: 0,
        hostQIndex: 0,
        guestScore: 0,
        guestQIndex: 0,
        createdAt: Date.now(),
        lastUpdated: Date.now(),
      };
      rooms.set(cleanCode, placeholderRoom);
      return res.json({ success: true, isHost: false, room: placeholderRoom });
    }

    // Join room as Guest (Opponent)
    room.guestName = guestName || 'Guest Companion';
    room.guestId = guestId || 'guest_user';
    room.status = 'ready';
    room.lastUpdated = Date.now();

    return res.json({ success: true, isHost: false, room });
  });

  // 3. Get Room Info (Polling)
  app.get('/api/rooms/:code', (req, res) => {
    const cleanCode = String(req.params.code).trim().toUpperCase();
    const room = rooms.get(cleanCode);

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    return res.json({ success: true, room });
  });

  // 4. Start Match (Triggered by Host)
  app.post('/api/rooms/:code/start', (req, res) => {
    const cleanCode = String(req.params.code).trim().toUpperCase();
    const room = rooms.get(cleanCode);

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const { seed } = req.body;
    if (typeof seed === 'number') {
      room.seed = seed;
    }
    room.status = 'playing';
    room.hostScore = 0;
    room.hostQIndex = 0;
    room.guestScore = 0;
    room.guestQIndex = 0;
    room.lastUpdated = Date.now();

    return res.json({ success: true, room });
  });

  // 5. Update Progress/Answer during Match
  app.post('/api/rooms/:code/progress', (req, res) => {
    const cleanCode = String(req.params.code).trim().toUpperCase();
    const room = rooms.get(cleanCode);

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const { isHost, score, qIndex } = req.body;

    if (isHost) {
      if (typeof score === 'number') room.hostScore = score;
      if (typeof qIndex === 'number') room.hostQIndex = qIndex;
    } else {
      if (typeof score === 'number') room.guestScore = score;
      if (typeof qIndex === 'number') room.guestQIndex = qIndex;
    }

    room.lastUpdated = Date.now();
    return res.json({ success: true, room });
  });

  // -------------------------------------------------------------
  // Vite Integration & Static Serving
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
