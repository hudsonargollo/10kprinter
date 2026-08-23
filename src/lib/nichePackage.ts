export interface NicheDef {
  key: string;
  label: string;
  queryVariants: string[];
}

/**
 * Chain-prone categories (hotels, etc.) are deliberately excluded — a global
 * chain's franchisee doesn't control the corporate site, so a redesign pitch
 * has nowhere to land (confirmed the hard way auditing Marriott/ibis leads).
 */
export const NICHE_PACKAGE: NicheDef[] = [
  { key: "dental", label: "Dental Clinics", queryVariants: ["dentists", "dental clinics", "dental offices"] },
  { key: "real-estate", label: "Real Estate Agencies", queryVariants: ["real estate agencies", "realtors", "property agents"] },
  { key: "law", label: "Law Firms", queryVariants: ["law firms", "attorneys", "legal services"] },
  { key: "restaurants", label: "Restaurants", queryVariants: ["restaurants", "family restaurants", "fine dining restaurants"] },
  { key: "gyms", label: "Gyms", queryVariants: ["gyms", "fitness centers", "crossfit"] },
  { key: "auto-repair", label: "Auto Repair Shops", queryVariants: ["auto repair shops", "car mechanics", "auto service centers"] },
  { key: "beauty", label: "Beauty Salons", queryVariants: ["beauty salons", "hair salons", "spas"] },
  { key: "contractors", label: "General Contractors", queryVariants: ["general contractors", "construction companies", "home renovation contractors"] },
];
