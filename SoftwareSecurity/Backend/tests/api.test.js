const request = require('supertest');
const app = require('../src/app');

describe('API Endpoints', () => {
    it('should return a list of items', async () => {
        const response = await request(app).get('/api/items');
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('items');
    });

    it('should create a new item', async () => {
        const newItem = { name: 'Test Item' };
        const response = await request(app).post('/api/items').send(newItem);
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('item');
        expect(response.body.item.name).toBe(newItem.name);
    });

    it('should return a single item', async () => {
        const response = await request(app).get('/api/items/1');
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('item');
    });

    it('should update an item', async () => {
        const updatedItem = { name: 'Updated Item' };
        const response = await request(app).put('/api/items/1').send(updatedItem);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('item');
        expect(response.body.item.name).toBe(updatedItem.name);
    });

    it('should delete an item', async () => {
        const response = await request(app).delete('/api/items/1');
        expect(response.statusCode).toBe(204);
    });
});