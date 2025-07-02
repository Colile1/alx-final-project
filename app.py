from flask import Flask
import sqlite3
import os

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

if __name__ == '__main__':
    app.run(debug=True)
