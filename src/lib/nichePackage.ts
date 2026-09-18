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
  { key: "dental", label: "Dental Clinics", queryVariants: ["dentists", "dental clinics", "dental offices", "odontologia", "dentistas"] },
  { key: "real-estate", label: "Real Estate Agencies", queryVariants: ["real estate agencies", "realtors", "property agents", "inmobiliarias", "imobiliarias"] },
  { key: "law", label: "Law Firms", queryVariants: ["law firms", "attorneys", "legal services", "abogados", "advogados"] },
  { key: "restaurants", label: "Restaurants & Gastronomy", queryVariants: ["restaurants", "family restaurants", "fine dining restaurants", "restaurantes", "gastronomia"] },
  { key: "gyms", label: "Gyms & Fitness Centers", queryVariants: ["gyms", "fitness centers", "crossfit", "gimnasios", "academias"] },
  { key: "auto-repair", label: "Auto Repair Shops", queryVariants: ["auto repair shops", "car mechanics", "auto service centers", "talleres mecanicos", "oficinas mecanicas"] },
  { key: "beauty", label: "Beauty Salons & Spas", queryVariants: ["beauty salons", "hair salons", "spas", "salones de belleza", "salao de beleza"] },
  { key: "contractors", label: "General Contractors", queryVariants: ["general contractors", "construction companies", "home renovation contractors", "constructoras", "empreiteiras"] },
  { key: "medical", label: "Medical & Health Clinics", queryVariants: ["medical clinics", "private doctors", "health centers", "clinicas medicas", "consultorios medicos"] },
  { key: "accounting", label: "Accounting & Tax Firms", queryVariants: ["accounting firms", "cpa", "tax advisors", "estudios contables", "contabilidade"] },
  { key: "veterinary", label: "Veterinary & Pet Care", queryVariants: ["veterinary clinics", "animal hospitals", "vet care", "veterinarias", "clinicas veterinarias"] },
  { key: "hvac", label: "HVAC & Air Conditioning", queryVariants: ["hvac services", "air conditioning repair", "heating contractors", "aire acondicionado", "climatizacao"] },
  { key: "plumbing", label: "Plumbing & Drain Services", queryVariants: ["plumbing services", "emergency plumbers", "drain cleaning", "plomeria fontaneria", "encanadores"] },
  { key: "roofing", label: "Roofing & Siding", queryVariants: ["roofing contractors", "roof repair", "siding contractors", "techos y cubiertas", "telhados e reformas"] },
  { key: "solar", label: "Solar & Clean Energy", queryVariants: ["solar energy contractors", "solar panel installers", "clean energy", "energia solar", "instaladores solares"] },
  { key: "landscaping", label: "Landscaping & Lawn Care", queryVariants: ["landscaping companies", "lawn care services", "tree services", "jardineria y paisajismo", "paisagismo e jardinagem"] },
  { key: "architecture", label: "Architecture & Interior Design", queryVariants: ["architecture firms", "interior designers", "architects", "estudios de arquitectura", "arquitetura e interiores"] },
  { key: "cleaning", label: "Cleaning & Janitorial", queryVariants: ["commercial cleaning services", "house cleaning companies", "maid services", "empresas de limpieza", "servicos de limpeza"] },
  { key: "event-planning", label: "Event Planning & Venues", queryVariants: ["event planners", "wedding venues", "party planners", "organizacion de eventos", "espacos para eventos"] },
  { key: "it-services", label: "IT Support & Managed Services", queryVariants: ["it support companies", "managed it services", "computer repair", "soporte ti y tecnologia", "suporte de ti e informatica"] },
  { key: "photography", label: "Photography & Video Studios", queryVariants: ["photography studios", "videographers", "commercial photo studios", "estudios de fotografia", "estudio fotografico"] },
  { key: "pet-grooming", label: "Pet Grooming & Boarding", queryVariants: ["pet grooming", "dog daycares", "pet boarding", "peluqueria canina", "banho e tosa pet"] },
  { key: "auto-dealers", label: "Car Dealerships & Detailing", queryVariants: ["car dealerships", "auto detailing", "used cars", "concesionarias de autos", "estetica automotiva"] },
  { key: "security", label: "Security & Smart Home", queryVariants: ["security systems", "smart home automation", "locksmiths", "camaras y seguridad privada", "seguranca eletronica"] },
];
