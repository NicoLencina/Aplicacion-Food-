import ListadoVacio from "@/components/ListadoVacio";
import { categorias } from "@/data/categorias";
import { Stack, useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";

type CategoriaParams = {
  nombre: string;
};

// esta pantalla recibe el nombre de la categoria desde la ruta
export default function PantallaCategoria() {
  const { nombre } = useLocalSearchParams<CategoriaParams>();
  const nombreVisible = categorias.find((categoria) => categoria.id === nombre)?.nombre ?? nombre;

  return (
    <View style={styles.container}>
      {/* este titulo aparece arriba cuando se abre la pantalla */}
      <Stack.Screen
        options={{ title: nombreVisible.charAt(0).toUpperCase() + nombreVisible.slice(1) }}
      />
      <ListadoVacio tipo="categoria" valor={nombre} />
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
});
