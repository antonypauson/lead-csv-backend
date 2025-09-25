const request = require('supertest');
const express = require('express');
const uploadCsvMiddleware = require('../../../src/middleware/uploadMiddleware');

const app = express();
app.post('/test-upload', uploadCsvMiddleware, (req, res) => {
    res.json({ message: 'File uploaded', file: req.file });
});

describe('CSV Upload Middleware', () => {
    it('should upload a valid CSV', async () => {
        const res = await request(app)
            .post('/test-upload')
            .attach('csvFile', 'tests/files/sample.csv'); // path to a sample CSV
        expect(res.statusCode).toBe(200);
        expect(res.body.file).toBeDefined();
        expect(res.body.file.originalname).toBe('sample.csv');
    });

    it('should reject non-CSV file', async () => {
        const res = await request(app)
            .post('/test-upload')
            .attach('csvFile', 'tests/files/sample.txt'); 
        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/Only CSV files are allowed!/);
    });

    it('should reject large files', async () => {
        const res = await request(app)
            .post('/test-upload')
            .attach('csvFile', 'tests/files/large.csv'); 
        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/File too large. Maximum 5MB allowed./);
    });
});
