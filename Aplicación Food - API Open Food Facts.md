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

### Conexion de categorias a la API

La pantalla `app/categorias/[nombre].tsx` ahora busca productos reales en Open Food Facts en vez de filtrar datos mock locales.

- cada categoria local tiene su tag OFF definido en `data/categorias.ts`, junto al resto de sus datos
- la busqueda filtra por categoria + pais Argentina (`countries_tags=en:argentina`) y trae hasta 60 resultados crudos
- el transformer prioriza nombres en espanol cuando existen, y cae a ingles o generico si no
- al tocar un producto navega a la ficha por codigo de barras (`/fichas/{codigoBarras}`)
- los resultados se mapean al formato `ProductoParaTarjeta` que entiende `TarjetaProducto`

### Batch: filtrado post-API por categories_tags

Las categorias de Open Food Facts son colaborativas: cualquier colaborador puede etiquetar un producto. Esto genera ruido — por ejemplo, fideos aparecen como "snacks" o yerba como "bebida".

Para solucionarlo, la pantalla ahora aplica filtros locales **despues** de recibir los datos de la API:

- se agrego `categories_tags` a los campos solicitados en la busqueda (`CAMPOS_LISTA`)
- el transformer extrae `categoriesTags: string[]` en `ProductoAPIResumen`
- en la pantalla, se definieron reglas `incluir`/`excluir` por categoria local
  - **beverages**: solo sodas, aguas, jugos (`en:sodas`, `en:carbonated-drinks`, `en:waters`, `en:fruit-juices`, `en:juices-and-nectars`, `en:soft-drinks`); excluye yerba, te, cafe
  - **snacks**: solo snacks salados, papas, crackers (`en:salty-snacks`, `en:chips-and-fries`, `en:crackers`, `en:snack-foods`); excluye pastas, fideos, comidas preparadas
  - otras categorias no tienen reglas explicitas para no sobre-filtrar
- si tras filtrar no quedan productos, se muestra lista vacia en vez de datos erroneos
- se piden 60 productos por pagina para tener margen de filtrado y se muestran los primeros 20 limpios

### Pendiente

- buscar, escaner, favoritos y navegacion todavia no estan conectados
- los datos mock en `data/productos.ts` siguen siendo el scaffolding temporal para otras pantallas
- las pantallas de marcas y etiquetas siguen usando datos mock (pendiente de conectar a la API)
