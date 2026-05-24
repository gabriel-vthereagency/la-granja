-- Migration 018: fix Supabase security advisor issues.
--
-- 1. Convert all SECURITY DEFINER views to security_invoker = on so they use
--    the caller's permissions instead of the creator's. This restores normal
--    RLS behavior for the views.
-- 2. Enable RLS on the 8 public tables that didn't have it. Add permissive
--    policies that match current functional behavior (anon-key apps).
-- 3. Pin search_path on functions to prevent search_path injection.
--
-- Not included (intentional):
-- - The 4 "RLS policy always true" warnings on live_tournament_* tables
--   remain. The Control/Web/Timer apps use anon key without auth, so writes
--   are currently unrestricted by design. Will be tightened when auth is
--   introduced.

-- ============================================================================
-- 1. security_invoker on views
-- ============================================================================
ALTER VIEW public.player_global_stats SET (security_invoker = on);
ALTER VIEW public.player_complete_stats SET (security_invoker = on);
ALTER VIEW public.hall_of_shame_stats SET (security_invoker = on);
ALTER VIEW public.season_standings SET (security_invoker = on);
ALTER VIEW public.player_season_stats SET (security_invoker = on);
ALTER VIEW public.player_last_places SET (security_invoker = on);
ALTER VIEW public.player_season_last_places SET (security_invoker = on);
ALTER VIEW public.event_max_positions SET (security_invoker = on);
ALTER VIEW public.last_event_per_season SET (security_invoker = on);
ALTER VIEW public.event_results_audit SET (security_invoker = on);

-- ============================================================================
-- 2. Enable RLS + permissive policies on the 8 public tables
-- ============================================================================
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.seasons FOR SELECT USING (true);

ALTER TABLE public.event_nights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.event_nights FOR SELECT USING (true);
CREATE POLICY "Public update" ON public.event_nights FOR UPDATE USING (true) WITH CHECK (true);

ALTER TABLE public.offline_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.offline_events FOR SELECT USING (true);

ALTER TABLE public.offline_event_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.offline_event_results FOR SELECT USING (true);

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.players FOR SELECT USING (true);
CREATE POLICY "Public insert" ON public.players FOR INSERT WITH CHECK (true);

ALTER TABLE public.player_aliases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.player_aliases FOR SELECT USING (true);
CREATE POLICY "Public insert" ON public.player_aliases FOR INSERT WITH CHECK (true);

ALTER TABLE public.event_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.event_results FOR SELECT USING (true);
CREATE POLICY "Public insert" ON public.event_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON public.event_results FOR UPDATE USING (true) WITH CHECK (true);

ALTER TABLE public.hall_of_fame ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.hall_of_fame FOR SELECT USING (true);

-- ============================================================================
-- 3. Pin search_path on functions
-- ============================================================================
ALTER FUNCTION public.recalc_positions(uuid)             SET search_path = public, pg_catalog;
ALTER FUNCTION public.add_player(uuid, text, text)       SET search_path = public, pg_catalog;
ALTER FUNCTION public.eliminate_player(uuid)             SET search_path = public, pg_catalog;
ALTER FUNCTION public.remove_player(uuid)                SET search_path = public, pg_catalog;
ALTER FUNCTION public.revert_elimination(uuid)           SET search_path = public, pg_catalog;
ALTER FUNCTION public.update_updated_at()                SET search_path = public, pg_catalog;
