-- GIAR model 0.4
-- Trigger: lote 004 (Emilia Janica), cuyo corpus incluye videos y discursos públicos
-- que no pertenecen a una jerarquía archivística.
-- Materializa el record_kind source_asset ya previsto por el modelo inicial.

PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS source_asset_profiles (
    record_id TEXT PRIMARY KEY REFERENCES records(id) ON DELETE RESTRICT,
    asset_type TEXT NOT NULL,
    title TEXT NOT NULL,
    date_expression TEXT,
    date_start TEXT,
    date_end TEXT,
    language TEXT,
    platform TEXT,
    originating_organization TEXT,
    url TEXT,
    scope_note TEXT
);

CREATE INDEX IF NOT EXISTS idx_source_asset_profiles_type_date
ON source_asset_profiles(asset_type, date_start);
