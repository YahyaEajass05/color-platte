export type StudioColour = { id: string; name: string; hex: string };
export type PaletteDraft = { name: string; colours: StudioColour[] };
export type SavedPalette = PaletteDraft & { id: string; updatedAt: number };
export const STORAGE_KEY = 'weightai-custom-palettes-v1';
export const RETENTION = 7 * 24 * 60 * 60 * 1000;
export const MAX_COLOURS = 32;
export const MAX_PALETTES = 20;
export const blankDraft = (): PaletteDraft => ({ name: 'My custom palette', colours: [] });

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
function validDraft(value: unknown): value is PaletteDraft {
  if (!isRecord(value) || typeof value.name !== 'string' || value.name.length > 80 || !Array.isArray(value.colours) || value.colours.length > MAX_COLOURS) return false;
  const ids = new Set<string>();
  return value.colours.every(c => {
    if (!isRecord(c) || typeof c.id !== 'string' || c.id.length > 100 || ids.has(c.id) || typeof c.name !== 'string' || c.name.length > 40 || typeof c.hex !== 'string' || !/^#[0-9A-F]{6}$/i.test(c.hex)) return false;
    ids.add(c.id); return true;
  });
}
export function restoreStudio(raw: string | null, now = Date.now()): { draft: PaletteDraft; saved: SavedPalette[] } {
  if (!raw) return { draft: blankDraft(), saved: [] };
  const data: unknown = JSON.parse(raw);
  if (!isRecord(data) || data.version !== 1) throw new Error('Unrecognised palette data');
  const fresh = (time: unknown): time is number => typeof time === 'number' && Number.isFinite(time) && time <= now && now - time < RETENTION;
  const saved = Array.isArray(data.saved) ? data.saved.filter((p): p is SavedPalette => isRecord(p) && typeof p.id === 'string' && p.id.length <= 100 && fresh(p.updatedAt) && validDraft(p)).slice(0, MAX_PALETTES) : [];
  return { draft: fresh(data.draftUpdatedAt) && validDraft(data.draft) ? data.draft : blankDraft(), saved };
}
export function paletteCss(draft: PaletteDraft): string {
  return ':root {\n' + draft.colours.map((c, i) => {
    const name = c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'colour';
    return `  --palette-${i + 1}-${name}: ${c.hex.toUpperCase()};`;
  }).join('\n') + '\n}\n';
}
export function paletteJson(draft: PaletteDraft): string {
  return JSON.stringify({ name: draft.name, colours: draft.colours.map(({ name, hex }) => ({ name, hex: hex.toUpperCase() })) }, null, 2);
}
