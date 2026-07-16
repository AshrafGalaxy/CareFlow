import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def main():
    print("Connecting to database...")
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    cursor = conn.cursor()

    print("Adding previous_dosage column to medications table...")
    try:
        cursor.execute("ALTER TABLE medications ADD COLUMN previous_dosage VARCHAR(100);")
        print("Successfully added previous_dosage column.")
    except Exception as e:
        print(f"Error (may already exist): {e}")
        
    cursor.close()
    conn.close()
    print("Done.")

if __name__ == "__main__":
    main()
