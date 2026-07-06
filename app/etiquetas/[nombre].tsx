import ListadoVacio from "@/components/ListadoVacio";
import TarjetaProducto from "@/components/TarjetaProducto";
import type { ProductoParaTarjeta } from "@/components/TarjetaProducto";
import { etiquetas } from "@/data/etiquetas";
import { buscarProductos } from "@/services/openFoodFacts";
import { mensajeErrorAmigable } from "@/utils/errores";
import type { ProductoAPIResumen } from "@/transformers/openFoodFactsTransformer";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

type EtiquetaParams = {
  nombre: string;
};

const PRODUCTOS_POR_PAGINA = 20;

// mapea el resumen de la api al formato que entiende la tarjeta
function aProductoTarjeta(item: ProductoAPIResumen): ProductoParaTarjeta {
  return {
    id: item.codigoBarras,
    nombre: item.nombre,
    marca: item.marcas,
    nutriScore: item.nutriScore,
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

// muestra los productos de la api que tienen esta etiqueta
export default function PantallaEtiqueta() {
  const { nombre } = useLocalSearchParams<EtiquetaParams>();
  const etiqueta = etiquetas.find((e) => e.id === nombre);
  const nombreVisible = etiqueta?.nombre ?? "etiqueta";
  const tagOFF = etiqueta?.tagOFF;

  const [cargando, setCargando] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ProductoParaTarjeta[]>([]);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const cargaActivaRef = useRef(0);

  // carga inicial cuando se abre la pantalla o cambia la etiqueta
  useEffect(() => {
    if (!nombre || !tagOFF) return;

    const cargaId = cargaActivaRef.current + 1;
    cargaActivaRef.current = cargaId;
    setCargando(true);
    setError(null);
    setItems([]);
    setPagina(1);
    setTotal(0);

    buscarProductos({
      etiqueta: tagOFF,
      pagina: 1,
      cantidadPorPagina: PRODUCTOS_POR_PAGINA,
    })
      .then((res) => {
        if (cargaActivaRef.current !== cargaId) return;
        setItems(res.productos.map(aProductoTarjeta));
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
  }, [nombre, tagOFF]);

  // carga la pagina siguiente y acumula productos nuevos a los existentes
  function cargarMas() {
    if (!tagOFF || cargandoMas) return;

    const cargaId = cargaActivaRef.current;
    const proxPagina = pagina + 1;
    setError(null);
    setCargandoMas(true);

    buscarProductos({
      etiqueta: tagOFF,
      pagina: proxPagina,
      cantidadPorPagina: PRODUCTOS_POR_PAGINA,
    })
      .then((res) => {
        if (cargaActivaRef.current !== cargaId) return;
        setItems((prev) => unirSinDuplicados(prev, res.productos.map(aProductoTarjeta)));
        setPagina(proxPagina);
        setTotal(res.total);
      })
      .catch((e: unknown) => {
        if (cargaActivaRef.current !== cargaId) return;
        setError(mensajeErrorAmigable(e));
      })
      .finally(() => {
        if (cargaActivaRef.current === cargaId) setCargandoMas(false);
      });
  }

  const noHayMas = items.length >= total;
  const mostrarBotonVerMas = !noHayMas && items.length > 0;

  if (!tagOFF) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Etiqueta" }} />
        <View style={styles.centrado}>
          <Text style={styles.textoError}>
            esta etiqueta no tiene equivalente en open food facts
          </Text>
        </View>
      </View>
    );
  }

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
      ) : error && items.length === 0 ? (
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
            mostrarBotonVerMas ? (
              <Pressable
                style={styles.botonVerMas}
                onPress={cargarMas}
                disabled={cargandoMas}
              >
                {cargandoMas ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.indicador}>ver mas</Text>
                )}
              </Pressable>
            ) : null
          }
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
