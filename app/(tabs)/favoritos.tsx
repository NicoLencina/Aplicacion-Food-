import ListadoVacio from "@/components/ListadoVacio";
import TarjetaProducto from "@/components/TarjetaProducto";
import type { ProductoFavorito } from "@/services/favoritos";
import { eliminarFavorito, obtenerFavoritos } from "@/services/favoritos";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

// muestra los productos que el usuario guardo como favoritos

export default function PantallaFavoritos() {
  const [favoritos, setFavoritos] = useState<ProductoFavorito[]>([]);
  const [editando, setEditando] = useState(false);

  // recarga la lista cada vez que la pantalla gana foco
  useFocusEffect(
    useCallback(() => {
      obtenerFavoritos().then(setFavoritos);
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

      {favoritos.length === 0 ? (
        <ListadoVacio />
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
});
