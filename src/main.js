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
    searchMessage.textContent = 'Type a title, author, or subject to search.'
    searchInput.focus()
    return
  }

  searchButton.disabled = true
  searchMessage.textContent = 'Searching the library…'
  currentBooks = []
  updateBookLists()

  try {
    currentBooks = await searchBooks(query)
    updateBookLists()

    if (currentBooks.length === 0) {
      searchMessage.textContent = `No books found for “${query}”. Try another search.`
    } else {
      searchMessage.textContent = `${currentBooks.length} books found for “${query}”.`
    }
  } catch (error) {
    currentBooks = []
    updateBookLists()
    searchMessage.textContent = error.message
  } finally {
    searchButton.disabled = false
  }
})

updateBookLists()
