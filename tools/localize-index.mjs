// Écrit la page d'accueil anglaise (`en/index.html`) à partir de celle du build : même appli, mais la
// langue, le titre et la description sont déjà les bons avant le premier script (moteurs de recherche, partage).
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const dist = process.argv[2] ?? 'dist/flag-quizz/browser';
const seo = JSON.parse(await readFile('src/app/i18n/seo.json', 'utf8'));

const replaceOnce = (html, pattern, replacement) => {
  if (!pattern.test(html)) throw new Error(`Motif introuvable dans index.html : ${pattern}`);
  return html.replace(pattern, replacement);
};

let html = await readFile(join(dist, 'index.html'), 'utf8');
html = replaceOnce(html, /<html lang="fr"/, '<html lang="en"');
html = replaceOnce(html, /<title>[^<]*<\/title>/, `<title>${seo.en.title}</title>`);
html = replaceOnce(
  html,
  /<meta name="description" content="[^"]*"\s*\/?>/,
  `<meta name="description" content="${seo.en.description}" />`,
);

await mkdir(join(dist, 'en'), { recursive: true });
await writeFile(join(dist, 'en', 'index.html'), html);
console.log(`${join(dist, 'en', 'index.html')} écrit.`);
