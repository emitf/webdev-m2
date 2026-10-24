function createBookCard(book) {
  const card = document.createElement('article')
  card.className = 'book-card'

  const cover = document.createElement('div')
  cover.className = 'book-cover'

  if (Number.isInteger(book.cover_i)) {
    const image = document.createElement('img')
    image.src = `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
    image.alt = `Cover of ${book.title}`
    image.loading = 'lazy'
    image.addEventListener('error', () => {
      cover.textContent = 'Cover unavailable'
    }, { once: true })
    cover.append(image)
  } else {
    cover.textContent = 'No cover available'
  }

  const details = document.createElement('div')
  details.className = 'book-details'

  const title = document.createElement('h3')
  title.textContent = book.title
  details.append(title)

  const author = document.createElement('p')
  author.className = 'book-author'
  author.textContent = Array.isArray(book.author_name) && book.author_name.length > 0
    ? book.author_name[0]
    : 'Author unknown'
  details.append(author)

  const year = document.createElement('p')
  year.className = 'book-year'
  year.textContent = Number.isInteger(book.first_publish_year)
    ? `First published ${book.first_publish_year}`
    : 'Publication year unknown'
  details.append(year)

  card.append(cover, details)
  return card
}

export function renderBookResults(books, container) {
  const cards = books
    .filter((book) => book && typeof book.title === 'string' && book.title.trim() !== '')
    .map((book) => createBookCard(book))

  container.replaceChildren(...cards)
}
