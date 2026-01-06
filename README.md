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

## Next

Swap `src/api/base44Client.js` to call your real Node.js backend (REST or GraphQL) without rewriting your UI.
