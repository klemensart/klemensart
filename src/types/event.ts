export type EventRow = {
  id: string;
  title: string;
  description: string | null;
  event_type: string | null;
  venue: string | null;
  event_date: string | null;
  is_klemens_event: boolean;
  source_url: string | null;
  /* Fields below may not be selected in every query */
  ai_comment?: string | null;
  address?: string | null;
  source_name?: string | null;
  price_info?: string | null;
  image_url?: string | null;
  end_date?: string | null;
  registration_enabled?: boolean;
  status?: string;
};
