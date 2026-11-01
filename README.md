# Applications Console

Frontend take-home: browse cloud resources, group a selection into an Application, and view Applications as a graph. Client-only; state lives in the browser.

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

<!-- TODO: what I built, what I'd do next, where I used AI -->
