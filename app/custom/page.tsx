import type { Metadata } from 'next';
import Studio from './studio';
import './studio.css';

export const metadata: Metadata = { title: 'Custom Palette Studio — WeightAI', description: 'Mix colours, build custom palettes, save them temporarily in your browser, and export CSS or JSON.' };
export default function CustomPalettePage() { return <Studio />; }
