# Bilingual Vocab Flashcards

A small English ↔ Spanish flashcard and quiz app for common classroom vocabulary
— things like directions ("raise your hand"), math terms, and feelings check-ins.

**[Live demo](https://eljoe45.github.io/bilingual-vocab-flashcards/)**

## Why I built this

My path into web development started through my work in special education and
language equity for English learners. I wanted my first "real" JavaScript project
to be something that actually connects to that — a tool a teacher or a student
could use to practice classroom vocabulary in two languages, not just a generic
to-do app.

## What it does

- **Flip cards**: click (or press Enter/Space) to flip between English and Spanish.
- **Direction toggle**: quiz yourself English → Spanish or Spanish → English.
- **Categories**: filter by classroom directions, math terms, or feelings & check-ins.
- **Progress tracking**: mark a card "I know this" or "Still learning" — progress is
  saved in the browser (`localStorage`) so it's there next time you visit.
- **Quiz mode**: multiple-choice questions pulled from whichever category you're
  studying.

## What I learned building it

- Flipping a card with pure CSS using `transform-style: preserve-3d` and
  `backface-visibility`, instead of swapping text with JavaScript.
- Reading and writing state to `localStorage`, and wrapping it in `try/catch` so
  the app still works if storage is unavailable (private browsing, etc.).
- Building a small quiz generator: picking a random question, generating wrong
  answers from the rest of the word list, and disabling buttons after an answer
  is picked.
- Keeping data (the word list) separate from rendering logic, so adding a new
  category is just adding rows to an array.

## Stack

Plain HTML, CSS, and JavaScript — no frameworks or build step. Deployed with
GitHub Pages.

## Adding more words

Word pairs live in a single array at the top of `script.js`:

```js
{ en: 'listen', es: 'escuchar', category: 'Classroom directions' },
```

Add a new object to `WORDS` with a new `category` value and it shows up in the
category dropdown automatically.

## Part of

[My portfolio](https://eljoe45.github.io) — I'm learning to code in public,
one small project at a time.

