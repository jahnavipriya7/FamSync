import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { callGeminiInsight } from './geminiInsight.js';
import { callGeminiGame } from './geminiGame.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/status', (req, res) => {
  const envKey = process.env.GEMINI_API_KEY;
  res.json({
    status: 'ok',
    hasKey: Boolean(envKey && envKey.length > 5),
    service: envKey ? 'Google Gemini 2.5 Flash' : 'FamSync Coach Local Engine',
    city: 'Visakhapatnam, Andhra Pradesh'
  });
});

app.post('/api/game', async (req, res) => {
  const { childName } = req.body || {};
  const apiKey = req.headers['x-gemini-api-key'] || process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const liveGame = await callGeminiGame({ childName: childName || 'Chinni' }, apiKey);
      return res.json(liveGame);
    } catch (err) {
      console.warn('Gemini game server error, falling back:', err.message);
    }
  }

  const pool = [
    {
      id: 'game-ludo',
      gameType: 'Ludo',
      title: 'Ludo Royal Sprint',
      icon: '🎲',
      suggestedPlayers: 'All 4: Amma, Nanna, Chinni, Anna',
      durationMin: 20,
      quickRules: [
        'Fast 2-token per player rule.',
        'Roll a 6 to bring your token out onto the board.',
        'First to bring both tokens home wins!'
      ],
      funTwist: 'Every time you roll a 6, tell 1 good thing that happened at school or work this week!',
      loserChore: 'Shoe Rack Air-Traffic Controller (align all family footwear neatly)',
      dayLabel: "Today's Challenge"
    },
    {
      id: 'game-snakes',
      gameType: 'Snakes & Ladders',
      title: 'Snakes & Ladders: The Virtue Climb',
      icon: '🪜',
      suggestedPlayers: 'Chinni (10) + Nani (Grandmother) + Anna',
      durationMin: 15,
      quickRules: [
        'Take turns rolling the dice.',
        'Ladders lift you forward; snake heads slide you back down.',
        'First to square 100 wins!'
      ],
      funTwist: 'If you land on a ladder, answer 1 fast math or trivia question to climb!',
      loserChore: 'Sock Detective (match and roll all stray clean socks in the basket)',
      dayLabel: "Today's Challenge"
    },
    {
      id: 'game-chess',
      gameType: 'Chess',
      title: 'Speed Chess Clash',
      icon: '♟️',
      suggestedPlayers: 'Anna (16) vs Nanna (Father)',
      durationMin: 15,
      quickRules: [
        'Speed chess: each player has 7 minutes total thinking time.',
        'Standard rules: checkmate wins, stalemate draws.',
        'Focus on center board control and king safety.'
      ],
      funTwist: 'Explain your best tactical trap out loud to Chinni so she learns the strategy!',
      loserChore: 'Dining Table Sweeper (clear chargers, papers, and wipe table clean)',
      dayLabel: "Today's Challenge"
    },
    {
      id: 'game-carrom',
      gameType: 'Carrom',
      title: 'Carrom Striker Blitz',
      icon: '🎯',
      suggestedPlayers: 'Chinni + Anna + Nanna',
      durationMin: 15,
      quickRules: [
        'Pocket white coins (+10 pts) and black coins (+5 pts).',
        'Red Queen (+25 pts) must be covered with another coin.',
        'First to reach 30 points wins.'
      ],
      funTwist: 'Strike with your non-dominant hand for 1 shot for bonus style points!',
      loserChore: 'Balcony Botanical Caretaker (water all potted plants with a mug)',
      dayLabel: "Today's Challenge"
    }
  ];

  const picked = pool[Math.floor(Math.random() * pool.length)];
  return res.json(picked);
});

app.post('/api/insight', async (req, res) => {
  const { children } = req.body;
  const apiKey = req.headers['x-gemini-api-key'] || process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const liveResult = await callGeminiInsight({ children }, apiKey);
      return res.json(liveResult);
    } catch (err) {
      console.warn('Gemini insight server error, falling back:', err.message);
    }
  }

  const fallback = {
    summary: 'Your Vizag household maintained healthy boundaries this week. Tuition hours (5-7 PM) were protected, and children earned extra minutes peacefully.',
    concerns: [
      'Late evening smartphone use near the bedtime lock.',
      'Gaming requests right before 5 PM tuition starts.'
    ],
    suggested_limit_min: 75,
    earn_tasks: [
      {
        title: 'Balcony Flower Watering with Nani',
        bonus_min: 10,
        why: 'Relieves eye strain after tuition.'
      },
      {
        title: 'Read 2 Chapters of an English or Telugu Storybook',
        bonus_min: 10,
        why: 'Builds reading habits without arguments.'
      }
    ],
    conversation_starter: 'At dinner, ask Anna how his cycle puncture trick worked, instead of asking about his phone time.',
    weekend_chore: {
      title: 'Shoe Rack Air-Traffic Controller',
      duration_min: 15,
      safety_note: 'Wash hands thoroughly with soap after organizing footwear.'
    },
    generatedAt: new Date().toISOString(),
    source: 'local-engine'
  };

  return res.json(fallback);
});

// Serve frontend in production
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`FamSync Server running on http://localhost:${PORT}`);
});
