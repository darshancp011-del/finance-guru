import mysql.connector
from db import get_db_connection

def add_notification_type_column():
    """Add 'type' column to notifications table for notification categories"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check if column exists
        cursor.execute("SHOW COLUMNS FROM notifications LIKE 'type'")
        result = cursor.fetchone()
        
        if not result:
            print("Adding 'type' column to notifications table...")
            cursor.execute("""
                ALTER TABLE notifications 
                ADD COLUMN type ENUM('info', 'warning', 'danger', 'success') DEFAULT 'info' 
                AFTER message
            """)
            conn.commit()
            print("Column 'type' added successfully!")
        else:
            print("Column 'type' already exists in notifications table.")
            
    except mysql.connector.Error as err:
        print(f"Error: {err}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    add_notification_type_column()
