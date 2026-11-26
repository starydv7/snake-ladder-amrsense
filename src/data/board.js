// Traditional 100-square board. Keys are the START cell of each snake/ladder.
// Layout is generated so that no two snakes/ladders cross or crowd each other.
// Every snake and ladder carries its OWN AMR lesson.

export const SNAKES = {
  30: { to: 10, color: '#2e9e4f', icon: '💊', title: 'No prescription!', label: 'Took antibiotics without a prescription', fact: 'Antibiotics should only be used when a doctor prescribes them. Self-medication helps resistant bacteria grow.' },
  34: { to: 7, color: '#8e44ad', icon: '⏱️', title: 'Stopped too early!', label: 'Stopped the antibiotic course too early', fact: 'Follow the doctor\'s advice on how long to take antibiotics. Stopping early can leave tougher bacteria behind.' },
  38: { to: 3, color: '#e67e22', icon: '🤝', title: 'Shared medicine!', label: 'Shared antibiotics with a family member', fact: 'Antibiotics are prescribed for one person and one infection. Sharing them can harm and delay proper care.' },
  39: { to: 19, color: '#e74c3c', icon: '🤧', title: 'Not for colds!', label: 'Demanded antibiotics for a cold', fact: 'Colds and flu are caused by viruses. Antibiotics do not work on viruses.' },
  60: { to: 21, color: '#16a5a5', icon: '🗃️', title: 'Leftover tablets!', label: 'Used leftover antibiotics', fact: 'Old tablets may be the wrong medicine for a new illness. Never keep or reuse leftover antibiotics.' },
  86: { to: 66, color: '#3f51b5', icon: '🧼', title: 'Skipped handwashing!', label: 'Skipped handwashing before eating', fact: 'Washing hands with soap for 20 seconds prevents many infections, so fewer antibiotics are needed.' },
  87: { to: 47, color: '#c0392b', icon: '🐔', title: 'Unneeded animal drugs!', label: 'Gave antibiotics to healthy animals', fact: 'Antibiotics for animals should only be used on a vet\'s advice. Misuse spreads resistance to people.' },
  99: { to: 61, color: '#6d4c41', icon: '🗑️', title: 'Careless disposal!', label: 'Threw medicines into open waste', fact: 'Medicines thrown in drains or open land pollute water and soil and help resistant bacteria spread.' }
};

export const LADDERS = {
  4: { to: 26, icon: '🧼', title: 'Clean hands!', label: 'Washed hands with soap', fact: 'Handwashing with soap is one of the best ways to prevent infections and reduce antibiotic use.' },
  12: { to: 33, icon: '🩺', title: 'Asked the doctor!', label: 'Consulted a doctor before taking medicine', fact: 'A trained health worker decides whether you need an antibiotic and which one.' },
  31: { to: 69, icon: '💉', title: 'Fully vaccinated!', label: 'Got vaccinated on time', fact: 'Vaccines prevent infections, so fewer antibiotics are needed and resistance grows more slowly.' },
  35: { to: 65, icon: '✅', title: 'Course completed!', label: 'Followed the doctor\'s advice on the full course', fact: 'Taking antibiotics exactly as prescribed gives the best chance to cure the infection.' },
  42: { to: 63, icon: '🚰', title: 'Safe water!', label: 'Drank clean, safe water', fact: 'Safe water and good sanitation prevent diarrhoea and other infections.' },
  48: { to: 73, icon: '🐄', title: 'Called the vet!', label: 'Consulted a vet for a sick animal', fact: 'Vets treat animals correctly and set safe waiting periods for milk and meat.' },
  70: { to: 90, icon: '♻️', title: 'Safe disposal!', label: 'Disposed of medicines safely', fact: 'Return unused medicines to a take-back point or follow local disposal advice.' },
  77: { to: 97, icon: '📣', title: 'AMR champion!', label: 'Shared accurate AMR facts with the community', fact: 'Sharing trusted information helps your family and neighbours use medicines wisely.' }
};

const eventCells = new Set([
  ...Object.keys(SNAKES).map(Number), ...Object.values(SNAKES).map((s) => s.to),
  ...Object.keys(LADDERS).map(Number), ...Object.values(LADDERS).map((l) => l.to)
]);

// Squares that may trigger an AMR question (never a snake/ladder start or end).
export const QUIZ_CELLS = Array.from({ length: 98 }, (_, i) => i + 2)
  .filter((n) => n % 3 === 2 && !eventCells.has(n));

export const LADDER_POINTS = 10;
export const QUIZ_POINTS = 20;
export const FINISH_BONUS = [50, 30, 20, 10];
