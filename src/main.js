import './style.css'
import { searchBooks } from './api.js'
import { renderBookResults } from './bookResults.js'

const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#book-search')
const searchButton = document.querySelector('#search-button')
const searchMessage = document.querySelector('#search-message')
const bookResults = document.querySelector('#book-results')

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
  bookResults.replaceChildren()

  try {
    const books = await searchBooks(query)
    renderBookResults(books, bookResults)

    if (books.length === 0) {
      searchMessage.textContent = `No books found for “${query}”. Try another search.`
    } else {
      searchMessage.textContent = `${books.length} books found for “${query}”.`
    }
  } catch (error) {
    searchMessage.textContent = error.message
  } finally {
    searchButton.disabled = false
  }
})
