// Letter-based color mapping for avatars
const LETTER_COLORS: Record<string, string> = {
  A: "#FF6B6B",
  B: "#FF8E53",
  C: "#FFC300",
  D: "#A8FF3E",
  E: "#3EFF8B",
  F: "#3EFFD4",
  G: "#3EC4FF",
  H: "#3E8BFF",
  I: "#6B3EFF",
  J: "#B03EFF",
  K: "#FF3EE0",
  L: "#FF3E8B",
  M: "#FF5733",
  N: "#FF9F1C",
  O: "#CBFF8C",
  P: "#52FFAB",
  Q: "#52E5FF",
  R: "#5271FF",
  S: "#9B52FF",
  T: "#FF52D9",
  U: "#FF6B9B",
  V: "#FFB347",
  W: "#B8FF52",
  X: "#52FFD0",
  Y: "#FF52A0",
  Z: "#52B8FF",
};

export function getLetterColor(name: string): string {
  if (!name || name.trim().length === 0) return "#ffb3b0";
  const letter = name.trim()[0].toUpperCase();
  return LETTER_COLORS[letter] || "#ffb3b0";
}
