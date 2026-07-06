import AsyncStorage from "@react-native-async-storage/async-storage";

// este servicio persiste los favoritos del usuario usando asyncstorage
// guarda una lista de objetos ProductoFavorito bajo la clave 'favoritos'

export type ProductoFavorito = {
  id: string;
  nombre: string;
  marca: string;
  nutriScore: string;
};

const CLAVE = "favoritos";

// lee la lista desde el storage
// si el json esta corrupto devuelve array vacio
export async function obtenerFavoritos(): Promise<ProductoFavorito[]> {
  try {
    const raw = await AsyncStorage.getItem(CLAVE);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // filtrar solo objetos con la estructura minima
    return parsed.filter(
      (item): item is ProductoFavorito =>
        typeof item === "object" &&
        item !== null &&
        typeof item.id === "string" &&
        typeof item.nombre === "string"
    );
  } catch {
    return [];
  }
}

// guarda la lista completa en el storage
async function guardarFavoritos(lista: ProductoFavorito[]): Promise<void> {
  await AsyncStorage.setItem(CLAVE, JSON.stringify(lista));
}

// agrega un producto si no esta ya
export async function agregarFavorito(
  producto: ProductoFavorito
): Promise<void> {
  const lista = await obtenerFavoritos();
  const existe = lista.some((p) => p.id === producto.id);
  if (!existe) {
    lista.push(producto);
    await guardarFavoritos(lista);
  }
}

// elimina un producto por su id
export async function eliminarFavorito(id: string): Promise<void> {
  const lista = await obtenerFavoritos();
  const filtrada = lista.filter((p) => p.id !== id);
  await guardarFavoritos(filtrada);
}

interface ExisteResultado {
  existe: boolean;
}

// consulta si un producto esta en favoritos
export async function esFavorito(id: string): Promise<ExisteResultado> {
  const lista = await obtenerFavoritos();
  return { existe: lista.some((p) => p.id === id) };
}

// agrega o saca segun estado actual
// devuelve el nuevo estado para que la ui reaccione rapido
export async function alternarFavorito(
  producto: ProductoFavorito
): Promise<boolean> {
  const existe = await esFavorito(producto.id);
  if (existe.existe) {
    await eliminarFavorito(producto.id);
    return false;
  } else {
    await agregarFavorito(producto);
    return true;
  }
}
