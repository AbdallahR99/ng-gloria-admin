import { join } from 'path';

export function pathLocator(
  lang: string,
  prefix: string = 'i18n',
  suffix: string,
): string {
  return joinPath(
    process.cwd(),
    'public',
    prefix,

    `${lang}${suffix}`,
  );
}

function joinPath(...paths: string[]): string {
  return join(...paths);
}
