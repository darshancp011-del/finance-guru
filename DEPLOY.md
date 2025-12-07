# Finance Guru - Deployment Guide

## 🚀 Deploy to PythonAnywhere (FREE)

### Step 1: Create Account
1. Go to https://www.pythonanywhere.com
2. Click "Start running Python online in less than a minute!"
3. Create a free "Beginner" account

### Step 2: Upload Your Code
1. After login, click "Files" tab
2. Create a new directory: `finance-guru`
3. Upload ALL files from your project folder:
   - app.py
   - db.py
   - wsgi.py
   - requirements.txt
   - templates/ (entire folder)
   - static/ (entire folder)

### Step 3: Create MySQL Database
1. Click "Databases" tab
2. Set a MySQL password and click "Initialize MySQL"
3. Create a new database: `yourusername$finance_tracker`
4. Note your database details:
   - Host: `yourusername.mysql.pythonanywhere-services.com`
   - Username: `yourusername`
   - Database: `yourusername$finance_tracker`

### Step 4: Update Database Config
1. Go to Files → Open `db.py`
2. Update the config to use PythonAnywhere MySQL:

```python
DB_CONFIG = {
    'user': 'yourusername',  # Your PythonAnywhere username
    'password': 'your_mysql_password',  # Password you set in step 3
    'host': 'yourusername.mysql.pythonanywhere-services.com',
    'raise_on_warnings': True
}

DB_NAME = 'yourusername$finance_tracker'
```

### Step 5: Set Up Web App
1. Click "Web" tab
2. Click "Add a new web app"
3. Choose "Flask" → Python 3.10
4. Set source code directory: `/home/yourusername/finance-guru`
5. Set WSGI file path: `/home/yourusername/finance-guru/wsgi.py`

### Step 6: Configure WSGI File
1. Click on the WSGI file link
2. Replace content with:

```python
import sys
import os

project_home = '/home/yourusername/finance-guru'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

from app import app as application
```

### Step 7: Install Dependencies
1. Click "Consoles" → "Bash"
2. Run:
```bash
cd finance-guru
pip3 install --user -r requirements.txt
```

### Step 8: Initialize Database Tables
1. In the Bash console, run:
```bash
cd finance-guru
python3 -c "from db import initialize_database; initialize_database()"
```

### Step 9: Reload & Visit
1. Go to "Web" tab
2. Click "Reload" button
3. Visit: `https://yourusername.pythonanywhere.com`

---

## 🎉 Your app is now live!

Your URL will be: **https://yourusername.pythonanywhere.com**

---

## Alternative: Deploy to Render.com

1. Push code to GitHub
2. Go to render.com → New Web Service
3. Connect GitHub repo
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `gunicorn app:app`
6. Add environment variables for database

---

## Need Help?

If you encounter issues:
1. Check "Error log" in Web tab
2. Make sure all files are uploaded
3. Verify database credentials
