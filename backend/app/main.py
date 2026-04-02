from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import auth, adventure

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Adventure API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(adventure.router)

@app.get("/")
def root():
    return {"message": "AI Adventure API is running"}