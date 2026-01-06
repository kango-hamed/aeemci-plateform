# 📱 Plateforme de Génération d'Affiches AEEMCI - ESATIC

## 📋 Table des Matières
- [Vue d'ensemble](#vue-densemble)
- [Problématique](#problématique)
- [Solution](#solution)
- [Architecture](#architecture)
- [Stack Technique](#stack-technique)
- [Structure de la Base de Données](#structure-de-la-base-de-données)
- [Fonctionnalités](#fonctionnalités)
- [Workflow de Création de Template](#workflow-de-création-de-template)
- [Installation](#installation)
- [Déploiement](#déploiement)
- [Roadmap](#roadmap)

---

## 🎯 Vue d'ensemble

Plateforme web permettant aux différentes délégations de l'AEEMCI (Association des Étudiants et Élèves Musulmans de Côte d'Ivoire) - Section ESATIC de créer facilement des visuels de communication professionnels sans compétences en design.

**Objectif principal :** Automatiser la production d'affiches récurrentes (annonces, communiqués, rappels islamiques, hadiths) pour libérer la cellule informatique des tâches répétitives.

---

## ❌ Problématique

### Défis actuels :
- **Manque de main-d'œuvre** dans la cellule informatique
- **Peu d'intérêt** pour le volet communication digitale
- **Dépendance** aux designers pour des visuels simples
- **Production lente** des communications routinières
- **Inconsistance visuelle** faute de templates standardisés

### Impact :
- La cellule informatique perd du temps sur des tâches mécaniques
- Retards dans les communications importantes
- Surcharge de travail pour les membres actifs

---

## ✅ Solution

### Application web en libre-service permettant de :
- ✨ Créer des visuels en 2 minutes
- 🎨 Utiliser des templates validés et professionnels
- 🚫 Ne nécessiter AUCUNE compétence en design
- 📱 Exporter directement pour les réseaux sociaux
- 🔒 Garantir la cohérence de l'identité visuelle AEEMCI

### Bénéficiaires :
- **Délégation Culturelle** : Rappels islamiques, hadiths, enseignements
- **Délégation Organisationnelle** : Annonces, communiqués, rappels d'activités
- **Bureau Exécutif** : Communications officielles
- **Cellule Informatique** : Focus sur projets stratégiques

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Sélection   │→ │  Formulaire  │→ │  Génération  │     │
│  │   Template   │  │   Contenu    │  │    Visuel    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         ↓                  ↓                  ↓             │
│  ┌──────────────────────────────────────────────────┐      │
│  │         html2canvas (Génération Image)           │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Supabase)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  PostgreSQL  │  │     Auth     │  │   Storage    │     │
│  │   Database   │  │  (JWT-based) │  │  (Templates) │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                 HÉBERGEMENT & CDN                            │
│              Vercel (Frontend) + Supabase Cloud             │
└─────────────────────────────────────────────────────────────┘
```

### Flux Utilisateur

```
1. Connexion (simple) 
   ↓
2. Sélection du type de contenu (Annonce, Hadith, etc.)
   ↓
3. Choix du template
   ↓
4. Remplissage du formulaire adapté
   ↓
5. Prévisualisation en temps réel
   ↓
6. Génération de l'image (PNG/JPEG)
   ↓
7. Téléchargement direct
```

---

## 🛠️ Stack Technique

### **Frontend**
| Technologie | Version | Rôle |
|-------------|---------|------|
| **React** | 18.x | Framework UI |
| **Vite** | 5.x | Build tool ultra-rapide |
| **Tailwind CSS** | 3.x | Styling utility-first |
| **html2canvas** | 1.4.x | Génération d'images depuis HTML |
| **React Router** | 6.x | Navigation SPA |
| **Zustand** | 4.x | State management léger |

### **Backend & Services**
| Service | Plan | Rôle |
|---------|------|------|
| **Supabase** | Free (500MB) | Backend-as-a-Service |
| ├─ PostgreSQL | Inclus | Base de données |
| ├─ Auth | Inclus | Authentification JWT |
| ├─ Storage | Inclus | Stockage des assets |
| └─ Realtime | Inclus | Sync temps réel (optionnel) |

### **Hébergement & Déploiement**
| Service | Plan | Rôle |
|---------|------|------|
| **Vercel** | Free | Hébergement frontend + CDN |
| **GitHub** | Free | Versioning + CI/CD |

### **Design & Assets**
| Outil | Usage |
|-------|-------|
| **Adobe Illustrator** | Conception des templates |
| **Adobe Photoshop** | Retouche graphique |
| **Google Fonts** | Polices web gratuites |

---

## 🗄️ Structure de la Base de Données

### **Schéma PostgreSQL (Supabase)**

```sql
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

-- Exemples de types
INSERT INTO types_contenus (nom, description, icone, ordre) VALUES
('Annonce', 'Annonces d''événements et d''activités', 'megaphone', 1),
('Communiqué', 'Communications officielles du bureau', 'document', 2),
('Rappel Activité', 'Rappels pour les événements à venir', 'bell', 3),
('Rappel Islamique', 'Citations et sagesses islamiques', 'book', 4),
('Hadith', 'Hadiths du Prophète (SAW)', 'scroll', 5),
('Enseignement Islamique', 'Contenus éducatifs sur l''Islam', 'graduation-cap', 6);

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
    champs_config JSONB NOT NULL, -- Ex: [{"name":"titre","type":"text","maxLength":50}]
    
    -- Aperçu visuel
    preview_url TEXT,
    
    -- Métadonnées
    largeur INT DEFAULT 1080, -- px
    hauteur INT DEFAULT 1080, -- px
    format VARCHAR(20) DEFAULT 'square', -- square, story, landscape
    
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
    contenu_json JSONB NOT NULL, -- Ex: {"titre":"Conférence","date":"2025-01-15"}
    
    -- Image générée
    image_url TEXT,
    format_export VARCHAR(10) DEFAULT 'png', -- png, jpeg
    
    -- Métadonnées
    largeur INT,
    hauteur INT,
    taille_fichier INT, -- en bytes
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour historique utilisateur
CREATE INDEX idx_visuels_user ON visuels_generes(user_id);
CREATE INDEX idx_visuels_date ON visuels_generes(created_at DESC);

-- ===================================
-- Table : users (gérée par Supabase Auth)
-- ===================================
-- Profils utilisateurs étendus
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nom_complet VARCHAR(200),
    delegation VARCHAR(100), -- 'Culturelle', 'Organisationnelle', 'Bureau Exécutif'
    role VARCHAR(50) DEFAULT 'user', -- 'user', 'admin'
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- Politiques de Sécurité (RLS - Row Level Security)
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

-- Seuls les admins modifient les templates
CREATE POLICY "Admin gère templates" ON templates
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
```

### **Exemple de Configuration de Champs (JSON)**

```json
{
  "champs_config": [
    {
      "name": "titre",
      "label": "Titre de l'annonce",
      "type": "text",
      "required": true,
      "maxLength": 50,
      "placeholder": "Ex: Conférence sur l'entrepreneuriat"
    },
    {
      "name": "date",
      "label": "Date",
      "type": "date",
      "required": true
    },
    {
      "name": "heure",
      "label": "Heure",
      "type": "time",
      "required": true
    },
    {
      "name": "lieu",
      "label": "Lieu",
      "type": "text",
      "required": true,
      "maxLength": 100
    },
    {
      "name": "message",
      "label": "Message",
      "type": "textarea",
      "required": false,
      "maxLength": 200
    }
  ]
}
```

---

## ⚙️ Fonctionnalités

### **V1 - MVP (Minimum Viable Product)**

#### Pour les Utilisateurs (Délégations)

1. **Authentification Simple**
   - Connexion par email/mot de passe
   - Pas de validation d'email en V1 (rapidité)

2. **Sélection du Type de Contenu**
   - Interface visuelle avec icônes
   - Types : Annonce, Communiqué, Rappel, Hadith, etc.

3. **Choix du Template**
   - Aperçu visuel de chaque template
   - Filtrage par type automatique
   - Maximum 3-5 templates par type en V1

4. **Formulaire Dynamique**
   - Champs adaptés au template sélectionné
   - Validation en temps réel
   - Compteur de caractères
   - Prévisualisation instantanée

5. **Génération du Visuel**
   - Rendu HTML → Canvas → Image
   - Formats : PNG (haute qualité), JPEG (compressé)
   - Résolutions optimisées pour réseaux sociaux

6. **Téléchargement**
   - Bouton de téléchargement direct
   - Nom de fichier automatique : `aeemci-annonce-20250106.png`

7. **Historique Personnel**
   - Liste des 10 derniers visuels créés
   - Possibilité de re-télécharger

#### Pour les Administrateurs (Cellule Informatique)

1. **Gestion des Templates**
   - Ajout de nouveaux templates
   - Modification des templates existants
   - Activation/Désactivation
   - Upload des assets (logos, fonds)

2. **Gestion des Types de Contenus**
   - Création de nouvelles catégories
   - Réorganisation de l'ordre d'affichage

3. **Statistiques Basiques**
   - Nombre de visuels générés par type
   - Templates les plus utilisés

---

## 🎨 Workflow de Création de Template

### **Étape 1 : Design (Illustrator/Photoshop)**

L'équipe design crée le visuel dans Illustrator ou Photoshop.

**Exemple - Template "Annonce":**
```
┌─────────────────────────────────────┐
│  [LOGO AEEMCI - Top Left]           │
│                                     │
│  ╔═══════════════════════════════╗ │
│  ║   [TITRE DE L'ANNONCE]        ║ │
│  ╚═══════════════════════════════╝ │
│                                     │
│  📅 Date: [DATE]                    │
│  🕐 Heure: [HEURE]                  │
│  📍 Lieu: [LIEU]                    │
│                                     │
│  [MESSAGE COURT]                    │
│                                     │
│  ─────────────────────────────────  │
│  Section AEEMCI - ESATIC            │
└─────────────────────────────────────┘
```

### **Étape 2 : Export des Assets**

1. **Fond/Background** → `template-annonce-bg.png` (1080x1080px)
2. **Logo AEEMCI** → `logo-aeemci.png` (transparent)
3. **Icônes** → `icon-calendar.svg`, `icon-clock.svg`, etc.

### **Étape 3 : Intégration HTML/CSS**

La cellule informatique recrée le template en HTML/CSS :

```html
<div class="template-container" style="
  width: 1080px;
  height: 1080px;
  background-image: url('template-annonce-bg.png');
  background-size: cover;
  position: relative;
  font-family: 'Poppins', sans-serif;
">
  <!-- Logo -->
  <img src="logo-aeemci.png" style="
    position: absolute;
    top: 40px;
    left: 40px;
    width: 120px;
  ">
  
  <!-- Titre -->
  <div class="titre" style="
    position: absolute;
    top: 250px;
    left: 80px;
    right: 80px;
    font-size: 48px;
    font-weight: bold;
    color: #1a5f3f;
    text-align: center;
    line-height: 1.2;
  ">
    {{titre}}
  </div>
  
  <!-- Infos -->
  <div style="position: absolute; top: 500px; left: 120px;">
    <p style="font-size: 32px; margin-bottom: 15px;">
      📅 Date: <span style="font-weight: 600;">{{date}}</span>
    </p>
    <p style="font-size: 32px; margin-bottom: 15px;">
      🕐 Heure: <span style="font-weight: 600;">{{heure}}</span>
    </p>
    <p style="font-size: 32px;">
      📍 Lieu: <span style="font-weight: 600;">{{lieu}}</span>
    </p>
  </div>
  
  <!-- Message -->
  <div style="
    position: absolute;
    top: 720px;
    left: 80px;
    right: 80px;
    font-size: 28px;
    text-align: center;
    color: #333;
  ">
    {{message}}
  </div>
  
  <!-- Footer -->
  <div style="
    position: absolute;
    bottom: 40px;
    left: 0;
    right: 0;
    text-align: center;
    font-size: 24px;
    color: #666;
  ">
    Section AEEMCI - ESATIC
  </div>
</div>
```

### **Étape 4 : Configuration dans la BDD**

Insertion du template dans Supabase :

```sql
INSERT INTO templates (
    type_contenu_id,
    nom,
    description,
    html_structure,
    css_styles,
    champs_config,
    largeur,
    hauteur
) VALUES (
    'uuid-du-type-annonce',
    'Template Annonce Standard',
    'Template pour les annonces d''événements',
    '<!-- HTML du template -->',
    '/* CSS du template */',
    '[
      {"name":"titre","type":"text","required":true,"maxLength":50},
      {"name":"date","type":"date","required":true},
      {"name":"heure","type":"time","required":true},
      {"name":"lieu","type":"text","required":true,"maxLength":100},
      {"name":"message","type":"textarea","required":false,"maxLength":200}
    ]'::jsonb,
    1080,
    1080
);
```

### **Étape 5 : Test & Validation**

1. Tester le template dans l'interface
2. Vérifier l'alignement du texte
3. Tester avec différentes longueurs de texte
4. Valider la qualité de l'export PNG/JPEG

---

## 🚀 Installation

### **Prérequis**

- Node.js 18+ et npm
- Compte Supabase (gratuit)
- Compte Vercel (gratuit, optionnel)
- Git

### **Étape 1 : Cloner le Projet**

```bash
git clone https://github.com/aeemci-esatic/plateforme-affiches.git
cd plateforme-affiches
```

### **Étape 2 : Installation des Dépendances**

```bash
npm install
```

### **Étape 3 : Configuration Supabase**

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Exécuter le script SQL (voir section Base de Données)
3. Récupérer les clés API :
   - `Project URL`
   - `anon public key`

### **Étape 4 : Variables d'Environnement**

Créer un fichier `.env` à la racine :

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Étape 5 : Lancer en Local**

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

---

## 📦 Déploiement

### **Option 1 : Vercel (Recommandé)**

```bash
# Installer Vercel CLI
npm install -g vercel

# Déployer
vercel

# Suivre les instructions
# Ajouter les variables d'environnement dans le dashboard Vercel
```

### **Option 2 : Netlify**

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Déployer
netlify deploy --prod
```

### **Configuration DNS**

Pointer votre domaine (ex: `affiches.aeemci-esatic.org`) vers Vercel/Netlify.

---

## 🗺️ Roadmap

### **V1 - MVP** ✅ (Phase Actuelle)
- [x] Authentification basique
- [x] 6 types de contenus
- [x] Génération PNG/JPEG
- [x] Interface utilisateur simple
- [x] Gestion admin des templates

### **V2 - Améliorations** 🔄 (Q2 2025)
- [ ] Édition avancée (changer couleurs, polices)
- [ ] Export PDF
- [ ] Partage direct sur WhatsApp/Facebook
- [ ] Templates multi-formats (Story, Post, Bannière)
- [ ] Bibliothèque d'images libres de droits
- [ ] Statistiques avancées

### **V3 - Collaboration** 🔮 (Q3 2025)
- [ ] Validation workflow (créateur → validateur → publication)
- [ ] Calendrier éditorial
- [ ] Notifications (nouveaux templates, rappels)
- [ ] Intégration API réseaux sociaux (publication directe)
- [ ] Mode hors-ligne (PWA)

---

## 👥 Contributeurs

**Cellule Informatique - Section AEEMCI ESATIC**

- **Responsable Cellule Informatique** : [Votre Nom]
- **Équipe Design** : [Noms]
- **Développeurs** : [Noms]

---

## 📄 Licence

Projet interne AEEMCI - ESATIC. Usage réservé à l'association.

---

## 📞 Support

Pour toute question ou problème :
- 📧 Email : cellule.info@aeemci-esatic.org
- 💬 Groupe WhatsApp : [Lien]
- 🐛 Issues : [GitHub Issues]

---

## 🙏 Remerciements

- **Bureau Exécutif AEEMCI** pour le soutien
- **Délégations** pour leurs retours
- **Anthropic (Claude)** pour l'assistance technique

---

**Version du README :** 1.0.0  
**Dernière mise à jour :** 06 Janvier 2025