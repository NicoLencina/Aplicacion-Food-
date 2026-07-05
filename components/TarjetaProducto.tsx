import { RUTAS, armarRuta } from "@/constants/rutas";
import { COLORES_NUTRI_SCORE } from "@/constants/scores";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

// lo minimo que necesita la tarjeta para funcionar
// sirve tanto para datos locales como para datos de la api
export type ProductoParaTarjeta = {
  id: string;
  nombre: string;
  marca: string;
  nutriScore: string;
};

type Props = {
  producto: ProductoParaTarjeta;
};

// al tocar una tarjeta se abre la ficha del producto
export default function TarjetaProducto({ producto }: Props) {
  const navegacion = useRouter();
  const colorScore = COLORES_NUTRI_SCORE[producto.nutriScore] ?? "#888";

  return (
    <Pressable
      style={styles.card}
      onPress={() =>
        navegacion.push(armarRuta(RUTAS.FICHA, { id: producto.id }))
      }
    >
      <View style={styles.imagenPlaceholder}>
        <Text style={styles.imagenEmoji}>🍽️</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.nombre} numberOfLines={2}>
          {producto.nombre}
        </Text>
        <Text style={styles.marca}>{producto.marca}</Text>
      </View>

      <View style={[styles.scoreBadge, { backgroundColor: colorScore }]}>
        <Text style={styles.scoreLetra}>{producto.nutriScore}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    gap: 12,
  },
  imagenPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
    alignItems: "center",
  },
  imagenEmoji: {
    fontSize: 24,
  },
  info: {
    flex: 1,
  },
  nombre: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
  },
  marca: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  scoreBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  scoreLetra: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
  },
});
