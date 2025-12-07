import mysql.connector
from db import get_db_connection

def list_users():
    try:
        conn = get_db_connection()
        if conn is None:
            print("Failed to connect to database.")
            return

        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, username, email, password_hash FROM users")
        users = cursor.fetchall()
        
        print(f"Total users found: {len(users)}")
        for user in users:
            print(f"ID: {user['id']}, Username: {user['username']}, Email: {user['email']}, Hash: {user['password_hash'][:10]}...")
            
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_users()
