function esErrorDeRed(e: unknown): boolean {
  if (e instanceof TypeError && e.message === "Network request failed") {
    return true;
  }
  if (e !== null && typeof e === "object" && (e as Record<string, unknown>).name === "AbortError") {
    return true;
  }
  return false;
}

function extraerStatus(e: unknown): number | null {
  if (!(e instanceof Error)) return null;
  const match = e.message.match(/estado (\d+)/);
  return match ? Number(match[1]) : null;
}

// convierte errores de la api en mensajes para el usuario
export function mensajeErrorAmigable(error: unknown): string {
  if (esErrorDeRed(error)) {
    return "No hay conexion a internet. Revisa tu conexion y volve a intentar.";
  }

  const status = extraerStatus(error);
  if (status !== null) {
    if (status >= 500) {
      return "El servicio de Open Food Facts no esta disponible ahora. Proba mas tarde.";
    }
    if (status === 404) {
      return "Producto no encontrado. Proba con otro codigo.";
    }
    if (status === 429) {
      return "Hiciste muchas consultas seguidas. Espera un momento y volve a intentar.";
    }
    return "Ocurrio un error al cargar los datos. Volve a intentar.";
  }

  return "Ocurrio un error inesperado. Volve a intentar.";
}
