import * as flashcardModel from '../models/flashcardModel.js';

// Helper function for validation
const validateFlashcardContent = (term, definition) => {
  const errors = [];
  
  if (!term || term.trim().length === 0) {
    errors.push('Term cannot be empty');
  } else if (term.trim().length < 3) {
    errors.push('Term must be at least 3 characters');
  } else if (term.length > 500) {
    errors.push('Term must be less than 500 characters');
  }
  
  if (!definition || definition.trim().length === 0) {
    errors.push('Definition cannot be empty');
  } else if (definition.trim().length < 3) {
    errors.push('Definition must be at least 3 characters');
  } else if (definition.length > 1000) {
    errors.push('Definition must be less than 1000 characters');
  }
  
  return errors;
};

export const renderHome = (req, res) => {
  res.render('home', { 
    title: 'Welcome',
    currentPath: req.path
  });
};

export const renderCreateForm = (req, res) => {
  res.render('create', { 
    title: 'Create New Set',
    currentPath: req.path
  });
};

export const createFlashcardSet = async (req, res, next) => {
  try {
    const { title, description, terms = [], definitions = [] } = req.body;
    const errors = [];
    
    // Validate title
    if (!title || title.trim().length === 0) {
      errors.push('Title is required');
    } else if (title.trim().length < 3) {
      errors.push('Title must be at least 3 characters');
    } else if (title.length > 100) {
      errors.push('Title must be less than 100 characters');
    }
    
    // Validate description (optional)
    if (description && description.trim().length > 0) {
      if (description.trim().length < 3) {
        errors.push('Description must be at least 3 characters if provided');
      } else if (description.length > 500) {
        errors.push('Description must be less than 500 characters');
      }
    }
    
    // Validate cards
    if (terms.length === 0 || definitions.length === 0) {
      errors.push('At least one flashcard is required');
    } else if (terms.length !== definitions.length) {
      errors.push('Each term must have a corresponding definition');
    } else {
      // Validate each card
      terms.forEach((term, index) => {
        const cardErrors = validateFlashcardContent(term, definitions[index]);
        if (cardErrors.length > 0) {
          errors.push(`Card ${index + 1}: ${cardErrors.join(', ')}`);
        }
      });
    }
    
if (errors.length > 0) {
  return res.status(400).render('create', {
    title: 'Create New Set',
    errorMessages: errors, // Changed from 'errors' to 'errorMessages' for clarity
    formData: req.body,
    currentPath: req.path
  });
}

    const newSet = await flashcardModel.createSet(title, description);
    await flashcardModel.createCards(newSet.id, terms, definitions);
    
    res.redirect(`/study/${newSet.id}`);
  } catch (error) {
    next(error);
  }
};

export const renderStudySet = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentCardIndex = parseInt(req.query.card) || 0;
    const isFlipped = req.query.flipped === 'true';
    
    if (isNaN(currentCardIndex)) {
      return res.status(400).render('400', {
        title: 'Bad Request',
        message: 'Invalid card index'
      });
    }
    
    const { set, cards } = await flashcardModel.getSetWithCards(id);
    
    if (!set || cards.length === 0) {
      return res.status(404).render('404', {
        title: 'Not Found',
        message: 'Flashcard set not found or empty'
      });
    }

    const validatedIndex = Math.min(Math.max(currentCardIndex, 0), cards.length - 1);
    
    res.render('study', { 
      title: `Studying: ${set.title}`,
      set, 
      cards,
      currentCardIndex: validatedIndex,
      isFlipped,
      currentPath: req.path
    });
  } catch (error) {
    next(error);
  }
};

export const flipCard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentCardIndex = parseInt(req.query.card) || 0;
    const isFlipped = req.query.flipped !== 'true'; // Toggle the state
    
    res.redirect(`/study/${id}?card=${currentCardIndex}&flipped=${isFlipped}`);
  } catch (error) {
    next(error);
  }
};

export const navigateCard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { direction } = req.body;
    const currentCardIndex = parseInt(req.query.card) || 0;
    
    if (!['next', 'prev'].includes(direction)) {
      return res.status(400).render('400', {
        title: 'Bad Request',
        message: 'Invalid navigation direction'
      });
    }
    
    const cardCount = await flashcardModel.getCardCount(id);
    let newIndex = currentCardIndex + (direction === 'next' ? 1 : -1);
    
    newIndex = Math.max(0, Math.min(newIndex, cardCount - 1));
    
    res.redirect(`/study/${id}?card=${newIndex}&flipped=false`);
  } catch (error) {
    next(error);
  }
};

export const renderEditCard = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const card = await flashcardModel.getCard(cardId);
    
    if (!card) {
      return res.status(404).render('404', {
        title: 'Not Found',
        message: 'Flashcard not found'
      });
    }

    // Fetch all cards for the deck
    const cardsData = await flashcardModel.getSetWithCards(card.set_id);

    res.render('edit-card', { 
      title: 'Edit Flashcard',
      card,
      cards: cardsData.cards,
      currentPath: req.path
    });
  } catch (error) {
    next(error);
  }
};

