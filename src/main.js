import './style.css'
import { searchBooks } from './api.js'
import { renderBookCards } from './bookResults.js'

const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#book-search')
const searchButton = document.querySelector('#search-button')
const searchMessage = document.querySelector('#search-message')
const bookResults = document.querySelector('#book-results')
const savedBooksContainer = document.querySelector('#saved-books')
const savedEmptyMessage = document.querySelector('#saved-empty')
const savedCount = document.querySelector('#saved-count')
const recommendButton = document.querySelector('#recommend-button')
const recommendationMessage = document.querySelector('#recommendation-message')
const recommendedBooksContainer = document.querySelector('#recommended-books')

const SAVED_BOOKS_KEY = 'paper-trail-saved-books'
const GENERAL_SUBJECTS = [
  'fiction',
  'juvenile fiction',
  'young adult fiction',
  'accessible book',
  'protected daisy',
  'large type books',
]
const GENRE_GROUPS = {
  Romance: ['romance', 'love stories'],
  Mystery: ['mystery', 'detective'],
  Crime: ['crime'],
  Thriller: ['thriller', 'suspense'],
  Dystopian: ['dystop'],
  'Science fiction': ['science fiction', 'sci-fi'],
  Fantasy: ['fantasy'],
  Horror: ['horror'],
  Adventure: ['adventure'],
}

let currentBooks = []
let recommendedBooks = []

function loadSavedBooks() {
  try {
    const savedBooksText = localStorage.getItem(SAVED_BOOKS_KEY)

    if (savedBooksText === null) return []

    const books = JSON.parse(savedBooksText)
    return Array.isArray(books) ? books : []
  } catch {
    return []
  }
}

let savedBooks = loadSavedBooks()

function storeSavedBooks() {
  try {
    localStorage.setItem(SAVED_BOOKS_KEY, JSON.stringify(savedBooks))
    return true
  } catch {
    return false
  }
}

function setSearchMessage(message, state) {
  searchMessage.textContent = message
  searchMessage.className = `search-message is-${state}`
}

function setRecommendationMessage(message, state) {
  recommendationMessage.textContent = message
  recommendationMessage.className = `recommendation-message is-${state}`
}

function findMostCommonGenre(books) {
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

function updateBookLists() {
  renderBookCards(currentBooks, bookResults, savedBooks)
  renderBookCards(savedBooks, savedBooksContainer, savedBooks)
  const booksNotSaved = recommendedBooks.filter((book) =>
    !savedBooks.some((savedBook) => savedBook.key === book.key)
  )
  renderBookCards(booksNotSaved, recommendedBooksContainer, savedBooks)

  savedEmptyMessage.hidden = savedBooks.length > 0
  savedCount.textContent = `${savedBooks.length} ${savedBooks.length === 1 ? 'book' : 'books'}`
  recommendButton.disabled = savedBooks.length === 0
}

document.addEventListener('click', (event) => {
  const saveButton = event.target.closest('[data-book-key]')

  if (!saveButton) return

  const bookKey = saveButton.dataset.bookKey
  const isAlreadySaved = savedBooks.some((book) => book.key === bookKey)

  if (isAlreadySaved) {
    savedBooks = savedBooks.filter((book) => book.key !== bookKey)
  } else {
    const bookToSave = currentBooks.find((book) => book.key === bookKey)
      || recommendedBooks.find((book) => book.key === bookKey)
    if (bookToSave) savedBooks = [...savedBooks, bookToSave]
  }

  recommendedBooks = []
  setRecommendationMessage('Your shelf changed. Find recommendations again to refresh them.', 'idle')
  const booksWereStored = storeSavedBooks()
  updateBookLists()

  if (!booksWereStored) {
    setSearchMessage('Your saved shelf could not be stored in this browser.', 'error')
  }
})

recommendButton.addEventListener('click', async () => {
  const subject = findMostCommonGenre(savedBooks)

  if (!subject) {
    setRecommendationMessage('Your saved books do not have specific subjects to base recommendations on yet.', 'error')
    return
  }

  recommendButton.disabled = true
  setRecommendationMessage(`Looking for books about “${subject}”…`, 'loading')

  try {
    const books = await searchBooks(`subject:"${subject}"`)
    recommendedBooks = books
      .filter((book) =>
        book && typeof book.title === 'string' && book.title.trim() !== ''
        && !savedBooks.some((savedBook) => savedBook.key === book.key)
      )
      .slice(0, 8)

    updateBookLists()

    if (recommendedBooks.length === 0) {
      setRecommendationMessage(`No new books found for “${subject}”. Try saving a different book.`, 'empty')
    } else {
      setRecommendationMessage(`Suggestions based on “${subject}” from your saved shelf.`, 'success')
    }
  } catch (error) {
    recommendedBooks = []
    updateBookLists()
    setRecommendationMessage(error.message, 'error')
  } finally {
    recommendButton.disabled = savedBooks.length === 0
  }
})

searchForm.addEventListener('submit', async (event) => {
  event.preventDefault()

  const query = searchInput.value.trim()

  if (query === '') {
    setSearchMessage('Type a title, author, or subject to search.', 'error')
    searchInput.focus()
    return
  }

  searchButton.disabled = true
  setSearchMessage('Searching the library…', 'loading')
  currentBooks = []
  updateBookLists()

  try {
    currentBooks = await searchBooks(query)
    updateBookLists()

    if (currentBooks.length === 0) {
      setSearchMessage(`No books found for “${query}”. Try another search.`, 'empty')
    } else {
      setSearchMessage(`${currentBooks.length} books found for “${query}”.`, 'success')
    }
  } catch (error) {
    currentBooks = []
    updateBookLists()
    setSearchMessage(error.message, 'error')
  } finally {
    searchButton.disabled = false
  }
})

updateBookLists()
