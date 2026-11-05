# FamSync — Screen Time Without the Fights

> **Headline Promise:** *Screen time without the fights.*

A simple, mobile-first web app built for middle-class urban families (income ₹3–12 lakh/year) in **Visakhapatnam, Andhra Pradesh**. Built by **Team J&Anni**.

---

## 🎯 The Single Problem FamSync Solves
Middle class parents in Visakhapatnam struggle to control children’s screen time without daily fights, and kids have no fair way to earn more time.
- **Both parents working**: Evenings are exhausted and rushed.
- **Heavy tuition pressure (5:00 PM – 7:00 PM)**: Academic demands (SSC/CBSE/Inter) clash with mobile gaming and YouTube reels.
- **The Honest Limit**: A website cannot spy on or block other native apps. FamSync operates as an honest **family screen-time agreement**: the child starts and stops their timer, schedule locks (school, tuition, bedtime) are respected, and kids earn extra time through positive habits (reading, elder skills, chores) with parent/grandparent approval.

---

## 📱 The 5 Core Screens

1. **Home**:
   - Headline: *“Screen time without the fights.”*
   - One-line problem statement.
   - One big button: **“Set up my family”** (opens Parent Dashboard).
   - Pricing Note: *“First month free. Then ₹999/year per household (about ₹83/month). Free plan: 1 child.”*
   - Honest family agreement card explaining mutual trust over spyware.
2. **Parent Dashboard**:
   - **Trial Banner**: *“Free trial: 28 days left”* with *“Subscribe ₹999/year”* demo button.
   - **Live Child Status**: Daily minutes used, time left, and category split (**Study / Games / Videos / Social**).
   - **Schedule Locks per Child**: Daily limit (default 90m), school hours (8:30 AM–3:30 PM), tuition/homework hours (5:00 PM–7:00 PM: entertainment locked, study allowed), and bedtime lock (9:30 PM–6:30 AM).
   - **Exam Mode Toggle**: Drops entertainment to 30 min/day for 2 weeks with a countdown banner.
   - **Approval Inbox**: Review incoming requests (*“Chinni read for 10 min, approve +10 min?”*) with **Approve** and **Decline**.
   - **Grandparent Persona Support**: Nani can approve requests, but cannot change limits or locks.
   - **Add Child Modal**: Add any child with custom name, age (8–17), and limit.
3. **Child View**:
   - Large prominent **Progress Ring** showing time remaining today.
   - **Category Picker & Timer**: Select Study, Games, Videos, or Social, and start/stop the timer.
   - **Gentle Warnings & Locks**: Yellow banner at $\le 5$ min left; locks entertainment during tuition (5–7 PM), school, or bedtime.
   - **“Earn More Time” Cards** (Daily bonus cap: 30 min, requires approval):
     - 📖 **Read for 10 min** $\rightarrow$ +10 min (with interactive 10-minute countdown reading timer).
     - 👵 **Learn a skill from an elder** $\rightarrow$ +15 min (with 1-line note of what was learned).
     - 🧹 **Help with a household task** $\rightarrow$ +10 min (e.g. folding school uniforms, watering plants).
   - **Weekend Family Challenge**: 5-question quiz where the lowest scorer gets an age-safe random chore from AI.
4. **Weekly Report**:
   - 7-day usage cards: Screen time vs limit per child, study vs entertainment split, minutes earned, streak days, and chores done.
   - **“Share on WhatsApp”** button: Formats a clean summary text to share in the family WhatsApp group.
   - **AI Parent Insight Card**: Button *“Get my family insight”* calling Gemini Coach for personalized, calm parenting advice.
5. **About**:
   - Team **J&Anni** (Visakhapatnam, AP), middle-class urban context, MoSPI 2024 Time Use research data (urban women spend 289 min/day on domestic work vs 88 min for men), and transparent pricing.

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18+ or v24+)
- npm (v9+)

### Steps
1. Navigate to the project directory:
   ```bash
   cd c:\Users\jahnavipriyaP\OneDrive\Desktop\FamSync
   ```
2. Start the dev server (includes built-in `/api/insight` middleware):
   ```bash
   npm run dev
   ```
3. Open in your browser:
   ```
   http://127.0.0.1:5173
   ```

*(Optional: Set `GEMINI_API_KEY=your_key` in a `.env` file for live Google Gemini calls. If omitted, FamSync uses its built-in high-fidelity Indian household coach engine seamlessly.)*

---

## 🚢 How to Deploy

### Option A: Node.js / Express (Render / Railway / Docker)
```bash
npm run build
npm start
```
Environment variables:
- `PORT=3001`
- `GEMINI_API_KEY=your_gemini_api_key`

### Option B: Static / Serverless (Vercel / Netlify)
Deploy the `dist/` directory and mount `server/geminiInsight.js` as an API route at `/api/insight`.

---

## ✅ 5-Step Test Checklist

1. **Test Persona Selector ("Who is using the phone now?")**:
   - Click the selector dropdown in the top bar.
   - Switch between **Parent (Amma/Nanna)**, **Grandparent (Nani)**, **Anna (16)**, and **Chinni (10)**.
   - Verify Grandparent sees the approval inbox but limits are locked. Verify Anna and Chinni see their personalized timer and progress ring.
2. **Test English / Telugu Switcher**:
   - Tap the **తెలుగు / English** button in the navbar.
   - Verify all buttons, category labels, schedule locks, dialogs, and alerts switch to Telugu and back.
3. **Test Child Screen Timer & 5-Minute Warning**:
   - Switch persona to **Chinni (10)** and go to **Child View**.
   - Pick category **Games** and tap **"Start Screen Time"**.
   - Notice the live progress ring, remaining minutes, and gentle alert when $\le 5$ minutes remain.
4. **Test Reading Timer & Approval Inbox**:
   - In **Child View**, scroll to **"Read for 10 minutes"** card, click **"Start 10-Min Reading Timer"**, and tap *"Quick Complete (Demo)"*.
   - A request is sent! Switch persona to **Parent (Amma/Nanna)** or **Grandparent (Nani)** and open **Parent Dashboard**.
   - Find Chinni's request under **Approval Inbox** and tap **"Approve"**.
   - Switch back to Chinni and confirm her allowed minutes increased by **+10 min**!
5. **Test Weekly Report & AI Parent Insight**:
   - Open **Weekly Report**. View the 7-day usage chart and study vs entertainment ratio.
   - Click **"Get my family insight"** to test the Gemini Coach analysis.
   - Click **"Share on WhatsApp"** to copy a clean summary message for the family group.

---

## 💡 5 Ideas for the Next Version (v2)

1. **Audio Reading Companion**: Voice verification that listens to 1 minute of the child reading aloud to validate storybook sessions automatically.
2. **Tuition Schedule Calendar Sync**: Import Google Calendar or school timetable so tuition hours automatically shift on holidays or exam study breaks.
3. **Weekly Rythu Bazaar Apprentice**: A weekend grocery challenge where children accompany parents to the local market and earn 30 screen-time minutes for calculating fresh vegetable change.
4. **WhatsApp Approval Bot**: Allow parents to reply *"YES"* or *"NO"* on WhatsApp to approve reading and chore requests while working at the office.
5. **Sibling Screen-Time Trade**: Let siblings gift or trade up to 15 bonus minutes to one another in exchange for completing household chores.
