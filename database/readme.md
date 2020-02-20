# Reddit Link Database

## Intro

This repo contains all the required files to run a database loaded with the reddit hyperlink dataset from https://snap.stanford.edu/data/soc-RedditHyperlinks.html.

## How to run

1.  Make a .env file with the required parameters. .env-example can be used as a reference.
2.  `bash run_container.sh`
3.  Once the DB is running, you run `data_insertion.py` to load the original dataset. Be aware of the dependencies in the requirements.txt.

If you want to take down and completely delete the database, run `bash remove_container.sh`.

## Requirements

Docker
Python 3.6 + Dependencies


## Possible issues

TODO