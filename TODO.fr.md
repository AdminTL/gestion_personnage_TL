Besoin
======

Général
-------

* Avoir un logiciel pour gérer les fiches de personnage d'un joueur
  * Un joueur peut posséder plusieurs personnages, mais un seul actif
  * Un personnage qui meurt/disparait/... devient inactif
* Facilité la communication entre les gens sur facebook et les autres
* Ne pas forcer les gens à se créer un compte
* Un joueur ne doit pas avoir accès à l'information des autres joueurs
* Une solution qui fonctionne sans Internet
* Une liste d'objet à donner au joueur en début de jeu
* Validation de la fiche de personnage
* Offir un guide rapide de création, comme un manuel de joueur
* Multilangue (fr/eng)

### Futurs besoins

* Gérer des groupes de personnage
* Système de messagerie entre joueur et organisateur
* Support des mobiles (natif ou web)
  * Utilisation du NFC pour recherche rapide d'un joueur.
* Synchronisation et gérer conflit des personnages (deux modifications en même temps)
* Connexion avec compte facebook/google+
* Historique de modification de personnage
* Paiement en ligne
* Réservation de repas auprès du cuisinier

### Communication

Des idées d'amélioration de communication entre joueur et organisateur

* Avoir un blog pour nouvelle et lore
* On focus sur facebook et nouvelle clientèle/vieux joueurs qui n'ont pas facebook
* Un wiki comme mediawiki, voir facebook extension https://www.mediawiki.org/wiki/Category:Facebook_extensions
* Forum non désiré à cause de la maintenance

Utilisateur
-----------

### Type
* [admin] pour l'administration générale
* [consultant] pour gérer tous les personnages
* [accueil] approuve le paiement d'un joueur et attribut des points xp/autre
* [user] utilisateur qui contient un ou plusieurs personnages

### Connectivité
* Déconnexion de la session manuellement. Ne pas avoir d'auto-deconnect.

Navigation
----------
### [Joueur]
* Modification fiche (Level up)
* Création d'un personnage (Nouveau)

### [Consultant]
* Choix de joueur/personnage (Consultation)

### [Accueil]
* Paiment

Permission
----------

Joueur < Consultant < Accueil < Admin

### [Joueur]
* Modification de sa fiche sur type de champs non lié aux habilités
* L'attribution de point d'expérience en approbation

### [Consultant]
* Choix de joueur/personnage (Consultation)
* Modification limité
* Définir l'état du personnage (principal, inactif)

### [Accueil]
* Approbation du point d'xp/autre et du paiement

### [Admin]
* Modification sans restriction

Gestion de point expérience
---------------------------

* Le joueur reçoit 1 XP pour le(s) personnage(s) joué(s) à l'accueil de l'activité
  * L'XP reçu est temporaire jusqu'à la prochaine activité
  * Il peut être utilisé/modifié n'importe quand tant qu'il est temporaire
  * Un admin transforme les XP temporaire en permanent quand ça lui plait (à chaque début de jeu par exemple avant l'ouverture de l'accueil)
* 1 seul xp par habilité/discipline

Début de jeu
------------

Une fois l'entré du joueur est valide :
* Réception du 1 XP
* Liste d'objets (épicerie) à donner au joueur
  * La liste d'objet doit être généré automatique selon les habilités du personnage
  * Piécette/revenu, bloc production, composantes magiques
* Afficher information supplémentaire

Fiche de personnage
-------------------

À compléter

### Champs
* Champs personnels
  * Nom, histoire, autre, groupe
* Commerce
* Quête spécial
* Note consultant visible que par consultant
* Note admin visible que par admin

### Affichage
* Option pour afficher que ses habilités ou toutes les habilités possibles
* Aide/description de chaque habilité
* Suggestion pour nouveau joueur
* La fiche peut être en mode normal ou level up
  * Mode normal, on peut éditer que les champs de description
  * Mode level up, on peut modifier les habilités avec XP temporaire
  * Mode [accueil], donner un xp
  * Mode [admin], modification total
