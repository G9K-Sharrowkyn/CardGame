const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

router.post('/register', async (req, res) => {
  const { username, password, email } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword, email, collection: [] });
  await user.save();
  res.status(201).send('User registered');
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !await bcrypt.compare(password, user.password)) return res.status(401).send('Invalid credentials');
  const token = jwt.sign({ userId: user._id }, 'secret_key');
  res.json({ token, userId: user._id });
});

module.exports = router;