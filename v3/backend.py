# app.py - Main Flask Application
from flask import Flask, render_template, send_from_directory, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_cors import CORS
from datetime import datetime
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__, static_folder='static', static_url_path='')

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your_super_secret_development_key_change_in_production')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///plant_care.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['WTF_CSRF_ENABLED'] = False  # Disable CSRF for API

# Initialize extensions
db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'auth.login'
CORS(app, supports_credentials=True, origins=['http://localhost:3000', 'http://127.0.0.1:3000'])

# Logging configuration
logging.basicConfig(level=logging.INFO)

# Database Models
from flask_login import UserMixin

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, default=datetime.utcnow)
    last_active_garden_id = db.Column(db.Integer, db.ForeignKey('gardens.id'), nullable=True)
    
    # Preferences
    simulation_frequency = db.Column(db.Integer, default=60)  # seconds
    moisture_threshold = db.Column(db.Integer, default=30)  # percentage
    temperature_min = db.Column(db.Float, default=15.0)  # celsius
    temperature_max = db.Column(db.Float, default=30.0)  # celsius
    light_min = db.Column(db.Integer, default=200)  # lux
    
    # Relationships
    gardens = db.relationship('Garden', backref='owner', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<User {self.username}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'last_active_garden_id': self.last_active_garden_id,
            'preferences': {
                'simulation_frequency': self.simulation_frequency,
                'moisture_threshold': self.moisture_threshold,
                'temperature_min': self.temperature_min,
                'temperature_max': self.temperature_max,
                'light_min': self.light_min
            }
        }

