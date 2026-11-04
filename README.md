# ACME Salary Management

Web app for an HR Manager to manage salary data for ~10,000 employees across multiple countries and
answer "how does the org pay people?".

- **Backend:** Ruby on Rails 8 (API-only) + SQLite — `backend/`
- **Frontend:** React 18 + TypeScript + Vite, Mantine component library, TanStack Query — `frontend/`

Docs: [Requirements](docs/REQUIREMENTS.md) · [Architecture & trade-offs](docs/ARCHITECTURE.md) · [AI usage](docs/AI_USAGE.md)

## Features
- **Employees:** server-side paginated list of 10k employees, search (name/email), filters
  (country / department / job title), sortable columns, add / edit / delete with inline validation errors.
- **Insights:** org headcount; per-country min / median / average / max salary; drill-down by job title
  and department. All figures in local currency (no FX mixing).
- **Seed:** deterministic `db:seed` creating 10,000 employees from `first_names.txt` × `last_names.txt`.

## Run locally

Prerequisites: Ruby ≥ 3.2, Bundler, Node ≥ 20.

```bash
# 1. API on http://localhost:3000
cd backend
bin/setup                 # bundle install, create DB, seed 10,000 employees
bin/rails server

# 2. UI on http://localhost:5173 (proxies /api to :3000)
cd frontend
npm install
npm run dev
```

## Tests

```bash
cd backend  && bin/rails test     # Minitest: model, query object, insights, seeder, API requests
cd frontend && npm test           # Vitest + Testing Library: client, formatting, pages, form
```

## API

| Method | Path | Notes |
|---|---|---|
| GET | `/api/v1/employees` | `page`, `per_page` (≤100), `q`, `country`, `department`, `job_title`, `sort`, `direction` |
| GET / POST / PATCH / DELETE | `/api/v1/employees(/:id)` | body: `{ "employee": { ... } }`; 422 returns `{ "errors": { field: [...] } }` |
| GET | `/api/v1/meta` | countries (+currency), departments, job titles |
| GET | `/api/v1/insights/overview` | headcount + stats per country |
| GET | `/api/v1/insights/country?country=India` | stats + by job title + by department |

## Deploy
- **API:** `backend/Dockerfile` (prepares DB and seeds on first boot). `render.yaml` deploys it on Render
  with a persistent disk for SQLite. Set `CORS_ORIGINS` to the frontend URL.
- **UI:** static build (`npm run build` → `frontend/dist`) on Netlify/Vercel/Render with
  `VITE_API_URL=https://<api-host>/api/v1`.
