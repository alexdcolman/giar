# GIAR — Grupo de Investigación en Archivos de la Represión

Repositorio público del **Grupo de Investigación en Archivos de la Represión (GIAR)**.

## Sitio web

**[https://alexdcolman.github.io/giar/](https://alexdcolman.github.io/giar/)**

El sitio reúne la producción del grupo y permite recorrer integrantes, publicaciones, proyectos, temas, conceptos, elementos discursivos, entidades, fuentes y un grafo interactivo de relaciones.

## Sobre este repositorio

Este repositorio contiene la documentación técnica pública y los contratos que sostienen la base de conocimiento del GIAR. La rama `gh-pages` contiene la versión publicada del sitio web.

La release pública no incluye el corpus de trabajo, bases locales, documentación interna de continuidad ni materiales de validación. Los PDF y demás fuentes originales tampoco se versionan aquí.

## Contenido público

- `docs/`: documentación del modelo de datos, procedencia, evidencia, identidad y contratos de importación;
- `schemas/`: esquemas de intercambio y validación de datos;
- `migrations/`: migraciones SQL que documentan la evolución estructural del modelo;
- `examples/`: ejemplos mínimos de los contratos públicos.

## Criterios de integración

La base se construye a partir de la lectura completa de las publicaciones incorporadas. Se registra sólo aquello que las fuentes permiten sostener y se conserva la procedencia de las afirmaciones, relaciones y referencias documentales.

Las coincidencias nominales no resuelven por sí solas la identidad de personas, instituciones, conceptos o unidades archivísticas. Las normalizaciones y relaciones analíticas deben poder justificarse mediante evidencia.

El modelo distingue entre conceptos teóricos, elementos discursivos identificados por las investigaciones, temas editoriales, entidades estudiadas, fuentes y unidades archivísticas. Esa distinción también estructura las páginas y el grafo del sitio público.

## Documentación técnica

- [Modelo de datos](docs/MODELO_DE_DATOS.md)
- [Procedencia y evidencia](docs/PROCEDENCIA_Y_EVIDENCIA.md)
- [Identidad, desambiguación y granularidad](docs/IDENTIDAD_Y_DESAMBIGUACION.md)
- [Contratos de importación](docs/CONTRATOS_DE_IMPORTACION.md)

## Publicación

El sitio se publica mediante GitHub Pages desde la rama `gh-pages`:

**[Abrir el sitio público del GIAR](https://alexdcolman.github.io/giar/)**
