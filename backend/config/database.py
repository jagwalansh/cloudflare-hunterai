import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
# Rexsolve project paths
config_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(config_dir)
default_db_path = os.path.join(project_root, "data", "app.db")

# Load environment variables
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    # Fallback to local SQLite for instant out-of-the-box working setup
    os.makedirs(os.path.dirname(default_db_path), exist_ok=True)
    DATABASE_URL = f"sqlite:///{default_db_path}"

# SQLAlchemy configuration
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
