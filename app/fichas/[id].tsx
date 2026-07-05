import { fetchProductoPorCodigo } from "@/services/openFoodFacts";
import type { ProductoAPIDetalle } from "@/transformers/openFoodFactsTransformer";
import {
  textoEcoScore,
  textoNutriScore,
} from "@/transformers/openFoodFactsTransformer";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

type FichaParams = {
  id: string;
};

const COLORES = {
  principal: "#2a7f9e",
  texto: "#222",
  textoMedio: "#444",
  textoSuave: "#666",
  textoMuted: "#888",
  fondo: "#f4f4f4",
  tarjeta: "#fff",
  borde: "#e0e0e0",
  separador: "#e8e8e8",
  imagenFondo: "#e0e0e0",
} as const;

// colores para verlos mejor y mas visual para distinguir
const COLORES_NUTRI_SCORE: Record<string, string> = {
  A: "#1a7a1a",
  B: "#53b83a",
  C: "#ffcc00",
  D: "#ff6600",
  E: "#cc0000",
};

// etiquetas NOVA con su descripcion, para que sea mas legible y entendible para el usuario, en lugar de solo mostrar el numero
const ETIQUETAS_NOVA: Record<number, string> = {
  1: "sin procesar",
  2: "ingrediente culinario",
  3: "procesado",
  4: "ultraprocesado",
};

// muestra el detalle completo de un producto
// recibe el codigo de barras desde la ruta y lo busca en la api de open food facts
export default function FichaScreen() {
  const { id } = useLocalSearchParams<FichaParams>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [producto, setProducto] = useState<ProductoAPIDetalle | null>(null);

  useEffect(() => {
    if (!id) return;

    let activo = true;

    setLoading(true);
    setError(null);
    setProducto(null);

    fetchProductoPorCodigo(id)
      .then((res) => {
        if (!activo) return;

        if (!res.encontrado || !res.producto) {
          setError("producto no encontrado");
        } else {
          setProducto(res.producto);
        }
      })
      .catch((e: Error) => {
        if (!activo) return;
        setError(e.message || "error al cargar el producto");
      })
      .finally(() => {
        if (activo) setLoading(false);
      });

    return () => {
      activo = false;
    };
  }, [id]);

  // estado: cargando
  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Producto" }} />
        <Text style={styles.centerText}>cargando...</Text>
      </View>
    );
  }

  // estado: error o producto no encontrado
  if (error || !producto) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Producto" }} />
        <Text style={styles.centerText}>{error ?? "producto no encontrado"}</Text>
      </View>
    );
  }

  // estado: producto cargado exitosamente
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <Stack.Screen options={{ title: producto.nombre }} />

      {/* nombre y marca */}
      <Text style={styles.nombre}>{producto.nombre}</Text>
      {producto.marcas ? (
        <Text style={styles.marca}>{producto.marcas}</Text>
      ) : null}

      {/* imagen */}
      <View style={styles.imagenGrande}>
        {producto.imagenUrl ? (
          <Image
            source={{ uri: producto.imagenUrl }}
            style={styles.imagen}
            resizeMode="contain"
          />
        ) : (
          <Text style={styles.imagenEmoji}>🍽️</Text>
        )}
      </View>

      {/* scores */}
      <Text style={styles.seccionTitulo}>Clasificación del producto</Text>
      <View style={styles.scoresRow}>
        <ScoreBox
          label={"Calidad\nnutricional"}
          value={producto.nutriScore}
          color={COLORES_NUTRI_SCORE[producto.nutriScore] ?? COLORES.textoMuted}
          subtitulo={textoNutriScore(producto.nutriScore)}
        />
        <ScoreBox
          label="Procesamiento"
          value={String(producto.grupoNova)}
          color={COLORES.textoMuted}
          subtitulo={ETIQUETAS_NOVA[producto.grupoNova]}
        />
        <ScoreBox
          label={"Impacto\nambiental"}
          value={producto.ecoScore}
          color={COLORES.textoMuted}
          subtitulo={textoEcoScore(producto.ecoScore)}
        />
      </View>

      {/* ingredientes */}
      <InfoSeccion titulo="Ingredientes">
        <IngredientesLista texto={producto.ingredientes} />
      </InfoSeccion>

      {/* tabla nutricional */}
      <InfoSeccion titulo="Informacion nutricional (por 100g/ml)">
        <NutrienteFila label="Energia (kJ)" valor={producto.nutrientes.energia} />
        <NutrienteFila label="Grasas" valor={producto.nutrientes.grasa} unidad="g" />
        <NutrienteFila
          label="de las cuales saturadas"
          valor={producto.nutrientes.grasaSaturada}
          unidad="g"
          subfila
        />
        <NutrienteFila
          label="Hidratos de carbono"
          valor={producto.nutrientes.carbohidratos}
          unidad="g"
        />
        <NutrienteFila
          label="de los cuales azucares"
          valor={producto.nutrientes.azucares}
          unidad="g"
          subfila
        />
        <NutrienteFila label="Fibra" valor={producto.nutrientes.fibra} unidad="g" />
        <NutrienteFila
          label="Proteinas"
          valor={producto.nutrientes.proteina}
          unidad="g"
        />
        <NutrienteFila label="Sal" valor={producto.nutrientes.sal} unidad="g" />
      </InfoSeccion>
    </ScrollView>
  );
}

