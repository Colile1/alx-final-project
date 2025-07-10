from fastapi import FastAPI
from database import Base, engine

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="C_Gardens API")

@app.get("/")
def read_root():
    return {"Welcome": "C_Gardens API"}

# We will add more routes here