# Octalve Suite (Local Dev Scaffold)

This folder is a "resurrected" local React + Vite scaffold built around the UI code you exported from Base44.

## Run locally

1. Install Node.js 20+.
2. In this folder:

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

## Login

Use the built-in local login:

- Admin: admin@octalve.local
- Client: client@octalve.local

Data is stored in `localStorage` (see `src/api/base44Client.js`).

## Project Structure

```
octalve-suite/
├── .env
├── .gitignore
├── LICENSE
├── README.md
├── jsconfig.json
├── next.config.mjs
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
│
├── app/
│   ├── globals.css
│   ├── layout.jsx
│   ├── page.jsx
│   │
│   ├── (client)/                    # Client portal routes
│   │   ├── layout.jsx
│   │   ├── approvals/
│   │   │   └── page.jsx
│   │   ├── dashboard/
│   │   │   └── page.jsx
│   │   ├── phases/
│   │   │   └── page.jsx
│   │   ├── project/
│   │   │   └── page.jsx
│   │   └── support/
│   │       └── page.jsx
│   │
│   ├── (octalve)/                   # Admin/internal routes
│   │   ├── layout.jsx
│   │   ├── analytics/
│   │   │   └── page.jsx
│   │   ├── clients/
│   │   │   └── page.jsx
│   │   ├── overview/
│   │   │   └── page.jsx
│   │   ├── projects/
│   │   │   ├── page.jsx
│   │   │   ├── [id]/
│   │   │   │   └── page.jsx
│   │   │   └── new/
│   │   │       └── page.jsx
│   │   ├── settings/
│   │   │   └── page.jsx
│   │   ├── team/
│   │   │   └── page.jsx
│   │   └── templates/
│   │       └── page.jsx
│   │
│   ├── api/                         # API routes
│   │   ├── approvals/
│   │   │   └── route.js
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── route.js
│   │   │   ├── logout/
│   │   │   │   └── route.js
│   │   │   └── me/
│   │   │       └── route.js
│   │   ├── deliverables/
│   │   │   └── route.js
│   │   ├── messages/
│   │   │   └── route.js
│   │   ├── phases/
│   │   │   └── route.js
│   │   ├── projects/
│   │   │   └── route.js
│   │   ├── team-members/
│   │   │   └── route.js
│   │   └── templates/
│   │       └── route.js
│   │
│   ├── login/
│   │   └── page.jsx
│   │
│   └── phases/
│       └── [id]/
│           └── page.jsx
│
├── components/
│   ├── layout/
│   │   └── ShellLayout.jsx          # Main shell/navigation layout
│   │
│   ├── providers/
│   │   └── Providers.jsx            # Context providers wrapper
│   │
│   ├── shared/                      # Reusable shared components
│   │   ├── EmptyState.jsx
│   │   ├── PhaseAccessGate.jsx
│   │   ├── ProgressRing.jsx
│   │   ├── ProjectSelector.jsx
│   │   ├── StatusBadge.jsx
│   │   └── SuiteTypeBadge.jsx
│   │
│   └── ui/                          # UI primitives (shadcn/ui)
│       ├── accordion.jsx
│       ├── alert.jsx
│       ├── badge.jsx
│       ├── button.jsx
│       ├── card.jsx
│       ├── collapsible.jsx
│       ├── dialog.jsx
│       ├── dropdown-menu.jsx
│       ├── input.jsx
│       ├── label.jsx
│       ├── progress.jsx
│       ├── scroll-area.jsx
│       ├── select.jsx
│       ├── separator.jsx
│       ├── skeleton.jsx
│       ├── switch.jsx
│       ├── tabs.jsx
│       └── textarea.jsx
│
├── lib/
│   ├── prisma.js                    # Prisma client instance
│   ├── utils.js                     # Utility functions
│   └── api/
│       └── client.js                # API client
│
└── prisma/
    ├── schema.prisma                # Database schema
    ├── seed.js                      # Database seeder
    └── dev.db                       # SQLite dev database
```

## Next

Swap `src/api/base44Client.js` to call your real Node.js backend (REST or GraphQL) without rewriting your UI.
