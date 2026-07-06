import { useCallback, useEffect, useRef, useState } from "react";

import { buscarProductos } from "@/services/openFoodFacts";
import type { ProductoAPIResumen } from "@/transformers/openFoodFactsTransformer";
import { mensajeErrorAmigable } from "@/utils/errores";
import type { ProductoParaTarjeta } from "@/components/TarjetaProducto";
import { aProductoTarjeta } from "@/components/TarjetaProducto";

export type TipoFiltro = "categoria" | "marca" | "etiqueta";

type FiltroBusqueda = {
  tipo: TipoFiltro;
  tag: string;
  pais?: string;
  // funcion opcional para filtrar u ordenar los resultados despues de la api
  // categorias la usa para sacar productos que no corresponden
  filtrar?: (productos: ProductoAPIResumen[]) => ProductoAPIResumen[];
};

const PRODUCTOS_POR_PAGINA = 20;

// evita repetir productos si la api devuelve codigos duplicados entre paginas
function unirSinDuplicados(
  actuales: ProductoParaTarjeta[],
  nuevos: ProductoParaTarjeta[]
) {
  const ids = new Set(actuales.map((item) => item.id));
  const filtrados = nuevos.filter((item) => !ids.has(item.id));
  return [...actuales, ...filtrados];
}

// hook para buscar productos en la api con paginacion
// funciona para categoria, marca o etiqueta segun el filtro que le pases
// maneja carga inicial, carga de pagina siguiente y errores
export function useProductos(filtro: FiltroBusqueda) {
  const [items, setItems] = useState<ProductoParaTarjeta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const cargaActivaRef = useRef(0);

  const { tipo, tag, pais, filtrar } = filtro;

  // al principio tenia filtrar en las dependencias del useEffect
  // pero como el wrapper la recrea en cada render, disparaba la carga de nuevo
  // por eso lo guardo en un ref y lo leo adentro del efecto
  const filtrarRef = useRef(filtrar);
  filtrarRef.current = filtrar;

  // arma los parametros para la api segun el tipo de filtro
  const armarParams = useCallback(
    (pag: number) => {
      const base: Record<string, string | number> = {
        pagina: pag,
        cantidadPorPagina: PRODUCTOS_POR_PAGINA,
      };

      if (tipo === "marca") base.marca = tag;
      else if (tipo === "categoria") base.categoria = tag;
      else base.etiqueta = tag;

      if (pais) base.pais = pais;

      return base;
    },
    [tipo, tag, pais]
  );

  // carga inicial cuando cambia el tipo, tag o pais
  useEffect(() => {
    if (!tag) return;

    const cargaId = cargaActivaRef.current + 1;
    cargaActivaRef.current = cargaId;
    setCargando(true);
    setError(null);
    setItems([]);
    setPagina(1);
    setTotal(0);

    buscarProductos(armarParams(1))
      .then((res) => {
        if (cargaActivaRef.current !== cargaId) return;

        let productos = res.productos;
        if (filtrarRef.current) productos = filtrarRef.current(productos);

        setItems(productos.map(aProductoTarjeta));
        setTotal(res.total);
      })
      .catch((e: unknown) => {
        if (cargaActivaRef.current !== cargaId) return;
        setError(mensajeErrorAmigable(e));
      })
      .finally(() => {
        if (cargaActivaRef.current === cargaId) setCargando(false);
      });

    return () => {
      if (cargaActivaRef.current === cargaId) {
        cargaActivaRef.current = cargaId + 1;
      }
    };
  }, [tipo, tag, pais, armarParams]);

  // carga la pagina siguiente y acumula productos nuevos
  const cargarMas = useCallback(() => {
    if (cargandoMas || items.length >= total) return;

    const cargaId = cargaActivaRef.current;
    const proxPagina = pagina + 1;
    setCargandoMas(true);

    buscarProductos(armarParams(proxPagina))
      .then((res) => {
        if (cargaActivaRef.current !== cargaId) return;

        let productos = res.productos;
        if (filtrarRef.current) productos = filtrarRef.current(productos);

        setItems((prev) => unirSinDuplicados(prev, productos.map(aProductoTarjeta)));
        setPagina(proxPagina);
        setTotal(res.total);
      })
      .catch(() => {
        // si falla la pagina siguiente no mostramos error
        // simplemente no se agregan productos nuevos
      })
      .finally(() => {
        if (cargaActivaRef.current === cargaId) setCargandoMas(false);
      });
  }, [armarParams, cargandoMas, items.length, pagina, total]);

  const hayMas = items.length < total;

  return { items, cargando, cargandoMas, error, cargarMas, hayMas };
}