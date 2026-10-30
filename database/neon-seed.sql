INSERT INTO types_contenus (nom, description, icone, ordre) VALUES
  ('Annonce', 'Annonces d''événements et d''activités', 'megaphone', 1),
  ('Communiqué', 'Communications officielles du bureau', 'document', 2),
  ('Rappel Activité', 'Rappels pour les événements à venir', 'bell', 3),
  ('Rappel Islamique', 'Citations et sagesses islamiques', 'book', 4),
  ('Hadith', 'Hadiths du Prophète (SAW)', 'scroll', 5),
  ('Enseignement Islamique', 'Contenus éducatifs sur l''Islam', 'graduation-cap', 6)
ON CONFLICT (nom) DO UPDATE SET
  description = EXCLUDED.description,
  icone = EXCLUDED.icone,
  ordre = EXCLUDED.ordre;
