# RU translation — flagged for human review (v1, 2026-07-19)

Locked canon (do not change without Kyle): **гоблины** · **байбек** ·
**«Руда должна течь. Гоблины должны есть.»** · ты-form throughout · no dash
punctuation (тире); intra-word hyphens are grammar, not style, and are allowed.

## Renders that want a native/Kyle eyeball
| EN | RU shipped | Note |
|---|---|---|
| fleet op | флитоп | RU EVE community slang; alt: «флотовая операция» |
| belt | белт | community slang; alt: «пояс» |
| jetcan / can | кан | community slang |
| Orca | Орка (declined) | the one sanctioned RU ship-name exception; all other ships stay Latin |
| Haul Log | Журнал рейсов | "haul"=рейс throughout receipts; alt: «журнал добычи» |
| Fleet Drop Ledger | Флотовый журнал дропов | tool name, descriptive translation |
| Ore Calculator | Калькулятор руды | |
| Refine vs Reprocess collision | Калькулятор руды / Справочник переработки | both map naturally to «переработка»; split resolved by role |
| The Watchtower | Дозорная башня | WATCHTOWER codename label stays untranslated |
| CLASSIFIED / REDACTED | СЕКРЕТНО / ВЫМАРАНО | |
| Wall of Goblins | Стена гоблинов | |
| Tools (nav burger) | Тулзы | deliberately slangy; alt: «Инструменты» |
| Fresh Off The Rock | Свежий с камня | medal |
| The Cornerstone | Краеугольный камень | medal |
| Black Eye | Фингал | medal |
| The Long Haul | Дальний рейс | medal |
| Boss of Bosses | Босс боссов | medal |
| A Million Cubes | Миллион кубов | medal |
| Married to the Rock | В браке с камнем | medal |
| The Provider | Кормилец | medal |
| The Pied Piper of Goblins | Гоблинский крысолов | medal |
| The Asteroid's Nightmare | Кошмар астероида | medal |
| Still Alive | Всё ещё жив | medal |
| One of Us Now | Теперь ты свой | medal |
| Deepest Pockets | Самые глубокие карманы | medal |
| Friend of the Rock | Друг камня | ally honor |
| Patron Saint of the New Goblin | Святой покровитель новичка | medal |
| Architect of Industry | Архитектор индустрии | medal |
| Shift Worker | Сменщик | medal |
| like a Victorian orphan | как сирота из Диккенса | cultural adaptation, on purpose |
| Project: Our Own Rock | Проект: Свой камень | |
| The pecking order | Иерархия клюва | leaderboard heading, playful |

## Known-English remainders in v1 (accepted, by design)
- **Interpolated JS strings** (composed at runtime with data): "Good name, {ign}. …",
  "step {n} of {m}" in tours, count lines like "Fresh: X · sent: N", portal ESI
  transparency paragraph and ally banner (built from concatenated fragments).
  These need `t()` retrofits in a later pass; they safely render English today.
- **Notification inbox rows** (worker-composed text), **portal/admin** command
  center (officer-only), **accord/** (diplomatic doc, EN by design), **outbound
  recruiting mail bodies** (in-game mails to EN-speaking targets).
- **Generator page deep content** (refine ROCK INDEX, arbitrage tables, radar
  tables): EVE item/system names are canon-English by law; their page chrome
  gets dictionary coverage incrementally (nav/tours/gates are already covered).
- Landing decorative side-comments ("// rocks in → isk out").

## Process law for future copy
Run `node i18n/extract.mjs` after changing member-facing copy; new English
strings simply render in English until `i18n/ru.js` gains their entries
(fallback is structural, nothing breaks). Never translate: user content, EVE
proper nouns, BONK/Wealthy Dropouts/bonkeve.com, ISK, m³, numbers, URLs.
The buyback story in RU is the public 90% story, translated verbatim, always.
