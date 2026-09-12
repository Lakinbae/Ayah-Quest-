import React, { useState, useEffect, useRef } from 'react';
import { 
  Swords, Zap, Trophy, Users, Share2, Copy, Check, ArrowRight, 
  RotateCcw, Sparkles, Clock, Crown, AlertTriangle, Play, Flame, 
  CheckCircle2, XCircle, ChevronRight, MessageSquare, ShieldCheck, 
  Heart, BookOpen, Search, BookMarked, Send, ChevronDown, CheckCheck,
  Bot, ExternalLink, HelpCircle, UserCheck, X
} from 'lucide-react';
import { UserProfile, Surah } from '../types';
import { 
  DuelQuestion, 
  DuelDifficulty,
  DUEL_QUESTIONS_POOL, 
  getQuestionsBySeed, 
  generateDynamicSurahQuestions,
  generateRoomCode,
  formatTelegramChallengeMessage,
  shareToTelegram,
  SINCERE_DUAS_FOR_FRIENDS,
  SincereDua
} from '../data/duelData';
import { SURAH_LIST } from '../data/surahList';
import { SURAHS_DATA } from '../data/quranData';
import { fetchSurah } from '../data/quranApi';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface FriendDuelViewProps {
  user: UserProfile;
  initialRoomCode?: string;
  initialChallenge?: {
    challengerName: string;
    challengerScore: number;
    challengerTime: number;
    seed: number;
    surahNumber?: number;
    difficulty?: DuelDifficulty;
    questionCount?: number;
  };
  onBackToSolo?: () => void;
}

type DuelSubView = 
  | 'hub' 
  | 'incoming_prompt' 
  | 'asyn_playing' 
  | 'asyn_result' 
  | 'live_lobby' 
  | 'live_playing' 
  | 'live_result';

