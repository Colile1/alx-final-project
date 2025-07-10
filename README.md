# C_Gardens

C_Gardens is a modern, full-stack smart plant care dashboard that helps users monitor, manage, and analyze their gardens and connected devices. It features real-time data visualization, weather integration, user authentication, multi-garden support, and more. The project is built with a Python Flask backend and a Svelte frontend.

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [APIs & Data](#apis--data)
- [Customization](#customization)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)
- [Authors](#authors)

---

## Features
- **User Authentication:** Register, login, and secure your data. Each user sees only their own gardens and readings.
- **Multi-Garden Support:** Create and manage multiple gardens, each with its own location and sensor data.
- **Sensor Integration:** Import data from various sensor types or manually enter readings.
- **Weather Integration:** Enter or detect garden location and view real-time weather reports for each garden.
- **Data Import:** Import plant readings from CSV files or other databases.
- **Dashboard:** Visualize real-time and historical data with interactive charts (Chart.js).
- **Status & Prediction:** See plant health indicators and predictions for next watering.
- **Theme Support:** Toggle between dark mode and light mode.
- **Resume Feature:** Continue from where you left off on last login.
- **Responsive UI:** Works on desktop and mobile browsers.

---

## Tech Stack
- **Frontend:** Svelte, Chart.js, CSS (with theme support)
- **Backend:** Python 3, Flask, Flask-CORS, SQLite, requests
- **Authentication:** Flask session-based auth, password hashing
- **Weather:** OpenWeatherMap API (or similar)
- **Testing:** Python unittest

---

## Project Structure
```
alx-final-project/
│
├── app.py                # Flask backend
├── requirements.txt      # Python dependencies
├── plant_data.db         # SQLite database (auto-created)
├── test_app.py           # Backend unit tests
├── README.md
│
├── svelte-dashboard/     # Svelte frontend
│   ├── src/
│   │   ├── App.svelte
│   │   ├── Auth.svelte
│   │   ├── CurrentStatus.svelte
│   │   ├── ChartComponent.svelte
│   │   ├── InputForm.svelte
│   │   ├── GardensList.svelte
│   │   ├── WeatherWidget.svelte
│   │   └── ...
│   ├── public/
│   ├── package.json
│   └── ...
│
└── Proposal/
    └── Developing a Resource-Efficient Plant Care Dashboard_ A Software-Only Approach.md
```

---

## Getting Started

### Prerequisites
- **Python 3.8+**
- **Node.js** (v18+ recommended)
- **npm**

### Backend Setup (Flask)
1. **Clone the repository:**
   ```sh
   git clone <repo-url>
   cd alx-final-project
   ```
2. **Create and activate a virtual environment:**
   ```sh
   python3 -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```
3. **Install dependencies:**
   ```sh
   pip install -r requirements.txt
   ```
4. **Run the backend:**
   ```sh
   python app.py
   ```
   The backend will start on [http://localhost:5000](http://localhost:5000)

### Frontend Setup (Svelte)
1. **Navigate to the Svelte dashboard:**
   ```sh
   cd svelte-dashboard
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Start the frontend:**
   ```sh
   npm run dev
   ```
   The frontend will start on [http://localhost:5173](http://localhost:5173)

---

## Available Scripts

**Backend:**
- `python app.py` — Start Flask backend
- `python test_app.py` — Run backend unit tests

**Frontend:**
- `npm run dev` — Start Svelte development server
- `npm run build` — Build Svelte app for production
- `npm run preview` — Preview production build

---

## APIs & Data

- **User Auth:** `/api/register`, `/api/login`, `/api/logout`
- **Gardens:** `/api/gardens` (CRUD)
- **Readings:** `/api/add_reading`, `/api/readings`, `/api/latest_reading`, `/api/import_readings`
- **Sensors:** Add readings with `sensor_type` field
- **Weather:** `/api/weather` (uses user/garden location)
- **Prediction:** `/api/predict_next_watering`
- **User Location:** `/api/set_location`
- **CSV/DB Import:** `/api/import_readings`

All endpoints require authentication (session cookie).

---

## Customization

- **Themes:** Toggle dark/light mode from the dashboard.
- **Sensors:** Add new sensor types by specifying `sensor_type` in API requests.
- **Weather API:** Set your OpenWeatherMap API key in the backend.
- **Gardens:** Add, edit, and manage multiple gardens per user.

---

## Deployment

You can deploy the app using platforms like **Render**, **Railway**, **Heroku**, or a VPS:

1. Deploy the Flask backend (use Gunicorn for production).
2. Deploy the Svelte frontend (build and serve as static files).
3. Update frontend API URLs to point to your backend.
4. Use HTTPS and secure your environment variables.

See the main project documentation for detailed deployment steps.

---

## Contributing

Contributions are welcome! Please fork the repo and submit a pull request. For major changes, open an issue first to discuss what you would like to change.

---

## License

This project is licensed under the MIT License.

---

## Acknowledgements

- [Svelte](https://svelte.dev/)
- [Flask](https://flask.palletsprojects.com/)
- [Chart.js](https://www.chartjs.org/)
- [OpenWeatherMap](https://openweathermap.org/)
- [SQLite](https://www.sqlite.org/)
- [Render](https://render.com/)
- [Railway](https://railway.app/)

---

## Authors

Colile Sibanda

---
