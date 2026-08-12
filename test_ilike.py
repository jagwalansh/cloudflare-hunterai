import sys
import os
sys.path.insert(0, os.path.abspath("backend"))

from config.database import SessionLocal
from config.models import Job

db = SessionLocal()
try:
    count = db.query(Job).filter(Job.skills.ilike(f"%python%")).count()
    print("SUCCESS count:", count)
except Exception as e:
    print("ERROR:", e)
finally:
    db.close()
