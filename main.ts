// Kebab Nights — entrypoint for the scoring harness.
//
// Assembles the hand-in folder: the playable game and the screenshots
// are copied into the output directory, then dossier.json is stamped
// with buildDossier so the outline the judge reads is computed from
// exactly the bytes submitted — never from a stale copy.

import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoDir = dirname(fileURLToPath(import.meta.url));
const requested = process.env.MAKEFUN_OUTPUT_DIR ?? 'out';
const outDir = isAbsolute(requested) ? requested : join(repoDir, requested);

mkdirSync(outDir, { recursive: true });
cpSync(join(repoDir, 'game'), join(outDir, 'game'), { recursive: true });
cpSync(join(repoDir, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);

console.log(`kebab-nights: dossier written to ${join(outDir, 'dossier.json')} (${dossier.length} bytes)`);
