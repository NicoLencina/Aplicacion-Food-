import ListadoVacio from "@/components/ListadoVacio";
import TarjetaProducto from "@/components/TarjetaProducto";
import { etiquetas } from "@/data/etiquetas";
import { productos } from "@/data/productos";
import { Stack, useLocalSearchParams } from "expo-router";
import { FlatList, StyleSheet, View } from "react-native";

type EtiquetaParams = {
  nombre: string;
};

// muestra los productos que tienen esta etiqueta
export default function PantallaFiltro() {
  const { nombre } = useLocalSearchParams<EtiquetaParams>();
  const nombreVisible =
    etiquetas.find((etiqueta) => etiqueta.id === nombre)?.nombre ?? nombre;

  const filtrados = productos.filter((p) => p.etiquetaIds.includes(nombre));

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: nombreVisible.charAt(0).toUpperCase() + nombreVisible.slice(1),
        }}
      />

      {filtrados.length === 0 ? (
        <ListadoVacio />
      ) : (
        <FlatList
          data={filtrados}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TarjetaProducto producto={item} />}
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
});
