# Applications Console

Browse cloud resources, group a selection into an Application, and view Applications as a graph. Client-only; state lives in the browser.

## Run

Requires Node 22+ and pnpm (`corepack enable` picks up the pinned version).

```bash
pnpm install && pnpm dev
```

Then open http://localhost:5173.

## Scripts

| Command          | What it does                     |
| ---------------- | -------------------------------- |
| `pnpm dev`       | Vite dev server                  |
| `pnpm build`     | Typecheck and production build   |
| `pnpm test`      | Vitest + Testing Library         |
| `pnpm lint`      | ESLint (TypeScript, hooks, a11y) |
| `pnpm typecheck` | `tsc --noEmit`                   |
| `pnpm format`    | Prettier                         |

## Stack

Vite, React 19, TypeScript (strict), Tailwind v4, shadcn/ui on Radix, Vitest.

## Notes on the brief

- **`openIssues` on `Resource`.** The brief's `Resource` interface has no `openIssues` field, but its sample resource includes `openIssues: 4` and the table must show an open-issues column. I added `openIssues: number` to the type (`src/domain/types.ts`) so the sample data type-checks and the column has a source.

## What I built

One page, no router: an **Applications sidebar** beside the **resources table**, with an Application's graph in a wide **right-side drawer**. One page makes the create-then-see loop immediate: a new Application appears in the sidebar next to the table you built it from.

- **Resources table** with the brief's six columns, sorted riskiest first (criticality, then open issues). Search by name; filter by provider, environment and criticality. Search and filters live in the URL (`nuqs`), so a filtered view survives reload, can be shared, and works with Back.
- **Selection and creating an Application.** Multi-select rows (selection survives filter changes; the header checkbox acts on visible rows only), review them in a sheet, then name the Application. Validation shows inline: name required, trimmed, max 60 characters and unique ignoring case; at least one resource; description optional, max 200.
- **Applications.** Listed in the sidebar, newest first. Delete asks for confirmation in a dialog that names the Application.
- **Graph.** Opening an Application shows a central node linked to its member resources (`@visx/network` with our own circle layout and node components). The member list beside it highlights two-way with the nodes; clicking a node shows its details (region, owner, tags and the rest). The open Application is in the URL as `?app=<id>`.
- **Dark mode** with a light / dark / system toggle, saved in `localStorage`.

State modelling:

- Resources are a static module, not state. Applications are the only shared state, held by `ApplicationsProvider` (`useReducer` with typed actions, read and write split into two hooks).
- Applications store `resourceIds`, not resource copies; lists and lookups are derived with selectors.
- Membership is many-to-many: a shared IAM role or database serves several Applications. Each graph is still a star of its own members; overlap shows as an "in N apps" hint on resources and "Also in" on node details.
- Display text comes from `Record<Union, string>` label records, so adding a provider, environment or criticality fails to compile until it is labelled.
- Colour is never the only signal: badges and nodes always show their label, and the graph has a legend.

Decisions and their reasons are in `.scratch/applications-console/DECISIONS.md` while that folder is kept.

### Dataset

12 resources across the three providers (AWS 5, GCP 4, Azure 3), the three environments and all four criticality levels, owned by four teams: **payments, identity, data, platform**. The spread is chosen so every filter visibly changes the table, and so natural Applications exist to group: "Payments API" (the four `payments-*` resources), "Identity" (the three `identity-*` ones), "Data platform", and cross-team ones like a "CI/CD" Application. Resources from different teams deliberately sit in the same provider and environment (for example AWS production holds payments and platform), so filtering by provider does not trivially equal grouping by team. Open-issue counts run from 0 to 12 so sorting by risk has an effect.

## Testing

`pnpm test` runs unit tests for the pure logic (sort, filter, selection, reducer and validation, circle layout, membership selector), component tests for the table, filters, sidebar and graph, and one full-flow test (`src/app/App.flow.test.tsx`): filter, select, create an Application, see it in the sidebar, open its drawer and find its member nodes. Tests query by role and accessible name.

## What I'd do next

- Persist Applications in `localStorage` (easy to add behind the provider).
- Edit Applications: rename, add or remove resources.
- An overview graph of all Applications with shared resources as cross-links; React Flow might earn its size there.
- TanStack Table with virtualisation for large datasets, and owner / region as filters and search targets.

## Where I used AI

I used Claude Code (Claude) throughout. I worked out scope, stack and the decision log with it in a planning session, then split the work into tickets and had it implement them one at a time, each on its own branch and pull request. It wrote most of the code and tests. I set the product decisions (one page with a drawer, many-to-many membership, no editing, visx for the graph, URL-stored filters), rejected options I didn't like (for example hand-written plain SVG for the graph), and reviewed each change and ran it in the browser before merging. I haven't hand-audited every line, so treat the test suite as the safety net.
