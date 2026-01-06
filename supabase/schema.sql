-- ===================================
-- AEEMCI Platform - Database Schema
-- ===================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================
-- Table : types_contenus
-- ===================================
CREATE TABLE types_contenus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icone VARCHAR(50),
    ordre INT DEFAULT 0,
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- Table : templates
-- ===================================
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type_contenu_id UUID REFERENCES types_contenus(id) ON DELETE CASCADE,
    nom VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Structure HTML/CSS du template
    html_structure TEXT NOT NULL,
    css_styles TEXT NOT NULL,
    
    -- Configuration des champs dynamiques
    champs_config JSONB NOT NULL,
    
    -- Aperçu visuel
    preview_url TEXT,
    
    -- Métadonnées
    largeur INT DEFAULT 1080,
    hauteur INT DEFAULT 1080,
    format VARCHAR(20) DEFAULT 'square',
    
    actif BOOLEAN DEFAULT true,
    ordre INT DEFAULT 0,
    
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_templates_type ON templates(type_contenu_id);
CREATE INDEX idx_templates_actif ON templates(actif);

-- ===================================
-- Table : visuels_generes
-- ===================================
CREATE TABLE visuels_generes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Contenu saisi par l'utilisateur
    contenu_json JSONB NOT NULL,
    
    -- Image générée
    image_url TEXT,
    format_export VARCHAR(10) DEFAULT 'png',
    
    -- Métadonnées
    largeur INT,
    hauteur INT,
    taille_fichier INT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour historique utilisateur
CREATE INDEX idx_visuels_user ON visuels_generes(user_id);
CREATE INDEX idx_visuels_date ON visuels_generes(created_at DESC);

-- ===================================
-- Table : user_profiles
-- ===================================
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nom_complet VARCHAR(200),
    delegation VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- Politiques de Sécurité (RLS)
-- ===================================

-- Activer RLS sur toutes les tables
ALTER TABLE types_contenus ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE visuels_generes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Lecture publique des types et templates actifs
CREATE POLICY "Lecture publique types" ON types_contenus
    FOR SELECT USING (actif = true);

CREATE POLICY "Lecture publique templates" ON templates
    FOR SELECT USING (actif = true);

-- Les utilisateurs voient leurs propres visuels
CREATE POLICY "Voir ses visuels" ON visuels_generes
    FOR SELECT USING (auth.uid() = user_id);

-- Les utilisateurs créent leurs visuels
CREATE POLICY "Créer ses visuels" ON visuels_generes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs voient leur propre profil
CREATE POLICY "Voir son profil" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

-- Les utilisateurs créent leur profil
CREATE POLICY "Créer son profil" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Les utilisateurs modifient leur profil
CREATE POLICY "Modifier son profil" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Seuls les admins modifient les templates
CREATE POLICY "Admin gère templates" ON templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Seuls les admins modifient les types de contenus
CREATE POLICY "Admin gère types" ON types_contenus
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ===================================
-- Fonctions Utilitaires
-- ===================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_types_contenus_updated_at
    BEFORE UPDATE ON types_contenus
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
    BEFORE UPDATE ON templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
