const dayLength = 86400000;
const palette = ['#171717', '#173424', '#255237', '#3e7750', '#76ad7d'];
const monthFormat = new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' });

export async function loadCalendar(owner) {
  const response = await fetch(`https://github.com/users/${encodeURIComponent(owner)}/contributions`, {
    headers: { 'accept-language': 'en' },
    cache: 'no-store',
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`Could not load the GitHub contribution calendar (${response.status})`);
  return readCalendar(await response.text());
}

export function readCalendar(html) {
  const tips = new Map(Array.from(html.matchAll(/<tool-tip\b[^>]*\bfor="(contribution-day-component-[\d-]+)"[^>]*>\s*(No|[\d,]+) contributions? on [^<]+<\/tool-tip>/g),
    ([, id, count]) => [id, count === 'No' ? 0 : Number(count.replaceAll(',', ''))]));
  const days = Array.from(html.matchAll(/<td\b[^>]*\bdata-date="(\d{4}-\d{2}-\d{2})"[^>]*\bid="(contribution-day-component-[\d-]+)"[^>]*\bdata-level="([0-4])"[^>]*>/g),
    ([, date, id, level]) => ({ date, level: Number(level), count: tips.get(id) })).sort((first, second) => first.date.localeCompare(second.date));

  if (days.length < 365 || days.length > 373 || days.some((day, index) =>
    !Number.isSafeInteger(day.count) || (index > 0 && Date.parse(day.date) - Date.parse(days[index - 1].date) !== dayLength))) {
    throw new Error('GitHub returned an incomplete contribution calendar');
  }

  return {
    days,
    from: days[0].date,
    to: days.at(-1).date,
    total: days.reduce((sum, day) => sum + day.count, 0),
  };
}

export function calendarSvg(calendar) {
  const x = index => 30 + 16 * Math.floor(index / 7);
  const monthLabels = calendar.days.flatMap(({ date }, index) => {
    if (index === 0 || date.endsWith('-01') && index > 16) {
      return `<text x="${x(index)}" y="68">${monthFormat.format(new Date(date))}</text>`;
    }
    return [];
  }).join('');
  const cells = calendar.days.map(({ level, count, date }, index) =>
    `<rect x="${x(index)}" y="${80 + 16 * (index % 7)}" width="12" height="12" rx="2" fill="${palette[level]}"><title>${date} · ${count} contributions</title></rect>`).join('');
  const legend = palette.map((color, index) => `<rect x="${748 + index * 15}" y="207" width="10" height="10" rx="2" fill="${color}"/>`).join('');
  const total = calendar.total.toLocaleString('en-US');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="920" height="239" viewBox="0 0 920 239" role="img" aria-labelledby="title description">
  <title id="title">${total} contributions shown on GitHub</title>
  <desc id="description">Contribution calendar from ${calendar.from} through ${calendar.to}. Each square represents one day. Brighter green means more contributions.</desc>
  <rect width="920" height="239" fill="#000"/>
  <rect x="0.5" y="0.5" width="919" height="238" fill="none" stroke="#393939"/>
  <text x="30" y="40" font-family="Baskerville, Georgia, serif" font-size="29" fill="#efeeec">${total} contributions</text>
  <g font-family="ui-monospace, SFMono-Regular, Consolas, monospace" font-size="12" fill="#b8b8b8">
    <text x="889" y="37" text-anchor="end">${calendar.from} / ${calendar.to}</text>
    ${monthLabels}
    ${cells}
    <text x="30" y="216">GITHUB CONTRIBUTION CALENDAR</text>
    <text x="737" y="216" text-anchor="end">Less</text>
    ${legend}
    <text x="832" y="216">More</text>
  </g>
</svg>`;
}