class Garden(db.Model):
    __tablename__ = 'gardens'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(200), nullable=True)
    location_lat = db.Column(db.Float, nullable=True)
    location_lon = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_accessed = db.Column(db.DateTime, default=datetime.utcnow)
    sensor_type = db.Column(db.String(50), default='simulated_basic')
    
    # Garden-specific settings
    plant_type = db.Column(db.String(100), default='General')
    watering_frequency = db.Column(db.Integer, default=3)  # days
    
    # Relationships
    readings = db.relationship('PlantReading', backref='garden_obj', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Garden {self.name}>'
    
    def to_dict(self):
        latest_reading = PlantReading.query.filter_by(garden_id=self.id).order_by(PlantReading.timestamp.desc()).first()
        return {
            'id': self.id,
            'name': self.name,
            'location': self.location,
            'location_lat': self.location_lat,
            'location_lon': self.location_lon,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_accessed': self.last_accessed.isoformat() if self.last_accessed else None,
            'sensor_type': self.sensor_type,
            'plant_type': self.plant_type,
            'watering_frequency': self.watering_frequency,
            'latest_reading': latest_reading.to_dict() if latest_reading else None,
            'readings_count': len(self.readings)
        }

class PlantReading(db.Model):
    __tablename__ = 'plant_readings'
    
    id = db.Column(db.Integer, primary_key=True)
    garden_id = db.Column(db.Integer, db.ForeignKey('gardens.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    moisture_level = db.Column(db.Float, nullable=False)  # percentage
    temperature = db.Column(db.Float, nullable=False)  # celsius
    light_intensity = db.Column(db.Float, nullable=False)  # lux
    humidity = db.Column(db.Float, nullable=True)  # percentage
    ph_level = db.Column(db.Float, nullable=True)  # pH
    notes = db.Column(db.Text, nullable=True)
    is_manual = db.Column(db.Boolean, default=False)
    
    def __repr__(self):
        return f'<Reading {self.timestamp} for Garden {self.garden_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'garden_id': self.garden_id,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'moisture_level': self.moisture_level,
            'temperature': self.temperature,
            'light_intensity': self.light_intensity,
            'humidity': self.humidity,
            'ph_level': self.ph_level,
            'notes': self.notes,
            'is_manual': self.is_manual
        }

# User loader for Flask-Login
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Authentication Routes
from flask import Blueprint, request
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_user, logout_user, login_required, current_user

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validation
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'error': 'Username and password are required'}), 400
        
        username = data['username'].strip()
        password = data['password']
        
        if len(username) < 3:
            return jsonify({'error': 'Username must be at least 3 characters long'}), 400
        
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters long'}), 400
        
        # Check if user already exists
        if User.query.filter_by(username=username).first():
            return jsonify({'error': 'Username already exists'}), 409
        
        # Create new user
        hashed_password = generate_password_hash(password)
        new_user = User(
            username=username,
            password=hashed_password,
            created_at=datetime.utcnow()
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            'message': 'User registered successfully',
            'user': new_user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Registration error: {str(e)}")
        return jsonify({'error': 'Registration failed'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'error': 'Username and password are required'}), 400
        
        username = data['username'].strip()
        password = data['password']
        
        user = User.query.filter_by(username=username).first()
        
        if user and check_password_hash(user.password, password):
            login_user(user, remember=True)
            user.last_login = datetime.utcnow()
            db.session.commit()
            
            return jsonify({
                'message': 'Logged in successfully',
                'user': user.to_dict()
            }), 200
        else:
            return jsonify({'error': 'Invalid username or password'}), 401
            
    except Exception as e:
        app.logger.error(f"Login error: {str(e)}")
        return jsonify({'error': 'Login failed'}), 500

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'}), 200

@auth_bp.route('/status', methods=['GET'])
def status():
    if current_user.is_authenticated:
        return jsonify({
            'is_authenticated': True,
            'user': current_user.to_dict()
        }), 200
    else:
        return jsonify({'is_authenticated': False}), 200

@auth_bp.route('/profile', methods=['GET', 'PUT'])
@login_required
def profile():
    if request.method == 'GET':
        return jsonify({'user': current_user.to_dict()}), 200
    
    elif request.method == 'PUT':
        try:
            data = request.get_json()
            
            # Update preferences
            if 'preferences' in data:
                prefs = data['preferences']
                if 'simulation_frequency' in prefs:
                    current_user.simulation_frequency = prefs['simulation_frequency']
                if 'moisture_threshold' in prefs:
                    current_user.moisture_threshold = prefs['moisture_threshold']
                if 'temperature_min' in prefs:
                    current_user.temperature_min = prefs['temperature_min']
                if 'temperature_max' in prefs:
                    current_user.temperature_max = prefs['temperature_max']
                if 'light_min' in prefs:
                    current_user.light_min = prefs['light_min']
            
            # Update last active garden
            if 'last_active_garden_id' in data:
                current_user.last_active_garden_id = data['last_active_garden_id']
            
            db.session.commit()
            return jsonify({'message': 'Profile updated successfully', 'user': current_user.to_dict()}), 200
            
        except Exception as e:
            db.session.rollback()
            app.logger.error(f"Profile update error: {str(e)}")
            return jsonify({'error': 'Failed to update profile'}), 500

# Garden Management Routes
gardens_bp = Blueprint('gardens', __name__)

@gardens_bp.route('/gardens', methods=['GET'])
@login_required
def get_gardens():
    try:
        gardens = Garden.query.filter_by(user_id=current_user.id).all()
        return jsonify({
            'gardens': [garden.to_dict() for garden in gardens]
        }), 200
    except Exception as e:
        app.logger.error(f"Get gardens error: {str(e)}")
        return jsonify({'error': 'Failed to fetch gardens'}), 500

@gardens_bp.route('/gardens', methods=['POST'])
@login_required
def add_garden():
    try:
        data = request.get_json()
        
        if not data or not data.get('name'):
            return jsonify({'error': 'Garden name is required'}), 400
        
        new_garden = Garden(
            user_id=current_user.id,
            name=data['name'].strip(),
            location=data.get('location', '').strip(),
            location_lat=data.get('location_lat'),
            location_lon=data.get('location_lon'),
            sensor_type=data.get('sensor_type', 'simulated_basic'),
            plant_type=data.get('plant_type', 'General'),
            watering_frequency=data.get('watering_frequency', 3),
            created_at=datetime.utcnow(),
            last_accessed=datetime.utcnow()
        )
        
        db.session.add(new_garden)
        db.session.commit()
        
        return jsonify({
            'message': 'Garden added successfully',
            'garden': new_garden.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Add garden error: {str(e)}")
        return jsonify({'error': 'Failed to add garden'}), 500

@gardens_bp.route('/gardens/<int:garden_id>', methods=['GET'])
@login_required
def get_garden(garden_id):
    try:
        garden = Garden.query.filter_by(id=garden_id, user_id=current_user.id).first()
        
        if not garden:
            return jsonify({'error': 'Garden not found'}), 404
        
        # Update last accessed
        garden.last_accessed = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'garden': garden.to_dict()}), 200
        
    except Exception as e:
        app.logger.error(f"Get garden error: {str(e)}")
        return jsonify({'error': 'Failed to fetch garden'}), 500

@gardens_bp.route('/gardens/<int:garden_id>', methods=['PUT'])
@login_required
def update_garden(garden_id):
    try:
        garden = Garden.query.filter_by(id=garden_id, user_id=current_user.id).first()
        
        if not garden:
            return jsonify({'error': 'Garden not found'}), 404
        
        data = request.get_json()
        
        if 'name' in data:
            garden.name = data['name'].strip()
        if 'location' in data:
            garden.location = data['location'].strip()
        if 'location_lat' in data:
            garden.location_lat = data['location_lat']
        if 'location_lon' in data:
            garden.location_lon = data['location_lon']
        if 'sensor_type' in data:
            garden.sensor_type = data['sensor_type']
        if 'plant_type' in data:
            garden.plant_type = data['plant_type']
        if 'watering_frequency' in data:
            garden.watering_frequency = data['watering_frequency']
        
        garden.last_accessed = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Garden updated successfully',
            'garden': garden.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Update garden error: {str(e)}")
        return jsonify({'error': 'Failed to update garden'}), 500

@gardens_bp.route('/gardens/<int:garden_id>', methods=['DELETE'])
@login_required
def delete_garden(garden_id):
    try:
        garden = Garden.query.filter_by(id=garden_id, user_id=current_user.id).first()
        
        if not garden:
            return jsonify({'error': 'Garden not found'}), 404
        
        db.session.delete(garden)
        db.session.commit()
        
        return jsonify({'message': 'Garden deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Delete garden error: {str(e)}")
        return jsonify({'error': 'Failed to delete garden'}), 500

@gardens_bp.route('/gardens/<int:garden_id>/readings', methods=['GET'])
@login_required
def get_garden_readings(garden_id):
    try:
        garden = Garden.query.filter_by(id=garden_id, user_id=current_user.id).first()
        
        if not garden:
            return jsonify({'error': 'Garden not found'}), 404
        
        # Pagination
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 100, type=int)
        
        readings = PlantReading.query.filter_by(garden_id=garden_id)\
                                   .order_by(PlantReading.timestamp.desc())\
                                   .paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'readings': [reading.to_dict() for reading in readings.items],
            'total': readings.total,
            'pages': readings.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        app.logger.error(f"Get readings error: {str(e)}")
        return jsonify({'error': 'Failed to fetch readings'}), 500

@gardens_bp.route('/gardens/<int:garden_id>/readings', methods=['POST'])
@login_required
def add_reading(garden_id):
    try:
        garden = Garden.query.filter_by(id=garden_id, user_id=current_user.id).first()
        
        if not garden:
            return jsonify({'error': 'Garden not found'}), 404
        
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Reading data is required'}), 400
        
        # Validate required fields
        required_fields = ['moisture_level', 'temperature', 'light_intensity']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        new_reading = PlantReading(
            garden_id=garden_id,
            moisture_level=float(data['moisture_level']),
            temperature=float(data['temperature']),
            light_intensity=float(data['light_intensity']),
            humidity=float(data.get('humidity', 0)) if data.get('humidity') else None,
            ph_level=float(data.get('ph_level', 0)) if data.get('ph_level') else None,
            notes=data.get('notes', '').strip(),
            is_manual=data.get('is_manual', True),
            timestamp=datetime.utcnow()
        )
        
        db.session.add(new_reading)
        garden.last_accessed = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Reading added successfully',
            'reading': new_reading.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Add reading error: {str(e)}")
        return jsonify({'error': 'Failed to add reading'}), 500

# Data Management Routes
import csv
import io
import pandas as pd
from datetime import timedelta

data_bp = Blueprint('data', __name__)

@data_bp.route('/gardens/<int:garden_id>/import_data', methods=['POST'])
@login_required
def import_garden_data(garden_id):
    try:
        garden = Garden.query.filter_by(id=garden_id, user_id=current_user.id).first()
        
        if not garden:
            return jsonify({'error': 'Garden not found'}), 404
        
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not file.filename.endswith('.csv'):
            return jsonify({'error': 'File must be a CSV'}), 400
        
        # Read CSV data
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_input = csv.DictReader(stream)
        
        imported_count = 0
        for row in csv_input:
            try:
                # Parse timestamp
                timestamp_str = row.get('timestamp', row.get('Timestamp', ''))
                if timestamp_str:
                    timestamp = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
                else:
                    timestamp = datetime.utcnow()
                
                reading = PlantReading(
                    garden_id=garden_id,
                    timestamp=timestamp,
                    moisture_level=float(row.get('moisture_level', row.get('Moisture', 0))),
                    temperature=float(row.get('temperature', row.get('Temperature', 0))),
                    light_intensity=float(row.get('light_intensity', row.get('Light', 0))),
                    humidity=float(row.get('humidity', 0)) if row.get('humidity') else None,
                    ph_level=float(row.get('ph_level', 0)) if row.get('ph_level') else None,
                    notes=row.get('notes', ''),
                    is_manual=True
                )
                
                db.session.add(reading)
                imported_count += 1
                
            except (ValueError, KeyError) as e:
                app.logger.warning(f"Skipping invalid row: {row}, error: {str(e)}")
                continue
        
        db.session.commit()
        
        return jsonify({
            'message': f'Successfully imported {imported_count} readings',
            'imported_count': imported_count
        }), 200
        
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Import data error: {str(e)}")
        return jsonify({'error': 'Failed to import data'}), 500

@data_bp.route('/gardens/<int:garden_id>/export_data', methods=['GET'])
@login_required
def export_garden_data(garden_id):
    try:
        garden = Garden.query.filter_by(id=garden_id, user_id=current_user.id).first()
        
        if not garden:
            return jsonify({'error': 'Garden not found'}), 404
        
        readings = PlantReading.query.filter_by(garden_id=garden_id)\
                                   .order_by(PlantReading.timestamp.asc()).all()
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow([
            'timestamp', 'moisture_level', 'temperature', 'light_intensity',
            'humidity', 'ph_level', 'notes', 'is_manual'
        ])
        
        # Write data
        for reading in readings:
            writer.writerow([
                reading.timestamp.isoformat(),
                reading.moisture_level,
                reading.temperature,
                reading.light_intensity,
                reading.humidity,
                reading.ph_level,
                reading.notes,
                reading.is_manual
            ])
        
        output.seek(0)
        
        from flask import Response
        return Response(
            output.getvalue(),
            mimetype='text/csv',
            headers={
                'Content-Disposition': f'attachment; filename=garden_{garden_id}_data.csv'
            }
        )
        
    except Exception as e:
        app.logger.error(f"Export data error: {str(e)}")
        return jsonify({'error': 'Failed to export data'}), 500

@data_bp.route('/gardens/<int:garden_id>/prediction', methods=['GET'])
@login_required
def get_prediction(garden_id):
    try:
        garden = Garden.query.filter_by(id=garden_id, user_id=current_user.id).first()
        
        if not garden:
            return jsonify({'error': 'Garden not found'}), 404
        
        # Get recent readings for prediction
        recent_readings = PlantReading.query.filter_by(garden_id=garden_id)\
                                          .filter(PlantReading.timestamp >= datetime.utcnow() - timedelta(days=7))\
                                          .order_by(PlantReading.timestamp.desc()).limit(20).all()
        
        if len(recent_readings) < 3:
            return jsonify({
                'next_watering_estimate': 'Not enough data',
                'recommendation': 'Add more readings to get predictions'
            }), 200
        
        # Simple prediction based on moisture decline rate
        moisture_values = [r.moisture_level for r in reversed(recent_readings)]
        
        # Calculate average moisture decline per day
        if len(moisture_values) >= 2:
            daily_decline = (moisture_values[0] - moisture_values[-1]) / len(moisture_values)
            current_moisture = moisture_values[-1]
            
            # Predict when moisture will reach threshold
            days_until_watering = max(0, (current_moisture - current_user.moisture_threshold) / max(daily_decline, 1))
            
            next_watering = datetime.utcnow() + timedelta(days=days_until_watering)
            
            recommendation = "Water soon" if days_until_watering < 1 else "Plant is healthy"
            
            return jsonify({
                'next_watering_estimate': next_watering.isoformat(),
                'days_until_watering': round(days_until_watering, 1),
                'current_moisture': current_moisture,
                'recommendation': recommendation
            }), 200
        
        return jsonify({
            'next_watering_estimate': 'Unable to calculate',
            'recommendation': 'Monitor moisture levels'
        }), 200
        
    except Exception as e:
        app.logger.error(f"Prediction error: {str(e)}")
        return jsonify({'error': 'Failed to generate prediction'}), 500

# Weather API Routes
import requests

weather_bp = Blueprint('weather', __name__)

@weather_bp.route('/weather', methods=['GET'])
@login_required
def get_weather():
    try:
        location = request.args.get('location')
        
        if not location:
            return jsonify({'error': 'Location parameter is required'}), 400
        
        # For demo purposes, we'll simulate weather data
        # In production, you would use a real weather API like OpenWeatherMap
        api_key = os.environ.get('WEATHER_API_KEY')
        
        if api_key:
            # Real API call (commented out for demo)
            # url = f"http://api.openweathermap.org/data/2.5/weather?q={location}&appid={api_key}&units=metric"
            # response = requests.get(url)
            # if response.status_code == 200:
            #     return jsonify(response.json()), 200
            pass
        
        # Simulated weather data
        import random
        weather_conditions = ['sunny', 'cloudy', 'rainy', 'partly cloudy', 'overcast']
        
        simulated_data = {
            'name': location,
            'main': {
                'temp': round(15 + random.random() * 20, 1),
                'humidity': round(40 + random.random() * 40),
                'pressure': round(1000 + random.random() * 50)
            },
            'weather': [{
                'main': random.choice(['Clear', 'Clouds', 'Rain']),
                'description': random.choice(weather_conditions)
            }],
            'wind': {
                'speed': round(random.random() * 10, 1)
            },
            'visibility': round(8000 + random.random() * 2000),
            'simulated': True
        }
        
        return jsonify(simulated_data), 200
        
    except Exception as e:
        app.logger.error(f"Weather API error: {str(e)}")
        return jsonify({'error': 'Failed to fetch weather data'}), 500

# Simulation and Utility Functions
import random
import threading
import time

def generate_simulated_data():
    """Background task to generate simulated sensor data"""
    with app.app_context():
        while True:
            try:
                # Get all gardens with simulation enabled
                gardens = Garden.query.filter(Garden.sensor_type.like('simulated%')).all()
                
                for garden in gardens:
                    if garden.sensor_type == 'none':
                        continue
                    
                    # Get latest reading
                    latest = PlantReading.query.filter_by(garden_id=garden.id)\
                                             .order_by(PlantReading.timestamp.desc()).first()
                    
                    # Generate new reading based on sensor type and previous data
                    if garden.sensor_type == 'simulated_basic':
                        moisture = generate_moisture_reading(latest)
                        temp = generate_temperature_reading(latest)
                        light = generate_light_reading(latest)
                        
                        new_reading = PlantReading(
                            garden_id=garden.id,
                            moisture_level=moisture,
                            temperature=temp,
                            light_intensity=light,
                            is_manual=False,
                            timestamp=datetime.utcnow()
                        )
                        
                    elif garden.sensor_type == 'simulated_full':
                        moisture = generate_moisture_reading(latest)
                        temp = generate_temperature_reading(latest)
                        light = generate_light_reading(latest)
                        humidity = generate_humidity_reading(latest)
                        ph = generate_ph_reading(latest)
                        
                        new_reading = PlantReading(
                            garden_id=garden.id,
                            moisture_level=moisture,
                            temperature=temp,
                            light_intensity=light,
                            humidity=humidity,
                            ph_level=ph,
                            is_manual=False,
                            timestamp=datetime.utcnow()
                        )
                    else:
                        continue
                    
                    db.session.add(new_reading)
                    
                    # Clean up old readings (keep last 1000 per garden)
                    old_readings = PlantReading.query.filter_by(garden_id=garden.id)\
                                                   .order_by(PlantReading.timestamp.desc())\
                                                   .offset(1000).all()
                    for old_reading in old_readings:
                        db.session.delete(old_reading)
                
                db.session.commit()
                
            except Exception as e:
                app.logger.error(f"Simulation error: {str(e)}")
                db.session.rollback()
            
            # Wait before next simulation cycle
            time.sleep(60)  # Generate data every minute

def generate_moisture_reading(latest):
    if latest:
        # Gradual decline with some variation
        base = latest.moisture_level - random.uniform(0.5, 2.0)
        variation = random.uniform(-5, 5)
        return max(0, min(100, base + variation))
    return random.uniform(40, 80)

def generate_temperature_reading(latest):
    if latest:
        # Small variations around previous reading
        base = latest.temperature
        variation = random.uniform(-2, 2)
        return max(5, min(40, base + variation))
    return random.uniform(18, 25)

def generate_light_reading(latest):
    # Simulate day/night cycle
    hour = datetime.now().hour
    if 6 <= hour <= 18:  # Daytime
        base_light = random.uniform(500, 1500)
    else:  # Nighttime
        base_light = random.uniform(0, 100)
    
    if latest:
        # Smooth transition
        diff = base_light - latest.light_intensity
        return latest.light_intensity + (diff * 0.3) + random.uniform(-50, 50)
    return base_light

def generate_humidity_reading(latest):
    if latest and latest.humidity:
        base = latest.humidity
        variation = random.uniform(-3, 3)
        return max(20, min(100, base + variation))
    return random.uniform(45, 75)

def generate_ph_reading(latest):
    if latest and latest.ph_level:
        base = latest.ph_level
        variation = random.uniform(-0.1, 0.1)
        return max(4.0, min(8.0, base + variation))
    return random.uniform(6.0, 7.5)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(gardens_bp, url_prefix='/api')
app.register_blueprint(data_bp, url_prefix='/api')
app.register_blueprint(weather_bp, url_prefix='/api')

# Serve frontend
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500

# Create database tables and start simulation
with app.app_context():
    db.create_all()
    
    # Start simulation in background thread
    simulation_thread = threading.Thread(target=generate_simulated_data, daemon=True)
    simulation_thread.start()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000, threaded=True)