import os
import zipfile

from dotenv import load_dotenv

import pandas
from sqlalchemy import create_engine

load_dotenv()

POSTGRES_USER = os.getenv("POSTGRES_USER")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
DB_PORT = os.getenv("DB_PORT")
POSTGRES_DB = os.getenv("POSTGRES_DB")

pg_engine = create_engine(
    f"postgresql+psycopg2://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{'0.0.0.0'}/{POSTGRES_DB}"
)

DATA_FILES_PATH = "data/"


def insert_subreddits(files_path):

    all_subreddit_names = pandas.DataFrame()

    for file in os.listdir(files_path):
        current_file = os.path.join(DATA_FILES_PATH, file)
        zipfile_instance = zipfile.ZipFile(current_file)
        links = pandas.read_csv(
            zipfile_instance.open(zipfile_instance.namelist()[0]), delimiter="\t"
        )
        all_subreddit_names = pandas.concat([all_subreddit_names, links])

    unique_subreddit_names = pandas.unique(
        all_subreddit_names[["SOURCE_SUBREDDIT", "TARGET_SUBREDDIT"]].values.ravel("K")
    )
    unique_subreddit_names = pandas.DataFrame(unique_subreddit_names)
    unique_subreddit_names.columns = ["name"]

    unique_subreddit_names.to_sql(
        "subreddit", con=pg_engine, if_exists="append", method="multi", index=False
    )


def insert_links(files_path):

    LINK_COLUMNS_TO_KEEP = [
        "SOURCE_SUBREDDIT",
        "TARGET_SUBREDDIT",
        "POST_ID",
        "TIMESTAMP",
        "LINK_SENTIMENT",
    ]

    all_links = pandas.DataFrame()

    for file in os.listdir(files_path):
        current_file = os.path.join(DATA_FILES_PATH, file)
        zipfile_instance = zipfile.ZipFile(current_file)
        links = pandas.read_csv(
            zipfile_instance.open(zipfile_instance.namelist()[0]), delimiter="\t"
        )
        all_links = pandas.concat([all_links, links])

    all_links = all_links[LINK_COLUMNS_TO_KEEP]

    all_subreddits = pandas.read_sql_table("subreddit", pg_engine)

    all_links_one_id = pandas.merge(
        all_links,
        all_subreddits,
        how="left",
        left_on="SOURCE_SUBREDDIT",
        right_on="name",
    )
    all_links_one_id.rename(columns={"db_id": "source_subreddit_db_id"}, inplace=True)

    all_links_two_ids = pandas.merge(
        all_links_one_id,
        all_subreddits,
        how="left",
        left_on="TARGET_SUBREDDIT",
        right_on="name",
    )
    all_links_two_ids.rename(columns={"db_id": "target_subreddit_db_id"}, inplace=True)

    del all_links, all_subreddits, all_links_one_id

    all_links_two_ids.drop(
        labels=["name_x", "name_y"],
        axis=1,
        inplace=True,
    )

    MAPPING_TO_DB_NAMES = {
        "POST_ID": "post_id",
        "TIMESTAMP": "post_timestamp",
        "LINK_SENTIMENT": "post_label",
        "SOURCE_SUBREDDIT": "source_subreddit_name",
        "TARGET_SUBREDDIT": "target_subreddit_name",
    }
    all_links_two_ids.rename(columns=MAPPING_TO_DB_NAMES, inplace=True)

    all_links_two_ids.to_sql(
        "link",
        con=pg_engine,
        if_exists="append",
        method="multi",
        index=False,
        chunksize=30000,
    )


if __name__ == "__main__":

    insert_subreddits(DATA_FILES_PATH)

    insert_links(DATA_FILES_PATH)
