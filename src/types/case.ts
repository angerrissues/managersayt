/** Full case entity as stored in the database and used in the UI. */
export type Case = {
  id: string;
  brand: string;
  lineup: string;
  agency: string;
  description?: string;
  platforms: string[];
  bloggers: string[];
  coverImage?: string;
  removeWhiteBg?: boolean;
  videos: string[];
  parentId?: string | null;
};
