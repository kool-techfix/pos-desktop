export function generateSalesPersonCode(name: string): string {
  const parts = name.trim().split(/\s+/);

  const initials =
    parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`
      : parts[0].slice(0, 2);

  const normalizedInitials = initials.toUpperCase();

  const number = String(
    Math.floor(1000 + Math.random() * 9000),
  );

  return `${normalizedInitials}${number}`;
}