import { armarRuta, RUTAS } from "@/constants/rutas";
import { categorias } from "@/data/categorias";
import { etiquetas } from "@/data/etiquetas";
import { marcas } from "@/data/marcas";
import { COLORES_NUTRI_SCORE } from "@/constants/scores";
import { obtenerHistorial } from "@/services/historial";
import type { ProductoHistorial } from "@/services/historial";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "react-native-reanimated";

function coincide(texto: string, busqueda: string): boolean {
  return texto.toLowerCase().includes(busqueda.toLowerCase());
}

// esta es la pantalla principal de la maqueta
export default function IndexScreen() {
  const [busqueda, setBusqueda] = useState("");
  const [historial, setHistorial] = useState<ProductoHistorial[]>([]);

  useFocusEffect(
    useCallback(() => {
      obtenerHistorial().then(setHistorial);
    }, [])
  );

  const categoriasFiltradas = categorias.filter((c) =>
    coincide(c.nombre, busqueda)
  );
  const marcasFiltradas = marcas.filter((m) =>
    coincide(m.nombre, busqueda)
  );
  const etiquetasFiltradas = etiquetas.filter((e) =>
    coincide(e.nombre, busqueda)
  );
  const hayResultados =
    categoriasFiltradas.length > 0 ||
    marcasFiltradas.length > 0 ||
    etiquetasFiltradas.length > 0;

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#1a1a1a" }}>
      <View style={{ flex: 1, backgroundColor: "#f4f4f4" }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* encabezado principal de la pantalla */}
        <View style={{ width: "100%", gap: 8 }}>
          <Text style={styles.subtituloPrincipal}>GUIA DE ALIMENTOS</Text>
          <Text style={styles.tituloPrincipal}>
            Elegi una opcion y revisa la informacion
          </Text>
        </View>

        {/* busqueda textual por marca, etiqueta o categoria */}
        <TextInput
          style={styles.inputBusqueda}
          placeholder="buscar por marca, etiqueta o categoria..."
          placeholderTextColor="#999"
          value={busqueda}
          onChangeText={setBusqueda}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />

        {busqueda.length > 0 && !hayResultados && (
          <Text style={styles.sinResultados}>
            no hay resultados para {'\u201C'}{busqueda}{'\u201D'}
          </Text>
        )}

        {(!busqueda || categoriasFiltradas.length > 0) && (
          <GrillaCategorias solo={busqueda ? categoriasFiltradas : undefined} />
        )}
        {(!busqueda || marcasFiltradas.length > 0) && (
          <CarruselMarcas solo={busqueda ? marcasFiltradas : undefined} />
        )}
        <CarruselHistorial items={historial} />
        {(!busqueda || etiquetasFiltradas.length > 0) && (
          <CarruselFiltros solo={busqueda ? etiquetasFiltradas : undefined} />
        )}
      </ScrollView>
      </View>
    </SafeAreaView>
  );
}

type ItemLista = {
  id: string;
  nombre: string;
};

// este objeto relaciona cada categoria con una imagen local
const IMAGENES_CATEGORIA: Record<string, any> = {
  beverages: require("@/assets/images/categorias/bebidas.jpg"),
};

// este objeto relaciona cada categoria con un icono visual
const ICONOS_CATEGORIA: Record<string, string> = {
  beverages: "coffee",
  dairies: "tint",
  snacks: "star",
  breakfasts: "sun-o",
  desserts: "birthday-cake",
  chocolates: "heart",
  "biscuits-and-cakes": "cubes",
  "cereals-and-potatoes": "leaf",
  meals: "cutlery",
  "plant-based-foods": "pagelines",
};

