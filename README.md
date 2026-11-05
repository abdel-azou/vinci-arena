# Vinci Arena

Plateforme web de gestion de tournois e-sport : les membres rejoignent une équipe, les équipes s'inscrivent à un tournoi, et les matchs avancent jusqu'à la finale.

Projet académique réalisé en groupe pour le cours de Conception d'Applications d'Entreprise, Haute École Léonard de Vinci, 2025-2026. Le code est publié sans son historique Git.

## Fonctionnalités

- Inscription, connexion par JWT et rôles membre, responsable et administrateur
- Création d'équipes, demandes d'adhésion et second responsable
- Tournois avec tableau à élimination directe, encodage et correction des résultats
- Sélection des joueurs et gestion des indisponibilités
- Notifications lues et non lues

## Architecture

```text
Navigateur -> Nginx -> Frontend React
                    -> API Spring Boot -> PostgreSQL
```

| Couche | Technologies |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Material UI |
| API | Java 21, Spring Boot 3.3, Spring Security, JPA |
| Base de données | PostgreSQL, H2 pour les tests |
| Tests | JUnit, Mockito, MockMvc, Vitest, Testing Library, Playwright |
| Qualité | Checkstyle, PMD, JaCoCo, ESLint, Prettier |
| Livraison | Docker Compose, Nginx, GitLab CI/CD |

## Lancer le projet

Crée un fichier `.env` à la racine :

```env
APP_DB_NAME=vinci_arena
APP_DB_USER=vinci_arena
APP_DB_PASS=choisis-un-mot-de-passe
JWT_SECRET=choisis-une-longue-valeur-aleatoire
```

Puis lance :

```bash
docker compose up --build
```

L'application est disponible sur `http://localhost`.

## Équipe

Groupe 41 : Yassir Amrani, Khalil Bidi, Kevin Mukoka, Abdellah et Abdelmajid Azouagh.

Ma contribution : développement front-end et back-end, conteneurisation, intégration continue et tests end-to-end.
