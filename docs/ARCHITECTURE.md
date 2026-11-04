# Architecture & Design Notes

```
┌──────────────────────────┐      JSON / REST      ┌──────────────────────────────┐
│ frontend/ (React + Vite) │  ───────────────────▶ │ backend/ (Rails 8, API mode)  │
│  Mantine UI, React Query │   /api/v1/...         │  Controllers → Query objects  │
│  Employees | Insights    │ ◀───────────────────  │  ActiveRecord → SQLite        │
└──────────────────────────┘                       └──────────────────────────────┘
```

## Backend (`backend/`)
- **Rails 8 API-only**, SQLite (relational, zero-ops; swap to Postgres via `database.yml`).
- `Employee` model — validations, `Country` lookup for currency.
- `Countries` (`app/models/countries.rb`) — the single source for supported countries → currency.
- `EmployeesQuery` — filtering, search, sort, pagination kept out of the controller.
- `SalaryInsights` — aggregate queries (`MIN/MAX/AVG/COUNT` with `GROUP BY`) executed in the DB, median
  computed with an `ORDER BY … LIMIT/OFFSET` per country (SQLite has no `percentile_cont`).
- Indexes: `email` (unique), `country`, `[country, job_title]`, `[country, department]`, `salary`.
- Salary stored as `decimal(12,2)` — never floats for money.
- Tests: Minitest (Rails default — no extra gems): model, query object, insights service, request specs.

### API
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/v1/employees` | `page, per_page, q, country, department, job_title, sort, direction` |
| GET/POST/PATCH/DELETE | `/api/v1/employees(/:id)` | CRUD |
| GET | `/api/v1/meta` | countries (+currency), departments, job titles for dropdowns |
| GET | `/api/v1/insights/overview` | headcount + per-country stats |
| GET | `/api/v1/insights/countries/:country` | country stats, by job title, by department |

## Frontend (`frontend/`)
- **Vite + React 18 + TypeScript**, **Mantine** component library, **TanStack Query** for server state.
- `src/api/` typed client · `src/features/employees/` table, filters, form modal · `src/features/insights/`.
- Filters are debounced and sent to the server; the browser never holds all 10k rows.
- Tests: Vitest + Testing Library with the API module mocked.

## Trade-offs
- **Per-country stats only** instead of converting to USD — honest numbers over a single headline figure.
- **Offset pagination** — simple and fine at 10k; keyset pagination would be the move at 1M+.
- **SQLite** — trivial to run & demo; concurrency limits irrelevant for a single HR persona.
- **No auth** — see REQUIREMENTS.md.

## Performance considerations
- Seed uses `insert_all` in batches of 1,000 → 10k rows in ~1–2 s instead of ~30 s with `create!`.
- All aggregation happens in SQL; the API returns tens of rows, not thousands.
- Composite indexes match the insight `WHERE country = ? GROUP BY job_title` access pattern.
