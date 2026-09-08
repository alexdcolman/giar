PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS batches (
    id TEXT PRIMARY KEY,
    received_at TEXT NOT NULL,
    supplied_by TEXT,
    note TEXT,
    manifest_sha256 TEXT,
    status TEXT NOT NULL DEFAULT 'received',
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS batch_items (
    id TEXT PRIMARY KEY,
    batch_id TEXT NOT NULL REFERENCES batches(id) ON DELETE RESTRICT,
    item_key TEXT NOT NULL,
    source_kind_hint TEXT,
    original_name TEXT,
    source_url TEXT,
    content_sha256 TEXT,
    status TEXT NOT NULL DEFAULT 'received',
    note TEXT,
    UNIQUE(batch_id, item_key)
);

CREATE TABLE IF NOT EXISTS records (
    id TEXT PRIMARY KEY,
    record_kind TEXT NOT NULL,
    review_status TEXT NOT NULL DEFAULT 'proposed',
    lifecycle_status TEXT NOT NULL DEFAULT 'active',
    public_status TEXT NOT NULL DEFAULT 'internal',
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_by TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    revision INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS sources (
    id TEXT PRIMARY KEY,
    record_id TEXT REFERENCES records(id) ON DELETE RESTRICT,
    source_kind TEXT NOT NULL,
    title TEXT NOT NULL,
    bibliographic_citation TEXT,
    source_url TEXT,
    availability_status TEXT NOT NULL DEFAULT 'complete',
    supplied_by TEXT,
    acquired_at TEXT,
    rights_note TEXT,
    review_status TEXT NOT NULL DEFAULT 'proposed',
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS source_files (
    id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL REFERENCES sources(id) ON DELETE RESTRICT,
    original_filename TEXT,
    local_path TEXT,
    media_type TEXT,
    sha256 TEXT NOT NULL,
    byte_size INTEGER,
    page_count INTEGER,
    representation_note TEXT,
    created_at TEXT NOT NULL,
    UNIQUE(sha256)
);

CREATE TABLE IF NOT EXISTS source_readings (
    id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL REFERENCES sources(id) ON DELETE RESTRICT,
    source_file_id TEXT REFERENCES source_files(id) ON DELETE RESTRICT,
    reading_status TEXT NOT NULL,
    reader TEXT NOT NULL,
    coverage_note TEXT,
    limitation_note TEXT,
    started_at TEXT,
    completed_at TEXT,
    source_sha256 TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS evidence_fragments (
    id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL REFERENCES sources(id) ON DELETE RESTRICT,
    source_file_id TEXT REFERENCES source_files(id) ON DELETE RESTRICT,
    page_label TEXT,
    file_page_index INTEGER,
    section_label TEXT,
    paragraph_label TEXT,
    time_start_seconds REAL,
    time_end_seconds REAL,
    char_start INTEGER,
    char_end INTEGER,
    locator_quality TEXT NOT NULL DEFAULT 'exact',
    locator_note TEXT,
    excerpt TEXT,
    excerpt_sha256 TEXT,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL,
    review_status TEXT NOT NULL DEFAULT 'proposed'
);

CREATE TABLE IF NOT EXISTS record_names (
    id TEXT PRIMARY KEY,
    record_id TEXT NOT NULL REFERENCES records(id) ON DELETE RESTRICT,
    value TEXT NOT NULL,
    normalized_value TEXT NOT NULL,
    name_type TEXT NOT NULL DEFAULT 'variant',
    language TEXT,
    valid_from TEXT,
    valid_to TEXT,
    temporal_note TEXT,
    evidence_fragment_id TEXT REFERENCES evidence_fragments(id) ON DELETE RESTRICT,
    review_status TEXT NOT NULL DEFAULT 'proposed',
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_record_names_normalized ON record_names(normalized_value);

CREATE TABLE IF NOT EXISTS authority_profiles (
    record_id TEXT PRIMARY KEY REFERENCES records(id) ON DELETE RESTRICT,
    structural_type TEXT NOT NULL,
    description TEXT,
    temporal_expression TEXT,
    temporal_start TEXT,
    temporal_end TEXT,
    temporal_precision TEXT,
    temporal_approximate INTEGER NOT NULL DEFAULT 0,
    temporal_note TEXT,
    profile_json TEXT
);

CREATE TABLE IF NOT EXISTS publication_profiles (
    record_id TEXT PRIMARY KEY REFERENCES records(id) ON DELETE RESTRICT,
    publication_type TEXT,
    title TEXT NOT NULL,
    subtitle TEXT,
    year INTEGER,
    doi TEXT,
    language TEXT,
    container_title TEXT,
    volume TEXT,
    issue TEXT,
    pages TEXT,
    publisher TEXT,
    bibliographic_note TEXT
);
CREATE INDEX IF NOT EXISTS ix_publication_doi ON publication_profiles(doi);

CREATE TABLE IF NOT EXISTS research_project_profiles (
    record_id TEXT PRIMARY KEY REFERENCES records(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    project_code TEXT,
    funding_reference TEXT,
    temporal_expression TEXT,
    temporal_start TEXT,
    temporal_end TEXT,
    description TEXT
);

CREATE TABLE IF NOT EXISTS concept_profiles (
    record_id TEXT PRIMARY KEY REFERENCES records(id) ON DELETE RESTRICT,
    preferred_label TEXT NOT NULL,
    language TEXT,
    scope_note TEXT
);
CREATE INDEX IF NOT EXISTS ix_concept_label ON concept_profiles(preferred_label);

CREATE TABLE IF NOT EXISTS topic_profiles (
    record_id TEXT PRIMARY KEY REFERENCES records(id) ON DELETE RESTRICT,
    label TEXT NOT NULL,
    scope_note TEXT
);

CREATE TABLE IF NOT EXISTS archival_unit_profiles (
    record_id TEXT PRIMARY KEY REFERENCES records(id) ON DELETE RESTRICT,
    parent_record_id TEXT REFERENCES records(id) ON DELETE RESTRICT,
    level_key TEXT NOT NULL,
    reference_code TEXT,
    title TEXT NOT NULL,
    registration_status TEXT NOT NULL DEFAULT 'incomplete',
    completion_confirmed INTEGER NOT NULL DEFAULT 0,
    hierarchy_evidence_id TEXT REFERENCES evidence_fragments(id) ON DELETE RESTRICT,
    description_json TEXT
);
CREATE INDEX IF NOT EXISTS ix_archival_unit_parent ON archival_unit_profiles(parent_record_id);

CREATE TABLE IF NOT EXISTS assertions (
    id TEXT PRIMARY KEY,
    subject_record_id TEXT NOT NULL REFERENCES records(id) ON DELETE RESTRICT,
    predicate_key TEXT NOT NULL,
    object_record_id TEXT REFERENCES records(id) ON DELETE RESTRICT,
    object_value_json TEXT,
    assertion_type TEXT NOT NULL,
    epistemic_layer TEXT NOT NULL,
    asserted_by_record_id TEXT REFERENCES records(id) ON DELETE RESTRICT,
    source_id TEXT NOT NULL REFERENCES sources(id) ON DELETE RESTRICT,
    certainty_status TEXT NOT NULL DEFAULT 'explicit',
    review_status TEXT NOT NULL DEFAULT 'proposed',
    lifecycle_status TEXT NOT NULL DEFAULT 'active',
    batch_item_id TEXT REFERENCES batch_items(id) ON DELETE RESTRICT,
    note TEXT,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_by TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    revision INTEGER NOT NULL DEFAULT 1,
    CHECK ((object_record_id IS NOT NULL AND object_value_json IS NULL) OR
           (object_record_id IS NULL AND object_value_json IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS ix_assertions_subject ON assertions(subject_record_id);
CREATE INDEX IF NOT EXISTS ix_assertions_object_record ON assertions(object_record_id);
CREATE INDEX IF NOT EXISTS ix_assertions_predicate ON assertions(predicate_key);
CREATE INDEX IF NOT EXISTS ix_assertions_source ON assertions(source_id);

CREATE TABLE IF NOT EXISTS assertion_evidence (
    id TEXT PRIMARY KEY,
    assertion_id TEXT NOT NULL REFERENCES assertions(id) ON DELETE RESTRICT,
    evidence_fragment_id TEXT NOT NULL REFERENCES evidence_fragments(id) ON DELETE RESTRICT,
    support_role TEXT NOT NULL DEFAULT 'supports',
    review_status TEXT NOT NULL DEFAULT 'proposed',
    created_at TEXT NOT NULL,
    UNIQUE(assertion_id, evidence_fragment_id, support_role)
);

CREATE TABLE IF NOT EXISTS assertion_dependencies (
    id TEXT PRIMARY KEY,
    derived_assertion_id TEXT NOT NULL REFERENCES assertions(id) ON DELETE RESTRICT,
    base_assertion_id TEXT NOT NULL REFERENCES assertions(id) ON DELETE RESTRICT,
    dependency_role TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(derived_assertion_id, base_assertion_id, dependency_role)
);

CREATE TABLE IF NOT EXISTS external_identifiers (
    id TEXT PRIMARY KEY,
    record_id TEXT NOT NULL REFERENCES records(id) ON DELETE RESTRICT,
    namespace TEXT NOT NULL,
    identifier TEXT NOT NULL,
    uri TEXT,
    evidence_fragment_id TEXT REFERENCES evidence_fragments(id) ON DELETE RESTRICT,
    review_status TEXT NOT NULL DEFAULT 'proposed',
    created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_external_identifier_lookup ON external_identifiers(namespace, identifier);

CREATE TABLE IF NOT EXISTS external_links (
    id TEXT PRIMARY KEY,
    record_id TEXT NOT NULL REFERENCES records(id) ON DELETE RESTRICT,
    system_name TEXT NOT NULL,
    external_type TEXT NOT NULL,
    external_id TEXT NOT NULL,
    external_project_id TEXT,
    external_version TEXT,
    external_url TEXT,
    review_status TEXT NOT NULL DEFAULT 'proposed',
    note TEXT,
    created_at TEXT NOT NULL,
    UNIQUE(record_id, system_name, external_type, external_id, external_project_id)
);

CREATE TABLE IF NOT EXISTS identity_candidates (
    id TEXT PRIMARY KEY,
    left_record_id TEXT NOT NULL REFERENCES records(id) ON DELETE RESTRICT,
    right_record_id TEXT NOT NULL REFERENCES records(id) ON DELETE RESTRICT,
    candidate_reason TEXT NOT NULL,
    generated_by TEXT NOT NULL,
    created_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    CHECK (left_record_id <> right_record_id)
);

CREATE TABLE IF NOT EXISTS identity_decisions (
    id TEXT PRIMARY KEY,
    candidate_id TEXT REFERENCES identity_candidates(id) ON DELETE RESTRICT,
    left_record_id TEXT NOT NULL REFERENCES records(id) ON DELETE RESTRICT,
    right_record_id TEXT NOT NULL REFERENCES records(id) ON DELETE RESTRICT,
    decision TEXT NOT NULL,
    rationale TEXT NOT NULL,
    evidence_fragment_id TEXT REFERENCES evidence_fragments(id) ON DELETE RESTRICT,
    decided_by TEXT NOT NULL,
    decided_at TEXT NOT NULL,
    CHECK (left_record_id <> right_record_id)
);

CREATE TABLE IF NOT EXISTS record_redirects (
    from_record_id TEXT PRIMARY KEY REFERENCES records(id) ON DELETE RESTRICT,
    to_record_id TEXT NOT NULL REFERENCES records(id) ON DELETE RESTRICT,
    identity_decision_id TEXT NOT NULL REFERENCES identity_decisions(id) ON DELETE RESTRICT,
    created_at TEXT NOT NULL,
    CHECK (from_record_id <> to_record_id)
);

CREATE TABLE IF NOT EXISTS review_events (
    id TEXT PRIMARY KEY,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    reviewer TEXT NOT NULL,
    rationale TEXT,
    created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_review_events_target ON review_events(target_type, target_id, created_at);

CREATE TABLE IF NOT EXISTS change_events (
    id TEXT PRIMARY KEY,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    operation TEXT NOT NULL,
    base_revision INTEGER,
    new_revision INTEGER,
    changed_fields_json TEXT,
    actor TEXT NOT NULL,
    batch_id TEXT REFERENCES batches(id) ON DELETE RESTRICT,
    occurred_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_change_events_target ON change_events(target_type, target_id, occurred_at);

CREATE TABLE IF NOT EXISTS model_changes (
    id TEXT PRIMARY KEY,
    model_version TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'proposed',
    trigger_source_id TEXT REFERENCES sources(id) ON DELETE RESTRICT,
    trigger_batch_id TEXT REFERENCES batches(id) ON DELETE RESTRICT,
    problem_statement TEXT NOT NULL,
    example_note TEXT,
    alternatives_json TEXT,
    decision_note TEXT,
    migration_id TEXT,
    backfill_policy TEXT,
    proposed_by TEXT NOT NULL,
    proposed_at TEXT NOT NULL,
    decided_by TEXT,
    decided_at TEXT
);

INSERT OR REPLACE INTO schema_meta(key, value, updated_at) VALUES
('model_version','0.1','2026-09-05T00:00:00Z'),
('archive_workbench_reference_version','0.89.0','2026-09-05T00:00:00Z'),
('archive_workbench_reference_commit','9ea0c79db0faa7676093c5d3cdc407779835350b','2026-09-05T00:00:00Z');
