# Contratos de importación

## Objetivo

Los contratos separan extracción de integración. Un lote puede analizarse, validarse y revisar conflictos antes de modificar la base curada.

Los contratos iniciales `0.1` se conservan. El piloto Magnanego añadió contratos `0.2` sin invalidar los anteriores.

## 1. Manifiesto de lote

`giar-import-batch.schema.json` registra lote, ítems, nombres recibidos, URLs, checksums y contexto de suministro. `batch_id + item_id` permite reintentar una carga sin duplicarla.

## 2. Análisis de fuente

`giar-source-analysis-0.2.json` conserva:

- estado de lectura completa;
- metadatos conocidos y ausentes;
- candidatos de registros;
- fragmentos de evidencia;
- afirmaciones propuestas;
- incertidumbres y solicitudes de cambio del modelo;
- referencias archivísticas crudas cuando existan;
- pertenencias institucionales o al GIAR cuando la fuente las documente;
- contribuyentes y afiliaciones impresas en publicaciones.

Una fuente con `reading_status != complete` no puede presentarse como análisis completo.

## 3. Referencias archivísticas

`giar-archival-reference-0.2.json` exige conservar `raw_reference` antes de cualquier normalización y admite estados `normalized`, `provisional`, `unresolved` y `conflict`.

La presencia de una forma como `Carpeta sin número` no autoriza a crear una unidad persistente. Un error aparente tampoco se corrige destruyendo la forma citada.

## 4. Pertenencias

`giar-membership-0.2.json` registra persona, grupo, estado, temporalidad, fuente, evidencia y revisión. La pertenencia histórica y la condición actual pueden coexistir.

## 5. Contribuyentes y afiliaciones

`giar-publication-contributor-0.2.json` registra la forma de autoría y la afiliación que aparece en una publicación. Esa afiliación no actualiza automáticamente el perfil actual de la persona.

## 6. Fragmentos y afirmaciones

Los contratos `giar-evidence-fragment-0.1.json` y `giar-assertion-0.1.json` continúan vigentes porque el piloto no exigió modificar su semántica central.

## 7. Aplicación

La aplicación debe ser transaccional por fuente o lote. Los conflictos de identidad, de normalización archivística y los nuevos predicados se registran; no se resuelven durante el parseo por conveniencia.

## 8. Reimportación

- mismo `batch_id + item_id`: actualización/reintento del mismo ingreso;
- mismo checksum: misma representación binaria;
- distinto checksum con misma publicación posible: nueva representación o versión, pendiente de resolución;
- misma denominación: sólo candidato de identidad.
