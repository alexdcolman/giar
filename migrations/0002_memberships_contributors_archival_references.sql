PRAGMA foreign_keys = ON;

ALTER TABLE concept_profiles ADD COLUMN concept_kind TEXT;

CREATE TABLE IF NOT EXISTS group_memberships (
    id TEXT PRIMARY KEY,
    person_record_id TEXT NOT NULL REFERENCES records(id) ON DELETE RESTRICT,
    group_record_id TEXT NOT NULL REFERENCES records(id) ON DELETE RESTRICT,
    membership_status TEXT NOT NULL,
    valid_from TEXT,
    valid_to TEXT,
    as_of_date TEXT,
    source_id TEXT NOT NULL REFERENCES sources(id) ON DELETE RESTRICT,
    evidence_fragment_id TEXT REFERENCES evidence_fragments(id) ON DELETE RESTRICT,
    review_status TEXT NOT NULL DEFAULT 'proposed',
    note TEXT,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_group_memberships_person ON group_memberships(person_record_id);
CREATE INDEX IF NOT EXISTS ix_group_memberships_group ON group_memberships(group_record_id);

CREATE TABLE IF NOT EXISTS publication_contributors (
    id TEXT PRIMARY KEY,
    publication_record_id TEXT NOT NULL REFERENCES records(id) ON DELETE RESTRICT,
    person_record_id TEXT REFERENCES records(id) ON DELETE RESTRICT,
    display_name TEXT NOT NULL,
    contributor_role TEXT NOT NULL DEFAULT 'author',
    sort_order INTEGER NOT NULL DEFAULT 0,
    affiliation_text TEXT,
    source_id TEXT NOT NULL REFERENCES sources(id) ON DELETE RESTRICT,
    evidence_fragment_id TEXT REFERENCES evidence_fragments(id) ON DELETE RESTRICT,
    review_status TEXT NOT NULL DEFAULT 'proposed',
    created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_publication_contributors_publication ON publication_contributors(publication_record_id, sort_order);
CREATE INDEX IF NOT EXISTS ix_publication_contributors_person ON publication_contributors(person_record_id);

CREATE TABLE IF NOT EXISTS archival_references (
    id TEXT PRIMARY KEY,
    publication_record_id TEXT NOT NULL REFERENCES records(id) ON DELETE RESTRICT,
    source_id TEXT NOT NULL REFERENCES sources(id) ON DELETE RESTRICT,
    evidence_fragment_id TEXT REFERENCES evidence_fragments(id) ON DELETE RESTRICT,
    raw_reference TEXT NOT NULL,
    archive_record_id TEXT REFERENCES records(id) ON DELETE RESTRICT,
    matched_archival_unit_id TEXT REFERENCES records(id) ON DELETE RESTRICT,
    document_date TEXT,
    cited_folio TEXT,
    file_page_index INTEGER,
    occurrence_index INTEGER NOT NULL,
    normalization_status TEXT NOT NULL DEFAULT 'unresolved',
    specificity_status TEXT NOT NULL DEFAULT 'as_cited',
    parsed_json TEXT,
    interpretation_note TEXT,
    review_status TEXT NOT NULL DEFAULT 'proposed',
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(publication_record_id, occurrence_index)
);
CREATE INDEX IF NOT EXISTS ix_archival_references_publication ON archival_references(publication_record_id);
CREATE INDEX IF NOT EXISTS ix_archival_references_unit ON archival_references(matched_archival_unit_id);

INSERT OR REPLACE INTO schema_meta(key, value, updated_at)
VALUES ('model_version', '0.2', datetime('now'));
