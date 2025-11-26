from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
import os
import hashlib
import shutil
from fastapi import UploadFile

from models import Game, Platform
from schemas import GameCreate

class GameService:
    def __init__(self):
        self.storage_path = os.getenv("GAMES_STORAGE_PATH", "/data/games")
        os.makedirs(self.storage_path, exist_ok=True)

    def get_games(
        self,
        db: Session,
        platform: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Game]:
        """Get games with optional filtering"""
        query = db.query(Game)

        if platform:
            query = query.join(Platform).filter(Platform.code == platform)

        if search:
            query = query.filter(
                Game.title.ilike(f"%{search}%")
            )

        return query.order_by(Game.title).limit(limit).offset(offset).all()

    def get_game(self, db: Session, game_id: int) -> Optional[Game]:
        """Get a specific game"""
        return db.query(Game).filter(Game.id == game_id).first()

    def create_game(self, db: Session, game: GameCreate) -> Game:
        """Create a new game entry"""
        db_game = Game(**game.model_dump())
        db.add(db_game)
        db.commit()
        db.refresh(db_game)
        return db_game

    def delete_game(self, db: Session, game_id: int) -> bool:
        """Delete a game and its files"""
        game = self.get_game(db, game_id)
        if not game:
            return False

        # Delete ROM file
        if os.path.exists(game.rom_path):
            os.remove(game.rom_path)

        # Delete cover image
        if game.cover_image and os.path.exists(game.cover_image):
            os.remove(game.cover_image)

        # Delete from database
        db.delete(game)
        db.commit()
        return True

    async def upload_game(
        self,
        db: Session,
        file: UploadFile,
        platform_code: str
    ) -> dict:
        """Upload and process a game file"""
        # Get platform
        platform = db.query(Platform).filter(Platform.code == platform_code).first()
        if not platform:
            raise ValueError(f"Platform {platform_code} not found")

        # Create platform directory
        platform_dir = os.path.join(self.storage_path, platform_code)
        os.makedirs(platform_dir, exist_ok=True)

        # Save file
        file_path = os.path.join(platform_dir, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Calculate hash
        file_hash = self._calculate_hash(file_path)

        # Get file size
        file_size = os.path.getsize(file_path)

        # Extract title from filename
        title = os.path.splitext(file.filename)[0]

        # Create game entry
        game = Game(
            title=title,
            platform_id=platform.id,
            rom_path=file_path,
            file_size=file_size,
            file_hash=file_hash
        )
        db.add(game)
        db.commit()
        db.refresh(game)

        return {
            "message": "Game uploaded successfully",
            "game_id": game.id,
            "title": game.title
        }

    def _calculate_hash(self, file_path: str) -> str:
        """Calculate SHA256 hash of file"""
        sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                sha256.update(chunk)
        return sha256.hexdigest()

    def get_stats(self, db: Session) -> dict:
        """Get platform statistics"""
        stats = db.query(
            Platform.name,
            Platform.code,
            func.count(Game.id).label("game_count")
        ).outerjoin(Game).group_by(Platform.id, Platform.name, Platform.code).all()

        total_games = db.query(func.count(Game.id)).scalar()

        return {
            "total_games": total_games,
            "platforms": [
                {
                    "name": stat.name,
                    "code": stat.code,
                    "game_count": stat.game_count
                }
                for stat in stats
            ]
        }
