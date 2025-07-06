import unittest
import tempfile
import os
import json
from app import app, init_db, DB_NAME
from io import StringIO

class PlantCareDashboardTestCase(unittest.TestCase):
    def setUp(self):
        # Use a temporary database for testing
        self.db_fd, self.temp_db = tempfile.mkstemp()
        app.config['TESTING'] = True
        app.config['SECRET_KEY'] = 'testkey'
        global DB_NAME
        DB_NAME = self.temp_db
        init_db()
        self.client = app.test_client()

    def tearDown(self):
        os.close(self.db_fd)
        os.unlink(self.temp_db)

    def register(self, username, password, location=None):
        data = {'username': username, 'password': password}
        if location:
            data['location'] = location
        return self.client.post('/api/register', json=data)

    def login(self, username, password):
        return self.client.post('/api/login', json={'username': username, 'password': password})

    def test_register_and_login(self):
        rv = self.register('user1', 'pass1', 'London')
        self.assertEqual(rv.status_code, 200)
        rv = self.login('user1', 'pass1')
        self.assertEqual(rv.status_code, 200)
        data = rv.get_json()
        self.assertIn('user_id', data)

    def test_duplicate_registration(self):
        self.register('user2', 'pass2')
        rv = self.register('user2', 'pass2')
        self.assertEqual(rv.status_code, 409)

    def test_add_and_get_reading(self):
        self.register('user3', 'pass3', 'Paris')
        self.login('user3', 'pass3')
        rv = self.client.post('/api/add_reading', json={
            'moisture': 55, 'temp': 22, 'light': 800, 'notes': 'Test', 'plant_id': 1
        })
        self.assertEqual(rv.status_code, 200)
        rv = self.client.get('/api/latest_reading')
        self.assertEqual(rv.status_code, 200)
        data = rv.get_json()
        self.assertEqual(data['moisture'], 55)
        self.assertEqual(data['temp'], 22)
        self.assertEqual(data['light'], 800)

    def test_set_location_and_weather(self):
        self.register('user4', 'pass4', 'Berlin')
        self.login('user4', 'pass4')
        rv = self.client.post('/api/set_location', json={'location': 'Berlin'})
        self.assertEqual(rv.status_code, 200)
        # Weather API will likely fail with 'demo' key, but endpoint should respond
        rv = self.client.get('/api/weather')
        self.assertIn(rv.status_code, (200, 400))
        data = rv.get_json()
        self.assertTrue('location' in data or 'error' in data)

    def test_auth_required(self):
        rv = self.client.get('/api/latest_reading')
        self.assertEqual(rv.status_code, 401)
        rv = self.client.post('/api/add_reading', json={'moisture': 50, 'temp': 20, 'light': 700})
        self.assertEqual(rv.status_code, 401)

    def test_import_csv(self):
        self.register('importuser', 'importpass', 'Rome')
        self.login('importuser', 'importpass')
        csv_data = 'timestamp,moisture,temp,light,notes,plant_id,sensor_type\n2025-07-06 10:00:00,60,23,900,Imported,1,dht22\n2025-07-06 11:00:00,58,24,850,Imported,1,dht22\n'
        data = {
            'file': (StringIO(csv_data), 'readings.csv')
        }
        # Flask test client needs content_type for file upload
        rv = self.client.post('/api/import_readings', data=data, content_type='multipart/form-data')
        self.assertEqual(rv.status_code, 200)
        rv = self.client.get('/api/readings')
        self.assertEqual(rv.status_code, 200)
        readings = rv.get_json()
        self.assertEqual(len(readings), 2)
        self.assertEqual(readings[0]['sensor_type'], 'dht22')

if __name__ == '__main__':
    unittest.main()
