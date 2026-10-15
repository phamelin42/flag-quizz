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

**Toute modification de code finit par une PR** : on commit, on pousse la branche de travail, puis on ouvre la PR vers `main` sans attendre qu'on la demande (après vérification qu'il n'en existe pas déjà une ouverte pour cette branche). Une PR déjà fusionnée ne suit plus la branche : le travail suivant repart de `main` et ouvre une nouvelle PR.

## Structure

- `src/app/data/` : une fiche par pays (`code`, `mnemonic`, `funFact`), un fichier par continent, assemblées dans `countries.ts`. Le nom français vient de `Intl.DisplayNames` (`country-name.ts`). Les drapeaux sont les SVG de `flag-icons`, copiés dans `flags/4x3/` par `angular.json`.
- `src/app/quiz/quiz.service.ts` : tout l'état de la partie (question, réponse, score, série) en signaux. `COUNTRIES` et `RANDOM` sont des jetons d'injection, remplacés dans les tests pour des tirages reproductibles.
- Un dossier par composant (`flag-card`, `answer-options`, `mnemonic-panel`, `fun-fact`, `map-panel`) avec `.ts`, `.html`, `.scss`. `app` assemble la page.
- `e2e/` : Playwright. OpenStreetMap n'est jamais contacté pendant les tests (l'iframe reçoit une page vide).

## Règles du jeu à ne pas casser

- **Rien ne donne la réponse avant le clic** : astuce, anecdote, carte, nom dans le texte alternatif du drapeau. L'astuce, l'anecdote et la carte n'existent pas dans le DOM avant la réponse (`@if (quiz.isAnswered())` dans `app.html`), pas même sous forme d'encart vide.
- Une question ne se répond qu'une fois (`QuizService.choose` ignore le second clic).
- Le verdict n'a pas d'encart. La bonne réponse passe en bouton `success` (vert) avec une coche, le mauvais choix en `danger` avec une croix, et un texte masqué (`fd-sr`, `aria-live`) l'annonce : il ne repose jamais sur la couleur seule.
- « Drapeau suivant » est un bouton secondaire (le style par défaut de Fuda), pas `primary`.
- **Mise en page** (écran large) : les réponses prennent la hauteur du drapeau et « Drapeau suivant » descend en bas de cette colonne (`margin-top: auto`). En bas de page, l'astuce et l'anecdote sont empilées à gauche et ont ensemble la hauteur de la carte à droite : la carte s'étire avec la colonne, elle n'a pas de hauteur fixe. `e2e/quiz.spec.ts` mesure ces alignements.
- Liens externes, traduits par `Messages` mais vers les mêmes adresses dans les deux langues : « Quiz des capitales » (`https://capitals-quizz.phamelin.fr`) et « portfolio » (`https://phamelin.fr/#projects`), tous deux dans le pied de page (comme le lien vers ce quiz dans celui de capital-quizz). Ce sont des `a[fdLink]` ; l'en-tête n'a que les statistiques, le sélecteur de thème et le lien de langue.
- Après une réponse, le focus va sur « Drapeau suivant » ; après « suivant », sur la première proposition.
- La carte est OpenStreetMap (pas Google : pas de lien « Ouvrir dans Maps »). Son URL est construite uniquement depuis le code du pays et `country-bounds.ts`, jamais depuis une saisie : c'est ce qui justifie `bypassSecurityTrustResourceUrl` dans `map-panel.ts`.
- **Tout texte visible passe par `LocaleService`** (`i18n.messages()`, `countryName`, `funFact`) : jamais de chaîne en dur dans un gabarit. Le français est à la racine, l'anglais sous `/en/` ; le même jeu de règles vaut dans les deux langues (rien ne donne la réponse avant le clic, verdict jamais par la couleur seule).
- Un pays ajouté a une astuce et une anecdote dans `data/` **et** dans `mnemonics.en.ts` et `fun-facts.en.ts`, et son cadre de carte dans `country-bounds.ts` (généré : on relance `tools/build-country-bounds.mjs`, jamais à la main) ; un texte d'interface ajouté l'est dans `Messages` pour les deux langues (le compilateur et `messages.spec.ts` le vérifient).
- Changer l'`src` d'une iframe déjà chargée ajoute une entrée à l'historique : la carte est recréée (`@for … track`) quand son adresse change (nouveau pays), sinon « Retour » annulerait la carte avant la navigation.
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

