# FR3SH WMS — Warehouse Management System

Internal warehouse and godown management app for the FR3SH organic produce platform.

---

## Overview

This is a standalone Next.js app for FR3SH warehouse staff. It shares the same MongoDB database and Supabase storage as the main FR3SH web app (`farmers-republic`), but is deployed as a separate internal tool accessible only to authorised warehouse personnel.

**Core WMS Flow:**
```
Inbound → Quality Check → Putaway → Storage → Picking → Packing → Shipping → Returns
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Database | MongoDB via Mongoose |
| Storage | Supabase (shared bucket: `wms-uploads`) |
| Auth | JWT (httpOnly cookie) |
| Icons | Lucide React |
| Toast | React Hot Toast |

---

## Setup

### 1. Clone / open the app

```bash
cd /path/to/FR3SH/fr3sh-warehouse-webapp
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Required values:

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/farmers_republic?...
JWT_SECRET=<generate with: openssl rand -base64 64>
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your anon key>
```

> The app connects to the **same** `farmers_republic` MongoDB database as the main FR3SH web app.

### 4. Seed initial data

```bash
npm run seed
```

This seeds:
- **Default admin user**: `admin@fr3sh-wms.com` / `Fr3sh@WMS2026!` ← **change password after first login**
- **26 warehouse zones** (A–Z matching the FR3SH product catalog)
- **78 sample products** (3 per zone from the FR3SH 3000-item catalog)

### 5. Create the Supabase WMS bucket

In your Supabase dashboard, create a public bucket named `wms-uploads` (or set `NEXT_PUBLIC_SUPABASE_WMS_BUCKET` to your preferred name).

### 6. Run the dev server

```bash
npm run dev
```

App starts at: **http://localhost:3001** (or `:3000` if farmers-republic is not running)

---

## WMS Routes

Canonical Go SKU reads are available behind `WMS_CANONICAL_CATALOGUE_READS=1` with `GO_API_BASE_URL` configured. Keep the flag disabled until reviewed SKU mappings populate canonical variants and SKUs. The adapter changes catalogue identity reads only and never moves or recomputes inventory quantities.

| Route | Description |
|---|---|
| `/wms/dashboard` | Real-time warehouse overview |
| `/wms/inward` | Receive stock from farmers/FPOs |
| `/wms/quality-check` | QC inspection queue |
| `/wms/inventory` | Live inventory by SKU/batch |
| `/wms/locations` | Zone/aisle/rack/bin management |
| `/wms/batches` | Batch & expiry tracking (FEFO) |
| `/wms/orders/picking` | Order picking tasks |
| `/wms/orders/packing` | Packing station |
| `/wms/dispatch` | Courier assignment & dispatch |
| `/wms/returns` | Returns inspection & restocking |
| `/wms/adjustments` | Admin-controlled stock adjustments |
| `/wms/reports` | Analytics and reports |
| `/wms/settings` | Warehouse config, users, thresholds |

---

## User Roles

| Role | Access |
|---|---|
| Super Admin | Full access |
| Warehouse Admin | Full warehouse access |
| Warehouse Manager | All operations, reports |
| Receiving Staff | Inward, QC |
| QC Staff | Quality Check only |
| Picker | Picking only |
| Packer | Packing only |
| Dispatcher | Dispatch, tracking |
| Inventory Auditor | Inventory, reports, adjustments |
| Finance Viewer | Read-only: reports, costs |

---

## Database Collections

The WMS creates these MongoDB collections in the shared `farmers_republic` database:

```
warehouses          warehouse_locations    warehouse_zones
warehouse_bins      inward_entries         quality_checks
inventory_items     inventory_batches      inventory_movements
pick_tasks          packing_tasks          dispatches
returns             stock_adjustments      cycle_counts
warehouse_alerts    warehouse_users        wms_product_catalog
```

All inventory movements are recorded in an **immutable ledger** (`inventory_movements`).

---

## API Routes

All WMS API routes are under `/api/wms/`:

```
POST   /api/wms/auth/login
GET    /api/wms/auth/me
POST   /api/wms/auth/logout
GET    /api/wms/dashboard
GET/POST  /api/wms/inward
GET/POST  /api/wms/quality-check
GET    /api/wms/inventory
GET/POST  /api/wms/locations
GET    /api/wms/batches
GET/POST/PATCH  /api/wms/picking
GET/POST  /api/wms/adjustments
GET/POST  /api/wms/returns
GET    /api/wms/products
```

---

## Key Business Rules

1. **FEFO (First Expiry, First Out)** — batches expiring earliest are picked first
2. **Every batch is traceable** to a specific farmer/FPO
3. **Every stock movement** creates an immutable `inventory_movements` record
4. **Rejected QC stock** never enters sellable inventory
5. **Damaged / expired / returned** stock is separated from available stock
6. **Stock adjustments** require manager approval for large changes
7. **Packing** must verify all items before dispatch
8. System is structured to support **multiple warehouses** in future

---

## Supabase Storage

Upload folders used:
- `wms-uploads/inward/` — invoice, challan, product photos
- `wms-uploads/qc/` — QC inspection photos
- `wms-uploads/returns/` — return photos

---

## Adding More Products

The full 3,000-product catalog is in:
```
~/Downloads/FR3SH_3000_Organic_Product_Master_Catalog.xlsx
```

To import all 3,000 products, modify `scripts/seed.ts` to parse the full Excel file (requires `openpyxl` or a Node.js xlsx library).

---

## Production Notes

- Set `NODE_ENV=production` — enables secure cookies
- Run on a different port from `farmers-republic` (e.g., `PORT=3001`)
- Restrict access by IP/VPN for internal-only use
- Rotate `JWT_SECRET` after initial setup
- Enable MongoDB network access restrictions to your server IPs only
