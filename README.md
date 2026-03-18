# AllClear

Instant sanctions and due diligence screening for small businesses — at 1/100th the price of enterprise compliance tools.

## Setup

1. **Clone and install:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase credentials (see `.env.example` for descriptions).

3. **Set up Supabase:**
   - Create a Supabase project
   - Run the database schema from `IMPLEMENTATION-PLAN.md`
   - Enable Google OAuth in Supabase Auth > Providers

4. **Run locally:**
   ```bash
   npm run dev
   ```

## Spec

See [PROJECT-1773813351-SPEC.md](./PROJECT-1773813351-SPEC.md) for the full product specification.
