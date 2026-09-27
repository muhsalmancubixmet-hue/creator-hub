# Influencers.com Creator Workspace

## Goal
Build a polished, responsive private creator workspace at `/`, with realistic fictional Kerala creator data, reusable UI, and mock interactions ready for later Django API integration.

## Experience
- Desktop: persistent creator sidebar, compact top bar, command search, notifications, and profile menu.
- Mobile: compact header, five-item bottom navigation, “More” drawer, touch-friendly controls, and full-screen dialogs.
- Visual direction: editorial creator-studio feel with clean white surfaces, charcoal typography, coral/rose and teal accents, large imagery, subtle gradients, tight radii, and restrained motion.
- Primary persona: Ananya Nair, a fictional Kochi-based travel, food, and lifestyle creator. Her identity, metrics, campaigns, portfolio, and services stay consistent everywhere.

## Screens and routes
- `/` — dashboard, completion status, metrics, profile preview, website prompt, activity, opportunities.
- `/profile` — editable basic and professional profile, photo/cover controls, live preview.
- `/social-media` — connected social accounts, add-platform dialog, custom platform request with submitted state.
- `/portfolio` — media grid, content filters, add/edit/preview dialogs, delete confirmation, visual reorder mode.
- `/services` — service catalog, pricing modes, active states, add/edit service flow.
- `/website` — no-site onboarding, multi-step builder, realistic preview, publish state, live-site management, domain and SEO mock settings.
- `/media-kit` — premium live media-kit preview plus mock generate/share/download actions.
- `/opportunities` — searchable/filterable campaign marketplace and application dialog.
- `/inquiries` — status tabs, conversation detail, reply, accept, and decline interactions.
- `/analytics` — period filters, trend charts, portfolio ranking, traffic sources, and service views.
- `/settings` — account, visibility, notifications, privacy, connections, subscription, website/domain, security, and confirmations.

## Shared architecture
- Central entity-oriented mock data and TypeScript models for creators, accounts, portfolio items, services, campaigns, inquiries, analytics, notifications, and website configuration.
- Shared application shell and reusable cards, previews, charts, dialogs, drawers, toast feedback, empty states, and loading skeletons.
- Route-specific metadata for every page.
- Local React state for prototype edits and success feedback only; no backend, authentication, DNS, or real publishing.

## Key interactions
- Global search surfaces matching pages and creator records.
- Notifications panel supports read/unread state.
- Profile menu exposes public profile, website, settings, and logout mock action.
- Website builder progresses from ownership choice through template, style, sections, preview, and published management.
- Forms validate required values and confirm successful mock saves.
- Destructive actions require confirmation.

## Validation
- Confirm the app builds without errors.
- Exercise the main website-creation flow and core dialogs in the running preview.
- Check desktop and mobile layouts for clipping, overlap, navigation usability, and readable forms.
