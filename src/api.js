const SEARCH_URL = 'https://openlibrary.org/search.json'

export async function searchBooks(query) {
  const params = new URLSearchParams({
    q: query,
    limit: '12',
    fields: 'key,title,author_name,first_publish_year,cover_i',
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

  return data.docs
}
