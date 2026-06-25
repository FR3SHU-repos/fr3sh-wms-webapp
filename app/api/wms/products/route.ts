import { NextRequest, NextResponse } from "next/server";
import { mongoDB } from "@/shared/lib/db/mongo";
import { getWMSSession } from "@/shared/lib/auth";
import { WMSProductCatalog } from "@/shared/models/WMSProductCatalog";

export async function GET(req: NextRequest) {
  const session = await getWMSSession();
  if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  await mongoDB();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const zone = searchParams.get("zone");
  const q = searchParams.get("q");
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 50);

  const filter: Record<string, unknown> = { isActive: true };
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
  const skuBase = `FR3SH-${zoneCode}-`;

  // Find the highest existing sequence number in this zone
  const lastProduct = await WMSProductCatalog.findOne({ zoneCode })
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
  const barcodeSkuCode = `${zoneCode}${String(nextSeq).padStart(7, "0")}`;

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
    isActive: true,
  });

  return NextResponse.json({ success: true, message: "Product created", data: product }, { status: 201 });
}
