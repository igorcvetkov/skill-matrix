-- Add proficiency column to person_skill table
ALTER TABLE person_skill ADD COLUMN proficiency TINYINT DEFAULT 1;

-- Update existing records to have proficiency = 1 (yes)
UPDATE person_skill SET proficiency = 1 WHERE proficiency IS NULL;

-- Create or update the view for person_skill_details that includes proficiency
DROP VIEW IF EXISTS person_skill_details;
CREATE VIEW person_skill_details AS
    SELECT 
        ps.id,
        ps.person_id,
        ps.skill_id,
        ps.proficiency,
        s.name as skill_name,
        s.category_id,
        sc.name as category_name,
        sc.group_id,
        sg.name as group_name
    FROM
        person_skill ps
            JOIN
        skill s ON ps.skill_id = s.id
            JOIN
        skill_category sc ON s.category_id = sc.id
            JOIN
        skill_group sg ON sc.group_id = sg.id; 