CREATE TABLE link (
    db_id SERIAL PRIMARY KEY,
    post_id VARCHAR(50) NOT NULL,
    post_timestamp TIMESTAMP NOT NULL,
    source_subreddit_db_id INT NOT NULL,
    target_subreddit_db_id INT NOT NULL,
    post_label smallint NOT NULL
);
