export const COLORS = {
  red: { name: 'Red', hex: '#e53935' },
  blue: { name: 'Blue', hex: '#1e88e5' },
  yellow: { name: 'Yellow', hex: '#fbc02d' },
  green: { name: 'Green', hex: '#43a047' },
  purple: { name: 'Purple', hex: '#8e24aa' },
  orange: { name: 'Orange', hex: '#fb8c00' },
  pink: { name: 'Pink', hex: '#ec407a' },
  teal: { name: 'Teal', hex: '#00897b' }
};
export const COLOR_KEYS = Object.keys(COLORS);

// Avatars grouped so players can find themselves quickly.
export const AVATAR_GROUPS = [
  {
    id: 'kids',
    label: 'Girls & Boys',
    items: [
      { e: '👧', n: 'Girl' },
      { e: '👦', n: 'Boy' },
      { e: '🧒', n: 'Child' },
      { e: '👩‍🎓', n: 'Student (girl)' },
      { e: '👨‍🎓', n: 'Student (boy)' }
    ]
  },
  {
    id: 'adults',
    label: 'Women & Men',
    items: [
      { e: '👩', n: 'Woman' },
      { e: '👨', n: 'Man' },
      { e: '🧕', n: 'Woman with headscarf' },
      { e: '👳‍♂️', n: 'Man with turban' },
      { e: '🧑', n: 'Person' },
      { e: '👵', n: 'Grandmother' },
      { e: '👴', n: 'Grandfather' }
    ]
  },
  {
    id: 'heroes',
    label: 'Health heroes',
    items: [
      { e: '👩‍⚕️', n: 'Doctor (woman)' },
      { e: '👨‍⚕️', n: 'Doctor (man)' },
      { e: '👩‍🔬', n: 'Scientist' },
      { e: '👩‍🌾', n: 'Farmer (woman)' },
      { e: '👨‍🌾', n: 'Farmer (man)' },
      { e: '👩‍🏫', n: 'Teacher' },
      { e: '🦸‍♀️', n: 'Super heroine' },
      { e: '🦸‍♂️', n: 'Superhero' }
    ]
  },
  {
    id: 'animals',
    label: 'Animals',
    items: [
      { e: '🐯', n: 'Tiger' },
      { e: '🦁', n: 'Lion' },
      { e: '🐼', n: 'Panda' },
      { e: '🐘', n: 'Elephant' },
      { e: '🦚', n: 'Peacock' },
      { e: '🐄', n: 'Cow' }
    ]
  }
];

export const BOT_AVATARS = [
  { e: '🤖', n: 'Robot' },
  { e: '👾', n: 'Alien' },
  { e: '🦾', n: 'Bionic arm' },
  { e: '🛸', n: 'Spaceship' }
];

// Empty player slot: the user must choose avatar and colour themselves.
export const emptyPlayer = () => ({ name: '', avatar: null, color: null });
export const emptyPlayers = () => [0, 1, 2, 3].map(emptyPlayer);

export const defaultName = (i) => `Player ${i + 1}`;
