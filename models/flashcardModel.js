import { query } from '../config/db.js';

export const getAllSets = async () => {
  const result = await query(`
    SELECT fs.*, 
    (SELECT COUNT(*) FROM flashcards WHERE set_id = fs.id) as card_count,
    (SELECT id FROM flashcards WHERE set_id = fs.id ORDER BY id LIMIT 1) as first_card_id
    FROM flashcard_sets fs
    ORDER BY created_at DESC
  `);
  return result.rows;
};

export const createSet = async (title, description) => {
  const result = await query(
    'INSERT INTO flashcard_sets (title, description) VALUES ($1, $2) RETURNING *',
    [title, description || null]
  );
  return result.rows[0];
};

export const createCards = async (setId, terms, definitions) => {
  const values = terms.map((_, i) => `($${i*3+1}, $${i*3+2}, $${i*3+3})`).join(',');
  const params = terms.flatMap((term, i) => [term, definitions[i], setId]);
  await query(
    `INSERT INTO flashcards (term, definition, set_id) VALUES ${values}`,
    params
  );
};

export const getSetWithCards = async (setId) => {
  const set = await query('SELECT * FROM flashcard_sets WHERE id = $1', [setId]);
  const cards = await query('SELECT * FROM flashcards WHERE set_id = $1 ORDER BY id', [setId]);
  return {
    set: set.rows[0],
    cards: cards.rows
  };
};

export const getCardCount = async (setId) => {
  const result = await query('SELECT COUNT(*) FROM flashcards WHERE set_id = $1', [setId]);
  return parseInt(result.rows[0].count);
};

export const getCard = async (cardId) => {
  const result = await query('SELECT * FROM flashcards WHERE id = $1', [cardId]);
  return result.rows[0];
};

export const updateCard = async (cardId, term, definition) => {
  await query(
    'UPDATE flashcards SET term = $1, definition = $2 WHERE id = $3',
    [term, definition, cardId]
  );
};

export const deleteCard = async (cardId) => {
  await query('DELETE FROM flashcards WHERE id = $1', [cardId]);
};


export const deleteSet = async (setId) => {
  await query('DELETE FROM flashcard_sets WHERE id = $1', [setId]);
};

export const updateSet = async (setId, title, description) => {
  await query(
    'UPDATE flashcard_sets SET title = $1, description = $2 WHERE id = $3',
    [title, description || null, setId]
  );
};
