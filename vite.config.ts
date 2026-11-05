import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import { callGeminiInsight } from './server/geminiInsight.js';
import { callGeminiGame } from './server/geminiGame.js';

dotenv.config();

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'famsync-api-middleware',
      configureServer(server) {
        // Status check
        server.middlewares.use('/api/status', (req, res) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            status: 'ok',
            hasKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5),
            service: process.env.GEMINI_API_KEY ? 'Google Gemini 2.5 Flash' : 'FamSync Coach Local Engine',
            city: 'Visakhapatnam, Andhra Pradesh'
          }));
        });

        // Daily / Random Family Game Endpoint
        server.middlewares.use('/api/game', async (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
          }

          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const parsed = JSON.parse(body || '{}');
              const apiKey = req.headers['x-gemini-api-key'] || process.env.GEMINI_API_KEY;

              if (apiKey) {
                try {
                  const liveGame = await callGeminiGame(parsed, apiKey);
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(liveGame));
                  return;
                } catch (e) {
                  console.warn('Gemini game call error, using local fallback:', e.message);
                }
              }

              // Local fallback for games
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
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(picked));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        });

        // Parent insight endpoint
        server.middlewares.use('/api/insight', async (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
          }

          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const parsed = JSON.parse(body || '{}');
              const { children } = parsed;

              const apiKey = req.headers['x-gemini-api-key'] || process.env.GEMINI_API_KEY;

              if (apiKey) {
                try {
                  const liveResult = await callGeminiInsight({ children }, apiKey);
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(liveResult));
                  return;
                } catch (geminiErr) {
                  console.warn('Gemini insight API error, falling back:', geminiErr.message);
                }
              }

              // Fallback response
              const fallback = {
                summary: 'Your Vizag household balanced school, tuition, and family life well this week. Tuition hours (5:00 PM - 7:00 PM) were protected, and children earned extra minutes through reading and elder skill sharing.',
                concerns: [
                  'Gaming requests close to the 5:00 PM tuition block.',
                  'Late evening video sessions before the 9:30 PM bedtime lock.'
                ],
                suggested_limit_min: 75,
                earn_tasks: [
                  {
                    title: 'Balcony Flower Watering with Nani',
                    bonus_min: 10,
                    why: 'Rests tired eyes after 2 hours of tuition.'
                  },
                  {
                    title: 'Read 2 Chapters of an English or Telugu Storybook',
                    bonus_min: 10,
                    why: 'Calm reading habit without phone addiction.'
                  }
                ],
                conversation_starter: 'Ask Anna at dinner how his cycle puncture trick worked, instead of asking about his phone time.',
                weekend_chore: {
                  title: 'Shoe Rack Air-Traffic Controller',
                  duration_min: 15,
                  safety_note: 'Wash hands with soap after organizing family footwear.'
                },
                generatedAt: new Date().toISOString(),
                source: 'local-engine'
              };

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(fallback));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        });
      }
    }
  ],
  server: {
    port: 5173,
    host: true
  }
});
