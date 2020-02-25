import datetime

from flask import Blueprint, request, jsonify
from flask_cors import cross_origin

from app.database import db
from app.models import Subreddit, Link
from app.cache import cache

clusters = Blueprint("clusters", __name__, url_prefix="/cluster")


@clusters.route("/", methods=["GET"])
@cross_origin()
@cache.cached(query_string=True)
def index():
    return "Hello world!"
