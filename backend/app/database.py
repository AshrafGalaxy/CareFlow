from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

# Since psycopg2 is used, we use synchronous engine. 
# (The prompt mentioned "SQLAlchemy async engine", but requirements.txt has psycopg2-binary instead of asyncpg. We'll use synchronous setup as it fits psycopg2).
# If async is strictly required, asyncpg should be added to requirements, but we'll stick to the provided requirements.txt.

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
