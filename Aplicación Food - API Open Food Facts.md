# Aplicacion Food - API Open Food Facts

## Batch: conexion de la pantalla de detalle a la API

### Que se hizo

Se conecto la pantalla dinamica `app/fichas/[id].tsx` a la API de Open Food Facts.

- el parametro `id` de la ruta se usa como codigo de barras para llamar a `fetchProductoPorCodigo()` del servicio en `services/openFoodFacts.ts`
- se agregaron estados de `loading` (cargando), `error` (error) y `producto` (datos del producto) con `useState` + `useEffect`
- la pantalla muestra mensajes en espanol para los estados de carga, error y producto no encontrado
- cuando el producto se carga correctamente, se renderizan los datos transformados por `openFoodFactsTransformer.ts`
- si la API devuelve una imagen, se muestra con el componente `Image` de React Native; si no, se muestra el placeholder emoji

### Secciones eliminadas de la maqueta original

- categoria: la API no devuelve un id de categoria simple como el de la maqueta local
- etiquetas: el modelo de la API no incluye ids de etiquetas
- descripcion: la API no tiene un campo de descripcion separado del nombre

### Archivos modificados

- `app/fichas/[id].tsx` — reemplazo de datos mock por llamada a la API con estados loading/error/success, etiquetas de scores en espanol, subtitulos descriptivos
- `transformers/openFoodFactsTransformer.ts` — se agrego limpiarTextoIngredientes() para normalizar el texto crudo de ingredientes de la API
- `Aplicación Food - API Open Food Facts.md` — este archivo

### Notas sobre datos de la API

El texto crudo de ingredientes que devuelve Open Food Facts (`ingredients_text`) suele incluir guiones bajos, espacios multiples y mayusculas inconsistentes. El transformer aplica `limpiarTextoIngredientes()` para normalizar esos artefactos antes de mostrarlos al usuario, sin modificar nombres quimicos ni alergenos en mayuscula.

### Soporte de idioma espanol

Cuando la API dispone del campo especifico para espanol (ej. `ingredients_text_es`), el transformer lo prioriza antes de caer al campo generico `ingredients_text`. Esto aplica tambien a futuros campos localizados que se agreguen, siguiendo el mismo patron: preferir el sufijo `_es`, luego el campo base generico, y finalmente un valor por defecto.

### Pendiente

- buscar, escaner, favoritos y navegacion todavia no estan conectados
- los datos mock en `data/productos.ts` siguen siendo el scaffolding temporal para otras pantallas
