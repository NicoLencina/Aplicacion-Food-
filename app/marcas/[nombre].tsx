import ListadoVacio from "@/components/ListadoVacio";
import { marcas } from "@/data/marcas";
import { Stack, useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";

type MarcaParams = {
  nombre: string;
};

// esta pantalla recibe el nombre de la marca desde la ruta
export default function PantallaMarca() {
  const { nombre } = useLocalSearchParams<MarcaParams>();
  const nombreVisible = marcas.find((marca) => marca.id === nombre)?.nombre || "marca";

  return (
    <View style={styles.container}>
      {/* este titulo aparece arriba cuando se abre la pantalla */}
      <Stack.Screen
        options={{ title: nombreVisible.charAt(0).toUpperCase() + nombreVisible.slice(1) }}
      />
      <ListadoVacio tipo="marca" valor={nombre} />
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
  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 4,
  },
});
