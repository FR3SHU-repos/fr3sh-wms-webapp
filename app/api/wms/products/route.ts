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
    ];
  }

  const [products, total] = await Promise.all([
    WMSProductCatalog.find(filter).skip((page - 1) * limit).limit(limit).lean(),
    WMSProductCatalog.countDocuments(filter),
  ]);

  return NextResponse.json({ success: true, data: products, total, page, limit });
}
