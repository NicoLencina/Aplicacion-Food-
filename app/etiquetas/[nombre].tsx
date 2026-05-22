import { Stack, useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";
import ListadoVacio from "@/components/ListadoVacio";
import { etiquetas } from "@/data/etiquetas";

type EtiquetaParams = {
  nombre: string;
};

// esta pantalla recibe el nombre del filtro desde la ruta
export default function PantallaFiltro() {
  const { nombre } = useLocalSearchParams<EtiquetaParams>();
  const nombreVisible = etiquetas.find((etiqueta) => etiqueta.id === nombre)?.nombre ?? nombre;

  return (
    <View style={styles.container}>
      {/* este titulo aparece arriba cuando se abre la pantalla */}
      <Stack.Screen options={{ title: nombreVisible.charAt(0).toUpperCase() + nombreVisible.slice(1) }} />
      <ListadoVacio tipo="etiquetas" valor={nombre}/>
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
