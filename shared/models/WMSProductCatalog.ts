import { Schema, Document, model, models } from "mongoose";

export interface IWMSProductCatalog extends Document {
  skuPrefix: string;
  zoneCode: string;
  category: string;
  subcategory: string;
  productName: string;
  grade: string;
  form: string;
  defaultUnit: string;
  storageType: string;
  shelfLifeDays: number;
  hsnCode?: string;
  gstPercent?: string;
  fssaiRequired: boolean;
  organicCertRequired: boolean;
  seasonal: boolean;
  mainSeason?: string;
  stateAvailability?: string;
  supplierType: string;
  barcodeSkuCode: string;
  minimumOrderQty: number;
  recommendedPackaging?: string;
  qualityChecks?: string;
  listingNotes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WMSProductCatalogSchema = new Schema<IWMSProductCatalog>(
  {
    skuPrefix: { type: String, required: true },
    zoneCode: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    productName: { type: String, required: true },
    grade: String,
    form: String,
    defaultUnit: { type: String, required: true },
    storageType: { type: String, default: "Ambient" },
    shelfLifeDays: { type: Number, default: 365 },
    hsnCode: String,
    gstPercent: String,
    fssaiRequired: { type: Boolean, default: true },
    organicCertRequired: { type: Boolean, default: true },
    seasonal: { type: Boolean, default: false },
    mainSeason: String,
    stateAvailability: String,
    supplierType: String,
    barcodeSkuCode: { type: String, required: true },
    minimumOrderQty: { type: Number, default: 1 },
    recommendedPackaging: String,
    qualityChecks: String,
    listingNotes: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

WMSProductCatalogSchema.index({ skuPrefix: 1 });
WMSProductCatalogSchema.index({ zoneCode: 1 });
WMSProductCatalogSchema.index({ category: 1 });
WMSProductCatalogSchema.index({ barcodeSkuCode: 1 });

export const WMSProductCatalog =
  models.WMSProductCatalog ??
  model<IWMSProductCatalog>("WMSProductCatalog", WMSProductCatalogSchema);
