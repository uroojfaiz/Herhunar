# HerHunar: AI marketplace for home-based women

Live demo:https://herhunar-client.vercel.app/ · Demo video: https://drive.google.com/file/d/1ZYP1rXNKpQ6iw2XAvJo4VaqAi3-Du0yR/view?usp=sharing· Built for the NYLP AI Hackathon 2026

## Problem
Many women in Pakistan have real skills (tailoring, home cooking, beauty, tutoring, online work) but cannot leave home to work, and they have no easy way to build a name or find customers. Customers, in turn, struggle to find a trusted woman offering these services nearby.

## Solution
HerHunar connects home-based women (hunarmands) with customers in their area. A customer describes what they need in plain words (typed or spoken), an AI matches them with the best hunarmand and suggests a fair price, and the two talk directly on WhatsApp. A hunarmand can create a service just by speaking in Urdu; AI writes the listing and suggests a price.

## Features
- Signup and login (JWT) for customers and hunarmands, with full profile CRUD (photo, area, WhatsApp, location)
- Hunarmands add, edit and delete their work with photos and available days (portfolio)
- Search by skill, name or area; filters for category, women-only and near me; live map
- Price offers: offer, accept, counter, complete, rate
- Instagram-style public page for every hunarmand: profile, stats, photo grid of her work with captions and likes, and her services
- Private in-app messages between customer and hunarmand: inbox, unread count, sent/seen receipts, edit (within 15 minutes), delete (unsend), emoji picker, plus one-tap WhatsApp (wa.me)
- Trust and safety: neighbour vouching (3 vouches show a verified badge), report button, location rounded to about 1 km, exact address never stored
- Live notifications (bell, toast, sound) for new messages, offers, acceptances and reviews; reviews can include photos
- Mobile-first home with AI Match card, category tiles, Near you cards, a full map screen with price pins and a bottom sheet (desktop: two-column hero and map preview)
- 6 languages with right-to-left layout, 5 themes (including high contrast and dark), text size control, Easy mode, responsive on phone, tablet and desktop

## Tech stack
React 18 + Vite, React Router, Leaflet / OpenStreetMap, Node.js, Express, MongoDB with Mongoose, JWT and bcrypt, deployed on Vercel (static client plus one serverless API function).

## AI methodology and API usage
All AI calls go through the Anthropic API (Claude, default model `claude-haiku-4-5-20251001`, set with `AI_MODEL`). The key stays on the server.

1. **AI Match** (`POST /api/ai/match`): the server pre-ranks services by keyword fit and rating (top 25), sends the customer's need and these candidates to Claude, which re-ranks them with reasoning. It returns the best 3, each with a one-sentence reason in the customer's language and a fair offer price. The server checks every returned id against the candidate list, so the AI cannot invent a hunarmand. If the AI is off or fails, a keyword matcher is used and the UI labels the result as "Basic".
2. **Voice to listing** (`POST /api/ai/profile`): the browser transcribes Urdu speech (Web Speech API, Chrome), and Claude turns the transcript into a service title, category, description and price.
3. **AI price suggestion** (`POST /api/ai/price`): Claude suggests a fair PKR range for a service. A fixed range per category is the fallback.

Third-party AI used: Anthropic Claude API. AI coding assistance was also used during development; all code was reviewed and tested by the team.

## Setup (Node 20+)
1. `cp .env.example .env` and fill `MONGODB_URI`, `JWT_SECRET` and optionally `ANTHROPIC_API_KEY`. Never commit `.env`.
2. `npm install`, then `cd client && npm install && cd ..`
3. Optional demo data: `npm run seed` (set `SEED_LAT` and `SEED_LNG` to your city first)
4. Terminal 1: `npm run dev:api`, Terminal 2: `npm run dev:client`, open http://localhost:5173

## Deploy on Vercel
1. Create a free MongoDB Atlas cluster, add a database user, and under Network Access allow `0.0.0.0/0`.
2. Push this folder to a public GitHub repo, import it in Vercel (framework: Other).
3. Add environment variables `MONGODB_URI`, `JWT_SECRET`, `ANTHROPIC_API_KEY`, `AI_MODEL`, then deploy.
4. Open the live link in a private window and on a phone to check it works for others.

## Demo accounts
After `npm run seed`: customer `03000000000`, hunarmands `03000000001` to `03000000005`, password `Demo1234`. All seeded profiles are demo data and are labelled "Demo profile".

## Screenshots
_Add 3 to 4 screenshots here: home with AI Match, a service page, the hunarmand dashboard, mobile view._

## Known limitations
- Voice input needs a browser with speech recognition (Chrome or Edge).
- Photos are stored in MongoDB; for many users move them to Cloudinary or S3.
- Translations beyond English and Urdu cover the main labels only.
- CNIC verification, payments (Easypaisa/JazzCash) and in-app chat are future work.
- Rate limiting is basic and in-memory.
- In-app chat refreshes by polling every few seconds (no websockets on Vercel serverless); image messages are not supported yet.

## Team contributions
_Name: This project completely create ,deply and submit by Urooj (solo)
