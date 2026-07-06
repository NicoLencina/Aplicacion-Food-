import ListadoVacio from "@/components/ListadoVacio";
import TarjetaProducto from "@/components/TarjetaProducto";
import type { ProductoParaTarjeta } from "@/components/TarjetaProducto";
import { categorias } from "@/data/categorias";
import { buscarProductos } from "@/services/openFoodFacts";
import { mensajeErrorAmigable } from "@/utils/errores";
import type { ProductoAPIResumen } from "@/transformers/openFoodFactsTransformer";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type CategoriaParams = {
  nombre: string;
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
//   - excluir: filtro fuerte -- elimina productos que sabemos no corresponden
//   - incluir: ordenamiento suave -- productos afines van primero en la lista
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

// mapea el resumen de la api al formato que entiende la tarjeta
function aProductoTarjeta(item: ProductoAPIResumen): ProductoParaTarjeta {
  return {
    id: item.codigoBarras,
    nombre: item.nombre,
    marca: item.marcas,
    nutriScore: item.nutriScore,
    imagenUrl: item.imagenUrl || undefined,
  };
}

// muestra los productos de la api que pertenecen a esta categoria
export default function PantallaCategoria() {
  const { nombre } = useLocalSearchParams<CategoriaParams>();
  const categoria = categorias.find((c) => c.id === nombre);
  const nombreVisible = categoria?.nombre ?? nombre;

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todosLosItems, setTodosLosItems] = useState<ProductoParaTarjeta[]>([]);
  const [cantidadAMostrar, setCantidadAMostrar] = useState(CANTIDAD_A_MOSTRAR);

  // items visibles: slice del listado filtrado completo
  const items = todosLosItems.slice(0, cantidadAMostrar);
  const hayMasItems = cantidadAMostrar < todosLosItems.length;

  useEffect(() => {
    if (!nombre) return;

    let activo = true;
    setCargando(true);
    setError(null);
    setTodosLosItems([]);
    setCantidadAMostrar(CANTIDAD_A_MOSTRAR);

    const tagOFF = categorias.find((c) => c.id === nombre)?.tagOFF;

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
          setTodosLosItems([]);
        } else {
          // deduplica por codigo de barras por si la api repite
          const ids = new Set<string>();
          const unicos = ordenados.filter((p) => {
            if (ids.has(p.codigoBarras)) return false;
            ids.add(p.codigoBarras);
            return true;
          });
          setTodosLosItems(unicos.map(aProductoTarjeta));
        }
        setCantidadAMostrar(CANTIDAD_A_MOSTRAR);
      })
      .catch((e: unknown) => {
        if (!activo) return;
        setError(mensajeErrorAmigable(e));
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [nombre]);

  // muestra los siguientes N productos del listado filtrado
  // sin pedirle mas datos a la api (ya estan en todosLosItems)
  function cargarMas() {
    setCantidadAMostrar((prev) => prev + CANTIDAD_A_MOSTRAR);
  }

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.outer, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.container}>
          <Stack.Screen
        options={{
          title: nombreVisible.charAt(0).toUpperCase() + nombreVisible.slice(1),
          headerStyle: { backgroundColor: "#1a1a1a" },
          headerTintColor: "#fff",
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
          renderItem={({ item }) => <TarjetaProducto producto={item} />}
          contentContainerStyle={styles.lista}
          ListFooterComponent={
            hayMasItems ? (
              <Pressable style={styles.botonVerMas} onPress={cargarMas}>
                <Text style={styles.indicador}>ver mas</Text>
              </Pressable>
            ) : null
          }
        />
      )}
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 16,
    backgroundColor: "#f4f4f4",
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
  botonVerMas: {
    backgroundColor: "#2a7f9e",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  indicador: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
