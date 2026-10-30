# Passation Codex — AEEMCI actuel avec Neon

## Objectif

Continuer à faire fonctionner l’application existante React/Vite avec Neon. L’utilisateur veut accéder à la version actuelle. Ne pas reconstruire en Next.js, ne pas créer une V2, ne pas réintroduire Express.

## Architecture retenue

- Frontend actuel React + Vite.
- Neon Managed Better Auth pour les comptes et Neon Data API pour les requêtes de base de données.
- `@neondatabase/neon-js` et son `SupabaseAuthAdapter` conservent les appels d’authentification et `.from()` de l’application.
- La base applique RLS et des privilèges explicites. Les anciennes tables Better Auth dans `public` ne sont pas exposées à la Data API.
- `.env` reste local et ignoré par Git. Ne jamais mettre l’URL PostgreSQL avec mot de passe dans une variable `VITE_*`.

## Travail déjà réalisé le 29 octobre 2026

- Compétences Neon installées dans `.agents/skills/neon` et `.agents/skills/neon-postgres`; `skills-lock.json` est présent.
- Dépendances installées et `package-lock.json` régénéré pour correspondre à `package.json`.
- `src/lib/api.ts` utilise `createClient` et `SupabaseAuthAdapter()`; une adaptation de type documentée contourne un décalage dans les types publics de `@neondatabase/neon-js@0.9.0-beta` (son runtime attend le builder d’adaptateur, mais son overload TypeScript attend l’instance).
- Les pages et `src/stores/authStore.ts` utilisent le client Neon. Le store gère le chargement/création du profil et les courses d’insertion causées par plusieurs événements d’auth.
- `.env` local contient désormais `VITE_NEON_URL`, dérivée de l’URL Managed Auth déjà configurée. Ne pas afficher ni committer les autres valeurs de `.env`.
- Neon Auth répond. La Data API répond sur son endpoint, demande un JWT pour les requêtes de données et accepte les requêtes CORS depuis `http://localhost:5173`.
- Le schéma Neon a été appliqué à la base existante avec une connexion directe. Les tables et politiques RLS sont créées; `user_profiles.id` n’est plus lié à l’ancienne table `public.user`.
- Le projet Neon `aeemci-plateform` (`divine-term-54658811`), organisation `Hamed`, branche `production` (`br-rough-credit-bak2ig0k`) est accessible avec la CLI Neon 8.13.2. Auth Better Auth et Data API sont actifs.
- La configuration email exige une vérification OTP. Le fournisseur email partagé Neon est actif. `Send Email On Sign Up` et `Send Email On Sign In` sont maintenant activés; `Require Verification` reste activé et la méthode reste OTP (le fournisseur partagé ne prend pas en charge les liens).
- Le parcours d’inscription appelle le client Better Auth natif, affiche la saisie du code OTP, propose son renvoi et conserve temporairement nom/délégation en `sessionStorage` jusqu’à création du profil. Le changement évite l’erreur de l’adaptateur Supabase lorsqu’aucune session n’est émise avant vérification.
- Vérification après application : RLS active sur `types_contenus`, `templates`, `user_profiles`, `visuels_generes`; le rôle `authenticated` ne peut pas modifier `user_profiles.role`; les anciennes tables `public.user`, `public.account`, `public.session`, `public.verification` n’ont aucun droit accordé aux rôles `authenticated` ou `anonymous`.
- Les données métier existantes ont été préservées : 6 types, 1 modèle, aucun profil, compte ou visuel. `database/neon-seed.sql` et le modèle d’exemple n’ont pas été réexécutés pour éviter des modifications/doublons.
- `npm run build` réussit.
- `npm run lint` échoue sur 25 erreurs et 5 avertissements déjà présents dans le code de l’application (principalement `any`, `Math.random()` dans `Input.tsx`, et dépendances de hooks). Ces erreurs ne bloquent pas la compilation de production.
- Un démarrage Vite a affiché `http://127.0.0.1:5173/`, mais la vérification HTTP locale a été bloquée par les permissions réseau de l’environnement; le port 5173 avait aussi déjà un listener inconnu. Ne pas tuer ce processus sans l’avoir identifié.

## Suite à faire

1. Reprendre l’état existant avant toute modification. Ne pas réappliquer de seed ni supprimer de tables/données.
2. Vérifier que le navigateur peut charger `http://localhost:5173` dans l’environnement utilisateur. Le projet n’appelle plus `/api/auth/...`; l’authentification doit atteindre l’URL Neon dérivée par le SDK.
3. Faire avec l’utilisateur un test réel : inscription, réception/saisie du code OTP, connexion, restauration de session après rechargement, déconnexion, accès aux tables et création d’un visuel. Aucun compte de test ni adresse email ne doit être inventé. Si l’utilisateur avait déjà soumis le formulaire avant la correction, utiliser le bouton de renvoi OTP proposé après l’erreur de compte déjà existant.
4. Si l’utilisateur doit administrer les modèles, après son inscription récupérer son identifiant Neon Auth puis attribuer le rôle manuellement dans Neon :

   ```sql
   UPDATE user_profiles SET role = 'admin' WHERE id = 'IDENTIFIANT_NEON_AUTH';
   ```

5. Le profil CLI Neon n’est pas authentifié (`neon profile list` indiquait aucun compte). Pour utiliser les fonctions de gestion CLI/Console via l’agent, demander à l’utilisateur de lancer `npx neon@latest auth` dans son terminal et terminer la connexion lui-même. Ne jamais ouvrir une authentification de compte à sa place. La base reste accessible en SQL avec le `DATABASE_URL` déjà présent localement.
6. Le lint nécessite un chantier séparé sur les erreurs préexistantes; ne pas élargir le changement Neon sauf demande explicite.

## Fichiers utiles

- `src/lib/api.ts` — client Neon.
- `src/stores/authStore.ts` — flux auth et profils.
- `database/neon-schema.sql` — tables, grants et règles RLS déjà appliqués à la base.
- `database/neon-seed.sql` — types initiaux; exécuter uniquement sur une base qui ne les contient pas déjà.
- `database/neon-sample-template.sql` — modèle d’exemple; ne pas exécuter si un modèle existe déjà.
- `README.md` — configuration locale et instructions d’administration.

## Documentation Neon

- Migration Supabase vers Neon : <https://neon.com/docs/auth/migrate/from-supabase>
- Démarrage Data API : <https://neon.com/docs/data-api/get-started>
- Neon Auth React : <https://neon.com/docs/auth/quick-start/react>
