export function filterValidBooks(books) {
  if (!Array.isArray(books)) return []

  return books.filter((book) =>
    book
    && typeof book === 'object'
    && !Array.isArray(book)
    && typeof book.key === 'string'
    && book.key.trim() !== ''
    && typeof book.title === 'string'
    && book.title.trim() !== ''
  )
}
