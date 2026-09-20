-- Development / staging lookup rows that match the public website.
-- Safe in every environment: regions are real catalog, not demo users.

INSERT INTO regions (slug, name, kicker, summary, display_order, status, published_at) VALUES
  (
    'northern-tanzania',
    'Northern Tanzania',
    'The classic circuit',
    'Africa’s best-known safari country: Serengeti migration and predators, Ngorongoro’s Big Five crater, Tarangire’s dry-season elephants, Manyara as a scenic stop, plus Kilimanjaro, Meru and Eyasi off the main loop.',
    10,
    'PUBLISHED',
    now()
  ),
  (
    'the-coast',
    'The Coast',
    'Indian Ocean',
    'Swahili islands after safari: Stone Town for a night or two, then Nungwi, Kendwa or the tidal east. Nyerere is 45 minutes by air; the north is a longer hop.',
    20,
    'PUBLISHED',
    now()
  ),
  (
    'southern-tanzania',
    'Southern Tanzania',
    'Quieter parks',
    'Quieter than the north, with open-sided vehicles, walking, boats and fly-camp. Ruaha for predators and baobabs; Nyerere for the Rufiji; Mikumi when you only have a day from Dar.',
    30,
    'PUBLISHED',
    now()
  ),
  (
    'western-tanzania',
    'Western Tanzania',
    'Chimpanzee country',
    'Infrequent, expensive flights and no classic game-drive loop: chimpanzee forest on Lake Tanganyika. Gombe is steep and compact; Mahale is a fly-in beach-and-chimp stay, best in July–October.',
    40,
    'PUBLISHED',
    now()
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  kicker = EXCLUDED.kicker,
  summary = EXCLUDED.summary,
  display_order = EXCLUDED.display_order,
  status = EXCLUDED.status;

INSERT INTO menus (title, location, status) VALUES
  ('Primary', 'primary', 'PUBLISHED'),
  ('Utility', 'utility', 'PUBLISHED'),
  ('Footer', 'footer', 'PUBLISHED')
ON CONFLICT (location) DO NOTHING;

INSERT INTO menu_items (menu_id, label, href, sort_order)
SELECT m.id, x.label, x.href, x.sort_order
FROM menus m
JOIN (VALUES
  ('primary', 'Home', '/', 10),
  ('primary', 'Destinations', '/destinations/', 20),
  ('primary', 'Safaris', '/tours/', 30),
  ('primary', 'Join Safari', '/join-safari/', 40),
  ('primary', 'Kilimanjaro', '/kilimanjaro/', 50),
  ('primary', 'Contact Us', '/contact/', 60),
  ('utility', 'Accommodations', '/accommodations/', 10),
  ('utility', 'Blogs', '/blog/', 20),
  ('utility', 'About Us', '/about/', 30),
  ('utility', 'Reviews', '/reviews/', 40)
) AS x(location, label, href, sort_order) ON x.location = m.location::text
WHERE NOT EXISTS (
  SELECT 1 FROM menu_items mi WHERE mi.menu_id = m.id AND mi.href = x.href
);
