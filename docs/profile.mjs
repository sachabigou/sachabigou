export const introduction = 'I’m a full-stack developer. I build web and mobile products and connect AI agents to the tools and data they need.';
export const focus = 'I turn rough product ideas into working interfaces, connect services that need to talk, and automate the recurring work in between.';

export const projects = [
  {
    title: 'Synthwave ’2077',
    text: 'An open-source theme that brings a Cyberpunk-inspired palette to the tools I work in. I adapted it for Orca’s interface, editor, and terminal.',
    links: [['VS Code repository', 'https://github.com/sachabigou/Synthwave-2077'], ['Orca port', 'https://github.com/sachabigou/synthwave-2077-orca']],
  },
  {
    title: 'SBigz',
    text: 'My electronic music project. It’s where I experiment with rhythm, texture, and sound outside the editor.',
    links: [['SoundCloud', 'https://soundcloud.com/sbigz'], ['Spotify', 'https://open.spotify.com/artist/0ggEZfElbLKckqn4O5vbcP']],
  },
];

export const contact = {
  text: 'Have a web product or an automation in mind? Tell me what you’re building.',
  links: [['LinkedIn', 'https://www.linkedin.com/in/sacha-bigou'], ['VERYDISCO', 'https://verydisco-agency.fr']],
};

const technologies = [
  ['TypeScript', 'typescript', '75B6FF'],
  ['Next.js', 'nextdotjs', 'FFFFFF'],
  ['Payload CMS', 'payloadcms', 'FFFFFF'],
  ['Vite', 'vite', 'A890FF'],
  ['React Native', 'react', '61DAFB'],
  ['Swift', 'swift', 'FA8D70'],
  ['Node.js', 'nodedotjs', '8ACA72'],
  ['PostgreSQL', 'postgresql', '93BEF0'],
  ['n8n', 'n8n', 'FF8199'],
  ['Figma', 'figma', 'E4AFD4'],
];

export const badges = technologies.map(([label, logo, color]) => ({
  label,
  url: `https://img.shields.io/badge/${encodeURIComponent(label)}-1A1A1A?style=for-the-badge&logo=${logo}&logoColor=${color}`,
}));
