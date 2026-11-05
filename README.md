# FamSync

**Share the work. Share the wisdom.**

A simple web app that helps middle class families in Visakhapatnam share housework fairly and pass practical knowledge from elders to the younger generation.

Team: **J&Anni**

---

## The Problem

- Women carry most household work, and it often goes unnoticed. Urban women spend **289 min/day** on unpaid domestic work vs **88 min** for men ([MoSPI Time Use Survey 2024](https://www.mospi.gov.in/sites/default/files/publication_reports/TUS_Factsheet_25022025.pdf)).
- Elders' practical knowledge (cooking, repairs, budgeting) is never passed on to the younger generation.
- Chore apps target flatmates, not families, and none connect housework with learning.

## Features

| Feature | What it does |
|---|---|
| **Task Board** | Weekly chores with minutes. A bar chart shows each person's load. AI suggests a fair split. |
| **Thank-You Wall** | Log invisible work and let the family say thank you. |
| **Ask an Elder** | Ask a family member directly ("Anna asks Nani: teach me rasam"). Completed sessions are saved in a Family Skill Book. |
| **Weekend Game** | AI quiz. The loser takes over one chore from a woman of the house. A Relief Counter shows minutes saved. |

Also included: English / Telugu toggle, sample Vizag family data (labelled "Sample"), and a "Clear my data" button.

## AI Feature (Gemini)

Gemini is called only from the server, so the API key is never exposed in the browser.

| Mode | Purpose |
|---|---|
| `split` | Suggest a fair chore distribution |
| `match` | Recommend who should teach what |
| `quiz` | Create a 5-question weekend quiz |
| `chore` | Pick a safe chore for the loser |

All responses are JSON and shown as cards. If the key is missing or the call fails, the app uses a local fallback and shows a "Try again" button.

## Tech Stack

- Frontend: HTML, CSS, JavaScript (or React)
- Backend: one serverless / Express function (`/api/coach`)
- AI: Google Gemini API
- Storage: browser `localStorage` (no login)

## Run Locally

```bash
# 1. Clone
git clone https://github.com/<your-username>/famsync.git
cd famsync

# 2. Install
npm install

# 3. Add your key
cp .env.example .env
# open .env and set:
# GEMINI_API_KEY=your_key_here

# 4. Start
npm run dev
```

Open the local URL shown in the terminal. Get a free key from [Google AI Studio](https://aistudio.google.com/).

## Deploy

1. Push the project to GitHub.
2. Import it into **Vercel** or **Netlify**.
3. Add `GEMINI_API_KEY` in
