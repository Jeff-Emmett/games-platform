from sqlalchemy.orm import Session
from typing import Optional, List
import redis
import json
import os

from models import GameRequest
from schemas import GameRequestCreate

class RequestService:
    def __init__(self):
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        self.redis_client = redis.from_url(redis_url)

    def get_requests(
        self,
        db: Session,
        status: Optional[str] = None
    ) -> List[GameRequest]:
        """Get game requests with optional status filter"""
        query = db.query(GameRequest)

        if status:
            query = query.filter(GameRequest.status == status)

        return query.order_by(GameRequest.created_at.desc()).all()

    def create_request(
        self,
        db: Session,
        request: GameRequestCreate
    ) -> GameRequest:
        """Create a new game request"""
        db_request = GameRequest(**request.model_dump())
        db.add(db_request)
        db.commit()
        db.refresh(db_request)
        return db_request

    def approve_request(self, db: Session, request_id: int) -> bool:
        """Approve a request and queue it for installation"""
        request = db.query(GameRequest).filter(GameRequest.id == request_id).first()
        if not request:
            return False

        request.status = "approved"
        db.commit()

        # Queue the installation job
        job_data = {
            "request_id": request_id,
            "game_title": request.game_title,
            "platform_id": request.platform_id
        }
        self.redis_client.lpush("game_install_queue", json.dumps(job_data))

        return True

    def reject_request(self, db: Session, request_id: int) -> bool:
        """Reject a game request"""
        request = db.query(GameRequest).filter(GameRequest.id == request_id).first()
        if not request:
            return False

        request.status = "rejected"
        db.commit()
        return True

    def update_progress(
        self,
        db: Session,
        request_id: int,
        progress: int,
        status: Optional[str] = None
    ):
        """Update installation progress"""
        request = db.query(GameRequest).filter(GameRequest.id == request_id).first()
        if request:
            request.installation_progress = progress
            if status:
                request.status = status
            db.commit()