export const updateCard = async (req, res, next) => {
  try {
    const { id, cardId } = req.params;
    const { term, definition } = req.body;
    
    const errors = validateFlashcardContent(term, definition);
    if (errors.length > 0) {
      // Fetch all cards for the deck to pass to the view
      const cardsData = await flashcardModel.getSetWithCards(id);
      return res.status(400).render('edit-card', {
        title: 'Edit Flashcard',
        card: { id: cardId, term, definition, set_id: id },
        cards: cardsData.cards,
        errors,
        currentPath: req.path
      });
    }

    await flashcardModel.updateCard(cardId, term, definition);
    res.redirect(`/study/${id}`);
  } catch (error) {
    next(error);
  }
};

export const deleteCard = async (req, res, next) => {
  try {
    const { id, cardId } = req.params;
    await flashcardModel.deleteCard(cardId);
    res.redirect(`/study/${id}`);
  } catch (error) {
    next(error);
  }
};

export const renderDecks = async (req, res, next) => {
  try {
    const sets = await flashcardModel.getAllSets();
    res.render('decks', { 
      title: 'Your Flashcard Decks',
      sets,
      currentPath: req.path
    });
  } catch (error) {
    next(error);
  }
};

export const renderEditDeck = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { set, cards } = await flashcardModel.getSetWithCards(id);
    
    if (!set) {
      return res.status(404).render('404', {
        title: 'Not Found',
        message: 'Flashcard deck not found'
      });
    }

    res.render('edit-deck', { 
      title: `Editing: ${set.title}`,
      set,
      cards,
      currentPath: req.path
    });
  } catch (error) {
    next(error);
  }
};

export const renderEditCards = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { set, cards } = await flashcardModel.getSetWithCards(id);

    if (!set) {
      return res.status(404).render('404', {
        title: 'Not Found',
        message: 'Flashcard deck not found'
      });
    }

    res.render('edit-cards', {
      title: `Editing Cards: ${set.title}`,
      set,
      cards,
      currentPath: req.path
    });
  } catch (error) {
    next(error);
  }
};

export const renderAddCardForm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { set } = await flashcardModel.getSetWithCards(id);

    if (!set) {
      return res.status(404).render('404', {
        title: 'Not Found',
        message: 'Flashcard deck not found'
      });
    }

    res.render('add-card', {
      title: `Add New Card to: ${set.title}`,
      set,
      currentPath: req.path
    });
  } catch (error) {
    next(error);
  }
};

export const renderEditCardInDeck = async (req, res, next) => {
  try {
    const { id, cardId } = req.params;
    const card = await flashcardModel.getCard(cardId);
    
    if (!card) {
      return res.status(404).render('404', {
        title: 'Not Found',
        message: 'Flashcard not found'
      });
    }

    // Fetch all cards for the deck
    const cardsData = await flashcardModel.getSetWithCards(card.set_id);

    res.render('edit-card', { 
      title: 'Edit Flashcard',
      card,
      cards: cardsData.cards,
      currentPath: req.path,
      backUrl: `/edit/${id}`
    });
  } catch (error) {
    next(error);
  }
};

export const addCardToDeck = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { term, definition } = req.body;
    
    const errors = validateFlashcardContent(term, definition);
    if (errors.length > 0) {
      // Render the add-card view with errors and form data
      const { set } = await flashcardModel.getSetWithCards(id);
      return res.status(400).render('add-card', {
        title: `Add New Card to: ${set.title}`,
        set,
        errorMessages: errors,
        formData: { term, definition },
        currentPath: req.path
      });
    }

    await flashcardModel.createCards(id, [term], [definition]);
    res.redirect(`/edit/${id}/cards`);
  } catch (error) {
    next(error);
  }
};

export const deleteCardFromDeck = async (req, res, next) => {
  try {
    const { id, cardId } = req.params;
    await flashcardModel.deleteCard(cardId);
    res.redirect(`/edit/${id}`);
  } catch (error) {
    next(error);
  }
};

export const deleteDeck = async (req, res, next) => {
  try {
    const { id } = req.params;
    await flashcardModel.deleteSet(id);
    res.redirect('/decks');
  } catch (error) {
    next(error);
  }
};

export const updateDeck = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const errors = [];

    // Validate title
    if (!title || title.trim().length === 0) {
      errors.push('Title is required');
    } else if (title.trim().length < 3) {
      errors.push('Title must be at least 3 characters');
    } else if (title.length > 100) {
      errors.push('Title must be less than 100 characters');
    }

    // Validate description (optional)
    if (description && description.trim().length > 0) {
      if (description.trim().length < 3) {
        errors.push('Description must be at least 3 characters if provided');
      } else if (description.length > 500) {
        errors.push('Description must be less than 500 characters');
      }
    }

    if (errors.length > 0) {
      const { set, cards } = await flashcardModel.getSetWithCards(id);
      return res.status(400).render('edit-deck', {
        title: `Editing: ${set.title}`,
        set,
        cards,
        errorMessages: errors,
        currentPath: req.path
      });
    }

    await flashcardModel.updateSet(id, title, description);
    res.redirect(`/edit/${id}`);
  } catch (error) {
    next(error);
  }
};
