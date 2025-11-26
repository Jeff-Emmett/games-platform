from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Platform(Base):
    __tablename__ = "platforms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    code = Column(String(20), unique=True, nullable=False)  # e.g., "ps1", "n64"
    emulator_core = Column(String(50))  # RetroArch core name
    file_extensions = Column(JSON)  # Supported file extensions
    icon = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)

    games = relationship("Game", back_populates="platform")

class Game(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    platform_id = Column(Integer, ForeignKey("platforms.id"), nullable=False)
    description = Column(Text)
    release_year = Column(Integer)
    publisher = Column(String(100))
    developer = Column(String(100))
    genre = Column(String(100))

    # File information
    rom_path = Column(String(500), nullable=False)
    file_size = Column(Integer)  # In bytes
    file_hash = Column(String(64))  # SHA256

    # Media
    cover_image = Column(String(500))
    screenshot_1 = Column(String(500))
    screenshot_2 = Column(String(500))
    screenshot_3 = Column(String(500))

    # Metadata
    rating = Column(Integer)  # 1-10
    play_count = Column(Integer, default=0)
    favorite = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_played = Column(DateTime)

    platform = relationship("Platform", back_populates="games")

class GameRequest(Base):
    __tablename__ = "game_requests"

    id = Column(Integer, primary_key=True, index=True)
    game_title = Column(String(255), nullable=False)
    platform_id = Column(Integer, ForeignKey("platforms.id"), nullable=False)
    user_email = Column(String(255))
    user_notes = Column(Text)

    # Status: pending, approved, rejected, installed, failed
    status = Column(String(20), default="pending", index=True)

    # Admin notes
    admin_notes = Column(Text)

    # Installation tracking
    download_url = Column(String(500))
    installation_progress = Column(Integer, default=0)
    error_message = Column(Text)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    installed_at = Column(DateTime)

    platform = relationship("Platform")

class SaveState(Base):
    __tablename__ = "save_states"

    id = Column(Integer, primary_key=True, index=True)
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)
    user_id = Column(String(100))  # For future user system
    slot = Column(Integer, default=0)
    file_path = Column(String(500), nullable=False)
    screenshot = Column(String(500))
    description = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)

    game = relationship("Game")
