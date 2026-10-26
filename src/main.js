import './style.css'
import { searchBooks } from './api.js'
import { filterValidBooks } from './bookData.js'
import { renderBookCards, renderMessage } from './bookResults.js'
import { findMostCommonGenre } from './recommendations.js'
import { loadSavedBooks, storeSavedBooks } from './storage.js'

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

let savedBooks = loadSavedBooks()
let currentBooks = []
let recommendedBooks = []
let latestSearchRequestId = 0
let latestRecommendationRequestId = 0

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

  latestRecommendationRequestId += 1
  recommendedBooks = []
  renderMessage(
    recommendationMessage,
    'recommendation-message',
    'Your shelf changed. Find recommendations again to refresh them.',
    'idle',
  )
  const booksWereStored = storeSavedBooks(savedBooks)
  updateBookLists()

  if (!booksWereStored) {
    renderMessage(searchMessage, 'search-message', 'Your saved shelf could not be stored in this browser.', 'error')
  }
})

recommendButton.addEventListener('click', async () => {
  const requestId = ++latestRecommendationRequestId
  const subject = findMostCommonGenre(savedBooks)

  if (!subject) {
    renderMessage(
      recommendationMessage,
      'recommendation-message',
      'Your saved books do not have specific subjects to base recommendations on yet.',
      'error',
    )
    return
  }

  recommendButton.disabled = true
  renderMessage(recommendationMessage, 'recommendation-message', `Looking for books about “${subject}”…`, 'loading')

  try {
    const books = await searchBooks(`subject:"${subject}"`)
    if (requestId !== latestRecommendationRequestId) return

    recommendedBooks = filterValidBooks(books)
      .filter((book) => !savedBooks.some((savedBook) => savedBook.key === book.key))
      .slice(0, 8)

    updateBookLists()

    if (recommendedBooks.length === 0) {
      renderMessage(
        recommendationMessage,
        'recommendation-message',
        `No new books found for “${subject}”. Try saving a different book.`,
        'empty',
      )
    } else {
      renderMessage(
        recommendationMessage,
        'recommendation-message',
        `Suggestions based on “${subject}” from your saved shelf.`,
        'success',
      )
    }
  } catch (error) {
    if (requestId !== latestRecommendationRequestId) return
    recommendedBooks = []
    updateBookLists()
    renderMessage(recommendationMessage, 'recommendation-message', error.message, 'error')
  } finally {
    if (requestId === latestRecommendationRequestId) {
      recommendButton.disabled = savedBooks.length === 0
    }
  }
})

searchForm.addEventListener('submit', async (event) => {
  event.preventDefault()
  const requestId = ++latestSearchRequestId
  const query = searchInput.value.trim()

  if (query === '') {
    searchButton.disabled = false
    renderMessage(searchMessage, 'search-message', 'Type a title, author, or subject to search.', 'error')
    searchInput.focus()
    return
  }

  searchButton.disabled = true
  renderMessage(searchMessage, 'search-message', 'Searching the library…', 'loading')
  currentBooks = []
  updateBookLists()

  try {
    const books = await searchBooks(query)
    if (requestId !== latestSearchRequestId) return

    currentBooks = filterValidBooks(books)
    updateBookLists()

    if (currentBooks.length === 0) {
      renderMessage(searchMessage, 'search-message', `No books found for “${query}”. Try another search.`, 'empty')
    } else {
      renderMessage(searchMessage, 'search-message', `${currentBooks.length} books found for “${query}”.`, 'success')
    }
  } catch (error) {
    if (requestId !== latestSearchRequestId) return
    currentBooks = []
    updateBookLists()
    renderMessage(searchMessage, 'search-message', error.message, 'error')
  } finally {
    if (requestId === latestSearchRequestId) searchButton.disabled = false
  }
})

updateBookLists()
