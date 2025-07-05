from flask import Flask, request, jsonify
import sqlite3
import os
from datetime import datetime
import threading
import time
import random

app = Flask(__name__)

DB_NAME = 'plant_data.db'

# --- Simulation settings ---
SIM_INTERVAL = 60  # seconds

# Reasonable ranges for simulation
MOISTURE_RANGE = (30, 90)
TEMP_RANGE = (18, 32)
LIGHT_RANGE = (300, 1200)

# --- Automated Data Simulation Thread ---
def simulate_data():
    while True:
        # Generate simulated values
        moisture = round(random.uniform(*MOISTURE_RANGE), 1)
        temp = round(random.uniform(*TEMP_RANGE), 1)
        light = round(random.uniform(*LIGHT_RANGE), 0)
        timestamp = datetime.utcnow().isoformat(sep=' ', timespec='seconds')
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        c.execute('''
            INSERT INTO plant_readings (timestamp, moisture, temp, light, notes, plant_id)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (timestamp, moisture, temp, light, '', None))
        conn.commit()
        conn.close()
        time.sleep(SIM_INTERVAL)

def start_simulation_thread():
    t = threading.Thread(target=simulate_data, daemon=True)
    t.start()

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
        # Start simulation thread only once
        if not hasattr(app, 'sim_thread_started'):
            start_simulation_thread()
            app.sim_thread_started = True

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

@app.route('/api/latest_reading', methods=['GET'])
def get_latest_reading():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute('SELECT * FROM plant_readings ORDER BY timestamp DESC, id DESC LIMIT 1')
    row = c.fetchone()
    conn.close()
    if row:
        result = {key: row[key] for key in row.keys()}
        return jsonify(result)
    else:
        return jsonify({'error': 'No readings found'}), 404

@app.route('/api/readings', methods=['GET'])
def get_readings():
    start = request.args.get('start')
    end = request.args.get('end')
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    query = 'SELECT * FROM plant_readings'
    params = []
    if start and end:
        query += ' WHERE timestamp BETWEEN ? AND ?'
        params.extend([start, end])
    elif start:
        query += ' WHERE timestamp >= ?'
        params.append(start)
    elif end:
        query += ' WHERE timestamp <= ?'
        params.append(end)
    query += ' ORDER BY timestamp DESC, id DESC'
    c.execute(query, params)
    rows = c.fetchall()
    conn.close()
    result = [{key: row[key] for key in row.keys()} for row in rows]
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
