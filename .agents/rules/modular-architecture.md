# Modular Codebase & File Size Guidelines

## File Size & Modularity Standard
- **Strict Line Count Constraint**: Keep all files between **100 to 200 lines of code maximum**. Never write monolithic files.
- **Single Responsibility Principle**:
  - Break logic into small, focused, composable modules and utility functions.
  - Separate LLM provider clients, prompt templates, scrapers, deduplication filters, quality scorers, and database operations into dedicated files.
  - Separate API validation, business logic, and database query handlers.
  - Separate React UI into isolated components, layouts, and hooks.
- **Folder Structure**:
  - `src/lib/` or `scripts/lib/` broken down by subsystem (`llm/`, `scrapers/`, `scoring/`, `supabase/`, `utils/`).
  - Clear, explicit exports and imports with TypeScript interfaces in dedicated `types/` files.
