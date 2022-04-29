CREATE TABLE users (
  username VARCHAR(25) PRIMARY KEY,
  password TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE habits (
  id SERIAL PRIMARY KEY,
  username VARCHAR(25)
    REFERENCES users ON DELETE CASCADE,
  title VARCHAR(50) NOT NULL,
  habit_description TEXT,
  streak_target INTEGER DEFAULT 66,
  max_streak INTEGER DEFAULT 0,
  attempt INTEGER DEFAULT 0,
  current_counter INTEGER DEFAULT 0, 
  last_checked DATE 
);

