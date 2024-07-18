const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../db');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

router.post('/upload', upload.single('file'), async (req, res) => {
    const file = req.file;
    console.log('Upload file:', file);

    if (!file) {
        return res.status(400).send('No file uploaded');
    }

    await db.query('INSERT INTO files (name, extension, mime_type, size, upload_date) VALUES (?, ?, ?, ?, ?)', [
        file.originalname,
        path.extname(file.originalname),
        file.mimetype,
        file.size,
        new Date()
    ]);
    res.status(201).send('File uploaded');
});

router.get('/list', async (req, res) => {
    const { list_size = 10, page = 1 } = req.query;
    const [files] = await db.query('SELECT * FROM files LIMIT ? OFFSET ?', [parseInt(list_size), (parseInt(page) - 1) * parseInt(list_size)]);
    res.json(files);
});

router.get('/:id', async (req, res) => {
    const [files] = await db.query('SELECT * FROM files WHERE id = ?', [req.params.id]);
    if (files.length === 0) {
        return res.status(404).send('File not found');
    }
    res.json(files[0]);
});

router.get('/download/:id', async (req, res) => {
    const [files] = await db.query('SELECT * FROM files WHERE id = ?', [req.params.id]);
    if (files.length === 0) {
        return res.status(404).send('File not found');
    }

    const file = files[0];
    const filePath = path.join(__dirname, '../uploads', file.name);

    if (!fs.existsSync(filePath)) {
        return res.status(404).send('File not found on server');
    }

    res.download(filePath);
});

router.delete('/delete/:id', async (req, res) => {
    const [files] = await db.query('SELECT * FROM files WHERE id = ?', [req.params.id]);
    if (files.length === 0) {
        return res.status(404).send('File not found in database');
    }

    const file = files[0];
    const filePath = path.join(__dirname, '../uploads', file.name);
    console.log(`Attempting to delete file: ${filePath}`);

    if (!fs.existsSync(filePath)) {
        console.log(`File not found on server: ${filePath}`);
        return res.status(404).send('File not found on server');
    }

    try {
        fs.unlinkSync(filePath);
        await db.query('DELETE FROM files WHERE id = ?', [req.params.id]);
        res.status(200).send('File deleted');
    } catch (err) {
        console.error('Error deleting file:', err);
        res.status(500).send('Server error');
    }
});

router.put('/update/:id', upload.single('file'), async (req, res) => {
    const [files] = await db.query('SELECT * FROM files WHERE id = ?', [req.params.id]);
    if (files.length === 0) {
        return res.status(404).send('File not found');
    }

    const file = req.file;
    if (!file) {
        return res.status(400).send('No file uploaded');
    }

    await db.query('UPDATE files SET name = ?, extension = ?, mime_type = ?, size = ?, upload_date = ? WHERE id = ?', [
        file.originalname,
        path.extname(file.originalname),
        file.mimetype,
        file.size,
        new Date(),
        req.params.id
    ]);
    res.status(200).send('File updated');
});

module.exports = router;
