import ListadoVacio from "@/components/ListadoVacio";
import ProductCard from "@/components/ProductCard";
import type { ProductoParaCard } from "@/components/ProductCard";
import { categorias } from "@/data/categorias";
import { buscarProductos } from "@/services/openFoodFacts";
import type { ProductoAPIResumen } from "@/transformers/openFoodFactsTransformer";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";

type CategoriaParams = {
  nombre: string;
};

// relaciona cada id de categoria local con su tag de open food facts
// todas las categorias locales coinciden con tags off existentes
const MAPA_CATEGORIAS_OFF: Record<string, string> = {
  beverages: "en:beverages",
  "cereals-and-potatoes": "en:cereals-and-potatoes",
  chocolates: "en:chocolates",
  meals: "en:meals",
  breakfasts: "en:breakfasts",
  "biscuits-and-cakes": "en:biscuits-and-cakes",
  dairies: "en:dairies",
  desserts: "en:desserts",
  snacks: "en:snacks",
  "plant-based-foods": "en:plant-based-foods",
};

// constantes de fetching y visualizacion
// se pide un lote grande a la api para tener margen de filtrado post-api
// la api es colaborativa y las categorias pueden venir con ruido
const CANTIDAD_A_FETCH = 60;
const CANTIDAD_A_MOSTRAR = 20;
const PAIS_ARGENTINA = "en:argentina";

// --- filtrado post-api ---
// las categorias de open food facts son colaborativas y ruidosas
// un producto puede aparecer como "snack" cuando en realidad es fideo
// por eso aplicamos dos mecanismos:
//   - excluir: filtro fuerte — elimina productos que sabemos no corresponden
//   - incluir: ordenamiento suave — productos afines van primero en la lista
// incluir NO es un filtro porque la api ya devolvio resultados para el tag
// de la categoria; los sub-tags son muy especificos y excluirian productos
// validos que no los tengan (pisar los resultados de la api)

type ReglasFiltro = {
  incluir: string[];
  excluir: string[];
};

const REGLAS_FILTRO: Record<string, ReglasFiltro> = {
  beverages: {
    // solo bebidas gasificadas, agua, jugos
    incluir: [
      "en:sodas",
      "en:carbonated-drinks",
      "en:waters",
      "en:fruit-juices",
      "en:juices-and-nectars",
      "en:soft-drinks",
    ],
    // nada de yerba, te, cafe, o vegetales disfrazados de bebida
    excluir: [
      "en:yerba-mate",
      "en:teas",
      "en:coffees",
      "en:plant-based-foods",
    ],
  },
  snacks: {
    // solo snacks salados, papas, galletitas saladas
    incluir: [
      "en:salty-snacks",
      "en:chips-and-fries",
      "en:crackers",
      "en:snack-foods",
    ],
    // nada de fideos, pastas, comidas preparadas
    excluir: [
      "en:pasta",
      "en:noodles",
      "en:meals",
      "en:prepared-meals",
    ],
  },
};

function ordenarPriorizandoTags(
  productos: ProductoAPIResumen[],
  reglas: ReglasFiltro | undefined
): ProductoAPIResumen[] {
  if (!reglas) return productos;

  // excluir es el filtro fuerte: elimina lo que sabemos que no corresponde
  const sinExcluidos = reglas.excluir.length
    ? productos.filter(
        (p) => !p.categoriesTags.some((t) => reglas.excluir.includes(t))
      )
    : productos;

  // incluir es ordenamiento suave: productos con tags afines van primero
  // asi el usuario ve lo mas relevante sin perder el resto
  if (reglas.incluir.length === 0) return sinExcluidos;

  return [...sinExcluidos].sort((a, b) => {
    const scoreA = a.categoriesTags.filter((t) =>
      reglas.incluir.includes(t)
    ).length;
    const scoreB = b.categoriesTags.filter((t) =>
      reglas.incluir.includes(t)
    ).length;
    return scoreB - scoreA;
  });
}

// mapea el resumen de la api al formato que entiende ProductCard
function aProductoCard(item: ProductoAPIResumen): ProductoParaCard {
  return {
    id: item.codigoBarras,
    nombre: item.nombre,
    marca: item.marcas,
    nutriScore: item.nutriScore,
  };
}

// muestra los productos de la api que pertenecen a esta categoria
export default function PantallaCategoria() {
  const { nombre } = useLocalSearchParams<CategoriaParams>();
  const nombreVisible =
    categorias.find((categoria) => categoria.id === nombre)?.nombre ?? nombre;

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ProductoParaCard[]>([]);

  useEffect(() => {
    if (!nombre) return;

    let activo = true;
    setCargando(true);
    setError(null);
    setItems([]);

    const tagOFF = MAPA_CATEGORIAS_OFF[nombre];

    // si la categoria no tiene equivalente en off, mostramos error
    if (!tagOFF) {
      if (activo) {
        setError(`categoria "${nombre}" no tiene equivalente en open food facts`);
        setCargando(false);
      }
      return;
    }

    buscarProductos({
      categoria: tagOFF,
      pais: PAIS_ARGENTINA,
      cantidadPorPagina: CANTIDAD_A_FETCH,
    })
      .then((res) => {
        if (!activo) return;

        const ordenados = ordenarPriorizandoTags(res.productos, REGLAS_FILTRO[nombre]);

        // si tras filtrar no queda nada, preferimos mostrar vacio
        // a mostrar productos de categorias equivocadas
        if (ordenados.length === 0) {
          setItems([]);
        } else {
          setItems(ordenados.slice(0, CANTIDAD_A_MOSTRAR).map(aProductoCard));
        }
      })
      .catch((e: Error) => {
        if (!activo) return;
        setError(e.message || "error al cargar productos");
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [nombre]);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: nombreVisible.charAt(0).toUpperCase() + nombreVisible.slice(1),
        }}
      />

      {cargando ? (
        <View style={styles.centrado}>
          <ActivityIndicator size="large" color="#2a7f9e" />
          <Text style={styles.textoCentrado}>cargando productos...</Text>
        </View>
      ) : error ? (
        <View style={styles.centrado}>
          <Text style={styles.textoError}>{error}</Text>
        </View>
      ) : items.length === 0 ? (
        <ListadoVacio />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard producto={item} />}
          contentContainerStyle={styles.lista}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  lista: {
    paddingBottom: 20,
  },
  centrado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  textoCentrado: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  textoError: {
    fontSize: 16,
    color: "#cc0000",
    textAlign: "center",
  },
});
