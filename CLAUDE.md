# Flag Quizz

Quiz de drapeaux en Angular 22, construit avec la bibliothèque **Fuda** (`design-system-fuda`). Textes de l'interface, documentation et messages de commit en français ; le site existe aussi en anglais sous `/en/` (voir `README.md`, section Langues).

## Commandes

Node ≥ 22.22.3 (exigé par Angular 22).

| Commande                             | Rôle                                                                         |
| ------------------------------------ | ---------------------------------------------------------------------------- |
| `npm start`                          | Serveur de développement                                                     |
| `npm test`                           | Tests unitaires (Vitest via `ng test`)                                       |
| `npm run lint` / `npm run typecheck` | ESLint (angular-eslint) / tsc sur l'appli et les specs                       |
| `npm run build`                      | Build de production (`dist/flag-quizz/browser`)                              |
| `npm run e2e`                        | Playwright sur ce build : parcours, clavier, mouvement réduit, axe Jour/Nuit |

Une tâche est terminée quand `lint`, `typecheck`, `test` et `build` sont verts, et `e2e` si l'interface, le clavier ou le focus changent.

## Structure

- `src/app/data/` : une fiche par pays (`code`, `mnemonic`, `funFact`), un fichier par continent, assemblées dans `countries.ts`. Le nom français vient de `Intl.DisplayNames` (`country-name.ts`). Les drapeaux sont les SVG de `flag-icons`, copiés dans `flags/4x3/` par `angular.json`.
- `src/app/quiz/quiz.service.ts` : tout l'état de la partie (question, réponse, score, série) en signaux. `COUNTRIES` et `RANDOM` sont des jetons d'injection, remplacés dans les tests pour des tirages reproductibles.
- Un dossier par composant (`flag-card`, `answer-options`, `mnemonic-panel`, `fun-fact`, `map-panel`) avec `.ts`, `.html`, `.scss`. `app` assemble la page.
- `e2e/` : Playwright. Google n'est jamais contacté pendant les tests (l'iframe reçoit une page vide).

## Règles du jeu à ne pas casser

- **Rien ne donne la réponse avant le clic** : astuce, anecdote, carte, nom dans le texte alternatif du drapeau. L'astuce, l'anecdote et la carte n'existent pas dans le DOM avant la réponse (`@if (quiz.isAnswered())` dans `app.html`), pas même sous forme d'encart vide.
- Une question ne se répond qu'une fois (`QuizService.choose` ignore le second clic).
- Le verdict n'a pas d'encart. La bonne réponse passe en bouton `success` (vert) avec une coche, le mauvais choix en `danger` avec une croix, et un texte masqué (`fd-sr`, `aria-live`) l'annonce : il ne repose jamais sur la couleur seule.
- « Drapeau suivant » est un bouton secondaire (le style par défaut de Fuda), pas `primary`.
- **Mise en page** (écran large) : les réponses prennent la hauteur du drapeau et « Drapeau suivant » descend en bas de cette colonne (`margin-top: auto`). En bas de page, l'astuce et l'anecdote sont empilées à gauche et ont ensemble la hauteur de la carte à droite : la carte s'étire avec la colonne, elle n'a pas de hauteur fixe. `e2e/quiz.spec.ts` mesure ces alignements.
- Liens externes, traduits par `Messages` mais vers les mêmes adresses dans les deux langues : « Quiz des capitales » (`https://capitals-quizz.phamelin.fr`) dans l'en-tête, et « portfolio » (`https://phamelin.fr/#projects`) dans le pied de page. Ce sont des `a[fdLink]` ; le lien des capitales est un arrêt de tabulation de plus, avant le sélecteur de thème et le lien de langue.
- Après une réponse, le focus va sur « Drapeau suivant » ; après « suivant », sur la première proposition.
- L'URL de la carte est construite uniquement depuis `countryName(code)`, jamais depuis une saisie : c'est ce qui justifie `bypassSecurityTrustResourceUrl` dans `map-panel.ts`.
- **Tout texte visible passe par `LocaleService`** (`i18n.messages()`, `countryName`, `funFact`) : jamais de chaîne en dur dans un gabarit. Le français est à la racine, l'anglais sous `/en/` ; le même jeu de règles vaut dans les deux langues (rien ne donne la réponse avant le clic, verdict jamais par la couleur seule).
- Un pays ajouté a une astuce et une anecdote dans `data/` **et** dans `mnemonics.en.ts` et `fun-facts.en.ts` ; un texte d'interface ajouté l'est dans `Messages` pour les deux langues (le compilateur et `messages.spec.ts` le vérifient).
- Changer l'`src` d'une iframe déjà chargée ajoute une entrée à l'historique : la carte est recréée (`@for … track`) quand son adresse change, sinon « Retour » annulerait la carte avant la langue.
- Les noms de pays n'ont pas d'article (« Japon », pas « le Japon ») : les phrases sont tournées en conséquence (« La bonne réponse était : Japon »).

