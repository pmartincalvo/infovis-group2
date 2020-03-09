import datetime

from flask import Blueprint, request, current_app
from flask_cors import cross_origin

from app.cache import cache
from app.cluster_service import (
    clustering_request_input_validator,
    clustering_request_output_validator,
    generate_clustered_networks,
)

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

    networks, dendrogram, metadata = generate_clustered_networks(clustering_parameters)

    response_body = {
        "success": True,
        "message": "Clustering was successful.",
        "networks": networks,
        "dendrogram": dendrogram,
        "metadata": metadata,
    }

    if current_app.config["ENV"] == "DEV" and not clustering_request_output_validator.validate(response_body):
        raise Exception(f"Request output breaks the contract. {clustering_request_output_validator.errors}")

    return response_body, 200