export const FriendDuelView: React.FC<FriendDuelViewProps> = ({
  user,
  initialRoomCode,
  initialChallenge,
  onBackToSolo,
}) => {
  // Navigation & Subviews
  const [subView, setSubView] = useState<DuelSubView>(() => {
    if (initialChallenge) return 'incoming_prompt';
    if (initialRoomCode) return 'live_lobby';
    return 'hub';
  });

  // Challenge Configuration
  const [selectedSurahNum, setSelectedSurahNum] = useState<number>(0); // 0 = All 114 Surahs
  const [surahSearchQuery, setSurahSearchQuery] = useState<string>('');
  const [showSurahPicker, setShowSurahPicker] = useState<boolean>(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DuelDifficulty>('hafiz');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [isSurahLoading, setIsSurahLoading] = useState<boolean>(false);
  const [loadedSurahData, setLoadedSurahData] = useState<Surah | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // -------------------------------------------------------------
  // Mode 1: Asynchronous "Beat My Score" Ghost Challenge
  // -------------------------------------------------------------
  const [asynSeed, setAsynSeed] = useState<number>(() => initialChallenge?.seed || Math.floor(Math.random() * 10000) + 1);
  const [asynQuestions, setAsynQuestions] = useState<DuelQuestion[]>(() => getQuestionsBySeed(asynSeed, 5, { difficulty: 'hafiz' }));
  const [asynQIndex, setAsynQIndex] = useState<number>(0);
  const [asynScore, setAsynScore] = useState<number>(0);
  const [asynSelectedOpt, setAsynSelectedOpt] = useState<number | null>(null);
  const [asynIsAnswered, setAsynIsAnswered] = useState<boolean>(false);
  const [asynElapsedSeconds, setAsynElapsedSeconds] = useState<number>(0);
  const asynTimerRef = useRef<number | null>(null);

  // Incoming challenger data
  const [challenger, setChallenger] = useState(initialChallenge || null);

  // Sincere Dua for Companion modal/selector
  const [selectedDua, setSelectedDua] = useState<SincereDua>(SINCERE_DUAS_FOR_FRIENDS[0]);
  const [isDuaCopied, setIsDuaCopied] = useState<boolean>(false);

  // -------------------------------------------------------------
  // Mode 2: Real-time 1v1 Live Room Duel State
  // -------------------------------------------------------------
  // Synchronously parse URL query & Telegram Mini App params to avoid any race condition or accidental Host role
  const getInitialRoomParams = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room') || params.get('join') || '';
      const roleParam = params.get('role');
      const tgStartParam = 
        (window as any).Telegram?.WebApp?.initDataUnsafe?.start_param || 
        params.get('tgWebAppStartParam') || '';
      let tgRoom = '';
      if (tgStartParam.startsWith('room_')) {
        tgRoom = tgStartParam.replace('room_', '');
      } else if (tgStartParam.startsWith('join_')) {
        tgRoom = tgStartParam.replace('join_', '');
      }
      const finalCode = (initialRoomCode || roomParam || tgRoom).trim().toUpperCase();
      // If a code was present in URL or role is explicitly guest, user is an OPPONENT / GUEST (isHost: false)
      const isJoiningAsGuest = Boolean(finalCode) || roleParam === 'guest' || roleParam === 'opponent';
      return {
        code: finalCode,
        isHost: !isJoiningAsGuest,
        subView: finalCode ? ('live_lobby' as const) : ('hub' as const),
      };
    } catch {
      return { code: initialRoomCode || '', isHost: !initialRoomCode, subView: 'hub' as const };
    }
  };

  const initialRoomMeta = getInitialRoomParams();

  const [roomCode, setRoomCode] = useState<string>(initialRoomMeta.code);
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [liveTab, setLiveTab] = useState<'host' | 'join'>('host');
  const [isHost, setIsHost] = useState<boolean>(initialRoomMeta.isHost);
  const [opponentName, setOpponentName] = useState<string>('');
  const [isOpponentConnected, setIsOpponentConnected] = useState<boolean>(false);
  const [isBotOpponent, setIsBotOpponent] = useState<boolean>(false);
  const [botIsThinking, setBotIsThinking] = useState<boolean>(false);

  // Live game state
  const [liveSeed, setLiveSeed] = useState<number>(101);
  const [liveQuestions, setLiveQuestions] = useState<DuelQuestion[]>([]);
  const [liveQIndex, setLiveQIndex] = useState<number>(0);
  const [liveMyScore, setLiveMyScore] = useState<number>(0);
  const [liveOpponentScore, setLiveOpponentScore] = useState<number>(0);
  const [liveOpponentQIndex, setLiveOpponentQIndex] = useState<number>(0);
  const [liveSelectedOpt, setLiveSelectedOpt] = useState<number | null>(null);
  const [liveIsAnswered, setLiveIsAnswered] = useState<boolean>(false);
  const [liveCountdown, setLiveCountdown] = useState<number | null>(null);
  const [qSecondsLeft, setQSecondsLeft] = useState<number>(20);

  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const qTimerRef = useRef<number | null>(null);
  const botTimerRef = useRef<number | null>(null);

  // Cache of fetched surahs
  const surahsCache = useRef<Record<number, Surah>>({});

  // -------------------------------------------------------------
  // Server-side Room Synchronization (Cross-device & Telegram)
  // -------------------------------------------------------------
  const createRoomOnServer = async (code: string, surah: number, diff: string, count: number, seed: number) => {
    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          hostName: user.first_name || 'Host Companion',
          hostId: user.id || 'host_user',
          surahNum: surah,
          diff,
          questionCount: count,
          seed,
        }),
      });
      return await res.json();
    } catch (e) {
      console.warn('Server room create fallback:', e);
      return null;
    }
  };

  const joinRoomOnServer = async (code: string, guestName: string) => {
    try {
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          guestName,
          guestId: user.id || 'guest_user',
        }),
      });
      const data = await res.json();
      if (data && data.room) {
        const r = data.room;
        if (r.surahNum !== undefined) setSelectedSurahNum(r.surahNum);
        if (r.diff) setSelectedDifficulty(r.diff as DuelDifficulty);
        if (r.questionCount) setQuestionCount(r.questionCount);
        if (r.seed) setLiveSeed(r.seed);
        if (r.hostName) {
          setOpponentName(r.hostName);
          setIsOpponentConnected(true);
        }
      }
      return data;
    } catch (e) {
      console.warn('Server room join fallback:', e);
      return null;
    }
  };

  // -------------------------------------------------------------
  // URL Query & Telegram Deep-Link Parsing
  // -------------------------------------------------------------
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      let duelParam = params.get('duel') || params.get('challenge');
      let by = params.get('by');
      let scoreStr = params.get('score');
      let timeStr = params.get('time');
      let seedStr = params.get('seed');
      let surahStr = params.get('surah');
      let diffStr = params.get('diff');
      let countStr = params.get('cnt');
      let roomParam = params.get('room') || params.get('join');

      // Check Telegram Mini App start_param (e.g. ?tgWebAppStartParam=duel_42_67_mutqin_Ahmad_5_22 or room_AYAH42)
      const tgStartParam = 
        (window as any).Telegram?.WebApp?.initDataUnsafe?.start_param || 
        params.get('tgWebAppStartParam');

      if (tgStartParam && tgStartParam.startsWith('duel_')) {
        // Format: duel_{seed}_{surah}_{diff}_{by}_{score}_{time}
        const parts = tgStartParam.split('_');
        if (parts.length >= 7) {
          seedStr = parts[1];
          surahStr = parts[2];
          diffStr = parts[3];
          by = parts[4];
          scoreStr = parts[5];
          timeStr = parts[6];
          duelParam = 'challenge';
        }
      } else if (tgStartParam && tgStartParam.startsWith('room_')) {
        roomParam = tgStartParam.replace('room_', '');
      } else if (tgStartParam && tgStartParam.startsWith('join_')) {
        roomParam = tgStartParam.replace('join_', '');
      }

      if (by && scoreStr && timeStr && seedStr) {
        const parsedSeed = parseInt(seedStr, 10) || 42;
        const parsedSurah = surahStr ? parseInt(surahStr, 10) : 0;
        const parsedDiff = (diffStr as DuelDifficulty) || 'hafiz';
        const parsedCount = countStr ? parseInt(countStr, 10) : 5;

        setSelectedSurahNum(parsedSurah);
        setSelectedDifficulty(parsedDiff);
        setQuestionCount(parsedCount);

        setChallenger({
          challengerName: decodeURIComponent(by),
          challengerScore: parseInt(scoreStr, 10) || 0,
          challengerTime: parseFloat(timeStr) || 0,
          seed: parsedSeed,
          surahNumber: parsedSurah,
          difficulty: parsedDiff,
          questionCount: parsedCount,
        });

        setAsynSeed(parsedSeed);
        setSubView('incoming_prompt');

        // Preload questions for this challenge
        if (parsedSurah > 0) {
          fetchSurah(parsedSurah).then((data) => {
            setLoadedSurahData(data);
            surahsCache.current[parsedSurah] = data;
            const qs = getQuestionsBySeed(parsedSeed, parsedCount, {
              surahNumber: parsedSurah,
              surahData: data,
              difficulty: parsedDiff,
            });
            setAsynQuestions(qs);
          });
        } else {
          setAsynQuestions(getQuestionsBySeed(parsedSeed, parsedCount, { difficulty: parsedDiff }));
        }
      } else if (roomParam) {
        // User joined via link: GUARANTEED OPPONENT / GUEST
        const code = roomParam.trim().toUpperCase();
        setRoomCode(code);
        setIsHost(false);
        setSubView('live_lobby');
        joinRoomOnServer(code, user.first_name || 'Companion');
        setupBroadcast(code, false);
      }
    } catch (e) {
      console.warn('URL param parse error:', e);
    }
  }, []);

  // -------------------------------------------------------------
  // Real-time Room Polling Effect (Lobby and In-Game Live Sync)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!roomCode || (subView !== 'live_lobby' && subView !== 'live_playing')) return;

    let isMounted = true;
    const pollInterval = window.setInterval(async () => {
      try {
        const res = await fetch(`/api/rooms/${roomCode}`);
        if (!res.ok || !isMounted) return;
        const data = await res.json();
        if (!data.success || !data.room) return;
        const r = data.room;

        if (subView === 'live_lobby') {
          if (isHost) {
            // Host listening for guest joining
            if (r.guestName && !isOpponentConnected) {
              setOpponentName(r.guestName);
              setIsOpponentConnected(true);
              showToast(`🟢 ${r.guestName} joined as your opponent!`);
            }
          } else {
            // Guest / Opponent listening for host & game start
            if (r.hostName) {
              setOpponentName(r.hostName);
              setIsOpponentConnected(true);
            }
            if (r.surahNum !== undefined && r.surahNum !== selectedSurahNum) {
              setSelectedSurahNum(r.surahNum);
            }
            if (r.diff && r.diff !== selectedDifficulty) {
              setSelectedDifficulty(r.diff as DuelDifficulty);
            }
            if (r.questionCount && r.questionCount !== questionCount) {
              setQuestionCount(r.questionCount);
            }
            // If Host clicked "Start Live Duel"
            if (r.status === 'playing' && subView === 'live_lobby' && liveCountdown === null) {
              const seed = r.seed || 42;
              setLiveSeed(seed);
              const qs = getQuestionsBySeed(seed, r.questionCount || questionCount, {
                surahNumber: r.surahNum || selectedSurahNum,
                surahData: loadedSurahData || undefined,
                difficulty: (r.diff as DuelDifficulty) || selectedDifficulty,
              });
              setLiveQuestions(qs);
              startCountdownFlow();
            }
          }
        } else if (subView === 'live_playing') {
          // Sync scores in real-time during live match
          if (isHost) {
            if (typeof r.guestScore === 'number') setLiveOpponentScore(r.guestScore);
            if (typeof r.guestQIndex === 'number') setLiveOpponentQIndex(r.guestQIndex);
          } else {
            if (typeof r.hostScore === 'number') setLiveOpponentScore(r.hostScore);
            if (typeof r.hostQIndex === 'number') setLiveOpponentQIndex(r.hostQIndex);
          }
        }
      } catch {}
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [roomCode, subView, isHost, isOpponentConnected, selectedSurahNum, selectedDifficulty, questionCount, liveCountdown, loadedSurahData]);

  // Pre-load selected surah when user changes it in Hub
  useEffect(() => {
    if (selectedSurahNum > 0) {
      if (surahsCache.current[selectedSurahNum]) {
        setLoadedSurahData(surahsCache.current[selectedSurahNum]);
      } else if (SURAHS_DATA[selectedSurahNum]) {
        setLoadedSurahData(SURAHS_DATA[selectedSurahNum]);
        surahsCache.current[selectedSurahNum] = SURAHS_DATA[selectedSurahNum];
      } else {
        setIsSurahLoading(true);
        fetchSurah(selectedSurahNum)
          .then((data) => {
            setLoadedSurahData(data);
            surahsCache.current[selectedSurahNum] = data;
          })
          .catch((err) => console.error('Surah fetch error:', err))
          .finally(() => setIsSurahLoading(false));
      }
    } else {
      setLoadedSurahData(null);
    }
  }, [selectedSurahNum]);

  // Current Surah Title Label
  const getActiveSurahTitle = (surahNum: number = selectedSurahNum) => {
    if (surahNum === 0) return 'All 114 Surahs (Complete Quran)';
    const meta = SURAH_LIST.find((s) => s.number === surahNum);
    return meta ? `${meta.englishName} (${meta.name})` : `Surah ${surahNum}`;
  };

  // -------------------------------------------------------------
  // Asynchronous Challenge Handlers
  // -------------------------------------------------------------
  const startAsynChallenge = (customSeed?: number) => {
    const activeSeed = customSeed !== undefined ? customSeed : Math.floor(Math.random() * 10000) + 1;
    setAsynSeed(activeSeed);

    const questions = getQuestionsBySeed(activeSeed, questionCount, {
      surahNumber: selectedSurahNum,
      surahData: loadedSurahData || undefined,
      difficulty: selectedDifficulty,
    });

    setAsynQuestions(questions.length > 0 ? questions : DUEL_QUESTIONS_POOL.slice(0, questionCount));
    setAsynQIndex(0);
    setAsynScore(0);
    setAsynSelectedOpt(null);
    setAsynIsAnswered(false);
    setAsynElapsedSeconds(0);
    setSubView('asyn_playing');

    if (asynTimerRef.current) clearInterval(asynTimerRef.current);
    const startTs = Date.now();
    asynTimerRef.current = window.setInterval(() => {
      setAsynElapsedSeconds(Math.round(((Date.now() - startTs) / 1000) * 10) / 10);
    }, 100);
  };

  const handleAsynAnswer = (optIndex: number) => {
    if (asynIsAnswered) return;
    setAsynSelectedOpt(optIndex);
    setAsynIsAnswered(true);

    const currentQ = asynQuestions[asynQIndex];
    if (currentQ && optIndex === currentQ.correctIndex) {
      setAsynScore((s) => s + 1);
    }
  };

  const handleAsynNext = () => {
    if (asynQIndex < asynQuestions.length - 1) {
      setAsynQIndex((i) => i + 1);
      setAsynSelectedOpt(null);
      setAsynIsAnswered(false);
    } else {
      // Finished
      if (asynTimerRef.current) clearInterval(asynTimerRef.current);
      setSubView('asyn_result');
    }
  };

  // Total estimated recited letters for Hasanat calculation
  const totalLettersRecited = asynQuestions.reduce((acc, q) => acc + (q.estimatedLetters || 45), 0);
  const totalHasanatEstimate = totalLettersRecited * 10;

  // Telegram deep-link URL generator
  const getChallengeUrl = () => {
    const base = window.location.origin + window.location.pathname;
    const name = encodeURIComponent(user.first_name || 'Hafiz Friend');
    return `${base}?duel=challenge&by=${name}&score=${asynScore}&time=${asynElapsedSeconds}&seed=${asynSeed}&surah=${selectedSurahNum}&diff=${selectedDifficulty}&cnt=${questionCount}`;
  };

  const handleCopyChallengeLink = async () => {
    const url = getChallengeUrl();
    try {
      await navigator.clipboard.writeText(url);
      showToast('📋 Challenge link copied to clipboard!');
    } catch {
      showToast('Link ready!');
    }
  };

  const handleShareTelegram = () => {
    const url = getChallengeUrl();
    const message = formatTelegramChallengeMessage({
      challengerName: user.first_name || 'Companion in Faith',
      surahTitle: getActiveSurahTitle(selectedSurahNum),
      score: asynScore,
      totalQuestions: asynQuestions.length,
      timeSeconds: asynElapsedSeconds,
      difficulty: selectedDifficulty,
      challengeUrl: url,
    });

    const success = shareToTelegram(url, message);
    if (!success) {
      navigator.clipboard.writeText(`${message}\n\n${url}`);
      showToast('Message copied for Telegram!');
    }
  };

  const handleCopyTelegramMessage = async () => {
    const url = getChallengeUrl();
    const message = formatTelegramChallengeMessage({
      challengerName: user.first_name || 'Companion in Faith',
      surahTitle: getActiveSurahTitle(selectedSurahNum),
      score: asynScore,
      totalQuestions: asynQuestions.length,
      timeSeconds: asynElapsedSeconds,
      difficulty: selectedDifficulty,
      challengeUrl: url,
    });
    try {
      await navigator.clipboard.writeText(message);
      showToast('🌟 Telegram invite message copied!');
    } catch {
      showToast('Message ready!');
    }
  };

  const handleShareDuaTelegram = (dua: SincereDua) => {
    const appUrl = `${window.location.origin}${window.location.pathname}`;
    const text = 
`🤲 *Dua for my Companion in Faith & Quran (دعاء بظهر الغيب):*

«${dua.arabic}»

_${dua.translation}_

📜 *Reference:* ${dua.source || 'Prophetic Tradition'}
— From your companion ${user.first_name || 'in Islam'}, may Allah bless your Quran study! 🤍`;

    shareToTelegram(appUrl, text);
    showToast('Opening Telegram Share...');
  };

  const handleCopyDua = async (dua: SincereDua) => {
    const text = 
`🤲 Dua for Companion in Quran & Faith:

«${dua.arabic}»

"${dua.translation}"

Reference: ${dua.source || 'Prophetic Tradition'}
— Shared via Ayah Quest`;

    try {
      await navigator.clipboard.writeText(text);
      setIsDuaCopied(true);
      showToast('📋 Dua copied to clipboard! You can paste it anywhere.');
      setTimeout(() => setIsDuaCopied(false), 2500);
    } catch {
      showToast('Dua copied!');
    }
  };

  // -------------------------------------------------------------
  // Live Room Handlers
  // -------------------------------------------------------------
  const initHostRoom = async () => {
    const newCode = generateRoomCode();
    setRoomCode(newCode);
    setIsHost(true);
    setOpponentName('');
    setIsOpponentConnected(false);
    setIsBotOpponent(false);
    setSubView('live_lobby');
    showToast(`Created Room ${newCode}! Share with your companion.`);

    const seed = Math.floor(Math.random() * 10000) + 1;
    setLiveSeed(seed);
    await createRoomOnServer(newCode, selectedSurahNum, selectedDifficulty, questionCount, seed);
    setupBroadcast(newCode, true);
  };

  const initJoinRoom = async (code: string) => {
    const clean = code.trim().toUpperCase();
    if (!clean) return;
    setRoomCode(clean);
    setIsHost(false); // ALWAYS FALSE: Explicitly registered as Guest / Opponent
    setOpponentName('');
    setIsOpponentConnected(false);
    setIsBotOpponent(false);
    setSubView('live_lobby');
    showToast(`Joining Room ${clean} as Opponent...`);

    await joinRoomOnServer(clean, user.first_name || 'Companion');
    setupBroadcast(clean, false);
  };

  const setupBroadcast = (code: string, amIHost: boolean) => {
    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.close();
      } catch {}
    }

    try {
      const channel = new BroadcastChannel(`quran_duel_${code}`);
      broadcastChannelRef.current = channel;

      channel.onmessage = (event) => {
        const data = event.data;
        if (!data) return;

        if (data.type === 'PLAYER_JOINED') {
          setOpponentName(data.name || 'Friend');
          setIsOpponentConnected(true);
          showToast(`🟢 ${data.name || 'Friend'} joined the room!`);
          if (amIHost) {
            channel.postMessage({
              type: 'HOST_ACK',
              hostName: user.first_name || 'Host',
              surahNum: selectedSurahNum,
              diff: selectedDifficulty,
            });
          }
        } else if (data.type === 'HOST_ACK') {
          setOpponentName(data.hostName || 'Host');
          if (data.surahNum !== undefined) setSelectedSurahNum(data.surahNum);
          if (data.diff !== undefined) setSelectedDifficulty(data.diff);
          setIsOpponentConnected(true);
          showToast(`Connected to Host: ${data.hostName || 'Host'}`);
        } else if (data.type === 'START_COUNTDOWN') {
          setLiveSeed(data.seed);
          const qs = getQuestionsBySeed(data.seed, questionCount, {
            surahNumber: data.surahNum || selectedSurahNum,
            surahData: loadedSurahData || undefined,
            difficulty: data.diff || selectedDifficulty,
          });
          setLiveQuestions(qs);
          startCountdownFlow();
        } else if (data.type === 'OPPONENT_ANSWER') {
          setLiveOpponentScore(data.score);
          setLiveOpponentQIndex(data.qIndex);
        } else if (data.type === 'REMATCH_REQUEST') {
          showToast('⚔️ Opponent requested a rematch!');
        }
      };

      // If guest, broadcast that we joined
      if (!amIHost) {
        channel.postMessage({
          type: 'PLAYER_JOINED',
          name: user.first_name || 'Companion',
        });
      }
    } catch {}

    if (isSupabaseConfigured && supabase) {
      try {
        const sbChannel = supabase.channel(`room_${code}`);
        sbChannel
          .on('broadcast', { event: 'duel_event' }, (payload: any) => {
            const data = payload.payload;
            if (data.type === 'PLAYER_JOINED') {
              setOpponentName(data.name || 'Friend');
              setIsOpponentConnected(true);
              if (amIHost) {
                sbChannel.send({
                  type: 'broadcast',
                  event: 'duel_event',
                  payload: {
                    type: 'HOST_ACK',
                    hostName: user.first_name || 'Host',
                    surahNum: selectedSurahNum,
                    diff: selectedDifficulty,
                  },
                });
              }
            } else if (data.type === 'HOST_ACK') {
              setOpponentName(data.hostName || 'Host');
              if (data.surahNum !== undefined) setSelectedSurahNum(data.surahNum);
              if (data.diff !== undefined) setSelectedDifficulty(data.diff);
              setIsOpponentConnected(true);
            } else if (data.type === 'START_COUNTDOWN') {
              setLiveSeed(data.seed);
              const qs = getQuestionsBySeed(data.seed, questionCount, {
                surahNumber: data.surahNum || selectedSurahNum,
                surahData: loadedSurahData || undefined,
                difficulty: data.diff || selectedDifficulty,
              });
              setLiveQuestions(qs);
              startCountdownFlow();
            } else if (data.type === 'OPPONENT_ANSWER') {
              setLiveOpponentScore(data.score);
              setLiveOpponentQIndex(data.qIndex);
            }
          })
          .subscribe((status) => {
            if (status === 'SUBSCRIBED' && !amIHost) {
              sbChannel.send({
                type: 'broadcast',
                event: 'duel_event',
                payload: {
                  type: 'PLAYER_JOINED',
                  name: user.first_name || 'Companion',
                },
              });
            }
          });
      } catch {}
    }
  };

  const handleStartWithBot = () => {
    setIsBotOpponent(true);
    setOpponentName('Hafiz AI Companion');
    setIsOpponentConnected(true);
    showToast('🤖 Hafiz Companion joined! Starting live duel...');
  };

  const reportLiveAnswerToServer = (score: number, qIdx: number) => {
    if (!roomCode) return;
    fetch(`/api/rooms/${roomCode}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isHost,
        score,
        qIndex: qIdx,
      }),
    }).catch(() => {});
  };

  const handleTriggerStartDuel = async () => {
    const seed = liveSeed || Math.floor(Math.random() * 10000) + 1;
    setLiveSeed(seed);

    const qs = getQuestionsBySeed(seed, questionCount, {
      surahNumber: selectedSurahNum,
      surahData: loadedSurahData || undefined,
      difficulty: selectedDifficulty,
    });
    setLiveQuestions(qs);

    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'START_COUNTDOWN',
        seed,
        surahNum: selectedSurahNum,
        diff: selectedDifficulty,
        count: questionCount,
      });
    }

    try {
      await fetch(`/api/rooms/${roomCode}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed }),
      });
    } catch {}

    startCountdownFlow();
  };

  const startCountdownFlow = () => {
    setLiveCountdown(3);
    const countInt = window.setInterval(() => {
      setLiveCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countInt);
          setLiveCountdown(null);
          startLiveGameRounds();
          return null;
        }
        return prev - 1;
      });
    }, 900);
  };

  const startLiveGameRounds = () => {
    setSubView('live_playing');
    setLiveQIndex(0);
    setLiveMyScore(0);
    setLiveOpponentScore(0);
    setLiveOpponentQIndex(0);
    setLiveSelectedOpt(null);
    setLiveIsAnswered(false);
    startPerQuestionTimer();
  };

  const getTimerSecondsForDifficulty = (diff: DuelDifficulty) => {
    if (diff === 'mutqin') return 16;
    if (diff === 'hafiz') return 20;
    return 25; // talib
  };

  const startPerQuestionTimer = () => {
    if (qTimerRef.current) clearInterval(qTimerRef.current);
    const maxSec = getTimerSecondsForDifficulty(selectedDifficulty);
    setQSecondsLeft(maxSec);

    qTimerRef.current = window.setInterval(() => {
      setQSecondsLeft((prev) => {
        if (prev <= 1) {
          handleLiveTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    if (isBotOpponent) {
      scheduleBotAction();
    }
  };

  const scheduleBotAction = () => {
    if (botTimerRef.current) clearTimeout(botTimerRef.current);
    setBotIsThinking(true);
    // Relaxed, natural human contemplation speed: 7s to 12.5s
    const botDelay = 7000 + Math.random() * 5500;
    botTimerRef.current = window.setTimeout(() => {
      setBotIsThinking(false);
      const isCorrect = Math.random() < (selectedDifficulty === 'mutqin' ? 0.72 : 0.85);
      if (isCorrect) {
        setLiveOpponentScore((s) => s + 1);
      }
      setLiveOpponentQIndex((q) => q + 1);
    }, botDelay);
  };

  const handleLiveTimeExpired = () => {
    if (qTimerRef.current) clearInterval(qTimerRef.current);
    setLiveIsAnswered(true);
    reportLiveAnswerToServer(liveMyScore, liveQIndex + 1);
    setTimeout(() => {
      advanceLiveQuestion();
    }, 1400);
  };

  const handleLiveAnswer = (optIndex: number) => {
    if (liveIsAnswered) return;
    if (qTimerRef.current) clearInterval(qTimerRef.current);

    setLiveSelectedOpt(optIndex);
    setLiveIsAnswered(true);

    const currentQ = liveQuestions[liveQIndex];
    let newScore = liveMyScore;
    if (currentQ && optIndex === currentQ.correctIndex) {
      newScore += 1;
      setLiveMyScore(newScore);
    }

    reportLiveAnswerToServer(newScore, liveQIndex + 1);

    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'OPPONENT_ANSWER',
        score: newScore,
        qIndex: liveQIndex + 1,
      });
    }

    setTimeout(() => {
      advanceLiveQuestion();
    }, 1500);
  };

  const advanceLiveQuestion = () => {
    if (liveQIndex < liveQuestions.length - 1) {
      setLiveQIndex((i) => i + 1);
      setLiveSelectedOpt(null);
      setLiveIsAnswered(false);
      startPerQuestionTimer();
    } else {
      if (qTimerRef.current) clearInterval(qTimerRef.current);
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
      setSubView('live_result');
    }
  };

  // Filter surahs for picker modal
  const filteredSurahs = SURAH_LIST.filter((s) => {
    if (!surahSearchQuery) return true;
    const q = surahSearchQuery.toLowerCase();
    return (
      s.englishName.toLowerCase().includes(q) ||
      s.name.includes(q) ||
      s.number.toString().includes(q)
    );
  });

  // Render question option text clearly separating Arabic and English notes with line breaks
  const renderDuelOptionText = (opt: string) => {
    // Check if option format has parenthetical English clarification, e.g., "وَكُلَا مِنْهَا رَغَدًا (Contains 'رَغَدًا')"
    const match = opt.match(/^([^\(]+)\s*\((.+)\)$/);
    if (match) {
      const arabicPart = match[1].trim();
      const notePart = match[2].trim();
      return (
        <div className="w-full text-left py-0.5 space-y-1">
          <span className="font-quran text-base sm:text-lg block text-right font-medium leading-relaxed text-stone-900 dark:text-stone-100" dir="rtl">
            {arabicPart}
          </span>
          <span className="block text-[11px] text-stone-500 dark:text-stone-400 font-sans font-normal border-t border-stone-200/60 dark:border-stone-700/60 pt-1 tracking-tight" dir="ltr">
            ↳ {notePart}
          </span>
        </div>
      );
    }
    const isArabic = /[\u0600-\u06FF]/.test(opt);
    return (
      <span className={`block w-full ${isArabic ? 'font-quran text-base sm:text-lg text-right font-medium leading-relaxed' : 'text-xs sm:text-sm font-sans font-semibold text-left'}`} dir={isArabic ? 'rtl' : 'ltr'}>
        {opt}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Feedback Toast */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white text-xs py-2 px-4 rounded-full shadow-lg border border-emerald-500/30 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* SUBVIEW 1: ARENA HUB & CHALLENGE CONFIGURATION */}
      {subView === 'hub' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Header Banner */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-900 to-stone-900 text-white p-5 rounded-3xl shadow-md border border-emerald-700/40">
            <div className="relative z-10 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700/60 backdrop-blur-xs text-[11px] font-bold text-emerald-200 border border-emerald-500/30">
                  <Swords className="w-3.5 h-3.5" />
                  <span>Telegram & 1v1 Quran Challenge</span>
                </div>
              </div>

              <h2 className="text-xl md:text-2xl font-black tracking-tight font-serif">
                Quran Study & Challenge Arena
              </h2>
              <p className="text-xs text-emerald-100/90 max-w-lg leading-relaxed">
                «وَفِي ذَٰلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ» • Challenge companions in faith, test Hifz precision across all 114 Surahs, and earn thousands of Hasanat together.
              </p>
            </div>
            {onBackToSolo && (
              <button
                onClick={onBackToSolo}
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-200 hover:text-white underline underline-offset-4"
              >
                <span>Switch to Solo Practice</span>
              </button>
            )}
          </div>

          {/* Configuration Card: Surah & Difficulty Tiers */}
          <div className="bg-[#faf8f5] dark:bg-stone-900 p-4 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-xs space-y-3.5">
            {/* Surah Picker Section */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Selected Surah (1–114)</span>
                </label>
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  {isSurahLoading ? 'Loading verses...' : getActiveSurahTitle()}
                </span>
              </div>

              {/* Quick Filter Pills */}
              <div className="flex flex-wrap gap-1.5 mb-2 text-xs">
                <button
                  onClick={() => setSelectedSurahNum(0)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    selectedSurahNum === 0
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-emerald-600'
                  }`}
                >
                  🌟 All 114 Surahs
                </button>
                <button
                  onClick={() => setSelectedSurahNum(67)}
                  className={`px-2.5 py-1.5 rounded-xl font-bold transition-all ${
                    selectedSurahNum === 67
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-emerald-600'
                  }`}
                >
                  الملك (67)
                </button>
                <button
                  onClick={() => setSelectedSurahNum(18)}
                  className={`px-2.5 py-1.5 rounded-xl font-bold transition-all ${
                    selectedSurahNum === 18
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-emerald-600'
                  }`}
                >
                  الكهف (18)
                </button>
                <button
                  onClick={() => setSelectedSurahNum(36)}
                  className={`px-2.5 py-1.5 rounded-xl font-bold transition-all ${
                    selectedSurahNum === 36
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-emerald-600'
                  }`}
                >
                  يس (36)
                </button>
                <button
                  onClick={() => setSelectedSurahNum(55)}
                  className={`px-2.5 py-1.5 rounded-xl font-bold transition-all ${
                    selectedSurahNum === 55
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-emerald-600'
                  }`}
                >
                  الرحمن (55)
                </button>
                <button
                  onClick={() => setSelectedSurahNum(78)}
                  className={`px-2.5 py-1.5 rounded-xl font-bold transition-all ${
                    selectedSurahNum === 78
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-emerald-600'
                  }`}
                >
                  النبأ (78)
                </button>
                <button
                  onClick={() => setShowSurahPicker(!showSurahPicker)}
                  className="px-2.5 py-1.5 rounded-xl font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1 hover:bg-amber-500/20"
                >
                  <span>114 Surahs Dropdown</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Expandable 114-Surah Search Dropdown */}
              {showSurahPicker && (
                <div className="p-3 bg-white dark:bg-stone-800/90 rounded-2xl border border-stone-300 dark:border-stone-700 space-y-2 animate-in fade-in">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Search any of 114 Surahs (e.g. Baqarah, Mulk, 67)..."
                      value={surahSearchQuery}
                      onChange={(e) => setSurahSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                    <button
                      onClick={() => {
                        setSelectedSurahNum(0);
                        setShowSurahPicker(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold hover:bg-emerald-50 dark:hover:bg-stone-700 flex items-center justify-between text-emerald-700 dark:text-emerald-400"
                    >
                      <span>🌟 All 114 Surahs (Grand Master Mix)</span>
                      <span className="font-quran text-sm">كامل القرآن</span>
                    </button>
                    {filteredSurahs.map((s) => (
                      <button
                        key={s.number}
                        onClick={() => {
                          setSelectedSurahNum(s.number);
                          setShowSurahPicker(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-emerald-50 dark:hover:bg-stone-700 flex items-center justify-between transition-colors ${
                          selectedSurahNum === s.number
                            ? 'bg-emerald-100/70 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 font-bold'
                            : 'text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 text-[10px] font-mono text-stone-400">{s.number}.</span>
                          <span className="font-semibold">{s.englishName}</span>
                          <span className="text-[10px] text-stone-400">({s.numberOfAyahs} ayahs)</span>
                        </div>
                        <span className="font-quran text-sm text-emerald-800 dark:text-emerald-400">{s.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Difficulty & Length Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Difficulty Selection */}
              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1.5">
                  Recall Difficulty
                </label>
                <div className="grid grid-cols-3 gap-1 text-[11px]">
                  <button
                    onClick={() => setSelectedDifficulty('talib')}
                    className={`py-2 px-1 rounded-xl font-bold transition-all text-center ${
                      selectedDifficulty === 'talib'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    🟢 Talib (Learner)
                  </button>
                  <button
                    onClick={() => setSelectedDifficulty('hafiz')}
                    className={`py-2 px-1 rounded-xl font-bold transition-all text-center ${
                      selectedDifficulty === 'hafiz'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    🟡 Hafiz (Intermediate)
                  </button>
                  <button
                    onClick={() => setSelectedDifficulty('mutqin')}
                    className={`py-2 px-1 rounded-xl font-bold transition-all text-center ${
                      selectedDifficulty === 'mutqin'
                        ? 'bg-rose-700 text-white shadow-xs'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    🔴 Mumtaz (Master)
                  </button>
                </div>
                <p className="text-[10px] text-stone-500 mt-1">
                  {selectedDifficulty === 'mutqin' ? 'Mumtaz Master: Tough Mutashabihat twin verses and subtle 1-word differences.' :
                   selectedDifficulty === 'hafiz' ? 'Hafiz: Strict ayah sequences, exact verse endings, 20s pace.' :
                   'Talib: Standard recall for general learners, 25s pace.'}
                </p>
              </div>

              {/* Length Selection */}
              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1.5">
                  Challenge Length
                </label>
                <div className="grid grid-cols-5 gap-1 text-[10px]">
                  <button
                    onClick={() => setQuestionCount(3)}
                    className={`py-2 px-1 rounded-xl font-bold transition-all text-center ${
                      questionCount === 3
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    ⚡ 3 Ayahs
                  </button>
                  <button
                    onClick={() => setQuestionCount(5)}
                    className={`py-2 px-1 rounded-xl font-bold transition-all text-center ${
                      questionCount === 5
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    ⚡ 5 Ayahs
                  </button>
                  <button
                    onClick={() => setQuestionCount(10)}
                    className={`py-2 px-1 rounded-xl font-bold transition-all text-center ${
                      questionCount === 10
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    🛡️ 10 Ayahs
                  </button>
                  <button
                    onClick={() => setQuestionCount(15)}
                    className={`py-2 px-1 rounded-xl font-bold transition-all text-center ${
                      questionCount === 15
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    ⚔️ 15 Ayahs
                  </button>
                  <button
                    onClick={() => setQuestionCount(20)}
                    className={`py-2 px-1 rounded-xl font-bold transition-all text-center ${
                      questionCount === 20
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    👑 20 Ayahs
                  </button>
                </div>
                <p className="text-[10px] text-stone-500 mt-1">
                  ~{questionCount * 45} Quranic letters (~{questionCount * 450} Hasanat).
                </p>
              </div>
            </div>
          </div>

          {/* Mode Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Mode 1: Beat My Score (Ghost Challenge & Telegram Share) */}
            <div className="bg-[#faf8f5] dark:bg-stone-900 p-5 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-lg">
                  🎯
                </div>
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  "Beat My Score" Ghost Challenge
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  Set your high score on {getActiveSurahTitle()}, then generate a rich Telegram invitation card. Friends play the exact same verses to see if they can beat your time!
                </p>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-stone-500 dark:text-stone-400 pt-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Telegram Shareable • Play Anytime</span>
                </div>
              </div>

              <button
                onClick={() => startAsynChallenge()}
                className="w-full py-3 px-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Challenge on {getActiveSurahTitle().split(' ')[0]}</span>
              </button>
            </div>

            {/* Mode 2: Live 1v1 Room Duel */}
            <div className="bg-[#faf8f5] dark:bg-stone-900 p-5 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-11 h-11 rounded-2xl bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
                  ⚡
                </div>
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  Real-time 1v1 Live Room
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  Race live side-by-side. Rapid timers per verse, live opponent progress meters, and real-time victory ceremony!
                </p>
                
                {/* Host vs Join Tab Toggle */}
                <div className="flex bg-stone-200 dark:bg-stone-800 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setLiveTab('host')}
                    className={`flex-1 py-1.5 px-2 rounded-lg transition-all ${
                      liveTab === 'host'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                    }`}
                  >
                    👑 Host New Room
                  </button>
                  <button
                    onClick={() => setLiveTab('join')}
                    className={`flex-1 py-1.5 px-2 rounded-lg transition-all ${
                      liveTab === 'join'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                    }`}
                  >
                    🚪 Join Room by Code
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {liveTab === 'host' ? (
                  <button
                    onClick={initHostRoom}
                    className="w-full py-3 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all"
                  >
                    <Swords className="w-4 h-4" />
                    <span>Create & Host Live Room</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="ENTER ROOM CODE (E.G. HIFZ42)"
                      value={joinCodeInput}
                      onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                      maxLength={8}
                      className="w-full px-3.5 py-2.5 rounded-xl text-center text-sm uppercase font-mono font-bold bg-white dark:bg-stone-800 border-2 border-emerald-600 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none"
                    />
                    <button
                      onClick={() => initJoinRoom(joinCodeInput)}
                      disabled={!joinCodeInput.trim()}
                      className="w-full py-2.5 px-4 rounded-xl bg-stone-900 dark:bg-stone-100 hover:bg-emerald-700 dark:hover:bg-emerald-600 disabled:opacity-50 text-white dark:text-stone-900 dark:hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <ArrowRight className="w-4 h-4" />
                      <span>Enter Live Match as Opponent</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBVIEW 2: INCOMING CHALLENGE PROMPT */}
      {subView === 'incoming_prompt' && challenger && (
        <div className="bg-[#faf8f5] dark:bg-stone-900 p-6 rounded-3xl border border-amber-500/30 shadow-md text-center space-y-5 animate-in fade-in">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/15 text-amber-600 flex items-center justify-center text-3xl">
            ⚔️
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Incoming Telegram Challenge
            </span>
            <h2 className="text-xl font-black text-stone-900 dark:text-stone-100 mt-1">
              {challenger.challengerName} Challenged You!
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
              Can you beat their Quran recall score on {getActiveSurahTitle(challenger.surahNumber || 0)}?
            </p>
          </div>

          {/* Benchmark Target Box */}
          <div className="bg-white dark:bg-stone-800 p-4 rounded-2xl border border-stone-200 dark:border-stone-700 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[10px] text-stone-400 uppercase font-bold">Target Score</p>
              <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
                {challenger.challengerScore}/{challenger.questionCount || 5}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-stone-400 uppercase font-bold">Their Time</p>
              <p className="text-xl font-black text-amber-600 mt-0.5">
                {challenger.challengerTime}s
              </p>
            </div>
            <div>
              <p className="text-[10px] text-stone-400 uppercase font-bold">Difficulty</p>
              <p className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase mt-2">
                {challenger.difficulty || 'Hafiz'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setSubView('hub')}
              className="flex-1 py-3 rounded-2xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs hover:bg-stone-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => startAsynChallenge(challenger.seed)}
              className="flex-2 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Accept Challenge!</span>
            </button>
          </div>
        </div>
      )}

      {/* SUBVIEW 3: ASYNCHRONOUS PLAYING */}
      {subView === 'asyn_playing' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Header & Pace HUD */}
          <div className="bg-[#faf8f5] dark:bg-stone-900 p-4 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                Verse {asynQIndex + 1} of {asynQuestions.length}
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400 font-semibold">
                Score: {asynScore}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {challenger && (
                <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg">
                  Target: {challenger.challengerScore}/{challenger.questionCount || 5} ({challenger.challengerTime}s)
                </span>
              )}
              <div className="flex items-center gap-1 text-xs font-mono font-bold text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 px-2.5 py-1 rounded-xl">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>{asynElapsedSeconds}s</span>
              </div>
            </div>
          </div>

          {/* Question Card */}
          {(() => {
            const q = asynQuestions[asynQIndex] || asynQuestions[0];
            if (!q) return null;

            return (
              <div className="bg-[#faf8f5] dark:bg-stone-900 p-5 sm:p-6 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    {q.category}
                  </span>
                  {q.surahReference && (
                    <span className="text-xs font-bold text-stone-500 dark:text-stone-400">
                      {q.surahReference}
                    </span>
                  )}
                </div>

                {/* English Question Prompt Box */}
                <div className="p-3 bg-stone-100/90 dark:bg-stone-800/70 rounded-2xl border border-stone-200/80 dark:border-stone-700/70 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                    Question Prompt
                  </span>
                  <h3 className="text-sm md:text-base font-bold text-stone-900 dark:text-stone-100 leading-snug">
                    {q.prompt}
                  </h3>
                </div>

                {/* Holy Quranic text snippet (Separated with enter/line break & clear card) */}
                <div className="py-4 px-4 bg-white dark:bg-stone-800 rounded-2xl border border-emerald-900/10 dark:border-emerald-500/20 text-center shadow-xs space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 dark:text-stone-500 block">
                    Ayah Snippet (الآية الكريمة)
                  </span>
                  <p className="font-quran text-xl md:text-2xl text-emerald-950 dark:text-emerald-100 leading-loose py-1" dir="rtl">
                    «{q.arabicSnippet}»
                  </p>
                  {q.translation && (
                    <div className="pt-2 border-t border-stone-100 dark:border-stone-700/60">
                      <p className="text-xs text-stone-500 dark:text-stone-400 italic">
                        "{q.translation}"
                      </p>
                    </div>
                  )}
                </div>

                {/* 4 Multiple Choice Options */}
                <div className="space-y-2 pt-1">
                  {q.options.map((opt, idx) => {
                    const isSelected = asynSelectedOpt === idx;
                    const isCorrect = idx === q.correctIndex;

                    let btnStyle = 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:border-emerald-600';
                    if (asynIsAnswered) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-600 text-white border-emerald-600 shadow-xs';
                      } else if (isSelected) {
                        btnStyle = 'bg-rose-600 text-white border-rose-600';
                      } else {
                        btnStyle = 'bg-white dark:bg-stone-800 text-stone-400 border-stone-200 dark:border-stone-800 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={asynIsAnswered}
                        onClick={() => handleAsynAnswer(idx)}
                        className={`w-full p-3.5 rounded-2xl border font-bold text-xs sm:text-sm text-left flex items-center justify-between transition-all ${btnStyle}`}
                      >
                        <div className="flex-1 pr-2">
                          {renderDuelOptionText(opt)}
                        </div>
                        {asynIsAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-white shrink-0 ml-2" />}
                        {asynIsAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-white shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation & Tadabbur Lesson */}
                {asynIsAnswered && (
                  <div className="pt-3 border-t border-stone-200 dark:border-stone-800 space-y-3">
                    <div className="bg-emerald-500/10 p-3 rounded-xl text-xs space-y-1">
                      <p className="font-bold text-emerald-800 dark:text-emerald-300">
                        💡 {q.explanation}
                      </p>
                      {q.tadabburPearl && (
                        <p className="text-stone-600 dark:text-stone-300 italic pt-1 border-t border-emerald-500/20">
                          🌱 <span className="font-semibold">لفتة تدبرية:</span> {q.tadabburPearl}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleAsynNext}
                        className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs active:scale-95"
                      >
                        <span>{asynQIndex < asynQuestions.length - 1 ? 'Next Verse' : 'See Challenge Results'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* SUBVIEW 4: ASYNCHRONOUS RESULT & SHARING */}
      {subView === 'asyn_result' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-[#faf8f5] dark:bg-stone-900 p-6 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-600/15 text-emerald-600 flex items-center justify-center text-3xl">
              {asynScore >= asynQuestions.length * 0.8 ? '👑' : '🎯'}
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                {challenger ? 'Head-to-Head Result' : 'Challenge Sprint Completed'}
              </span>
              <h2 className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-1">
                {asynScore === asynQuestions.length
                  ? 'ما شاء الله! Perfect Score!'
                  : asynScore >= asynQuestions.length * 0.6
                  ? 'جزاك الله خيراً! Great Recall!'
                  : 'Keep Practicing & Revising!'}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Surah: {getActiveSurahTitle(selectedSurahNum)}
              </p>
            </div>

            {/* Score Stats Grid */}
            <div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
              <div>
                <p className="text-[10px] text-stone-400 uppercase font-bold">Your Score</p>
                <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
                  {asynScore}/{asynQuestions.length}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-stone-400 uppercase font-bold">Elapsed Time</p>
                <p className="text-2xl font-black text-amber-600 mt-0.5">
                  {asynElapsedSeconds}s
                </p>
              </div>
              <div>
                <p className="text-[10px] text-stone-400 uppercase font-bold">Hasanat Earned</p>
                <p className="text-xl font-black text-emerald-600 mt-0.5">
                  ~{totalHasanatEstimate}
                </p>
              </div>
            </div>

            {/* Ghost Challenger Benchmark Evaluation */}
            {challenger && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-stone-800 border border-amber-500/30 text-xs text-stone-700 dark:text-stone-300">
                {asynScore > challenger.challengerScore || 
                 (asynScore === challenger.challengerScore && asynElapsedSeconds < challenger.challengerTime) ? (
                  <p className="font-bold text-emerald-700 dark:text-emerald-400">
                    🎉 You beat {challenger.challengerName}'s record! ({asynScore} vs {challenger.challengerScore})
                  </p>
                ) : asynScore === challenger.challengerScore ? (
                  <p className="font-bold text-amber-700 dark:text-amber-400">
                    🤝 Tie match with {challenger.challengerName}!
                  </p>
                ) : (
                  <p className="text-stone-600 dark:text-stone-400">
                    {challenger.challengerName} still holds the lead ({challenger.challengerScore}/{challenger.questionCount || 5} in {challenger.challengerTime}s). Try again!
                  </p>
                )}
              </div>
            )}

            {/* Telegram 1-Tap Share Button & Copy Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleShareTelegram}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#229ED9] hover:bg-[#1E88E5] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Share Challenge with Friends on Telegram</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={handleCopyTelegramMessage}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-stone-200 dark:border-stone-700"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Telegram Invite</span>
                </button>
                <button
                  onClick={handleCopyChallengeLink}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-stone-200 dark:border-stone-700"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Copy Web Link</span>
                </button>
              </div>

              {/* Telegram Invite Preview Card */}
              <div className="p-3 rounded-2xl bg-stone-100/90 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-left space-y-1.5 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    Invite Message Preview
                  </span>
                  <span className="text-[9px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    English with Quran Verse
                  </span>
                </div>
                <div className="text-[11px] text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 whitespace-pre-line leading-relaxed">
                  <p className="font-bold text-emerald-700 dark:text-emerald-400">✨ QURAN CHALLENGE — BEAT MY SCORE ✨</p>
                  <p className="text-stone-500 text-[10px]">Peace be upon you! I challenge you to a friendly competition in the Book of Allah 📖</p>
                  <p className="mt-1">🎯 <strong>Surah:</strong> {getActiveSurahTitle(selectedSurahNum)}</p>
                  <p>⚡ <strong>Score to Beat:</strong> {asynScore}/{asynQuestions.length} in {asynElapsedSeconds}s!</p>
                  <p>🏆 <strong>Level:</strong> {selectedDifficulty === 'mutqin' ? '🔴 Mumtaz (Master)' : selectedDifficulty === 'hafiz' ? '🟡 Hafiz (Intermediate)' : '🟢 Talib (Student)'}</p>
                  <p className="font-quran text-sm text-emerald-800 dark:text-emerald-200 my-1 text-center" dir="rtl">«وَفِي ذَٰلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ»</p>
                  <p className="text-[10px] italic text-stone-500 text-center">"And for this let the competitors compete." (Surah Al-Mutaffifin: 26)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sincere Dua Gift for Companion in Faith */}
          <div className="bg-[#faf8f5] dark:bg-stone-900 p-5 rounded-3xl border border-emerald-500/20 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-emerald-600 fill-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                Send a Sincere Quranic Dua to Your Companion (Dua in Absentia)
              </h3>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              «The supplication of a Muslim for his brother in his absence is answered. At his head is an appointed angel; whenever he supplicates good for his brother, the angel says: Amen, and to you the same.» — <span className="font-semibold text-emerald-700 dark:text-emerald-400">Prophet Muhammad ﷺ (Sahih Muslim)</span>
            </p>

            {/* Dua Selector Chips */}
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {SINCERE_DUAS_FOR_FRIENDS.map((dua) => (
                <button
                  key={dua.id}
                  onClick={() => setSelectedDua(dua)}
                  className={`p-2 rounded-xl text-left font-bold transition-all ${
                    selectedDua.id === dua.id
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                  }`}
                >
                  <span className="truncate block">{dua.title}</span>
                </button>
              ))}
            </div>

            {/* Selected Dua Arabic Display */}
            <div className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-center space-y-2">
              <p className="font-quran text-lg sm:text-xl text-emerald-950 dark:text-emerald-200 leading-relaxed" dir="rtl">
                «{selectedDua.arabic}»
              </p>
              <p className="text-xs text-stone-600 dark:text-stone-400 italic">
                "{selectedDua.translation}"
              </p>
              {selectedDua.source && (
                <div className="pt-2 border-t border-stone-100 dark:border-stone-700/60">
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    📜 Reference: {selectedDua.source}
                  </span>
                </div>
              )}
            </div>

            {/* Send & Copy Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => handleShareDuaTelegram(selectedDua)}
                className="py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send via Telegram</span>
              </button>
              <button
                onClick={() => handleCopyDua(selectedDua)}
                className="py-2.5 px-4 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center justify-center gap-2 border border-stone-300 dark:border-stone-700 transition-colors"
              >
                {isDuaCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isDuaCopied ? '✓ Dua Copied to Clipboard!' : 'Copy Dua Text'}</span>
              </button>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex gap-2">
            <button
              onClick={() => setSubView('hub')}
              className="flex-1 py-3 rounded-2xl bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold text-xs hover:bg-stone-300 transition-colors"
            >
              Back to Arena Hub
            </button>
            <button
              onClick={() => startAsynChallenge()}
              className="flex-1 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Another Round</span>
            </button>
          </div>
        </div>
      )}

      {/* SUBVIEW 5: LIVE LOBBY */}
      {subView === 'live_lobby' && (
        <div className="bg-[#faf8f5] dark:bg-stone-900 p-6 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-5 animate-in fade-in">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
              {isHost ? '👑 You are the Room Host' : '⚔️ You are the Opponent'}
            </div>
            <h2 className="text-xl font-black text-stone-900 dark:text-stone-100">
              Room Code: <span className="font-mono text-emerald-600 font-bold text-2xl tracking-widest">{roomCode}</span>
            </h2>
            <p className="text-xs text-stone-500">
              Surah: {getActiveSurahTitle()} • Difficulty: {selectedDifficulty.toUpperCase()} • {questionCount} Verses
            </p>
          </div>

          {/* Connected Players Status */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
            {/* Player 1 (You) */}
            <div className="text-center space-y-1">
              <div className="w-10 h-10 mx-auto rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
                {user.first_name ? user.first_name[0] : 'U'}
              </div>
              <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
                {user.first_name || 'You'} ({isHost ? 'Host 👑' : 'Opponent ⚔️'})
              </p>
              <span className="text-[10px] text-emerald-600 font-semibold">Ready in Lobby</span>
            </div>

            {/* Player 2 (Opponent / Host) */}
            <div className="text-center space-y-1">
              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center font-bold text-sm ${
                isOpponentConnected ? 'bg-amber-600 text-white' : 'bg-stone-200 dark:bg-stone-700 text-stone-400'
              }`}>
                {isOpponentConnected ? (opponentName ? opponentName[0] : 'O') : '?'}
              </div>
              <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
                {isOpponentConnected
                  ? `${opponentName || (isHost ? 'Opponent' : 'Host')} (${isHost ? 'Opponent ⚔️' : 'Host 👑'})`
                  : isHost
                  ? 'Waiting for Friend...'
                  : 'Connecting to Host...'}
              </p>
              <span className={`text-[10px] font-semibold ${isOpponentConnected ? 'text-emerald-600' : 'text-stone-400 animate-pulse'}`}>
                {isOpponentConnected ? 'Connected & Ready' : isHost ? 'Share code below' : 'Awaiting host link'}
              </span>
            </div>
          </div>

          {/* HOST ONLY: Share room code and Telegram invite */}
          {isHost ? (
            <div className="space-y-2">
              <p className="text-xs text-center text-stone-500 font-medium">
                Send this code or invite link to your friend on Telegram to compete!
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const url = `${window.location.origin}${window.location.pathname}?room=${roomCode}&role=guest`;
                    navigator.clipboard.writeText(`⚡ Join my Live Quran Duel Room!\nRoom Code: ${roomCode}\nSurah: ${getActiveSurahTitle()}\nJoin as my opponent: ${url}`);
                    showToast('Room code & link copied to clipboard!');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-stone-300 dark:border-stone-700 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code & Link</span>
                </button>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}${window.location.pathname}?room=${roomCode}&role=guest`;
                    const text = `⚡ Join my Live Quran Duel Room!\nRoom Code: ${roomCode}\nSurah: ${getActiveSurahTitle()}\nTap this link to enter as my opponent: ${url}`;
                    shareToTelegram(url, text);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#229ED9] hover:bg-[#1E88E5] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Invite on Telegram</span>
                </button>
              </div>
            </div>
          ) : (
            /* GUEST ONLY: Friendly confirmation of their opponent role */
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <Swords className="w-4 h-4 text-emerald-600" />
                <span>You joined Room {roomCode} as Opponent</span>
              </div>
              <p className="text-[11px] text-stone-600 dark:text-stone-400">
                Host: <strong className="text-stone-900 dark:text-stone-100">{opponentName || 'Companion'}</strong> • Surah: {getActiveSurahTitle()} ({selectedDifficulty.toUpperCase()})
              </p>
            </div>
          )}

          {/* Solo AI Bot option if waiting */}
          {!isOpponentConnected && isHost && (
            <div className="pt-1 text-center">
              <button
                onClick={handleStartWithBot}
                className="text-xs text-stone-500 hover:text-emerald-700 dark:hover:text-emerald-400 underline underline-offset-2"
              >
                No friend available right now? Play vs Hafiz AI Companion
              </button>
            </div>
          )}

          {/* Start Duel button / Waiting status */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                setSubView('hub');
                setIsOpponentConnected(false);
                setOpponentName('');
              }}
              className="py-3 px-4 rounded-2xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs transition-colors"
            >
              Leave Room
            </button>
            {isHost ? (
              <button
                disabled={!isOpponentConnected}
                onClick={handleTriggerStartDuel}
                className="flex-1 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <Swords className="w-4 h-4" />
                <span>{isOpponentConnected ? 'Start Live Duel!' : 'Waiting for Opponent to Join...'}</span>
              </button>
            ) : (
              <div className="flex-1 py-3 px-4 rounded-2xl bg-emerald-900/10 dark:bg-emerald-950/40 border border-emerald-600/30 text-emerald-800 dark:text-emerald-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 text-center">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span>{isOpponentConnected ? `Waiting for Host (${opponentName || 'Host'}) to Start...` : 'Connecting to Host...'}</span>
              </div>
            )}
          </div>

          {/* Countdown Overlay */}
          {liveCountdown !== null && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-4">
              <p className="text-xs uppercase tracking-widest font-bold text-emerald-400">
                Match starting in...
              </p>
              <div className="text-7xl font-black text-white font-mono animate-ping">
                {liveCountdown}
              </div>
              <p className="text-sm font-arabic text-stone-300">
                «بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ»
              </p>
            </div>
          )}
        </div>
      )}

      {/* SUBVIEW 6: LIVE PLAYING */}
      {subView === 'live_playing' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Real-time Match HUD */}
          <div className="bg-[#faf8f5] dark:bg-stone-900 p-4 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  Round {liveQIndex + 1} of {liveQuestions.length}
                </span>
              </div>

              {/* 10s Timer */}
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full font-mono text-xs font-bold ${
                qSecondsLeft <= 3
                  ? 'bg-rose-500/20 text-rose-600 animate-bounce'
                  : 'bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                <span>{qSecondsLeft}s</span>
              </div>
            </div>

            {/* Score Comparison Bars */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-white dark:bg-stone-800 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-emerald-700 dark:text-emerald-400">{user.first_name || 'You'}</span>
                  <span className="text-emerald-700 dark:text-emerald-400">{liveMyScore} pts</span>
                </div>
                <div className="w-full bg-stone-200 dark:bg-stone-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div 
                    className="bg-emerald-600 h-full transition-all duration-300"
                    style={{ width: `${(liveMyScore / liveQuestions.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-stone-800 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-stone-600 dark:text-stone-300">{opponentName || 'Opponent'}</span>
                  <span className="text-stone-600 dark:text-stone-300">{liveOpponentScore} pts</span>
                </div>
                <div className="w-full bg-stone-200 dark:bg-stone-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full transition-all duration-300"
                    style={{ width: `${(liveOpponentScore / liveQuestions.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Live Question Card */}
          {(() => {
            const q = liveQuestions[liveQIndex] || liveQuestions[0];
            if (!q) return null;

            return (
              <div className="bg-[#faf8f5] dark:bg-stone-900 p-5 sm:p-6 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    {q.category}
                  </span>
                  {q.surahReference && (
                    <span className="text-xs font-bold text-stone-500 dark:text-stone-400">
                      {q.surahReference}
                    </span>
                  )}
                </div>

                {/* Opponent Thinking / Status Indicator */}
                {isBotOpponent && botIsThinking && (
                  <div className="flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl animate-pulse">
                    <Bot className="w-4 h-4 shrink-0" />
                    <span>Hafiz AI is reciting & contemplating the verse...</span>
                  </div>
                )}

                {/* English Question Prompt Box */}
                <div className="p-3 bg-stone-100/90 dark:bg-stone-800/70 rounded-2xl border border-stone-200/80 dark:border-stone-700/70 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                    Question Prompt
                  </span>
                  <h3 className="text-sm md:text-base font-bold text-stone-900 dark:text-stone-100 leading-snug">
                    {q.prompt}
                  </h3>
                </div>

                {/* Holy Quranic Ayah snippet (Separated with enter/line break & clear card) */}
                <div className="py-4 px-4 bg-white dark:bg-stone-800 rounded-2xl border border-emerald-900/10 dark:border-emerald-500/20 text-center shadow-xs space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 dark:text-stone-500 block">
                    Ayah Snippet (الآية الكريمة)
                  </span>
                  <p className="font-quran text-xl md:text-2xl text-emerald-950 dark:text-emerald-100 leading-loose py-1" dir="rtl">
                    «{q.arabicSnippet}»
                  </p>
                  {q.translation && (
                    <div className="pt-2 border-t border-stone-100 dark:border-stone-700/60">
                      <p className="text-xs text-stone-500 dark:text-stone-400 italic">
                        "{q.translation}"
                      </p>
                    </div>
                  )}
                </div>

                {/* 4 Choices */}
                <div className="space-y-2 pt-1">
                  {q.options.map((opt, idx) => {
                    const isSelected = liveSelectedOpt === idx;
                    const isCorrect = idx === q.correctIndex;

                    let btnStyle = 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:border-emerald-600';
                    if (liveIsAnswered) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-600 text-white border-emerald-600 shadow-xs';
                      } else if (isSelected) {
                        btnStyle = 'bg-rose-600 text-white border-rose-600';
                      } else {
                        btnStyle = 'bg-white dark:bg-stone-800 text-stone-400 border-stone-200 dark:border-stone-800 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={liveIsAnswered}
                        onClick={() => handleLiveAnswer(idx)}
                        className={`w-full p-3.5 rounded-2xl border font-bold text-xs sm:text-sm text-left flex items-center justify-between transition-all ${btnStyle}`}
                      >
                        <div className="flex-1 pr-2">
                          {renderDuelOptionText(opt)}
                        </div>
                        {liveIsAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-white shrink-0 ml-2" />}
                        {liveIsAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-white shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* SUBVIEW 7: LIVE RESULT */}
      {subView === 'live_result' && (
        <div className="bg-[#faf8f5] dark:bg-stone-900 p-6 rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-sm text-center space-y-5 animate-in fade-in">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-600/15 text-emerald-600 flex items-center justify-center text-3xl">
            {liveMyScore >= liveOpponentScore ? '👑' : '⚔️'}
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Live Duel Finished
            </span>
            <h2 className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-1">
              {liveMyScore > liveOpponentScore
                ? '🏆 You Won the Duel!'
                : liveMyScore === liveOpponentScore
                ? '🤝 An Incredible Tie!'
                : `${opponentName || 'Opponent'} Won the Match!`}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              «وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ» • A blessed competition in the words of Allah.
            </p>
          </div>

          {/* Final Score comparison */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
            <div className="border-r border-stone-200 dark:border-stone-700 pr-2">
              <p className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">
                You ({user.first_name || 'You'})
              </p>
              <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                {liveMyScore}
              </p>
              <p className="text-xs text-stone-400">Points</p>
            </div>

            <div className="pl-2">
              <p className="text-[10px] uppercase font-bold text-stone-500">
                {opponentName || 'Opponent'}
              </p>
              <p className="text-3xl font-black text-stone-700 dark:text-stone-300 mt-1">
                {liveOpponentScore}
              </p>
              <p className="text-xs text-stone-400">Points</p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setSubView('hub')}
              className="flex-1 py-3 rounded-2xl bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold text-xs hover:bg-stone-300 transition-colors"
            >
              Exit to Hub
            </button>
            <button
              onClick={handleTriggerStartDuel}
              className="flex-1 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Rematch!</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