## Conventions Angular

Les mêmes que Fuda. Composants standalone, `OnPush` et zoneless par défaut (on ne les répète pas), aucun NgModule. Signaux partout (`input()`, `computed()`, `viewChild()`), pas de `@Input`/`@Output`. Contrôle de flux natif. `host: {}`, pas de `@HostBinding`. `inject()` plutôt que le constructeur. Sélecteurs préfixés `app`. Template et styles dans des fichiers séparés (`templateUrl`, `styleUrl`), `ViewEncapsulation.None`, classes `app-*`.

- Un contenu projeté ne se met pas dans un `@if` à plusieurs nœuds racines (NG8011) : on garde les emplacements `slot=…` en dehors des `@if` et on varie le texte avec une expression.
- `viewChild('x')` sur un `button[fdButton]` donne le composant `FdButton`, pas l'élément : lire avec `{ read: ElementRef }`.
- Les boutons Fuda en `aria-disabled="true"` sont grisés par Fuda ; on les utilise pour les propositions écartées plutôt que `disabled`, qui retirerait le focus. Playwright n'attend pas un élément `aria-disabled` : `click({ force: true })` dans les tests.
- Les surcharges de style d'un composant Fuda doivent être plus spécifiques que lui (`.app-answer-options .app-option`), car l'ordre d'insertion des feuilles dépend du premier rendu.

## Obligatoire sur tout site

- **Une icône d'onglet** (`favicon`) : `public/favicon.svg` (aux couleurs de Fuda), `public/favicon.ico` (16, 32 et 48 px) et `public/apple-touch-icon.png` (180 px), déclarés dans `src/index.html`. Un site sans icône d'onglet n'est pas terminé : l'icône par défaut d'Angular n'est pas acceptable. `e2e/quiz.spec.ts` vérifie que les fichiers répondent.

## Style

Uniquement des custom properties issues des tokens Fuda (couleur, espacement, rayon, police), aucune valeur en dur. Thème Jour par défaut, Nuit par `data-theme="dark"` posé par `FdThemeService` sur choix du joueur ; jamais de `prefers-color-scheme`. Mouvement : celui de Fuda, `prefers-reduced-motion` respecté.

## Dépendance Fuda

Voir `README.md` : installée depuis git (`prepare` construit la lib). La branche visée est dans `package.json` ; la repointer sur `main` quand elle sera fusionnée. Si une icône, une variante ou un composant manque, on l'ajoute dans Fuda, pas ici : le bouton `success` (vert) et le token `tokiwa-press` viennent de là.

## Contenu

Les astuces et les anecdotes sont rédigées à la main, en français dans la fiche et en anglais dans `mnemonics.en.ts` et `fun-facts.en.ts`. Les vérifier avant d'en ajouter : un fait douteux ne vaut rien.

Une astuce suit l'une de ces deux techniques, ou les deux :

- **Voir une image dans le drapeau** : un objet familier (le disque du Japon est le soleil levant, le Népal dessine l'Himalaya, la Suisse est une trousse de secours).
- **Retenir la différence avec les drapeaux jumeaux** : un seul critère net (Irlande verte à la hampe, Côte d'Ivoire orange ; Monaco et Indonésie rouge en haut, Pologne l'inverse ; Australie à la grosse étoile en bas à gauche, comme la grosse île ; Nouvelle-Zélande à quatre étoiles rouges).

Elle ne nomme les jumeaux que s'ils existent, vérifie chaque détail sur le drapeau (côté, ordre des bandes, nombre d'étoiles, couleur du disque et du fond : une astuce fausse est pire que pas d'astuce) et reste courte (une à deux phrases). Elle peut citer le pays, puisqu'elle n'apparaît qu'après la réponse. Pas d'apostrophe droite dans les textes : `countries.spec.ts` impose l'apostrophe typographique (’).

`countries.spec.ts` impose 195 pays, des codes uniques, un drapeau, un nom, une astuce et une anecdote pour chacun dans chaque langue, sans astuce en double.
