import { filterValidBooks } from './bookData.js'

const SAVED_BOOKS_KEY = 'paper-trail-saved-books'

export function loadSavedBooks() {
  try {
    const savedBooksText = localStorage.getItem(SAVED_BOOKS_KEY)
    if (savedBooksText === null) return []

    return filterValidBooks(JSON.parse(savedBooksText))
  } catch {
    return []
  }
}

export function storeSavedBooks(books) {
  try {
    localStorage.setItem(SAVED_BOOKS_KEY, JSON.stringify(filterValidBooks(books)))
    return true
  } catch {
    return false
  }
}
