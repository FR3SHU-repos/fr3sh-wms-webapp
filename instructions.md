# FR3SH WMS — AI Agent Instructions

This document gives AI coding agents the project-specific context needed to work safely and
consistently in `fr3sh-warehouse-webapp`. Treat the current source code as authoritative if
this document or `README.md` drifts.

---

## What This Project Is

**FR3SH WMS** is the internal warehouse and godown application for the FR3SH ecosystem. It
supports receiving produce, quality checks, storage locations, batch and expiry visibility,
picking, returns, stock adjustments, product/SKU setup, and multiple warehouses.

It is a standalone Next.js application, not a package inside the marketplace app. It has its
own pages, REST API, staff authentication, and Mongoose models.

The intended operational flow is:

```text
Inbound → Quality Check → Putaway → Storage → Picking → Packing → Dispatch → Returns
```

Only part of that flow is currently persisted end to end. Inbound, QC, inventory/batches,
locations, picking, returns, adjustments, products, suppliers, and warehouses have APIs.
Putaway, packing, dispatch, reports, settings management, cycle counts, and alerts are
incomplete, static, or model/UI-only. Never imply that these gaps are implemented.

---

## Ecosystem Relationship

The common workspace root contains the authoritative cross-project references:

- `../cross-platform-assets/projects-context.md` — complete ecosystem architecture and
  project relationships.
- `../cross-platform-assets/projects-api.md` — complete provider/consumer API reference.

Related applications:

| Project | Relationship to WMS |
|---|---|
| `../farmers-republic/` | Marketplace web app and `/api/v1` backend. Uses the same MongoDB database deployment but a different domain model. |
| `../fr3sh-test-app/` | Expo mobile client of `farmers-republic`; it does not call WMS APIs. |

Important boundaries:

- WMS does **not** call the marketplace REST API.
- Marketplace and mobile do **not** call `/api/wms`.
- No webhook, queue, or event transfers marketplace orders into WMS.
- `PickTask.orderId` is free text and is not validated against marketplace `orders`.
- WMS inventory does not update marketplace `Product.stockQty`, `reservedQty`, or
  `availableQty`.
- `GET /api/wms/farmers` directly reads the marketplace `farmers` collection and merges it
  with WMS suppliers. This is the one confirmed cross-project data dependency.

Do not create cross-application writes or assume shared IDs without deliberately designing
the contract and checking both common-root reference documents.

---

## Tech Stack

| Concern | Technology |
|---|---|
| Framework | Next.js 16, App Router, Turbopack |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS v4 |
| Database | MongoDB through Mongoose 8 |
| Authentication | `jsonwebtoken` HS256 + `bcryptjs`; httpOnly cookie `wms_token` |
| File storage | Supabase Storage through `@supabase/supabase-js` |
| Notifications | `react-hot-toast` |
| Icons | Lucide React |
| Animation | Framer Motion |
| QR rendering | `react-qr-code` |
| Tests | No test framework or test suite currently configured |
| Lint | No lint script currently configured |

There is no Redis, queue, cron job, GraphQL, tRPC, WebSocket, payment provider, courier API,
or analytics/error-monitoring SDK in this project.

---

## Project Structure