Voir `README.md` : installée depuis git (`prepare` construit la lib). Elle suit la branche `main` de Fuda, au commit figé par `package-lock.json`. Après `npm install fuda`, remettre `git+https` à la place de `github:` et de `git+ssh` (package.json et lockfile : voir `README.md`). Si une icône, une variante ou un composant manque, on l'ajoute dans Fuda, pas ici : le bouton `success` (vert) et le token `tokiwa-press` viennent de là.

## Contenu

Le cadre astuce propose « Proposer une meilleure astuce » (`suggest-tip-url.ts`), un ticket GitHub pré-rempli via `.github/ISSUE_TEMPLATE/astuce.yml`. C'est le seul stockage des propositions : on les relit chaque semaine et on ne retient que celles qui sont de vraies astuces (associer ou comparer, 200 caractères au plus, détails vérifiés sur le drapeau). Le lien n'existe qu'après la réponse, comme tout le cadre.

Les astuces et les anecdotes sont rédigées à la main, en français dans la fiche et en anglais dans `mnemonics.en.ts` et `fun-facts.en.ts`. Les vérifier avant d'en ajouter : un fait douteux ne vaut rien.

**Une astuce est un moyen mnémotechnique, pas une description.** Un moyen mnémotechnique est un procédé verbal, visuel ou logique qui facilite la mémorisation. Pour un drapeau, il **associe** un détail du drapeau à une image de la vie réelle, ou le **compare** à un autre drapeau. Si le texte pourrait se lire sans connaître le pays et ne fait que dire ce qu'on voit (« un damier rouge et blanc au centre »), ce n'est pas une astuce.

Les associations qui marchent :

- **Un objet, un plat, un lieu familier** : Japon, un bento « hinomaru » (riz blanc, prune rouge) ; Italie, une pizza margherita ; Suisse, le couteau suisse ; Suède, un magasin IKEA ; Grèce, les maisons blanches aux toits bleus de Santorin.
- **Le sport, la culture** : Croatie, le maillot à damier de l'équipe de foot ; Argentine, le maillot bleu ciel et blanc ; Ghana, les « Black Stars ».
- **La forme ou la géographie du pays** : Madagascar, le rouge et le vert dessinent le pays et la bande blanche est la mer ; Gambie, le ruban du fleuve ; Vanuatu, l'archipel en forme de Y ; Cap-Vert, dix îles en fer à cheval.
- **Le sens ou le son du nom** : Slovénie, Triglav veut dire « trois têtes », donc trois sommets et trois étoiles ; Équateur, la ligne passe par le pays ; Arménie, l'abricot (Prunus armeniaca).
- **Une phrase ou une image qui retient l'ordre** : « Oranje boven » (Pays-Bas), « broad white on top » (Union Jack), un feu tricolore couché (Mali) ou debout (Bolivie).
- **La différence avec un drapeau jumeau**, en une phrase nette : Australie, une grosse étoile pour la grosse île, Nouvelle-Zélande, de petites étoiles ; Irlande, le trèfle vert collé au mât, Côte d'Ivoire, son reflet dans un miroir ; Monaco presque carré, l'Indonésie plus longue.

L'astuce **n'est pas l'anecdote** : elle associe, l'anecdote raconte (histoire, légende, date). Elles ne répètent pas le même fait (`countries.spec.ts` le vérifie). Elle reste courte (une à deux phrases, 200 caractères au plus), peut citer le pays puisqu'elle n'apparaît qu'après la réponse, et vérifie chaque détail sur le drapeau (côté, ordre des bandes, nombre d'étoiles, couleur du disque et du fond : une astuce fausse est pire que pas d'astuce). Pas d'apostrophe droite dans les textes : on écrit l'apostrophe typographique (’).

`countries.spec.ts` impose 195 pays, des codes uniques, un drapeau, un nom, une astuce et une anecdote pour chacun dans chaque langue, sans astuce en double.
