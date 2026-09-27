<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting published git history.
<!-- LOVABLE:END -->

- Keep creator-domain mock entities centralized in `src/lib/creator-data.ts` so a Django API adapter can replace them later.
- Route pages render through one shared creator workspace shell to keep desktop and mobile navigation behavior consistent.
- Prototype mutations remain client-local and must clearly communicate mock completion; there is no persistence layer yet.