```text
fr3sh-warehouse-webapp/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── api/wms/
│   │   ├── auth/{login,logout,me,register}/route.ts
│   │   ├── adjustments/route.ts
│   │   ├── batches/route.ts
│   │   ├── dashboard/route.ts
│   │   ├── farmers/route.ts
│   │   ├── inventory/route.ts
│   │   ├── inward/route.ts
│   │   ├── locations/route.ts
│   │   ├── picking/route.ts
│   │   ├── products/route.ts
│   │   ├── quality-check/route.ts
│   │   ├── returns/route.ts
│   │   └── warehouses/route.ts
│   ├── wms/
│   │   ├── dashboard/page.tsx
│   │   ├── inward/page.tsx
│   │   ├── quality-check/page.tsx
│   │   ├── inventory/page.tsx
│   │   ├── locations/page.tsx
│   │   ├── batches/page.tsx
│   │   ├── orders/{picking,packing}/page.tsx
│   │   ├── dispatch/page.tsx
│   │   ├── returns/page.tsx
│   │   ├── adjustments/page.tsx
│   │   ├── products/page.tsx
│   │   ├── warehouses/page.tsx
│   │   ├── reports/page.tsx
│   │   ├── settings/page.tsx
│   │   └── layout.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── shared/
│   ├── components/WMSSidebarLayout.tsx
│   ├── context/WMSUserContext.tsx
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── db/mongo.ts
│   │   ├── supabase/client.ts
│   │   └── utils.ts
│   └── models/*.ts
├── scripts/seed.ts
├── proxy.ts
├── next.config.ts
└── package.json
```

Entry points and ownership:

- `app/layout.tsx` installs `WMSUserProvider` and the global toast renderer.
- `app/wms/layout.tsx` wraps operational pages in `WMSSidebarLayout`.
- `proxy.ts` is the Next.js 16 request proxy and protects `/wms/**` and `/api/wms/**`.
- Every API route must still validate its own session and authorization. Do not treat the
  proxy as the only security boundary.
- `shared/lib/db/mongo.ts` owns the cached server-side Mongoose connection.
- `shared/lib/auth.ts` owns token signing, verification, cookie options, and session lookup.

---

## Commands

Run commands from `fr3sh-warehouse-webapp/`:

```bash
npm install
npm run dev
npm run build
npm run start
npm run seed
```

`npm run dev` uses Turbopack. Run WMS on a different port when the marketplace is also
running, for example:

```bash
PORT=3001 npm run dev
```

`npm run seed` writes to the configured database. Before running it, verify `MONGODB_URI`
points to the intended environment. Never run the seed command merely to test compilation.

There is no automated test command. At minimum, run `npm run build` after meaningful code
changes and manually exercise the affected route/page with an appropriate staff role.

---

## Environment Variables

Document names only. Never paste or commit values.

| Variable | Purpose | Notes |
|---|---|---|
| `MONGODB_URI` | MongoDB connection | Required; WMS and marketplace currently point at the same `farmers_republic` database |
| `GO_API_BASE_URL` | Canonical Go catalogue origin | Server-side only; required when canonical reads are enabled |
| `WMS_CANONICAL_CATALOGUE_READS` | Opt-in canonical SKU reads | Keep `0` until SKU mappings are approved and applied |
| `JWT_SECRET` | WMS JWT signing/verification | Required in production; code currently has an unsafe fallback string |
| `JWT_EXPIRES_IN` | JWT lifetime | Optional; default `8h` |
| `JWT_COOKIE_MAX_AGE` | Cookie lifetime in seconds | Optional; default `28800` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Required for uploads |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-available Supabase anon key | Required for uploads; bucket policy is the security boundary |
| `NEXT_PUBLIC_SUPABASE_WMS_BUCKET` | WMS upload bucket | Optional; default is defined in the Supabase helper |
| `NODE_ENV` | Controls secure-cookie behavior | Secure cookie is enabled in production |
| `PORT` | Next.js server port | Use `3001` when marketplace occupies `3000` |

Treat `.env` and `.env.example` as sensitive. If a live-looking credential is found in a
tracked example file, do not repeat it in code, logs, documentation, or chat. Flag it for
removal and rotation.

---

## Design System

Semantic color tokens are defined in `app/globals.css`. Use tokens instead of raw Tailwind
palette colors in new UI.

| Token | Intended use |
|---|---|
| `primary`, `primary-hover`, `primary-foreground` | Main FR3SH actions and navigation |
| `secondary`, `secondary-subtle`, `secondary-foreground` | Lime accent and badges |
| `surface`, `surface-card` | Page and card backgrounds |
| `foreground-heading`, `foreground-body`, `foreground-muted` | Text hierarchy |
| `brand` | Supporting brand green |
| `border`, `border-focus` | Borders and focus states |
| `status-warning`, `status-info`, `status-success`, `status-danger` and `-surface` variants | Operational state badges |

