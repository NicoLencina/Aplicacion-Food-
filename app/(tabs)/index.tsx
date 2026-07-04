import { armarRuta, RUTAS } from "@/constants/rutas";
import { categorias } from "@/data/categorias";
import { etiquetas } from "@/data/etiquetas";
import { marcas } from "@/data/marcas";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRouter } from "expo-router";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import "react-native-reanimated";

// esta es la pantalla principal de la maqueta
export default function IndexScreen() {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* encabezado principal de la pantalla */}
        <View style={{ width: "100%", gap: 8 }}>
          <Text style={styles.subtituloPrincipal}>GUIA DE ALIMENTOS</Text>
          <Text style={styles.tituloPrincipal}>
            Elegi una opcion y revisa la informacion
          </Text>
        </View>
        <GrillaCategorias />
        <ListaFiltros />
        <CarruselMarcas />
      </ScrollView>
    </View>
  );
}

type ItemLista = {
  id: string;
  nombre: string;
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

function GrillaCategorias() {
  const navegacion = useRouter();
  return (
    <View style={styles.bloqueLista}>
      <View style={styles.filaTitulo}>
        <Text style={styles.tituloLista}>Categorias</Text>
        <Text style={styles.textoSecundario}>ver lista</Text>
      </View>
      <FlatList
        data={categorias}
        keyExtractor={(item) => item.id}
        numColumns={2}
        scrollEnabled={false}
        columnWrapperStyle={styles.filaGrilla}
        renderItem={({ item }) => (
          <TarjetaCategoria
            item={item}
            onPress={() =>
              navegacion.push(armarRuta(RUTAS.CATEGORIA, { nombre: item.id }))
            }
          />
        )}
      />
    </View>
  );
}

function TarjetaCategoria({ item, onPress }: { item: ItemLista; onPress: () => void }) {
  const icono = ICONOS_CATEGORIA[item.id] ?? "question";
  return (
    // cada tarjeta representa una opcion de categoria
    <Pressable style={styles.tarjeta} onPress={onPress}>
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
    </Pressable>
  );
}

function CarruselMarcas() {
  const navegacion = useRouter();
  return (
    <View style={styles.bloqueLista}>
      <Text style={styles.tituloLista}>Marcas</Text>
      <Text style={styles.descripcion}>Opciones organizadas por empresa</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollMarcas}
      >
        {marcas.map((marca) => (
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

function ListaFiltros() {
  const navegacion = useRouter();
  return (
    <View style={styles.bloqueLista}>
      <Text style={styles.tituloLista}>Filtros</Text>
      <View style={styles.contenedorItems}>
        {etiquetas.map((etiqueta) => (
          <Pressable
            key={etiqueta.id}
            onPress={() =>
              navegacion.push(armarRuta(RUTAS.FILTRO, { nombre: etiqueta.id }))
            }
            style={styles.itemButton}
          >
            <Text style={styles.itemText}>
              {etiqueta.nombre.charAt(0).toUpperCase() + etiqueta.nombre.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    paddingVertical: 32,
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

  contenedorItems: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  itemButton: {
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: "#e6e6e6",
    borderWidth: 1,
    borderColor: "#d0d0d0",
  },
  itemText: {
    fontSize: 15,
    color: "#333",
  },
  tarjeta: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  filaGrilla: {
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
  },
});
