const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');
const config = require('../config');


router.post('/signin', async (req, res) => {
    const { id, password } = req.body;
    console.log('SignIn Request:', req.body); 

    if (!id || !password) {
        return res.status(400).send('ID and password are required');
    }

    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    const user = users[0];

    if (user && bcrypt.compareSync(password, user.password)) {
        const token = jwt.sign({ id: user.id }, config.jwtSecret, { expiresIn: config.tokenExpiration });
        const refreshToken = jwt.sign({ id: user.id }, config.jwtRefreshSecret, { expiresIn: config.refreshTokenExpiration });
        return res.json({ token, refreshToken });
    }
    res.status(401).send('Invalid credentials');
});


router.post('/signup', async (req, res) => {
    const { id, password } = req.body;
    console.log('SignUp Request:', req.body); 

    if (!id || !password) {
        return res.status(400).send('ID and password are required');
    }

    const hashedPassword = bcrypt.hashSync(password, 8);
    await db.query('INSERT INTO users (id, password) VALUES (?, ?)', [id, hashedPassword]);
    res.status(201).send('User registered');
});

// Refresh Token
router.post('/signin/new_token', (req, res) => {
    const { refreshToken } = req.body;
    console.log('Refresh Token Request:', req.body); 

    if (!refreshToken) {
        return res.status(400).send('Refresh token is required');
    }

    try {
        const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret);
        const token = jwt.sign({ id: decoded.id }, config.jwtSecret, { expiresIn: config.tokenExpiration });
        res.json({ token });
    } catch {
        res.status(401).send('Invalid refresh token');
    }
});

module.exports = router;
