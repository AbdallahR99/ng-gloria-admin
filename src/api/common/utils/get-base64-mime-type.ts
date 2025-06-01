export function getBase64MimeType(base64: string): string | null {
  if (!base64) {
    return null;
  }

  // Check if the base64 string starts with a data URL prefix
  const matches = base64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
  if (matches && matches.length > 1) {
    return matches[1]; // Return the MIME type
  }

  // If no match, guess the MIME type based on the content
  const types = {
    iVBORw0KGgo: 'image/png',
    '/9j/': 'image/jpeg',
    R0lGODlh: 'image/gif',
    AAAB: 'image/bmp', // BMP files often start with 'AAAB'
    R0lGODdh: 'image/gif',
    JVBERi0: 'application/pdf', // PDF
    Qk02U: 'image/bmp',
  };
  for (const [key, type] of Object.entries(types)) {
    if (base64.startsWith(key)) {
      return type; // Return the guessed MIME type
    }
  }
  return null; // If no match found, return null
}
