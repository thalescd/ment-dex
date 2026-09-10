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
npm run typecheck    # tsc against jsconfig.json (checkJs)
```

Serve the directory with any static file server and open `index.html`; there is
nothing to build.

## Credits

- Inspired by [Unbound Pokedex](https://github.com/Ydarissep/Unbound-Pokedex) by [Ydarissep](https://github.com/Ydarissep)
- Pokémon data sourced from [pokeemerald-expansion](https://github.com/thalescd/pokeemerald-expansion)
