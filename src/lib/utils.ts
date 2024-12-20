import { rm } from 'node:fs/promises';
import { rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scheduler } from 'node:timers/promises';

export function getSourceDirname() {
  if (typeof __dirname !== 'undefined') {
    return path.dirname(__dirname);
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return path.dirname(path.dirname(fileURLToPath(import.meta.url)));
}

export async function sleep(delay: number) {
  await scheduler.wait(delay);
}

export async function rimraf(filepath: string) {
  await rm(filepath, { force: true, recursive: true });
}

export function rimrafSync(filepath: string) {
  rmSync(filepath, { force: true, recursive: true });
}

export function getProperty(target: any, prop: string) {
  const member = target[prop];
  if (typeof member === 'function') {
    return member.bind(target);
  }
  return member;
}

export function getEggOptions() {
  const options = {
    baseDir: process.env.EGG_BASE_DIR ?? process.cwd(),
    framework: process.env.EGG_FRAMEWORK,
  };
  return options;
}
