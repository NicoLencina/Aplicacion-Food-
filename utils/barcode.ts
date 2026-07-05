interface CodigoSanitizadoValido {
  valido: true;
  codigo: string;
}

interface CodigoSanitizadoInvalido {
  valido: false;
  codigo: string;
  error: string;
}

export type CodigoSanitizado =
  | CodigoSanitizadoValido
  | CodigoSanitizadoInvalido;

// expande un upc-e de 6 digitos a upc-a de 12 digitos.
// luego se puede anteponer 0 para consultar open food facts como ean-13.
function expandirUPCE(
  d1: string,
  d2: string,
  d3: string,
  d4: string,
  d5: string
): string {
  const mid = `${d2}${d3}${d4}`;
  const lastDigit = Number(d5);

  switch (lastDigit) {
    case 0:
    case 1:
    case 2:
      return `${d1}${d2}${d3}${lastDigit}0000${d4}`;
    case 3:
      return `${d1}${d2}${d3}00000${d4}`;
    case 4:
      return `${d1}${d2}00000${d3}${d4}`;
    default:
      return `${d1}${lastDigit}0000${mid}`;
  }
}

// sanitiza y valida el codigo antes de consultar la api.
// evita pedir productos con strings vacios, controles o formatos imposibles.
export function sanitizarCodigoBarras(raw: string): CodigoSanitizado {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { valido: false, codigo: raw, error: "Código vacío" };
  }

  const clean = trimmed.replace(/[\x00-\x1f\x7f-\x9f]/g, "");
  if (!clean) {
    return { valido: false, codigo: raw, error: "Código inválido" };
  }

  const digitos = clean.replace(/\D/g, "");

  if (digitos.length === 13) {
    return { valido: true, codigo: digitos };
  }

  if (digitos.length === 8) {
    return { valido: true, codigo: digitos };
  }

  // upc-a: open food facts lo puede resolver como ean-13 con prefijo 0
  if (digitos.length === 12) {
    return { valido: true, codigo: `0${digitos}` };
  }

  if (digitos.length === 6) {
    const d1 = digitos[0]!;
    const d2 = digitos[1]!;
    const d3 = digitos[2]!;
    const d4 = digitos[3]!;
    const d5 = digitos[4]!;
    const upcA = expandirUPCE(d1, d2, d3, d4, d5);
    return { valido: true, codigo: `0${upcA}` };
  }

  // code128 existe en algunos productos, pero no debe permitir caracteres raros.
  if (/^[\x20-\x7e]{4,80}$/.test(clean)) {
    return { valido: true, codigo: clean };
  }

  return {
    valido: false,
    codigo: raw,
    error: "Formato de código no soportado",
  };
}
