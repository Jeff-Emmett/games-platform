import os
import json
import time
import redis
import hashlib
import requests
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from pathlib import Path

# Database setup
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://games_user:changeme123@postgres:5432/games_platform"
)
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

# Redis setup
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379")
redis_client = redis.from_url(REDIS_URL)

# Storage path
STORAGE_PATH = os.getenv("GAMES_STORAGE_PATH", "/data/games")


def calculate_hash(file_path: str) -> str:
    """Calculate SHA256 hash of file"""
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            sha256.update(chunk)
    return sha256.hexdigest()


def download_game(url: str, destination: str, request_id: int):
    """Download a game file with progress tracking"""
    response = requests.get(url, stream=True)
    response.raise_for_status()

    total_size = int(response.headers.get('content-length', 0))
    downloaded = 0

    with open(destination, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                f.write(chunk)
                downloaded += len(chunk)

                # Update progress every MB
                if downloaded % (1024 * 1024) == 0:
                    progress = int((downloaded / total_size) * 100) if total_size else 0
                    update_request_progress(request_id, progress)

    return downloaded


def update_request_progress(request_id: int, progress: int, status: str = None):
    """Update request progress in database"""
    db = SessionLocal()
    try:
        # Use raw SQL for simplicity in worker
        query = "UPDATE game_requests SET installation_progress = %s"
        params = [progress]

        if status:
            query += ", status = %s"
            params.append(status)

        query += " WHERE id = %s"
        params.append(request_id)

        db.execute(query, params)
        db.commit()
    finally:
        db.close()


def install_game(job_data: dict):
    """Process a game installation job"""
    request_id = job_data['request_id']
    game_title = job_data['game_title']
    platform_id = job_data['platform_id']

    print(f"Installing game: {game_title} (Request ID: {request_id})")

    try:
        # Update status to installing
        update_request_progress(request_id, 0, "installing")

        # TODO: Implement actual game download logic
        # This is a placeholder - you would integrate with ROM sources here
        # For now, we'll simulate the process

        # Example: Search for game, download, extract, verify
        time.sleep(5)  # Simulate download
        update_request_progress(request_id, 50)

        time.sleep(3)  # Simulate extraction
        update_request_progress(request_id, 75)

        # Create game entry in database
        db = SessionLocal()
        try:
            # Insert game record
            query = """
                INSERT INTO games (title, platform_id, rom_path, file_size, file_hash)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id
            """
            result = db.execute(
                query,
                (game_title, platform_id, f"/data/games/{game_title}.rom", 0, "placeholder")
            )
            game_id = result.fetchone()[0]
            db.commit()

            # Update request status
            update_query = """
                UPDATE game_requests
                SET status = 'installed', installation_progress = 100, installed_at = NOW()
                WHERE id = %s
            """
            db.execute(update_query, (request_id,))
            db.commit()

            print(f"Successfully installed game: {game_title} (Game ID: {game_id})")

        finally:
            db.close()

    except Exception as e:
        print(f"Error installing game {game_title}: {str(e)}")

        # Update request with error
        db = SessionLocal()
        try:
            query = """
                UPDATE game_requests
                SET status = 'failed', error_message = %s
                WHERE id = %s
            """
            db.execute(query, (str(e), request_id))
            db.commit()
        finally:
            db.close()


def main():
    """Main worker loop"""
    print("Game installation worker started")
    print(f"Watching queue: game_install_queue")

    while True:
        try:
            # Block and wait for jobs (timeout 1 second)
            result = redis_client.brpop("game_install_queue", timeout=1)

            if result:
                queue_name, job_json = result
                job_data = json.loads(job_json)

                print(f"Received job: {job_data}")
                install_game(job_data)

        except KeyboardInterrupt:
            print("\nShutting down worker...")
            break
        except Exception as e:
            print(f"Worker error: {str(e)}")
            time.sleep(5)  # Wait before retrying


if __name__ == "__main__":
    main()
