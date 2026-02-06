-- La Granja Poker - Seed Players Data
-- Run this AFTER migration 003_text_player_ids.sql

-- Insert all 45 players
insert into players (id, name, is_active) values
  ('arana', 'Araña', true),
  ('ari', 'Ari', true),
  ('bochy', 'Bochy', true),
  ('bruno', 'Bruno', true),
  ('cachi', 'Cachi', true),
  ('charly', 'Charly', true),
  ('chelo', 'Chelo', true),
  ('dieguito', 'Dieguito', true),
  ('dipi', 'Dipi', true),
  ('fechele', 'Fechele', true),
  ('fff', 'FFF', true),
  ('franm', 'Fran M', true),
  ('gabo', 'Gabo', true),
  ('galle', 'Galle', true),
  ('gianni', 'Gianni', true),
  ('gonza', 'Gonza', true),
  ('grosman', 'Grosman', true),
  ('halcon', 'Halcón', true),
  ('hernan', 'Hernan', true),
  ('jero', 'Jero', true),
  ('juliopan', 'Julio Pan', true),
  ('lean', 'Lean', true),
  ('mou', 'Mou', true),
  ('nahue', 'Nahue', true),
  ('naka', 'Naka', true),
  ('nato', 'Nato', true),
  ('orfa', 'Orfa', true),
  ('pep', 'Pep', true),
  ('peta', 'Peta', true),
  ('rasta', 'Rasta', true),
  ('ruso', 'Ruso', true),
  ('santi', 'Santi', true),
  ('santiman', 'Santiman', true),
  ('santini', 'Santini', true),
  ('sherley', 'Sherley', true),
  ('shark', 'Shark', true),
  ('tala', 'Tala', true),
  ('tate', 'Tate', true),
  ('teto', 'Teto', true),
  ('tinchob', 'Tincho B', true),
  ('toti', 'Toti', true),
  ('woody', 'Woody', true),
  ('yamo', 'Yamo', true),
  ('yeti', 'Yeti', true),
  ('ysy', 'Ysy', true)
on conflict (id) do nothing;

-- Insert aliases (only for players that have them)
insert into player_aliases (player_id, alias) values
  -- arana
  ('arana', '🕷'),
  -- bochy
  ('bochy', 'Bochy Hof'),
  -- cachi
  ('cachi', 'Di María'),
  ('cachi', 'El Pibito'),
  -- chelo
  ('chelo', 'Marcelo'),
  -- franm
  ('franm', 'sal'),
  -- gabo
  ('gabo', 'chuchak'),
  -- hernan
  ('hernan', 'Herni'),
  -- juliopan
  ('juliopan', 'Craaa'),
  ('juliopan', 'el craaa'),
  ('juliopan', 'Cracken'),
  -- lean
  ('lean', 'Lea'),
  -- nahue
  ('nahue', 'NV'),
  ('nahue', 'NV9'),
  -- orfa
  ('orfa', 'Tomás orfali'),
  -- rasta
  ('rasta', 'Rastita'),
  -- sherley
  ('sherley', 'Sherlusky'),
  -- shark
  ('shark', 'gaBIHOF'),
  ('shark', '🦈'),
  ('shark', 'Gabi 🦈'),
  -- yamo
  ('yamo', '🦧'),
  ('yamo', '🦍'),
  ('yamo', '🦍 Final 7'),
  ('yamo', '👑🦍')
on conflict (alias) do nothing;
