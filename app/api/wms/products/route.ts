import { NextRequest, NextResponse } from "next/server";
import { mongoDB } from "@/shared/lib/db/mongo";
import { getWMSSession } from "@/shared/lib/auth";
import { WMSProductCatalog } from "@/shared/models/WMSProductCatalog";

export async function GET(req: NextRequest) {
  const session = await getWMSSession();
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const zone = searchParams.get("zone");
  const q = searchParams.get("q");
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 50);

  if (process.env.WMS_CANONICAL_CATALOGUE_READS !== "0") {
    const base = process.env.GO_API_BASE_URL?.trim().replace(/\/+$/, "").replace(/\/api\/v1$/i, "");
    if (!base) return NextResponse.json({ success: false, message: "Canonical catalogue is not configured" }, { status: 503 });
    const response = await fetch(`${base}/api/v1/skus?q=${encodeURIComponent(q ?? "")}`, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    const payload = await response.json();
    if (!response.ok || payload?.success !== true) return NextResponse.json({ success: false, message: payload?.message ?? "Canonical catalogue unavailable" }, { status: 502 });
    const all = (payload.data?.items ?? []).map((sku: any) => ({
      _id: sku.id, canonicalSkuId: sku.id, canonicalProductId: sku.productId,
      skuPrefix: sku.code, barcodeSkuCode: sku.barcode, productName: sku.productName ?? sku.code,
      defaultUnit: sku.unit, minimumOrderQty: sku.packQuantity, isActive: sku.status === "active",
      legacyRefs: sku.legacyRefs ?? [], warehouseId: session.warehouseId,
    }));
    const filtered = all.filter((item: any) => !category || item.category === category).filter((item: any) => !zone || item.zoneCode === zone);
    const start = Math.max(0, (page - 1) * limit);
    return NextResponse.json({ success: true, data: filtered.slice(start, start + limit), total: filtered.length, page, limit, source: "canonical-go" });
  }

  await mongoDB();

  const filter: Record<string, unknown> = { isActive: true, warehouseId: session.warehouseId };
  if (category) filter.category = category;
  if (zone) filter.zoneCode = zone;
  if (q) {
    filter.$or = [
      { productName: { $regex: q, $options: "i" } },
      { skuPrefix: { $regex: q, $options: "i" } },
      { barcodeSkuCode: { $regex: q, $options: "i" } },
      { category: { $regex: q, $options: "i" } },
      { subcategory: { $regex: q, $options: "i" } },
    ];
  }

  const [products, total] = await Promise.all([
    WMSProductCatalog.find(filter)
      .sort({ zoneCode: 1, skuPrefix: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    WMSProductCatalog.countDocuments(filter),
  ]);

  return NextResponse.json({ success: true, data: products, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await getWMSSession();
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const allowedRoles = ["Super Admin", "Warehouse Admin", "Warehouse Manager"];
  if (!allowedRoles.includes(session.role)) {
    return NextResponse.json({ success: false, message: "Insufficient permissions" }, { status: 403 });
  }

  await mongoDB();
  const body = await req.json();

  const zoneCode = (body.zoneCode as string).toUpperCase();
  const whCode = session.warehouseCode;

  // SKU format: FR3SH-{WHCODE}-{ZONE}-{SEQ}
  const skuBase = `FR3SH-${whCode}-${zoneCode}-`;

  // Find the highest existing sequence in this zone + warehouse
  const lastProduct = await WMSProductCatalog.findOne({ zoneCode, warehouseId: session.warehouseId })
    .sort({ skuPrefix: -1 })
    .select("skuPrefix")
    .lean();

  let nextSeq = 1;
  if (lastProduct && !Array.isArray(lastProduct)) {
    const rawSku = (lastProduct as unknown as { skuPrefix: string }).skuPrefix ?? "";
    const parts = rawSku.split("-");
    const lastNum = parseInt(parts[parts.length - 1] ?? "0", 10);
    if (!isNaN(lastNum)) nextSeq = lastNum + 1;
  }

  const skuPrefix = `${skuBase}${String(nextSeq).padStart(4, "0")}`;
  const barcodeSkuCode = `${whCode}${zoneCode}${String(nextSeq).padStart(6, "0")}`;

  const product = await WMSProductCatalog.create({
    skuPrefix,
    skuBase,
    zoneCode,
    category: body.category,
    subcategory: body.subcategory ?? body.category,
    productName: body.productName,
    grade: body.grade ?? "Standard",
    form: body.form ?? "Whole",
    defaultUnit: body.defaultUnit ?? "kg",
    storageType: body.storageType ?? "Ambient",
    shelfLifeDays: Number(body.shelfLifeDays ?? 365),
    hsnCode: body.hsnCode,
    gstPercent: body.gstPercent,
    fssaiRequired: body.fssaiRequired !== false,
    organicCertRequired: body.organicCertRequired !== false,
    seasonal: body.seasonal ?? false,
    mainSeason: body.mainSeason ?? "Year-round",
    stateAvailability: body.stateAvailability,
    supplierType: body.supplierType ?? "Farmer/FPO",
    barcodeSkuCode,
    minimumOrderQty: Number(body.minimumOrderQty ?? 1),
    recommendedPackaging: body.recommendedPackaging,
    qualityChecks: body.qualityChecks,
    warehouseId: session.warehouseId,
    isActive: true,
  });

  return NextResponse.json({ success: true, message: "Product created", data: product }, { status: 201 });
}
