# Octalve Suite (Local Dev Scaffold)

Streamline project delivery from creation to completion, ensuring seamless collaboration between teams and clients.

This is a React + Vite scaffold for the Octalve Suite application.

## Run locally

1. Install Node.js 20+.
2. In this folder:

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173). (React + Vite)
Open the URL Next.js prints (usually http://localhost:3000). (Next.js)

## Login

Use the built-in local login:

- Admin: admin@octalve.local
- Client: client@octalve.local

Data is stored in `localStorage` (see `src/api/base44Client.js`).

## Reactjs + Vite Project Structure

```
octalve-suite/
├── .env
├── .gitignore
├── LICENSE
├── README.md
├── index.html
├── jsconfig.json
├── package.json
├── package-lock.json
├── postcss.config.cjs
├── tailwind.config.cjs
├── vite.config.js
│
├── prisma/
│   └── dev.db                         # SQLite dev database
│
└── src/
    ├── App.jsx                        # Main app component with routing
    ├── Layout.jsx                     # Shell layout with navigation
    ├── main.jsx                       # App entry point
    ├── utils.js                       # Utility functions
    │
    ├── api/
    │   └── base44Client.js            # API client (localStorage-based)
    │
    ├── components/
    │   ├── UserNotRegisteredError.jsx
    │   │
    │   ├── shared/                    # Reusable shared components
    │   │   ├── EmptyState.jsx
    │   │   ├── PhaseAccessGate.jsx
    │   │   ├── ProgressRing.jsx
    │   │   ├── ProjectSelector.jsx
    │   │   ├── StatusBadge.jsx
    │   │   └── SuiteTypeBadge.jsx
    │   │
    │   └── ui/                        # UI primitives (shadcn/ui)
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
    ├── entities/                      # Entity schema definitions
    │   ├── Approval.json
    │   ├── Deliverables.json
    │   ├── Message.json
    │   ├── Phase.json
    │   ├── Project.json
    │   ├── TeamMember.json
    │   └── Template.json
    │
    ├── lib/
    │   └── utils.js                   # Utility helpers
    │
    ├── pages/                         # Page components
    │   ├── Login.jsx
    │   │
    │   ├── # Client Pages
    │   ├── ClientApprovals.jsx
    │   ├── ClientDashboard.jsx
    │   ├── ClientPhases.jsx
    │   ├── ClientProject.jsx
    │   ├── ClientSupport.jsx
    │   │
    │   ├── # Admin/Octalve Pages
    │   ├── CreateProject.jsx
    │   ├── OctalveAnalytics.jsx
    │   ├── OctalveClients.jsx
    │   ├── OctalveDashboard.jsx
    │   ├── OctalveProjects.jsx
    │   ├── OctalveSettings.jsx
    │   ├── OctalveTeam.jsx
    │   ├── OctalveTemplates.jsx
    │   │
    │   ├── # Shared Pages
    │   ├── PhaseDetail.jsx
    │   └── ProjectDetail.jsx
    │
    └── styles/
        └── globals.css                # Global styles
```

## Next.js Project Structure
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
