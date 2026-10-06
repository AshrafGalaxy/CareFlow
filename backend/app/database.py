import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

db_url = settings.DATABASE_URL
if db_url.startswith("sqlite"):
    engine = create_engine(db_url, connect_args={"check_same_thread": False})
else:
    try:
        candidate_engine = create_engine(
            db_url,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20,
            pool_recycle=1800,
            pool_timeout=3
        )
        with candidate_engine.connect() as conn:
            pass
        engine = candidate_engine
    except Exception as e:
        print(f"[CareFlow DB] Primary database connection failed. Falling back to local SQLite (careflow.db).")
        engine = create_engine("sqlite:///./careflow.db", connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

from sqlalchemy import text

Base = declarative_base()

def init_db():
    try:
        import app.models  # noqa
        Base.metadata.create_all(bind=engine)
        with engine.connect() as conn:
            for col in ["gender", "avatar_id"]:
                try:
                    conn.execute(text(f"ALTER TABLE users ADD COLUMN {col} VARCHAR(50);"))
                    conn.commit()
                except Exception:
                    pass
    except Exception as e:
        print(f"[CareFlow DB] Table initialization error: {e}")

init_db()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
