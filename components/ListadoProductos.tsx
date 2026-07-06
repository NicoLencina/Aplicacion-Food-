import ListadoVacio from "@/components/ListadoVacio";
import TarjetaProducto from "@/components/TarjetaProducto";
import type { ProductoParaTarjeta } from "@/components/TarjetaProducto";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";

type Props = {
  items: ProductoParaTarjeta[];
  cargando: boolean;
  cargandoMas: boolean;
  error: string | null;
  cargarMas: () => void;
  hayMas: boolean;
};

// componente compartido para mostrar listas de productos con infinite scroll
// maneja los estados de carga, error, vacio y paginacion automatica
export default function ListadoProductos({
  items,
  cargando,
  cargandoMas,
  error,
  cargarMas,
  hayMas,
}: Props) {
  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#2a7f9e" />
        <Text style={styles.textoCentrado}>cargando productos...</Text>
      </View>
    );
  }

  if (error && items.length === 0) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.textoError}>{error}</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return <ListadoVacio />;
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <TarjetaProducto producto={item} />}
      contentContainerStyle={styles.lista}
      onEndReached={hayMas ? cargarMas : undefined}
      onEndReachedThreshold={0.3}
      ListFooterComponent={
        cargandoMas ? (
          <View style={styles.cargandoMas}>
            <ActivityIndicator size="small" color="#2a7f9e" />
            <Text style={styles.textoCargandoMas}>cargando mas productos...</Text>
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
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