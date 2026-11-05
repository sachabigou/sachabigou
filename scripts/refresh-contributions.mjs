import { writeFile } from 'node:fs/promises';
import { calendarSvg, loadCalendar } from './contributions.mjs';

const calendar = await loadCalendar('sachabigou');
await writeFile(new URL('../assets/contributions.svg', import.meta.url), calendarSvg(calendar) + '\n');
console.log(`Calendar refreshed through ${calendar.to}: ${calendar.total} contributions.`);
