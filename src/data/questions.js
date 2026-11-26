import rows1 from './questions_1.js';
import rows2 from './questions_2.js';
import rows3 from './questions_3.js';
import rows4 from './questions_4.js';

// AMR question bank (200 questions). Content must be reviewed by AMR /
// public-health experts and professionally translated before release.
// Add languages next to `en`. The correct option is always stored first;
// the game shuffles the display order each time a question is asked.

export const CATEGORIES = {
  antibiotic_use: { label: 'Responsible antibiotic use', icon: '💊' },
  bacteria_virus: { label: 'Bacteria vs viruses', icon: '🦠' },
  hygiene: { label: 'Hygiene', icon: '🧼' },
  vaccination: { label: 'Vaccination', icon: '💉' },
  doctor: { label: 'Doctor consultation', icon: '🩺' },
  animal: { label: 'Animal health', icon: '🐄' },
  environment: { label: 'Environment', icon: '🌍' },
  community: { label: 'Community awareness', icon: '🤝' }
};

const CODE = { a: 'antibiotic_use', b: 'bacteria_virus', h: 'hygiene', v: 'vaccination', d: 'doctor', m: 'animal', e: 'environment', c: 'community' };

const HINTS = {
  antibiotic_use: 'Think about who decides which medicine you need.',
  bacteria_virus: 'Antibiotics only work on bacteria, not viruses.',
  hygiene: 'Clean hands and clean water prevent infections.',
  vaccination: 'Preventing disease means fewer antibiotics are needed.',
  doctor: 'Trust a trained health professional.',
  animal: 'Animals need a vet, and their medicines need care too.',
  environment: 'Medicines and waste should never pollute water or soil.',
  community: 'Share accurate, trusted information.'
};

export const QUESTIONS = [...rows1, ...rows2, ...rows3, ...rows4].map((r, i) => {
  const category = CODE[r[0]];
  return {
    id: `q${String(i + 1).padStart(3, '0')}`,
    category,
    difficulty: r[1],
    answer: 0,
    en: { q: r[2], options: [r[3], r[4], r[5], r[6]], explanation: r[7], hint: HINTS[category] }
  };
});
