# Flag Quizz

Un quiz de drapeaux en Angular, construit avec le design system [Fuda](https://github.com/phamelin42/design-system-fuda).

- Un drapeau s'affiche, quatre pays sont proposés, un seul est le bon.
- Un clic valide ou non la réponse. Le score, la série en cours et le record s'affichent en haut.
- Une fois la réponse donnée apparaissent **un moyen mnémotechnique** pour reconnaître le drapeau (une association avec un objet, un plat, un sport ou la forme du pays, ou la différence avec un drapeau jumeau) et **une anecdote**, en bas à gauche, ainsi que **la carte Google Maps** du pays, en bas à droite. Avant, aucun de ces encarts n'est affiché.
- Un lien en en-tête mène au [quiz des capitales](https://capitals-quizz.phamelin.fr), un autre en pied de page à mon [portfolio](https://phamelin.fr/#projects).
- Les 195 pays (193 membres de l'ONU, le Vatican et la Palestine) sont tirés dans un ordre mélangé, sans répétition jusqu'à épuisement, puis le paquet est refait.
- Deux langues : le français à la racine (`/`), l'anglais sous `/en/`. Un lien dans l'en-tête bascule sans recharger : la partie en cours continue et l'adresse suit (retour arrière compris).
- Thème Jour par défaut, thème Nuit au choix du joueur. Clavier complet, WCAG 2.2 AA vérifié par axe.

## Démarrer

Node ≥ 22.22.3 est requis (Angular 22).

```bash
npm ci
npm start          # http://localhost:4200
```

| Commande                             | Rôle                                                                             |
| ------------------------------------ | -------------------------------------------------------------------------------- |
| `npm test`                           | Tests unitaires (Vitest) : service du quiz, intégrité des 195 fiches, composants |
| `npm run lint` / `npm run typecheck` | ESLint / tsc                                                                     |
| `npm run build`                      | Build de production dans `dist/flag-quizz/browser`                               |
| `npm run e2e`                        | Playwright sur ce build : parcours, clavier, mouvement réduit, axe Jour/Nuit     |

Pour lancer Playwright avec un Chromium déjà installé : `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/chemin/chrome npm run e2e`.

## La dépendance Fuda

Fuda n'est pas publiée sur npm (le paquet `fuda` du registre est un autre projet). `package.json` la prend sur la branche `main` de son dépôt GitHub, et `package-lock.json` fige le commit exact :

```json
"fuda": "git+https://github.com/phamelin42/design-system-fuda.git#main"
```

Le script `prepare` de Fuda construit la bibliothèque à l'installation, ce qui rend `npm ci` plus long. Pour passer à une version plus récente de Fuda : `npm install fuda`. Cette commande réécrit l'adresse en `github:…` et le lockfile en `git+ssh://…`, qui échoue sans clé SSH (en CI, sur Vercel) : **remettre `git+https://github.com/…` à la place dans `package.json` et dans `package-lock.json`** (la clé `fuda` des dépendances et le champ `resolved`), puis vérifier avec `rm -rf node_modules/fuda && npm ci`.

## La carte Google Maps

La carte est une iframe `https://www.google.com/maps?q=<pays>&output=embed&hl=fr`. Cette forme ne demande aucune clé d'API mais n'est pas documentée par Google : si elle cessait de fonctionner, il faudrait passer à la [Maps Embed API](https://developers.google.com/maps/documentation/embed/get-started) avec une clé restreinte par domaine. L'iframe n'est créée qu'après la réponse, donc Google n'est contacté qu'à ce moment-là.

## Langues

La langue vient de l'adresse (`localeFromPath`) : `/en` et `/en/…` sont en anglais, le reste en français. Il n'y a pas de détection de la langue du navigateur.

- `src/app/i18n/messages.ts` : tous les textes de l'interface, par langue (le type `Messages` oblige à les fournir dans les deux).
- `src/app/i18n/locale.service.ts` : la langue courante (signal), `<html lang>`, titre et description de la page, nom, astuce et anecdote d'un pays dans la langue.
- `src/app/i18n/seo.json` : titre et description par langue. `tools/localize-index.mjs`, lancé par `npm run build`, en tire `en/index.html` (même appli, mais `lang`, titre et description déjà anglais). `vercel.json` renvoie `/en` vers cette page.
- La carte Google Maps est demandée dans la langue du site (`hl`).

Ajouter une langue : l'ajouter à `Locale` et `localeFromPath`, fournir ses `Messages`, ses noms de pays (`country-name.ts`), ses astuces et ses anecdotes, puis `seo.json`.

## Ajouter ou corriger un pays

Les fiches sont dans `src/app/data/` (un fichier par continent) : code ISO en minuscules, astuce et anecdote françaises ; l'astuce anglaise va dans `mnemonics.en.ts` et l'anecdote anglaise dans `fun-facts.en.ts`, sous le même code. Les noms viennent de `Intl.DisplayNames`, par langue (surcharges dans `country-name.ts`). Les drapeaux viennent de [flag-icons](https://github.com/lipis/flag-icons) (`flags/4x3/<code>.svg`). `countries.spec.ts` vérifie que chaque fiche a un drapeau, un nom, une astuce et une anecdote dans chaque langue.
