# Resource-Efficient Plant Care Dashboard

A modern, software-only plant care dashboard that simulates smart plant monitoring and care, built with Python Flask (backend), SQLite (database), Svelte (frontend), and Chart.js (visualization). No hardware required—everything runs locally on your computer.

## Features
- **User Authentication:** Register and log in. Each user sees only their own plant data.
- **Simulated Plant Data:** The backend generates realistic soil moisture, temperature, and light readings for each user at regular intervals.
- **Manual Data Input:** Add your own readings via a simple form.
- **Real-Time Dashboard:** View current plant status, health indicators, and last updated time.
- **Historical Data Visualization:** Interactive charts show trends over time, with time range selection.
- **Plant Health Status:** Visual cues and messages (e.g., "Needs water!") based on thresholds.
- **Predictive Analytics:** Dashboard predicts when your plant will next need watering.
- **Resume Where You Left Off:** Dashboard shows your last login and continues from your previous session.

## Tech Stack
- **Backend:** Python Flask, Flask-Session, SQLite, Flask-CORS
- **Frontend:** Svelte, Chart.js, modern CSS
- **Authentication:** Session-based, per-user data isolation

## Getting Started

### Prerequisites
- Python 3.x
- Node.js & npm

### Backend Setup
1. Create and activate a Python virtual environment:
   ```sh
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   ```
2. Install dependencies:
   ```sh
   pip install flask flask-cors werkzeug
   ```
3. Run the Flask backend:
   ```sh
   python app.py
   ```
   The backend will auto-create the SQLite database and tables on first run.

### Frontend Setup
1. Navigate to the Svelte dashboard directory:
   ```sh
   cd svelte-dashboard
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Run the Svelte dev server:
   ```sh
   npm run dev
   ```
   The dashboard will be available at `http://localhost:5173` (or similar).

## Usage
1. Open the dashboard in your browser.
2. Register a new account or log in with your credentials.
3. View your plant's simulated data, add manual readings, and see predictions for next watering.
4. Log out and log back in to resume where you left off.

## Project Structure
```
app.py                  # Flask backend
plant_data.db           # SQLite database (auto-created)
svelte-dashboard/
  src/
    App.svelte          # Main dashboard layout
    Auth.svelte         # Login/register page
    CurrentStatus.svelte# Real-time plant status
    InputForm.svelte    # Manual data input
    ChartComponent.svelte# Historical data chart
    authStore.js        # Svelte store for user/session
```

## Customization
- Change plant health thresholds or simulation logic in `app.py`.
- Update UI/UX in Svelte components for your needs.

## Security Notes
- This project is for local/demo use. For production, use HTTPS, secure session secrets, and stronger authentication.

## License
MIT

---
*Created as a portfolio project for learning full-stack web development and data visualization.*

## Authours 
Colile Sibanda