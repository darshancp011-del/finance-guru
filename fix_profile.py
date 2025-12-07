import mysql.connector
from db import get_db_connection

def add_profile_pic_column():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check if column exists
        cursor.execute("SHOW COLUMNS FROM users LIKE 'profile_pic'")
        result = cursor.fetchone()
        
        if not result:
            print("Adding profile_pic column...")
            cursor.execute("ALTER TABLE users ADD COLUMN profile_pic VARCHAR(255) DEFAULT 'default.png'")
            conn.commit()
            print("Column added successfully!")
        else:
            print("Column already exists.")
            
    except mysql.connector.Error as err:
        print(f"Error: {err}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    add_profile_pic_column()
