# Food App

Aplicacion hecha con Expo y React Native para explorar productos alimenticios.

## Que permite hacer

- Ver categorias de alimentos
- Ver marcas disponibles
- Filtrar productos por categoria marca o etiqueta
- Abrir la ficha de cada producto
- Ver informacion nutricional ingredientes y alergenos
- Navegar entre Inicio Buscar y Favoritos

## Estructura principal

```txt
app          pantallas y rutas
components   componentes reutilizables
data         datos de productos marcas categorias y etiquetas
constants    rutas usadas por la aplicacion
assets       imagenes de productos y marcas
```

## Como iniciar

```bash
npm install
npx expo start
```

## Idea general

La aplicacion separa los datos de las pantallas

Los productos estan guardados en archivos dentro de data

Las pantallas leen esos datos y los muestran en listas y fichas

Expo Router se encarga de la navegacion usando los archivos dentro de app
