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

let currentBooks = []
let savedBooks = []

function setSearchMessage(message, state) {
  searchMessage.textContent = message
  searchMessage.className = `search-message is-${state}`
}

function updateBookLists() {
  renderBookCards(currentBooks, bookResults, savedBooks)
  renderBookCards(savedBooks, savedBooksContainer, savedBooks)

  savedEmptyMessage.hidden = savedBooks.length > 0
  savedCount.textContent = `${savedBooks.length} ${savedBooks.length === 1 ? 'book' : 'books'}`
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
    if (bookToSave) savedBooks = [...savedBooks, bookToSave]
  }

  updateBookLists()
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
