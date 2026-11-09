'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { PaintPicker } from '../paint-picker';
import { hsvToHex, rgbToHex } from '../colour-math';
import { blankDraft, MAX_COLOURS, MAX_PALETTES, paletteCss, paletteJson, restoreStudio, RETENTION, STORAGE_KEY, type PaletteDraft, type SavedPalette, type StudioColour } from './studio-data';

const spectrum = Array.from({ length: 8 }, (_, row) => Array.from({ length: 12 }, (_, col) => hsvToHex({ h: col * 30, s: row < 4 ? 22 + row * 26 : 100, v: row < 4 ? 100 : 85 - (row - 4) * 18 }))).flat();
const greys = Array.from({ length: 12 }, (_, i) => rgbToHex([0, 0, 0].map(() => 255 - i * 255 / 11)));

export default function Studio() {
  const [draft, setDraft] = useState<PaletteDraft>(blankDraft);
  const [saved, setSaved] = useState<SavedPalette[]>([]);
  const [selected, setSelected] = useState('#0B6B6D');
  const [ready, setReady] = useState(false);
  const [storageMessage, setStorageMessage] = useState('Loading browser storage…');
  const [storageFailed, setStorageFailed] = useState(false);
  const [message, setMessage] = useState('');
  const [format, setFormat] = useState<'css' | 'json'>('css');
  const [deleted, setDeleted] = useState<SavedPalette | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try { const data = restoreStudio(localStorage.getItem(STORAGE_KEY)); setDraft(data.draft); setSaved(data.saved); }
    catch { setStorageMessage('Previous browser data could not be restored. Export your work to keep a copy.'); setStorageFailed(true); }
    setReady(true);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, []);

  useEffect(() => {
    if (!ready || storageFailed) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, draft, draftUpdatedAt: Date.now(), saved }));
      setStorageMessage('Draft saved in this browser');
    } catch { setStorageMessage('Browser storage is unavailable. You can still edit and export your palette.'); setStorageFailed(true); }
  }, [draft, saved, ready, storageFailed]);

  function announce(text: string) { setMessage(text); if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => setMessage(''), 3500); }
  function addColour() {
    if (draft.colours.length >= MAX_COLOURS) return;
    setDraft(d => ({ ...d, colours: [...d.colours, { id: crypto.randomUUID(), name: `Colour ${d.colours.length + 1}`, hex: selected }] }));
    announce(`${selected} added to palette`);
  }
  function updateColour(id: string, changes: Partial<StudioColour>) { setDraft(d => ({ ...d, colours: d.colours.map(c => c.id === id ? { ...c, ...changes } : c) })); }
  function moveColour(index: number, direction: number) {
    setDraft(d => { const colours = [...d.colours]; const target = index + direction; if (target < 0 || target >= colours.length) return d; [colours[index], colours[target]] = [colours[target], colours[index]]; return { ...d, colours }; });
  }
  function savePalette() {
    if (!draft.colours.length || !draft.name.trim() || saved.length >= MAX_PALETTES) return;
    setSaved(items => [{ ...draft, name: draft.name.trim(), id: crypto.randomUUID(), updatedAt: Date.now() }, ...items]);
    announce(storageFailed ? 'Palette kept for this visit. Export a copy because browser storage is unavailable.' : 'Palette added to your saved collection');
  }
  const code = format === 'css' ? paletteCss(draft) : paletteJson(draft);
  function download() {
    const url = URL.createObjectURL(new Blob([code], { type: format === 'css' ? 'text/css' : 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = `${draft.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'custom-palette'}.${format}`;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    announce(`${format.toUpperCase()} exported`);
  }
  async function copyCode() { try { await navigator.clipboard.writeText(code); announce('Palette code copied'); } catch { announce('Clipboard unavailable. Select the code below to copy it.'); } }

  return <><a className="skip" href="#custom-workspace">Skip to studio</a><header className="topbar studio-topbar"><Link href="/" className="brand"><span className="brandmark" aria-hidden="true"><i /><i /><i /></span>Weight<span>AI</span></Link><nav className="studio-nav" aria-label="Main navigation"><Link href="/">Healthcare palettes</Link><Link href="/custom" aria-current="page">Custom studio</Link></nav></header>
    <main className="custom-studio"><section className="studio-intro" data-enter><div><div className="eyebrow">YOUR OWN COLOUR COLLECTION</div><h1>Make it <em>your palette.</em></h1><p>Mix any colour, collect your favourites, and take them into your next project.</p></div><span className="storage-pill">Browser workspace · 7 days</span></section>
      <div className="studio-workspace" id="custom-workspace">
        <aside className="studio-mixer" aria-label="Colour mixer"><PaintPicker hex={selected} name="Mix a colour" onChange={setSelected} inline /><div className="studio-selected"><span style={{ background: selected }} /><div><small>CURRENT COLOUR</small><strong>{selected}</strong></div></div><button className="studio-primary add-colour" onClick={addColour} disabled={!ready || draft.colours.length >= MAX_COLOURS}>＋ Add to palette</button><p className="studio-help">Drag the square or adjust HEX and RGB. Choose any six-digit colour, then add it to your palette.</p></aside>
        <div className="studio-right"><section className="studio-panel colour-library"><div className="studio-panel-heading"><h2>Colour library</h2><span>108 starting shades</span></div><p>Choose a shade to load it into the mixer.</p><div className="spectrum-grid" aria-label="Colour spectrum">{spectrum.map((hex, i) => <button key={i} style={{ background: hex }} aria-label={`Mix ${hex}`} aria-pressed={selected === hex} title={hex} onClick={() => setSelected(hex)}>{selected === hex && <span className="preset-check" />}</button>)}</div><div className="spectrum-grid neutral-grid" aria-label="Neutral colours">{greys.map(hex => <button key={hex} style={{ background: hex }} aria-label={`Mix ${hex}`} aria-pressed={selected === hex} title={hex} onClick={() => setSelected(hex)}>{selected === hex && <span className="preset-check" />}</button>)}</div></section>
          <section className="studio-panel palette-builder"><div className="studio-panel-heading"><h2>Your palette</h2><span>{draft.colours.length} / {MAX_COLOURS} colours</span></div><label className="palette-name">Palette name<input value={draft.name} maxLength={80} disabled={!ready} onChange={event => setDraft(d => ({ ...d, name: event.target.value }))} placeholder="Give your palette a name" /></label>
            {!draft.colours.length ? <div className="studio-empty"><span aria-hidden="true">＋</span><strong>Your colours belong here</strong><p>Choose a shade above, then select Add to palette.</p></div> : <><div className="palette-ribbon" aria-label="Palette preview">{draft.colours.map(c => <span key={c.id} style={{ background: c.hex }} title={`${c.name}: ${c.hex}`} />)}</div><div className="custom-colour-list">{draft.colours.map((c, i) => <div className="custom-colour-row" key={c.id}><PaintPicker hex={c.hex} name={c.name || `Colour ${i + 1}`} onChange={hex => updateColour(c.id, { hex })} /><label><span className="sr-only">Name for colour {i + 1}</span><input value={c.name} maxLength={40} onChange={event => updateColour(c.id, { name: event.target.value })} /><code>{c.hex}</code></label><div className="colour-row-actions"><button aria-label={`Move colour ${i + 1} earlier`} disabled={i === 0} onClick={() => moveColour(i, -1)}>↑</button><button aria-label={`Move colour ${i + 1} later`} disabled={i === draft.colours.length - 1} onClick={() => moveColour(i, 1)}>↓</button><button aria-label={`Remove colour ${i + 1}`} onClick={() => setDraft(d => ({ ...d, colours: d.colours.filter(item => item.id !== c.id) }))}>×</button></div></div>)}</div></>}
            <div className="studio-builder-actions"><button className="studio-primary" onClick={savePalette} disabled={!ready || !draft.name.trim() || !draft.colours.length || saved.length >= MAX_PALETTES}>Save palette</button><span role="status" className={storageFailed ? 'storage-error' : ''}>{storageMessage}</span></div><p className="studio-help">Save creates a named snapshot. Draft changes are saved automatically. Stored only in this browser for seven days; export a permanent copy.</p></section></div>
      </div>
      <section className="studio-panel studio-saved"><div className="studio-panel-heading"><div><h2>Saved in this browser</h2><p>{saved.length} / {MAX_PALETTES} palettes · available on this device</p></div><button className="studio-secondary" disabled={!ready} onClick={() => { setDraft(blankDraft()); announce('New empty draft started. Saved palettes are still available below.'); }}>New palette</button></div>
        {deleted && <div className="studio-undo">Palette removed.<button disabled={saved.length >= MAX_PALETTES} onClick={() => { setSaved(items => [deleted, ...items]); setDeleted(null); }}>Undo</button></div>}
        {!saved.length ? <p className="saved-empty">Your saved palettes will appear here. Build your first collection above.</p> : <div className="saved-palette-grid">{saved.map(p => <article key={p.id} className="saved-palette"><div className="palette-ribbon">{p.colours.map(c => <span key={c.id} style={{ background: c.hex }} />)}</div><h3>{p.name}</h3><p>{p.colours.length} colours · expires {new Date(p.updatedAt + RETENTION).toLocaleDateString()}</p><div><button className="studio-secondary" onClick={() => { setDraft({ name: p.name, colours: p.colours }); announce(`${p.name} loaded into your draft`); document.getElementById('custom-workspace')?.scrollIntoView({ behavior: 'instant' }); }}>Load palette</button><button className="saved-remove" aria-label={`Remove saved palette ${p.name}`} onClick={() => { setDeleted(p); setSaved(items => items.filter(item => item.id !== p.id)); }}>Remove</button></div></article>)}</div>}
      </section>
      <section className="studio-panel studio-export"><div className="studio-panel-heading"><div><h2>Ready for your project</h2><p>Preview, copy, or download your current palette.</p></div><div className="studio-export-actions"><label className="sr-only" htmlFor="export-format">Export format</label><select id="export-format" value={format} onChange={event => setFormat(event.target.value as 'css' | 'json')}><option value="css">CSS variables</option><option value="json">JSON</option></select><button className="studio-secondary" disabled={!draft.colours.length} onClick={copyCode}>Copy code</button><button className="studio-primary" disabled={!draft.colours.length} onClick={download}>Export {format.toUpperCase()}</button></div></div><pre tabIndex={0} aria-label="Custom palette export code"><code>{code}</code></pre></section>
    </main><footer><Link href="/">WeightAI / Colour system</Link><span>Your colours, your collection.</span></footer><div className={`toast ${message ? 'show' : ''}`} role="status" aria-live="polite">{message}</div></>;
}
