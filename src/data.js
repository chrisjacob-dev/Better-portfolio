export const OWNER = {
  name: 'Chris Jacob',
  role: 'AI | ML | Engineer',
  email: 'chris.jkarottu@icloud.com',
  phone: '+91 8296831730',
  location: 'Manipal, India',
  github: 'https://github.com/chrisjacob-dev',
  linkedin: 'https://linkedin.com/in/chris-jacob-a03a49369',
  university: 'MIT MAHE',
  year: '3rd Year B.Tech CSE',
  intake: '2024 intake',
  philosophy: [
    'Yes — AI can write the code.',
    'But can it understand the problem?',
  ],
  intro:
    'Building at the intersection of Machine Learning, Generative AI, and real-world systems. Precise. Intentional. Engineered.',
};

export const PROJECTS = [
  {
    num: '01',
    name: 'ShiftGuard AI',
    year: '2024',
    tag: 'ML / Decision Systems',
    stack: 'Python · scikit-learn · Streamlit · Hugging Face',
    desc:
      'Decision Fatigue Score predictor for high-stakes environments — healthcare, aviation, logistics. Ridge regression on 25k shift records, R² = 0.96.',
    metrics: [
      { k: 'R²',      v: '0.96' },
      { k: 'MAE',     v: '6.11' },
      { k: 'Records', v: '25K' },
      { k: 'Inputs',  v: '10' },
    ],
    live: 'https://Chris262006-shiftguard.hf.space',
    github: 'https://github.com/chrisjacob-dev/shift_gurard_ai_repo',
  },
  {
    num: '02',
    name: 'Car Rental Management',
    year: '2024',
    tag: 'Full-Stack / Oracle',
    stack: 'Python · Oracle XE · PL/SQL · Streamlit · Docker',
    desc:
      'Full-stack rental platform — Oracle XE backend, stored procedures, triggers, role-based auth, auto billing, PDF invoicing.',
    metrics: [
      { k: 'Roles',    v: '2' },
      { k: 'Triggers', v: '12' },
      { k: 'Tables',   v: '8' },
      { k: 'Dockerd',  v: 'YES' },
    ],
    live: null,
    github: 'https://github.com/chrisjacob-dev/car_rental_app-repo',
    preview: '/projects/car-rental.png',
    previewAlt: 'Car Rental Management System dashboard',
  },
  {
    num: '03',
    name: 'Hotel Management System',
    year: '2023',
    tag: 'Desktop / JavaFX',
    stack: 'Java · JavaFX · Oracle SQL · JDBC',
    desc:
      '5-screen JavaFX desktop suite for end-to-end hotel operations. Auto-refreshing dashboard, color-coded availability, automated billing engine.',
    metrics: [
      { k: 'Screens',  v: '5' },
      { k: 'Refresh',  v: '30s' },
      { k: 'Tables',   v: '3' },
      { k: 'Billing',  v: 'AUTO' },
    ],
    live: null,
    github: 'https://github.com/chrisjacob-dev/hotel-java-repo',
    preview: '/projects/hotel-management.png',
    previewAlt: 'Hotel Management System dashboard',
  },
];

export const EXPERIENCE = [
  {
    when: 'Sep 2025 — Present',
    role: 'Managing Committee',
    org: "Apple Developers' Group, Manipal",
    tag: 'Leadership',
    desc:
      'Organising technical workshops & iOS development events. Coordinating team activities and contributing to club planning.',
  },
  {
    when: 'Aug 2025',
    role: "Aurora '25 — Workshops",
    org: 'ISTE Manipal',
    tag: 'Workshop',
    desc:
      'Completed three workshops: Crafting the Web (full-stack), HackLinux (Linux & shell), and VisionCraft (UI/UX design).',
  },
  {
    when: 'May 2025 — Jul 2025',
    role: 'Software Engineering Intern',
    org: 'North Star Technology Company W.L.L',
    tag: 'Internship',
    desc:
      'Hands-on industry experience in a professional development environment — shipping code, code review, agile cycles.',
  },
  {
    when: 'Aug 2024 — Present',
    role: 'B.Tech — Computer Science & Engineering',
    org: 'Manipal Institute of Technology, MAHE',
    tag: 'Education',
    desc:
      'DSA, Database Systems, Operating Systems, Web Development, Data Analysis. Independent work in ML/GenAI.',
  },
];

export const STACK = [
  { glyph: 'PY', k: 'Languages',    v: 'Python · TypeScript · Java · C++ · Swift' },
  { glyph: 'AI', k: 'AI / ML',      v: 'PyTorch · TensorFlow · scikit-learn · Hugging Face' },
  { glyph: 'DM', k: 'Domain',       v: 'Computer Vision · NLP · Generative AI · Deep Learning' },
  { glyph: 'IO', k: 'Infra & Tools', v: 'Docker · Git · Oracle SQL · MySQL · FastAPI' },
];

export const CERTS = [
  'Google Data Analytics',
  'Python for Data Science — IBM',
  'Meta Data Analytics',
];
