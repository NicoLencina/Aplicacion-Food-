import ListadoVacio from "@/components/ListadoVacio";
import TarjetaProducto from "@/components/TarjetaProducto";
import type { ProductoFavorito } from "@/services/favoritos";
import { eliminarFavorito, obtenerFavoritos } from "@/services/favoritos";
import type { ProductoHistorial } from "@/services/historial";
import { obtenerHistorial, limpiarHistorial } from "@/services/historial";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  FlatList,
} from "react-native";

// muestra los productos que el usuario guardo como favoritos
// y el historial de escaneos recientes

export default function PantallaFavoritos() {
  const navegacion = useRouter();
  const [favoritos, setFavoritos] = useState<ProductoFavorito[]>([]);
  const [historial, setHistorial] = useState<ProductoHistorial[]>([]);
  const [editando, setEditando] = useState(false);

  // recarga la lista cada vez que la pantalla gana foco
  useFocusEffect(
    useCallback(() => {
      obtenerFavoritos().then(setFavoritos);
      obtenerHistorial().then(setHistorial);
    }, [])
  );

  const confirmarEliminar = useCallback(
    (producto: ProductoFavorito) => {
      Alert.alert(
        "eliminar favorito",
        `sacar "${producto.nombre}" de favoritos?`,
        [
          { text: "cancelar", style: "cancel" },
          {
            text: "eliminar",
            style: "destructive",
            onPress: async () => {
              await eliminarFavorito(producto.id);
              setFavoritos((prev) =>
                prev.filter((p) => p.id !== producto.id)
              );
            },
          },
        ]
      );
    },
    []
  );

  const confirmarLimpiarHistorial = useCallback(() => {
    Alert.alert(
      "limpiar historial",
      "borrar todo el historial de escaneos?",
      [
        { text: "cancelar", style: "cancel" },
        {
          text: "limpiar",
          style: "destructive",
          onPress: async () => {
            await limpiarHistorial();
            setHistorial([]);
          },
        },
      ]
    );
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>Favoritos</Text>
        {favoritos.length > 0 && (
          <Pressable
            style={styles.botonEditar}
            onPress={() => setEditando((v) => !v)}
          >
            <Text style={styles.textoEditar}>
              {editando ? "listo" : "editar"}
            </Text>
          </Pressable>
        )}
      </View>

      {historial.length > 0 && (
        <View style={styles.seccion}>
          <View style={styles.filaTitulo}>
            <Text style={styles.tituloSeccion}>Ultimos escaneos</Text>
            <Pressable onPress={confirmarLimpiarHistorial}>
              <Text style={styles.textoAccion}>limpiar</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollHistorial}
          >
            {historial.slice(0, 10).map((item) => (
              <Pressable
                key={`${item.id}-${item.timestamp}`}
                style={styles.tarjetaHistorial}
                onPress={() =>
                  navegacion.push(`/fichas/${encodeURIComponent(item.id)}`)
                }
              >
                <Text style={styles.historialNombre} numberOfLines={2}>
                  {item.nombre}
                </Text>
                {item.marca ? (
                  <Text style={styles.historialMarca}>{item.marca}</Text>
                ) : null}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {favoritos.length === 0 ? (
        historial.length === 0 ? (
          <ListadoVacio />
        ) : null
      ) : (
        <FlatList
          data={favoritos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          renderItem={({ item }) => (
            <View style={styles.filaProducto}>
              <View style={styles.tarjetaWrapper}>
                <TarjetaProducto producto={item} />
              </View>
              {editando && (
                <Pressable
                  style={styles.botonQuitar}
                  onPress={() => confirmarEliminar(item)}
                >
                  <Text style={styles.textoQuitar}>✕</Text>
                </Pressable>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  encabezado: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  titulo: {
    fontSize: 32,
    fontWeight: "800",
    color: "#222",
  },
  botonEditar: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#e0e0e0",
  },
  textoEditar: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
  },
  lista: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  filaProducto: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tarjetaWrapper: {
    flex: 1,
  },
  botonQuitar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#d32f2f",
    justifyContent: "center",
    alignItems: "center",
  },
  textoQuitar: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  seccion: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filaTitulo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  tituloSeccion: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
  },
  textoAccion: {
    fontSize: 14,
    color: "#2a7f9e",
    fontWeight: "600",
  },
  scrollHistorial: {
    gap: 10,
  },
  tarjetaHistorial: {
    width: 120,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    justifyContent: "center",
  },
  historialNombre: {
    fontSize: 13,
    fontWeight: "600",
    color: "#222",
    lineHeight: 17,
  },
  historialMarca: {
    fontSize: 11,
    color: "#888",
    marginTop: 4,
  },
});
