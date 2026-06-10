
DROP VIEW  IF EXISTS vue_taux_global_projet   CASCADE;
DROP VIEW  IF EXISTS vue_avancement_dossiers  CASCADE;
DROP TABLE IF EXISTS alerte                   CASCADE;
DROP TABLE IF EXISTS tache                    CASCADE;
DROP TABLE IF EXISTS dossier                  CASCADE;
DROP TABLE IF EXISTS utilisateur              CASCADE;
DROP TABLE IF EXISTS instance                 CASCADE;

DROP TYPE IF EXISTS role_sys_enum             CASCADE;
DROP TYPE IF EXISTS statut_dossier_enum       CASCADE;
DROP TYPE IF EXISTS statut_tache_enum         CASCADE;
DROP TYPE IF EXISTS role_intervention_enum    CASCADE;
DROP TYPE IF EXISTS statut_utilisateur_enum   CASCADE;


CREATE TYPE role_sys           AS ENUM ('admin', 'directeur', 'agent');
CREATE TYPE statut_dossier     AS ENUM ('en_cours', 'boucle');
CREATE TYPE statut_tache       AS ENUM ('a_faire', 'en_cours', 'termine');
CREATE TYPE role_intervention  AS ENUM ('rapporteur', 'contributeur', 'validateur', 'suivi_evaluateur');
CREATE TYPE user_status AS ENUM ('actif', 'inactif', 'suspendu');


CREATE TABLE instance (
    id  SERIAL       PRIMARY KEY,
    nom          VARCHAR(100) NOT NULL,
    date_reunion DATE         NOT NULL,
    description  TEXT
);


CREATE TABLE user (
    id          SERIAL      PRIMARY KEY,
    nom              VARCHAR(50)  NOT NULL,
    prenom           VARCHAR(50)  NOT NULL,
    email            VARCHAR(100) UNIQUE NOT NULL,
    mdp     VARCHAR(255) NOT NULL,
    poste  VARCHAR(100) NOT NULL,
    role_dir role_sys DEFAULT 'agent',
    statut           user_status DEFAULT 'actif',
    date_creation    TIMESTAMP               DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE dossier (
    id       SERIAL       PRIMARY KEY,
    titre            VARCHAR(150) NOT NULL,
    description      TEXT,
    date_creation    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    date_limite      DATE         NOT NULL,
    date_fin_reelle  DATE,
    statut           statut_dossier DEFAULT 'en_cours',
    id_instance      INT REFERENCES instance(id),
    CONSTRAINT chk_dossier_date_limite CHECK (date_limite > date_creation::DATE),
    CONSTRAINT chk_dossier_date_fin_reelle CHECK (date_fin_reelle IS NULL OR date_fin_reelle >= date_creation::DATE)
);

CREATE TABLE tache (
    id_tache              SERIAL       PRIMARY KEY,
    libelle               VARCHAR(150) NOT NULL,
    date_creation         TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    date_debut            DATE,
    date_fin_prevue       DATE,
    avancement            INT          DEFAULT 0 CHECK (avancement >= 0 AND avancement <= 100),
    statut                statut_tache       DEFAULT 'a_faire',
    id_dossier            INT NOT NULL REFERENCES dossier(id),
    id_intervenant        INT NOT NULL, REFERENCES user(id)
    CONSTRAINT chk_tache_dates
        CHECK (
            date_debut      IS NULL OR
            date_fin_prevue IS NULL OR
            date_debut <= date_fin_prevue
        )
);


CREATE TABLE alerte (
    id       SERIAL    PRIMARY KEY,
    message         TEXT      NOT NULL,
    date_creation   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut_lecture  BOOLEAN   DEFAULT FALSE,
    id_dossier      INT NOT NULL REFERENCES dossier(id),
    id_destinataire INT NOT NULL REFERENCES user(id),
);


CREATE VIEW vue_avancement_dossiers AS
SELECT
    d.id,
    d.titre AS titre_dossier,
    d.statut,
    d.date_limite,
    COALESCE(ROUND(AVG(t.avancement), 2), 0)        AS taux_mise_en_oeuvre,
    CASE
        WHEN d.statut = 'en_cours' AND d.date_limite < CURRENT_DATE THEN 'en retard'
        WHEN d.statut = 'boucle'                                    THEN 'terminé'
        ELSE                                                              'à jour'
    END                                             AS alerte_suivi
FROM dossier d
LEFT JOIN tache t ON d.id_dossier = t.id_dossier
GROUP BY d.id_dossier, d.titre, d.statut, d.date_limite;


CREATE VIEW vue_taux_global_projet AS
SELECT
    COUNT(DISTINCT id_dossier)              AS total_dossiers,
    COALESCE(ROUND(AVG(avancement), 2), 0)  AS taux_global_execution
FROM tache;


CREATE INDEX idx_dossier_instance    ON dossier(id);
CREATE INDEX idx_dossier_statut      ON dossier(statut);
CREATE INDEX idx_dossier_date_limite ON dossier(date_limite);
CREATE INDEX idx_tache_dossier       ON tache(id);
CREATE INDEX idx_tache_intervenant   ON tache(id);
CREATE INDEX idx_alerte_dossier      ON alerte(id);
CREATE INDEX idx_alerte_destinataire ON alerte(id);