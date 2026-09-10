# MENT Dex

**Live:** https://thalescd.github.io/ment-dex/

A web-based Pokédex for my [pokeemerald](https://github.com/thalescd/pokeemerald-expansion) ROM hack. It pulls data directly from the game's source files on GitHub and presents them in an interactive interface.

Heavily inspired by [Unbound Pokedex](https://github.com/Ydarissep/Unbound-Pokedex) by [Ydarissep](https://github.com/Ydarissep).

## Features

- **Species** — stats, types, abilities, evolutions, forms, sprites, and learnsets
- **Moves** — type, power, accuracy, PP, and descriptions
- **Abilities** — names and descriptions
- **Locations** — wild Pokémon encounter tables

Planned, not implemented yet:

- **Trainers & Items** — the display layer exists, but the parsers still target
  the old CFRU source format and are disabled pending a rewrite against
  pokeemerald-expansion

### UI Highlights

- Shiny sprite toggle
- Search with autocomplete
- Type effectiveness chart
- Lazy loading for large tables
- Shareable URLs via query parameters
- Persistent user settings (localStorage)

## How It Works

The app fetches C header files directly from the pokeemerald-expansion repository on GitHub and parses them with regex into JavaScript objects. No backend, no build step — just vanilla JS running in the browser.

## Layout

```
src/
├── index.js              entry point: wires the app and starts the load
├── app/                  orchestration — may know about everything
├── features/             species, species-panel, moves, abilities,
│                         locations, scripts (trainers + items, parked)
├── shared/table/         table infrastructure that knows no feature
├── core/                 generic leaves: state, config, DOM refs, http, cache
└── vendor/               third-party code, not linted or type-checked
```

Dependencies point inward: `core` and `vendor` never import a feature, and
`shared` never imports one either. That rule is enforced by
`test/unit/architecture.test.js`, which also fails if the import graph gains a
cycle. Two deliberate exceptions are listed there with the reason.

## Stack

- Vanilla JavaScript (ES modules), no build step
- Vanilla CSS
- ESLint + Prettier, run on commit via Husky + lint-staged

## Development

Requires Node 20+.

```bash
npm install          # also installs the git hooks
npm run lint         # eslint
npm run format       # prettier --write
npm test             # unit tests (fixtures, no network)
npm run test:smoke   # parses the live upstream repo — needs network
npm run typecheck    # tsc against jsconfig.json (checkJs)
```

### Tests

`npm test` runs the parsers against small fixtures in `test/fixtures/`, taken
from the real upstream files. It catches parser regressions but, by design,
cannot catch a format change upstream — a frozen fixture keeps passing.

`npm run test:smoke` is what catches that: it parses the live
pokeemerald-expansion and asserts thresholds ("at least 1000 species"), so a
parser that stops matching fails loudly. CI runs it on a daily schedule and
opens an issue on failure; it is deliberately not part of the PR checks.

`npm run typecheck` is informative, not a gate — the codebase still has type
errors and CI does not run it.

Serve the directory with any static file server and open `index.html`; there is
nothing to build.

## Credits

- Inspired by [Unbound Pokedex](https://github.com/Ydarissep/Unbound-Pokedex) by [Ydarissep](https://github.com/Ydarissep)
- Pokémon data sourced from [pokeemerald-expansion](https://github.com/thalescd/pokeemerald-expansion)
