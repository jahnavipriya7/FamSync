🏡 FamSync v2 — Live greener. Play together. Grow wiser.
Screen time without the fights. Bridging intergenerational knowledge, fostering low-tech family bonding, and balancing household teamwork for modern Indian families.

Built by: Team J&Anni (Visakhapatnam, Andhra Pradesh, India)

Target Audience: Middle-class urban families (income ₹3–12 lakh/year) navigating dual-income careers, rigorous tuition pressures (SSC/CBSE/Inter), and screen-time fatigue.

Core Philosophy: Moving away from invasive digital spyware toward an honest family agreement anchored in mutual trust, green habits, intergenerational wisdom, and anti-climactic offline analog hours.

🎯 The Single Problem FamSync Solves
Middle-class parents in Visakhapatnam struggle to control children’s screen-time and digital burnout without daily screaming matches, while kids lack fair, transparent ways to earn media privileges. At the same time, valuable practical life skills remain trapped with older generations, and households suffer from high electricity consumption and mounting invisible domestic labor.

📱 The 5 Core Screens & Modules
1. Home (The Landing & Agreement Hub)
Headline: “Screen time without the fights.”

Problem Statement: Urban Indian parents and children trapped in the daily cycle of digital exhaustion and study-time friction.

Primary Actions:

Big CTA Button: “Set up my family” (opens Parent Dashboard).

Language Toggle: Instant English / తెలుగు switch.

Transparent Pricing Note: "First month free. Then ₹999/year per household (about ₹83/month). Free plan includes 1 child."

The Honest Family Agreement Card: Explicitly states that FamSync relies on mutual trust and honest child-logging rather than invasive spyware, pairing digital boundaries with real-world contributions.

2. Parent Dashboard (The Command Center)
Trial & Subscription Banner: "Free trial: 28 days left" with a “Subscribe ₹999/year” demo button.

Live Child Status Cards: Real-time metrics showing daily minutes used, time remaining, and category split (Study / Games / Videos / Social).

Schedule Locks & Limits per Child:

Daily limit configuration (default 90 min).

Automated school hours lock (8:30 AM – 3:30 PM).

Tuition/homework hours lock (5:00 PM – 7:00 PM: entertainment locked, study allowed).

Bedtime lock (9:30 PM – 6:30 AM).

Exam Mode Toggle: 1-click drop to 30 min/day of entertainment for 2 weeks with an active exam countdown banner.

Approval Inbox: Review incoming requests ("Chinni read for 10 min, approve +10 min?" / "Leo completed Eco-Errand, approve +15 min?") with Approve and Decline.

Grandparent Persona Support: Nani and Tata can review and approve earn requests, but cannot alter schedule limits or locks.

Add Child Modal: Quick registration form for custom names, ages (8–17), and individual limits.

3. Child View (The Interactive Growth Portal)
Large Progress Ring: Prominent visual timer showing time remaining today.

Category Picker & Live Timer: Select Study, Games, Videos, or Social, and start/stop timer tracking.

Gentle Warnings & Locks: Yellow alert banner at 
≤5 minutes remaining; automatic screen blackout during tuition, school, or bedtime locks.

“Earn More Time” Cards (Daily bonus cap: 30 min):

📖 Read for 10 min 
→ +10 min (with interactive 10-minute countdown reading timer).

👵 Learn a skill from an elder 
→ +15 min (with a 1-line voice-note or text summary of what was learned).

🧹 Help with a household task 
→ +10 min (folding uniforms, setting the dining table).

🌿 "Zero-Watt Hour" Eco-Earn Cards (Green Bonus):

🌿 Terrace Plant Watering 
→ +15 min (using recycled kitchen wastewater).

🚶 Eco-Errand Walking Trip 
→ +15 min (walking down to the local Rythu Bazaar or grocery store instead of ordering via instant-delivery apps).

🎲 Daily Family Game Challenge & Dice Roller:

AI-generated daily family games (Ludo, Chess, Snakes & Ladders, Ashta Chamma, Carrom) featuring custom household twists and age-safe loser chores.

Built-in interactive digital 6-sided SVG dice roller for offline play without physical dice.

4. Weekly Report & Analytics (The Family Karma Hub)
7-Day Usage Analytics: Screen-time vs. limit charts, study-to-entertainment ratios, minutes earned, streak days, and chores completed.

Family Karma Radar: An interactive spider chart mapping 4 household pillars: Helpfulness, Learning, Digital Discipline, and Eco-Stewardship.

WhatsApp Share Button: Instantly copies a clean, formatted summary text to share in the family WhatsApp group.

AI Parent Insight Card: “Get my family insight” button calling the Gemini Coach backend for calm, non-judgmental parenting advice tailored to middle-class Vizag routines.

5. About & Impact (Team J&Anni)
Context & Research: Highlights our roots in Visakhapatnam, Andhra Pradesh, and references real data like the MoSPI 2024 Time Use Survey (urban women spending 289 minutes daily on unpaid domestic work vs. 88 minutes for men).

Green & Social Mission: Details how FamSync combats electricity grid strain during peak evening hours, promotes water conservation, and preserves intergenerational heritage.

🌟 Innovative & Award-Winning Features Added
Grandma’s Cipher (AI Oral History Vault): Grandparents record 60-second voice notes in Telugu or English telling childhood stories or traditional recipes; AI transcribes, translates, and stores them as digital family trading cards.

The Analog Sunset: At 8:30 PM, the app triggers a warm amber ambient mode, locking entertainment and encouraging families to turn off room lights, light a traditional lamp, and enjoy device-free evening conversations.

AI Sibling Mediator ("Peace Court"): When siblings argue over chores or screen time, both input their grievances; the AI acts as a neutral elder mediator and generates a fair compromise quest.

Monsoon & Power-Cut Emergency Protocol: Automatically detects local grid outages or weather alerts, pausing time limits and converting the app into a low-light emergency playbook with safety torches, water pump guides, and candle-lit card games.

The Apology & Gratitude Ledger: A friction-free micro-appreciation button ("Thanks Amma for the ginger chai ☕") that balances the household ledger with emotional gratitude rather than just chores.

🛠️ Technical Architecture & Run Guide
Local Development
Navigate to your project directory:

Bash
cd c:\Users\jahnavipriyaP\OneDrive\Desktop\FamSync
Install dependencies:

Bash
npm install
Start the development server (includes built-in /api/insight and /api/game middleware):

Bash
npm run dev
Open in your browser: [http://127.0.0.1:5173](http://127.0.0.1:5173)(Optional: Set GEMINI_API_KEY=your_key in a .env file for live Google Gemini calls; if omitted, FamSync seamlessly invokes its high-fidelity local fallback coach engine).

Production Build & Deployment
Bash
npm run build
npm start
Cloud Ready: Deployable on Render, Railway, Docker, or Vercel (mounting server/geminiInsight.js as an API route).

