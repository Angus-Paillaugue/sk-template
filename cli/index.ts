#!/usr/bin/env node
import path from 'node:path';
import { input } from '@inquirer/prompts';
import { execSync } from 'node:child_process';
import { readFile, rename, writeFile, rm } from 'node:fs/promises';

type Replacement = { from: RegExp | string; to: string };
interface Questions {
  projectName: string;
  websiteName: string;
  websiteOrigin: string;
}

const HERE = process.cwd();

async function replaceInFile(filePath: string, replacements: Replacement[]) {
  let content = await readFile(filePath, 'utf-8');
  for (const { from, to } of replacements) {
    content = content.replace(from, to);
  }
  await writeFile(filePath, content, 'utf-8');
}

function randomString(length: number = 16) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function askQuestions(): Promise<Questions> {
  const projectName = await input({
    message: 'What is your project name?',
    default: 'my-app',
  });
  const websiteName = await input({
    message: 'What is your website name (pretty version of the project name)?',
    default: 'My app',
  });
  const UIWebsiteOrigin = await input({
    message: 'What is your website url ?',
    default: 'http://localhost:5173',
  });

  return { projectName, websiteName, websiteOrigin: UIWebsiteOrigin };
}

async function bootstrap({ projectName, websiteName, websiteOrigin }: Questions) {
  const projectPath = path.join(HERE, projectName);
  const POSTGRES_PASSWORD = randomString(30);
  const POSTGRES_USER = projectName + '_user';

  await rename(path.join(projectPath, '.env.example'), path.join(projectPath, '.env'));
  // replace in .env
  await replaceInFile(path.join(projectPath, '.env'), [
    { from: /POSTGRES_USER=.*/g, to: `POSTGRES_USER="${POSTGRES_USER}"` },
    { from: /POSTGRES_PASSWORD=.*/g, to: `POSTGRES_PASSWORD="${POSTGRES_PASSWORD}"` },
    { from: /POSTGRES_DB=.*/g, to: `POSTGRES_DB="${projectName}"` },
    { from: /JWT_SECRET=.*/g, to: `JWT_SECRET="${randomString(50)}"` },
  ]);

  // Replace in package.json
  await replaceInFile(path.join(projectPath, 'package.json'), [
    { from: /"name": ".*"/g, to: `"name": "${projectName}"` },
    { from: /"description": ".*"/g, to: `"description": "My ${websiteName} app"` },
    { from: /"version": ".*"/g, to: `"version": "0.0.1"` },
  ]);

  // Replace in sql/init.sql
  await replaceInFile(path.join(projectPath, 'sql', 'init.sql'), [
    { from: /<POSTGRES_DB>/g, to: `"${projectName}` },
    { from: /<POSTGRES_USER>/g, to: `"${POSTGRES_USER}"` },
  ]);

  // Replace in config.json
  await replaceInFile(path.join(projectPath, 'config.json'), [
    { from: /"project_name": ".*"/g, to: `"project_name": "${projectName}"` },
    { from: /"website_name": ".*"/g, to: `"website_name": "${websiteName}"` },
    { from: /"origin": ".*"/g, to: `"origin": "${websiteOrigin}"` },
  ]);

  // Replace in src/lib/i18n/messages/en.json
  await replaceInFile(path.join(projectPath, 'src', 'lib', 'i18n', 'messages', 'en.json'), [
    { from: /<PROJECT_NAME>/g, to: websiteName },
  ]);
}

async function removeFiles(projectName: string, paths: string[]) {
  paths = paths.map((p) => path.join(path.join(HERE, projectName), p));
  for (const p of paths) {
    if (p.endsWith('/')) {
      await rm(p, {
        recursive: true,
        force: true,
      });
    } else {
      await rm(p);
    }
  }
}

(async () => {
  console.log('🚀 Welcome to sk-template!');

  const answers = await askQuestions();

  // Clone the project
  execSync(`git clone https://github.com/Angus-Paillaugue/sk-template ${answers.projectName}`, {
    stdio: 'inherit',
  });

  await removeFiles(answers.projectName, [
    '.git/',
    'cli/',
    'docker-compose.dev.yaml',
    'sql/init.dev.sql',
  ]);

  await bootstrap(answers);

  console.log(`\n✅ Project ${answers.projectName} created!`);
  console.log(`\nNext steps:\n`);
  console.log(`  cd ${answers.projectName}`);
  console.log(`  bun install`);
  console.log(`  bun run dev`);
})();
