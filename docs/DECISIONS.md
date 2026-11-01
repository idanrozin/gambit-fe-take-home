# Decisions: Applications Console

The decision log behind the build tickets, settled in a planning session on 2026-11-01. Each entry gives the decision and why. Don't reopen one without a new reason; if one changes, update it here.

The brief is a frontend take-home. Reviewers grade component structure, TypeScript quality, state modelling, UX and correctness, visual polish, and pragmatic scope.

## Stack and app structure

**Vite + React 19 + TypeScript, not Next.js.** The brief says no backend; nothing benefits from SSR or server components, and they would add client/server boundaries to explain.

**One page, no router: an Applications sidebar beside the resources table, and an Application's graph in a wide right-side drawer.** First planned as separate routes; changed in planning because the brief describes "a small UI" and doesn't ask for pages, and one page makes the create-then-see loop immediate (a new Application appears in the sidebar next to the table). Deep links and Back still work: the open Application lives in the URL (`?app=<id>` via `nuqs`, plain React adapter). Only one drawer is open at a time (graph or create), and resource details show inside the graph drawer rather than as a second overlay. The trade-off is less room for the graph than a full page. Rejected: one table holding both resources and Applications (grouped rows), because many-to-many membership would duplicate rows and the brief still needs a separate list and graph.

**Dark mode with a light / dark / system toggle, saved in `localStorage`.** The user wants it. Storing the theme is a per-viewer convenience, unlike persisting Applications (see below).

## Data and state

**Resources are a static `.ts` module, not state.** "Hold state in the client" means the data source is client-side mock data, not an API. Nobody writes resources, so they are imported, never put in a store.

**`openIssues: number` is on `Resource`.** The brief's interface omits it, but its sample data and its required table columns use it. Noted in the README.

**Dataset: 12 resources, all providers, environments and criticality levels, about 4 owning teams.** Enough spread that every filter visibly changes the table and natural Applications are obvious (for example "Payments API").

**Applications are the only shared state: `ApplicationsProvider` with `useReducer` and typed actions, read and write split into two hooks.** Applications are written from the resources table and read by the sidebar, the graph drawer and the membership hint, so they sit at the app root. A reducer is pure and unit-testable and shows state modelling, which the brief grades. Splitting read and write contexts means write-only components don't re-render on data changes. Zustand would add a dependency without showing anything extra.

**Everything else is local.** Search and filters belong to the resources table (stored in the URL, below); row selection is local to the table.

**Applications are kept in memory; no persistence.** The brief doesn't ask for it. `localStorage` persistence is a "what I'd do next" item, easy to add behind the provider.

**Many-to-many membership.** The brief's model has `resourceIds` on Application and nothing on Resource, and real resources (a shared IAM role or database) serve several apps. It doesn't conflict with the graph requirement: each Application's graph is always a star of its own members. Overlap is shown as an "in N apps" hint on Resources and "Also in" on graph node details.

**Applications store `resourceIds`, not resource copies.** Resolve against the dataset when rendering; derive lookups with selectors.

## Resources table

**Table: shadcn `table` primitive with our own pure filter, sort and selection logic. No TanStack Table.** 12 rows need no virtualisation, and keeping the logic in plain domain functions makes the state modelling visible and testable. TanStack Table with virtualisation is the "next" answer for large datasets.

**Search and filters live in the URL via `nuqs`.** A filtered view can be shared, survives reload, and Back works. The pattern is proven in the Wiz prep project.

**Default sort: criticality descending, then open issues descending.** A security product should show the riskiest resources first.

**Selection survives filter changes.** Clearing it when a filter changes is a common way users lose work. The action bar shows "N selected (M hidden)" and has a "Clear selection" action. The header checkbox acts on visible rows only.

**The selection actions sit at the end of the filter row, not in their own bar.** A bar above the table pushed the table down when it appeared, and a floating bottom bar felt detached. In the filter row it adds no height on wide windows; on narrow ones it wraps to a second line and the table shifts by one row. Fallback if that bothers us: swap the table header for the actions while rows are selected.

**The table shows only the brief's six columns. `region`, `owner` and `tags` stay in the model and show in the graph drawer's resource details (ticket 08).** The brief lists those six as the required columns, the table is already tight next to the sidebar (about 600px of content), and region and owner are secondary to ranking by risk. This was implicit until 2026-11-01 and is recorded now. If we want them in the table later, the cheap option is a muted second line under the name (for example `payments · us-east-1`): no new columns or width, slightly taller rows. A bigger step is owner as a filter and search target, which goes beyond the brief's three filters, so it is a "next" item.

## Applications

**Create and delete. No editing.** Create is in the brief. Delete is not, but it is cheap and makes the demo forgiving. Editing (rename, add or remove resources) doubles the form logic, so it's a "next" item.

**Create flow in a right-side sheet listing the selected resources, each removable.** Users can review the selection before committing, and the table stays visible, unlike with a dialog. On success: a toast linking to the new Application, and the selection clears.

**Validation (our judgment; the brief only implies "named"): name required, trimmed, max 60 characters, unique ignoring case; at least 1 resource; description optional, max 200 characters.** Errors appear inline under each field, and the submit button stays enabled so the user is told why rather than facing a dead button.

**Delete asks for confirmation in a dialog that names the Application.**

## Graph

**`@visx/network` with our own circle layout and our own node and link components. No zoom.** Measured gzipped sizes (app JS was 69 KB at the time):

| Option          | Added size                        | Verdict                                                                                                                               |
| --------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `@visx/network` | 1.4 KB                            | Chosen. A thin React wrapper over SVG: we keep full visual control with theme tokens, and the layout is about 10 lines.               |
| `@visx/zoom`    | +12 KB                            | Not needed for at most 12 nodes                                                                                                       |
| React Flow      | 59 KB                             | A node editor (drag, zoom, edge routing, its own styles). Overkill for a static star. Revisit for an all-Applications overview graph. |
| Mermaid         | Up to 1.47 MB of on-demand chunks | Text to an SVG string: no React nodes, awkward clicks and hover, lays a star out as a tree. Good for docs, wrong for UI.              |

The user rejected hand-written plain SVG as messy; visx gives the same control declaratively.

**Graph drawer: a member list beside the graph with two-way hover and focus highlighting; clicking a node shows a details section with every field plus "Also in", which switches the drawer to that Application.** Makes the drawer useful on its own and connects the two views of the same data. Colour is never the only signal: nodes always show their labels, and a legend explains the colours.

## Testing

**Unit tests for the pure logic (sort, filter, reducer, validation, layout, membership selector), component tests where a ticket asks, and one full-flow test at the end.** Covers the risky logic and the core path without chasing coverage.

## What I'd do next (for the README)

- Persist Applications in `localStorage`
- Edit Applications (rename, add or remove resources)
- An overview graph of all Applications with shared resources as cross-links (where React Flow might earn its size)
- TanStack Table with virtualisation for large datasets
