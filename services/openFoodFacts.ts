// servicio para llamar a la api de open food facts
// los endpoints publicos no necesitan api key
// documentacion: https://world.openfoodfacts.org/api/v2/docs

import type { ProductoAPIDetalle, ResultadoBusquedaAPI } from "@/transformers/openFoodFactsTransformer";
import {
  transformarRespuestaProducto,
  transformarResultadoBusqueda,
} from "@/transformers/openFoodFactsTransformer";

const BASE = "https://world.openfoodfacts.org/api/v2";
const TIMEOUT_MS = 8000;

// campos que pedimos al buscar un producto individual
const CAMPOS_DETALLE = [
  "code",
  "product_name",
  "product_name_es",
  "product_name_en",
  "brands",
  "image_url",
  "nutriscore_grade",
  "ecoscore_grade",
  "nova_group",
  "ingredients_text",
  "ingredients_text_es",
  "ingredients_text_en",
  "nutriments",
].join(",");

// campos que pedimos en listados (menos datos, mas rapido)
const CAMPOS_LISTA = [
  "code",
  "product_name",
  "product_name_es",
  "product_name_en",
  "brands",
  "image_url",
  "nutriscore_grade",
  "ecoscore_grade",
  "nova_group",
  "categories_tags",
].join(",");

// --- tipos para los parametros de busqueda ---

export type BusquedaParams = {
  categoria?: string;
  marca?: string;
  etiqueta?: string;
  pais?: string;
  idioma?: string;
  pagina?: number;
  cantidadPorPagina?: number;
};

// --- helpers internos ---

//agrego reintentos para que no salga error de primera, ya que la api falla
async function pedirFetch(url: string): Promise<Record<string, unknown>> {
  const MAX_INTENTOS = 4;
  const TIMEOUT_POR_INTENTO = 8000;
  let ultimoError: unknown;

  for (let intento = 0; intento < MAX_INTENTOS; intento++) {
    if (intento > 0) {
      await new Promise((r) => setTimeout(r, 1000));
    }

    const control = new AbortController();
    const timeout = setTimeout(() => control.abort(), TIMEOUT_POR_INTENTO);

    try {
      const respuesta = await fetch(url, { signal: control.signal });
      if (!respuesta.ok) {
        throw new Error(`la api respondio con estado ${respuesta.status}`);
      }
      return (await respuesta.json()) as Record<string, unknown>;
    } catch (e) {
      if (intento === MAX_INTENTOS - 1) throw e;

      const mensaje = e instanceof Error ? e.message : "";
      const matchStatus = mensaje.match(/estado (\d+)/);
      const status = matchStatus ? Number(matchStatus[1]) : null;

      // solo no reintentamos 404 (producto no encontrado)
      if (status === 404) throw e;

      ultimoError = e;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw ultimoError;
}

// --- funciones publicas ---

// busca un producto por su codigo de barras
// devuelve el producto transformado o null si no se encuentra
export async function fetchProductoPorCodigo(
  codigo: string
): Promise<{ producto: ProductoAPIDetalle | null; encontrado: boolean }> {
  const url = `${BASE}/product/${codigo}.json?fields=${CAMPOS_DETALLE}`;
  const data = await pedirFetch(url);
  return transformarRespuestaProducto(data);
}

// busca productos usando filtros de categoria, marca o etiqueta
// NO busca por nombre de producto (search_terms) porque el profesor lo descarto
export async function buscarProductos(
  params: BusquedaParams
): Promise<ResultadoBusquedaAPI> {
  const filtros: string[] = [];

  if (params.categoria) {
    filtros.push(`categories_tags=${encodeURIComponent(params.categoria)}`);
  }
  if (params.marca) {
    filtros.push(`brands_tags=${encodeURIComponent(params.marca)}`);
  }
  if (params.etiqueta) {
    filtros.push(`labels_tags=${encodeURIComponent(params.etiqueta)}`);
  }
  if (params.pais) {
    filtros.push(`countries_tags=${encodeURIComponent(params.pais)}`);
  }
  if (params.idioma) {
    filtros.push(`languages_tags=${encodeURIComponent(params.idioma)}`);
  }

  const pagina = params.pagina ?? 1;
  const cantidad = params.cantidadPorPagina ?? 20;
  const query = [
    ...filtros,
    `fields=${CAMPOS_LISTA}`,
    `page=${pagina}`,
    `page_size=${cantidad}`,
  ].join("&");

  const url = `${BASE}/search?${query}`;
  const data = await pedirFetch(url);
  return transformarResultadoBusqueda(data);
}
