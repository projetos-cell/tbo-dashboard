// ---------------------------------------------------------------------------
// Órulo API v2 — TypeScript Types (from OpenAPI spec)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface OruloTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  created_at: number;
}

// ---------------------------------------------------------------------------
// Address
// ---------------------------------------------------------------------------

export interface OruloAddress {
  street_type: string;
  street: string;
  number: number;
  area: string;
  city: string;
  state: string;
  zip_code: string;
  latitude: number;
  longitude: number;
}

// ---------------------------------------------------------------------------
// Developer / Publisher / Partner
// ---------------------------------------------------------------------------

export interface OruloDeveloper {
  id: string;
  name: string;
}

export interface OruloPublisher {
  id: string;
  name: string;
}

export interface OruloPartner {
  id: string;
  name: string;
  type: "developer" | "broker" | "commercial_partner";
  updated_at: string;
  logo: string;
  phone?: string;
  email?: string;
  webpage?: string;
}

// ---------------------------------------------------------------------------
// Opportunity
// ---------------------------------------------------------------------------

export interface OruloOpportunityBase {
  broker: boolean;
  client: boolean;
  client_max_discount?: number;
  exchange_units: boolean;
  tenanted_investment_property: boolean;
  social_housing_program: boolean;
  featured_building?: boolean;
}

export interface OruloOpportunity extends OruloOpportunityBase {
  broker_description?: string;
  broker_expiration_date?: string;
  client_description?: string;
  client_expiration_date?: string;
}

// ---------------------------------------------------------------------------
// Image / Floor Plan / File / Video
// ---------------------------------------------------------------------------

export interface OruloDefaultImage {
  id: string;
  description: string;
  "200x140"?: string;
  "520x280"?: string;
  "1024x1024"?: string;
  "2280x1800"?: string;
}

export interface OruloImageAssociation {
  typologies?: number[];
  building_units?: string[];
}

export interface OruloImageDetail {
  id: string;
  description: string;
  type?: string;
  associations?: OruloImageAssociation[];
  "200x140"?: string;
  "520x280"?: string;
  "1024x1024"?: string;
  "2280x1800"?: string;
}

export interface OruloFloorPlanDetail {
  id: string;
  description: string;
  type?: string;
  associations?: OruloImageAssociation[];
  "200x140"?: string;
  "520x280"?: string;
  "1024x1024"?: string;
  "2280x1800"?: string;
}

export interface OruloFile {
  id: string;
  name: string;
  type: string;
}

export interface OruloFileUrl extends OruloFile {
  url: string;
}

export interface OruloVideo {
  id: string;
  url: string;
  source: string;
  description: string;
}

// ---------------------------------------------------------------------------
// Feature
// ---------------------------------------------------------------------------

export interface OruloFeatureAssociation {
  units?: string[];
  typologies?: number[];
}

export interface OruloBuildingFeature {
  name: string;
}

export interface OruloUnitFeature {
  name: string;
  associations?: OruloFeatureAssociation;
}

// ---------------------------------------------------------------------------
// Typology
// ---------------------------------------------------------------------------

