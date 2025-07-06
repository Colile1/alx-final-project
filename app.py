from flask import Flask, request, jsonify, session
import sqlite3
import os
from datetime import datetime, timedelta
import threading
import time
import random
import math
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
import requests
import csv
from io import StringIO

app = Flask(__name__)
app.secret_key = 'supersecretkey'  # Change this in production
CORS(app, supports_credentials=True)

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

        # Simulate for all users
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        c.execute('SELECT id FROM users')
        user_ids = [row[0] for row in c.fetchall()]
        timestamp = now.isoformat(sep=' ', timespec='seconds')
        for user_id in user_ids:
            c.execute('''
                INSERT INTO plant_readings (timestamp, moisture, temp, light, notes, plant_id, user_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (timestamp, round(sim_state['moisture'], 1), temp, light, '', None, user_id))
        conn.commit()
        conn.close()
        time.sleep(SIM_INTERVAL)

def start_simulation_thread():
    t = threading.Thread(target=simulate_data, daemon=True)
    t.start()

# --- User Table: add location ---
def init_db():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    # Users table (add location)
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            last_login TEXT,
            location TEXT
        )
    ''')
    # Plant readings table (add user_id, sensor_type)
    c.execute('''
        CREATE TABLE IF NOT EXISTS plant_readings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            moisture REAL NOT NULL,
            temp REAL NOT NULL,
            light REAL NOT NULL,
            notes TEXT,
            plant_id INTEGER,
            user_id INTEGER,
            sensor_type TEXT,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    ''')
    conn.commit()
    conn.close()

@app.before_request
def setup():
    if not hasattr(app, 'db_initialized'):
        init_db()
        app.db_initialized = True
        if not hasattr(app, 'sim_thread_started'):
            start_simulation_thread()
            app.sim_thread_started = True

# --- User Registration ---
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    location = data.get('location')  # New: accept location
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    try:
        c.execute('INSERT INTO users (username, password_hash, location) VALUES (?, ?, ?)',
                  (username, generate_password_hash(password), location))
        conn.commit()
        user_id = c.lastrowid
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'error': 'Username already exists'}), 409
    conn.close()
    session['user_id'] = user_id
    return jsonify({'message': 'Registration successful', 'user_id': user_id})

