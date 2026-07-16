import sys
import os

# Add backend dir to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine
from sqlalchemy import text

def add_column():
    with engine.begin() as conn:
        try:
            conn.execute(text("ALTER TABLE medications ADD COLUMN hospital_notes TEXT;"))
            print("Successfully added hospital_notes column to medications table.")
        except Exception as e:
            if "already exists" in str(e):
                print("Column already exists.")
            else:
                print(f"Error: {e}")

if __name__ == "__main__":
    add_column()
