# GIT notes

git remote -v

push sur repo 5h4r0 [upstream]
**git@github.com:5h4r0/zombiezone.git**

## origin
**connecter repo O-clock-Athenes *moi* pour push sur repo 5h4r0 *PERSO***
git remote set-url origin git@github.com:O-clock-Athenes/ZombieLandSolo-CDA.git
git remote set-url --push origin git@github.com:O-clock-Athenes/ZombieLandSolo-CDA.git

## origin
**connecter repo O-clock-Athenes *PROF* et push sur repo O-clock-Athenes *PROF***
git remote set-url origin git@github.com:O-clock-Athenes/ZombieLandSolo-CDA-PROF.git
git remote set-url --push origin git@github.com:O-clock-Athenes/ZombieLandSolo-CDA-PROF.git

## upstream
**connecter repo 5h4r0 *PROF***
git remote add upstream git@github.com:5h4r0/ZombieLandSolo-CDA-PROF.git

## upstream
**connecter 5h4r0 pour push upstream sur repo 5h4r0 *PERSO***
git remote set-url upstream git@github.com:5h4r0/zombiezone.git
git remote set-url --push upstream git@github.com:5h4r0/zombiezone.git

---

## git remote -v, fetch, push
**sharo@Hastur:/home/sharo/projects/ZombieLand/**
git remote -v

**fetch & push**
git fetch origin
git push origin

git fetch upstream
git push upstream

---

**_Notes-et-fichiers-divers.git**
git remote add upstream git@github.com:5h4r0/\_Notes-et-fichiers-divers.git






---

## Annexe: commit types

*Avant de mettre vos branches de fonctionnalités sur la branche de dev, faites un merge de dev sur votre branche. Vous pourrez régler les potentiels conflits sur votre branche à vous avant de faire votre pull request. Ce qui fait que votre pull request passera à coup sûr.*


| Commit Type | Title                    | Description                                                                                                 | Emoji |
|-------------|--------------------------|-------------------------------------------------------------------------------------------------------------|:-----:|
| `feat`      | Features                 | A new feature                                                                                               |   ✨   |
| `fix`       | Bug Fixes                | A bug Fix                                                                                                   |  🐛   |
| `wip`       | WIP                      | Work in progress                                                                                            |  🐛   |
| `docs`      | Documentation            | Documentation only changes                                                                                  |  📚   |
| `style`     | Styles                   | Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)      |  💎   |
| `refactor`  | Code Refactoring         | A code change that neither fixes a bug nor adds a feature                                                   |  📦   |
| `perf`      | Performance Improvements | A code change that improves performance                                                                     |  🚀   |
| `test`      | Tests                    | Adding missing tests or correcting existing tests                                                           |  🚨   |
| `build`     | Builds                   | Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)         |  🛠   |
| `ci`        | Continuous Integrations  | Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs) |  ⚙️   |
| `chore`     | Chores                   | Other changes that don't modify src or test files                                                           |  ♻️   |
| `revert`    | Reverts                  | Reverts a previous commit                                                                                   |  🗑   |