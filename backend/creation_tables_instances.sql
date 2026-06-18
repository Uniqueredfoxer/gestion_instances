

CREATE TYPE role_sys           AS ENUM ('admin', 'directeur', 'manager', 'intervenant');
CREATE TYPE statut_dossier     AS ENUM ('en_cours', 'boucle');
CREATE TYPE statut_tache       AS ENUM ('a_faire', 'en_cours', 'termine');
CREATE TYPE role_intervention  AS ENUM ('rapporteur', 'contributeur', 'validateur', 'suivi_evaluateur');
CREATE TYPE user_status        AS ENUM ('actif', 'inactif', 'suspendu');
CREATE TYPE statu_validation   AS ENUM ('en_attente', 'approuvee', 'rejetee');

CREATE TABLE IF NOT EXISTS instances(
    id           SERIAL       PRIMARY KEY,
    nom          VARCHAR(100) NOT NULL,
    date_reunion DATE         NOT NULL,
    description  TEXT
);


CREATE TABLE IF NOT EXISTS users(
    id                  SERIAL          PRIMARY KEY,
    nom                 VARCHAR(50)     NOT NULL,
    prenom              VARCHAR(50)     NOT NULL,
    email               VARCHAR(100)    UNIQUE NOT NULL,
    mdp                 VARCHAR(255)    NOT NULL,
    poste               VARCHAR(100)    NOT NULL,
    role_dir            role_sys        DEFAULT 'intervenant',
    statut              user_status DEFAULT 'actif',
    date_creation       TIMESTAMP               DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS dossiers(
    id       SERIAL       PRIMARY KEY,
    titre            VARCHAR(150) NOT NULL,
    description      TEXT,
    cree_par INT REFERENCES users(id);
    date_creation    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    date_limite      DATE         NOT NULL,
    date_fin_reelle  DATE,
    statut           statut_dossier DEFAULT 'en_cours',
    id_instance      INT REFERENCES instance(id),
    CONSTRAINT chk_dossier_date_limite CHECK (date_limite > date_creation::DATE),
    CONSTRAINT chk_dossier_date_fin_reelle CHECK (date_fin_reelle IS NULL OR date_fin_reelle >= date_creation::DATE)
);

CREATE TABLE IF NOT EXISTS taches(
    id                      SERIAL       PRIMARY KEY,
    libelle                 VARCHAR(150) NOT NULL,
    date_creation           TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    date_debut              DATE,
    date_fin_prevue         DATE,
    avancement              INT          DEFAULT 0 CHECK (avancement >= 0 AND avancement <= 100),
    statut                  statut_tache DEFAULT 'a_faire',
    id_dossier              INT NOT NULL REFERENCES dossiers(id),
    id_intervenant          INT NOT NULL REFERENCES users(id),--sera enlevee car une relation one-many
    cree_par                INT REFERENCES users(id),
    necessite_validation    BOOLEAN DEFAULT TRUE,
    valide_par              INT REFERENCES users(id),
    validee_le               TIMESTAMP,
    demande_validation_le   TIMESTAMP,
    demande_validation_par  INT REFERENCES users(id),
    CONSTRAINT chk_tache_dates
        CHECK (
            date_debut      IS NULL OR
            date_fin_prevue IS NULL OR
            date_debut <= date_fin_prevue
        )
);


CREATE TABLE IF NOT EXISTS alertes (
    id       SERIAL    PRIMARY KEY,
    message         TEXT      NOT NULL,
    date_creation   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read  BOOLEAN   DEFAULT FALSE,
    id_dossier      INT NOT NULL REFERENCES dossiers(id),
    id_destinataire INT NOT NULL REFERENCES users(id)
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
FROM dossiers d
LEFT JOIN tache t ON d.id = t.id_dossier
GROUP BY d.id, d.titre, d.statut, d.date_limite;


CREATE VIEW vue_taux_global_projet AS
SELECT
    COUNT(DISTINCT id)                      AS total_dossiers,
    COALESCE(ROUND(AVG(avancement), 2), 0)  AS taux_global_execution
FROM taches;


CREATE TABLE IF NOT EXISTS demandes_validation (
    id SERIAL PRIMARY KEY,
    id_tache INT REFERENCES tache(id) ON DELETE CASCADE,
    demandee_par INT REFERENCES users(id),
    demandee_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut VARCHAR(20) DEFAULT 'en_attente',
    traitee_par INT REFERENCES users(id),
    traitee_le TIMESTAMP,
    commentaires TEXT
);

DROP INDEX idx_dossier_instance;
DROP INDEX idx_dossier_statut;     
DROP INDEX idx_dossier_date_limite;
DROP INDEX idx_tache_dossier;
DROP INDEX idx_tache_intervenant;
DROP INDEX idx_alerte_dossier;
DROP INDEX idx_alerte_destinataire;

CREATE INDEX IF NOT EXISTS idx_dossier_instance    ON dossiers(id_instance);
CREATE INDEX IF NOT EXISTS idx_dossier_statut      ON dossiers(statut);
CREATE INDEX IF NOT EXISTS idx_dossier_date_limite ON dossiers(date_limite);
CREATE INDEX IF NOT EXISTS idx_tache_dossier       ON taches(id_dossier);
CREATE INDEX IF NOT EXISTS idx_tache_intervenant   ON taches(id_internant);
CREATE INDEX IF NOT EXISTS idx_alerte_dossier      ON alertes(id_dossier);
CREATE INDEX IF NOT EXISTS idx_alerte_destinataire ON alertes(id_destinataire);

