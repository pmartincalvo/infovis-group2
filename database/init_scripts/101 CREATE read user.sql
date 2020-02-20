CREATE USER reader with encrypted password 'redditisgoodbutbeerisbetter';
GRANT CONNECT ON DATABASE links TO reader;
GRANT USAGE ON SCHEMA public TO reader;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO reader;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO reader;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO reader;