function GrillaCategorias({ solo }: { solo?: typeof categorias }) {
  const navegacion = useRouter();
  const datos = solo ?? categorias;
  return (
    <View style={styles.bloqueLista}>
      <View style={styles.filaTitulo}>
        <Text style={styles.tituloLista}>Categorias</Text>
        <Text style={styles.textoSecundario}>ver lista</Text>
      </View>
      {datos.length === 0 ? null : (
        <View style={styles.grillaCategorias}>
          {Array.from({ length: Math.ceil(datos.length / 2) }, (_, i) => (
            <View key={i} style={styles.filaGrilla}>
              {datos.slice(i * 2, i * 2 + 2).map((item) => (
                <TarjetaCategoria
                  key={item.id}
                  item={item}
                  onPress={() =>
                    navegacion.push(armarRuta(RUTAS.CATEGORIA, { nombre: item.id }))
                  }
                />
              ))}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function TarjetaCategoria({ item, onPress }: { item: ItemLista; onPress: () => void }) {
  const icono = ICONOS_CATEGORIA[item.id] ?? "question";
  const imagen = IMAGENES_CATEGORIA[item.id];
  return (
    // cada tarjeta representa una opcion de categoria
    <Pressable style={styles.tarjeta} onPress={onPress}>
      {imagen ? (
        <View style={styles.tarjetaConImagen}>
          <View style={styles.imagenWrapper}>
            <Image source={imagen} style={styles.imagenCategoria} resizeMode="contain" />
          </View>
          <View style={styles.textoOverlay}>
            <Text style={styles.textoOverlayText}>
              {item.nombre.charAt(0).toUpperCase() + item.nombre.slice(1)}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.tarjetaInterna}>
          <FontAwesome
            name={icono as any}
            size={32}
            color="#555"
            style={styles.iconoTarjeta}
          />
          <Text style={styles.textoTarjeta}>
            {item.nombre.charAt(0).toUpperCase() + item.nombre.slice(1)}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

function CarruselMarcas({ solo }: { solo?: typeof marcas }) {
  const navegacion = useRouter();
  const datos = solo ?? marcas;
  if (datos.length === 0) return null;
  return (
    <View style={styles.bloqueLista}>
      <Text style={styles.tituloLista}>Marcas</Text>
      <Text style={styles.descripcion}>Opciones organizadas por empresa</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollMarcas}
      >
        {datos.map((marca) => (
          <Pressable
            key={marca.id}
            style={styles.marcaCard}
            onPress={() =>
              navegacion.push(armarRuta(RUTAS.MARCA, { nombre: marca.id }))
            }
          >
            <View style={styles.imagenPlaceholder} />
            <Text style={styles.marcaText}>{marca.nombre}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function CarruselHistorial({ items }: { items: ProductoHistorial[] }) {
  const navegacion = useRouter();
  return (
    <View style={styles.bloqueLista}>
      <Text style={styles.tituloLista}>Historias de escaneos</Text>
      <Text style={styles.descripcion}>Ultimos productos escaneados</Text>
      {items.length === 0 ? (
        <View style={styles.vacioHistorial}>
          <Text style={styles.vacioHistorialText}>No hay productos escaneados todavia</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollMarcas}
        >
          {items.slice(0, 10).map((item) => (
            <Pressable
              key={`${item.id}-${item.timestamp}`}
              style={styles.marcaCard}
              onPress={() =>
                navegacion.push(`/fichas/${encodeURIComponent(item.id)}`)
              }
            >
              <View style={[styles.imagenPlaceholder, { backgroundColor: COLORES_NUTRI_SCORE[item.nutriScore] ?? "#f0f0f0" }]}>
                <Text style={styles.scoreEnCard}>{item.nutriScore}</Text>
              </View>
              <Text style={styles.marcaText} numberOfLines={2}>{item.nombre}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function CarruselFiltros({ solo }: { solo?: typeof etiquetas }) {
  const navegacion = useRouter();
  const datos = solo ?? etiquetas;
  if (datos.length === 0) return null;
  return (
    <View style={styles.bloqueLista}>
      <Text style={styles.tituloLista}>Filtros</Text>
      <Text style={styles.descripcion}>Opciones para filtrar productos</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollMarcas}
      >
        {datos.map((etiqueta) => (
          <Pressable
            key={etiqueta.id}
            style={styles.marcaCard}
            onPress={() =>
              navegacion.push(armarRuta(RUTAS.FILTRO, { nombre: etiqueta.id }))
            }
          >
            <View style={styles.imagenPlaceholder}>
              <FontAwesome name="tag" size={22} color="#888" />
            </View>
            <Text style={styles.marcaText}>
              {etiqueta.nombre.charAt(0).toUpperCase() + etiqueta.nombre.slice(1)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    paddingTop: 16,
    paddingBottom: 28,
    paddingHorizontal: 16,
    backgroundColor: "#f4f4f4",
  },
  subtituloPrincipal: {
    fontSize: 12,
    color: "#555",
    letterSpacing: 1.5,
    fontWeight: "700",
  },
  tituloPrincipal: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#222",
  },
  bloqueLista: {
    width: "100%",
    gap: 12,
  },
  filaTitulo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tituloLista: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
  },
  textoSecundario: {
    color: "#555",
  },

  scoreEnCard: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
  },
  grillaCategorias: {
    gap: 12,
  },
  tarjeta: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  filaGrilla: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  tarjetaInterna: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    justifyContent: "flex-end",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dddddd",
  },
  iconoTarjeta: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  textoTarjeta: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
  },
  tarjetaConImagen: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#dddddd",
  },
  imagenWrapper: {
    flex: 1,
    padding: 8,
  },
  imagenCategoria: {
    flex: 1,
    width: "100%",
    borderRadius: 8,
  },
  textoOverlay: {
    backgroundColor: "#2a7f9e",
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  textoOverlayText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  descripcion: {
    fontSize: 14,
    marginTop: -10,
    paddingHorizontal: 2,
    color: "#555",
  },
  scrollMarcas: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  marcaCard: {
    width: 100,
    height: 130,
    borderRadius: 16,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: "#dddddd",
  },
  imagenPlaceholder: {
    width: 52,
    height: 52,
    backgroundColor: "#f0f0f0",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#dddddd",
  },
  marcaText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#222",
    textAlign: "center",
    paddingHorizontal: 4,
  },
  vacioHistorial: {
    width: "100%",
    height: 100,
    borderRadius: 16,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
  },
  vacioHistorialText: {
    fontSize: 14,
    color: "#999",
  },
  inputBusqueda: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#222",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  sinResultados: {
    fontSize: 15,
    color: "#888",
    textAlign: "center",
    marginTop: 8,
  },
});
