// transforma la respuesta cruda de la api de open food facts
// en objetos que la app puede usar sin riesgos
// la api devuelve muchos campos y a veces vienen vacios

// null significa que la api no devolvio el valor
// (distinto de 0, que es un valor valido)
export type NutrientesAPI = {
  energia: number | null;
  energiaKcal: number | null;
  grasa: number | null;
  grasaSaturada: number | null;
  grasaMonoinsaturada: number | null;
  grasaPoliinsaturada: number | null;
  grasaTrans: number | null;
  colesterol: number | null;
  carbohidratos: number | null;
  azucares: number | null;
  fibra: number | null;
  proteina: number | null;
  sal: number | null;
  sodio: number | null;
  vitaminaA: number | null;
  vitaminaC: number | null;
  calcio: number | null;
  hierro: number | null;
};

export type ProductoAPIDetalle = {
  codigoBarras: string;
  nombre: string;
  marcas: string;
  imagenUrl: string;
  nutriScore: string;
  ecoScore: string;
  grupoNova: string;
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
  grupoNova: string;
  categoriesTags: string[];
};

export type ResultadoBusquedaAPI = {
  total: number;
  pagina: number;
  productos: ProductoAPIResumen[];
};

function capitalizarTexto(texto: string): string {
  if (texto.length === 0) return texto;

  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

// la api trae el texto de ingredientes medio crudo: todo mayusculas,
// palabras pegadas a numeros, porcentajes con coma decimal, a veces
// parentesis mal puestos. esta funcion lo deja mas presentable
// antes de que la pantalla lo reciba
export function limpiarTextoIngredientes(texto: string): string {
  return texto
    .trim()
    .replace(/_/g, " ")
    .replace(/([A-Za-zÁÉÍÓÚÑáéíóúñ])(\d)/g, "$1 $2")
    .replace(/\s{2,}/g, " ")
    .replace(/\s*,/g, ",")
    .replace(/,\s*/g, ", ")
    .replace(/(\d),\s+(\d)/g, "$1,$2")
    .replace(/\s+(\d+(?:,\d+)?%\))/g, " ($1")
    .split(", ")
    .map(capitalizarTexto)
    .join(", ")
    .trim();
}

// texto descriptivo para cada grado de nutri-score

// texto descriptivo para cada grado de nutri-score
export function textoNutriScore(grado: string): string {
  const mapa: Record<string, string> = {
    a: "Excelente",
    b: "Bueno",
    c: "Aceptable",
    d: "Regular",
    e: "Poco saludable",
  };
  const key = grado.toLowerCase();
  if (key === "unknown" || key === "not-applicable" || !mapa[key]) {
    return "Sin calificar";
  }
  return mapa[key];
}

// texto descriptivo para cada grado de eco-score
export function textoEcoScore(grado: string): string {
  const mapa: Record<string, string> = {
    a: "Excelente",
    b: "Bueno",
    c: "Aceptable",
    d: "Regular",
    e: "Poco ecologico",
  };
  const key = grado.toLowerCase();
  if (key === "unknown" || key === "not-applicable" || !mapa[key]) {
    return "Sin calificar";
  }
  return mapa[key];
}

// texto descriptivo para grupo nova
export function textoGrupoNova(grupo: string): string {
  const mapa: Record<string, string> = {
    "1": "Sin procesar",
    "2": "Ingrediente culinario",
    "3": "Procesado",
    "4": "Ultraprocesado",
  };
  return mapa[grupo] ?? "Sin calificar";
}

function valorSeguro(valor: unknown, fallback: number): number {
  if (typeof valor === "number" && !Number.isNaN(valor)) return valor;
  return fallback;
}

// version para nutrientes: devuelve null cuando la api no manda el valor,
// en vez de inventar un 0. asi la pantalla puede mostrar "sin informacion"
function valorNutricionalSeguro(valor: unknown): number | null {
  if (typeof valor === "number" && !Number.isNaN(valor)) return valor;

  // uso null para diferenciar dato faltante de un 0 real que venga de la api
  return null;
}

function textoSeguro(valor: unknown, fallback: string): string {
  if (typeof valor !== "string") return fallback;

  const texto = valor.trim();
  return texto.length > 0 ? texto : fallback;
}

// normaliza valores de scores (nutriScore, ecoScore) a un formato consistente.
// si el valor es null, undefined, vacio, "unknown" o "not-applicable" devuelve el fallback
function normalizarGrupoNova(raw: unknown): string {
  if (raw == null) return "?";
  const num = Number(raw);
  if (Number.isInteger(num) && num >= 1 && num <= 4) return String(num);
  return "?";
}

