import ListadoVacio from "@/components/ListadoVacio";
import ProductCard from "@/components/ProductCard";
import { categorias } from "@/data/categorias";
import { productos } from "@/data/productos";
import { Stack, useLocalSearchParams } from "expo-router";
import { FlatList, StyleSheet, View } from "react-native";

type CategoriaParams = {
  nombre: string;
};

// muestra los productos que pertenecen a esta categoria
export default function PantallaCategoria() {
  const { nombre } = useLocalSearchParams<CategoriaParams>();
  const nombreVisible =
    categorias.find((categoria) => categoria.id === nombre)?.nombre ?? nombre;

  const filtrados = productos.filter((p) => p.categoriaId === nombre);

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
});
