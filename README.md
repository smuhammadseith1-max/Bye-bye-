# AI-Surplus — RBAC & Vendor Management Slice

This is a working slice of the AI-Surplus platform, scoped to three things:

1. **Role-based login** with per-dashboard access control and secure password change
2. **Vendor product management** — add/edit/delete listings with photo upload
3. **Distance calculator** — shop-to-drop-off distance, Google Maps-ready with a
   working no-API-key fallback

It's built so the rest of the full spec (consumer feed, NGO flows, orders,
payments, admin panel, AI matching, localization) can be added on top without
rewriting auth, the database layer, or the routing.

## What's functional right now

- Sign up / log in per role (consumer, vendor, caterer, ngo, delivery, admin)
- JWT sessions; every dashboard route checks both "is logged in" and "is this
  the right role" server-side (not just hidden in the UI)
- Change password from account settings (requires current password)
- Vendor/caterer: create, edit, delete products; upload a photo per product
- Distance calculator: enter or geolocate a drop-off point, get distance from
  the vendor's shop location

## What still needs API keys / is stubbed

- **Google Maps**: without `GOOGLE_MAPS_API_KEY`, distance is a straight-line
  (Haversine) estimate — accurate for "how far is this," not real road
  distance/time. Add the key and it automatically switches to Google's
  Distance Matrix API, server-side only (never exposed to the browser).
- **Razorpay/payments**: not wired up yet — `.env.example` reserves the vars.
- **Postgres**: the demo runs on a local SQLite file (`backend/ai_surplus.db`)
  so it starts with zero setup. `db.js` documents the schema in
  Postgres-compatible shape; swapping in real Postgres means pointing an ORM
  at `DATABASE_URL` and translating the same table defs — no route code
  needs to change.
- Consumer feed, NGO reservation flow, delivery assignment, admin panel: the
  routes and dashboards exist as authenticated placeholders (`RoleDashboard`)
  ready for those features to be built into them.

## Database schema (current slice)

```
users (id, name, email, phone, password_hash, role, shop_name, shop_lat, shop_lng, shop_address, created_at)
products (id, vendor_id, name, description, category, original_price, surplus_price, quantity, photo_url, status, created_at, updated_at)
```

`role` is one of: consumer, vendor, caterer, ngo, delivery, admin.
`status` is one of: available, reserved, sold, expired, cancelled.

## Environment variables

Copy `backend/.env.example` to `backend/.env`:

| Variable | Required? | Notes |
|---|---|---|
| `PORT` | no | defaults to 4000 |
| `JWT_SECRET` | yes in production | signs session tokens |
| `DATABASE_URL` | only when moving to Postgres | unused by the SQLite demo |
| `GOOGLE_MAPS_API_KEY` | no | enables real road distance |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | no | reserved for payments milestone |

## How to run

```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run dev          # http://localhost:4000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev           # http://localhost:5173
```

The frontend dev server proxies `/api` and `/uploads` to the backend, so no
CORS config is needed locally.

## Next recommended step

Build out the consumer dashboard (feed, filters, favorites) against the same
`products` table — it already has everything needed to list, filter, and sort
surplus items; the remaining work is UI plus a public (non-vendor) `GET
/api/products` endpoint with location/price/category query params.
