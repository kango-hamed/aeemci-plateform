# Guide de Configuration Supabase

Ce guide vous accompagne pas à pas dans la configuration de votre projet Supabase pour la plateforme AEEMCI.

## Étape 1: Créer un Projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous ou créez un compte
3. Cliquez sur "New Project"
4. Remplissez les informations:
   - **Name**: `aeemci-platform` (ou votre choix)
   - **Database Password**: Choisissez un mot de passe fort (notez-le!)
   - **Region**: Choisissez la région la plus proche (ex: Europe West)
5. Cliquez sur "Create new project"
6. Attendez quelques minutes que le projet soit créé

## Étape 2: Exécuter le Schéma de Base de Données

1. Dans votre projet Supabase, allez dans **SQL Editor** (menu de gauche)
2. Cliquez sur "+ New query"
3. Copiez tout le contenu du fichier `supabase/schema.sql`
4. Collez-le dans l'éditeur SQL
5. Cliquez sur "Run" (ou Ctrl+Enter)
6. Vérifiez qu'il n'y a pas d'erreurs

## Étape 3: Insérer les Données Initiales

1. Toujours dans le **SQL Editor**, créez une nouvelle requête
2. Copiez tout le contenu du fichier `supabase/seed.sql`
3. Collez-le dans l'éditeur SQL
4. Cliquez sur "Run"
5. Vous devriez voir les 6 types de contenus créés

## Étape 4: Vérifier les Tables

1. Allez dans **Table Editor** (menu de gauche)
2. Vous devriez voir 4 tables:
   - `types_contenus` (6 lignes)
   - `templates` (vide pour l'instant)
   - `visuels_generes` (vide)
   - `user_profiles` (vide)

## Étape 5: Récupérer les Clés API

1. Allez dans **Settings** → **API** (menu de gauche)
2. Vous verrez deux sections importantes:

### Project URL
```
https://xxxxxxxxxxxxx.supabase.co
```
Copiez cette URL

### API Keys
Copiez la clé **anon public**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **NE PARTAGEZ JAMAIS** votre clé `service_role` publiquement!

## Étape 6: Configurer l'Application

1. Créez un fichier `.env` à la racine du projet:
```bash
cp .env.example .env
```

2. Ouvrez `.env` et remplacez les valeurs:
```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Étape 7: Configurer l'Authentification

1. Allez dans **Authentication** → **Providers** (menu de gauche)
2. Assurez-vous que **Email** est activé
3. Dans **Authentication** → **Email Templates**:
   - Personnalisez les templates d'email si nécessaire
4. Dans **Authentication** → **URL Configuration**:
   - **Site URL**: `http://localhost:5173` (développement)
   - **Redirect URLs**: Ajoutez `http://localhost:5173/**`

## Étape 8: Tester la Connexion

1. Lancez l'application:
```bash
npm run dev
```

2. Ouvrez `http://localhost:5173`
3. Essayez de créer un compte
4. Vérifiez votre email pour confirmer
5. Connectez-vous

## Étape 9: Créer un Utilisateur Admin (Optionnel)

1. Créez un compte normalement via l'interface
2. Allez dans **Table Editor** → `user_profiles`
3. Trouvez votre utilisateur
4. Modifiez le champ `role` de `user` à `admin`
5. Maintenant vous pouvez gérer les templates!

## Vérification Finale

✅ Les tables sont créées  
✅ Les 6 types de contenus sont insérés  
✅ Les clés API sont configurées dans `.env`  
✅ L'authentification fonctionne  
✅ Vous pouvez créer un compte et vous connecter  

## Problèmes Courants

### "Missing Supabase environment variables"
→ Vérifiez que votre fichier `.env` existe et contient les bonnes clés

### "Invalid API key"
→ Assurez-vous d'utiliser la clé `anon public` et non `service_role`

### "Email not confirmed"
→ Vérifiez votre boîte mail (et spam) pour le lien de confirmation

### Les tables n'apparaissent pas
→ Vérifiez que le script SQL s'est exécuté sans erreurs dans le SQL Editor

## Prochaines Étapes

Une fois la configuration terminée, vous pouvez:
1. Créer des templates via l'interface admin (si vous êtes admin)
2. Tester la génération d'affiches
3. Déployer sur Vercel pour la production

Pour le déploiement en production, n'oubliez pas de:
- Mettre à jour les **Redirect URLs** dans Supabase avec votre domaine de production
- Configurer les variables d'environnement sur Vercel
