import rows1 from './questions_1.js';
import rows2 from './questions_2.js';
import rows3 from './questions_3.js';
import rows4 from './questions_4.js';
import hi1 from './questions_hi_1.js';
import hi2 from './questions_hi_2.js';
import hi3 from './questions_hi_3.js';
import hi4 from './questions_hi_4.js';

// AMR question bank (200 questions) in English and Hindi. Content must be reviewed by
// AMR / public-health experts and native speakers before release.
// The correct option is always stored first; the game shuffles the display order.

export const CATEGORIES = {
  antibiotic_use: { label: 'Responsible antibiotic use', hi: 'एंटीबायोटिक का सही उपयोग', icon: '💊' },
  bacteria_virus: { label: 'Bacteria vs viruses', hi: 'बैक्टीरिया और वायरस', icon: '🦠' },
  hygiene: { label: 'Hygiene', hi: 'सफ़ाई', icon: '🧼' },
  vaccination: { label: 'Vaccination', hi: 'टीकाकरण', icon: '💉' },
  doctor: { label: 'Doctor consultation', hi: 'डॉक्टर से सलाह', icon: '🩺' },
  animal: { label: 'Animal health', hi: 'जानवरों की सेहत', icon: '🐄' },
  environment: { label: 'Environment', hi: 'पर्यावरण', icon: '🌍' },
  community: { label: 'Community awareness', hi: 'समुदाय में जागरूकता', icon: '🤝' }
};

const CODE = { a: 'antibiotic_use', b: 'bacteria_virus', h: 'hygiene', v: 'vaccination', d: 'doctor', m: 'animal', e: 'environment', c: 'community' };

const HINTS = {
  antibiotic_use: ['Think about who decides which medicine you need.', 'सोचिए, कौन तय करता है कि आपको कौन सी दवा चाहिए।'],
  bacteria_virus: ['Antibiotics only work on bacteria, not viruses.', 'एंटीबायोटिक सिर्फ़ बैक्टीरिया पर काम करती है, वायरस पर नहीं।'],
  hygiene: ['Clean hands and clean water prevent infections.', 'साफ़ हाथ और साफ़ पानी संक्रमण रोकते हैं।'],
  vaccination: ['Preventing disease means fewer antibiotics are needed.', 'बीमारी से बचाव मतलब कम एंटीबायोटिक।'],
  doctor: ['Trust a trained health professional.', 'प्रशिक्षित स्वास्थ्य कर्मी पर भरोसा करें।'],
  animal: ['Animals need a vet, and their medicines need care too.', 'जानवरों को पशु डॉक्टर चाहिए, उनकी दवा में भी सावधानी चाहिए।'],
  environment: ['Medicines and waste should never pollute water or soil.', 'दवा और कचरा कभी पानी या मिट्टी में न जाए।'],
  community: ['Share accurate, trusted information.', 'सही और भरोसेमंद जानकारी बाँटें।']
};

const HI = [...hi1, ...hi2, ...hi3, ...hi4];

export const QUESTIONS = [...rows1, ...rows2, ...rows3, ...rows4].map((r, i) => {
  const category = CODE[r[0]];
  const h = HI[i];
  return {
    id: `q${String(i + 1).padStart(3, '0')}`,
    category,
    difficulty: r[1],
    answer: 0,
    en: { q: r[2], options: [r[3], r[4], r[5], r[6]], explanation: r[7], hint: HINTS[category][0] },
    hi: h ? { q: h[0], options: [h[1], h[2], h[3], h[4]], explanation: h[5], hint: HINTS[category][1] } : undefined
  };
});