Preferred patterns:

```tsx
<section className="rounded-2xl border border-border bg-surface-card p-5">
  <h2 className="text-foreground-heading">Batch details</h2>
  <p className="text-foreground-muted">Traceability and expiry information</p>
</section>
```

- Use Lucide components for icons; do not use emoji as functional icons.
- Use `cx()` from `shared/lib/utils.ts` for conditional class names.
- Preserve desktop sidebar and responsive/mobile behavior in `WMSSidebarLayout`.
- Use the existing status token pattern rather than inventing new colors.
- Preserve the FR3SH dark emerald/lime identity; do not introduce orange as a brand color.

---

## Authentication and Authorization

The WMS JWT payload is:

```ts
interface WMSTokenPayload {
  id: string;
  email: string;
  role: string;
  name: string;
  warehouseId: string;
  warehouseCode: string;
}
```

The cookie is `wms_token`, httpOnly, same-site `lax`, path `/`, secure in production.
`WMSUserContext` keeps a non-authoritative UI copy under localStorage key `wms_user` and
rehydrates from `GET /api/wms/auth/me`. Never authorize using localStorage or client state.

Roles, with exact casing:

```text
Super Admin
Warehouse Admin
Warehouse Manager
Receiving Staff
QC Staff
Picker
Packer
Dispatcher
Inventory Auditor
Finance Viewer
```

Current route-level permissions:

| Operation | Allowed roles |
|---|---|
| Read operational WMS endpoints | Any authenticated WMS user unless a route says otherwise |
| Create/update warehouse | `Super Admin` |
| Create location | `Super Admin`, `Warehouse Admin`, `Warehouse Manager` |
| Create WMS product | Privileged roles declared in the route |
| Register WMS supplier | Privileged roles declared in the route |
| Submit stock adjustment | Roles declared in the adjustment route |
| Self-service registration | Eight non-admin operational roles; **public endpoint** |

When adding a write route:

```ts
const session = await getWMSSession();
if (!session) {
  return NextResponse.json(
    { success: false, message: "Unauthorized" },
    { status: 401 },
  );
}

if (!ALLOWED_ROLES.includes(session.role)) {
  return NextResponse.json(
    { success: false, message: "Insufficient permissions" },
    { status: 403 },
  );
}
```

Always scope records by `session.warehouseId`. Do not trust a client-supplied warehouse ID,
staff ID, role, or `performedBy` value. The public registration endpoint and fallback JWT
secret are existing security risks, not patterns to copy.

---

## API Conventions

All WMS APIs live under `/api/wms`. They use Next.js App Router route handlers and JSON.

Typical response shapes:

```ts
{ success: true, message?: string, data: value }
{ success: false, message: string }
```

List routes sometimes return `total`, `page`, and `limit` at the top level. Follow the
existing contract for an endpoint unless deliberately versioning it; do not silently change
the shape consumed by its page.

Current API inventory:

| Method(s) | Route | Responsibility |
|---|---|---|
| `POST` | `/api/wms/auth/register` | Create an operational staff account and session |
| `POST` | `/api/wms/auth/login` | Authenticate and set cookie |
| `POST` | `/api/wms/auth/logout` | Clear cookie |
| `GET` | `/api/wms/auth/me` | Rehydrate current user and warehouse |
| `GET` | `/api/wms/dashboard` | Warehouse counts and summaries |
| `GET`, `POST` | `/api/wms/inward` | List/create goods receipts |
| `GET`, `POST` | `/api/wms/quality-check` | QC list/stats and submission |
| `GET` | `/api/wms/inventory` | Inventory items with active batches |
| `GET` | `/api/wms/batches` | Filtered FEFO batch list |
| `GET`, `POST` | `/api/wms/locations` | Location hierarchy and creation |
| `GET`, `POST`, `PATCH` | `/api/wms/picking` | Pick-task lifecycle |
| `GET`, `POST` | `/api/wms/adjustments` | Stock-adjustment list/submission |
| `GET`, `POST` | `/api/wms/returns` | Return list/registration |
| `GET`, `POST` | `/api/wms/products` | WMS catalogue list/create; GET can adapt canonical Go SKUs when the explicit feature flag is enabled |
| `GET`, `POST` | `/api/wms/farmers` | Merged supplier list/create |
| `GET`, `POST`, `PATCH` | `/api/wms/warehouses` | Visible warehouses and Super Admin writes |

