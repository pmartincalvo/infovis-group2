from app.app_factory import create_app
from app.config import config


app = create_app(config)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=config.API_PORT)