export interface OruloTypology {
  id: string;
  type: string;
  original_price: number;
  discount_price: number;
  private_area: number;
  total_area: number;
  bedrooms: number;
  bathrooms: number;
  suites: number;
  parking: number;
  solar_position?: string;
  total_units: number;
  condominium_value?: number;
  urban_land_tax?: number;
  rental_price?: number;
  stock: number;
  reference?: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Building Unit
// ---------------------------------------------------------------------------

export interface OruloBuildingUnit {
  reference: string;
  section?: string;
  floor?: number;
  unit_end?: number;
  price: number;
  private_area: number;
  available: boolean;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Building (list item)
// ---------------------------------------------------------------------------

export interface OruloBuildingListItem {
  id: string;
  name: string;
  status: string;
  stage: string;
  developer: OruloDeveloper;
  publisher: OruloPublisher;
  address: OruloAddress;
  min_price: number;
  price_per_private_square_meter: number;
  min_bathrooms: number;
  max_bathrooms: number;
  min_area: number;
  max_area: number;
  min_bedrooms: number;
  max_bedrooms: number;
  min_suites: number;
  max_suites: number;
  number_of_floors?: number;
  number_of_towers?: number;
  apts_per_floor?: number;
  min_parking: number;
  max_parking: number;
  min_rental_price?: number;
  max_rental_price?: number;
  min_condominium_value?: number;
  min_condominium_ref?: string;
  description: string;
  finality: "Comercial" | "Misto" | "Residencial";
  opportunity: OruloOpportunityBase;
  default_image: OruloDefaultImage;
  features?: string[];
  building_features?: OruloBuildingFeature[];
  unit_features?: OruloUnitFeature[];
  stock: number;
  orulo_url: string;
  updated_at: string;
  building_permit?: string;
  portfolio?: string[];
}

// ---------------------------------------------------------------------------
// Building (detail)
// ---------------------------------------------------------------------------

export interface OruloBuilding extends OruloBuildingListItem {
  sharing_url?: string;
  commercial_contacts?: OruloCommercialContact[];
  created_at: string;
  opening_date?: string;
  launch_date?: string;
  total_units: number;
  type: "Vertical" | "Horizontal";
  total_area: number;
  floor_area: number;
  min_urban_land_tax_value?: number;
  min_urban_land_tax_ref?: string;
  opportunity: OruloOpportunity;
  mockups?: Array<{ url: string; enabled_availabilities: boolean }>;
  typologies: OruloTypology[];
  images: OruloImageDetail[];
  floor_plans: OruloFloorPlanDetail[];
  files?: OruloFile[];
  videos?: OruloVideo[];
  webpage?: string;
  virtual_tour?: string;
  last_updated_pricetable?: string;
  payment_conditions?: string[];
}

// ---------------------------------------------------------------------------
// Commercial Contact
// ---------------------------------------------------------------------------

export interface OruloCommercialContact {
  id: string;
  partner: { id: string; name: string };
  name: string;
  rating: number;
  total_ratings: number;
  broker_commission: number;
  real_estate_agency_commission: number;
}

export interface OruloCommercialContactInfo {
  id: string;
  name: string;
  emails: string[];
  phones: string[];
  whatsapps: string[];
  webcontact?: string;
}

// ---------------------------------------------------------------------------
// Paginated Responses
// ---------------------------------------------------------------------------

export interface OruloBuildingListResponse {
  buildings: OruloBuildingListItem[];
  total: number;
  page: number;
  total_pages: number;
  results_limit_exceeded: boolean;
}

export interface OruloActiveBuildingIdsResponse {
  buildings: Array<{ id: string; updated_at: string }>;
  total: number;
  page: number;
  total_pages: number;
}

export interface OruloRemovedBuildingIdsResponse {
  buildings: Array<{ id: string; updated_at: string; reason: string }>;
  total: number;
  page: number;
  total_pages: number;
}

export interface OruloPartnerListResponse {
  partners: OruloPartner[];
  total: number;
  page: number;
  total_pages: number;
}

export interface OruloTypologyListResponse {
  typologies: OruloTypology[];
}

export interface OruloImageListResponse {
  images: OruloImageDetail[];
}

export interface OruloFloorPlanListResponse {
  floor_plans: OruloFloorPlanDetail[];
}

export interface OruloBuildingUnitListResponse {
  units: OruloBuildingUnit[];
}

// ---------------------------------------------------------------------------
// Address Lists
// ---------------------------------------------------------------------------

export interface OruloStateListResponse {
  states: string[];
}

export interface OruloCityListResponse {
  cities: string[];
}

export interface OruloAreaListResponse {
  areas: string[];
}

// ---------------------------------------------------------------------------
// Building Name Search
// ---------------------------------------------------------------------------

export interface OruloBuildingNameItem {
  id: string;
  name: string;
  developer: OruloDeveloper;
  publisher: OruloPublisher;
}

export interface OruloBuildingNameListResponse {
  buildings: OruloBuildingNameItem[];
}

// ---------------------------------------------------------------------------
// Features List
// ---------------------------------------------------------------------------

export interface OruloFeaturesListResponse {
  building_features: Array<{
    feature: string;
    name: string;
    finality: string[];
  }>;
  unit_features: Array<{
    feature: string;
    name: string;
    finality: string[];
  }>;
}

// ---------------------------------------------------------------------------
// Building Types
// ---------------------------------------------------------------------------

export interface OruloBuildingTypesResponse {
  commercial: Record<string, string>;
  residential: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Application Config
// ---------------------------------------------------------------------------

export interface OruloApplicationConfig {
  name: string;
  callback_url: string;
  active: boolean;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Filters (query params for /buildings)
// ---------------------------------------------------------------------------

export interface OruloBuildingFilters {
  state?: string;
  city?: string;
  area?: string[];
  bedrooms?: string[];
  suites?: string[];
  parking?: string[];
  min_price?: number;
  max_price?: number;
  min_private_area?: number;
  max_private_area?: number;
  min_price_per_private_square_meter?: number;
  max_price_per_private_square_meter?: number;
  type?: string[];
  status?: Array<"under_construction" | "ready" | "used">;
  finality?: Array<"commercial" | "residential">;
  commercial_status?: Array<"for_sale" | "for_rent">;
  opportunity?: Array<"client" | "broker" | "exchange_units">;
  portfolio?: Array<"new_development" | "exchange" | "exclusivity">;
  developer_id?: string;
  publisher_id?: string;
  commercial_partner_id?: string;
  building_ids?: string[];
  updated_after?: string;
  include?: Array<"not_available">;
  // Ordering
  price_order?: "asc" | "desc";
  area_order?: "asc" | "desc";
  building_id_order?: "asc" | "desc";
  relevancy_order?: "asc" | "desc";
  last_updated_date_order?: "asc" | "desc";
  launch_date_order?: "asc" | "desc";
  price_per_private_square_meter_order?: "asc" | "desc";
  // Pagination
  results_per_page?: number;
  page?: number;
}
