import express from 'express';
import {
  renderHome,
  renderDecks,
  renderCreateForm,
  createFlashcardSet,
  renderStudySet,
  flipCard,
  navigateCard,
  renderEditCard,
  updateCard,
  deleteCard,
  renderEditCardInDeck,
  renderEditDeck,
  renderEditCards,
  renderAddCardForm,
  addCardToDeck,
  deleteCardFromDeck,
  updateDeck,
  deleteDeck
} from '../controllers/flashcardController.js';

const router = express.Router();

// Home and decks routes
router.get('/', renderHome);
router.get('/decks', renderDecks);

// Create routes
router.get('/create', renderCreateForm);
router.post('/create', createFlashcardSet);

// Study session routes
router.get('/study/:id', renderStudySet);
router.post('/study/:id/flip', flipCard);
router.post('/study/:id/navigate', navigateCard);

// Card editing routes
router.get('/study/:id/edit/:cardId', renderEditCard);
router.post('/study/:id/update/:cardId', updateCard);
router.post('/study/:id/delete/:cardId', deleteCard);
router.get('/edit/:id', renderEditDeck);
router.get('/edit/:id/cards', renderEditCards);
router.get('/edit/:id/card/:cardId', renderEditCardInDeck);
router.get('/edit/:id/add-card', renderAddCardForm);
router.post('/add/:id/card', addCardToDeck);
router.post('/delete/:id/card/:cardId', deleteCardFromDeck);
router.post('/delete/:id', deleteDeck);
router.post('/edit/:id', updateDeck);

export default router;
