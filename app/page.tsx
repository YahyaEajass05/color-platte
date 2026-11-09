'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ColourSwatch } from './colour-swatch';

type Colour = {name:string;hex:string;use:string};
const initialPalettes:{name:string;label:string;description:string;colours:Colour[];reasons:string[]}[] = [
 {name:'Clinical teal & medical blue',label:'Healthcare + AI',description:'A balance of clinical trust and thoughtful technology.',reasons:['Professional healthcare appearance','Clear hierarchy for medical monitoring','A considered balance of healthcare and technology'],colours:[
 {name:'Deep medical teal',hex:'#0B6B6D',use:'Primary buttons'}, {name:'Navy blue',hex:'#16324F',use:'Navigation & headings'}, {name:'Soft cyan',hex:'#55B9C6',use:'AI highlights & charts'}, {name:'Ice white',hex:'#F4F8FB',use:'Main background'}, {name:'Pure white',hex:'#FFFFFF',use:'Cards & panels'}, {name:'Dark slate',hex:'#172B3A',use:'Main typography'}, {name:'Muted grey',hex:'#64748B',use:'Secondary text'}, {name:'Border grey',hex:'#D8E3EA',use:'Borders & dividers'}]},
 {name:'Modern AI & technology blue',label:'AI / Technology',description:'A sharper, digital-first direction for analytical interfaces.',reasons:['A modern AI and ML identity','Distinct accents for sensor monitoring','A broad palette for data visualisation'],colours:[{name:'Electric blue',hex:'#1D4ED8',use:'Primary actions'},{name:'Midnight navy',hex:'#0F172A',use:'Navigation'},{name:'Technology cyan',hex:'#06B6D4',use:'AI indicators'},{name:'AI purple',hex:'#7C3AED',use:'AI highlights'},{name:'Light slate',hex:'#F1F5F9',use:'Background'},{name:'White',hex:'#FFFFFF',use:'Cards'},{name:'Text slate',hex:'#1E293B',use:'Typography'}]},
 {name:'Premium healthcare & wellness',label:'Patient / Wellness',description:'A warmer, calmer direction for patient-facing experiences.',reasons:['Calm and welcoming healthcare experience','A human-centred wellness identity','Soft backgrounds for patient-facing applications'],colours:[{name:'Forest green',hex:'#2F6B5F',use:'Primary buttons'},{name:'Sage green',hex:'#A8CBB7',use:'Secondary elements'},{name:'Soft mint',hex:'#EAF3EC',use:'Background highlights'},{name:'Warm orange',hex:'#D89A64',use:'Important indicators'},{name:'Cream white',hex:'#FAF8F3',use:'Main background'},{name:'Dark green',hex:'#283A35',use:'Typography'},{name:'White',hex:'#FFFFFF',use:'Cards'}]}
 ,{name:'Clear blue & arctic white',label:'Clinical / Clarity',description:'Deep blue actions and crisp surfaces for clinical records and care coordination.',reasons:['Dark blue actions on light surfaces','Neutral backgrounds for clinical records','Separate cyan accents for AI insights'],colours:[
 {name:'Clinical blue',hex:'#175CD3',use:'Primary buttons'},
 {name:'Deep ocean',hex:'#12304A',use:'Navigation & headings'},
 {name:'Arctic cyan',hex:'#67C6D0',use:'AI highlights & charts'},
 {name:'Arctic white',hex:'#F5F9FC',use:'Main background'},
 {name:'Pure white',hex:'#FFFFFF',use:'Cards & panels'},
 {name:'Ink blue',hex:'#1D2939',use:'Main typography'},
 {name:'Steel grey',hex:'#526579',use:'Secondary text'},
 {name:'Mist border',hex:'#D5E2EC',use:'Borders & dividers'}]},
 {name:'Deep indigo & glacier',label:'AI / Research',description:'A blue indigo foundation for research tools, imaging workflows, and model insights.',reasons:['Defined hierarchy for analytical tools','Glacier accents for model insights','Pale surfaces for dense information'],colours:[
 {name:'Research indigo',hex:'#344B8E',use:'Primary buttons'},
 {name:'Midnight ink',hex:'#182742',use:'Navigation & headings'},
 {name:'Glacier blue',hex:'#7CC6DE',use:'AI highlights & charts'},
 {name:'Cloud white',hex:'#F5F7FC',use:'Main background'},
 {name:'Pure white',hex:'#FFFFFF',use:'Cards & panels'},
 {name:'Graphite blue',hex:'#243247',use:'Main typography'},
 {name:'Blue grey',hex:'#5D6C83',use:'Secondary text'},
 {name:'Cloud border',hex:'#DCE3F0',use:'Borders & dividers'}]},
 {name:'Aqua & coastal navy',label:'Remote / Monitoring',description:'A fresh aqua direction for connected care, wearable data, and remote monitoring.',reasons:['Deep aqua actions with white labels','Navy anchors for monitoring interfaces','Sea glass accents for sensor charts'],colours:[
 {name:'Deep aqua',hex:'#087F8C',use:'Primary buttons'},
 {name:'Coastal navy',hex:'#183B50',use:'Navigation & headings'},
 {name:'Sea glass',hex:'#73D2C6',use:'AI highlights & charts'},
 {name:'Coastal white',hex:'#F2FAFA',use:'Main background'},
 {name:'Pure white',hex:'#FFFFFF',use:'Cards & panels'},
 {name:'Marine slate',hex:'#203740',use:'Main typography'},
 {name:'Coastal grey',hex:'#547079',use:'Secondary text'},
 {name:'Aqua mist',hex:'#D3E7E7',use:'Borders & dividers'}]},
 {name:'Warm stone & deep teal',label:'Patient / Care',description:'Soft stone surfaces and restrained teal for appointments, care plans, and patient portals.',reasons:['Warm neutral backgrounds for patient tools','Deep teal actions for a clear next step','Muted gold accents for non-status highlights'],colours:[
 {name:'Care teal',hex:'#236B65',use:'Primary buttons'},
 {name:'Deep charcoal',hex:'#293B3A',use:'Navigation & headings'},
 {name:'Muted gold',hex:'#C9A66B',use:'Non-status highlights'},
 {name:'Warm stone',hex:'#F8F7F3',use:'Main background'},
 {name:'Pure white',hex:'#FFFFFF',use:'Cards & panels'},
 {name:'Charcoal ink',hex:'#283633',use:'Main typography'},
 {name:'Stone grey',hex:'#626F69',use:'Secondary text'},
 {name:'Stone border',hex:'#DFE4DD',use:'Borders & dividers'}]}
];
const semantic = [{name:'Success',hex:'#287A5B',use:'Successful measurement',symbol:'✓'},{name:'Warning',hex:'#B7791F',use:'Sensor warning',symbol:'!'},{name:'Error',hex:'#B54747',use:'Measurement failure',symbol:'×'},{name:'Information',hex:'#2563EB',use:'System information',symbol:'i'},{name:'Processing',hex:'#55B9C6',use:'AI processing',symbol:'↻'}];
function luminance(hex:string){const c=hex.slice(1).match(/../g)!.map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2]}
function Icon({kind}:{kind:'copy'|'download'|'arrow'}){return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{kind==='copy'?<><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/></>:kind==='download'?<><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/></>:<path d="M5 12h14m-5-5 5 5-5 5"/>}</svg>}
export default function Home(){
 const [palettes,setPalettes]=useState(initialPalettes);
 const [resetVersion,setResetVersion]=useState(0);
 const [active,setActive]=useState(0);const [toast,setToast]=useState('');const [format,setFormat]=useState<'HEX'|'RGB'>('HEX');const palette=palettes[active];
 function changeColour(index:number,hex:string){setPalettes(current=>current.map((p,paletteIndex)=>paletteIndex===active?{...p,colours:p.colours.map((c,colourIndex)=>colourIndex===index?{...c,hex}:c)}:p))}
 function resetPalette(){setPalettes(current=>current.map((p,i)=>i===active?initialPalettes[i]:p));setResetVersion(v=>v+1);announce('Original palette restored')}
 function announce(message:string){setToast(message);window.setTimeout(()=>setToast(current=>current===message?'':current),2500)}
 async function copy(value:string,message?:string){try{await navigator.clipboard.writeText(value);announce(message ?? `Copied ${value}`)}catch{announce('Clipboard unavailable. Select and copy the displayed value.')}}
 const css=()=>`:root {\n${palette.colours.map(c=>`  --colour-${c.name.toLowerCase().replaceAll(' ','-')}: ${c.hex};`).join('\n')}\n\n${semantic.map(c=>`  --status-${c.name.toLowerCase()}: ${c.hex};`).join('\n')}\n}\n`;
 function download(){const url=URL.createObjectURL(new Blob([css()],{type:'text/css'}));const a=document.createElement('a');a.href=url;a.download=`weightai-palette-${active+1}.css`;a.click();URL.revokeObjectURL(url);announce('CSS tokens exported')}
 const display=(hex:string)=>format==='HEX'?hex:`${hex.slice(1).match(/../g)!.map(v=>parseInt(v,16)).join(', ')}`;
 return <><a className="skip" href="#palette">Skip to colours</a><header className="topbar"><a href="#" className="brand"><span className="brandmark" aria-hidden="true"><i/><i/><i/></span>Weight<span>AI</span><span className="branddivider"/> <small>Design system</small></a><div className="header-right"><Link className="custom-studio-link" href="/custom">Custom studio</Link><span className="version"><span className="dot"/> Colour library · v1.0</span><button className="export" onClick={download}><Icon kind="download"/> Export palette</button></div></header>
 <main><section className="intro" data-enter><div className="eyebrow"><span/> THE HEALTHCARE COLLECTION</div><div className="intro-row"><div><h1>Colour with <em>care.</em></h1><p>Purposeful palettes for healthcare and AI.<br/>Built for clarity, confidence, and a more human experience.</p></div><div className="intro-note"><span className="mini-palette"><i/><i/><i/><i/></span><span>{palettes.length} directions. One thoughtful system.<br/><strong>Find the right colour for every interaction.</strong></span></div></div></section>
 <section id="palette" className="palette-section" aria-labelledby="palette-heading"><div className="section-top"><div className="section-label"><span>01</span><h2 id="palette-heading">Choose your direction</h2></div><span className="subtle">Made for healthcare. Ready for the web.</span></div><div className="palette-options" role="tablist" aria-label="Colour palettes">{palettes.map((p,i)=><button key={p.name} role="tab" id={`tab-${i}`} aria-controls="palette-panel" aria-selected={active===i} tabIndex={active===i?0:-1} className={`palette-option ${active===i?'selected':''}`} onClick={()=>setActive(i)} onKeyDown={e=>{if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?palettes.length-1:(i+(e.key==='ArrowRight'?1:-1)+palettes.length)%palettes.length;setActive(n);document.getElementById(`tab-${n}`)?.focus()}}}><div className="option-top"><span className="option-number">0{i+1}</span><span className="option-label">{i===0?'RECOMMENDED':p.label.toUpperCase()}</span><span className="radio">{active===i?'✓':''}</span></div><h3>{p.name}</h3><div className="option-strip">{p.colours.slice(0,5).map(c=><span key={c.name} style={{background:c.hex}}/>)}</div></button>)}</div>
 <div id="palette-panel" role="tabpanel" aria-labelledby={`tab-${active}`}><div className="palette-title"><div><div className="title-line"><h2>{palette.name}</h2><span className="tag">{palette.label}</span></div><p>{palette.description}</p></div><div className="format-control" aria-label="Colour format">{(['HEX','RGB'] as const).map(f=><button key={f} aria-pressed={format===f} className={format===f?'active':''} onClick={()=>setFormat(f)}>{f}</button>)}</div></div><div className="editor-toolbar"><p>Choose a colour, edit its HEX code, or use the screen picker when available. Changes last until you refresh.</p><button className="reset-palette" onClick={resetPalette}>Reset palette</button></div><div className="swatch-grid">{palette.colours.map((c,i)=><ColourSwatch key={`${active}-${resetVersion}-${c.name}`} colour={c} index={i} value={display(c.hex)} foreground={luminance(c.hex)>.179?'#000000':'#FFFFFF'} onCopy={()=>copy(format==='HEX'?c.hex:`rgb(${display(c.hex)})`)} onChange={hex=>changeColour(i,hex)} onMessage={announce}/>)}</div><div className="palette-bottom"><div className="reasons">{palette.reasons.map(r=><span key={r}><span className="check">✓</span>{r}</span>)}</div><span className="copy-hint"><Icon kind="copy"/> Click a swatch to copy</span></div></div></section>
 <section className="semantic-section" aria-labelledby="semantic-heading"><div className="section-top"><div className="section-label"><span>02</span><h2 id="semantic-heading">A shared language for status</h2></div><span className="subtle">Consistent across every palette</span></div><div className="semantic-grid">{semantic.map(c=><button key={c.name} className="semantic-card" onClick={()=>copy(c.hex)} aria-label={`Copy ${c.name} ${c.hex}`}><div className="semantic-top"><span className="status-symbol" style={{color:c.hex,background:`${c.hex}14`}}>{c.symbol}</span><Icon kind="copy"/></div><h3>{c.name}<span style={{background:c.hex}}/></h3><code>{c.hex}</code><p>{c.use}</p></button>)}</div><div className="guidance"><span className="info-circle">i</span><p><strong>Colour communicates status, not health.</strong> Pair status colours with labels or icons. Keep estimated weight separate from uncertainty, and never use green to imply a weight is medically healthy.</p></div></section>
 <details className="token-code"><summary>View live CSS code</summary><div className="code-heading"><span>Selected palette ? updates as you edit</span><button onClick={()=>copy(css(),'CSS tokens copied')}>Copy CSS</button></div><pre aria-label="Current palette CSS tokens"><code>{css()}</code></pre></details><section className="tokens-section" aria-labelledby="tokens-heading"><div><span className="eyebrow">FROM PALETTE TO PRODUCT</span><h2 id="tokens-heading">Your colours, ready to build.</h2><p>Take the selected palette into your next healthcare interface.</p></div><button onClick={download}>Download CSS tokens <Icon kind="arrow"/></button></section></main><footer><a href="#" className="footer-brand">WeightAI <span>/</span> Colour system</a><p>Designed for clarity. Developed with care.</p><span>Healthcare + technology</span></footer><div role="status" aria-live="polite" className={`toast ${toast?'show':''}`}>{toast}</div></>;
}
