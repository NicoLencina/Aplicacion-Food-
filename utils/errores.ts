// para diferenciar los errores vamos a crear una funcion que nos diga si es un error de red o no, y otra que nos diga el status del error
function esErrorDeRed(e: unknown): boolean {
  if (e instanceof TypeError && e.message === "Network request failed") {
    return true;
  }
  if (e !== null && typeof e === "object" && (e as Record<string, unknown>).name === "AbortError") {
    return true;
  }
  return false;
}

// para diferenciar los errores vamos a crear una funcion que nos diga si es un error de red o no, y otra que nos diga el status del error
function extraerStatus(e: unknown): number | null {
  if (!(e instanceof Error)) return null;
  const match = e.message.match(/estado (\d+)/);
  return match ? Number(match[1]) : null;
}

// esta funcion recibe un error y devuelve un mensaje de error amigable para el usuario, ya que se me mete en la vista del usuario el error de la api
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
