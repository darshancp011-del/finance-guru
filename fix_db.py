import mysql.connector
from db import get_db_connection

def add_column():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        print("Attempting to add 'payment_method' column...")
        cursor.execute("ALTER TABLE transactions ADD COLUMN payment_method VARCHAR(50) DEFAULT 'Cash'")
        conn.commit()
        print("Success: Column 'payment_method' added.")
    except mysql.connector.Error as err:
        if err.errno == 1060: # Duplicate column name
            print("Info: Column 'payment_method' already exists.")
        else:
            print(f"Error: {err}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    add_column()
