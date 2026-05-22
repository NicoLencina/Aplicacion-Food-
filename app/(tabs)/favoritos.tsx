import { StyleSheet, Text, View } from "react-native";

// esta pantalla queda como maqueta estatica de favoritos
export default function FavoritesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favoritos</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 12,
    backgroundColor: "#222",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
  },
});
