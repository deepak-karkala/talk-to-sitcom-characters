import sys
import os

# Add the project root (which is the 'backend/' directory in this context,
# as conftest.py is in backend/tests/) to sys.path.
# This allows tests to find and import modules from the 'app' package
# (e.g., from app.main import app)
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root) 