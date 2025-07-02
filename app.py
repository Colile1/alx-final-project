from flask import Flask, request, jsonify
import sqlite3
import os
from datetime import datetime

app = Flask(__name__)

DB_NAME = 'plant_data.db'

def init_db():
    if not os.path.exists(DB_NAME):
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        c.execute('''
            CREATE TABLE plant_readings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                moisture REAL NOT NULL,
                temp REAL NOT NULL,
                light REAL NOT NULL,
                notes TEXT,
                plant_id INTEGER
            )
        ''')
        conn.commit()
        conn.close()

@app.before_request
def setup():
    if not hasattr(app, 'db_initialized'):
        init_db()
        app.db_initialized = True

@app.route('/')
def hello():
    return 'Hello, World!'

@app.route('/api/add_reading', methods=['POST'])
def add_reading():
    data = request.get_json()
    required_fields = ['moisture', 'temp', 'light']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    timestamp = data.get('timestamp', datetime.utcnow().isoformat())
    notes = data.get('notes', '')
    plant_id = data.get('plant_id')
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute('''
        INSERT INTO plant_readings (timestamp, moisture, temp, light, notes, plant_id)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (timestamp, data['moisture'], data['temp'], data['light'], notes, plant_id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Reading added successfully'}), 201

if __name__ == '__main__':
    app.run(debug=True)
