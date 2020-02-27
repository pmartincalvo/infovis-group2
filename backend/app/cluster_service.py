from datetime import datetime

from cerberus import Validator
from sqlalchemy import or_
import networkx
import markov_clustering

from app.database import db
from app.models import Link

to_date = lambda datetime_string: datetime.strptime(
    datetime_string, "%Y/%m/%d"  # TODO Define time format
)
CLUSTERING_REQUEST_INPUT_SCHEMA = {
    "datetime_interval_start": {
        "type": "datetime",
        "nullable": False,
        "coerce": to_date,
    },
    "datetime_interval_end": {"type": "datetime", "nullable": False, "coerce": to_date},
    "depth": {"type": "integer", "nullable": False, "min": 0, "max": 4},
    "selected_subreddits": {"type": "set", "schema": {"type": "integer"}, "coerce": set},
}
clustering_request_input_validator = Validator(CLUSTERING_REQUEST_INPUT_SCHEMA)


def generate_clusters(clustering_parameters):
    metadata = {}

    # Get subreddit subset
    query = (
        db.session.query(Link)
        .filter(Link.post_timestamp > clustering_parameters["datetime_interval_start"])
        .filter(Link.post_timestamp < clustering_parameters["datetime_interval_end"])
    )

    if clustering_parameters["selected_subreddits"]:
        query = query.filter(
            or_(
                Link.source_subreddit_db_id.in_(
                    clustering_parameters["selected_subreddits"]
                ),
                Link.target_subreddit_db_id.in_(
                    clustering_parameters["selected_subreddits"]
                ),
            )
        )

    link_subset = query.all()

    metadata["link_count"] = len(link_subset)

    # Cluster
    network = links_to_network(link_subset)
    metadata["subreddit_count"] = network.number_of_nodes()
    clusters = compute_clusters(network)
    metadata["cluster_count"] = len(clusters)

    # If depth dictates, cluster on clusters
    depth = clustering_parameters["depth"] - 1
    while depth > 0:
        network = clusters_to_network(clusters, link_subset)
        clusters = compute_clusters(network)
        metadata["cluster_count"] = len(clusters)
        depth = depth - 1

    return clusters, metadata


def links_to_network(links):
    network = networkx.Graph()
    for link in links:
        if not network.has_node(link.source_subreddit_db_id):
            network.add_node(link.source_subreddit_db_id) #name=link.source_subreddit_name)
        if not network.has_node(link.target_subreddit_db_id):
            network.add_node(link.target_subreddit_db_id) #name=link.target_subreddit_name)

        if not network.has_edge(link.source_subreddit_db_id, link.target_subreddit_db_id):
            network.add_edge(link.source_subreddit_db_id, link.target_subreddit_db_id)

    return network

def clusters_to_network(clusters, links):
    pass


def compute_clusters(network):
    matrix = networkx.to_scipy_sparse_matrix(network)
    results = markov_clustering.run_mcl(matrix)
    clusters = markov_clustering.get_clusters(results)

    return clusters
