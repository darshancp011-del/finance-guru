from db import get_db_connection

def add_test_notification(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO notifications (user_id, message) VALUES (%s, 'Test Notification: System Check')", (user_id,))
        conn.commit()
        print(f"Successfully added notification for user {user_id}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    add_test_notification(2)
