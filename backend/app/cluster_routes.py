import datetime

from flask import Blueprint, request, jsonify
from flask_cors import cross_origin

from app.database import db
from app.models import Subreddit, Link
from app.cache import cache
from app.cluster_service import clustering_request_input_validator, generate_clusters

clusters = Blueprint("clusters", __name__, url_prefix="/cluster")


@clusters.route("/", methods=["POST"])
@cross_origin()
def get_cluster():
    # Validate input
    clustering_parameters = request.json
    if not clustering_request_input_validator.validate(clustering_parameters):
        return (
            {
                "success": False,
                "message": "Bad body request.",
                "errors": clustering_request_input_validator.errors,
            },
            400,
        )
    clustering_parameters = clustering_request_input_validator.normalized(
        clustering_parameters
    )

    clusters, metadata = generate_clusters(clustering_parameters)

    return (
        {
            "success": True,
            "message": None,
            "clusters": clusters,
            "metadata": {
                "subreddit_count": metadata["subreddit_count"],
                "link_count": metadata["link_count"],
                "cluster_count": metadata["cluster_count"],
            },
        },
        200,
    )
