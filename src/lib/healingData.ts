export interface MeditationSession {
  id: string;
  title: string;
  description: string;
  duration: string;
  focus: string;
  benefits: string[];
  color: string;
}

export interface YogaPose {
  id: string;
  name: string;
  sanskritName: string;
  benefits: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
}

export interface Crystal {
  id: string;
  name: string;
  color: string;
  chakra: string;
  element: string;
  benefits: string;
  image?: string;
}

export const MEDITATIONS: MeditationSession[] = [
  {
    id: 'inner-peace',
    title: 'Inner Peace & Calm',
    description: 'A soothing guide to disconnect from external noise and find your center.',
    duration: '10 min',
    focus: 'Stress Relief',
    benefits: ['Reduces anxiety', 'Lowers heart rate', 'Mental clarity'],
    color: 'bg-indigo-500',
  },
  {
    id: 'morning-vitality',
    title: 'Morning Energy Flow',
    description: 'Awaken your spirit and set a positive intention for the day ahead.',
    duration: '5 min',
    focus: 'Energy',
    benefits: ['Alertness', 'Motivation', 'Positive outlook'],
    color: 'bg-amber-500',
  },
  {
    id: 'deep-sleep',
    title: 'Restful Sleep',
    description: 'Prepare your mind and body for a deep, restorative night of rest.',
    duration: '15 min',
    focus: 'Sleep',
    benefits: ['Faster sleep onset', 'Improved sleep quality', 'Body relaxation'],
    color: 'bg-slate-800',
  },
];

export const YOGA_POSES: YogaPose[] = [
  {
    id: 'tadasana',
    name: 'Mountain Pose',
    sanskritName: 'Tadasana',
    benefits: ['Improves posture', 'Strengthens thighs', 'Promotes stability'],
    difficulty: 'Beginner',
    category: 'Standing',
  },
  {
    id: 'adho-mukha',
    name: 'Downward Dog',
    sanskritName: 'Adho Mukha Svanasana',
    benefits: ['Energizes the body', 'Stretches hamstrings', 'Calms the brain'],
    difficulty: 'Beginner',
    category: 'Inversion',
  },
  {
    id: 'vrikshasana',
    name: 'Tree Pose',
    sanskritName: 'Vrikshasana',
    benefits: ['Balance', 'Ankle strength', 'Mental focus'],
    difficulty: 'Intermediate',
    category: 'Balance',
  },
  {
    id: 'balasana',
    name: 'Child’s Pose',
    sanskritName: 'Balasana',
    benefits: ['Deep relaxation', 'Relieves back pain', 'Internal calm'],
    difficulty: 'Beginner',
    category: 'Restorative',
  },
];

export const CRYSTALS: Crystal[] = [
  {
    id: 'amethyst',
    name: 'Amethyst',
    color: 'Purple',
    chakra: 'Third Eye, Crown',
    element: 'Air',
    benefits: 'Enhances intuition, provides spiritual protection, and creates inner peace.',
  },
  {
    id: 'rose-quartz',
    name: 'Rose Quartz',
    color: 'Pink',
    chakra: 'Heart',
    element: 'Earth, Water',
    benefits: 'The stone of universal love. Restores trust and harmony in relationships.',
  },
  {
    id: 'citrine',
    name: 'Citrine',
    color: 'Yellow/Gold',
    chakra: 'Solar Plexus',
    element: 'Fire',
    benefits: 'Promotes motivation, activates creativity, and encourages self-expression.',
  },
  {
    id: 'black-tourmaline',
    name: 'Black Tourmaline',
    color: 'Black',
    chakra: 'Root',
    element: 'Earth',
    benefits: 'Powerful grounding stone. Absorbs negative energy and provides protection.',
  },
];
