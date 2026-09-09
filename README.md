# GIAR – Base de conocimiento

Repositorio del proyecto del Grupo de Investigación en Archivos de la Represión (GIAR).

## Propósito

Construir de manera acumulativa, trazable y revisable una base de conocimiento derivada del corpus real del grupo. La base debe sostener un sitio público con páginas de integrantes y ex integrantes, proyectos, temas, conceptos, publicaciones, fuentes archivísticas y no archivísticas, unidades documentales, además de un grafo navegable.

GIAR es un proyecto separado de Archive Workbench. No comparte su repositorio ni sus bases descartables. Archive Workbench puede aportar infraestructura y referencias externas, pero GIAR conserva su propia base, contratos, historial y modelo semántico.

## Referencia inicial de Archive Workbench

La arquitectura se contrastó el 2026-09-05 con Archive Workbench `0.89.0`, rama `main`, commit `9ea0c79db0faa7676093c5d3cdc407779835350b`. Esa referencia queda fijada para evitar dependencias silenciosas de cambios posteriores.

## Regla central

Cada publicación se lee completa antes de integrarla. Se incorpora sólo lo sustentado. Toda afirmación conserva procedencia y evidencia cuando la fuente lo permite. Una coincidencia nominal no resuelve identidad y ninguna relación analítica se crea sin evidencia.

## Documentación

`docs/` es público y versionable. Ver primero:

1. `docs/README.md`
2. `docs/POLITICA_DOCUMENTAL.md`
3. `docs/MODELO_DE_DATOS.md`
4. `docs/PROCEDENCIA_Y_EVIDENCIA.md`
5. `docs/IDENTIDAD_Y_DESAMBIGUACION.md`
6. `docs/CONTRATOS_DE_IMPORTACION.md`
7. `docs/INGESTA_POR_LOTES.md`
8. `docs/POLITICA_SITIO_PUBLICO.md`
9. `docs/PILOTO_MAGNANEGO_01.md`
10. `docs/INTEGRACION_LOTE002_BONILLA.md`
11. `docs/INTEGRACION_LOTE003_KRATJE.md`
12. `docs/INTEGRACION_LOTE004_JANICA.md`
13. `docs/INTEGRACION_LOTE005_LEDESMA.md`
14. `docs/INTEGRACION_LOTE006_KLEMEN.md`
15. `docs/INTEGRACION_LOTE007_ROMERO.md`
16. `docs/INTEGRACION_LOTE008_CHIAVARINO.md`
17. `docs/INTEGRACION_LOTE009_COLMAN.md`
18. `docs/INTEGRACION_LOTE010_VITALE.md`
19. `docs/INTEGRACION_LOTE011_BETTENDORFF.md`
20. `docs/INTEGRACION_LOTE012_PAULINA_BETTENDORFF.md`

`.assistant/` contiene documentación privada de continuidad y está excluido por `.gitignore`.

## Estado de la base

El núcleo `0.1` vive en `migrations/0001_core.sql`. Los primeros lotes produjeron las versiones `0.2`, `0.3` y `0.4`, implementadas por `migrations/0002_memberships_contributors_archival_references.sql`, `migrations/0003_public_projection_and_concept_definitions.sql` y `migrations/0004_source_assets.sql`. La versión `0.4` activa fuentes primarias no archivísticas como objetos del corpus, sin confundirlas con la procedencia técnica de la ingesta.

`data/giar.sqlite` es la base persistente local y no se versiona. Los PDF tampoco se versionan; su identidad de bytes, paginación y estado de lectura quedan registrados en la base.

## Sitio

`scripts/build_site.py --pilot` genera la vista de trabajo usada para comprobar la proyección corpus → base → páginas → grafo. La vista puede usar datos todavía en revisión, pero mantiene la misma lógica editorial del sitio: no expone estados técnicos ni convierte la interfaz en una pantalla de auditoría. No equivale al despliegue del sitio GIAR.


## Revisión vigente

REV54 (2026-09-09) mantiene el modelo `0.4` y acumula 95 publicaciones, 192 conceptos, 107 elementos discursivos, 17 temas, 80 autoridades/entidades, 76 unidades archivísticas y 18 fuentes no archivísticas. Integra el capítulo de María Alejandra Vitale y Tomás Klemen (2020) sobre Carlos Mugica y la vigilancia de la DIPPBA, con cuatro conceptos nuevos, siete elementos discursivos nuevos, una nueva entidad estudiada, una fuente pública y la normalización del Legajo 15282 de Mesa de Referencia. El sitio genera 528 páginas por salida y el grafo 511 nodos y 1613 relaciones; la validación REV54 comprueba 21.264 enlaces locales sin roturas y 28 relaciones incidentes de la publicación nueva.
