'use client';

import { useId, useRef, useState, type PointerEvent } from 'react';
import { clamp, hexToHsv, hexToRgb, hsvToHex, rgbToHex, type HSV } from './colour-math';

const presets = [
  '#FFFFFF', '#F4F8FB', '#D8E3EA', '#A8B9C7', '#64748B', '#334155', '#172B3A', '#000000',
  '#B54747', '#D89A64', '#F4CE60', '#A8CBB7', '#287A5B', '#0B6B6D', '#55B9C6', '#16324F',
  '#EF4444', '#F97316', '#EAB308', '#22C55E', '#14B8A6', '#06B6D4', '#2563EB', '#344B8E',
  '#FECACA', '#FED7AA', '#FEF08A', '#DCFCE7', '#CCFBF1', '#CFFAFE', '#DBEAFE', '#E0E7FF',
];

export function PaintPicker({ hex, name, onChange }: { hex: string; name: string; onChange: (hex: string) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const square = useRef<HTMLDivElement>(null);
  const current = useRef<HSV>(hexToHsv(hex));
  const [hsv, setHsv] = useState(current.current);
  const [draft, setDraft] = useState(hex);
  const [invalid, setInvalid] = useState(false);
  const [original, setOriginal] = useState(hex);
  const id = useId();
  const rgb = hexToRgb(hex);

  function open() {
    current.current = hexToHsv(hex);
    setHsv(current.current); setDraft(hex); setInvalid(false); setOriginal(hex);
    dialog.current?.showModal();
  }

  function choose(next: string) {
    current.current = hexToHsv(next);
    setHsv(current.current); setDraft(next); setInvalid(false); onChange(next);
  }

  function changeHsv(next: HSV) {
    current.current = next;
    const value = hsvToHex(next);
    setHsv(next); setDraft(value); setInvalid(false); onChange(value);
  }

  function sample(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    changeHsv({ ...current.current, s: clamp((event.clientX - rect.left) / rect.width * 100), v: clamp(100 - (event.clientY - rect.top) / rect.height * 100) });
  }

  return <>
    <button className="colour-picker paint-trigger" onClick={open} aria-label={`Open paint colour picker for ${name}`} aria-haspopup="dialog" title="Open colour mixer">
      <span style={{ background: hex }} />
    </button>
    <dialog className="paint-dialog" ref={dialog} aria-labelledby={`${id}-title`} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <div className="paint-inner">
        <div className="paint-heading"><div><span>COLOUR STUDIO</span><h2 id={`${id}-title`}>{name}</h2></div><button autoFocus className="paint-close" onClick={() => dialog.current?.close()} aria-label="Close colour picker">×</button></div>
        <div ref={square} className="paint-square" tabIndex={0} role="group" aria-label="Saturation and brightness. Left and right change saturation; up and down change brightness. Hold Shift for larger steps." aria-describedby={`${id}-values`} style={{ backgroundColor: `hsl(${hsv.h} 100% 50%)` }} onPointerDown={event => { if (event.button !== 0) return; event.currentTarget.setPointerCapture(event.pointerId); event.currentTarget.focus(); sample(event); }} onPointerMove={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) sample(event); }} onPointerUp={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }} onKeyDown={event => {
          if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
          event.preventDefault(); const step = event.shiftKey ? 10 : 1;
          changeHsv({ ...current.current, s: clamp(current.current.s + (event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0)), v: clamp(current.current.v + (event.key === 'ArrowUp' ? step : event.key === 'ArrowDown' ? -step : 0)) });
        }}><span className="paint-cursor" style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%`, background: hex }} /></div>
        <span className="sr-only" id={`${id}-values`}>Saturation {Math.round(hsv.s)}%, brightness {Math.round(hsv.v)}%</span>
        <div className="paint-hue-row"><label htmlFor={`${id}-hue`}>Hue</label><input id={`${id}-hue`} className="paint-hue" type="range" min="0" max="360" value={hsv.h} onChange={event => changeHsv({ ...current.current, h: Number(event.target.value) })} /><span>{Math.round(hsv.h)}°</span></div>
        <div className="paint-fields"><label className="paint-hex">HEX<input value={draft} maxLength={7} spellCheck={false} aria-invalid={invalid} aria-describedby={invalid ? `${id}-error` : undefined} onChange={event => {
          const text = event.target.value.toUpperCase(); setDraft(text);
          const normalized = '#' + text.replace(/^#/, ''); const valid = /^#[0-9A-F]{6}$/.test(normalized); setInvalid(!valid);
          if (valid) choose(normalized);
        }} /></label>{(['R', 'G', 'B'] as const).map((channel, i) => <label key={channel}>{channel}<input type="number" min="0" max="255" value={rgb[i]} onFocus={event => event.currentTarget.select()} onChange={event => { const next = [...rgb]; next[i] = clamp(Number(event.target.value), 0, 255); choose(rgbToHex(next)); }} /></label>)}</div>
        {invalid && <p className="paint-error" id={`${id}-error`}>Enter six HEX digits, for example #0B6B6D.</p>}
        <div className="paint-presets-heading"><h3>Colour choices</h3><span>32 presets</span></div>
        <div className="paint-presets">{presets.map(preset => <button key={preset} aria-label={`Choose ${preset}`} aria-pressed={hex === preset} title={preset} style={{ background: preset }} onClick={() => choose(preset)}>{hex === preset && <span aria-hidden="true" className="preset-check" />}</button>)}</div>
        <div className="paint-footer"><button className="paint-original" onClick={() => choose(original)} title="Restore the colour from when this picker opened"><span style={{ background: original }} /> Original</button><div className="paint-current"><span style={{ background: hex }} /><code>{hex}</code></div><button className="paint-done" onClick={() => dialog.current?.close()}>Done</button></div>
        <p className="paint-note">Colours and CSS update live. Esc closes the picker.</p>
      </div>
    </dialog>
  </>;
}
