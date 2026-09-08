# Modelo de datos v0.4

## 1. Principio general

La unidad central es **registro + afirmación + evidencia + revisión**. Los registros dan identidad persistente; las afirmaciones expresan qué sostiene una fuente; la evidencia indica dónde; la revisión determina qué puede considerarse integrado o publicable.

El esquema permanece abierto al corpus. Las versiones 0.2, 0.3 y 0.4 incorporan únicamente distinciones que resultaron necesarias al procesar y proyectar el corpus real.

## 2. Registros persistentes

`records` asigna UUID opacos. `record_kind` no está cerrado por un `CHECK` SQL.

Vocabulario estructural inicial:

- `authority`;
- `publication`;
- `research_project`;
- `topic`;
- `concept`;
- `discursive_element`;
- `archival_unit`;
- `archive_repository`;
- `entity_class`;
- `source_asset`;
- `other`.

Los nombres visibles nunca funcionan como identificadores persistentes.

## 3. Autoridades y granularidad

Las autoridades conservan el antecedente estructural de Archive Workbench: persona, familia, organización, lugar, evento, obra u otro, con nombres variantes, temporalidad y revisión.

GIAR agrega una regla de granularidad derivada del corpus: no se crean por defecto autoridades para cada agente de inteligencia, informante, trabajador u otra persona ordinaria mencionada incidentalmente. Cuando el análisis se refiere a la actuación discursiva o institucional de agentes pertenecientes a una dependencia, la entidad relevante es la organización o unidad documentada, por ejemplo DIPBA o una dependencia regional específica. Las personalidades públicas o históricas con relevancia propia se evalúan individualmente.

La regla evita dos extremos: perder la especificidad institucional y atomizar el grafo con individuos que la investigación no estudia como entidades autónomas.

## 4. Pertenencias al GIAR

`group_memberships` separa la identidad de una persona de su relación temporal con el grupo. Permite registrar estados como integrante o ex integrante, con fecha o período, fuente, evidencia y revisión.

Una fuente histórica que enumera a alguien como integrante no establece su condición actual. Una publicación puede documentar una pertenencia en la fecha de publicación sin sustituir el estado vigente.

## 5. Publicaciones y contribuciones

Las publicaciones son registros propios. `publication_contributors` registra autoría, orden de firma y afiliación tal como aparece en la publicación. La afiliación bibliográfica se conserva como información situada en el tiempo y no actualiza automáticamente el perfil institucional actual de la persona.

DOI, ORCID y otros identificadores se guardan en `external_identifiers` con procedencia.

## 6. Proyectos de investigación

Los proyectos financiados son registros independientes. Sus códigos se almacenan como datos, no como claves únicas. El sitio heredado mostró que un mismo código puede aparecer asociado a proyectos distintos; el sistema debe conservar la colisión y someterla a revisión en vez de fusionar registros.

## 7. Conceptos y definiciones

Un concepto es un registro propio y su etiqueta no es única. Se reserva para nociones teóricas, metodológicas o categorías analíticas, y no para cualquier expresión encontrada en el corpus.

La versión 0.3 incorpora `concept_definitions`. Cada fila puede conservar una definición o uso conceptual asociado con una publicación determinada, su atribución, bibliografía y evidencia. Dos publicaciones pueden definir o emplear de manera diferente una misma etiqueta sin que la base fuerce una definición única.

Para la proyección pública puede existir una definición `editorial_common`, construida como síntesis revisable del denominador común entre los usos documentados. Los matices particulares permanecen ligados a cada publicación.

## 8. Elementos discursivos identificados

`discursive_element` y `discursive_element_profiles` registran objetos empíricos identificados por las investigaciones: fórmulas, tópicos, ideologemas, esquemas dóxicos, tópicos visuales u otros patrones. Esta clase evita confundir el aparato conceptual con los resultados del análisis.

Por ejemplo, **fórmula discursiva** puede ser un concepto teórico, mientras que **libertad de trabajo** puede registrarse como una fórmula concreta identificada en documentos del corpus. La contextualización pública se apoya en afirmaciones `site_element_context`, que conservan por publicación quién formula o activa el elemento, en qué documentación aparece y cómo funciona en ese recorte. Esa capa editorial no reemplaza la evidencia ni las relaciones analíticas de base.

## 9. Fuentes no archivísticas

`source_asset` y `source_asset_profiles` registran fuentes primarias o materiales de corpus que no pertenecen necesariamente a una jerarquía archivística: videos oficiales, discursos públicos, documentos institucionales, entrevistas u otros objetos equivalentes.

Su incorporación no sustituye a `sources`: `sources` registra la procedencia intelectual y material de la información incorporada a GIAR, mientras `source_asset` representa un objeto que una investigación analiza y que debe poder aparecer como nodo, página pública y objeto de relaciones.

Las relaciones entre publicaciones y estas fuentes se expresan mediante afirmaciones como `uses_source_asset`. El subtipo de fuente permanece abierto al corpus.

## 10. Temas

Los temas sirven para integración editorial. No son equivalentes a conceptos autorales. La pertenencia de una publicación a un tema puede provenir de una formulación explícita de la fuente o de una síntesis editorial identificada como tal.

## 11. Unidades y referencias archivísticas

`archival_unit_profiles` mantiene una descripción normalizada y provisional de archivo, fondo, sección, mesa, serie, carpeta, legajo, tomo u otra unidad cuando la fuente permite identificarla.

La versión 0.2 incorpora `archival_references`, porque las formas de cita del corpus no pueden suponerse canónicas. Cada aparición conserva:

- la referencia exactamente como fue citada;
- publicación y página en la que aparece;
- fecha documental y folio cuando son legibles;
- una interpretación estructurada opcional;
- el archivo y la unidad normalizada a la que podría corresponder;
- estado de normalización y revisión.

Una referencia cruda puede existir sin unidad normalizada. Esto es obligatorio cuando faltan datos, hay errores tipográficos, una designación es ambigua o la misma expresión podría corresponder a unidades diferentes.

Ejemplo: `Carpeta sin número` no se convierte en una única carpeta. Cada aparición permanece como referencia documental hasta que exista evidencia suficiente para identificarla.

## 12. Afirmaciones y relaciones

`assertions` representa proposiciones atómicas. Capas epistemológicas obligatorias:

- `bibliographic_info`;
- `institutional_info`;
- `author_claim`;
- `research_result`;
- `editorial_synthesis`;
- `analyst_inference`.

Una relación del grafo es una afirmación cuyo objeto es otro registro, o una relación especializada con su propia procedencia, como autoría o pertenencia. No se crean aristas independientes sólo para mejorar una visualización.

## 13. Evidencia

`evidence_fragments` conserva página, sección, fragmento breve y calidad del localizador. `assertion_evidence` vincula afirmaciones y evidencias. La base puede registrar varias evidencias para una misma afirmación.

## 14. Identidad

`identity_candidates` y `identity_decisions` mantienen separadas detección y decisión. Una coincidencia nominal jamás produce una fusión automática. Las decisiones posibles siguen siendo `same`, `distinct`, `unresolved` y `deferred`.

## 15. Historial y evolución

`review_events`, `change_events` y `model_changes` conservan el historial. Las migraciones SQL documentan cambios estructurales. Cuando una nueva publicación obliga a modificar el modelo, se registra qué fuente mostró la necesidad y cómo deben interpretarse los datos anteriores.
