# Salary Management — Requirements (one page)

## Goal
Replace ACME's Excel-based salary tracking with a web app that lets an **HR Manager** manage salary
data for ~10,000 employees across multiple countries and answer "how does the org pay people?"
without pivot tables.

## Persona
**HR Manager** — comfortable with spreadsheets, not technical. Needs to find an employee fast,
fix their record, and pull quick numbers for leadership (e.g. "what do we pay engineers in India?").

## In scope

### 1. Employee management
- List all employees with **server-side pagination** (10k rows never load at once).
- **Search** by name or email; **filter** by country, department and job title; **sort** by name, salary, hire date.
- **Create / edit / delete** an employee. Fields: full name, email (unique), job title, department,
  country, salary, hire date. Currency is derived from the country.
- Validation on the server (source of truth) with errors surfaced inline in the form.

### 2. Salary insights
- **Org overview**: headcount, number of countries, headcount per country.
- **Per country**: min / max / average / median salary, headcount (in local currency).
- **Per job title within a country**: headcount, min / max / average salary.
- **Per department within a country**: headcount and average salary.

### 3. Seed data
- Deterministic seed script that creates **10,000 employees** from `first_names.txt` × `last_names.txt`,
  realistic salary bands per job title and country. Runs in a few seconds (bulk insert).

## Deliberately out of scope (and why)
| Left out | Reason |
|---|---|
| Authentication / roles | Single persona (HR Manager); adds setup cost without testing the core problem. Would add Devise/JWT + RBAC next. |
| Currency conversion / cross-country totals | Requires FX rates source + date semantics. Averaging INR with USD is misleading, so all stats are reported **per country in local currency**. |
| Salary history / audit trail | Valuable, but a separate domain (effective-dated compensation). Called out as next step. |
| Bulk CSV import/export | The seed script covers data loading for this exercise. |
| Payroll, tax, bonuses, equity | Not "salary management" for this persona. |
| Org hierarchy / managers | Not needed to answer pay questions asked. |

## Non-functional
- List & insight endpoints respond < 200 ms on 10k rows (indexes on country, job_title, department, salary).
- Fast, deterministic unit/request tests for backend; component tests for the UI.
- Incremental commits showing how the solution evolved.
