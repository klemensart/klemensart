import type { PersonSummary } from "./people";

/** Pazaryeri etkinliği — tam şema */
export type MarketplaceEvent = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  short_description: string | null;
  category: string;
  city: string;
  district: string | null;
  venue_name: string | null;
  venue_address: string | null;
  organizer_name: string;
  organizer_url: string | null;
  organizer_phone: string | null;
  organizer_email: string | null;
  organizer_logo_url: string | null;
  price: number;
  price_options: { label: string; price: number; note?: string }[] | null;
  currency: string;
  event_date: string | null;
  end_date: string | null;
  event_time_note: string | null;
  duration_note: string | null;
  recurring: boolean;
  recurring_note: string | null;
  image_url: string | null;
  gallery_urls: string[] | null;
  max_participants: number | null;
  is_featured: boolean;
  is_klemens: boolean;
  detail_slug: string | null;
  tier?: "klemens" | "kulup" | "network";
  /* FK — people tablosuna */
  host_id?: string | null;
  host?: PersonSummary | null;
};

/** Listeleme sayfası için hafif etkinlik tipi */
export type MarketplaceEventCard = Pick<
  MarketplaceEvent,
  | "id"
  | "slug"
  | "title"
  | "category"
  | "city"
  | "district"
  | "price"
  | "image_url"
  | "event_date"
  | "end_date"
  | "is_featured"
  | "is_klemens"
  | "detail_slug"
  | "duration_note"
  | "organizer_name"
  | "organizer_logo_url"
  | "short_description"
  | "venue_name"
  | "venue_address"
  | "organizer_phone"
  | "organizer_email"
  | "organizer_url"
  | "host_id"
  | "host"
>;
