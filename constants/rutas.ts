import { Href } from "expo-router";

// aca se guardan los caminos principales de la aplicacion
export const RUTAS = {
  INICIO: "/",
  TABS: "/(tabs)",
  CATEGORIA: "/categorias/[nombre]",
  MARCA: "/marcas/[nombre]",
  FILTRO: "/etiquetas/[nombre]",
  BUSCAR: "/buscar",
  FAVORITOS: "/favoritos",
} as const;

export type RutaApp = (typeof RUTAS)[keyof typeof RUTAS];
type ParametrosRuta = Record<string, string | number | boolean | undefined>;

// esta funcion arma una ruta cuando necesitamos mandar datos
export function armarRuta(ruta: RutaApp, parametros?: ParametrosRuta): Href {
  if (!parametros) {
    return ruta as Href;
  }

  return {
    pathname: ruta,
    params: parametros,
  } as Href;
}
