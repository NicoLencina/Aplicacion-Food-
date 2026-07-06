import ListadoVacio from "@/components/ListadoVacio";
import TarjetaProducto from "@/components/TarjetaProducto";
import type { ProductoParaTarjeta } from "@/components/TarjetaProducto";
import { categorias } from "@/data/categorias";
import { buscarProductos } from "@/services/openFoodFacts";
import { mensajeErrorAmigable } from "@/utils/errores";
import type { ProductoAPIResumen } from "@/transformers/openFoodFactsTransformer";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type CategoriaParams = {
  nombre: string;
};

// constantes de fetching y visualizacion
const PRODUCTOS_POR_PAGINA = 20;
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

// evita repetir productos si la api devuelve codigos duplicados entre paginas
function unirSinDuplicados(
  actuales: ProductoParaTarjeta[],
  nuevos: ProductoParaTarjeta[]
) {
  const ids = new Set(actuales.map((item) => item.id));
  const filtrados = nuevos.filter((item) => !ids.has(item.id));
  return [...actuales, ...filtrados];
}

// muestra los productos de la api que pertenecen a esta categoria
export default function PantallaCategoria() {
  const { nombre } = useLocalSearchParams<CategoriaParams>();
  const categoria = categorias.find((c) => c.id === nombre);
  const nombreVisible = categoria?.nombre ?? nombre;

  const [cargando, setCargando] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ProductoParaTarjeta[]>([]);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const cargaActivaRef = useRef(0);

  // carga inicial cuando se abre la pantalla o cambia la categoria
  useEffect(() => {
    if (!nombre) return;

    const tagOFF = categorias.find((c) => c.id === nombre)?.tagOFF;

    if (!tagOFF) {
      setError(`categoria "${nombre}" no tiene equivalente en open food facts`);
      setCargando(false);
      return;
    }

    const cargaId = cargaActivaRef.current + 1;
    cargaActivaRef.current = cargaId;
    setCargando(true);
    setError(null);
    setItems([]);
    setPagina(1);
    setTotal(0);

    buscarProductos({
      categoria: tagOFF,
      pais: PAIS_ARGENTINA,
      pagina: 1,
      cantidadPorPagina: PRODUCTOS_POR_PAGINA,
    })
      .then((res) => {
        if (cargaActivaRef.current !== cargaId) return;

        const ordenados = ordenarPriorizandoTags(res.productos, REGLAS_FILTRO[nombre]);
        setItems(ordenados.map(aProductoTarjeta));
        setTotal(res.total);
      })
      .catch((e: unknown) => {
        if (cargaActivaRef.current !== cargaId) return;
        setError(mensajeErrorAmigable(e));
      })
      .finally(() => {
        if (cargaActivaRef.current === cargaId) setCargando(false);
      });

    return () => {
      if (cargaActivaRef.current === cargaId) {
        cargaActivaRef.current = cargaId + 1;
      }
    };
  }, [nombre]);

  // carga la pagina siguiente y acumula productos nuevos
  function cargarMas() {
    if (cargandoMas) return;

    const tagOFF = categorias.find((c) => c.id === nombre)?.tagOFF;
    if (!tagOFF) return;

    const cargaId = cargaActivaRef.current;
    const proxPagina = pagina + 1;
    setCargandoMas(true);

    buscarProductos({
      categoria: tagOFF,
      pais: PAIS_ARGENTINA,
      pagina: proxPagina,
      cantidadPorPagina: PRODUCTOS_POR_PAGINA,
    })
      .then((res) => {
        if (cargaActivaRef.current !== cargaId) return;

        const ordenados = ordenarPriorizandoTags(res.productos, REGLAS_FILTRO[nombre]);
        setItems((prev) => unirSinDuplicados(prev, ordenados.map(aProductoTarjeta)));
        setPagina(proxPagina);
        setTotal(res.total);
      })
      .catch(() => {
        // si falla la pagina siguiente, no mostramos error al usuario
        // simplemente no se agregan productos nuevos
      })
      .finally(() => {
        if (cargaActivaRef.current === cargaId) setCargandoMas(false);
      });
  }

  const noHayMas = items.length >= total;
  const cargarMasAlFinal = !noHayMas && items.length > 0;

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
          onEndReached={cargarMasAlFinal ? cargarMas : undefined}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            cargarMasAlFinal ? (
              <View style={styles.cargandoMas}>
                <ActivityIndicator size="small" color="#2a7f9e" />
                <Text style={styles.textoCargandoMas}>cargando mas productos...</Text>
              </View>
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
  cargandoMas: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
  },
  textoCargandoMas: {
    fontSize: 14,
    color: "#888",
  },
});
