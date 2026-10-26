import { filterValidBooks } from './bookData.js'

function createBookCard(book, isSaved) {
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

  const saveButton = document.createElement('button')
  saveButton.className = 'save-button'
  saveButton.type = 'button'
  saveButton.dataset.bookKey = book.key
  saveButton.textContent = isSaved ? 'Remove from shelf' : 'Save for later'
  saveButton.setAttribute('aria-pressed', String(isSaved))
  details.append(saveButton)

  card.append(cover, details)
  return card
}

export function renderBookCards(books, container, savedBooks = []) {
  const cards = filterValidBooks(books)
    .map((book) => {
      const isSaved = savedBooks.some((savedBook) => savedBook.key === book.key)
      return createBookCard(book, isSaved)
    })

  container.replaceChildren(...cards)
}

export function renderMessage(element, messageClass, message, state) {
  element.textContent = message
  element.className = `${messageClass} is-${state}`
}
