export const GENRE_OPTIONS = [
  'Rock',
  'Pop',
  'Country',
  'Jazz',
  'Blues',
  'Folk',
  'Classical',
  'Metal',
  'R&B',
  'Reggae',
] as const

export type GenreOption = (typeof GENRE_OPTIONS)[number]

export const DEFAULT_GENRE: GenreOption = 'Pop'

const GENRE_KEYWORDS: Array<{ target: GenreOption; keywords: string[] }> = [
  {
    target: 'Reggae',
    keywords: ['reggae', 'ska', 'dub', 'rocksteady'],
  },
  {
    target: 'Country',
    keywords: [
      'country',
      'bluegrass',
      'newgrass',
      'americana',
      'honky',
      'texas country',
      'red dirt',
      'outlaw',
      'western',
      'alt country',
      'classic country',
      'traditional country',
    ],
  },
  {
    target: 'Folk',
    keywords: [
      'folk',
      'anti-folk',
      'ambient folk',
      'celtic',
      'chanson',
      'corridos',
      'corrido',
      'cumbia',
      'banda',
      'bolero',
      'fado',
      'laiko',
      'sea shanties',
      'sea shanty',
      'singer-songwriter',
      'lullaby',
      'polka',
      'sufi',
      'trova',
      'folklore',
      'latin folk',
      'italian singer-songwriter',
      'ccm',
      'southern gothic',
      'traditional folk',
      'variete francaise',
    ],
  },
  {
    target: 'Blues',
    keywords: ['blues', 'delta', 'modern blues'],
  },
  {
    target: 'Jazz',
    keywords: ['jazz', 'swing', 'bebop', 'fusion', 'vocal jazz'],
  },
  {
    target: 'R&B',
    keywords: [
      'r&b',
      'rnb',
      'soul',
      'neo-soul',
      'philly soul',
      'funk',
      'hip hop',
      'hip-hop',
      'lo-fi hip hop',
      'trip hop',
      'trap',
      'rap',
      'cloud rap',
      'anime rap',
      'dark r&b',
      'doo-wop',
      'gospel',
      'southern gospel',
      'worship',
      'asakaa',
      'afrobeats',
      'horrorcore',
      'indie soul',
      'italian trap',
      'french rap',
      'finnish hip hop',
    ],
  },
  {
    target: 'Rock',
    keywords: [
      'rock',
      'punk',
      'emo',
      'shoegaze',
      'slowcore',
      'post-hardcore',
      'post-punk',
      'post-rock',
      'post-grunge',
      'proto-punk',
      'riot grrrl',
      'new wave',
      'neue deutsche welle',
      'aor',
      'garage rock',
      'noise rock',
      'psych',
      'psychedelic',
      'gothic rock',
      'hardcore punk',
      'horror punk',
      'riot-grrrl',
      'riotgrrrl',
      'indie rock',
      'indie punk',
      'pinoy rock',
      'norsk rock',
      'norwegian rock',
      'surf rock',
      'stoner rock',
      'power pop',
      'art rock',
      'arena rock',
    ],
  },
  {
    target: 'Metal',
    keywords: [
      'metal',
      'thrash',
      'doom',
      'power metal',
      'glam metal',
      'industrial metal',
      'metalcore',
      'nu metal',
      'trap metal',
      'medieval metal',
    ],
  },
  {
    target: 'Pop',
    keywords: [
      'pop',
      'dance',
      'disco',
      'electro',
      'synth',
      'synthpop',
      'bedroom pop',
      'dream pop',
      'art pop',
      'baroque pop',
      'bangla pop',
      'bollywood',
      'britpop',
      'dansk pop',
      'dansband',
      'dansktop',
      'french pop',
      'german pop',
      'swedish pop',
      'finnish pop',
      'kayokyoku',
      'j-pop',
      'k-pop',
      'jangle pop',
      'hyperpop',
      'anime',
      'nu disco',
      'schlager',
      'variete',
      'opm',
      'malay',
      'glitch',
      "children's music",
      'christmas',
      'comedy',
      'eurodance',
      'indie pop',
      'latin pop',
      'iskelma',
      'hollands',
      'trance',
    ],
  },
  {
    target: 'Classical',
    keywords: ['classical', 'symphony', 'orchestra', 'baroque', 'choir', 'medieval', 'chamber'],
  },
]

export function mapGenreToOption(raw?: string | null): GenreOption {
  const normalized = raw?.toString().trim().toLowerCase() ?? ''
  const asciiNormalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  if (!normalized) {
    return DEFAULT_GENRE
  }

  const matchesKeyword = (keyword: string) => {
    const lowerKeyword = keyword.toLowerCase()
    const asciiKeyword = lowerKeyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    return normalized.includes(lowerKeyword) || asciiNormalized.includes(asciiKeyword)
  }

  for (const { target, keywords } of GENRE_KEYWORDS) {
    if (keywords.some(matchesKeyword)) {
      return target
    }
  }

  if (normalized.includes('indie')) {
    if (normalized.includes('folk')) return 'Folk'
    if (normalized.includes('pop')) return 'Pop'
    if (normalized.includes('soul')) return 'R&B'
    return 'Rock'
  }

  if (normalized.includes('latin')) {
    if (normalized.includes('country')) return 'Country'
    if (normalized.includes('folk')) return 'Folk'
    return 'Pop'
  }

  if (normalized.includes('christian')) {
    if (normalized.includes('hip hop') || normalized.includes('rap')) return 'R&B'
    if (normalized.includes('rock')) return 'Rock'
    if (normalized.includes('country')) return 'Country'
    return 'Folk'
  }

  return DEFAULT_GENRE
}
