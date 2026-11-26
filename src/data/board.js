// Traditional 100-square board. Keys are the START cell of each snake/ladder.
// Labels link every event to an AMR message.

export const SNAKES = {
  16: { to: 6, label: 'Took antibiotics without a prescription' },
  47: { to: 26, label: 'Stopped the antibiotic course too early' },
  49: { to: 11, label: 'Shared antibiotics with a family member' },
  56: { to: 53, label: 'Demanded antibiotics for a cold' },
  62: { to: 19, label: 'Used leftover antibiotics' },
  64: { to: 60, label: 'Skipped handwashing' },
  87: { to: 24, label: 'Bought antibiotics with no doctor advice' },
  93: { to: 73, label: 'Threw medicines into open waste' },
  95: { to: 75, label: 'Gave antibiotics to healthy animals' },
  98: { to: 78, label: 'Ignored the vet\'s withdrawal period' }
};

export const LADDERS = {
  1: { to: 38, label: 'Washed hands with soap' },
  4: { to: 14, label: 'Followed the doctor\'s advice' },
  9: { to: 31, label: 'Got vaccinated on time' },
  21: { to: 42, label: 'Completed the full prescribed course' },
  28: { to: 84, label: 'Shared accurate AMR facts with the community' },
  36: { to: 44, label: 'Drank clean, safe water' },
  51: { to: 67, label: 'Consulted a vet for animal illness' },
  71: { to: 91, label: 'Disposed of medicines safely' },
  80: { to: 100, label: 'Became an AMR champion' }
};

// Squares that may trigger an AMR question (never a snake or ladder start).
export const QUIZ_CELLS = [
  5, 8, 12, 15, 18, 23, 27, 32, 35, 39, 41, 45,
  48, 54, 58, 63, 68, 72, 77, 82, 86, 90, 94, 97
];

export const LADDER_POINTS = 10;
export const QUIZ_POINTS = 20;
export const FINISH_BONUS = [50, 30, 20, 10];
