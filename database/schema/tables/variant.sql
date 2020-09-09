DROP TABLE IF EXISTS ${table_name};
CREATE TABLE IF NOT EXISTS ${table_name} (
    id BIGINT AUTO_INCREMENT NOT NULL,
    chromosome INTEGER NOT NULL,
    position int NOT NULL,
    snp varchar(200) NOT NULL,
    allele_reference varchar(200) NULL,
    allele_alternate varchar(200) NULL,
    allele_reference_frequency double NULL,
    p_value double NULL,
    p_value_nlog double NULL,
    p_value_nlog_expected double NULL,
    p_value_heterogenous double NULL,
    beta double NULL,
    standard_error double NULL,
    odds_ratio double NULL,
    ci_95_low double NULL,
    ci_95_high double NULL,
    n int NULL,
    show_qq_plot BOOLEAN NULL,
    PRIMARY KEY (id, chromosome)
) PARTITION BY list(chromosome) (
    PARTITION `${table_name_suffix}_1` VALUES IN (1),
    PARTITION `${table_name_suffix}_2` VALUES IN (2),
    PARTITION `${table_name_suffix}_3` VALUES IN (3),
    PARTITION `${table_name_suffix}_4` VALUES IN (4),
    PARTITION `${table_name_suffix}_5` VALUES IN (5),
    PARTITION `${table_name_suffix}_6` VALUES IN (6),
    PARTITION `${table_name_suffix}_7` VALUES IN (7),
    PARTITION `${table_name_suffix}_8` VALUES IN (8),
    PARTITION `${table_name_suffix}_9` VALUES IN (9),
    PARTITION `${table_name_suffix}_10` VALUES IN (10),
    PARTITION `${table_name_suffix}_11` VALUES IN (11),
    PARTITION `${table_name_suffix}_12` VALUES IN (12),
    PARTITION `${table_name_suffix}_13` VALUES IN (13),
    PARTITION `${table_name_suffix}_14` VALUES IN (14),
    PARTITION `${table_name_suffix}_15` VALUES IN (15),
    PARTITION `${table_name_suffix}_16` VALUES IN (16),
    PARTITION `${table_name_suffix}_17` VALUES IN (17),
    PARTITION `${table_name_suffix}_18` VALUES IN (18),
    PARTITION `${table_name_suffix}_19` VALUES IN (19),
    PARTITION `${table_name_suffix}_20` VALUES IN (20),
    PARTITION `${table_name_suffix}_21` VALUES IN (21),
    PARTITION `${table_name_suffix}_22` VALUES IN (22),
    PARTITION `${table_name_suffix}_23` VALUES IN (23),
    PARTITION `${table_name_suffix}_24` VALUES IN (24)
);