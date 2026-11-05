const chestnut = [
  [23, 24], [22, 24], [21, 25], [20, 25], [18, 27], [17, 29],
  [15, 31], [13, 33], [11, 35], [9, 37], [8, 38], [7, 39],
  [6, 40], [5, 41], [5, 41], [5, 41], [5, 41], [6, 40],
  [7, 39], [8, 38], [10, 36], [13, 33], [16, 30], [20, 26],
];

const palette = ['#735a48', '#98775d', '#c3a383', '#e2c6a6', '#f1dcc0'];
const density = ':=+*#';

function chestnutCell(column, row, left, right) {
  const edge = Math.min(column - left, right - column);
  const lighting = (22 - column) * 0.07 + (15 - row) * 0.1;
  const grain = Math.sin(column * 9.3 + row * 5.8) * 0.65;
  const cheek = row > 14 && row < 20 ? 0.8 : 0;
  const shade = Math.max(0, Math.min(4, Math.floor(2.35 + lighting + grain + cheek)));
  const face = ((column - 23) / 11) ** 2 + ((row - 15.7) / 4.5) ** 2 < 1;
  const glyph = face ? '.' : edge === 0 ? ':' : density[shade];
  const fill = face ? '#b39172' : palette[shade];
  return `<tspan fill="${fill}">${glyph}</tspan>`;
}

const sprite = chestnut.map(([left, right], row) => {
  const line = ' '.repeat(left) + Array.from({ length: right - left + 1 }, (_, index) => chestnutCell(left + index, row, left, right)).join('');
  return `<text x="115" y="${181 + row * 8.8}" xml:space="preserve">${line}</text>`;
}).join('');

export const puckMotion = `
.puck { animation: hover 4.8s ease-in-out infinite; transform-origin: 320px 313px; }
.wing { animation: flap 1.35s ease-in-out infinite; }
.left-wing { transform-origin: 183px 286px; }
.right-wing { transform-origin: 450px 286px; animation-direction: reverse; }
.eyes { transform-box: fill-box; transform-origin: center; animation: blink 6.8s ease-in-out infinite; }
.puck.feed { animation: catch-berry .72s ease-out, hover 4.8s .72s ease-in-out infinite; }
.puck.pet { animation: lean .88s ease-in-out, hover 4.8s .88s ease-in-out infinite; }
.puck.play { animation: dance .42s ease-in-out 4, hover 4.8s 1.68s ease-in-out infinite; }
.puck.play .wing { animation: flap .42s ease-in-out 4, flap 1.35s 1.68s ease-in-out infinite; }
.puck.play .right-wing { animation-direction: reverse; }
.effect { opacity: 0; }
.berry { animation: toss .43s ease-out; }
.heart { animation: float-up .86s ease-out; }
.note { animation: float-up .42s ease-out 4; }
.note.second { animation-delay: .21s; }
@keyframes hover { 50% { transform: translateY(-8px) rotate(-1.5deg); } }
@keyframes flap { 50% { transform: rotate(10deg) scaleY(.78); } }
@keyframes blink { 0%, 45%, 50%, 100% { transform: scaleY(1); } 47%, 48% { transform: scaleY(.14); } }
@keyframes catch-berry { 42% { transform: translate(-12px, -9px) rotate(-5deg); } 72% { transform: translateY(3px) scale(1.04, .96); } }
@keyframes lean { 50% { transform: translate(4px, 6px) rotate(5deg) scale(1.04, .96); } }
@keyframes dance { 30% { transform: translateY(-19px) rotate(-4deg); } 65% { transform: translateY(-8px) rotate(3deg); } }
@keyframes toss { 0% { opacity: 1; } 48% { transform: translate(76px, -65px); opacity: 1; } 86% { opacity: 1; } 100% { transform: translate(159px, -19px); opacity: 0; } }
@keyframes float-up { 15% { opacity: 1; } 100% { transform: translateY(-34px); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .puck, .puck *, .effect { animation: none !important; } }
`;

const effects = {
  feed: '<text class="effect berry" x="150" y="354" fill="#e9a799" font-size="23">o</text>',
  pet: '<text class="effect heart" x="374" y="291" fill="#e2c6a6" font-size="20">&lt;3</text>',
  play: '<text class="effect note" x="440" y="257" fill="#e2c6a6" font-size="21">~</text><text class="effect note second" x="494" y="224" fill="#b3c5c7" font-size="17">*</text>',
};

export function puck(state, action) {
  const effect = Object.hasOwn(effects, action) ? action : null;
  const expression = {
    feed: ['o   o', 'O'],
    pet: ['^   ^', 'u'],
    play: ['>   <', 'D'],
  }[state] ?? ['o   o', 'w'];
  const eyes = expression[0].replaceAll('>', '&gt;').replaceAll('<', '&lt;');
  return `<g class="puck${effect ? ` ${effect}` : ''}">
    <g fill="#8b9da1" font-size="14" letter-spacing="0.7">
      <g class="wing left-wing">
        <text x="87" y="232">..::.</text><text x="81" y="246">:===++:</text><text x="89" y="260">.::===++:</text>
        <text x="105" y="274">..:===+:</text><text x="126" y="288">..:==:</text><text x="141" y="302">..::</text>
      </g>
      <g class="wing right-wing">
        <text x="506" y="232">.::..</text><text x="483" y="246">:++===:</text><text x="473" y="260">:++===::.</text>
        <text x="468" y="274">:++==:..</text><text x="460" y="288">:==:..</text><text x="449" y="302">::..</text>
      </g>
    </g>
    <g fill="#b4b9b6" font-size="13"><text x="64" y="277">.</text><text x="562" y="268">.</text><text x="480" y="196">+</text><text x="139" y="210">.</text></g>
    <g font-size="14" letter-spacing="0.45">${sprite}</g>
    <g fill="#f1d5b4" font-size="15">
      <text x="166" y="321">&lt;:.</text><text x="452" y="321">.:&gt;</text>
      <text x="270" y="393">_/</text><text x="350" y="393">&#92;_</text>
    </g>
    <g fill="#fff0da" stroke="#17110d" stroke-width="3.5" paint-order="stroke" text-anchor="middle">
      <text class="eyes" x="320" y="316" font-size="25" font-weight="700" xml:space="preserve">${eyes}</text>
      <text x="320" y="339" font-size="20" font-weight="700">${expression[1]}</text>
    </g>
  </g>${effect ? effects[effect] : ''}`;
}
