import { fetchProductoPorCodigo } from "@/services/openFoodFacts";
import { mensajeErrorAmigable } from "@/utils/errores";
import type { ProductoAPIDetalle } from "@/transformers/openFoodFactsTransformer";
import {
  textoEcoScore,
  textoGrupoNova,
  textoNutriScore,
} from "@/transformers/openFoodFactsTransformer";
import {
  COLORES_NUTRI_SCORE,
  COLORES_NOVA,
  COLORES_ECO_SCORE,
} from "@/constants/scores";
import type { ProductoFavorito } from "@/services/favoritos";
import { alternarFavorito, esFavorito } from "@/services/favoritos";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

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

const SIN_INFORMACION = "sin información";

export default function PantallaFicha() {
  const { id } = useLocalSearchParams<FichaParams>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [producto, setProducto] = useState<ProductoAPIDetalle | null>(null);
  const [favActivo, setFavActivo] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!id) return;

    esFavorito(id).then((r) => setFavActivo(r.existe));
  }, [id]);

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
        setError(mensajeErrorAmigable(e));
      })
      .finally(() => {
        if (activo) setLoading(false);
      });

    return () => {
      activo = false;
    };
  }, [id]);

  function handleToggleFav() {
    if (!producto) return;

    const fav: ProductoFavorito = {
      id: producto.codigoBarras,
      nombre: producto.nombre,
      marca: producto.marcas,
      nutriScore: producto.nutriScore,
      imagenUrl: producto.imagenUrl || undefined,
    };
    alternarFavorito(fav).then(setFavActivo);
  }

  if (loading) {
    return (
      <View style={[styles.outer, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.container}>
          <Stack.Screen options={{
            title: "Producto",
            headerStyle: { backgroundColor: "#1a1a1a" },
            headerTintColor: "#fff",
          }} />
          <Text style={styles.centerText}>cargando...</Text>
        </View>
      </View>
    );
  }

  if (error || !producto) {
    return (
      <View style={[styles.outer, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.container}>
          <Stack.Screen options={{
            title: "Producto",
            headerStyle: { backgroundColor: "#1a1a1a" },
            headerTintColor: "#fff",
          }} />
          <Text style={styles.centerText}>{error ?? "producto no encontrado"}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.outer, { paddingBottom: insets.bottom + 20 }]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <Stack.Screen options={{
          title: producto.nombre,
          headerStyle: { backgroundColor: "#1a1a1a" },
          headerTintColor: "#fff",
        }} />

      <View style={styles.nombreRow}>
        <Text style={styles.nombre}>{producto.nombre}</Text>
        <Pressable
          style={styles.botonFav}
          onPress={handleToggleFav}
          hitSlop={8}
        >
          <FontAwesome
            name={favActivo ? "heart" : "heart-o"}
            size={26}
            color={favActivo ? "#d32f2f" : "#888"}
          />
        </Pressable>
      </View>
      {producto.marcas ? (
        <Text style={styles.marca}>{producto.marcas}</Text>
      ) : null}

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
          value={producto.grupoNova}
          color={COLORES_NOVA[producto.grupoNova] ?? COLORES.textoMuted}
          subtitulo={textoGrupoNova(producto.grupoNova)}
        />
        <ScoreBox
          label={"Impacto\nambiental"}
          value={producto.ecoScore}
          color={COLORES_ECO_SCORE[producto.ecoScore] ?? COLORES.textoMuted}
          subtitulo={textoEcoScore(producto.ecoScore)}
        />
      </View>

      <InfoSeccion titulo="Ingredientes">
        <IngredientesLista texto={producto.ingredientes} />
      </InfoSeccion>

      <InfoSeccion titulo="Informacion nutricional (por 100g/ml)">
        <NutrienteFila label="Energia" valor={producto.nutrientes.energiaKcal} unidad="kcal" />
        <NutrienteFila label="Energia" valor={producto.nutrientes.energia} unidad="kJ" />
        <NutrienteFila label="Grasas" valor={producto.nutrientes.grasa} unidad="g" />
        <NutrienteFila
          label="de las cuales saturadas"
          valor={producto.nutrientes.grasaSaturada}
          unidad="g"
          subfila
        />
        <NutrienteFila
          label="monoinsaturadas"
          valor={producto.nutrientes.grasaMonoinsaturada}
          unidad="g"
          subfila
        />
        <NutrienteFila
          label="poliinsaturadas"
          valor={producto.nutrientes.grasaPoliinsaturada}
          unidad="g"
          subfila
        />
        <NutrienteFila
          label="trans"
          valor={producto.nutrientes.grasaTrans}
          unidad="g"
          subfila
        />
        <NutrienteFila label="Colesterol" valor={producto.nutrientes.colesterol} unidad="mg" />
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
        <NutrienteFila label="Sodio" valor={producto.nutrientes.sodio} unidad="g" />
        <NutrienteFila
          label="Vitamina A"
          valor={producto.nutrientes.vitaminaA}
          unidad="µg"
        />
        <NutrienteFila
          label="Vitamina C"
          valor={producto.nutrientes.vitaminaC}
          unidad="mg"
        />
        <NutrienteFila label="Calcio" valor={producto.nutrientes.calcio} unidad="mg" />
        <NutrienteFila label="Hierro" valor={producto.nutrientes.hierro} unidad="mg" />
      </InfoSeccion>
    </ScrollView>
    </View>
  );
}

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

function IngredientesLista({ texto }: { texto: string }) {
  const ingredientes = texto
    .split(/,(?!\d)/)
    .map((ingrediente) => ingrediente.trim())
    .filter(Boolean);

  if (ingredientes.length === 0) {
    return <Text style={styles.infoTexto}>{SIN_INFORMACION}</Text>;
  }

  return (
    <View style={styles.listaIngredientes}>
      {ingredientes.map((ingrediente, index) => (
        <View key={`${ingrediente}-${index}`} style={styles.filaIngrediente}>
          <Text style={styles.bulletIngrediente}>•</Text>
          <Text style={styles.textoIngrediente}>{ingrediente}</Text>
        </View>
      ))}
    </View>
  );
}

function NutrienteFila({
  label,
  valor,
  unidad,
  subfila = false,
}: {
  label: string;
  valor: number | null;
  unidad?: string;
  subfila?: boolean;
}) {
  const hayValor = typeof valor === "number" && Number.isFinite(valor);
  const valorStr = hayValor ? valor.toFixed(1) : SIN_INFORMACION;

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
        {hayValor && unidad ? ` ${unidad}` : ""}
      </Text>
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
    backgroundColor: COLORES.fondo,
  },
  scrollContent: {
    padding: 20,
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
  nombreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  nombre: {
    fontSize: 30,
    fontWeight: "900",
    color: COLORES.principal,
    textAlign: "center",
    flexWrap: "wrap",
    flexShrink: 1,
  },
  botonFav: {
    padding: 4,
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
    fontSize: 11,
    color: COLORES.textoMuted,
    marginTop: 4,
    textAlign: "center",
    flexWrap: "wrap",
    flexShrink: 1,
    width: "100%",
    lineHeight: 14,
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
