import mysql.connector
from mysql.connector import errorcode
import os

# Database configuration - uses environment variables for production
DB_CONFIG = {
    'user': os.environ.get('DB_USER', 'root'),
    'password': os.environ.get('DB_PASSWORD', 'Darshan@123'),
    'host': os.environ.get('DB_HOST', 'localhost'),
    'raise_on_warnings': True
}

DB_NAME = os.environ.get('DB_NAME', 'finance_tracker')

TABLES = {}

TABLES['users'] = (
    "CREATE TABLE `users` ("
    "  `id` int(11) NOT NULL AUTO_INCREMENT,"
    "  `username` varchar(50) NOT NULL,"
    "  `email` varchar(100) NOT NULL,"
    "  `password_hash` varchar(255) NOT NULL,"
    "  `profile_pic` varchar(255) DEFAULT 'default.png',"
    "  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,"
    "  PRIMARY KEY (`id`),"
    "  UNIQUE KEY `email` (`email`)"
    ") ENGINE=InnoDB")

TABLES['transactions'] = (
    "CREATE TABLE `transactions` ("
    "  `id` int(11) NOT NULL AUTO_INCREMENT,"
    "  `user_id` int(11) NOT NULL,"
    "  `type` ENUM('income', 'expense') NOT NULL,"
    "  `category` varchar(50) NOT NULL,"
    "  `amount` DECIMAL(10, 2) NOT NULL,"
    "  `description` varchar(255),"
    "  `date` DATE NOT NULL,"
    "  `payment_method` varchar(50) DEFAULT 'Cash',"
    "  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,"
    "  PRIMARY KEY (`id`),"
    "  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE"
    ") ENGINE=InnoDB")

TABLES['goals'] = (
    "CREATE TABLE `goals` ("
    "  `id` int(11) NOT NULL AUTO_INCREMENT,"
    "  `user_id` int(11) NOT NULL,"
    "  `name` varchar(100) NOT NULL,"
    "  `target_amount` DECIMAL(10, 2) NOT NULL,"
    "  `current_amount` DECIMAL(10, 2) DEFAULT 0.00,"
    "  `deadline` DATE,"
    "  PRIMARY KEY (`id`),"
    "  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE"
    ") ENGINE=InnoDB")

TABLES['budgets'] = (
    "CREATE TABLE `budgets` ("
    "  `id` int(11) NOT NULL AUTO_INCREMENT,"
    "  `user_id` int(11) NOT NULL,"
    "  `category` varchar(50) NOT NULL,"
    "  `limit_amount` DECIMAL(10, 2) NOT NULL,"
    "  `month` VARCHAR(7) NOT NULL," # Format YYYY-MM
    "  PRIMARY KEY (`id`),"
    "  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE"
    ") ENGINE=InnoDB")

TABLES['notifications'] = (
    "CREATE TABLE `notifications` ("
    "  `id` int(11) NOT NULL AUTO_INCREMENT,"
    "  `user_id` int(11) NOT NULL,"
    "  `message` varchar(255) NOT NULL,"
    "  `type` ENUM('info', 'warning', 'danger', 'success') DEFAULT 'info',"
    "  `is_read` BOOLEAN DEFAULT FALSE,"
    "  `date` timestamp DEFAULT CURRENT_TIMESTAMP,"
    "  PRIMARY KEY (`id`),"
    "  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE"
    ") ENGINE=InnoDB")

TABLES['bills'] = (
    "CREATE TABLE `bills` ("
    "  `id` int(11) NOT NULL AUTO_INCREMENT,"
    "  `user_id` int(11) NOT NULL,"
    "  `name` varchar(100) NOT NULL,"
    "  `amount` DECIMAL(10, 2) NOT NULL,"
    "  `due_date` DATE NOT NULL,"
    "  `category` varchar(50) DEFAULT 'Other',"
    "  `is_recurring` BOOLEAN DEFAULT FALSE,"
    "  `recurrence` ENUM('weekly', 'monthly', 'yearly') DEFAULT 'monthly',"
    "  `is_paid` BOOLEAN DEFAULT FALSE,"
    "  `paid_date` DATE DEFAULT NULL,"
    "  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,"
    "  PRIMARY KEY (`id`),"
    "  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE"
    ") ENGINE=InnoDB")

def create_database(cursor):
    try:
        cursor.execute(
            "CREATE DATABASE {} DEFAULT CHARACTER SET 'utf8'".format(DB_NAME))
    except mysql.connector.Error as err:
        print("Failed creating database: {}".format(err))
        exit(1)

def get_db_connection():
    try:
        cnx = mysql.connector.connect(database=DB_NAME, **DB_CONFIG)
        return cnx
    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_BAD_DB_ERROR:
            # Re-try without database specified to create it
            init_db()
            return mysql.connector.connect(database=DB_NAME, **DB_CONFIG)
        else:
            print(err)
            return None

def init_db():
    try:
        # Connect without DB to create it if needed
        cnx = mysql.connector.connect(**DB_CONFIG)
        cursor = cnx.cursor()
    except mysql.connector.Error as err:
        print(f"Error connecting to MySQL: {err}")
        return

    try:
        cursor.execute("USE {}".format(DB_NAME))
    except mysql.connector.Error as err:
        print("Database {} does not exist.".format(DB_NAME))
        if err.errno == errorcode.ER_BAD_DB_ERROR:
            create_database(cursor)
            print("Database {} created successfully.".format(DB_NAME))
            cnx.database = DB_NAME
        else:
            print(err)
            exit(1)

    for table_name in TABLES:
        table_description = TABLES[table_name]
        try:
            print("Creating table {}: ".format(table_name), end='')
            cursor.execute(table_description)
        except mysql.connector.Error as err:
            if err.errno == errorcode.ER_TABLE_EXISTS_ERROR:
                print("already exists.")
            else:
                print(err.msg)
        else:
            print("OK")

    cursor.close()
    cnx.close()

if __name__ == "__main__":
    init_db()