There are no packing, dispatch, putaway, report, cycle-count, alert-management, or staff
administration APIs. Add them intentionally rather than faking success in a page.

For new handlers:

1. Read and authorize the session first.
2. Connect with `await mongoDB()`.
3. Validate and normalize the complete request contract before writes.
4. Include `warehouseId: session.warehouseId` in queries and created records.
5. Use stable 400/401/403/404/409/422/500 semantics.
6. Never expose `passwordHash`, JWTs, credentials, or unnecessary PII.
7. Keep multi-record stock operations transactional or add explicit compensation.
8. Add an immutable `InventoryMovement` for every completed stock mutation.

---

## Database Models

All models use `models.Name ?? model<Name>(...)` so hot reload does not re-register them.
Keep model names, collection behavior, indexes, enums, and warehouse scoping stable.

| Model | Purpose | Important fields / state |
|---|---|---|
| `Warehouse` | Warehouse registry | `warehouseCode`, address/contact, capacity, `status`, `isActive` |
| `WarehouseUser` | Staff identity | email, password hash, exact role, `warehouseId`, `isActive` |
| `WarehouseLocation` | Zone→aisle→rack→shelf→bin tree | `code`, `type`, `parentId`, `zoneCode`, capacity |
| `WMSProductCatalog` | SKU master | SKU prefix/base/barcode, zone/category, storage, shelf life |
| `Farmer` / model `WMSSupplier` | WMS supplier registry | `farmerId` string, name, supplier type; explicit `wms_suppliers` collection |
| `InwardEntry` | Goods receipt | entry/batch IDs, supplier/product/qty, status, documents |
| `QualityCheck` | Inspection record | accepted/rejected quantities, result, measurements/photos |
| `InventoryBatch` | Traceable physical batch | SKU/farmer/dates/location and quantity buckets |
| `InventoryItem` | SKU-level summary | total/reserved/damaged/expired/returned/in-transit stock |
| `InventoryMovement` | Immutable stock ledger | type, SKU, batch, quantity, locations, reference, actor |
| `PickTask` | Warehouse picking | free-text order ID, items, assignee, status |
| `PackingTask` | Packing schema only | verification, packaging, weight, invoice URL, status |
| `Dispatch` | Dispatch schema only | courier, AWB, tracking, status |
| `Return` | Return receipt | order/product/reason/photos/action/refund/status |
| `StockAdjustment` | Quantity correction | before/after/difference, reason, approval state |
| `CycleCount` | Cycle count schema only | zone, schedule, lines, variance, status |
| `WarehouseAlert` | Alert schema only | type/severity/message/threshold/resolution |

Model names do not necessarily equal the plural collection names stated in the README;
Mongoose pluralization governs most collections. Check the model source before writing a
native MongoDB query. `WMSSupplier` is the notable explicit collection mapping.

### Status enums

```text
Warehouse:      Active | Inactive | Planned
InwardEntry:    QC Pending | Accepted | Partially Accepted | Rejected | Putaway
QualityCheck:   Accepted | Partially Accepted | Rejected | Lab Test Pending
InventoryBatch: Active | Near Expiry | Expired | In Transit | Consumed | Disposed
PickTask:       Pending Pick | Picking | Picked | Sent to Packing | Cancelled
PackingTask:    Pending Packing | Packing | Packed | Ready for Dispatch | Cancelled
Dispatch:       Ready for Dispatch | Dispatched | In Transit | Out for Delivery |
                Delivered | Failed | Returned
Return:         Pending Inspection | Inspected | Restocked | Disposed |
                Farmer Claimed | Completed
Adjustment:     Pending | Approved | Rejected
CycleCount:     Scheduled | In Progress | Completed | Pending Approval
```

