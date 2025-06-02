use  `mydb`;

DROP TABLE IF EXISTS `project_member`;
DROP TABLE IF EXISTS `person_skill`;
DROP TABLE IF EXISTS `project_skill`;
DROP TABLE IF EXISTS `project`;
DROP TABLE IF EXISTS `skill`;
DROP TABLE IF EXISTS `skill_category`;
DROP TABLE IF EXISTS `skill_group`;

CREATE TABLE `skill_group` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  `created_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

CREATE TABLE `skill_category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `group_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  FOREIGN KEY (`group_id`) REFERENCES `skill_group`(`id`),
  `created_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ;

CREATE TABLE `skill` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(500) NOT NULL,
  `category_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`),
  FOREIGN KEY (`category_id`) REFERENCES `skill_category`(`id`),
  `created_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ;

CREATE TABLE `project` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  `created_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `person_skill` (
  `id` int NOT NULL AUTO_INCREMENT,
  `person_id` varchar(145) NOT NULL,
  `skill_id` int NOT NULL,
  `proficiency` tinyint DEFAULT 1,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`skill_id`) REFERENCES `skill`(`id`),
  `created_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ;

CREATE TABLE `project_member` (
  `id` int NOT NULL AUTO_INCREMENT,
  `person_id` varchar(145) NOT NULL,
  `project_id` int NOT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  FOREIGN KEY (`project_id`) REFERENCES `project`(`id`),
  `created_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `project_skill` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `skill_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  FOREIGN KEY (`project_id`) REFERENCES `project`(`id`),
  FOREIGN KEY (`skill_id`) REFERENCES `skill`(`id`),
  `created_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ;

-- Create views

CREATE 
    
VIEW `project_skill_details` AS
    SELECT 
        `ps`.`id` AS `id`,
        `ps`.`project_id` AS `project_id`,
        `ps`.`skill_id` AS `skill_id`,
        `p`.`name` AS `project_name`,
        `s`.`name` AS `skill_name`,
        `sc`.`name` AS `category_name`,
        `sc`.`id` AS `category_id`,
        `sg`.`name` AS `group_name`,
        `sg`.`id` AS `group_id`
    FROM
        ((((`project_skill` `ps`
        LEFT JOIN `project` `p` ON ((`p`.`id` = `ps`.`project_id`)))
        LEFT JOIN `skill` `s` ON ((`s`.`id` = `ps`.`skill_id`)))
        LEFT JOIN `skill_category` `sc` ON ((`sc`.`id` = `s`.`category_id`)))
        LEFT JOIN `skill_group` `sg` ON ((`sg`.`id` = `sc`.`group_id`)));


CREATE 
   
VIEW `skill_category_details` AS
    SELECT 
        `sc`.`id` AS `id`,
        `sc`.`name` AS `name`,
        `sc`.`group_id` AS `group_id`,
        `sg`.`name` AS `group_name`
    FROM
        (`skill_category` `sc`
        LEFT JOIN `skill_group` `sg` ON (`sg`.`id` = `sc`.`group_id`));

CREATE 
  
VIEW `skill_details` AS
    SELECT 
        `s`.`id` AS `id`,
        `s`.`name` AS `skill_name`,
        `s`.`category_id` AS `category_id`,
        `sc`.`name` AS `category_name`,
        `sc`.`group_name` AS `group_name`,
        `sc`.`group_id` AS `group_id`
    FROM
        (`skill` `s`
        JOIN `skill_category_details` `sc` ON ((`sc`.`id` = `s`.`category_id`)));
        

CREATE 
   
VIEW `person_skill_details` AS
    SELECT 
        `ps`.`id` AS `id`,
        `ps`.`person_id` AS `person_id`,
        `ps`.`skill_id` AS `skill_id`,
        `ps`.`proficiency` AS `proficiency`,
        `ps`.`created_date` AS `created_date`,
        `s`.`name` AS `skill_name`,
        `sc`.`name` AS `category_name`,
        `sc`.`id` AS `category_id`,
        `sg`.`name` AS `group_name`,
        `sg`.`id` AS `group_id`
    FROM
        (((`person_skill` `ps`
        LEFT JOIN `skill` `s` ON ((`s`.`id` = `ps`.`skill_id`)))
        LEFT JOIN `skill_category` `sc` ON ((`sc`.`id` = `s`.`category_id`)))
        LEFT JOIN `skill_group` `sg` ON ((`sg`.`id` = `sc`.`group_id`)));

-- Create roles table
CREATE TABLE `role` (
                        `id` INT NOT NULL AUTO_INCREMENT,
                        `name` VARCHAR(100) NOT NULL,
                        `code` VARCHAR(50) NOT NULL,
                        PRIMARY KEY (`id`),
                        UNIQUE KEY `code_UNIQUE` (`code`)
);

-- Pre-populate roles
INSERT INTO `role` (`name`, `code`) VALUES
                                        ('Admin', 'ADMIN'),
                                        ('Project Manager', 'PM'),
                                        ('User', 'USER');

-- Create person table
CREATE TABLE `person` (
                          `id` INT NOT NULL AUTO_INCREMENT,
                          `oid` VARCHAR(255) NOT NULL UNIQUE,
                          `name` VARCHAR(255),
                          `username` VARCHAR(100),
                          `role_id` INT NOT NULL,
                          PRIMARY KEY (`id`),
                          FOREIGN KEY (`role_id`) REFERENCES `role`(`id`),
                          `created_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update person_skill: add reference to person table
ALTER TABLE `person_skill`
    ADD COLUMN `person_ref_id` INT DEFAULT NULL,
    ADD FOREIGN KEY (`person_ref_id`) REFERENCES `person`(`id`);

-- Update project_member: add reference to person table
ALTER TABLE `project_member`
    ADD COLUMN `person_ref_id` INT DEFAULT NULL,
    ADD FOREIGN KEY (`person_ref_id`) REFERENCES `person`(`id`);
