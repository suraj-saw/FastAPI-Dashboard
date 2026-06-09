# backend/app/seed/seed_data.py

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

import pandas as pd
from app.database import Base, engine, SessionLocal
from app.models.accident import Accident


BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
EXCEL_PATH = os.path.abspath(
    os.path.join(BASE_DIR, "..", "..", "data", "accident_dummy_data.xlsx")
)


def to_int(val):
    """Safely convert to int, return 0 if null/invalid."""
    try:
        return int(val)
    except (ValueError, TypeError):
        return 0


def seed_accidents():
    print("=" * 50)
    print("Step 1: Creating tables if not exist...")
    Base.metadata.create_all(bind=engine)
    print("        Tables ready.")

    db = SessionLocal()

    try:
        existing = db.query(Accident).count()
        if existing > 0:
            print(f"        Skipping — {existing} records already in DB.")
            return

        print(f"Step 2: Reading Excel from:\n        {EXCEL_PATH}")

        if not os.path.exists(EXCEL_PATH):
            raise FileNotFoundError(f"Excel file not found at {EXCEL_PATH}")

        df = pd.read_excel(EXCEL_PATH)
        df["Accident_DateTime"] = pd.to_datetime(df["Accident_DateTime"], format="%d-%m-%Y %H:%M", dayfirst=True)

        print(f"        {len(df)} rows found.")
        print(f"        Columns detected: {list(df.columns)}")

        # Validate required columns exist
        required_cols = {
            "Accident_ID", "District", "Police_Station", "Accident_DateTime",
            "Latitude", "Longitude", "Road_Name", "Road_Classification",
            "Severity", "No_of_Vehicles", "Drivers_Killed",
            "Drivers_Grievous_Injury", "Drivers_Minor_Injury",
            "Passengers_Killed", "Passengers_Grievous_Injury",
            "Passengers_Minor_Injury", "Pedestrians_Killed",
            "Pedestrians_Grievous_Injury", "Pedestrians_Minor_Injury",
            "Collision_Type", "Collision_Feature", "Weather_Condition",
            "Light_Condition", "Visibility", "Traffic_Violation"
        }
        missing = required_cols - set(df.columns)
        if missing:
            raise ValueError(f"Missing columns in Excel: {missing}")

        print("Step 3: Inserting records...")

        accidents = [
            Accident(
                accident_id                 = str(row["Accident_ID"]),
                district                    = str(row["District"]),
                police_station              = str(row["Police_Station"]),
                accident_datetime           = row["Accident_DateTime"],
                latitude                    = float(row["Latitude"]),
                longitude                   = float(row["Longitude"]),
                road_name                   = str(row["Road_Name"]),
                road_classification         = str(row["Road_Classification"]),
                severity                    = str(row["Severity"]),
                no_of_vehicles              = to_int(row["No_of_Vehicles"]),
                drivers_killed              = to_int(row["Drivers_Killed"]),
                drivers_grievous_injury     = to_int(row["Drivers_Grievous_Injury"]),
                drivers_minor_injury        = to_int(row["Drivers_Minor_Injury"]),
                passengers_killed           = to_int(row["Passengers_Killed"]),
                passengers_grievous_injury  = to_int(row["Passengers_Grievous_Injury"]),
                passengers_minor_injury     = to_int(row["Passengers_Minor_Injury"]),
                pedestrians_killed          = to_int(row["Pedestrians_Killed"]),
                pedestrians_grievous_injury = to_int(row["Pedestrians_Grievous_Injury"]),
                pedestrians_minor_injury    = to_int(row["Pedestrians_Minor_Injury"]),
                collision_type              = str(row["Collision_Type"]),
                collision_feature           = str(row["Collision_Feature"]),
                weather_condition           = str(row["Weather_Condition"]),
                light_condition             = str(row["Light_Condition"]),
                visibility                  = str(row["Visibility"]),
                traffic_violation           = str(row["Traffic_Violation"]),
            )
            for _, row in df.iterrows()
        ]

        db.add_all(accidents)
        db.commit()

        print(f"        ✅ {len(accidents)} records inserted successfully.")
        print("=" * 50)

    except FileNotFoundError as e:
        print(f"\n❌ FILE ERROR: {e}")

    except ValueError as e:
        print(f"\n❌ COLUMN ERROR: {e}")
        print("   → Check your Excel column headers match exactly.")

    except Exception as e:
        db.rollback()
        print(f"\n❌ DB ERROR: {e}")
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_accidents()