import { randomBytes, createHash } from 'crypto';

export function simplePascalize(texts: string[]): string {
  return texts
    .map(text => text[0].toUpperCase() + text.slice(1))
    .join('')
}

export function rand(from: number, to: number) {
  return Math.trunc(Math.random() * (to - from) + from);
}

export function generateToken() {
  return randomBytes(32).toString('hex');
}

export function md5Hash(data: string) {
  return createHash('md5').update(data).digest('hex');
}

export function generateRandomNumericCode(length: number) {

  let res = '';

  for (let i = 0; i < length; i++) {
    res += parseInt((Math.random() * 10).toString(10), 10);
  }

  return res;

}

export function joinUrls(base: string, ...affixes: string[]): string {

  if (base.endsWith('/')) base = base.slice(0, -1);
  affixes = affixes.map(it => it.startsWith('/') ? it.slice(1) : it);

  return `${base}/${affixes.join('/')}`;

}
