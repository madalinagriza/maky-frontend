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
  { target: 'Rock', keywords: ['rock', 'alt', 'alternative', 'indie', 'punk', 'grunge', 'garage'] },
  { target: 'Metal', keywords: ['metal', 'hardcore', 'thrash', 'doom', 'death'] },
  { target: 'Pop', keywords: ['pop', 'dance', 'electro', 'synth', 'k-pop', 'disco'] },
  { target: 'Country', keywords: ['country', 'bluegrass', 'americana', 'honky', 'western'] },
  { target: 'Jazz', keywords: ['jazz', 'swing', 'bebop', 'fusion'] },
  { target: 'Blues', keywords: ['blues', 'delta', 'slide'] },
  { target: 'Folk', keywords: ['folk', 'acoustic', 'singer-songwriter', 'roots'] },
  { target: 'Classical', keywords: ['classical', 'symphony', 'orchestra', 'baroque', 'choir'] },
  { target: 'R&B', keywords: ['r&b', 'rnb', 'neo-soul', 'funk', 'hip hop', 'hip-hop', 'soul'] },
  { target: 'Reggae', keywords: ['reggae', 'ska', 'dub'] },
]

export function mapGenreToOption(raw?: string | null): GenreOption {
  const normalized = raw?.toString().trim().toLowerCase() ?? ''
  if (!normalized) {
    return DEFAULT_GENRE
  }

  for (const { target, keywords } of GENRE_KEYWORDS) {
    if (keywords.some(keyword => normalized.includes(keyword))) {
      return target
    }
  }

  return DEFAULT_GENRE
}
