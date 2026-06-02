-- Migration 019: add missing INSERT policies on seasons and event_nights.
--
-- Migration 018 enabled RLS on these tables but only added SELECT (and UPDATE
-- for event_nights). The Control app creates new seasons and event nights when
-- registering players from WhatsApp. Without INSERT policies, those writes were
-- silently blocked by RLS, leaving event_id null and preventing saveResults.

CREATE POLICY "Public insert" ON public.seasons
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public insert" ON public.event_nights
  FOR INSERT WITH CHECK (true);
