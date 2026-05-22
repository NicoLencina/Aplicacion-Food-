import { StyleSheet, Text, View } from "react-native";

// esta pantalla queda como maqueta estatica de busqueda
export default function SearchScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Busqueda</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    padding: 24,
    backgroundColor: "#222",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
  },
});
