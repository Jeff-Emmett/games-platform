from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List, Optional
import os

from database import engine, Base, get_db
from models import Game, GameRequest, Platform
from schemas import (
    GameResponse, GameCreate, GameRequestCreate,
    GameRequestResponse, PlatformResponse
)
from services.game_service import GameService
from services.request_service import RequestService

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Games Platform API",
    description="Backend API for retro gaming platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Services
game_service = GameService()
request_service = RequestService()

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Game endpoints
@app.get("/api/games", response_model=List[GameResponse])
async def get_games(
    platform: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Get all games with optional filtering"""
    return game_service.get_games(
        db,
        platform=platform,
        search=search,
        limit=limit,
        offset=offset
    )

@app.get("/api/games/{game_id}", response_model=GameResponse)
async def get_game(game_id: int, db: Session = Depends(get_db)):
    """Get a specific game by ID"""
    game = game_service.get_game(db, game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game

@app.post("/api/games", response_model=GameResponse)
async def create_game(
    game: GameCreate,
    db: Session = Depends(get_db)
):
    """Manually add a game to the library"""
    return game_service.create_game(db, game)

@app.delete("/api/games/{game_id}")
async def delete_game(game_id: int, db: Session = Depends(get_db)):
    """Delete a game from the library"""
    success = game_service.delete_game(db, game_id)
    if not success:
        raise HTTPException(status_code=404, detail="Game not found")
    return {"message": "Game deleted successfully"}

# Game request endpoints
@app.get("/api/requests", response_model=List[GameRequestResponse])
async def get_requests(
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all game requests"""
    return request_service.get_requests(db, status=status)

@app.post("/api/requests", response_model=GameRequestResponse)
async def create_request(
    request: GameRequestCreate,
    db: Session = Depends(get_db)
):
    """Submit a new game request"""
    return request_service.create_request(db, request)

@app.put("/api/requests/{request_id}/approve")
async def approve_request(request_id: int, db: Session = Depends(get_db)):
    """Approve a game request and start installation"""
    success = request_service.approve_request(db, request_id)
    if not success:
        raise HTTPException(status_code=404, detail="Request not found")
    return {"message": "Request approved, installation queued"}

@app.put("/api/requests/{request_id}/reject")
async def reject_request(request_id: int, db: Session = Depends(get_db)):
    """Reject a game request"""
    success = request_service.reject_request(db, request_id)
    if not success:
        raise HTTPException(status_code=404, detail="Request not found")
    return {"message": "Request rejected"}

# Platform endpoints
@app.get("/api/platforms", response_model=List[PlatformResponse])
async def get_platforms(db: Session = Depends(get_db)):
    """Get all supported platforms"""
    platforms = db.query(Platform).all()
    return platforms

# File upload endpoint
@app.post("/api/upload")
async def upload_game(
    file: UploadFile = File(...),
    platform: str = None,
    db: Session = Depends(get_db)
):
    """Upload a game ROM/ISO"""
    if not platform:
        raise HTTPException(status_code=400, detail="Platform is required")

    result = await game_service.upload_game(db, file, platform)
    return result

# Statistics endpoint
@app.get("/api/stats")
async def get_stats(db: Session = Depends(get_db)):
    """Get platform statistics"""
    stats = game_service.get_stats(db)
    return stats

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
