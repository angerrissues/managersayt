/**
 * Social network entry for a blogger.
 * Each key in `Blogger.socials` maps to one of these objects.
 */
export type SocialEntry = {
  url?: string;
  followers?: string;
  /** TikTok / general video views */
  views?: string;
  /** YouTube horizontal video views */
  horizontalViews?: string;
  /** YouTube Shorts / vertical video views */
  verticalViews?: string;
  /** Instagram Reels views */
  reelsViews?: string;
  /** Instagram Stories views */
  storiesViews?: string;
  /** Telegram daily views */
  dailyViews?: string;
  /** Telegram monthly views */
  monthlyViews?: string;
  /** Cloudinary URLs of statistics screenshots / videos */
  statsMedia?: string[];
  /** External RKN registration link */
  rknLink?: string;
};

/**
 * Key-value map of social networks.
 * Keys are in the form `<platform>_<index>`, e.g. `tiktok_1`, `youtube_1`.
 */
export type Socials = Record<string, SocialEntry>;

/** Extended description block shown in the blogger card modal. */
export type BloggerDetails = {
  title?: string;
  positioning?: string;
  about?: string;
  audience?: string;
  brands?: string;
  format?: string;
};

/** Full blogger entity as stored in the database and used in the UI. */
export type Blogger = {
  id: string;
  name: string;
  avatarPath: string;
  geo: string;
  rknStatus: boolean;
  contact: string;
  socials: Socials;
  details?: BloggerDetails;
};
