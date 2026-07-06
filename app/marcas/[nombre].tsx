import ListadoProductos from "@/components/ListadoProductos";
import { marcas } from "@/data/marcas";
import { useProductos } from "@/hooks/useProductos";
import { Stack, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type MarcaParams = {
  nombre: string;
};

// muestra los productos de esta marca desde la api de open food facts
export default function PantallaMarca() {
  const { nombre } = useLocalSearchParams<MarcaParams>();
  const marca = marcas.find((m) => m.id === nombre);
  const nombreVisible = marca?.nombre ?? "marca";
  const tagOFF = marca?.tagOFF;
  const insets = useSafeAreaInsets();

  const { items, cargando, cargandoMas, error, cargarMas, hayMas } = useProductos({
    tipo: "marca",
    tag: tagOFF ?? "",
  });

  if (!tagOFF) {
    return (
      <View style={[styles.outer, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.container}>
          <Stack.Screen options={{
            title: "Marca",
            headerStyle: { backgroundColor: "#1a1a1a" },
            headerTintColor: "#fff",
          }} />
          <View style={styles.centrado}>
            <Text style={styles.textoError}>
              esta marca no tiene equivalente en open food facts
            </Text>
          </View>
        </View>
      </View>
    );
  }

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

      <ListadoProductos
        items={items}
        cargando={cargando}
        cargandoMas={cargandoMas}
        error={error}
        cargarMas={cargarMas}
        hayMas={hayMas}
      />
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
  centrado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  textoError: {
    fontSize: 16,
    color: "#cc0000",
    textAlign: "center",
  },
});