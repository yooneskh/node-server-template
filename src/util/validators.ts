
const slugRegEx = /^[a-z\-0-9]+$/;
export function isSlug(text: string) {
  return slugRegEx.test(text);
}
