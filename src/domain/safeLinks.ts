export function isSafeBookHref(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.startsWith("#") || trimmed.startsWith("https://");
}
