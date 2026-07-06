import { RUTAS, armarRuta } from "@/constants/rutas";
import { COLORES_NUTRI_SCORE } from "@/constants/scores";
import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import type { ProductoAPIResumen } from "@/transformers/openFoodFactsTransformer";

// lo minimo que necesita la tarjeta para funcionar
// sirve tanto para datos locales como para datos de la api
export type ProductoParaTarjeta = {
  id: string;
  nombre: string;
  marca: string;
  nutriScore: string;
  imagenUrl?: string;
};

type Props = {
  producto: ProductoParaTarjeta;
};

// mapea el resumen de la api al formato que entiende la tarjeta
export function aProductoTarjeta(item: ProductoAPIResumen): ProductoParaTarjeta {
  return {
    id: item.codigoBarras,
    nombre: item.nombre,
    marca: item.marcas,
    nutriScore: item.nutriScore,
    imagenUrl: item.imagenUrl || undefined,
  };
}

// al tocar una tarjeta se abre la ficha del producto
export default function TarjetaProducto({ producto }: Props) {
  const navegacion = useRouter();
  const colorScore = COLORES_NUTRI_SCORE[producto.nutriScore] ?? "#888";
  const tieneImagen = producto.imagenUrl && producto.imagenUrl.length > 0;

  return (
    <Pressable
      style={styles.card}
      onPress={() =>
        navegacion.push(armarRuta(RUTAS.FICHA, { id: producto.id }))
      }
    >
      {tieneImagen ? (
        <Image source={{ uri: producto.imagenUrl }} style={styles.imagenProducto} />
      ) : (
        <View style={styles.imagenPlaceholder}>
          <Text style={styles.imagenEmoji}>🍽️</Text>
        </View>
      )}

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
    padding: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    gap: 8,
  },
  imagenPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
    alignItems: "center",
  },
  imagenProducto: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#f2f2f2",
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
