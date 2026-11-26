export const COLORS = {
  red: { name: 'Red', hex: '#e53935' },
  blue: { name: 'Blue', hex: '#1e88e5' },
  yellow: { name: 'Yellow', hex: '#fdd835' },
  green: { name: 'Green', hex: '#43a047' },
  purple: { name: 'Purple', hex: '#8e24aa' },
  orange: { name: 'Orange', hex: '#fb8c00' }
};
export const COLOR_KEYS = Object.keys(COLORS);

export const AVATARS = ['👩‍⚕️', '🧑‍⚕️', '👨‍🌾', '🧑‍🔬', '👵', '🧒', '🦸', '🐯'];
export const BOT_AVATAR = '🤖';

export const defaultHumans = () =>
  [0, 1, 2, 3].map((i) => ({
    name: '',
    avatar: AVATARS[i],
    color: COLOR_KEYS[i]
  }));

export const defaultName = (i) => `Player ${i + 1}`;
