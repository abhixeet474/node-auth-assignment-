const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());

const users = [];
const secretKey = 'supersecretkey123'; // JWT ke liye secret key

// Register route
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: 'User already exists' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });
  res.json({ message: 'User registered successfully' });
});

// Login route (yahin pe JWT ka token response me bheja jaata hai)
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (isMatch) {
    const token = jwt.sign({ username: user.username }, secretKey, { expiresIn: '1h' }); // Token generate
    return res.json({ message: 'Login successful', token }); // Token response me send
  } else {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Protected route - token verify karne par hi access milega
app.get('/profile', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    res.json({ message: 'Profile accessed', user });
  });
});

app.listen(3000, () => console.log('Server running on port 3000'));