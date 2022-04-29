-- "testuser" has the password "password"


INSERT INTO users (username, password, is_admin)
VALUES ('testuser',
        '$2b$12$P6qyNV2Hn7iKcj02WHoPTuxyXAvGml8wM3cGpBjozIcylC3ARj9ti',
        FALSE);

INSERT INTO habits (title, 
                    username,
                    habit_description,
                    streak_target,
                    max_streak,
                    attempt,
                    current_counter,
                    last_checked)

VALUES ('Exercise', 'testuser', '15min yoga morning routine, 30min walking', 30, 3, 1, 3, '2022-04-26'),
        ('Bedtime', 'testuser', 'Wake up at 8am, go to bed at 11:30pm', 66, 5, 2, 3, '2022-04-26'),
        ('Networking', 'testuser', '1 new contact, 5 comments', 30, 2, 1, 2, '2022-04-26');

