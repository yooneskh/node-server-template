export function simplePascalize(texts: string[]): string {
  return texts
    .map(text => text[0].toUpperCase() + text.slice(1))
    .join('')
}
