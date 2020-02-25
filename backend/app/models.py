from sqlalchemy import Column, Integer, String, DateTime, Date
from sqlalchemy.ext.declarative import declarative_base


Base = declarative_base()


class Subreddit(Base):
    __tablename__ = "subreddit"

    db_id = Column(Integer, primary_key=True)

    #TODO Implement columns

class Link(Base):
    __tablename__ = "link"

    db_id = Column(Integer, primary_key=True)

    #TODO Implement columns
    #TODO Implement foreign key with subreddit


