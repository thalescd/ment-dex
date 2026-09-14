# MENT Dex — notas para o Claude

Pokédex estática para um ROM hack de pokeemerald-expansion. Sem backend e sem
build step: JS vanilla com ES modules, direto no browser.

O ponto que define o projeto: **todos os dados vêm de arquivos-fonte em C
baixados do GitHub em tempo de execução e parseados com regex.** O upstream
(`thalescd/pokeemerald-expansion`) muda de formato sem aviso, e quando muda os
parsers param de casar em silêncio. Quase tudo aqui existe por causa disso.

## Comandos

```bash
. ~/.nvm/nvm.sh      # Node vem do nvm; sem isto, `node` não existe no PATH
npm install
npm run lint
npm run format
npm test             # unitários, com fixtures — sem rede
npm run test:smoke   # parseia o upstream de verdade — precisa de rede
npm run typecheck    # informativo: ainda há ~800 erros, não é gate
```

## O que já é verificado automaticamente

Não repita estas regras em documentação — elas são garantidas por ferramenta, e
documentação paralela só diverge. (Este projeto já viveu isso: o README
anunciava ESLint por meses enquanto não existia arquivo de config.)

| regra                        | quem garante                                               |
| ---------------------------- | ---------------------------------------------------------- |
| formatação                   | Prettier, no hook de pre-commit                            |
| lint                         | `eslint.config.js` (`npm run lint` deve ficar em 0 errors) |
| camadas e ausência de ciclos | `test/unit/architecture.test.js`                           |
| formato do upstream          | `test/smoke/`, no cron diário do CI                        |

## Convenções que nenhuma ferramenta pega

### Papel de cada arquivo dentro de uma feature

- `parse.js` — **puro**: texto em, objeto fora. Sem DOM, sem `fetch`, sem
  `gameData`. É o que torna os parsers testáveis sem browser; mantenha assim.
- `fetch.js` — busca e cache. É a única camada que fala com a rede.
- `display.js` — monta DOM.

Antes de existir essa separação havia `fetch()` dentro de arquivos de parse.
Não volte a misturar.

### Carregamento dos dados do jogo

Os quatro conjuntos principais (species, moves, abilities, locations) **têm** de
passar por `core/http.js` e `core/cache.js`:

- `fetchText` / `fetchJson` lançam em resposta não-OK. `fetch()` cru **não**
  rejeita em 404 — devolve o corpo de erro, que o parser transforma em `{}`.
- `loadCached` / `writeCache` se recusam a gravar objeto vazio.

Isso não é preferência de estilo: sem as duas coisas, um 404 ou uma mudança de
formato viravam `{}` gravado no `localStorage`, e o app pulava o rebuild **para
sempre**. A dex ficava vazia e nada avisava.

`features/species/fetch.js` também tem `assertPlausible()`, que rejeita um parse
implausivelmente pequeno. Ao mexer nos parsers, mantenha essa guarda.

Outros usos de `fetch` e `localStorage` são legítimos e não passam por ali:
a API do GitHub em `core/dataVersion.js`, a paleta em `species-panel/panel.js`,
settings, histórico do painel e o cache de sprites.

### Idioma

Comentários e nomes internos em português; mensagens de commit em inglês, com
assunto no imperativo e corpo explicando o _porquê_.

## Estado deliberado — não "conserte"

- **`features/scripts/` (trainers e items) está parado.** Os parsers ainda
  visam o formato antigo do CFRU, `buildScriptsObjs` está com o corpo
  comentado, e `gameData.trainers` / `gameData.items` são sempre `{}`. Vai ser
  reescrito para o formato expansion. Não apague como se fosse lixo, e não
  tente reativar sem esse trabalho. As referências a `repos.cfru` ali apontam
  para um repo que não está mais no `core/config.js` — é conhecido.

- **`test/unit/architecture.test.js` tem um allowlist** com duas violações de
  camada reais: `shared/table/` importa lógica de trainers. O conserto está
  escrito lá (a feature registra os predicados, como `batchSize` e
  `useShowFlag` já fazem em `shared/table/registry.js`) e espera a reescrita
  acima. Se for corrigir, tire do allowlist — o teste reclama se sobrar entrada
  obsoleta.

- **`Species.type3` nunca é atribuído.** É herança do CFRU, que tinha um
  terceiro tipo. As ~26 leituras guardadas por `typeof !== "undefined"`
  parecem inúteis e não são: o campo é opcional de propósito no typedef.

- **207 formas geradas por macro não são parseadas** (Alcremie, Unown,
  Vivillon, Furfrou, Minior, e também Arceus, Silvally, Ogerpon e Genesect).
  Elas usam `[SPECIES_X] = MACRO(...)` em vez de `= { ... }`. As cosméticas não
  fazem falta; as quatro últimas são formas funcionalmente distintas que hoje
  não aparecem no painel de formas. Gap conhecido.

## Ao mexer nos parsers

Rode `npm run test:smoke`. Os testes unitários usam fixtures congeladas: eles
pegam regressão sua, mas passam felizes enquanto o upstream muda. Só o smoke
pega drift — foi exatamente esse buraco que deixou a dex vazia sem ninguém
notar.
