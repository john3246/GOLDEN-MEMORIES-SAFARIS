# Migration process

```
WordPress inventory
  → Content mapping
  → Transformation scripts
  → PostgreSQL load
  → CMS verification
  → URL redirect map (301)
  → SEO checks
  → Cutover
```

Rules:

- Preserve SEO via redirect map (Phase 16)
- Do not blindly copy `wp_*` tables
- Re-encode media through the media pipeline
- Keep `.co.tz` on the external API throughout — no HTML dependency on `.com`
