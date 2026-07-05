// transforma la respuesta cruda de la api de open food facts
// en objetos que la app puede usar sin riesgos
// la api devuelve muchos campos y a veces vienen vacios

// --- tipos para los datos transformados ---

export type NutrientesAPI = {
  energia: number;
  grasa: number;
  grasaSaturada: number;
  carbohidratos: number;
  azucares: number;
  fibra: number;
  proteina: number;
  sal: number;
};

export type ProductoAPIDetalle = {
  codigoBarras: string;
  nombre: string;
  marcas: string;
  imagenUrl: string;
  nutriScore: string;
  ecoScore: string;
  grupoNova: number;
  ingredientes: string;
  nutrientes: NutrientesAPI;
};

export type ProductoAPIResumen = {
  codigoBarras: string;
  nombre: string;
  marcas: string;
  imagenUrl: string;
  nutriScore: string;
  ecoScore: string;
  grupoNova: number;
};

export type ResultadoBusquedaAPI = {
  total: number;
  pagina: number;
  productos: ProductoAPIResumen[];
};

// limpia el texto de ingredientes que devuelve la api:
// normaliza espacios, reemplaza guiones bajos, mejora legibilidad
// sin alterar quimicos ni alergenos en mayuscula
export function limpiarTextoIngredientes(texto: string): string {
  return texto
    .trim()
    .replace(/_/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/\s*,/g, ",")
    .replace(/,\s*/g, ", ")
    .trim();
}

// --- helpers de traduccion para valores de la api ---

// texto descriptivo para cada grado de nutri-score
export function textoNutriScore(grado: string): string {
  const mapa: Record<string, string> = {
    a: "excelente",
    b: "bueno",
    c: "aceptable",
    d: "regular",
    e: "poco saludable",
  };
  return mapa[grado.toLowerCase()] ?? "desconocido";
}

// texto descriptivo para cada grado de eco-score
export function textoEcoScore(grado: string): string {
  const mapa: Record<string, string> = {
    a: "excelente",
    b: "bueno",
    c: "aceptable",
    d: "regular",
    e: "poco ecologico",
  };
  const key = grado.toLowerCase();
  if (key === "unknown" || !mapa[key]) return "sin clasificar";
  return mapa[key];
}

// texto descriptivo para grupo nova
export function textoGrupoNova(grupo: number): string {
  const mapa: Record<number, string> = {
    1: "sin procesar",
    2: "ingrediente culinario",
    3: "procesado",
    4: "ultraprocesado",
  };
  return mapa[grupo] ?? "desconocido";
}

// --- transformadores ---

function valorSeguro(valor: unknown, fallback: number): number {
  if (typeof valor === "number" && !Number.isNaN(valor)) return valor;
  return fallback;
}

function transformarNutrientes(raw: Record<string, unknown> | undefined): NutrientesAPI {
  return {
    energia: valorSeguro(raw?.["energy-kj_100g"], 0),
    grasa: valorSeguro(raw?.["fat_100g"], 0),
    grasaSaturada: valorSeguro(raw?.["saturated-fat_100g"], 0),
    carbohidratos: valorSeguro(raw?.["carbohydrates_100g"], 0),
    azucares: valorSeguro(raw?.["sugars_100g"], 0),
    fibra: valorSeguro(raw?.["fiber_100g"], 0),
    proteina: valorSeguro(raw?.["proteins_100g"], 0),
    sal: valorSeguro(raw?.["salt_100g"], 0),
  };
}

// convierte el objeto producto crudo de la api en un ProductoAPIDetalle seguro
// maneja campos faltantes, null, undefined y strings vacios
export function transformarProducto(
  raw: Record<string, unknown> | undefined
): ProductoAPIDetalle | null {
  if (!raw) return null;

  return {
    codigoBarras: String(raw.code ?? ""),
    nombre: String(raw.product_name ?? "producto sin nombre"),
    marcas: String(raw.brands ?? ""),
    imagenUrl: String(raw.image_url ?? ""),
    nutriScore: String(raw.nutriscore_grade ?? "?").toUpperCase(),
    ecoScore: String(raw.ecoscore_grade ?? "unknown").toUpperCase(),
    grupoNova: valorSeguro(raw.nova_group, 0),
    ingredientes: limpiarTextoIngredientes(
      String(raw.ingredients_text_es ?? raw.ingredients_text ?? "sin informacion")
    ),
    nutrientes: transformarNutrientes(
      raw.nutriments as Record<string, unknown> | undefined
    ),
  };
}

// convierte la respuesta completa de /api/v2/product/{barcode}.json
export function transformarRespuestaProducto(
  raw: Record<string, unknown>
): { producto: ProductoAPIDetalle | null; encontrado: boolean } {
  // status 1 significa producto encontrado, 0 significa no encontrado
  if (raw.status !== 1) {
    return { producto: null, encontrado: false };
  }

  const producto = transformarProducto(
    raw.product as Record<string, unknown> | undefined
  );

  return { producto, encontrado: true };
}

// convierte un item de la lista de resultados de busqueda
function transformarItemBusqueda(
  raw: Record<string, unknown>
): ProductoAPIResumen {
  return {
    codigoBarras: String(raw.code ?? ""),
    nombre: String(raw.product_name ?? "producto sin nombre"),
    marcas: String(raw.brands ?? ""),
    imagenUrl: String(raw.image_url ?? ""),
    nutriScore: String(raw.nutriscore_grade ?? "?").toUpperCase(),
    ecoScore: String(raw.ecoscore_grade ?? "unknown").toUpperCase(),
    grupoNova: valorSeguro(raw.nova_group, 0),
  };
}

// convierte la respuesta de /api/v2/search
export function transformarResultadoBusqueda(
  raw: Record<string, unknown>
): ResultadoBusquedaAPI {
  const productosRaw = raw.products as Record<string, unknown>[] | undefined;

  return {
    total: valorSeguro(raw.count, 0),
    pagina: valorSeguro(raw.page, 1),
    productos: (productosRaw ?? []).map(transformarItemBusqueda),
  };
}
