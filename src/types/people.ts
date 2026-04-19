/** Kişi profili — yazar ve/veya atölye düzenleyicisi */
export type Person = {
  id: string;
  slug: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  short_bio: string | null;
  expertise: string[];
  email: string | null;
  instagram: string | null;
  twitter: string | null;
  linkedin: string | null;
  website: string | null;
  is_author: boolean;
  is_host: boolean;
  is_verified: boolean;
  metadata: Record<string, any>;
};

/** Supabase join sorgularında dönen minimal kişi bilgisi */
export type PersonSummary = Pick<
  Person,
  "id" | "slug" | "name" | "avatar_url" | "short_bio" | "instagram" | "expertise"
>;
