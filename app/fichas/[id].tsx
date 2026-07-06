import { fetchProductoPorCodigo } from "@/services/openFoodFacts";
import { mensajeErrorAmigable } from "@/utils/errores";
import type { ProductoAPIDetalle, NutrientesAPI } from "@/transformers/openFoodFactsTransformer";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

      <View style={styles.barraNombreProducto}>
        <Text style={styles.textoNombreProducto}>{producto.nombre}</Text>
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
          <View style={styles.imagenPlaceholderFicha}>
            <Text style={styles.imagenEmoji}>🍽️</Text>
          </View>
        )}
        <Pressable
          style={[styles.botonFavImagen, favActivo && styles.botonFavImagenActivo]}
          onPress={handleToggleFav}
          hitSlop={8}
        >
          <FontAwesome
            name={favActivo ? "heart" : "heart-o"}
            size={20}
            color={favActivo ? "#fff" : "#fff"}
          />
        </Pressable>
      </View>

      <View style={styles.barraTituloFicha}>
        <Text style={styles.textoBarraTitulo}>Clasificacion del producto</Text>
      </View>
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

      <InfoSeccion titulo="Informacion nutricional">
        {armarFilasNutricionales(producto.nutrientes).map((f) => (
          <NutrienteFila key={`${f.label}-${f.unidad}`} label={f.label} valor={f.valor} unidad={f.unidad} subfila={f.subfila} />
        ))}
      </InfoSeccion>
    </ScrollView>
    </View>
  );
}

// arma las filas de la tabla nutricional solo con los datos que no sean null
// si la api no trajo el valor, la fila no se muestra
function armarFilasNutricionales(n: NutrientesAPI) {
  type Fila = { label: string; valor: number | null; unidad: string; subfila?: boolean };

  const todas: Fila[] = [
    { label: "Energia", valor: n.energiaKcal, unidad: "kcal" },
    { label: "Grasas", valor: n.grasa, unidad: "g" },
    { label: "saturadas", valor: n.grasaSaturada, unidad: "g", subfila: true },
    { label: "monoinsaturadas", valor: n.grasaMonoinsaturada, unidad: "g", subfila: true },
    { label: "poliinsaturadas", valor: n.grasaPoliinsaturada, unidad: "g", subfila: true },
    { label: "trans", valor: n.grasaTrans, unidad: "g", subfila: true },
    { label: "Colesterol", valor: n.colesterol, unidad: "mg" },
    { label: "Hidratos de carbono", valor: n.carbohidratos, unidad: "g" },
    { label: "azucares", valor: n.azucares, unidad: "g", subfila: true },
    { label: "Fibra", valor: n.fibra, unidad: "g" },
    { label: "Proteinas", valor: n.proteina, unidad: "g" },
    { label: "Sal", valor: n.sal, unidad: "g" },
    { label: "Sodio", valor: n.sodio, unidad: "g" },
    { label: "Vitamina A", valor: n.vitaminaA, unidad: "µg" },
    { label: "Vitamina C", valor: n.vitaminaC, unidad: "mg" },
    { label: "Calcio", valor: n.calcio, unidad: "mg" },
    { label: "Hierro", valor: n.hierro, unidad: "mg" },
  ];

  // solo devolvemos las filas donde la api trajo datos
  return todas.filter((f) => f.valor !== null);
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
    <>
      <View style={styles.barraTituloFicha}>
        <Text style={styles.textoBarraTitulo}>{titulo}</Text>
      </View>
      <View style={styles.cardSeccion}>
        <View style={styles.contenidoSeccion}>
          {children}
        </View>
      </View>
    </>
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
  barraNombreProducto: {
    backgroundColor: "#1a5f7a",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2a7f9e",
  },
  textoNombreProducto: {
    fontSize: 22,
    fontWeight: "900",
    color: "#fff",
    textAlign: "center",
  },
  barraTituloFicha: {
    backgroundColor: "#2a7f9e",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 10,
  },
  textoBarraTitulo: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  botonFavImagen: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  botonFavImagenActivo: {
    backgroundColor: "rgba(211,47,47,0.8)",
  },
  imagenPlaceholderFicha: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
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
    gap: 12,
    marginBottom: 16,
  },
  scoreBox: {
    flex: 1,
    alignItems: "center",
    backgroundColor: COLORES.fondo,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORES.borde,
  },
  scoreLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORES.principal,
    marginBottom: 10,
    textAlign: "center",
    lineHeight: 16,
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
  cardSeccion: {
    backgroundColor: COLORES.tarjeta,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORES.borde,
    overflow: "hidden",
  },
  contenidoSeccion: {
    padding: 16,
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
