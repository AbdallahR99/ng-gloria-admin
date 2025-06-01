// utils/case-converter.ts
export function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, val]) => [
        key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`),
        toSnakeCase(val),
      ])
    );
  }
  return obj;
}

export function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, val]) => [
        key.replace(/_([a-z])/g, (_, g) => g.toUpperCase()),
        toCamelCase(val),
      ])
    );
  }
  return obj;
}
