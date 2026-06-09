# backend/app/models/accident.py

from sqlalchemy import Column, Integer, String, Float, DateTime
from app.database import Base


class Accident(Base):

    __tablename__ = "accidents"

    id = Column(Integer, primary_key=True, index=True)

    accident_id         = Column(String)          # Accident_ID
    district            = Column(String)
    police_station      = Column(String)          # Police_Station
    accident_datetime   = Column(DateTime)        # Accident_DateTime
    latitude            = Column(Float)
    longitude           = Column(Float)
    road_name           = Column(String)          # Road_Name
    road_classification = Column(String)          # Road_Classification
    severity            = Column(String)
    no_of_vehicles      = Column(Integer)         # No_of_Vehicles

    # Casualty breakdown
    drivers_killed              = Column(Integer)
    drivers_grievous_injury     = Column(Integer)
    drivers_minor_injury        = Column(Integer)
    passengers_killed           = Column(Integer)
    passengers_grievous_injury  = Column(Integer)
    passengers_minor_injury     = Column(Integer)
    pedestrians_killed          = Column(Integer)
    pedestrians_grievous_injury = Column(Integer)
    pedestrians_minor_injury    = Column(Integer)

    # Conditions
    collision_type      = Column(String)          # Collision_Type
    collision_feature   = Column(String)          # Collision_Feature
    weather_condition   = Column(String)          # Weather_Condition
    light_condition     = Column(String)          # Light_Condition
    visibility          = Column(String)
    traffic_violation   = Column(String)          # Traffic_Violation