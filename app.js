import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import flashcardRoutes from './routes/flashcardRoutes.js';
import dotenv from 'dotenv';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', flashcardRoutes);

// Error handling
app.use((req, res) => {
  res.status(404).render('404', { 
    title: 'Not Found',
    message: 'Page not found'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    title: 'Server Error',
    message: 'Something went wrong'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});