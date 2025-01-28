DROP TABLE IF EXISTS `project_member`;
DROP TABLE IF EXISTS `project`;
DROP TABLE IF EXISTS `person_skill`;
DROP TABLE IF EXISTS `skill`;
DROP TABLE IF EXISTS `skill_category`;
DROP TABLE IF EXISTS `skill_group`;
DROP TABLE IF EXISTS `project_skill`;

CREATE TABLE `skill_group` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`),
  UNIQUE KEY `id_UNIQUE` (`id`)
);

CREATE TABLE `skill_category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `group_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  FOREIGN KEY (`group_id`) REFERENCES `skill_group`(`id`)
) ;

CREATE TABLE `skill` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `category_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`),
  FOREIGN KEY (`category_id`) REFERENCES `skill_category`(`id`)
) ;

CREATE TABLE `project` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`),
  UNIQUE KEY `id_UNIQUE` (`id`)
);

CREATE TABLE `person_skill` (
  `id` int NOT NULL AUTO_INCREMENT,
  `person_id` varchar(145) NOT NULL,
  `skill_id` int NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`skill_id`) REFERENCES `skill`(`id`)
) ;

CREATE TABLE `project_member` (
  `id` int NOT NULL AUTO_INCREMENT,
  `person_id` varchar(145) NOT NULL,
  `project_id` int NOT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  FOREIGN KEY (`project_id`) REFERENCES `project`(`id`)
);

CREATE TABLE `project_skill` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `skill_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  FOREIGN KEY (`project_id`) REFERENCES `project`(`id`),
  FOREIGN KEY (`skill_id`) REFERENCES `skill`(`id`)
) ;

-- Create views

CREATE 
    ALGORITHM = UNDEFINED 
    DEFINER = `root`@`localhost` 
    SQL SECURITY DEFINER
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
    ALGORITHM = UNDEFINED 
    DEFINER = `root`@`localhost` 
    SQL SECURITY DEFINER
VIEW `skill_category_details` AS
    SELECT 
        `sc`.`id` AS `id`,
        `sc`.`name` AS `name`,
        `sc`.`group_id` AS `group_id`,
        `sg`.`name` AS `group_name`
    FROM
        (`skill_category` `sc`
        LEFT JOIN `skill_group` `sg` ON (`sg`.`id` = `sc`.`group_id`));
        