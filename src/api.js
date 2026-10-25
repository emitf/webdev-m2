const SEARCH_URL = 'https://openlibrary.org/search.json'
const SEARCH_CACHE_KEY = 'paper-trail-search-cache-v2'

function getCachedBooks(query) {
  try {
    const cacheText = localStorage.getItem(SEARCH_CACHE_KEY)
    const cache = cacheText ? JSON.parse(cacheText) : {}
    return Array.isArray(cache[query]) ? cache[query] : null
  } catch {
    return null
  }
}

function storeBooksInCache(query, books) {
  try {
    const cacheText = localStorage.getItem(SEARCH_CACHE_KEY)
    const cache = cacheText ? JSON.parse(cacheText) : {}
    cache[query] = books
    localStorage.setItem(SEARCH_CACHE_KEY, JSON.stringify(cache))
  } catch {
    // Search results can still be used even when the browser cannot store them.
  }
}

export async function searchBooks(query) {
  const cacheQuery = query.trim().toLowerCase()
  const cachedBooks = getCachedBooks(cacheQuery)

  if (cachedBooks !== null) return cachedBooks

  const params = new URLSearchParams({
    q: query,
    limit: '12',
    fields: 'key,title,author_name,first_publish_year,cover_i,subject',
  })

  let response

  try {
    response = await fetch(`${SEARCH_URL}?${params}`)
  } catch {
    throw new Error('Could not reach Open Library. Check your connection and try again.')
  }

  if (!response.ok) {
    throw new Error(`Open Library returned an error (${response.status}). Please try again.`)
  }

  const data = await response.json()

  if (!Array.isArray(data.docs)) {
    throw new Error('Open Library did not return a book list. Please try again.')
  }

  storeBooksInCache(cacheQuery, data.docs)
  return data.docs
}
