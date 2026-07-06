// guarda el historial de productos escaneados o buscados
// los ultimos 50, ordenados del mas reciente al mas viejo

import AsyncStorage from "@react-native-async-storage/async-storage";

export type ProductoHistorial = {
  id: string;
  nombre: string;
  marca: string;
  nutriScore: string;
  timestamp: number;
};

const CLAVE = "historial";
const MAX_ITEMS = 50;

async function leer(): Promise<ProductoHistorial[]> {
  try {
    const raw = await AsyncStorage.getItem(CLAVE);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is ProductoHistorial =>
        typeof item === "object" &&
        item !== null &&
        typeof item.id === "string" &&
        typeof item.nombre === "string" &&
        typeof item.timestamp === "number"
    );
  } catch {
    return [];
  }
}

async function guardar(lista: ProductoHistorial[]): Promise<void> {
  await AsyncStorage.setItem(CLAVE, JSON.stringify(lista));
}

// agrega un producto al historial (o actualiza el timestamp si ya existe)
export async function agregarAlHistorial(
  producto: Omit<ProductoHistorial, "timestamp">
): Promise<void> {
  const lista = await leer();
  const sinDuplicado = lista.filter((p) => p.id !== producto.id);
  const actualizado: ProductoHistorial = {
    ...producto,
    timestamp: Date.now(),
  };
  const nueva = [actualizado, ...sinDuplicado].slice(0, MAX_ITEMS);
  await guardar(nueva);
}

export async function obtenerHistorial(): Promise<ProductoHistorial[]> {
  return await leer();
}

export async function limpiarHistorial(): Promise<void> {
  await guardar([]);
}
