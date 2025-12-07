import hashlib
from db import get_db_connection

def create_test_user():
    username = "Demo User"
    email = "demo@example.com"
    password = "password"
    
    hash_pwd = hashlib.sha256(password.encode()).hexdigest()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s)", 
                       (username, email, hash_pwd))
        conn.commit()
        print(f"User created successfully: {email} / {password}")
    except Exception as err:
        print(f"Error creating user: {err}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    create_test_user()
