import type { ModelRow, ModelInsert, ModelUpdate } from './models';
import type { NewsItemRow, NewsItemInsert, NewsItemUpdate } from './news';

export type { Json } from './models';
export * from './models';
export * from './news';

export type Database = {
  public: {
    Tables: {
      models: {
        Row: ModelRow;
        Insert: ModelInsert;
        Update: ModelUpdate;
        Relationships: [];
      };
      news_items: {
        Row: NewsItemRow;
        Insert: NewsItemInsert;
        Update: NewsItemUpdate;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
