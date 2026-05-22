import { categorias } from "@/data/categorias";
import { etiquetas } from "@/data/etiquetas";
import { marcas } from "@/data/marcas";
import { productos } from "@/data/productos";
import { StyleSheet, Text } from "react-native";

type TipoFiltro = "categoria" | "marca" | "etiquetas";

type Props = {
  tipo: TipoFiltro;
  valor: string;
};

// este componente muestra una pantalla vacia segun la opcion elegida
export default function ListadoVacio({ tipo, valor }: Props) {
  // nombreVisible convierte el id interno en un texto simple para pantalla
  const nombreVisible = buscarNombreVisible(tipo, valor);

  return (
    <>
      <Text style={styles.titulo}>{nombreVisible.toUpperCase()}</Text>
      <Text style={styles.mensajeVacio}>
        {productos.length === 0 ? "No hay productos" : "Hay productos cargados"}
      </Text>
    </>
  );
}

function buscarNombreVisible(tipo: TipoFiltro, valor: string) {
  // se busca el nombre en español segun la pantalla donde entro el usuario
  if (tipo === "categoria") {
    return categorias.find((categoria) => categoria.id === valor)?.nombre ?? valor;
  }

  if (tipo === "marca") {
    return marcas.find((marca) => marca.id === valor)?.nombre || "marca";
  }

  return etiquetas.find((etiqueta) => etiqueta.id === valor)?.nombre ?? valor;
}

const styles = StyleSheet.create({
  titulo: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 4,
    paddingHorizontal: 6,
    color: "#222",
  },
  mensajeVacio: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#555",
  },
});
