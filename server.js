const express = require('express');
const cors = require('cors'); // Import the 'cors' package
const path = require('path');
const app = express();

// Use the 'cors' middleware to enable CORS
app.use(cors());

// Define the path to the JSON file
const dataPath = path.join(__dirname, 'data.json');

// app.use(express.static(path.join(__dirname, 'public')));

// // Always serve index.html for any other route to handle client-side routing
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// Serve the JSON file as a response
app.get('/api/data', (req, res) => {
  res.sendFile(dataPath);
});

// Start the server
const port = 3001;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
