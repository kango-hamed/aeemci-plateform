# AEEMCI - Plateforme de Génération d'Affiches

Plateforme web permettant aux délégations de l'AEEMCI-ESATIC de créer facilement des visuels de communication professionnels.

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+ et npm
- Compte Supabase

### Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd aeemci
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration Supabase**

Créez un fichier `.env` à la racine du projet:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

4. **Configurer la base de données**

Dans votre projet Supabase:
- Allez dans SQL Editor
- Exécutez le fichier `supabase/schema.sql`
- Exécutez le fichier `supabase/seed.sql`

5. **Lancer en développement**
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 📦 Build pour Production

```bash
npm run build
npm run preview
```

## 🛠️ Stack Technique

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: Zustand
- **Routing**: React Router v6
- **Image Generation**: html2canvas

## 📁 Structure du Projet

```
aeemci/
├── src/
│   ├── components/
│   │   ├── ui/          # Composants réutilisables
│   │   ├── layout/      # Layout components
│   │   └── templates/   # Template components
│   ├── pages/           # Pages de l'application
│   ├── lib/             # Utilitaires et clients
│   ├── stores/          # Zustand stores
│   └── types/           # TypeScript types
├── supabase/
│   ├── schema.sql       # Schéma de la base de données
│   └── seed.sql         # Données initiales
└── public/              # Assets statiques
```

## 🔐 Authentification

L'application utilise Supabase Auth avec validation d'email obligatoire.

## 📄 Licence

Projet interne AEEMCI - ESATIC
