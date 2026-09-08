# Procedencia y evidencia

## 1. Regla general

Toda afirmación incorporada a la base conserva la fuente que la sustenta y, cuando la representación lo permite, un localizador preciso.

La procedencia se registra en tres niveles: fuente intelectual o documental, representación recibida y fragmento de evidencia.

## 2. Representación recibida

`source_files` conserva nombre original, SHA-256, tamaño, tipo de medio y paginación. El archivo puede dejar de estar presente localmente después del procesamiento; su identidad de bytes permanece registrada.

La eliminación de un PDF de un paquete de continuidad no convierte una lectura completa en incompleta ni elimina los localizadores extraídos. Si más adelante se recibe otra copia, su checksum permite saber si se trata de la misma representación.

## 3. Fragmentos

Los fragmentos deben ser suficientemente pequeños para auditar la afirmación sin convertir la base en una reproducción de la publicación. Se registra página del archivo, página impresa si difiere, sección y otros localizadores disponibles.

## 4. Referencias archivísticas

Toda cita de material archivístico se registra primero como `archival_reference.raw_reference`. La normalización es una operación posterior y revisable.

Se distinguen:

- `normalized`: la referencia puede vincularse con suficiente confianza a una unidad registrada;
- `provisional`: existe una interpretación plausible pero debe revisarse;
- `unresolved`: faltan datos o hay ambigüedad;
- `conflict`: dos datos de la fuente no pueden conciliarse sin evidencia adicional.

No se corrige silenciosamente una forma escrita por el autor. Un error aparente como `Capeta 39` puede interpretarse provisionalmente como `Carpeta 39`, pero el texto crudo permanece intacto.

Si dos citas usan el mismo localizador para documentos que presentan fechas diferentes, se conservan ambas apariciones y se marca el conflicto. La base no decide cuál es correcta sin otra fuente.

## 5. Calidad del localizador

Los fragmentos pueden indicar localización exacta, aproximada o no disponible. Una ausencia real se registra como ausencia; nunca se inventa página, folio o sección.

## 6. Capas epistemológicas

La procedencia no sustituye la clasificación epistemológica. Debe seguir siendo posible distinguir una afirmación del autor, un resultado de investigación, una descripción institucional, una síntesis editorial o una inferencia del analista.
