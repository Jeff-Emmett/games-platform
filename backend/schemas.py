from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Platform schemas
class PlatformBase(BaseModel):
    name: str
    code: str
    emulator_core: Optional[str] = None
    file_extensions: Optional[List[str]] = None
    icon: Optional[str] = None

class PlatformResponse(PlatformBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Game schemas
class GameBase(BaseModel):
    title: str
    platform_id: int
    description: Optional[str] = None
    release_year: Optional[int] = None
    publisher: Optional[str] = None
    developer: Optional[str] = None
    genre: Optional[str] = None

class GameCreate(GameBase):
    rom_path: str
    file_size: Optional[int] = None
    file_hash: Optional[str] = None
    cover_image: Optional[str] = None

class GameResponse(GameBase):
    id: int
    rom_path: str
    file_size: Optional[int]
    file_hash: Optional[str]
    cover_image: Optional[str]
    screenshot_1: Optional[str]
    screenshot_2: Optional[str]
    screenshot_3: Optional[str]
    rating: Optional[int]
    play_count: int
    favorite: bool
    created_at: datetime
    last_played: Optional[datetime]
    platform: PlatformResponse

    class Config:
        from_attributes = True

# Game request schemas
class GameRequestBase(BaseModel):
    game_title: str
    platform_id: int
    user_email: Optional[str] = None
    user_notes: Optional[str] = None

class GameRequestCreate(GameRequestBase):
    pass

class GameRequestResponse(GameRequestBase):
    id: int
    status: str
    admin_notes: Optional[str]
    installation_progress: int
    error_message: Optional[str]
    created_at: datetime
    updated_at: datetime
    platform: PlatformResponse

    class Config:
        from_attributes = True

# Save state schemas
class SaveStateBase(BaseModel):
    game_id: int
    slot: int = 0
    description: Optional[str] = None

class SaveStateResponse(SaveStateBase):
    id: int
    file_path: str
    screenshot: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
