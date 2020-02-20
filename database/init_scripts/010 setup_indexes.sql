CREATE INDEX idx_subreddit_on_name
ON subreddit(name);

CREATE INDEX idx_link_on_post_timestamp
ON link(post_timestamp);