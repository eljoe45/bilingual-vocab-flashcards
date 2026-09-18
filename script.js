// Bilingual Vocab Flashcards
// A small vocabulary trainer for common classroom words, English <-> Spanish.

document.getElementById('year').textContent = new Date().getFullYear();

// ---- Word list -----------------------------------------------------------
// Grouped by category so the app is useful for different classroom contexts.
const WORDS = [
  // Classroom directions
  { en: 'listen', es: 'escuchar', category: 'Classroom directions' },
  { en: 'raise your hand', es: 'levanta la mano', category: 'Classroom directions' },
  { en: 'sit down', es: 'siéntate', category: 'Classroom directions' },
  { en: 'line up', es: 'hagan fila', category: 'Classroom directions' },
  { en: 'turn the page', es: 'da vuelta la página', category: 'Classroom directions' },
  { en: 'work in pairs', es: 'trabajen en parejas', category: 'Classroom directions' },

  // Math terms
  { en: 'add', es: 'sumar', category: 'Math terms' },
  { en: 'subtract', es: 'restar', category: 'Math terms' },
  { en: 'number', es: 'número', category: 'Math terms' },
  { en: 'shape', es: 'figura', category: 'Math terms' },
  { en: 'equal', es: 'igual', category: 'Math terms' },
  { en: 'greater than', es: 'mayor que', category: 'Math terms' },

  // Feelings & check-ins
  { en: 'confused', es: 'confundido/a', category: 'Feelings & check-ins' },
  { en: 'proud', es: 'orgulloso/a', category: 'Feelings & check-ins' },
  { en: 'nervous', es: 'nervioso/a', category: 'Feelings & check-ins' },
  { en: 'excited', es: 'emocionado/a', category: 'Feelings & check-ins' },
  { en: 'I need help', es: 'necesito ayuda', category: 'Feelings & check-ins' },
  { en: 'I understand', es: 'entiendo', category: 'Feelings & check-ins' },
];

const CATEGORIES = ['All categories', ...new Set(WORDS.map(w => w.category))];
const STORAGE_KEY = 'vocab-flashcards-known-v1';
const CONFETTI_COLORS = ['#c2410c', '#fb923c', '#16a34a', '#f59e0b'];
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---- State -----------------------------------------------------------
let deck = [...WORDS];
let index = 0;
let direction = 'en-es';
let known = loadKnown();

// ---- Elements -----------------------------------------------------------
const categorySelect = document.getElementById('categorySelect');
const directionSelect = document.getElementById('directionSelect');
const shuffleBtn = document.getElementById('shuffleBtn');
const resetBtn = document.getElementById('resetBtn');
const flashcard = document.getElementById('flashcard');
const frontCategory = document.getElementById('frontCategory');
const frontWord = document.getElementById('frontWord');
const backCategory = document.getElementById('backCategory');
const backWord = document.getElementById('backWord');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const cardCounter = document.getElementById('cardCounter');
const progressFill = document.getElementById('progressFill');
const progressLabel = document.getElementById('progressLabel');
const stillLearningBtn = document.getElementById('stillLearningBtn');
const knowItBtn = document.getElementById('knowItBtn');
const quizArea = document.getElementById('quizArea');

// ---- Persistence -----------------------------------------------------------
function loadKnown() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch (err) {
    return new Set();
  }
}

function saveKnown() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...known]));
  } catch (err) {
    // localStorage can fail in private browsing; the app still works,
    // it just won't remember progress between visits.
  }
}

function wordKey(word) {
  return `${word.category}::${word.en}`;
}

