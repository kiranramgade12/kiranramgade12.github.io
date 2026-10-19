import { cp, mkdir, rm, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const distRoot = path.join(projectRoot, 'dist');
const rootAssets = path.join(projectRoot, 'assets');

await rm(rootAssets, { recursive: true, force: true });
await mkdir(rootAssets, { recursive: true });
await cp(path.join(distRoot, 'assets'), rootAssets, { recursive: true });
await copyFile(path.join(distRoot, 'index.html'), path.join(projectRoot, 'index.html'));
