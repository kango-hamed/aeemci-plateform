# AEEMCI — Générateur d’affiches

L’application React/Vite actuelle se connecte directement au backend Neon avec `@neondatabase/neon-js`. Neon fournit Managed Better Auth pour les comptes et la Data API pour les requêtes PostgreSQL; aucun serveur Express n’est nécessaire.

## Configuration Neon

1. Ouvre ou crée un projet Neon.
2. Dans **Postgres → Data API**, active la Data API et vérifie que **Managed Better Auth** est sélectionné. La configuration Data API crée le rôle `authenticated` et les fonctions d’identité utilisées par les politiques RLS.
3. Dans **Connect**, relève l’hôte Neon non pooler et le nom de la base; forme l’URL `https://<hôte>/<base>`. N’utilise ni la chaîne PostgreSQL avec son mot de passe, ni un hôte contenant `-pooler`, ni l’hôte de service `.apirest`.
4. À la racine du dépôt, copie `.env.example` vers `.env` et renseigne `VITE_NEON_URL` avec cette URL de base. Dans le dépôt local actuel, cette variable a déjà été déduite de l’URL Managed Auth existante; vérifie-la avant de la remplacer.
5. Dans l’éditeur SQL Neon, exécute `database/neon-schema.sql`, puis `database/neon-seed.sql`. Le schéma doit être exécuté après l’activation de la Data API. Le SQL d’exemple d’affiche, compatible PostgreSQL/Neon, se trouve dans `database/neon-sample-template.sql`.
6. Installe les dépendances puis lance l’application :

   ```powershell
   npm install
   npm run dev
   ```

Ouvre [http://localhost:5173](http://localhost:5173). Quand le schéma ou les politiques changent, actualise le cache de schéma depuis **Postgres → Data API** dans la console Neon.

L’inscription envoie un code OTP à six chiffres par email. Saisis-le dans le formulaire pour vérifier l’adresse et terminer la création du compte. Si tu avais déjà tenté de t’inscrire, utilise le bouton de renvoi du code.

## Sécurité et administration

Le navigateur utilise une URL de base HTTPS publique, jamais la chaîne PostgreSQL avec son mot de passe. NeonJS dérive les URL Managed Auth et Data API à partir de cette base. Les droits Data API sont limités aux tables de l’application; les anciennes tables Better Auth présentes dans `public` restent privées. L’accès aux lignes est contrôlé par les politiques PostgreSQL RLS dans `database/neon-schema.sql`.

Après avoir créé un compte, trouve son identifiant dans `neon_auth.user`, puis donne-lui le rôle administrateur dans Neon :

```sql
UPDATE user_profiles SET role = 'admin' WHERE id = 'IDENTIFIANT_UTILISATEUR';
```

Les comptes existants de Supabase ne sont pas automatiquement transférés vers Neon Auth; les utilisateurs devront créer un nouveau compte.
