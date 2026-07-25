-- Users
INSERT INTO users (email, password_hash, name) VALUES
('alice@flowboard.com', '$2b$10$kQJ4B3vEXIAPjQkY2qI0deBdp/ZASZRsuKCjR34sESAegRy3AtBLe', 'Alice Nakamura'),
('ben@flowboard.com', '$2b$10$kQJ4B3vEXIAPjQkY2qI0deBdp/ZASZRsuKCjR34sESAegRy3AtBLe', 'Ben Torres'),
('carla@flowboard.com', '$2b$10$kQJ4B3vEXIAPjQkY2qI0deBdp/ZASZRsuKCjR34sESAegRy3AtBLe', 'Carla Jensen'),
('devon@flowboard.com', '$2b$10$kQJ4B3vEXIAPjQkY2qI0deBdp/ZASZRsuKCjR34sESAegRy3AtBLe', 'Devon Cole');

-- Workspace (owned by Alice)
INSERT INTO workspaces (name, owner_id) VALUES
('Bluefin Studio', (SELECT id FROM users WHERE email = 'alice@flowboard.com'));

-- Workspace members (Alice as owner, others as members)
INSERT INTO workspace_members (workspace_id, user_id, role)
SELECT w.id, u.id, CASE WHEN u.email = 'alice@flowboard.com' THEN 'owner' ELSE 'member' END
FROM workspaces w, users u
WHERE w.name = 'Bluefin Studio'
AND u.email IN ('alice@flowboard.com', 'ben@flowboard.com', 'carla@flowboard.com', 'devon@flowboard.com');

-- Projects
INSERT INTO projects (workspace_id, name, description)
SELECT id, 'Website Redesign', 'Refresh the marketing site for Q3 launch'
FROM workspaces WHERE name = 'Bluefin Studio';

INSERT INTO projects (workspace_id, name, description)
SELECT id, 'Mobile App v2', 'Second major release of the mobile app'
FROM workspaces WHERE name = 'Bluefin Studio';

-- Tasks for "Website Redesign"
INSERT INTO tasks (project_id, title, description, status, assignee_id)
SELECT p.id, 'Design new homepage', 'Create wireframes and high-fidelity mockups', 'done',
  (SELECT id FROM users WHERE email = 'carla@flowboard.com')
FROM projects p WHERE p.name = 'Website Redesign';

INSERT INTO tasks (project_id, title, description, status, assignee_id)
SELECT p.id, 'Build responsive nav bar', 'Mobile-friendly navigation component', 'in_progress',
  (SELECT id FROM users WHERE email = 'ben@flowboard.com')
FROM projects p WHERE p.name = 'Website Redesign';

INSERT INTO tasks (project_id, title, description, status, assignee_id)
SELECT p.id, 'Write new copy for About page', 'Updated company story and mission', 'todo',
  (SELECT id FROM users WHERE email = 'devon@flowboard.com')
FROM projects p WHERE p.name = 'Website Redesign';

INSERT INTO tasks (project_id, title, description, status, assignee_id)
SELECT p.id, 'Set up analytics tracking', 'Google Analytics + event tracking', 'todo', NULL
FROM projects p WHERE p.name = 'Website Redesign';

-- Tasks for "Mobile App v2"
INSERT INTO tasks (project_id, title, description, status, assignee_id)
SELECT p.id, 'Implement push notifications', 'iOS and Android notification support', 'in_progress',
  (SELECT id FROM users WHERE email = 'ben@flowboard.com')
FROM projects p WHERE p.name = 'Mobile App v2';

INSERT INTO tasks (project_id, title, description, status, assignee_id)
SELECT p.id, 'Fix login crash on Android 14', 'Reported by several beta testers', 'todo',
  (SELECT id FROM users WHERE email = 'carla@flowboard.com')
FROM projects p WHERE p.name = 'Mobile App v2';

INSERT INTO tasks (project_id, title, description, status, assignee_id)
SELECT p.id, 'App store screenshots', 'New screenshots for the v2 listing', 'done',
  (SELECT id FROM users WHERE email = 'alice@flowboard.com')
FROM projects p WHERE p.name = 'Mobile App v2';