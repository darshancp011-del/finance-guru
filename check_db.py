import mysql.connector

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Darshan@123",
    database="finance_tracker"
)
cursor = conn.cursor(dictionary=True)

print("=== Current Budgets ===")
cursor.execute("SELECT * FROM budgets")
for row in cursor.fetchall():
    print(row)

print("\n=== December 2025 Food Transactions for User 3 ===")
cursor.execute("""
    SELECT id, category, amount, date, is_deleted FROM transactions 
    WHERE user_id = 3 
    AND LOWER(category) = LOWER('Food') 
    AND type = 'expense' 
    AND DATE_FORMAT(date, '%Y-%m') = '2025-12'
    AND (is_deleted IS NULL OR is_deleted = 0)
""")
for row in cursor.fetchall():
    print(row)

print("\n=== Total Food Spent ===")
cursor.execute("""
    SELECT COALESCE(SUM(amount), 0) as total FROM transactions 
    WHERE user_id = 3 
    AND LOWER(category) = LOWER('Food') 
    AND type = 'expense' 
    AND DATE_FORMAT(date, '%Y-%m') = '2025-12'
    AND (is_deleted IS NULL OR is_deleted = 0)
""")
result = cursor.fetchone()
print(f"Total: {result}")

print("\n=== Notifications ===")
cursor.execute("SELECT * FROM notifications WHERE user_id = 3 ORDER BY id DESC LIMIT 5")
for row in cursor.fetchall():
    print(row)

cursor.close()
conn.close()
