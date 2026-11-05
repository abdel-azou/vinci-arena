TRUNCATE TABLE members RESTART IDENTITY CASCADE;
TRUNCATE TABLE notification_types RESTART IDENTITY CASCADE;

INSERT INTO notification_types(name) VALUES ('Demande d''adhésion');
INSERT INTO notification_types(name) VALUES ('Refus d''adhésion');
