from datetime import datetime

from cerberus import Validator
from sqlalchemy import or_, func
import networkx
import markov_clustering
import community

from app.database import db
from app.models import Link

to_date = lambda datetime_string: datetime.strptime(datetime_string, "%Y-%m-%d")
CLUSTERING_REQUEST_INPUT_SCHEMA = {
    "datetime_interval_start": {
        "type": "datetime",
        "nullable": False,
        "coerce": to_date,
    },
    "datetime_interval_end": {"type": "datetime", "nullable": False, "coerce": to_date},
    "selected_subreddits": {
        "type": "set",
        "schema": {"type": "integer"},
        "coerce": set,
    },
}
clustering_request_input_validator = Validator(CLUSTERING_REQUEST_INPUT_SCHEMA)

NODE_SCHEMA = {
    "type": "dict",
    "schema": {"id": {"type": "integer"}, "name": {"type": "string"}},
}
WEIGHTED_EDGE_SCHEMA = {
    "type": "dict",
    "schema": {
        "origin_node_id": {"type": "integer"},
        "destination_node_id": {"type": "integer"},
        "weight": {"type": "integer"},
    },
}

SENTIMENT_EDGE_SCHEMA = {
    "type": "dict",
    "schema": {
        "origin_node_id": {"type": "integer"},
        "destination_node_id": {"type": "integer"},
        "mean_sentiment": {"type": "float"},
        "weight": {"type": "integer"},
    },
}

NETWORK_SCHEMA = {
    "nodes": {"type": "list", "schema": NODE_SCHEMA},
    "weight_edges": {"type": "list", "schema": WEIGHTED_EDGE_SCHEMA},
    "sentiment_edges": {"type": "list", "schema": SENTIMENT_EDGE_SCHEMA},
}
CLUSTERING_REQUEST_OUTPUT_SCHEMA = {
    "success": {"type": "boolean", "nullable": False},
    "message": {"type": "string"},
    "networks": {
        "type": "dict",
        "schema": {
            0: {"type": "dict", "schema": NETWORK_SCHEMA, "nullable": False},
            1: {"type": "dict", "schema": NETWORK_SCHEMA, "nullable": True},
            2: {"type": "dict", "schema": NETWORK_SCHEMA, "nullable": True},
            3: {"type": "dict", "schema": NETWORK_SCHEMA, "nullable": True},
            4: {"type": "dict", "schema": NETWORK_SCHEMA, "nullable": True},
            5: {"type": "dict", "schema": NETWORK_SCHEMA, "nullable": True},
            6: {"type": "dict", "schema": NETWORK_SCHEMA, "nullable": True},
        },
        "nullable": False,
    },
    "dendrogram": {"type": "list", "nullable": False},
    "metadata": {
        "type": "dict",
        "schema": {
            "subreddit_count": {"type": "integer"},
            "network_levels": {"type": "integer"},
            "link_count": {"type": "integer"},
        },
        "nullable": False,
    },
}
clustering_request_output_validator = Validator(CLUSTERING_REQUEST_OUTPUT_SCHEMA)


def generate_clustered_networks(clustering_parameters):
    metadata = {}

    # Get subreddit subset
    query = (
        db.session.query(
            Link.source_subreddit_db_id,
            Link.target_subreddit_db_id,
            Link.source_subreddit_name,
            Link.target_subreddit_name,
            func.count(Link.source_subreddit_db_id).label("weight"),
            func.avg(Link.post_label).label("mean_sentiment"),
        )
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

    query = query.group_by(Link.source_subreddit_db_id, Link.target_subreddit_db_id)
    query = query.having(func.count(Link.source_subreddit_db_id).label("weight") > 5)

    link_subset = query.all()

    metadata["link_count"] = len(link_subset)

    # Cluster
    weight_network = links_to_weight_network(link_subset)
    sentiment_network = links_to_sentiment_network(link_subset)
    metadata["subreddit_count"] = weight_network.number_of_nodes()
    clustered_networks, dendogram = compute_clustered_networks(weight_network)
    metadata["network_levels"] = len(clustered_networks)

    return clustered_networks, dendogram, metadata


def links_to_weight_network(links):
    network = networkx.Graph()
    for link in links:
        network.add_edge(
            link.source_subreddit_db_id, link.target_subreddit_db_id, weight=link.weight
        )

    return network


def links_to_sentiment_network(links):
    network = networkx.DiGraph()
    for link in links:
        network.add_edge(
            link.source_subreddit_db_id,
            link.target_subreddit_db_id,
            weight=link.weight,
            sentiment=link.mean_sentiment,
        )

    return network


def compute_clustered_networks(original_network):
    dendrogram = community.generate_dendrogram(original_network)
    clustered_networks = {0: network_to_custom_format(original_network)}
    for level in range(len(dendrogram) - 1):
        partition = community.partition_at_level(dendrogram, level)
        current_network = community.induced_graph(partition, original_network)
        clustered_networks[level + 1] = network_to_custom_format(current_network)
    return clustered_networks, dendrogram


def network_to_custom_format(network):
    temp_edges = list(networkx.to_edgelist(network))
    edges = []
    for edge in temp_edges:
        edges.append(
            {
                "origin_node_id": edge[0],
                "destination_node_id": edge[1],
                "weight": edge[2]["weight"],
            }
        )

    temp_nodes = list(network.nodes)
    nodes = []
    for node in temp_nodes:
        nodes.append({"id": node, "name": ""})
    return {"nodes": nodes, "weight_edges": edges}


def sentiment_graph_for_cluster(network_to_add_sentiment, inferior_level_network, dendrogram_relation):
    for edge in network_to_add_sentiment:
        # Grab all subreddits for both nodes using dendrogram relation and inferior network
        # Aggregate mean sentiment and directed weight
        # Give back the edges
        pass
