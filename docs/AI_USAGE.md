# How AI tools were used

Built with an agentic AI assistant (Claude) driving the editor, shell and test runner. I owned the
product and design decisions; the assistant drafted code, which was then reviewed, tested and adjusted.

## Workflow
1. **Requirements first** — wrote `REQUIREMENTS.md` (scope + explicit exclusions) before any code.
2. **Architecture** — agreed the shape (Rails API + React SPA, query object + insights service) in
   `ARCHITECTURE.md`, then built in small vertical slices, one commit each.
3. **Test alongside code** — each backend slice landed with Minitest coverage; frontend components with
   Vitest/Testing Library tests against a mocked API module.
4. **Verify visually** — ran the UI against a stub API and checked screenshots at desktop and phone widths.

## Representative prompts
- "Design the salary insights so they answer what an HR manager would ask. Don't mix currencies — explain
  the trade-off."
- "Write a query object for the employee list: filters, case-insensitive search that escapes LIKE
  wildcards, whitelisted sorting, clamped pagination. Tests first."
- "Seed 10,000 employees deterministically from first_names.txt and last_names.txt; it must be fast —
  use insert_all, and add a test proving seeded rows pass model validations."
- "Build the employees screen with Mantine: server-side pagination, debounced search, sortable headers,
  and map 422 field errors from Rails back onto the form."

## Where AI output was corrected
- SQLite `LIKE` ignores `\` escapes without an explicit `ESCAPE` clause — caught by the wildcard test
  and fixed in a follow-up commit.
- Insights "Range" card initially showed only the max; changed to `min – max` after visual review.
- An AI-suggested jsdom polyfill for `getComputedStyle` recursed into itself; removed.
