const express = require('express');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static('public'));

// Ensure emails directory exists
const emailsDir = path.join(__dirname, 'data');
const emailsFile = path.join(emailsDir, 'emails.txt');

async function ensureDataDirectory() {
    try {
        await fs.access(emailsDir);
    } catch {
        await fs.mkdir(emailsDir, { recursive: true });
        console.log('Created data directory');
    }
}

// Email validation and storage
app.post('/api/subscribe', [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email address')
        .normalizeEmail()
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email address',
                errors: errors.array()
            });
        }

        const { email } = req.body;

        // Check if email already exists
        try {
            const existingEmails = await fs.readFile(emailsFile, 'utf8');
            if (existingEmails.includes(email)) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already subscribed'
                });
            }
        } catch (error) {
            // File doesn't exist yet, that's fine
            console.log('Creating new emails file');
        }

        // Append email to file with timestamp
        const timestamp = new Date().toISOString();
        const emailEntry = `${email} - ${timestamp}\n`;

        await fs.appendFile(emailsFile, emailEntry);

        console.log(`New email subscription: ${email}`);

        res.json({
            success: true,
            message: 'Thank you for subscribing! We\'ll keep you updated.'
        });

    } catch (error) {
        console.error('Error saving email:', error);
        res.status(500).json({
            success: false,
            message: 'Sorry, something went wrong. Please try again.'
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve the landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize and start server
async function startServer() {
    try {
        await ensureDataDirectory();
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Landing page server running on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/health`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();