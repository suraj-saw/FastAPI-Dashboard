# backend/app/seed/seed_data.py

import os
import sys

# ── Fix import path so 'app.*' resolves when run as a script ──────────────────
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

import pandas as pd

from app.database import Base, engine, SessionLocal
from app.models.accident import Accident


# ── Resolve Excel path relative to this file, not the CWD ───────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
EXCEL_PATH = os.path.join(BASE_DIR, "..", "..", "data", "accident_dummy_data.xlsx")


def seed_accidents():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        existing = db.query(Accident).count()
        if existing > 0:
            print(f"Accident data already exists ({existing} records). Skipping.")
            return

        print(f"Reading Excel file from: {os.path.abspath(EXCEL_PATH)}")
        df = pd.read_excel(EXCEL_PATH)

        accidents = [
            Accident(
                state=row["state"],
                district=row["district"],
                accident_type=row["accident_type"],
                severity=row["severity"],
                latitude=float(row["latitude"]),
                longitude=float(row["longitude"]),
                accident_date=row["accident_date"],
            )
            for _, row in df.iterrows()
        ]

        db.add_all(accidents)
        db.commit()
        print(f"✅ {len(accidents)} records inserted successfully.")

    except FileNotFoundError:
        print(f"❌ Excel file not found at: {os.path.abspath(EXCEL_PATH)}")
        print("   Make sure 'accident_dummy_data.xlsx' is in the backend/data/ folder.")

    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")

    finally:
        db.close()


if __name__ == "__main__":
    seed_accidents()