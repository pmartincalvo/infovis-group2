# Reddit Clustering API

This API connects to the reddit links database and enables cluster generation based on time intervals and subreddit selections.

## How to run
From the backend folder:
1. Create a python virtual venv `python3 -m venv venv`.
2. Jump in `. venv/bin/activate`
3. Install requirements `pip3 install -r requirements.txt`
3. Copy `.env-example` into a `.env` file and fill the fields. DB fields should be coherent with where the DB is deployed. API port should be 5000.
4. Run the entrypoint with `python3 run.py`.

## Dependencies

*  Python 3.6+ and dependencies in requirements.txt
