import { StyleSheet, Text } from "react-native";

// muestra mensaje cuando no hay productos para el filtro seleccionado
export default function ListadoVacio() {
  return <Text style={styles.mensajeVacio}>No hay productos</Text>;
}

const styles = StyleSheet.create({
  mensajeVacio: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#555",
  },
});
