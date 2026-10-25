# Paper Trail
## Mission M2 · Async Odyssey - Web Development I

Paper Trail is a small book discovery app where you can search for books, save them to your shelf, and get suggestions based on the subjects attached to the books on your shelf.

## How to use it

1. Search by a book title, author, or subject.
2. Save books you like to your shelf. Your saved books stay in this browser after you reload the page.
3. Click the "Find recommendations" button to search for books related to the most common recognizable genre on your shelf.
4. Remove books from the shelf whenever you want.

The app also remembers search results in this browser, so a search you have already made can load more quickly next time.

## Use of AI

I used OpenAI Codex as a programming partner, and worked on the project in stages. I asked for help planning and implementing features, and asked follow-up questions when something was unclear. I reviewed the code and used the running app to check the changes as I worked.

## Autopsy

1. Open Library often gives books broad or overlapping subject tags. I first tried counting them directly, but that did not work well because books can have many different tags. So I chose to group related tags into a smaller set of genres and ignore very general labels such as “Fiction.” For example, if a book is tagged as both Dystopian and Science fiction, I count it as Dystopian so the broader label does not win just because it is common. This helps make the suggestions more personalized, although the results still depend on the tags Open Library provides.

2. I chose to show up to 12 search results and up to 8 recommendations at a time. This keeps the page manageable and limits how much data and how many book cards the app handles at once. The trade-off is that a book may not appear in the current results, so the user might need to try a more specific search.