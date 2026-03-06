CONFIGURE ET CORRIGE COMPLÈTEMENT L’INTÉGRATION SUPABASE DANS MON APPLICATION REACT.

Objectif :
Avoir une application React connectée proprement à Supabase, avec authentification stable, gestion correcte des tokens JWT, et un accès back-office sécurisé avec un Super Admin.

Projet Supabase :
URL : https://gonfmltqggmrieqqbaya.supabase.co
Publishable key : sb_publishable_U8QBMcHHiJhSPk6Se3_BZA_I2XRfnhJ

Instructions techniques :

1. Connexion Supabase

* Installer et configurer @supabase/supabase-js.
* Créer un singleton supabaseClient.
* Utiliser createClient(SUPABASE_URL, SUPABASE_ANON_KEY).
* Laisser le SDK Supabase gérer automatiquement les tokens dans localStorage (clés sb-*).
* Ne pas implémenter de stockage manuel de JWT.

2. Gestion de session

* Utiliser supabase.auth.getSession() au démarrage de l’application.
* Implémenter un AuthContext React global.
* Ajouter un helper getValidToken() qui appelle supabase.auth.getSession() pour récupérer un token toujours valide avec auto-refresh.
* Implémenter logout() avec supabase.auth.signOut() avant nettoyage des states.

3. Nettoyage du projet

* Supprimer tout système DEV_MODE ou mockAuth.
* Supprimer le fichier devMode.ts.
* Supprimer toute donnée mock ou hardcodée dans le backoffice.
* Les modules doivent utiliser uniquement les données venant de Supabase.

4. Backoffice
   Créer un système de rôles utilisateurs dans Supabase :

Table profiles :

* id (uuid)
* email
* role (user | admin | super_admin)
* created_at

Relier profiles.id à auth.users.id.

Créer une règle :
Seuls les utilisateurs avec role = "super_admin" peuvent accéder au backoffice.

5. Création d’un Super Admin
   Créer automatiquement un utilisateur Super Admin au premier déploiement :

email : [admin@julaba.com](mailto:admin@julaba.com)
mot de passe : AdminJulaba2026!

Après création :

* insérer dans la table profiles
* role = "super_admin"

6. Sécurité
   Configurer les Row Level Security policies dans Supabase :

* users peuvent lire leurs propres données
* admins peuvent lire les données nécessaires
* super_admin a accès complet au backoffice

7. Données applicatives
   Migrer toute donnée importante vers Supabase :

* progression academy
* dossiers_validation
* identifications
* marchands
* julaba_recoltes_publiees

Supprimer les données de test locales.

8. LocalStorage
   Conserver uniquement les préférences UI :

* julaba_seen_splash
* julaba_completed_onboarding
* julaba_score_onboarding

Toutes les autres données doivent venir de Supabase.

9. Backoffice interface
   Créer une page /admin accessible uniquement aux super_admin avec :

* dashboard
* gestion utilisateurs
* gestion identifications
* gestion marchands
* gestion récoltes
* gestion validations

10. Vérification
    Ajouter un test de connexion Supabase au démarrage :

* afficher une erreur si la base de données n’est pas accessible
* afficher un message "Supabase connecté" si la connexion est OK.

Objectif final :
Application prête pour production, connectée à Supabase, avec authentification stable, aucun mock, et un accès Super Admin sécurisé au backoffice.