// cuadro de score (nutri-score, nova, eco-score)
function ScoreBox({
  label,
  value,
  color,
  subtitulo,
}: {
  label: string;
  value: string;
  color: string;
  subtitulo?: string;
}) {
  return (
    <View style={styles.scoreBox}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <View style={[styles.scoreCirculo, { backgroundColor: color }]}>
        <Text style={styles.scoreValor}>{value}</Text>
      </View>
      {subtitulo && <Text style={styles.scoreSub}>{subtitulo}</Text>}
    </View>
  );
}

// seccion con titulo que puede estar vacia o llena
function InfoSeccion({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.seccion}>
      <Text style={styles.seccionTitulo}>{titulo}</Text>
      {children}
    </View>
  );
}

// lista ingredientes sin romper porcentajes con coma decimal, como 7,4%
function IngredientesLista({ texto }: { texto: string }) {
  const ingredientes = texto
    .split(/,(?!\d)/)
    .map((ingrediente) => ingrediente.trim())
    .filter(Boolean);

  if (ingredientes.length === 0) {
    return <Text style={styles.infoTexto}>sin informacion</Text>;
  }

  return (
    <View style={styles.listaIngredientes}>
      {ingredientes.map((ingrediente) => (
        <View key={ingrediente} style={styles.filaIngrediente}>
          <Text style={styles.bulletIngrediente}>•</Text>
          <Text style={styles.textoIngrediente}>{ingrediente}</Text>
        </View>
      ))}
    </View>
  );
}

// fila de la tabla nutricional
function NutrienteFila({
  label,
  valor,
  unidad,
  subfila = false,
}: {
  label: string;
  valor: number;
  unidad?: string;
  subfila?: boolean;
}) {
  const valorStr = valor !== undefined && valor !== null ? valor.toFixed(1) : "—";

  return (
    <View style={styles.filaNutriente}>
      <Text style={styles.filaLabel}>
        {subfila ? (
          <>
            <Text style={styles.flechaSubfila}>  ↳ </Text>
            {label}
          </>
        ) : (
          label
        )}
      </Text>
      <Text style={styles.filaValor}>
        {valorStr}
        {unidad ? ` ${unidad}` : ""}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  centerText: {
    textAlign: "center",
    marginTop: 60,
    fontSize: 18,
    color: COLORES.textoSuave,
  },
  imagenGrande: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    backgroundColor: COLORES.imagenFondo,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    overflow: "hidden",
  },
  imagen: {
    width: "100%",
    height: "100%",
  },
  imagenEmoji: {
    fontSize: 64,
  },
  nombre: {
    fontSize: 30,
    fontWeight: "900",
    color: COLORES.principal,
    textAlign: "center",
    flexWrap: "wrap",
  },
  marca: {
    fontSize: 16,
    color: COLORES.textoSuave,
    marginTop: 4,
    marginBottom: 16,
    textAlign: "center",
    flexWrap: "wrap",
  },
  scoresRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  scoreBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORES.tarjeta,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORES.borde,
  },
  scoreLabel: {
    width: "100%",
    height: 32,
    fontSize: 12,
    fontWeight: "700",
    color: COLORES.principal,
    marginBottom: 6,
    textAlign: "center",
    textAlignVertical: "center",
    flexWrap: "wrap",
    flexShrink: 1,
    lineHeight: 14,
  },
  scoreCirculo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  scoreValor: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORES.tarjeta,
  },
  scoreSub: {
    fontSize: 10,
    color: COLORES.textoMuted,
    marginTop: 4,
    textAlign: "center",
    flexWrap: "wrap",
    flexShrink: 1,
    width: "100%",
    lineHeight: 13,
  },
  seccion: {
    marginBottom: 20,
  },
  seccionTitulo: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORES.principal,
    marginBottom: 10,
  },
  infoTexto: {
    fontSize: 15,
    color: COLORES.texto,
    lineHeight: 22,
    flexWrap: "wrap",
  },
  listaIngredientes: {
    gap: 3,
  },
  filaIngrediente: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  bulletIngrediente: {
    width: 18,
    fontSize: 17,
    lineHeight: 20,
    color: COLORES.principal,
  },
  textoIngrediente: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    color: COLORES.texto,
  },
  filaNutriente: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: COLORES.separador,
  },
  filaLabel: {
    fontSize: 15,
    color: COLORES.textoMedio,
    flex: 1,
  },
  flechaSubfila: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORES.principal,
  },
  filaValor: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORES.texto,
  },
});