Use exact case and spacing. Do not reuse the marketplace’s lowercase snake-case order
statuses without an explicit mapping.

---

## Core Business Flows

### Inbound

`POST /api/wms/inward` creates an `InwardEntry` with status `QC Pending` and an inward
`InventoryMovement`. IDs are generated in the route. The form uses the merged suppliers
endpoint and WMS product catalogue.

### Quality check

`POST /api/wms/quality-check` creates a `QualityCheck`, updates the inward status, and, for
non-rejected stock, creates an active `InventoryBatch` plus a movement. These are multiple
writes without a transaction. If modifying this flow, prevent partial completion and ensure
accepted plus rejected quantities do not exceed received quantity.

`Lab Test Pending` has no completion route. `Putaway` exists as an inward status but no
dedicated API sets it or assigns a bin.

### Inventory and FEFO

Batch lists sort by `expiryDate` ascending. Treat that as the existing FEFO convention.
`InventoryBatch` contains quantity buckets; `InventoryItem` is a separate SKU summary.
Current code does not guarantee that these two representations reconcile. Avoid adding a
third stock calculation.

### Picking

`POST /api/wms/picking` creates a manual task. `PATCH` moves it through picking states. On
`Picked`, current code increments `InventoryBatch.quantityReserved` and writes a pick
movement. Review idempotency and available-quantity bounds before changing this behavior;
repeating the transition can duplicate stock effects.

### Adjustments

An adjustment with absolute difference at or below the route threshold is auto-approved
and applied to a batch with an adjustment movement. Larger changes remain `Pending`.
There is no approval/rejection endpoint, so do not claim that pending adjustments are
actionable until that route exists.

### Returns

Return registration creates a `Return` in `Pending Inspection` and a movement. There is no
API to inspect, restock, dispose, create a farmer claim, or process a refund. The existing
movement quantity is fixed by the route rather than a fully modeled returned quantity; be
careful when extending it.

---

## Supabase Uploads

Use `uploadWMSFile()` and the public URL helper from `shared/lib/supabase/client.ts` rather
than instantiating another client. Existing intended folders are:

```text
wms-uploads/inward/
wms-uploads/qc/
wms-uploads/returns/
```

The client uses a public anon key. Do not assume that hiding UI controls protects a bucket;
verify Supabase Storage policies. Store only returned paths/URLs in MongoDB, never file
contents or credentials.

---

## Client Data and UI Patterns

- WMS pages currently use direct same-origin `fetch`; there is no shared API client.
- Send `credentials: "include"` when a call may otherwise omit cookies.
- Check both `res.ok` and `payload.success` before treating a request as successful.
- Show a toast for actionable success/failure, and preserve a useful empty state.
- Do not seed operational-looking fake rows in a live screen to mask an API failure.
- UI-only arrays in packing, dispatch, reports, or settings are mock/static display data,
  not persisted records.
- Use `useWMSUser()` for presentation and navigation only. Authorization belongs server-side.
- Keep `warehouseId` implicit from the server session; do not expose a warehouse selector
  that causes unvalidated cross-warehouse writes.

Example fetch pattern:

```ts
const res = await fetch("/api/wms/batches?status=Active&page=1&limit=30", {
  credentials: "include",
});
const payload = await res.json();
if (!res.ok || !payload.success) {
  throw new Error(payload.message ?? "Failed to load batches");
}
setBatches(payload.data ?? []);
```

---

## Known Gaps and Risks

