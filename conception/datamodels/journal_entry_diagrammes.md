---

## 02/06/2026 — Production des diagrammes de conception

**Objectif : Compléter la documentation de conception avec l'ensemble des diagrammes UML/Merise**

### Diagrammes produits

| Fichier | Type | Outil | Obligatoire REAC |
|---|---|---|---|
| `conception/datamodels/pipeline-ci.puml` | Diagramme d'activité — Pipeline CI/CD | PlantUML | — |
| `conception/datamodels/order_state_diagram.mermaid` | Diagramme d'états — Cycle de vie commande | Mermaid | — |
| `conception/datamodels/mpd.mmd` | Modèle Physique de Données (MPD) | Mermaid erDiagram | ✅ |
| `conception/datamodels/mcd.puml` | Modèle Conceptuel de Données (MCD) — notation Merise | PlantUML | ✅ |
| `conception/datamodels/jwt-sequence.puml` | Diagramme de séquence — Cycle d'authentification JWT | PlantUML | ✅ |
| `conception/datamodels/deployment.puml` | Diagramme de déploiement — Infrastructure VPS/Docker | PlantUML | — |
| `conception/datamodels/use-cases.puml` | Diagramme de cas d'utilisation — 3 acteurs, 21 UC | PlantUML | ✅ |
| `conception/datamodels/class-diagram.puml` | Diagramme de classes — Modèles Prisma + enums | PlantUML | — |
| `conception/datamodels/component-diagram.puml` | Diagramme de composants — Architecture multicouche | PlantUML | — |

Les exports PNG/SVG sont générés via VS Code (extension PlantUML jebbs, `Alt+Shift+D`) et stockés dans `conception/datamodels/`.
