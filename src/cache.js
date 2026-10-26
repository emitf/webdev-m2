import { filterValidBooks } from './bookData.js'

const SEARCH_CACHE_KEY = 'paper-trail-search-cache-v2'
const CACHE_MAX_AGE = 24 * 60 * 60 * 1000
const MAX_CACHE_ENTRIES = 20

function readCache() {
  try {
    const cacheText = localStorage.getItem(SEARCH_CACHE_KEY)
    if (cacheText === null) return []

    const cache = JSON.parse(cacheText)
    return Array.isArray(cache) ? cache : []
  } catch {
    return []
  }
}

export function getCachedBooks(query) {
  const now = Date.now()
  const entry = readCache().find((item) => item && item.query === query)

  if (!entry
    || !Number.isFinite(entry.savedAt)
    || entry.savedAt > now
    || now - entry.savedAt > CACHE_MAX_AGE
    || !Array.isArray(entry.books)) {
    return null
  }

  const books = filterValidBooks(entry.books)
  return books.length === entry.books.length ? books : null
}

export function storeBooksInCache(query, books) {
  const now = Date.now()
  const freshEntries = readCache().filter((entry) => {
    if (!entry || typeof entry.query !== 'string' || !Number.isFinite(entry.savedAt)) return false
    if (entry.savedAt > now || now - entry.savedAt > CACHE_MAX_AGE) return false
    if (!Array.isArray(entry.books)) return false

    return filterValidBooks(entry.books).length === entry.books.length
  })

  const updatedCache = [
    { query, savedAt: now, books: filterValidBooks(books) },
    ...freshEntries.filter((entry) => entry.query !== query),
  ].slice(0, MAX_CACHE_ENTRIES)

  try {
    localStorage.setItem(SEARCH_CACHE_KEY, JSON.stringify(updatedCache))
  } catch {
    // Search results can still be used when the browser cannot store them.
  }
}
