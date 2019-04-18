CREATE TABLE IF NOT EXISTS

users(
    id SERIAL PRIMARY KEY NOT NULL, 
    search_query VARCHAR(255), 
    formatted_query VARCHAR(255), 
    latitude NUMERIC(10, 7), 
    longitude NUMERIC(10, 7)
  );