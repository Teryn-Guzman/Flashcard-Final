CREATE TABLE flashcard_sets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE flashcards (
    id SERIAL PRIMARY KEY,
    term TEXT NOT NULL,
    definition TEXT NOT NULL,
    set_id INTEGER REFERENCES flashcard_sets(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);