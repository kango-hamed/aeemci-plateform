-- Run this after enabling Neon Data API with Managed Better Auth on this branch.
-- The Data API is browser-accessible, so PostgreSQL grants and RLS are the security boundary.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS user_profiles (
  id text PRIMARY KEY,
  nom_complet varchar(200),
  delegation varchar(100),
  role varchar(50) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS types_contenus (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom varchar(100) NOT NULL UNIQUE,
  description text,
  icone varchar(50),
  ordre integer NOT NULL DEFAULT 0,
  actif boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type_contenu_id uuid NOT NULL REFERENCES types_contenus(id) ON DELETE RESTRICT,
  nom varchar(200) NOT NULL,
  description text,
  html_structure text NOT NULL,
  css_styles text NOT NULL,
  champs_config jsonb NOT NULL DEFAULT '[]'::jsonb,
  preview_url text,
  largeur integer NOT NULL DEFAULT 1080,
  hauteur integer NOT NULL DEFAULT 1080,
  format varchar(20) NOT NULL DEFAULT 'square',
  actif boolean NOT NULL DEFAULT true,
  ordre integer NOT NULL DEFAULT 0,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_templates_type ON templates(type_contenu_id);
CREATE INDEX IF NOT EXISTS idx_templates_actif ON templates(actif);

CREATE TABLE IF NOT EXISTS visuels_generes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id uuid REFERENCES templates(id) ON DELETE SET NULL,
  user_id text NOT NULL,
  contenu_json jsonb NOT NULL,
  image_url text,
  format_export varchar(10) NOT NULL DEFAULT 'png',
  largeur integer,
  hauteur integer,
  taille_fichier bigint,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_visuels_user ON visuels_generes(user_id);
CREATE INDEX IF NOT EXISTS idx_visuels_date ON visuels_generes(created_at DESC);

-- Neon Auth stores identities in neon_auth.user. The current database also
-- contains legacy Better Auth tables in public; new Neon Auth IDs must not be
-- constrained to the legacy public."user" table.
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

CREATE OR REPLACE FUNCTION public.is_aeemci_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.user_id() AND role = 'admin'
  );
$$;
REVOKE ALL ON FUNCTION public.is_aeemci_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_aeemci_admin() TO authenticated;

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE types_contenus ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE visuels_generes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profile_read_self_or_admin ON user_profiles;
CREATE POLICY profile_read_self_or_admin ON user_profiles FOR SELECT TO authenticated
  USING (id = auth.user_id() OR public.is_aeemci_admin());
DROP POLICY IF EXISTS profile_insert_self ON user_profiles;
CREATE POLICY profile_insert_self ON user_profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.user_id() AND role = 'user');
DROP POLICY IF EXISTS profile_update_self ON user_profiles;
CREATE POLICY profile_update_self ON user_profiles FOR UPDATE TO authenticated
  USING (id = auth.user_id() AND role = 'user')
  WITH CHECK (id = auth.user_id() AND role = 'user');

DROP POLICY IF EXISTS content_type_read_active_or_admin ON types_contenus;
CREATE POLICY content_type_read_active_or_admin ON types_contenus FOR SELECT TO authenticated
  USING (actif = true OR public.is_aeemci_admin());
DROP POLICY IF EXISTS content_type_admin_manage ON types_contenus;
CREATE POLICY content_type_admin_manage ON types_contenus FOR ALL TO authenticated
  USING (public.is_aeemci_admin()) WITH CHECK (public.is_aeemci_admin());

DROP POLICY IF EXISTS template_read_active_or_admin ON templates;
CREATE POLICY template_read_active_or_admin ON templates FOR SELECT TO authenticated
  USING (actif = true OR public.is_aeemci_admin());
DROP POLICY IF EXISTS template_admin_manage ON templates;
CREATE POLICY template_admin_manage ON templates FOR ALL TO authenticated
  USING (public.is_aeemci_admin()) WITH CHECK (public.is_aeemci_admin());

DROP POLICY IF EXISTS visual_read_own ON visuels_generes;
CREATE POLICY visual_read_own ON visuels_generes FOR SELECT TO authenticated
  USING (user_id = auth.user_id());
DROP POLICY IF EXISTS visual_read_admin ON visuels_generes;
CREATE POLICY visual_read_admin ON visuels_generes FOR SELECT TO authenticated
  USING (public.is_aeemci_admin());
DROP POLICY IF EXISTS visual_insert_own ON visuels_generes;
CREATE POLICY visual_insert_own ON visuels_generes FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.user_id());

GRANT USAGE ON SCHEMA public TO authenticated;

-- Remove any earlier broad Data API grants, including access to legacy
-- Better Auth tables left in public, then grant only the app tables below.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC, anonymous, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON types_contenus TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON templates TO authenticated;
GRANT SELECT, INSERT ON visuels_generes TO authenticated;
GRANT SELECT, INSERT ON user_profiles TO authenticated;
-- A user may edit profile details, but cannot write the privileged role column via the Data API.
GRANT UPDATE (nom_complet, delegation, avatar_url) ON TABLE user_profiles TO authenticated;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_types_contenus_updated_at ON types_contenus;
CREATE TRIGGER update_types_contenus_updated_at BEFORE UPDATE ON types_contenus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_templates_updated_at ON templates;
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
