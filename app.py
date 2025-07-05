from flask import Flask, request, jsonify
import sqlite3
import os
from datetime import datetime, timedelta
import threading
import time
import random
import math

app = Flask(__name__)

DB_NAME = 'plant_data.db'

# --- Simulation settings ---
SIM_INTERVAL = 60  # seconds

# Reasonable ranges for simulation
MOISTURE_RANGE = (30, 90)
TEMP_RANGE = (18, 32)
LIGHT_RANGE = (300, 1200)

# --- Simulation state ---
sim_state = {
    'moisture': random.uniform(60, 80),  # start in healthy range
    'last_watered': datetime.utcnow(),
    'temp_base': random.uniform(20, 26),
    'light_base': random.uniform(700, 1000),
    'tick': 0
}

# --- Automated Data Simulation Thread ---
def simulate_data():
    while True:
        sim_state['tick'] += 1
        now = datetime.utcnow()
        # Simulate moisture decrease
        moisture = sim_state['moisture'] - random.uniform(0.2, 0.7)
        # Random watering event (10% chance per tick)
        if random.random() < 0.1 or moisture < 35:
            moisture = random.uniform(70, 90)
            sim_state['last_watered'] = now
        sim_state['moisture'] = max(25, min(95, moisture))

        # Simulate temperature: daily sinusoidal pattern
        seconds_in_day = 24 * 60 * 60
        t = (now.hour * 3600 + now.minute * 60 + now.second)
        temp = sim_state['temp_base'] + 6 * math.sin(2 * math.pi * t / seconds_in_day)
        temp += random.uniform(-0.5, 0.5)  # add some noise
        temp = round(temp, 1)

        # Simulate light: sinusoidal, 0 at night, peak at midday
        # Assume "day" is 6:00 to 18:00
        hour = now.hour + now.minute / 60
        if 6 <= hour <= 18:
            # Map 6-18 to 0-pi
            phase = math.pi * (hour - 6) / 12
            light = sim_state['light_base'] * math.sin(phase)
            light += random.uniform(-30, 30)
            light = max(0, light)
        else:
            light = random.uniform(0, 20)  # night
        light = round(light, 0)

        timestamp = now.isoformat(sep=' ', timespec='seconds')
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        c.execute('''
            INSERT INTO plant_readings (timestamp, moisture, temp, light, notes, plant_id)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (timestamp, round(sim_state['moisture'], 1), temp, light, '', None))
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

@app.route('/api/predict_next_watering', methods=['GET'])
def predict_next_watering():
    # Fetch last N readings (e.g., 24 hours)
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute('''
        SELECT timestamp, moisture FROM plant_readings ORDER BY timestamp DESC LIMIT 48
    ''')
    rows = c.fetchall()
    conn.close()
    if len(rows) < 2:
        return jsonify({'prediction': None, 'message': 'Not enough data for prediction.'})
    # Sort by timestamp ascending
    rows = rows[::-1]
    times = [datetime.strptime(r[0], '%Y-%m-%d %H:%M:%S') for r in rows]
    moistures = [r[1] for r in rows]
    # Estimate average rate of decrease (ignoring increases)
    drops = []
    for i in range(1, len(moistures)):
        delta = moistures[i] - moistures[i-1]
        dt = (times[i] - times[i-1]).total_seconds() / 3600  # hours
        if delta < 0 and dt > 0:
            drops.append(abs(delta) / dt)
    if not drops:
        return jsonify({'prediction': None, 'message': 'No decreasing trend detected.'})
    avg_drop_per_hour = sum(drops) / len(drops)
    current = moistures[-1]
    # Predict when moisture will hit threshold (e.g., 40%)
    threshold = 40
    if avg_drop_per_hour == 0 or current <= threshold:
        return jsonify({'prediction': None, 'message': 'Cannot predict (no decrease or already below threshold).'})
    hours_to_threshold = (current - threshold) / avg_drop_per_hour
    next_watering_time = times[-1] + timedelta(hours=hours_to_threshold)
    return jsonify({
        'prediction': next_watering_time.strftime('%Y-%m-%d %H:%M:%S'),
        'hours_to_threshold': round(hours_to_threshold, 1),
        'current_moisture': current,
        'avg_drop_per_hour': round(avg_drop_per_hour, 2),
        'message': f'Estimated next watering: {next_watering_time.strftime("%Y-%m-%d %H:%M:%S")}'
    })

if __name__ == '__main__':
    app.run(debug=True)