function normalizarScore(raw: unknown, fallback: string): string {
  if (raw == null) return fallback;
  const texto = String(raw).trim().toUpperCase();
  if (texto === "" || texto === "UNKNOWN" || texto === "NOT-APPLICABLE" || texto === "?") {
    return fallback;
  }
  return texto;
}

function primerTextoDisponible(valores: unknown[], fallback: string): string {
  for (const valor of valores) {
    const texto = textoSeguro(valor, "");
    if (texto) return texto;
  }

  return fallback;
}

function transformarNutrientes(raw: Record<string, unknown> | undefined): NutrientesAPI {
  return {
    energia: valorNutricionalSeguro(raw?.["energy-kj_100g"]),
    energiaKcal: valorNutricionalSeguro(raw?.["energy-kcal_100g"]),
    grasa: valorNutricionalSeguro(raw?.["fat_100g"]),
    grasaSaturada: valorNutricionalSeguro(raw?.["saturated-fat_100g"]),
    grasaMonoinsaturada: valorNutricionalSeguro(raw?.["monounsaturated-fat_100g"]),
    grasaPoliinsaturada: valorNutricionalSeguro(raw?.["polyunsaturated-fat_100g"]),
    grasaTrans: valorNutricionalSeguro(raw?.["trans-fat_100g"]),
    colesterol: valorNutricionalSeguro(raw?.["cholesterol_100g"]),
    carbohidratos: valorNutricionalSeguro(raw?.["carbohydrates_100g"]),
    azucares: valorNutricionalSeguro(raw?.["sugars_100g"]),
    fibra: valorNutricionalSeguro(raw?.["fiber_100g"]),
    proteina: valorNutricionalSeguro(raw?.["proteins_100g"]),
    sal: valorNutricionalSeguro(raw?.["salt_100g"]),
    sodio: valorNutricionalSeguro(raw?.["sodium_100g"]),
    vitaminaA: valorNutricionalSeguro(raw?.["vitamin-a_100g"]),
    vitaminaC: valorNutricionalSeguro(raw?.["vitamin-c_100g"]),
    calcio: valorNutricionalSeguro(raw?.["calcium_100g"]),
    hierro: valorNutricionalSeguro(raw?.["iron_100g"]),
  };
}

// convierte el objeto producto crudo de la api en un ProductoAPIDetalle seguro
// maneja campos faltantes, null, undefined y strings vacios
export function transformarProducto(
  raw: Record<string, unknown> | undefined
): ProductoAPIDetalle | null {
  if (!raw) return null;

  return {
    codigoBarras: textoSeguro(raw.code, ""),
    nombre: primerTextoDisponible(
      [raw.product_name_es, raw.product_name_en, raw.product_name],
      "producto sin nombre"
    ),
    marcas: textoSeguro(raw.brands, ""),
    imagenUrl: textoSeguro(raw.image_url, ""),
    nutriScore: normalizarScore(raw.nutriscore_grade, "?"),
    ecoScore: normalizarScore(raw.ecoscore_grade, "?"),
    grupoNova: normalizarGrupoNova(raw.nova_group),
    ingredientes: limpiarTextoIngredientes(
      primerTextoDisponible(
        [raw.ingredients_text_es, raw.ingredients_text_en, raw.ingredients_text],
        "sin informacion"
      )
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
  // extraer categories_tags de forma segura
  // la api devuelve un array de strings como ["en:beverages", "en:sodas"]
  const rawTags = raw.categories_tags;
  const categoriesTags = Array.isArray(rawTags)
    ? rawTags.filter((t): t is string => typeof t === "string")
    : [];

  return {
    codigoBarras: textoSeguro(raw.code, ""),
    nombre: primerTextoDisponible(
      [raw.product_name_es, raw.product_name_en, raw.product_name],
      "producto sin nombre"
    ),
    marcas: textoSeguro(raw.brands, ""),
    imagenUrl: textoSeguro(raw.image_url, ""),
    nutriScore: normalizarScore(raw.nutriscore_grade, "?"),
    ecoScore: normalizarScore(raw.ecoscore_grade, "?"),
    grupoNova: normalizarGrupoNova(raw.nova_group),
    categoriesTags,
  };
}

// convierte la respuesta de /api/v2/search
// ademas filtra productos sin codigo de barras para evitar
// que la app intente navegar a fichas que no existen
export function transformarResultadoBusqueda(
  raw: Record<string, unknown>
): ResultadoBusquedaAPI {
  const productosRaw = raw.products as Record<string, unknown>[] | undefined;

  return {
    total: valorSeguro(raw.count, 0),
    pagina: valorSeguro(raw.page, 1),
    productos: (productosRaw ?? [])
      .map(transformarItemBusqueda)
      .filter((p) => p.codigoBarras !== ""),
  };
}
