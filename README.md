# dependency-graveyard
Paste a package.json, your dependency becomes a graveyard: Who's alive, who's a zombie, who's a ghost, who's buried.

## Kiro workspace

- Specs: `.kiro/specs/` (parse-package-json, fetch-package-health, classify-package, graveyard-scene, detail-panel)
- Steering: `.kiro/steering/` (tech, design-system, accessibility, copy-voice)
- Hooks: `.kiro/hooks/` (type check + lint on save, property tests on status-rule changes, block commits that leave `.kiro/` out)
- MCP: `.kiro/settings/mcp.json` (fetch)
- Custom agent: `.kiro/agents/a11y-reviewer.json`
- Usage log: [`docs/kiro-log.md`](docs/kiro-log.md)

Product and visual source of truth: [`docs/DESIGN.md`](docs/DESIGN.md).

## License

[MIT](LICENSE). Bundled fonts (Crimson Pro, Grenze Gotisch, IM Fell English, via Fontsource) are under the SIL Open Font License 1.1.
