
export interface WikiPage {
  id: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  favorited?: boolean;
}

export interface WikiPageInput {
  title: string;
  description?: string;
  tags?: string[];
}
