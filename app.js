const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/file');
const config = require('./config');
const authMiddleware = require('./middleware/authMiddleware');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.use('/auth', authRoutes);
app.use('/file', authMiddleware, fileRoutes);
app.use('/info', authMiddleware, (req, res) => {
    res.json({ id: req.user.id });
});
app.use('/logout', authMiddleware, async (req, res) => {
    res.send('Logged out');
});


app.use(errorHandler);

const PORT = config.port || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
