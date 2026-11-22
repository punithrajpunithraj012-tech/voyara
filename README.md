# Voyara - Plan less. Wander more.

Voyara (formerly TripMate) is a full-stack travel-planning prototype built to grow into a real product and later a mobile app.

**Stack:** React + Vite + Tailwind CSS + Lucide icons (frontend) | Node.js + Express (backend) | SQLite (database) | Leaflet + OpenStreetMap (maps) | Open-Meteo (weather) | OSRM (routing) | Overpass/Nominatim (places and search) | Anthropic Claude API (optional AI)

## Quick preview with zero install
Open `demo/index.html` in Chrome or Edge (double-click it). It is a self-contained, working version of the new design: sign up, plan a trip, map, save/download, budget, packing list, weather, group cost-split, assistant. Data stays in your browser. Sample cities (Jaipur, Goa, Manali, Udaipur, Kochi, Varanasi, Delhi, Mumbai) work offline; other places and the weather use live free APIs and need internet.

## What changed in this version
- New name **Voyara**, new logo (`assets/logo.svg`: a "V" journey with a dotted route to a destination pin and a rising sun) and hero art (`assets/hero.svg`).
- New colour palette and layout (dark sidebar, gradient buttons, new landing page). Fonts are unchanged: **Sora** (headings) and **Figtree** (text).
- Internal names updated (database file `voyara.db`, login key `vy_token`).
- Added the zero-install demo above.
- Check the name Voyara for trademark and domain availability before you commit to it publicly.

```
voyara/
  demo/       Zero-install working preview (index.html)
  frontend/   React app (src/pages, src/components, public/ has logo.svg + hero.svg)
  backend/    Express API (src/routes: auth, data, geo, ai) + .env.example
  database/   schema.sql (applied automatically; voyara.db is created on first run)
  assets/     logo.svg and hero.svg
```

## IMPORTANT: testing status
The `demo/index.html` preview was run and click-tested in a real browser (sign up, plan, edit, save, budget, packing, group split, assistant, login/logout, mobile width). The React + Express project in `frontend/` and `backend/` was re-styled and syntax-checked, but it was **not installed or run** in the environment it was edited in (no internet for `npm install`). Expect to fix small bugs the first time you run it, and work through the checklist in section 8 before calling it tested.

## 1. Install the tools (Windows)
1. Install **Node.js LTS (v20 or newer)** from https://nodejs.org (tick the option that adds it to PATH).
2. Install **VS Code** from https://code.visualstudio.com.
3. If `npm install` fails while building `better-sqlite3`, install the "Desktop development with C++" tools from Visual Studio Build Tools, or use Node 20/22 LTS, which have prebuilt binaries.

## 2. Extract and open
Right-click `Voyara.zip` > **Extract All**. In VS Code choose **File > Open Folder** and open the `Voyara` folder. Open a terminal with **Terminal > New Terminal** (use Command Prompt or PowerShell).

## 3. Set up the backend (terminal 1)
```
cd backend
npm install
copy .env.example .env
```
Open `backend/.env` and set `JWT_SECRET` to a long random string. Generate one with:
```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Also put your email in `GEO_CONTACT` (the free OpenStreetMap search asks for a contact). Then:
```
npm start
```
You should see `Voyara API running on http://localhost:4000`. Check http://localhost:4000/api/health in a browser.

## 4. Set up the frontend (terminal 2: Terminal > New Terminal)
```
cd frontend
npm install
npm run dev
```
Open http://localhost:5173.

## 5. Database
SQLite needs no server. `backend/src/db.js` runs `database/schema.sql` on start and creates `database/voyara.db`. Tables: users, trips, expenses, groups_, group_members, packing_items, reminders. To reset everything, stop the backend and delete `database/voyara.db`. Open the file with "DB Browser for SQLite" to inspect it.

## 6. API setup
| Service | Key needed? | Used for |
|---|---|---|
| OpenStreetMap tiles, Nominatim, Overpass | No | Map, search, places (hotels, food, hospitals, attractions) |
| Open-Meteo | No | Weather forecast |
| OSRM public demo server | No | Road routes and turn-by-turn directions |
| Anthropic API | Optional | Real AI chat and trip summaries |

For real AI, create a key at https://console.anthropic.com and put it in `backend/.env` as `ANTHROPIC_API_KEY=...`, then restart the backend. Optionally set `AI_MODEL` to a model name from Anthropic's docs. **Without a key the assistant and trip summaries show clearly labelled DEMO text.** The key stays in the backend and is never sent to the browser.

The free public map servers (Nominatim, Overpass, OSRM) are for light use. For a real product, switch to a paid or self-hosted provider; the calls are all in `backend/src/routes/geo.js`.

## 7. Feature status
| Feature | Status |
|---|---|
| Register, login, logout, profile | Implemented. Passwords hashed with bcrypt, sessions use signed JWT (7 days), input validated with zod, rate-limited |
| Forgot password | **Demo.** No email server: the reset code is printed in the backend terminal and shown on the page in development |
| Plan My Entire Trip | Implemented. Asks 8 questions, then builds a plan from real OpenStreetMap places, orders stops with a nearest-neighbour route, adds forecast. Edit, save, download (.txt), print/PDF |
| Budget numbers in the plan | **Estimate only** (fixed per-day figures), labelled as such. Not live prices |
| Day travel times in the plan | Straight-line approximation. Use "Show road route" for real road distance and time |
| AI assistant | Real AI with an API key, otherwise **DEMO** keyword replies. Remembers the latest planned trip |
| Maps, routes, directions | Implemented with Leaflet, OSRM. Multi-stop routes and optional stop reordering |
| Live camera | **Not available.** No authorised public feed is connected; the app says so and never fakes footage |
| Hotels, restaurants, nearby, explore, hidden gems | Real OpenStreetMap data. **No ratings, reviews, prices or live opening hours** are shown (OSM has none) |
| Safety | Nearby hospitals, police, pharmacies from OSM, plus emergency numbers and tips (verify numbers before travel) |
| Weather and rainy-day alternatives | Implemented (Open-Meteo, indoor places when rain chance is 60% or more) |
| Budget and expenses | Implemented, stored in SQLite. The budget limit is stored in the browser only |
| Group travel | Create/join with a code, vote, share a saved trip, split expenses. Changes appear after a page refresh (no live sync) |
| Packing checklist | Implemented |
| Reminders | In-app only (dashboard banner). No push or email yet |

## 8. Test checklist before you submit
1. Register, log out, log in. Try a wrong password and a weak password.
2. Forgot password: use the demo code printed in the backend terminal.
3. Plan My Entire Trip for a well-mapped city (for example "Jaipur"). Remove a stop, save, open it in My Saved Trips, download it.
4. "Show road route" on the plan. Then try the Maps page with 2 places and with 4+ places.
5. Weather for a place; Safety, Hotels, Restaurants, Hidden gems, Nearby ("Use my location").
6. Add expenses, packing items, a reminder (set it for tomorrow and check the dashboard).
7. Create a group, add an option, vote, add expenses. Join the group from a second account using the code.
8. Resize the browser to phone width and check the menu and pages.

## 9. Known limits and ideas for later
- Overpass and Nominatim can be slow or rate-limited; try again after a moment if a search fails.
- Small towns may have few named attractions in OpenStreetMap.
- Next steps toward a real product: real email for password reset, PostgreSQL, live group sync (WebSockets), booking and review partners, offline maps. The API is separate from the UI, so a React Native app can call the same endpoints.
- Map data (c) OpenStreetMap contributors.
