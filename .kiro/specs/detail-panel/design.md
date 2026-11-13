# Design: detail-panel

## Overview

`src/ui/DetailDialog.tsx` wraps Radix Dialog with Motion:

```
Dialog.Root open={!!grave}
 └─ AnimatePresence
     └─ Dialog.Portal forceMount
         ├─ Dialog.Overlay asChild → motion.div fade
         └─ Dialog.Content asChild → motion.div spring in, fade out
             ├─ Body
             │   ├─ motion.div layoutId="icon-{id}" → StatusIcon (gaze for ghost)
             │   ├─ seal (label · other-language label, with lang attr)
             │   ├─ Dialog.Title = package name
             │   ├─ Dialog.Description = epitaph
             │   ├─ reason, <dl> facts, last words, description, links, note
             └─ Dialog.Close (aria-label from i18n)
```

The tombstone renders a placeholder in place of its icon while selected, so the `layoutId` element exists in only one place.

## Data

- From the grave: `spec`, `status`, `history`, `weeklyDownloads`, `reason`.
- On demand: `usePackageInfo(target)` (TanStack Query, 6 h stale time, retry 1).

## Epitaph

`epitaphIndex(grave) = hashString("epitaph" + name) % EPITAPH_COUNT[status]`. Both locales have the same template count per status (checked by `i18n.test.ts`), so switching language keeps the same slot.

## Decisions

| Decision | Why |
|---|---|
| Radix Dialog, not a custom modal | Focus trap, Esc, focus return and aria wiring come for free. |
| Stars fetched only when opened | Keeps summoning at two requests per package. |
| Hide "last words" when the epitaph already quotes them | Avoids printing the same sentence twice. |

## Testing strategy

- `i18n.test.ts`: epitaph counts match, same slot across languages, quotes the deprecation message.
- `links.test.ts`: non-http links dropped.
- Manual + `a11y-reviewer` agent: B4 (dialog), C1, C5, C6 from `accessibility.md`.
