import { puck, puckMotion } from './puck.mjs';

export const actions = {
  feed: { label: 'SNACKING', message: 'Puck caught the berry before it hit the ground.' },
  pet: { label: 'AT EASE', message: 'Puck closed his eyes and settled into your palm.' },
  play: { label: 'DANCING', message: 'Puck took to the air as the loop started.' },
};

function safeCount(value) {
  return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

export function petState(value = {}) {
  const counts = Object.fromEntries(Object.keys(actions).map(action => [action, safeCount(value?.counts?.[action])]));
  const last = Object.hasOwn(actions, value?.last) ? value.last : null;
  return { counts, last };
}

export function careFor(state, action) {
  if (!Object.hasOwn(actions, action)) return state;
  return petState({ counts: { ...state.counts, [action]: state.counts[action] + 1 }, last: action });
}

export function meters(stats, state) {
  const { feed, pet, play } = state.counts;
  return {
    energy: Math.min(100, 36 + stats.stars + feed * 11 + play * 3),
    mood: Math.min(100, 41 + stats.mergedPublicPulls * 2 + pet * 12 + play * 8),
    care: feed + pet + play,
  };
}

function xml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function words(value, x, y, size, fill, spacing = 0) {
  return `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" letter-spacing="${spacing}">${xml(value)}</text>`;
}

export function petSvg(stats, state = petState(), action = null) {
  const values = meters(stats, state);
  const status = actions[state.last]?.label ?? 'HOVERING';
  const number = (value, x, y) => words(value, x, y, 28, '#efeeec');
  const bar = (name, value, y, tint) => [
    words(name, 660, y, 12, '#b8b8b8', 1.5),
    words(`${value}%`, 841, y, 12, '#efeeec'),
    `<rect x="660" y="${y + 9}" width="224" height="3" fill="#262626"/>`,
    `<rect x="660" y="${y + 9}" width="${224 * value / 100}" height="3" fill="${tint}"/>`,
  ].join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="920" height="504" viewBox="0 0 920 504" role="img">
  <title>Puck by Sacha Bigou. ${xml(status)}. ${values.energy}% energy, ${values.mood}% mood.</title>
  <style>${puckMotion}</style>
  <rect width="920" height="504" fill="#000"/>
  <rect x="0.5" y="0.5" width="919" height="503" fill="none" stroke="#393939"/>
  <path d="M0 59h920 M630 59v390 M0 449h920" stroke="#292929"/>
  <text x="32" y="136" fill="#efeeec" font-family="Baskerville, Georgia, serif" font-size="76" letter-spacing="-3">Puck</text>
  <g font-family="ui-monospace, SFMono-Regular, Consolas, monospace">
    ${words('SACHA BIGOU', 34, 35, 13, '#e5e3e0', 2)}
    ${words('COMPANION', 660, 35, 11, '#a8a8a8', 1.5)}
    ${puck(state.last, action)}
    ${words('CHESTNUT PUCK / ASCII FAN ART', 34, 427, 10, '#a8a8a8', 1.1)}
    <circle cx="664" cy="88" r="3.5" fill="#e2c6a6"/>
    ${words(status, 677, 92, 11, '#e2c6a6', 1.4)}
    ${bar('ENERGY', values.energy, 124, '#d3af8a')}
    ${bar('MOOD', values.mood, 166, '#c7c7c7')}
    <path d="M660 201h224" stroke="#292929"/>
    ${words('PUBLIC GITHUB', 660, 228, 11, '#a8a8a8', 1.5)}
    ${number(stats.repositories, 659, 267)}${words('SOURCE REPOS', 726, 264, 12, '#cfcdcb', 1)}
    ${number(stats.stars, 659, 319)}${words('STARS EARNED', 726, 316, 12, '#cfcdcb', 1)}
    ${number(stats.mergedPublicPulls, 659, 371)}${words('MERGED PRS', 726, 368, 12, '#cfcdcb', 1)}
    ${words(`SNAPSHOT / ${stats.asOf}`, 660, 427, 10, '#a8a8a8', 0.9)}
    ${words('SOFTWARE / SOUND', 34, 481, 11, '#a8a8a8', 1)}
    ${words(`${values.care} ${values.care === 1 ? 'CARE ACTION' : 'CARE ACTIONS'}`, 660, 481, 11, '#e2c6a6', 1.2)}
  </g>
</svg>`;
}
