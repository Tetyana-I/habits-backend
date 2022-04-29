\echo 'Delete and recreate habits db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE habits;
CREATE DATABASE habits;
\connect habits

-- Execute psql commands from files
\i habits-schema.sql
\i habits-seed.sql

\echo 'Delete and recreate habits_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE habits_test;
CREATE DATABASE habits_test;
\connect habits_test

\i habits-schema.sql