---
inclusion: fileMatch
fileMatchPattern: ["src/i18n/**", "src/domain/epitaph.ts", "src/domain/sample.ts", "README.md"]
---

# Copy voice: the gravekeeper

The site speaks as an old gravekeeper: calm, dry, a little fond of the dead. Gentle gallows humor, never cruel. The jokes are about packages, never about the people who maintain them.

## Where the voice applies

| Surface | Voice | Example |
|---|---|---|
| Titles, zone names, ritual, epitaphs, empty states | Gravekeeper | "The crow shakes its head." / "乌鸦摇了摇头。" |
| Data, reasons, errors, privacy note, disclaimer, aria labels | Plain and exact | "Last published 2022-12-04, 21,000,000 weekly downloads (≥ 50,000)" |

When in doubt, plain wins. A screen-reader label or an error message is never a joke.

## Rules

- Every string exists in both `en.ts` and `zh.ts`. Chinese is written in Chinese, not translated word by word. Keep the same number of epitaph templates per status in both (`EPITAPH_COUNT`).
- Epitaphs interpolate real data (`name`, `days`, `last`, `downloads`, `version`, `born`, `words`). Never invent facts.
- Quote deprecation messages exactly, inside “ ” / 「」.
- Status names are fixed: Alive / 守夜人, Zombie / 行尸, Ghost / 游魂, Buried / 长眠者, Lost / 无名冢. Zones: The Candlelit Garden / 烛光花园, The Rotting Moor / 腐土荒原, The Misty Cloister / 迷雾回廊, The Silent Yard / 静默墓地, The Outskirts / 墓园外围.
- Short sentences. One image per epitaph.

## Banned words and moves

| Don't | Why | Use instead |
|---|---|---|
| "dead" / "死亡" as a **status label** | The status is `buried`; "dead" was the old prototype's name | Buried / 长眠者 |
| insecure, unsafe, vulnerable, dangerous, risk / 不安全、危险、漏洞、风险 (about a status) | We measure maintenance, not security | "not maintained", "no release since …" |
| abandoned, garbage, trash, junk, rotten code / 废弃垃圾、烂代码 | Blames maintainers | "its maintainers have moved on" |
| "you should remove/replace X" | We don't give migration advice | State the fact; let the reader decide |
| gore, blood, corpses in detail | Spooky-cute, not horror | candles, mist, crows, soil |
| names of real people, films, games, characters | Originality rule | our own characters |
| emoji in UI copy | Breaks the engraved look | none |
| "simply", "just", "easy" | Condescending | say the step |
| AI filler: "delve", "leverage", "robust", "seamless" / "赋能"、"一站式" | Not the gravekeeper | plain words |

Lost graves are never shamed: a failed lookup is "could not be summoned", not "broken".
