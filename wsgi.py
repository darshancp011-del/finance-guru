# WSGI entry point for PythonAnywhere deployment
import sys
import os

# Add your project directory to the path
project_home = '/home/YOUR_USERNAME/finance-guru'  # Change YOUR_USERNAME
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Import your Flask app
from app import app as application

# This is needed for PythonAnywhere
if __name__ == "__main__":
    application.run()
