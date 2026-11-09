'use client';

import { useEffect, useRef, useState } from 'react';
import { PaintPicker } from './paint-picker';

type Colour = { name: string; hex: string; use: string };
type EyeDropperConstructor = new () => {
  open: (options: { signal: AbortSignal }) => Promise<{ sRGBHex: string }>;
};

export function ColourSwatch({ colour, index, value, foreground, onCopy, onChange, onMessage }: {
  colour: Colour;
  index: number;
  value: string;
  foreground: string;
  onCopy: () => void;
  onChange: (hex: string) => void;
  onMessage: (message: string) => void;
}) {
  const [draft, setDraft] = useState(colour.hex);
  const [error, setError] = useState(false);
  const [supported, setSupported] = useState(false);
  const [picking, setPicking] = useState(false);
  const picker = useRef<AbortController | null>(null);
  const errorId = `colour-error-${index}`;

  useEffect(() => {
    setSupported(window.isSecureContext && 'EyeDropper' in window);
    return () => picker.current?.abort();
  }, []);

  useEffect(() => {
    setDraft(colour.hex);
    setError(false);
  }, [colour.hex]);

  function updateDraft(text: string) {
    setDraft(text);
    const hex = `#${text.replace(/^#/, '').toUpperCase()}`;
    const valid = /^#[0-9A-F]{6}$/.test(hex);
    setError(!valid);
    if (valid) onChange(hex);
  }

  async function pickFromScreen() {
    const EyeDropper = (window as Window & { EyeDropper?: EyeDropperConstructor }).EyeDropper;
    if (!EyeDropper) return;
    const controller = new AbortController();
    picker.current = controller;
    setPicking(true);
    try {
      const result = await new EyeDropper().open({ signal: controller.signal });
      onChange(result.sRGBHex.toUpperCase());
      onMessage(`Selected ${result.sRGBHex.toUpperCase()} for ${colour.name}`);
    } catch (reason) {
      if (!controller.signal.aborted && !(reason instanceof DOMException && reason.name === 'AbortError')) {
        onMessage('Screen picker could not open. Use the colour square or HEX field.');
      }
    } finally {
      if (!controller.signal.aborted) setPicking(false);
      picker.current = null;
    }
  }

  return <article className="swatch editable-swatch">
    <button className="swatch-copy" onClick={onCopy} aria-label={`Copy ${colour.name} ${value}`}>
      <div className="colour-block" style={{ background: colour.hex, color: foreground }}>
        <span className="colour-index">{String(index + 1).padStart(2, '0')}</span>
        <span className="copy-icon" aria-hidden="true">⧉</span>
        <span className="colour-value">{value}</span>
      </div>
      <div className="swatch-info"><h3>{colour.name}</h3><p>{colour.use}</p></div>
    </button>
    <div className="colour-editor">
      <PaintPicker hex={colour.hex} name={colour.name} onChange={onChange} />
      <input className="hex-editor" type="text" value={draft} spellCheck={false} autoComplete="off" maxLength={7} aria-label={`HEX code for ${colour.name}`} aria-invalid={error} aria-describedby={error ? errorId : undefined} onChange={event => updateDraft(event.target.value)} onKeyDown={event => {
        if (event.key === 'Escape') { setDraft(colour.hex); setError(false); event.currentTarget.blur(); }
        if (event.key === 'Enter' && !error) event.currentTarget.blur();
      }} />
      {supported && <button className="eyedropper" onClick={pickFromScreen} disabled={picking} aria-label={`Pick ${colour.name} from screen`} title="Pick a colour from your screen (Esc to cancel)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 5 5 5M12 7l5 5M14 9l-9 9-1 3 3-1 9-9M14 5l2-2a2.1 2.1 0 0 1 3 3l-2 2" /></svg>
      </button>}
    </div>
    {error && <p id={errorId} className="hex-error">Use six HEX digits, e.g. #0B6B6D. Esc restores the current colour.</p>}
  </article>;
}
