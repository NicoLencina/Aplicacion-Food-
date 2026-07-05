// ejemplo de como funciona la transformacion de datos de la api
// los datos crudos de open food facts tienen campos opcionales y nombres raros
// el transformer los convierte en algo que la app puede usar directamente
//
// para probar: importar transformarProducto y pasarle un fixture como este
// se puede ejecutar con npx ts-node si se instala, o simplemente leerlo como referencia

import { transformarProducto, transformarResultadoBusqueda } from "./openFoodFactsTransformer";

// --- ejemplo 1: producto individual (nutella) ---

export const RESPUESTA_NUTELLA = {
  code: "3017620422003",
  status: 1,
  status_verbose: "product found",
  product: {
    product_name: "Nutella",
    brands: "Nutella, Ferrero",
    image_url: "https://static.openfoodfacts.org/images/products/301/762/042/2003/front_en.3.400.jpg",
    nutriscore_grade: "e",
    ecoscore_grade: "e",
    nova_group: 4,
    ingredients_text: "Sugar, palm oil, hazelnuts, skimmed milk, cocoa, lecithin, vanillin",
    nutriments: {
      "energy-kj_100g": 2276,
      "fat_100g": 30.9,
      "saturated-fat_100g": 10.5,
      "carbohydrates_100g": 57.5,
      "sugars_100g": 56.7,
      "fiber_100g": 3.5,
      "proteins_100g": 6.3,
      "salt_100g": 0.1,
    },
  },
};

// --- ejemplo 2: producto con datos faltantes ---

export const RESPUESTA_INCOMPLETA = {
  code: "1234567890123",
  status: 1,
  product: {
    product_name: "Producto generico",
    // sin brands, sin image_url, sin ecoscore
    nutriscore_grade: "c",
    nova_group: 3,
    // sin ingredients_text
    nutriments: {
      "energy-kj_100g": 500,
      "fat_100g": 5,
      // el resto de nutrientes faltan
    },
  },
};

// --- ejemplo 3: producto no encontrado ---

export const RESPUESTA_NO_ENCONTRADO = {
  code: "0000000000000",
  status: 0,
  status_verbose: "product not found",
};

// --- ejemplo 4: busqueda de productos ---

export const RESPUESTA_BUSQUEDA = {
  count: 42,
  page: 1,
  page_size: 3,
  products: [
    {
      code: "3017620422003",
      product_name: "Nutella",
      brands: "Nutella",
      image_url: "https://static.openfoodfacts.org/images/products/301/762/042/2003/front_en.3.400.jpg",
      nutriscore_grade: "e",
      ecoscore_grade: "e",
      nova_group: 4,
    },
    {
      code: "3017620422004",
      product_name: "Kinder Bueno",
      brands: "Kinder, Ferrero",
      image_url: "",
      nutriscore_grade: "e",
      ecoscore_grade: "unknown",
      nova_group: 4,
    },
  ],
};

// --- demostracion del transformador ---
// los resultados no se imprimen en ningun lado;
// el codigo de abajo muestra como se llama y que devuelve cada transformacion

function demo() {
  // caso 1: producto normal
  const t1 = transformarProducto(RESPUESTA_NUTELLA.product as any);
  console.log("caso 1 - producto normal:", t1?.nombre);
  console.log("  nutriScore:", t1?.nutriScore, "-", t1?.nutriScore === "E");
  console.log("  grupoNova:", t1?.grupoNova);
  console.log("  imagenUrl:", t1?.imagenUrl?.slice(0, 40) + "...");
  console.log("  energia:", t1?.nutrientes.energia, "kJ");

  // caso 2: producto incompleto (fallbacks)
  const t2 = transformarProducto(RESPUESTA_INCOMPLETA.product as any);
  console.log("\ncaso 2 - incompleto:", t2?.nombre);
  console.log("  marcas (vacio):", `"${t2?.marcas}"`);
  console.log("  ecoScore default:", t2?.ecoScore);
  console.log("  ingredientes default:", t2?.ingredientes);
  console.log("  grasaSaturada (fallback):", t2?.nutrientes.grasaSaturada);

  // caso 3: producto no encontrado
  const t3 = transformarProducto((RESPUESTA_NO_ENCONTRADO as any).product);
  console.log("\ncaso 3 - no encontrado:", t3);

  // caso 4: busqueda
  const busqueda = transformarResultadoBusqueda(RESPUESTA_BUSQUEDA as any);
  console.log("\ncaso 4 - busqueda:");
  console.log("  total:", busqueda.total);
  console.log("  productos en pagina:", busqueda.productos.length);
  busqueda.productos.forEach((p) => {
    console.log("   -", p.nombre, "|", p.codigoBarras);
  });
}

// descomentar para probar:
// demo();
