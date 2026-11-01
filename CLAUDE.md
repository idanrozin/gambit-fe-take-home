# CLAUDE.md

a client-only React app to browse cloud resources, group a selection into an Application, and view Applications as a graph. Vite, React 19, TypeScript (strict), Tailwind v4, shadcn/ui on Radix, Vitest. No backend: all state lives in the client.

## Scope

- Resources table: name, type, provider, environment, criticality, open issues.
- Search by name; filter by provider, environment and criticality.
- Multi-select resources and create a named Application (optional description) from the selection.
- List created Applications.
- Graph per Application: a central Application node linked to its member resource nodes (plain SVG or a library).
- Reviewers judge component structure, TypeScript quality, state modelling, UX correctness, visual polish and pragmatic scope. Prefer a small, finished, clean feature set over breadth.

## Project map

- `src/app/` - app shell (`App.tsx`)
- `src/domain/` - data model (`types.ts`) and display label records (`labels.ts`)
- `src/components/ui/` - shadcn primitives and `Badge`; import from `@/components/ui` (`sheet` imports directly)
- `src/components/` - shared composites (`MultiSelectFilter`)
- `src/hooks/` - shared hooks
- `src/test/setup.ts` - jsdom stubs for Vitest

<important if="you need to run commands to build, test, lint, or format">

Run from the repo root with pnpm (Node 22+).

| Command          | What it does                     |
| ---------------- | -------------------------------- |
| `pnpm install`   | Install dependencies             |
| `pnpm dev`       | Vite dev server on port 5173     |
| `pnpm build`     | Typecheck and production build   |
| `pnpm preview`   | Serve the production build       |
| `pnpm test`      | Vitest + Testing Library         |
| `pnpm lint`      | ESLint (TypeScript, hooks, a11y) |
| `pnpm typecheck` | `tsc --noEmit`                   |
| `pnpm format`    | Prettier                         |

Before committing, run `pnpm format`, `pnpm typecheck`, `pnpm lint` and `pnpm test`.
</important>

<important if="you are changing the data model or the sample resource dataset">

- `Resource` has `openIssues: number`. The brief's interface omits it, but its sample data and required table columns use it. Keep it, and keep the README note about it.
- The dataset is ~8–12 resources with enough spread across provider, environment and criticality that search, filters and grouping all have visible effects. Be ready to justify the choices in the README.
</important>

<important if="you are adding a value to Provider, Environment or Criticality, or rendering one">

Display text comes from the `Record<Union, string>` label records in `src/domain/labels.ts`. Key order is display order; iterate with `valuesOf`, never `Object.keys`.
</important>

<important if="you are adding state, persistence or data flow">

- No backend and no fetching. Applications are client state; derive filtered lists and lookups with selectors instead of storing copies.
- Applications store `resourceIds`, not resource objects; resolve them against the dataset when rendering.
</important>

<important if="you are adding a shadcn/ui component">

- Add with `yes n | pnpm dlx shadcn@4.22.1 add <name>`. Answering no keeps our `button.tsx`; on macOS's case-insensitive filesystem the CLI otherwise overwrites it. Run `pnpm format` afterwards, then export it from `src/components/ui/index.ts`.
- Generated components import `cn` from the `cn` package; our code imports it from `@/lib/utils`.
</important>

<important if="you are building or changing UI">

- Colour is never the only signal: badges and graph nodes always show their label text.
- Every list has an empty state (`EmptyState`), including "no resources match the filters" and "no Applications yet".
- Check changes in the browser pane with the `web` configuration from `.claude/launch.json`.
</important>

<important if="you are writing or modifying tests">

- Vitest globals and Testing Library with `user-event`; query by role and accessible name.
- jsdom has no layout. `src/test/setup.ts` stubs `ResizeObserver` for Radix popovers; extend it there rather than per test.
</important>

<important if="you are editing README.md">

The brief requires the README to cover: how to run it (one command from a fresh clone), what was built, what you'd do next, and where AI was used.
</important>
