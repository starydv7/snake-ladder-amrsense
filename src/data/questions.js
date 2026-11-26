// AMR question bank. Content must be reviewed by AMR / public-health experts
// and professionally translated before release. Add languages next to `en`.
// answer = index of the correct option in `en.options` (options are shuffled per ask).

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

export const QUESTIONS = [
  {
    id: 'q01', category: 'antibiotic_use', difficulty: 1, answer: 0,
    en: {
      q: 'When should you take antibiotics?',
      options: ['Only when a doctor prescribes them', 'Whenever you have a fever', 'For every cough or cold', 'When a friend recommends them'],
      explanation: 'Antibiotics should be taken only when prescribed by a qualified health professional.',
      hint: 'Think about who decides what medicine you need.'
    }
  },
  {
    id: 'q02', category: 'antibiotic_use', difficulty: 1, answer: 1,
    en: {
      q: 'You feel better after 2 days of a 5-day antibiotic course. What should you do?',
      options: ['Stop and save the rest', 'Complete the course as your doctor advised', 'Take double doses', 'Share the rest with family'],
      explanation: 'Follow the dose and duration your doctor prescribed. Stopping early or changing doses can help resistant bacteria survive.',
      hint: 'Feeling better does not always mean the infection is gone.'
    }
  },
  {
    id: 'q03', category: 'antibiotic_use', difficulty: 1, answer: 2,
    en: {
      q: 'Can you share leftover antibiotics with a family member who has similar symptoms?',
      options: ['Yes, if they are the same illness', 'Yes, if they are a child', 'No, never share antibiotics', 'Yes, if the tablets are not expired'],
      explanation: 'Antibiotics are prescribed for one person and one infection. Sharing them can be harmful and promotes resistance.',
      hint: 'A prescription is written for one person.'
    }
  },
  {
    id: 'q04', category: 'antibiotic_use', difficulty: 2, answer: 3,
    en: {
      q: 'Which habit helps most to slow antibiotic resistance?',
      options: ['Keeping antibiotics at home for emergencies', 'Buying antibiotics from any shop', 'Asking for a stronger antibiotic', 'Using them only when prescribed and as directed'],
      explanation: 'Using antibiotics only when needed and exactly as directed keeps them effective for everyone.',
      hint: 'Less misuse means longer-lasting medicines.'
    }
  },
  {
    id: 'q05', category: 'bacteria_virus', difficulty: 1, answer: 0,
    en: {
      q: 'Antibiotics work against which type of germ?',
      options: ['Bacteria', 'Viruses', 'Both bacteria and viruses', 'Neither'],
      explanation: 'Antibiotics treat bacterial infections only. They do not work against viruses.',
      hint: 'The common cold is not treated with them.'
    }
  },
  {
    id: 'q06', category: 'bacteria_virus', difficulty: 1, answer: 1,
    en: {
      q: 'The common cold is caused by:',
      options: ['Bacteria', 'A virus', 'Dirty water only', 'Weak bones'],
      explanation: 'Colds are caused by viruses, so antibiotics will not help you recover faster.',
      hint: 'Antibiotics do not help colds.'
    }
  },
  {
    id: 'q07', category: 'bacteria_virus', difficulty: 2, answer: 2,
    en: {
      q: 'Which of these illnesses is caused by a virus?',
      options: ['Typhoid', 'Tuberculosis', 'Influenza (flu)', 'Bacterial urinary infection'],
      explanation: 'Influenza is viral. Typhoid, tuberculosis and most urinary infections are bacterial.',
      hint: 'Seasonal flu spreads through coughs and sneezes.'
    }
  },
  {
    id: 'q08', category: 'bacteria_virus', difficulty: 1, answer: 3,
    en: {
      q: 'What is antimicrobial resistance (AMR)?',
      options: ['When the body gets tired of medicine', 'When medicines become cheaper', 'When people forget to take medicine', 'When germs change and medicines stop working on them'],
      explanation: 'AMR happens when microbes change so that medicines no longer kill them or stop their growth.',
      hint: 'It is the germs that change.'
    }
  },
  {
    id: 'q09', category: 'bacteria_virus', difficulty: 3, answer: 1,
    en: {
      q: 'Who or what becomes resistant in antibiotic resistance?',
      options: ['The human body', 'The bacteria', 'The antibiotic tablet', 'The doctor'],
      explanation: 'Bacteria become resistant, not people. Resistant bacteria can spread between people, animals and the environment.',
      hint: 'A common myth says "my body became resistant".'
    }
  },
  {
    id: 'q10', category: 'hygiene', difficulty: 1, answer: 0,
    en: {
      q: 'What is the best way to wash your hands?',
      options: ['Soap and clean water for at least 20 seconds', 'A quick rinse with water', 'Wipe on your clothes', 'Only wash when they look dirty'],
      explanation: 'Washing with soap and clean water for at least 20 seconds removes germs and prevents many infections.',
      hint: 'Soap matters.'
    }
  },
  {
    id: 'q11', category: 'hygiene', difficulty: 1, answer: 2,
    en: {
      q: 'When should you wash your hands?',
      options: ['Only before sleeping', 'Only after exercise', 'Before eating and after using the toilet', 'Only on weekends'],
      explanation: 'Wash hands before eating or cooking, after using the toilet and after caring for someone who is sick.',
      hint: 'Think of food and toilets.'
    }
  },
  {
    id: 'q12', category: 'hygiene', difficulty: 2, answer: 3,
    en: {
      q: 'How does clean drinking water help fight AMR?',
      options: ['It makes antibiotics stronger', 'It kills viruses in the body', 'It replaces vaccines', 'It prevents infections, so fewer antibiotics are needed'],
      explanation: 'Safe water and sanitation prevent infections such as diarrhoea, which reduces the need for antibiotics.',
      hint: 'Prevention reduces medicine use.'
    }
  },
  {
    id: 'q13', category: 'vaccination', difficulty: 1, answer: 1,
    en: {
      q: 'How do vaccines help in the fight against AMR?',
      options: ['They are antibiotics', 'They prevent infections, so fewer antibiotics are used', 'They make germs stronger', 'They are not related'],
      explanation: 'Vaccines prevent many infections. Fewer infections means less antibiotic use and less resistance.',
      hint: 'Preventing disease is better than treating it.'
    }
  },
  {
    id: 'q14', category: 'vaccination', difficulty: 2, answer: 0,
    en: {
      q: 'What should parents do about childhood vaccines?',
      options: ['Follow the national immunisation schedule', 'Wait until the child is ill', 'Give them only once in a lifetime', 'Skip them if the child looks healthy'],
      explanation: 'Following the recommended immunisation schedule protects children and the community.',
      hint: 'Healthy-looking children still need protection.'
    }
  },
  {
    id: 'q15', category: 'doctor', difficulty: 1, answer: 3,
    en: {
      q: 'Who should decide whether you need an antibiotic?',
      options: ['A shopkeeper', 'A neighbour', 'Social media', 'A qualified health professional'],
      explanation: 'Only a qualified health professional can decide whether an infection needs an antibiotic.',
      hint: 'Pick the trained expert.'
    }
  },
  {
    id: 'q16', category: 'doctor', difficulty: 2, answer: 1,
    en: {
      q: 'A pharmacy offers antibiotics without a prescription. What is best?',
      options: ['Buy them to be safe', 'Consult a doctor first', 'Buy half the dose', 'Ask a friend which one to take'],
      explanation: 'Antibiotics should be dispensed against a valid prescription after a health professional has examined you.',
      hint: 'Prescription first.'
    }
  },
  {
    id: 'q17', category: 'doctor', difficulty: 2, answer: 2,
    en: {
      q: 'Why should you not demand antibiotics for a viral fever?',
      options: ['They are too expensive', 'They taste bad', 'They do not work on viruses and can cause side effects and resistance', 'Doctors do not like it'],
      explanation: 'Antibiotics cannot treat viruses. Unnecessary use causes side effects and builds resistance.',
      hint: 'Wrong tool for the job.'
    }
  },
  {
    id: 'q18', category: 'animal', difficulty: 1, answer: 0,
    en: {
      q: 'When should farm animals receive antibiotics?',
      options: ['Only on a veterinarian\'s advice', 'Every week to prevent illness', 'Whenever the farmer decides', 'Only when prices are low'],
      explanation: 'Animal antibiotics should be used only under veterinary guidance.',
      hint: 'Animals have doctors too.'
    }
  },
  {
    id: 'q19', category: 'animal', difficulty: 2, answer: 3,
    en: {
      q: 'Is it a good idea to give antibiotics to healthy animals to make them grow faster?',
      options: ['Yes, it is safe', 'Yes, but only in summer', 'Yes, in small amounts', 'No, it can promote resistance'],
      explanation: 'Routine use in healthy animals promotes resistant bacteria that can spread to people and the environment.',
      hint: 'Think about One Health.'
    }
  },
  {
    id: 'q20', category: 'animal', difficulty: 3, answer: 1,
    en: {
      q: 'After a cow is treated with antibiotics, what should you do about its milk?',
      options: ['Sell it immediately', 'Follow the withdrawal period advised by the vet', 'Mix it with other milk', 'Give it only to children'],
      explanation: 'The withdrawal period is the time needed for drug residues to clear. Follow the veterinarian\'s instructions.',
      hint: 'The vet gives a waiting time.'
    }
  },
  {
    id: 'q21', category: 'environment', difficulty: 2, answer: 2,
    en: {
      q: 'What is the right way to handle unused or expired antibiotics?',
      options: ['Flush them down the toilet', 'Throw them in an open field', 'Use local safe-disposal or take-back guidance', 'Keep them for later'],
      explanation: 'Safe disposal stops medicines from reaching soil and water, where they can encourage resistant bacteria.',
      hint: 'Do not pollute water or soil.'
    }
  },
  {
    id: 'q22', category: 'environment', difficulty: 3, answer: 0,
    en: {
      q: 'Why is untreated hospital and sewage waste a problem for AMR?',
      options: ['It can spread resistant bacteria and drug residues', 'It makes plants grow faster', 'It cleans rivers', 'It has no effect'],
      explanation: 'Untreated waste can carry resistant bacteria and drug residues into the environment.',
      hint: 'Waste can carry germs far.'
    }
  },
  {
    id: 'q23', category: 'community', difficulty: 1, answer: 3,
    en: {
      q: 'How can you help spread AMR awareness?',
      options: ['Share rumours', 'Recommend antibiotics to friends', 'Stay silent', 'Share accurate information from trusted health sources'],
      explanation: 'Accurate, trusted information helps your family and community use medicines wisely.',
      hint: 'Trusted sources only.'
    }
  },
  {
    id: 'q24', category: 'community', difficulty: 2, answer: 1,
    en: {
      q: 'What does "One Health" mean?',
      options: ['Only human health matters', 'Human, animal and environmental health are linked', 'One medicine fits all', 'One hospital per town'],
      explanation: 'One Health recognises that the health of people, animals and the environment is connected, including AMR.',
      hint: 'Three things are connected.'
    }
  },
  {
    id: 'q25', category: 'community', difficulty: 3, answer: 2,
    en: {
      q: 'Which is a likely consequence of widespread AMR?',
      options: ['Shorter hospital stays', 'Cheaper treatment', 'Longer illness, higher costs and more deaths', 'Fewer infections'],
      explanation: 'AMR makes infections harder to treat, leading to longer illness, higher costs and more deaths.',
      hint: 'Think of what happens when medicines fail.'
    }
  },
  {
    id: 'q26', category: 'hygiene', difficulty: 3, answer: 0,
    en: {
      q: 'Which action best prevents spreading infection when you have a cough?',
      options: ['Cover your mouth with a tissue or elbow and stay home if unwell', 'Cough into your hands', 'Share your cup', 'Take leftover antibiotics'],
      explanation: 'Good respiratory hygiene reduces spread, which means fewer infections and less antibiotic use.',
      hint: 'Protect others around you.'
    }
  }
];
