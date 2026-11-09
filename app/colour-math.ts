export type HSV = { h: number; s: number; v: number };
export const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

export function hexToRgb(hex: string): [number, number, number] {
  return [1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16)) as [number, number, number];
}

export function rgbToHex(rgb: number[]): string {
  return '#' + rgb.map(value => Math.round(clamp(value, 0, 255)).toString(16).padStart(2, '0')).join('').toUpperCase();
}

export function hexToHsv(hex: string): HSV {
  const [r, g, b] = hexToRgb(hex).map(value => value / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min;
  let h = 0;
  if (delta) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h = (h * 60 + 360) % 360;
  }
  return { h, s: max ? delta / max * 100 : 0, v: max * 100 };
}

export function hsvToHex({ h, s, v }: HSV): string {
  const hue = ((h % 360) + 360) % 360 / 60;
  const chroma = clamp(v) / 100 * clamp(s) / 100;
  const x = chroma * (1 - Math.abs(hue % 2 - 1));
  const m = clamp(v) / 100 - chroma;
  const channels = hue < 1 ? [chroma, x, 0] : hue < 2 ? [x, chroma, 0] : hue < 3 ? [0, chroma, x] : hue < 4 ? [0, x, chroma] : hue < 5 ? [x, 0, chroma] : [chroma, 0, x];
  return rgbToHex(channels.map(value => (value + m) * 255));
}
