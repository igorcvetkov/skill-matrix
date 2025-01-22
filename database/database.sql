DROP TABLE IF EXISTS `skill`;
DROP TABLE IF EXISTS `project_member`;
DROP TABLE IF EXISTS `project`;
DROP TABLE IF EXISTS `skill_category`;
DROP TABLE IF EXISTS `skill_group`;
DROP TABLE IF EXISTS `person_skill`;
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
  `category` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
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