# --- User Login ---
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute('SELECT id, password_hash FROM users WHERE username = ?', (username,))
    row = c.fetchone()
    if not row or not check_password_hash(row[1], password):
        conn.close()
        return jsonify({'error': 'Invalid credentials'}), 401
    user_id = row[0]
    session['user_id'] = user_id
    c.execute('UPDATE users SET last_login = ? WHERE id = ?', (datetime.utcnow().isoformat(), user_id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Login successful', 'user_id': user_id})

# --- User Logout ---
@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logged out'})

# --- Auth Decorator ---
def require_login(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated

# --- Plant Data Endpoints (per user) ---
@app.route('/api/add_reading', methods=['POST'])
@require_login
def add_reading():
    data = request.get_json()
    required_fields = ['moisture', 'temp', 'light']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    timestamp = data.get('timestamp', datetime.utcnow().isoformat())
    notes = data.get('notes', '')
    plant_id = data.get('plant_id')
    sensor_type = data.get('sensor_type', 'manual')  # Default to 'manual' if not provided
    user_id = session['user_id']
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute('''
        INSERT INTO plant_readings (timestamp, moisture, temp, light, notes, plant_id, user_id, sensor_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (timestamp, data['moisture'], data['temp'], data['light'], notes, plant_id, user_id, sensor_type))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Reading added successfully'})

@app.route('/api/latest_reading', methods=['GET'])
@require_login
def get_latest_reading():
    user_id = session['user_id']
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute('SELECT * FROM plant_readings WHERE user_id = ? ORDER BY timestamp DESC, id DESC LIMIT 1', (user_id,))
    row = c.fetchone()
    conn.close()
    if row:
        result = {key: row[key] for key in row.keys()}
        return jsonify(result)
    else:
        return jsonify({'error': 'No readings found'}), 404

@app.route('/api/readings', methods=['GET'])
@require_login
def get_readings():
    user_id = session['user_id']
    start = request.args.get('start')
    end = request.args.get('end')
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    query = 'SELECT * FROM plant_readings WHERE user_id = ?'
    params = [user_id]
    if start and end:
        query += ' AND timestamp BETWEEN ? AND ?'
        params.extend([start, end])
    elif start:
        query += ' AND timestamp >= ?'
        params.append(start)
    elif end:
        query += ' AND timestamp <= ?'
        params.append(end)
    query += ' ORDER BY timestamp DESC, id DESC'
    c.execute(query, params)
    rows = c.fetchall()
    conn.close()
    result = [{key: row[key] for key in row.keys()} for row in rows]
    return jsonify(result)

@app.route('/api/predict_next_watering', methods=['GET'])
@require_login
def predict_next_watering():
    user_id = session['user_id']
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute('''
        SELECT timestamp, moisture FROM plant_readings WHERE user_id = ? ORDER BY timestamp DESC LIMIT 48
    ''', (user_id,))
    rows = c.fetchall()
    conn.close()
    if len(rows) < 2:
        return jsonify({'prediction': None, 'message': 'Not enough data for prediction.'})
    rows = rows[::-1]
    times = [datetime.strptime(r[0], '%Y-%m-%d %H:%M:%S') for r in rows]
    moistures = [r[1] for r in rows]
    drops = []
    for i in range(1, len(moistures)):
        delta = moistures[i] - moistures[i-1]
        dt = (times[i] - times[i-1]).total_seconds() / 3600
        if delta < 0 and dt > 0:
            drops.append(abs(delta) / dt)
    if not drops:
        return jsonify({'prediction': None, 'message': 'No decreasing trend detected.'})
    avg_drop_per_hour = sum(drops) / len(drops)
    current = moistures[-1]
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

# --- Update User Location ---
@app.route('/api/set_location', methods=['POST'])
@require_login
def set_location():
    data = request.get_json()
    location = data.get('location')
    if not location:
        return jsonify({'error': 'Location required'}), 400
    user_id = session['user_id']
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute('UPDATE users SET location = ? WHERE id = ?', (location, user_id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Location updated'})

# --- Weather API integration (OpenWeatherMap, free tier) ---
OPENWEATHER_API_KEY = os.environ.get('OPENWEATHER_API_KEY', 'demo')  # Set your real API key in env

@app.route('/api/weather', methods=['GET'])
@require_login
def get_weather():
    user_id = session['user_id']
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute('SELECT location FROM users WHERE id = ?', (user_id,))
    row = c.fetchone()
    conn.close()
    if not row or not row[0]:
        return jsonify({'error': 'No location set for user.'}), 400
    location = row[0]
    # Try to fetch weather by city name
    url = f'https://api.openweathermap.org/data/2.5/weather?q={location}&appid={OPENWEATHER_API_KEY}&units=metric'
    resp = requests.get(url)
    if resp.status_code != 200:
        return jsonify({'error': 'Failed to fetch weather', 'details': resp.json()}), 400
    data = resp.json()
    weather = {
        'location': location,
        'description': data['weather'][0]['description'],
        'temp': data['main']['temp'],
        'humidity': data['main']['humidity'],
        'wind_speed': data['wind']['speed'],
        'icon': data['weather'][0]['icon']
    }
    return jsonify(weather)

@app.route('/api/import_readings', methods=['POST'])
@require_login
def import_readings():
    user_id = session['user_id']
    if 'file' in request.files:
        # CSV upload
        file = request.files['file']
        stream = StringIO(file.stream.read().decode('utf-8'))
        reader = csv.DictReader(stream)
        rows = list(reader)
        imported = 0
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        for row in rows:
            try:
                c.execute('''
                    INSERT INTO plant_readings (timestamp, moisture, temp, light, notes, plant_id, user_id, sensor_type)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    row.get('timestamp', datetime.utcnow().isoformat()),
                    float(row['moisture']),
                    float(row['temp']),
                    float(row['light']),
                    row.get('notes', ''),
                    row.get('plant_id'),
                    user_id,
                    row.get('sensor_type', 'imported')
                ))
                imported += 1
            except Exception as e:
                continue
        conn.commit()
        conn.close()
        return jsonify({'message': f'Imported {imported} readings from CSV.'})
    elif 'db_path' in request.json:
        # Import from another SQLite database file
        db_path = request.json['db_path']
        if not os.path.exists(db_path):
            return jsonify({'error': 'Database file not found.'}), 400
        src_conn = sqlite3.connect(db_path)
        src_c = src_conn.cursor()
        src_c.execute('SELECT timestamp, moisture, temp, light, notes, plant_id, sensor_type FROM plant_readings')
        rows = src_c.fetchall()
        src_conn.close()
        imported = 0
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        for row in rows:
            c.execute('''
                INSERT INTO plant_readings (timestamp, moisture, temp, light, notes, plant_id, user_id, sensor_type)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (*row, user_id))
            imported += 1
        conn.commit()
        conn.close()
        return jsonify({'message': f'Imported {imported} readings from database.'})
    else:
        return jsonify({'error': 'No file or db_path provided.'}), 400
