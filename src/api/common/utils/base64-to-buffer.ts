export function base64ToBuffer(base64: string): Uint8Array {
  if (!base64) {
    throw new Error('Base64 string is required');
  }

  // remove data URL prefix if present
  const base64Data = base64.split(',').pop();
  if (!base64Data) {
    throw new Error('Invalid Base64 string');
  }

  return Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
}
