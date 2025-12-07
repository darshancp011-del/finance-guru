import mysql.connector
from db import get_db_connection

def add_profile_columns():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    columns = [
        ("phone", "VARCHAR(20)"),
        ("job_title", "VARCHAR(100)"),
        ("bio", "TEXT")
    ]
    
    try:
        for col_name, col_type in columns:
            cursor.execute(f"SHOW COLUMNS FROM users LIKE '{col_name}'")
            if not cursor.fetchone():
                print(f"Adding {col_name} column...")
                cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
                print(f"Column {col_name} added.")
            else:
                print(f"Column {col_name} already exists.")
        
        conn.commit()
    except mysql.connector.Error as err:
        print(f"Error: {err}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    add_profile_columns()
