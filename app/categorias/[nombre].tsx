import ListadoProductos from "@/components/ListadoProductos";
import { categorias } from "@/data/categorias";
import { useProductos } from "@/hooks/useProductos";
import type { ProductoAPIResumen } from "@/transformers/openFoodFactsTransformer";
import { Stack, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type CategoriaParams = {
  nombre: string;
};

const PAIS_ARGENTINA = "en:argentina";

// las categorias de open food facts son colaborativas y ruidosas
// un producto puede aparecer como "snack" cuando en realidad es fideo
// por eso aplicamos dos mecanismos:
//   - excluir: filtro fuerte -- elimina productos que sabemos no corresponden
//   - incluir: ordenamiento suave -- productos afines van primero en la lista
// incluir NO es un filtro porque la api ya devolvio resultados para el tag
// de la categoria; los sub-tags son muy especificos y excluirian productos
// validos que no los tengan (pisar los resultados de la api)

type ReglasFiltro = {
  incluir: string[];
  excluir: string[];
};

const REGLAS_FILTRO: Record<string, ReglasFiltro> = {
  beverages: {
    // solo bebidas gasificadas, agua, jugos
    incluir: [
      "en:sodas",
      "en:carbonated-drinks",
      "en:waters",
      "en:fruit-juices",
      "en:juices-and-nectars",
      "en:soft-drinks",
    ],
    // nada de yerba, te, cafe, o vegetales disfrazados de bebida
    excluir: [
      "en:yerba-mate",
      "en:teas",
      "en:coffees",
      "en:plant-based-foods",
    ],
  },
  snacks: {
    // solo snacks salados, papas, galletitas saladas
    incluir: [
      "en:salty-snacks",
      "en:chips-and-fries",
      "en:crackers",
      "en:snack-foods",
    ],
    // nada de fideos, pastas, comidas preparadas
    excluir: [
      "en:pasta",
      "en:noodles",
      "en:meals",
      "en:prepared-meals",
    ],
  },
};

// excluir productos que no corresponden y ordenar los relevantes primero
function ordenarPriorizandoTags(
  productos: ProductoAPIResumen[],
  reglas: ReglasFiltro | undefined
): ProductoAPIResumen[] {
  if (!reglas) return productos;

  const sinExcluidos = reglas.excluir.length
    ? productos.filter(
        (p) => !p.categoriesTags.some((t) => reglas.excluir.includes(t))
      )
    : productos;

  if (reglas.incluir.length === 0) return sinExcluidos;

  return [...sinExcluidos].sort((a, b) => {
    const scoreA = a.categoriesTags.filter((t) =>
      reglas.incluir.includes(t)
    ).length;
    const scoreB = b.categoriesTags.filter((t) =>
      reglas.incluir.includes(t)
    ).length;
    return scoreB - scoreA;
  });
}

// muestra los productos de la api que pertenecen a esta categoria
export default function PantallaCategoria() {
  const { nombre } = useLocalSearchParams<CategoriaParams>();
  const categoria = categorias.find((c) => c.id === nombre);
  const nombreVisible = categoria?.nombre ?? nombre;
  const tagOFF = categoria?.tagOFF;
  const insets = useSafeAreaInsets();

  const { items, cargando, cargandoMas, error, cargarMas, hayMas } = useProductos({
    tipo: "categoria",
    tag: tagOFF ?? "",
    pais: PAIS_ARGENTINA,
    // categorias aplica filtro post-api para sacar productos que no corresponden
    filtrar: (productos) => ordenarPriorizandoTags(productos, REGLAS_FILTRO[nombre ?? ""]),
  });

  return (
    <View style={[styles.outer, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.container}>
          <Stack.Screen
        options={{
          title: nombreVisible.charAt(0).toUpperCase() + nombreVisible.slice(1),
          headerStyle: { backgroundColor: "#1a1a1a" },
          headerTintColor: "#fff",
        }}
      />

      <ListadoProductos
        items={items}
        cargando={cargando}
        cargandoMas={cargandoMas}
        error={error}
        cargarMas={cargarMas}
        hayMas={hayMas}
      />
    </View>
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
    paddingTop: 20,
    paddingHorizontal: 16,
    backgroundColor: "#f4f4f4",
  },
});