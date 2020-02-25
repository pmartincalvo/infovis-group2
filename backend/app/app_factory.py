from flask import Flask
from flask_cors import CORS


from app.database import db
from app.cache import cache


def create_app(config):

    app = Flask(__name__)

    app.config["SQLALCHEMY_DATABASE_URI"] = config.SQLALCHEMY_DATABASE_URI
    db.init_app(app)

    app.config["CORS_HEADERS"] = "Content-type"
    cors = CORS(app)

    cache.init_app(app)

    from app.clusters import clusters

    app.register_blueprint(clusters)

    return app
