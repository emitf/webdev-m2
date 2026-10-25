const GENERAL_SUBJECTS = [
  'fiction',
  'juvenile fiction',
  'young adult fiction',
  'accessible book',
  'protected daisy',
  'large type books',
]

const GENRE_GROUPS = {
  Romance: ['romance', 'romantic fiction', 'rom-com', 'love stories'],
  Mystery: ['mystery', 'detective'],
  Crime: ['crime'],
  Thriller: ['thriller', 'suspense'],
  Dystopian: ['dystop'],
  'Science fiction': ['science fiction', 'science-fiction', 'sci-fi', 'scifi'],
  Fantasy: ['fantasy'],
  Horror: ['horror'],
  Adventure: ['adventure'],
}

export function findMostCommonGenre(books) {
  const genreCounts = books.reduce((counts, book) => {
    const subjects = Array.isArray(book.subject) ? book.subject : []
    const bookGenres = new Set()

    subjects.forEach((subject) => {
      if (typeof subject !== 'string' || subject.trim() === '') return
      const cleanSubject = subject.trim()
      if (GENERAL_SUBJECTS.includes(cleanSubject.toLowerCase())) return

      Object.entries(GENRE_GROUPS).forEach(([genre, hints]) => {
        if (hints.some((hint) => cleanSubject.toLowerCase().includes(hint))) {
          bookGenres.add(genre)
        }
      })
    })

    bookGenres.forEach((genre) => {
      // Count a specific dystopian label instead of also counting its broader sci-fi label.
      if (genre === 'Science fiction' && bookGenres.has('Dystopian')) return
      counts[genre] = (counts[genre] || 0) + 1
    })

    return counts
  }, {})

  const mostCommonGenre = Object.entries(genreCounts)
    .sort((first, second) => second[1] - first[1])[0]

  return mostCommonGenre ? mostCommonGenre[0] : null
}
