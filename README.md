### Flashcard Web App
The Flashcard Web App is a full-stack study tool that allows users to create and manage flashcard decks for efficient learning. Users can add, edit, and delete both decks and flashcards, and use an interactive Study Mode to review their cards with flip and navigation features.

### Features
- Create, update, and delete decks
- Add and edit flashcards within each deck
- Study mode with flashcard flipping and navigation
- Built using Node.js, Express, PostgreSQL, and EJS

### Project Setup (Installation)

1. Clone the repository:
```bash
git clone <repository-url>
cd Flashcard-Final-main
```
2. Install dependencies:
```bash
npm install
```
3. Create PostgreSQL database:
   - Create a database (e.g., flashcard_db)
   - Create two tables:
```bash
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
```
4. Configure environment variables:
- Create a .env file in the root directory.
- Add your database connection string and other necessary environment variables.

5. Start Server
- npm start
