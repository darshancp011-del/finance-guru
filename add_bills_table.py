import mysql.connector

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Darshan@123",
    database="finance_tracker"
)
cursor = conn.cursor()

try:
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS `bills` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `user_id` int(11) NOT NULL,
            `name` varchar(100) NOT NULL,
            `amount` DECIMAL(10, 2) NOT NULL,
            `due_date` DATE NOT NULL,
            `category` varchar(50) DEFAULT 'Other',
            `is_recurring` BOOLEAN DEFAULT FALSE,
            `recurrence` ENUM('weekly', 'monthly', 'yearly') DEFAULT 'monthly',
            `is_paid` BOOLEAN DEFAULT FALSE,
            `paid_date` DATE DEFAULT NULL,
            `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB
    """)
    conn.commit()
    print("Bills table created successfully!")
except mysql.connector.Error as err:
    print(f"Error: {err}")
finally:
    cursor.close()
    conn.close()