1. **Partial catalogue bridge only.** The product route has a disabled-by-default Go SKU read adapter; orders and inventory remain separate.
2. **Public staff registration.** Operational roles can self-register; do not broaden it.
3. **Fallback JWT secret.** Production must fail closed if `JWT_SECRET` is absent.
4. **No request schema library.** Types and numeric/date bounds are checked inconsistently.
5. **No MongoDB transactions.** QC, inward, picking, adjustments, and returns can partially
   write.
6. **Weak idempotency.** Timestamp/count-derived IDs and repeated status transitions can
   collide or duplicate movements.
7. **Incomplete warehouse scoping.** Review every new query and aggregation for
   `session.warehouseId`.
8. **No packing/dispatch APIs.** Their pages must not be treated as persisted workflows.
9. **No putaway API.** Accepted batches are not formally placed through a state transition.
10. **Pending large adjustments cannot be approved.** The workflow stops at `Pending`.
11. **Returns cannot progress or refund.** Registration is the only persisted step.
12. **No test suite.** Build success is not proof of business correctness.
13. **Shared database coupling.** Native reads of marketplace collections can break when
    the other project changes schema.
14. **Env hygiene.** Never repeat credentials from local/example env files.

---

## Rules for AI Agents

1. Read the affected route, page, model, and shared helper before editing.
2. For cross-application behavior, also read
   `../cross-platform-assets/projects-context.md` and
   `../cross-platform-assets/projects-api.md` plus the affected marketplace/mobile source.
3. Preserve user changes and avoid unrelated refactors.
4. Use semantic design tokens and existing components/patterns.
5. Enforce auth, exact roles, ownership, and warehouse scope on the server.
6. Never trust client-supplied IDs, roles, prices, quantities, status, or warehouse scope.
7. Do not expose secret values, password hashes, full JWTs, or private customer data.
8. Preserve immutable inventory movement history; compensate with new ledger entries rather
   than editing historical movements.
9. Prefer atomic conditional updates and transactions for inventory-affecting workflows.
10. Add explicit state-transition validation and idempotency to new lifecycle APIs.
11. Do not call UI-only features “implemented.” Clearly label mock/static/incomplete work.
12. Keep API response compatibility with current pages, or update all consumers together.
13. Update this file whenever routes, models, roles, environment names, or major workflows
    change.
14. Run `npm run build` before handoff. Report any verification that could not be run.

---

## Adding a New WMS Feature

Use this checklist:

1. Identify the domain owner and whether the feature crosses into `farmers-republic`.
2. Define request, response, status transition, authorization, and warehouse scope.
3. Add or update the Mongoose model with required indexes and exact enums.
4. Implement the API route under `/api/wms`; avoid embedding business rules only in a page.
5. Use a transaction for coupled writes when the deployment supports it.
6. Create an `InventoryMovement` for a completed stock change.
7. Make retries safe with an idempotency key or conditional transition.
8. Wire the page with loading, error, empty, and success states.
9. Verify with multiple roles and at least two warehouses where applicable.
10. Run a production build and update `README.md`, this file, and common-root API/context
    references if the contract or architecture changed.

---

## Source-of-Truth Files

When documentation is ambiguous, inspect these first:

- Routes and contracts: `app/api/wms/**/route.ts`
- Authentication: `shared/lib/auth.ts`, `proxy.ts`, `shared/context/WMSUserContext.tsx`
- Database schemas: `shared/models/*.ts`
- Database connection: `shared/lib/db/mongo.ts`
- Storage: `shared/lib/supabase/client.ts`
- IDs/date helpers: `shared/lib/utils.ts`
- Navigation and role presentation: `shared/components/WMSSidebarLayout.tsx`
- Operational consumers: `app/wms/**/page.tsx`
- Initial data: `scripts/seed.ts`
- Cross-project API behavior: `../cross-platform-assets/projects-api.md`
- Complete ecosystem context: `../cross-platform-assets/projects-context.md`

This project is an internal operational system handling inventory and staff access. Favor
correctness, traceability, least privilege, and recoverable workflows over optimistic UI or
convenience shortcuts.
