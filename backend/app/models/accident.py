from sqlalchemy import Column, Integer, String, Float, DateTime

from app.database import Base


class Accident(Base):

    __tablename__ = "accidents"


    id = Column(
        Integer,
        primary_key=True,
        index=True
    )


    state = Column(String)

    district = Column(String)

    accident_type = Column(String)

    severity = Column(String)


    latitude = Column(Float)

    longitude = Column(Float)


    accident_date = Column(DateTime)