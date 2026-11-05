import { actions, careFor, meters, petState, petSvg } from './pet.mjs';
import { skills } from './skills.mjs';
import { badges, contact, focus, introduction, projects } from './profile.mjs';

const storageKey = 'sachabigou/tapeworm/1';
const image = document.querySelector('#pet');
const message = document.querySelector('#message');
const buttons = [...document.querySelectorAll('[data-action]')];
let audio;
let playing = false;

function playLoop() {
  if (playing || !globalThis.AudioContext) return;
  audio ??= new AudioContext();
  playing = true;
  audio.resume().then(() => {
    const start = audio.currentTime + 0.02;
    const notes = [45, 57, 60, 64, 43, 55, 59, 62, 41, 53, 57, 60, 40, 52, 55, 59];
    const step = 0.105;
    notes.forEach((note, index) => {
      const time = start + index * step;
      const tone = audio.createOscillator();
      const envelope = audio.createGain();
      tone.type = 'triangle';
      tone.frequency.value = 440 * 2 ** ((note - 69) / 12);
      envelope.gain.setValueAtTime(0.001, time);
      envelope.gain.exponentialRampToValueAtTime(0.14, time + 0.012);
      envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.145);
      tone.connect(envelope).connect(audio.destination);
      tone.start(time);
      tone.stop(time + 0.15);
      tone.onended = () => {
        tone.disconnect();
        envelope.disconnect();
        if (index === notes.length - 1) playing = false;
      };
    });
  }).catch(() => { playing = false; });
}

function loadState() {
  try {
    return petState(JSON.parse(localStorage.getItem(storageKey)));
  } catch {
    return petState();
  }
}

async function start() {
  const response = await fetch('assets/stats.json');
  if (!response.ok) throw new Error('GitHub snapshot unavailable');
  const stats = await response.json();
  document.querySelector('#repositories').textContent = stats.repositories;
  document.querySelector('#stars').textContent = stats.stars;
  document.querySelector('#merged-public-pulls').textContent = stats.mergedPublicPulls;
  let state = loadState();

  function render(action) {
    const { energy, mood, care } = meters(stats, state);
    const careLabel = care === 1 ? 'care action' : 'care actions';
    image.src = `data:image/svg+xml,${encodeURIComponent(petSvg(stats, state, action))}`;
    image.alt = `Chestnut Puck from Berserk, drawn in ASCII. ${actions[state.last]?.label ?? 'Hovering'}. Energy ${energy}%, mood ${mood}%, ${care} ${careLabel}. GitHub snapshot: ${stats.repositories} public source repositories, ${stats.stars} stars earned, ${stats.mergedPublicPulls} public merged pull requests.`;
    document.querySelector('#energy').textContent = `${energy}%`;
    document.querySelector('#mood').textContent = `${mood}%`;
    document.querySelector('#care').textContent = care;
    message.textContent = actions[state.last]?.message ?? 'Puck is hovering nearby.';
  }

  render();
  for (const button of buttons) {
    button.disabled = false;
    button.addEventListener('click', () => {
      const action = button.dataset.action;
      state = careFor(state, action);
      try {
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch {}
      if (action === 'play') playLoop();
      render(action);
    });
  }

  const address = new URL(window.location.href);
  const requestedAction = address.searchParams.get('action');
  const selectedButton = buttons.find(button => button.dataset.action === requestedAction);
  if (selectedButton) {
    address.searchParams.delete('action');
    window.history.replaceState(window.history.state, '', address);
    selectedButton.focus();
    if (requestedAction !== 'play') selectedButton.click();
    else message.textContent = 'Press Play a loop to start the music.';
  }
}

function projectLink([label, url]) {
  const link = document.createElement('a');
  link.textContent = `${label} ↗`;
  link.href = url;
  return link;
}

document.querySelector('#introduction').textContent = introduction;
document.querySelector('#focus').textContent = focus;
document.querySelector('#contact-text').textContent = contact.text;
document.querySelector('#contact-links').append(...contact.links.map(projectLink));

const badgeRow = document.querySelector('#badges');
for (const { label, url } of badges) {
  const badge = document.createElement('img');
  badge.height = 28;
  badge.alt = label;
  badge.src = url;
  badgeRow.append(badge);
}

const work = document.querySelector('#work');
for (const project of projects) {
  const article = document.createElement('article');
  const title = document.createElement('h3');
  const description = document.createElement('p');
  const links = document.createElement('nav');
  title.textContent = project.title;
  description.textContent = project.text;
  links.setAttribute('aria-label', `${project.title} links`);
  links.append(...project.links.map(projectLink));
  article.append(title, description, links);
  work.append(article);
}

const skillsGrid = document.querySelector('#skills');
for (const group of skills) {
  const section = document.createElement('section');
  const heading = document.createElement('h3');
  heading.textContent = group.title;
  const list = document.createElement('dl');
  for (const skill of group.items) {
    const title = document.createElement('dt');
    title.textContent = skill.title;
    const detail = document.createElement('dd');
    detail.textContent = skill.text;
    if (skill.link) detail.append(' ', projectLink(skill.link));
    list.append(title, detail);
  }
  section.append(heading, list);
  skillsGrid.append(section);
}

start().catch(() => {
  message.textContent = 'The saved image is available. Reload to reconnect the controls.';
});
