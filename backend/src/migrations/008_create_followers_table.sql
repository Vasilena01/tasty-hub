-- Create Followers table
CREATE TABLE followers (
  id SERIAL PRIMARY KEY,
  follower_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  followed_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (follower_user_id != followed_user_id)
);

-- Ensure unique follow relationships
CREATE UNIQUE INDEX idx_followers_unique ON followers(follower_user_id, followed_user_id);

-- Create indexes for queries
CREATE INDEX idx_followers_follower_user_id ON followers(follower_user_id);
CREATE INDEX idx_followers_followed_user_id ON followers(followed_user_id);
