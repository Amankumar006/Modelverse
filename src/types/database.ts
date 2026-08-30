import type { ModelRow, ModelInsert, ModelUpdate } from './models';
import type { ArticleRow, ArticleInsert, ArticleUpdate } from './articles';

export type { Json } from './models';
export * from './models';
export * from './articles';

export type Database = {
  public: {
    Tables: {
      models: {
        Row: ModelRow;
        Insert: ModelInsert;
        Update: ModelUpdate;
        Relationships: [];
      };
      articles: {
        Row: ArticleRow;
        Insert: ArticleInsert;
        Update: ArticleUpdate;
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
