# MYRAVO — Your next trip, beautifully planned

MYRAVO is a travel-planning web application for discovering destinations, building itineraries, planning multi-stop routes and keeping trip essentials together.

## Product scope

- Destination and nearby-place discovery
- Multi-stop route previews and Google Maps hand-off
- Day-by-day itineraries with editable stops
- Travel AI assistant (Groq, optional)
- Trip budgets, saved trips and packing checklists
- Group travel coordination and trip schedules
- Weather and practical travel-safety information

This repository is the web application. A separate general-purpose planner is not part of MYRAVO.

## Technology

- Frontend: React 18, Vite, Tailwind CSS, React Router, Lucide
- Backend: Node.js 22, Express, PostgreSQL
- Maps and place data: Leaflet, OpenStreetMap, Nominatim, Overpass and OSRM
- Weather: Open-Meteo
- Optional AI: Groq API
- Transactional email: Brevo

## Local development

1. Install Node.js 22.
2. Configure the backend environment:
   ```sh
   cd backend
   npm install
   cp .env.example .env
   ```
3. Set `DATABASE_URL` to a PostgreSQL connection string and set `JWT_SECRET` to a random secret of at least 16 characters.
4. Start the API:
   ```sh
   npm run dev
   ```
5. In another terminal, start the frontend:
   ```sh
   cd frontend
   npm install
   npm run dev
   ```
6. Open the Vite URL shown in the terminal. The API health endpoint is `http://localhost:4000/api/health`.

## Production environment

Set these on the backend hosting service:

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Signs login tokens |
| `CLIENT_ORIGIN` | Yes | Frontend origin allowed by CORS |
| `BREVO_API_KEY` | For email resets | Brevo transactional email API key |
| `BREVO_SENDER_EMAIL` | For email resets | Verified sender address in Brevo |
| `BREVO_SENDER_NAME` | No | Sender display name; defaults to MYRAVO |
| `GROQ_API_KEY` | No | Enables full AI chat and itinerary summaries |
| `GROQ_MODEL` | No | Groq model; defaults to `openai/gpt-oss-20b` |
| `GEO_CONTACT` | Recommended | Contact identifier for Nominatim requests |

For password reset delivery, verify the sender address in Brevo before setting it as `BREVO_SENDER_EMAIL`. Never put API keys in frontend environment variables or commit them to Git.

## Map and data limitations

MYRAVO uses community and public map services without requiring each user to provide an API key. Public services have fair-use limits and may be temporarily unavailable. OpenStreetMap data may not include ratings, reviews, prices or opening hours. Route estimates do not include live traffic. Google Maps opens separately for turn-by-turn navigation.

## Build and checks

- Frontend production build: `cd frontend && npm ci && npm run build`
- Backend syntax check: `cd backend && find src -name '*.js' -print0 | xargs -0 -n1 node --check`

## Deployment note

The frontend and backend are deployed separately. Configure the frontend API base URL and the backend's `CLIENT_ORIGIN` to match the actual deployment domains. Verify `/api/health`, login, password reset email, AI status, map search, route preview and saved-trip flows after deployment.