// ---- Confetti -----------------------------------------------------------
// A small celebratory burst for "I know this" and correct quiz answers.
// Respects prefers-reduced-motion and cleans up after itself.
function fireConfetti(x, y) {
  if (prefersReducedMotion) return;

  const pieceCount = 22;
  for (let i = 0; i < pieceCount; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${x}px`;
    piece.style.top = `${y}px`;
    piece.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];

    const angle = Math.random() * Math.PI * 2;
    const distance = 50 + Math.random() * 90;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance - 30; // bias upward a little

    piece.style.setProperty('--tx', `${tx}px`);
    piece.style.setProperty('--ty', `${ty}px`);
    piece.style.setProperty('--rot', `${Math.random() * 720 - 360}deg`);

    document.body.appendChild(piece);
    piece.addEventListener('animationend', () => piece.remove());
  }
}

function confettiFromElement(el) {
  const rect = el.getBoundingClientRect();
  fireConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
}

// ---- Setup -----------------------------------------------------------
function init() {
  CATEGORIES.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  });

  categorySelect.addEventListener('change', () => {
    applyFilter();
  });

  directionSelect.addEventListener('change', () => {
    direction = directionSelect.value;
    renderCard();
  });

  shuffleBtn.addEventListener('click', () => {
    shuffle(deck);
    index = 0;
    renderCard();
  });

  resetBtn.addEventListener('click', () => {
    known = new Set();
    saveKnown();
    updateProgress();
  });

  flashcard.addEventListener('click', flipCard);
  flashcard.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      flipCard();
    }
  });

  prevBtn.addEventListener('click', () => step(-1));
  nextBtn.addEventListener('click', () => step(1));

  stillLearningBtn.addEventListener('click', () => {
    known.delete(wordKey(deck[index]));
    saveKnown();
    updateProgress();
    step(1);
  });

  knowItBtn.addEventListener('click', () => {
    known.add(wordKey(deck[index]));
    saveKnown();
    updateProgress();
    confettiFromElement(knowItBtn);
    step(1);
  });

  applyFilter();
  renderQuiz();
}

function applyFilter() {
  const cat = categorySelect.value;
  deck = cat === 'All categories' ? [...WORDS] : WORDS.filter(w => w.category === cat);
  index = 0;
  renderCard();
  updateProgress();
  renderQuiz();
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ---- Card rendering -----------------------------------------------------------
function flipCard() {
  flashcard.classList.toggle('is-flipped');
}

function step(delta) {
  if (deck.length === 0) return;
  index = (index + delta + deck.length) % deck.length;
  renderCard();
}

function renderCard() {
  if (deck.length === 0) {
    frontWord.textContent = 'No words in this category yet';
    backWord.textContent = '';
    cardCounter.textContent = '';
    return;
  }

  const word = deck[index];
  flashcard.classList.remove('is-flipped');

  const [frontLang, backLang] = direction === 'en-es' ? ['en', 'es'] : ['es', 'en'];

  frontCategory.textContent = word.category;
  frontWord.textContent = word[frontLang];
  backCategory.textContent = word.category;
  backWord.textContent = word[backLang];

  cardCounter.textContent = `Card ${index + 1} of ${deck.length}`;
}

function updateProgress() {
  const total = deck.length;
  const knownCount = deck.filter(w => known.has(wordKey(w))).length;
  const pct = total === 0 ? 0 : Math.round((knownCount / total) * 100);
  progressFill.style.width = `${pct}%`;
  progressLabel.textContent = `${knownCount} of ${total} known`;
}

// ---- Quiz mode -----------------------------------------------------------
function renderQuiz() {
  quizArea.innerHTML = '';
  if (deck.length < 4) {
    quizArea.innerHTML = '<p class="section-subtitle">Pick a category with at least 4 words to unlock the quiz.</p>';
    return;
  }
  askQuestion();
}

function askQuestion() {
  quizArea.innerHTML = '';

  const pool = [...deck];
  const questionWord = pool[Math.floor(Math.random() * pool.length)];
  const askEnglish = Math.random() < 0.5;
  const prompt = askEnglish ? questionWord.en : questionWord.es;
  const correctAnswer = askEnglish ? questionWord.es : questionWord.en;

  const distractors = shuffle(pool.filter(w => w !== questionWord))
    .slice(0, 3)
    .map(w => (askEnglish ? w.es : w.en));

  const options = shuffle([correctAnswer, ...distractors]);

  const questionEl = document.createElement('p');
  questionEl.className = 'quiz-question';
  questionEl.textContent = `What is "${prompt}" in ${askEnglish ? 'Spanish' : 'English'}?`;
  quizArea.appendChild(questionEl);

  const optionsEl = document.createElement('div');
  optionsEl.className = 'quiz-options';

  options.forEach(option => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'quiz-option';
    btn.textContent = option;
    btn.addEventListener('click', () => handleAnswer(btn, option, correctAnswer, optionsEl));
    optionsEl.appendChild(btn);
  });

  quizArea.appendChild(optionsEl);
}

function handleAnswer(button, chosen, correctAnswer, optionsEl) {
  const allButtons = optionsEl.querySelectorAll('.quiz-option');
  allButtons.forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === correctAnswer) btn.classList.add('is-correct');
  });

  if (chosen === correctAnswer) {
    confettiFromElement(button);
  } else {
    button.classList.add('is-wrong');
  }

  const feedback = document.createElement('p');
  feedback.className = 'quiz-feedback';
  feedback.textContent = chosen === correctAnswer ? 'Correct! 🎉' : `Not quite — the answer was "${correctAnswer}".`;
  quizArea.appendChild(feedback);

  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'btn btn-secondary quiz-next';
  nextBtn.textContent = 'Next question →';
  nextBtn.addEventListener('click', askQuestion);
  quizArea.appendChild(nextBtn);
}

init();
