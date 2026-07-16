import os
import random
import uuid
from datetime import datetime, timedelta, timezone
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def main():
    print("Connecting to database...")
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    cursor = conn.cursor()

    # Get the user ID (assuming there's a primary test user)
    cursor.execute("SELECT id FROM users LIMIT 1;")
    user_row = cursor.fetchone()
    if not user_row:
        print("No users found.")
        return
    user_id = user_row[0]

    # Get all medications for this user
    cursor.execute("SELECT id FROM medications WHERE user_id = %s;", (user_id,))
    med_rows = cursor.fetchall()
    
    if not med_rows:
        print("No medications found for the user.")
        return

    print(f"Generating 90 days of logs for {len(med_rows)} medications...")
    
    now = datetime.now(timezone.utc)
    
    insert_query = """
        INSERT INTO medication_logs (id, medication_id, scheduled_time, taken_at, status)
        VALUES (%s, %s, %s, %s, %s)
    """
    
    logs_inserted = 0
    
    for med_id in [r[0] for r in med_rows]:
        for day_offset in range(90):
            # Scheduled time for this day (e.g. 9:00 AM)
            scheduled_date = now - timedelta(days=day_offset)
            # Create a localized naive or aware datetime based on postgres setup,
            # but usually just sending UTC datetime string is fine.
            scheduled_time = scheduled_date.replace(hour=9, minute=0, second=0, microsecond=0)
            
            # Decide status (80% taken, 15% missed, 5% skipped)
            rand = random.random()
            if rand < 0.8:
                status = 'taken'
                # Taken anytime between 8:30 and 10:30 AM
                taken_offset_mins = random.randint(-30, 90)
                taken_at = scheduled_time + timedelta(minutes=taken_offset_mins)
            elif rand < 0.95:
                status = 'missed'
                taken_at = None
            else:
                status = 'skipped'
                taken_at = None
                
            cursor.execute(insert_query, (
                str(uuid.uuid4()),
                med_id,
                scheduled_time,
                taken_at,
                status
            ))
            logs_inserted += 1

    print(f"Successfully generated {logs_inserted} fake logs.")
    cursor.close()
    conn.close()

if __name__ == "__main__":
    main()
