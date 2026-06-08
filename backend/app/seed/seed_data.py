import pandas as pd

from app.database import (
    Base,
    engine,
    SessionLocal
)

from app.models.accident import Accident



EXCEL_PATH = "data/accident_dummy_data.xlsx"



def seed_accidents():


    print("Creating tables...")

    Base.metadata.create_all(
        bind=engine
    )


    db = SessionLocal()


    try:


        existing = db.query(
            Accident
        ).count()


        if existing > 0:

            print(
                "Accident data already exists"
            )

            return



        print(
            "Reading Excel file..."
        )


        df = pd.read_excel(
            EXCEL_PATH
        )



        accidents = []


        for _,row in df.iterrows():


            accident = Accident(

                state = row["state"],

                district = row["district"],

                accident_type=row["accident_type"],

                severity=row["severity"],

                latitude=float(
                    row["latitude"]
                ),

                longitude=float(
                    row["longitude"]
                ),


                accident_date=row["accident_date"]

            )


            accidents.append(
                accident
            )



        db.add_all(
            accidents
        )


        db.commit()


        print(
            f"{len(accidents)} records inserted successfully"
        )



    except Exception as e:


        db.rollback()

        print(
            "Error:",
            e
        )



    finally:

        db.close()




if __name__=="__main__":

    seed_accidents()