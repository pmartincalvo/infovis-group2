import os

from dotenv import load_dotenv

load_dotenv()


class Config:
    ENV = os.environ["FLASK_ENV"]

    DB_HOST = os.environ["DB_HOST"]
    DB_USER = os.environ["DB_USER"]
    DB_PASS = os.environ["DB_PASS"]
    DB_PORT = os.environ["DB_PORT"]
    DB_DATABASE = os.environ["DB_DATABASE"]
    SQLALCHEMY_DATABASE_URI = (
        f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_DATABASE}"
    )
    API_PORT = os.environ["API_PORT"]
    PROFILE = True


config = Config()
