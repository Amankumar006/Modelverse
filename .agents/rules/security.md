# Security

## Secrets

- Never commit `.env*` files, the Supabase service role key, or any Gemini/Groq API key.
- Local secrets live in `.env.local` (gitignored). Prod secrets live in Vercel env vars. CI secrets (cron workflows) live in GitHub Actions repository secrets.
- Before opening any PR, diff-check for anything that looks like a key, token, or credential — see the `open-pull-request` skill's pre-PR checklist.
- In Next.js specifically: only `NEXT_PUBLIC_*` env vars are safe to reach client-side code. Never reference the Supabase **service role** key or an LLM API key from any file that ships to the browser — server components, API routes, and Server Actions only.

## Data validation

- Every external input — RSS content, LLM output, third-party API payloads (HuggingFace, OpenRouter), and any public-facing form/API route input — must be validated with Zod before it's trusted or persisted. Treat "came from an AI model" and "came from the public internet" as the same trust level: untrusted.
- API routes and Server Actions that accept user input validate and sanitize it before using it in a DB query, even though Supabase client libraries parameterize queries by default — don't rely on that alone for anything reaching raw SQL.

## Database

- Row Level Security must be enabled and scoped correctly on any table exposed to the client (directly or via API route) — see the `supabase-migrations` skill. A new public-facing table with no RLS policy is a blocker, not a follow-up task.
- No destructive migration (drop column/table, truncating type change) without confirming a recent backup / point-in-time recovery window exists first.

## Dependencies

- When bumping dependencies (`chore: update dependencies`), skim the changelog for anything security-relevant, and run `npm audit` — don't merge a dependency bump blind just because the build still passes.

## Public surface area

- This is a public production site with no auth gate on most content. Any new API route or Server Action should be considered from an abuse angle: could it be scraped/hammered/used to exfiltrate more than intended? Rate limiting or caching may be warranted for anything that calls a paid external API (Gemini/Groq/HuggingFace/OpenRouter) on a public request path.
- Curator/admin functionality (if any exists or is added) must be properly access-controlled — never gated by client-side checks alone.

## Never

- ❌ Log secrets, full API responses containing keys, or raw user input that could contain injected content, to anywhere persisted (build logs, error trackers, DB).
- ❌ Disable an RLS policy "temporarily" to unblock local development and forget to re-enable it before merging.
- ❌ Trust AI-generated content as safe to render as raw HTML — sanitize or render as text/markdown through a safe renderer.
