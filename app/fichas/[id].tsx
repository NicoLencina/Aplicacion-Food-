import { categorias } from "@/data/categorias";
import { etiquetas } from "@/data/etiquetas";
import { productos } from "@/data/productos";
import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

type FichaParams = {
  id: string;
};

const COLORES_NUTRI_SCORE: Record<string, string> = {
  A: "#1a7a1a",
  B: "#53b83a",
  C: "#ffcc00",
  D: "#ff6600",
  E: "#cc0000",
};

const ETIQUETAS_NOVA: Record<number, string> = {
  1: "sin procesar",
  2: "ingrediente culinario",
  3: "procesado",
  4: "ultraprocesado",
};

// muestra el detalle completo de un producto
// recibe el id desde la ruta y busca el producto en la lista local
export default function FichaScreen() {
  const { id } = useLocalSearchParams<FichaParams>();

  const producto = productos.find((p) => p.id === id);

  if (!producto) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Producto" }} />
        <Text style={styles.noEncontrado}>producto no encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <Stack.Screen options={{ title: producto.nombre }} />

      {/* imagen */}
      <View style={styles.imagenGrande}>
        <Text style={styles.imagenEmoji}>🍽️</Text>
      </View>

      {/* nombre y marca */}
      <Text style={styles.nombre}>{producto.nombre}</Text>
      <Text style={styles.marca}>{producto.marca}</Text>

      {/* scores */}
      <View style={styles.scoresRow}>
        <ScoreBox
          label="Nutri-Score"
          value={producto.nutriScore}
          color={COLORES_NUTRI_SCORE[producto.nutriScore] ?? "#888"}
        />
        <ScoreBox
          label="NOVA"
          value={String(producto.novaGroup)}
          color="#888"
          subtitulo={ETIQUETAS_NOVA[producto.novaGroup]}
        />
        <ScoreBox
          label="Eco-Score"
          value={producto.ecoScore}
          color="#888"
        />
      </View>

      {/* categoria y etiquetas */}
      <InfoSeccion titulo="Categoria">
        <Text style={styles.infoTexto}>
          {categorias.find((c) => c.id === producto.categoriaId)?.nombre ?? "—"}
        </Text>
      </InfoSeccion>

      {producto.etiquetaIds.length > 0 && (
        <InfoSeccion titulo="Etiquetas">
          <View style={styles.etiquetasRow}>
            {producto.etiquetaIds.map((eid) => {
              const etiqueta = etiquetas.find((e) => e.id === eid);
              return (
                <View key={eid} style={styles.etiquetaChip}>
                  <Text style={styles.etiquetaTexto}>
                    {etiqueta?.nombre ?? eid}
                  </Text>
                </View>
              );
            })}
          </View>
        </InfoSeccion>
      )}

      {/* descripcion */}
      <InfoSeccion titulo="Descripcion">
        <Text style={styles.infoTexto}>
          {producto.descripcion || "sin informacion"}
        </Text>
      </InfoSeccion>

      {/* ingredientes */}
      <InfoSeccion titulo="Ingredientes">
        <Text style={styles.infoTexto}>
          {producto.ingredientes || "sin informacion"}
        </Text>
      </InfoSeccion>

      {/* tabla nutricional */}
      <InfoSeccion titulo="Informacion nutricional (por 100g/ml)">
        <NutrienteFila label="Energia (kJ)" valor={producto.nutrientes.energia} />
        <NutrienteFila label="Grasas" valor={producto.nutrientes.grasa} unidad="g" />
        <NutrienteFila
          label="  de las cuales saturadas"
          valor={producto.nutrientes.grasaSaturada}
          unidad="g"
        />
        <NutrienteFila
          label="Hidratos de carbono"
          valor={producto.nutrientes.carbohidratos}
          unidad="g"
        />
        <NutrienteFila
          label="  de los cuales azucares"
          valor={producto.nutrientes.azucares}
          unidad="g"
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

// fila de la tabla nutricional
function NutrienteFila({
  label,
  valor,
  unidad,
}: {
  label: string;
  valor: number;
  unidad?: string;
}) {
  const valorStr = valor !== undefined && valor !== null ? valor.toFixed(1) : "—";

  return (
    <View style={styles.filaNutriente}>
      <Text style={styles.filaLabel}>{label}</Text>
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
    backgroundColor: "#f4f4f4",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  noEncontrado: {
    textAlign: "center",
    marginTop: 60,
    fontSize: 18,
    color: "#555",
  },
  imagenGrande: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  imagenEmoji: {
    fontSize: 64,
  },
  nombre: {
    fontSize: 26,
    fontWeight: "800",
    color: "#222",
  },
  marca: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
    marginBottom: 16,
  },
  scoresRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  scoreBox: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#888",
    marginBottom: 6,
    textTransform: "uppercase",
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
    color: "#fff",
  },
  scoreSub: {
    fontSize: 10,
    color: "#888",
    marginTop: 4,
    textAlign: "center",
  },
  seccion: {
    marginBottom: 20,
  },
  seccionTitulo: {
    fontSize: 14,
    fontWeight: "700",
    color: "#888",
    textTransform: "uppercase",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  infoTexto: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
  etiquetasRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  etiquetaChip: {
    backgroundColor: "#e6f0e6",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  etiquetaTexto: {
    fontSize: 13,
    color: "#2d5a2d",
    fontWeight: "600",
  },
  filaNutriente: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e8e8e8",
  },
  filaLabel: {
    fontSize: 14,
    color: "#444",
    flex: 1,
  },
  filaValor: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
  },
});
