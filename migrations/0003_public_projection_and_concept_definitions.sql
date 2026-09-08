-- GIAR model 0.3
-- Trigger: primera proyección pública del piloto Magnanego.
-- Distingue conceptos de elementos discursivos empíricos y registra definiciones por publicación.

PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS discursive_element_profiles (
    record_id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    element_type TEXT NOT NULL,
    scope_note TEXT,
    FOREIGN KEY(record_id) REFERENCES records(id)
);
CREATE TABLE IF NOT EXISTS concept_definitions (
    id TEXT PRIMARY KEY,
    concept_record_id TEXT NOT NULL,
    publication_record_id TEXT,
    definition_kind TEXT NOT NULL,
    definition_text TEXT NOT NULL,
    attribution_text TEXT,
    bibliography_json TEXT,
    evidence_fragment_id TEXT,
    review_status TEXT NOT NULL DEFAULT 'proposed',
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(concept_record_id) REFERENCES records(id),
    FOREIGN KEY(publication_record_id) REFERENCES records(id),
    FOREIGN KEY(evidence_fragment_id) REFERENCES evidence_fragments(id)
);
CREATE INDEX IF NOT EXISTS idx_concept_definitions_concept
ON concept_definitions(concept_record_id, definition_kind);
INSERT OR IGNORE INTO discursive_element_profiles(record_id,label,element_type,scope_note)
SELECT record_id, preferred_label, 'discursive_formula',
       'Fórmula identificada en el corpus como elemento dóxico de los informes del SIPNA.'
FROM concept_profiles
WHERE record_id='27b55adb-9d27-40a3-9248-eec58147dfc5';
DELETE FROM concept_profiles
WHERE record_id='27b55adb-9d27-40a3-9248-eec58147dfc5';
UPDATE records
SET record_kind='discursive_element', updated_by='assistant',
    updated_at='2026-09-05T18:15:00Z', revision=revision+1
WHERE id='27b55adb-9d27-40a3-9248-eec58147dfc5' AND record_kind='concept';
UPDATE assertions
SET predicate_key='analyzes_discursive_element', updated_by='assistant',
    updated_at='2026-09-05T18:15:00Z', revision=revision+1
WHERE object_record_id='27b55adb-9d27-40a3-9248-eec58147dfc5' AND predicate_key='uses_concept';
