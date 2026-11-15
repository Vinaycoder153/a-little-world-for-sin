export const birthdayConfig = {
  name: 'Sinchana',
  nickname: 'Sin',
  date: '25 November 2006',
  edition: '25 November 2026',
  tagline: 'Some people deserve more than just a birthday wish. They deserve an entire world.',
  letter: [
    'Dear Sin,',
    '',
    'Today is all about you.',
    '',
    'I hope your life is always filled with beautiful surprises, endless happiness, genuine smiles and opportunities that bring you closer to your dreams.',
    '',
    'Never stop being the wonderful person you are.',
    '',
    'May every new chapter of your life be more beautiful than the last.',
    '',
    'You deserve all the little and big happiness this world has to offer.',
    '',
    'Keep smiling, keep shining and keep being YOU.',
    '',
    'Happy Birthday, Sin!',
    '',
    'With lots of love,',
    'Your Bestie.',
  ],
  memories: [
    { label: 'HER_PHOTO_01', caption: 'A place waiting for a memory', image: '' },
    { label: 'HER_PHOTO_02', caption: 'The next chapter is yours', image: '' },
    { label: 'HER_PHOTO_03', caption: 'A little light, just like you', image: '' },
    { label: 'FRIENDSHIP_MEMORY_01', caption: 'A moment to add here', image: '' },
    { label: 'FRIENDSHIP_MEMORY_02', caption: 'More beautiful days ahead', image: '' },
  ],
  wishes: [
    'Endless happiness',
    'Beautiful opportunities',
    'Dreams becoming reality',
    'Genuine friendships',
    'Peace and confidence',
    'Countless reasons to smile',
  ],
  assets: {
    video: '/assets/BIRTHDAY_VIDEO.mp4',
    music: '/assets/BACKGROUND_MUSIC.mp3',
  },
  theme: {
    blush: '#F8DDE8',
    rose: '#E9A8C1',
    gold: '#D6B36A',
    ivory: '#FFF9F5',
    deepRose: '#9B456A',
    ink: '#49313C',
  },
} as const

export type Memory = {
  label: string
  caption: string
  image: string
}
