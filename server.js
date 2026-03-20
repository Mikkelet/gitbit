const express = require('express');
const path = require('path');
const fs = require('fs');
const config = require('./src/config');

const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Body parsing for API/form
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Ensure repo root exists
fs.mkdirSync(config.repoRoot, { recursive: true });

// Git smart HTTP (must come before UI routes)
app.use(require('./src/routes/git'));

// API
app.use('/api', require('./src/routes/api'));

// Web UI
app.use(require('./src/routes/ui'));

app.listen(config.port, '0.0.0.0', () => {
  console.log(`gitbit running at http://localhost:${config.port}`);
  console.log(`Repositories stored in ${config.repoRoot}`);
});
