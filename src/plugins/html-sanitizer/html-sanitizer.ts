import sanitizeHtml from 'sanitize-html';

export function sanitizelHtmlStrict(htmlText: string): string {
  return sanitizeHtml(htmlText, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'discard'
  });
}

export function sanitizelHtmlBasic(htmlText: string): string {
  return sanitizeHtml(htmlText);
}
