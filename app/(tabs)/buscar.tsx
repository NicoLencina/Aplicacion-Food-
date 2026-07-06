import FontAwesome from "@expo/vector-icons/FontAwesome";
import type { BarcodeScanningResult, BarcodeType } from "expo-camera";
import { CameraView, useCameraPermissions } from "expo-camera";
import { StatusBar } from "expo-status-bar";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { sanitizarCodigoBarras } from "@/utils/barcode";
import { fetchProductoPorCodigo } from "@/services/openFoodFacts";
import { mensajeErrorAmigable } from "@/utils/errores";
import { agregarAlHistorial } from "@/services/historial";

// tipos de codigo de barras que soporta la camara

const TIPOS_BARCODE: BarcodeType[] = [
  "ean13",
  "ean8",
  "upc_a",
  "upc_e",
  "code128",
];

const KEYBOARD_OFFSET = Platform.OS === "ios" ? 100 : 0;
const DELAY_REESCANEO_MS = 1500;

// pantalla principal de busqueda con escaner integrado
// la camara ocupa casi toda la pantalla y abajo esta el ingreso manual

export default function PantallaBusqueda() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [codigoInput, setCodigoInput] = useState("");
  const [errorCodigo, setErrorCodigo] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [tecladoVisible, setTecladoVisible] = useState(false);
  const escaneandoRef = useRef(false);
  const ultimoCodigoRef = useRef<string | null>(null);

  // cuando volvemos de la ficha, reseteamos para poder escanear de nuevo
  useFocusEffect(
    useCallback(() => {
      setScanned(false);
      escaneandoRef.current = false;
      ultimoCodigoRef.current = null;
    }, [])
  );

  const cerrarTeclado = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  const resetearEscaneo = useCallback(() => {
    cerrarTeclado();
    setErrorCodigo(null);
    setScanned(false);
    escaneandoRef.current = false;

    // delay antes de permitir re-escaneo para evitar que la camara
    // atrape el mismo codigo inmediatamente
    setTimeout(() => {
      ultimoCodigoRef.current = null;
    }, DELAY_REESCANEO_MS);
  }, [cerrarTeclado]);

  const procesarCodigo = useCallback(
    async (codigo: string) => {
      setCargando(true);
      setErrorCodigo(null);

      try {
        const res = await fetchProductoPorCodigo(codigo);
        if (res.encontrado && res.producto) {
          setCodigoInput("");
          cerrarTeclado();
          agregarAlHistorial({
            id: res.producto.codigoBarras,
            nombre: res.producto.nombre,
            marca: res.producto.marcas,
            nutriScore: res.producto.nutriScore,
          });
          router.push(`/fichas/${encodeURIComponent(codigo)}`);
        } else {
          setErrorCodigo("Producto no encontrado");
        }
      } catch (e) {
        setErrorCodigo(mensajeErrorAmigable(e));
      } finally {
        setCargando(false);
        escaneandoRef.current = false;
      }
    },
    [cerrarTeclado],
  );

  const handleBarcodeScanned = useCallback(
    (result: BarcodeScanningResult) => {
      if (scanned || escaneandoRef.current) return;

      const sanitizado = sanitizarCodigoBarras(result.data);
      if (!sanitizado.valido) {
        setErrorCodigo(sanitizado.error);
        return;
      }

      // no procesar el mismo codigo dos veces seguidas
      if (ultimoCodigoRef.current === sanitizado.codigo) return;
      ultimoCodigoRef.current = sanitizado.codigo;

      escaneandoRef.current = true;
      setScanned(true);
      setCodigoInput("");

      procesarCodigo(sanitizado.codigo);
    },
    [scanned, procesarCodigo],
  );

  const handleBuscar = useCallback(() => {
    if (escaneandoRef.current) return;

    cerrarTeclado();

    const resultado = sanitizarCodigoBarras(codigoInput);
    if (!resultado.valido) {
      setErrorCodigo(resultado.error);
      setScanned(false);
      escaneandoRef.current = false;
      return;
    }
    escaneandoRef.current = true;
    setScanned(true);
    setErrorCodigo(null);
    setCodigoInput("");
    procesarCodigo(resultado.codigo);
  }, [codigoInput, procesarCodigo, cerrarTeclado]);

  return (
    <>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior="padding"
        keyboardVerticalOffset={KEYBOARD_OFFSET}
      >
      {/* seccion de la camara con escaneo */}
      <Pressable style={styles.cameraSection} onPress={cerrarTeclado}>
        {permission?.granted ? (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: TIPOS_BARCODE }}
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          />
        ) : (
          <View style={styles.permissionContainer}>
            <FontAwesome name="camera" size={48} color="#555" />
            <Text style={styles.permissionText}>
              Necesitamos acceso a la cámara para escanear códigos de barras
            </Text>
            {permission?.canAskAgain !== false && (
              <Pressable style={styles.permissionButton} onPress={requestPermission}>
                <Text style={styles.permissionButtonText}>Permitir acceso</Text>
              </Pressable>
            )}
            {permission?.canAskAgain === false && (
              <Text style={styles.permissionDenied}>
                El acceso fue denegado permanentemente. Habilitalo desde los ajustes del dispositivo.
              </Text>
            )}
          </View>
        )}

        {/* guia visual para el escaneo */}
        <View style={styles.scanFrame} pointerEvents="box-none">
          {cargando ? (
            <View style={styles.cargandoContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.cargandoTexto}>Buscando producto...</Text>
            </View>
          ) : errorCodigo ? (
            <View style={styles.errorContainer}>
              <FontAwesome name="exclamation-triangle" size={28} color="#e57373" />
              <Text style={styles.errorTextoOverlay}>{errorCodigo}</Text>
              <Pressable style={styles.reintentarButton} onPress={resetearEscaneo}>
                <Text style={styles.reintentarButtonText}>Volver a escanear</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.scanFrameBorder}>
                <FontAwesome name="barcode" size={36} color="rgba(255,255,255,0.7)" />
              </View>
              <Text style={styles.scanHint}>Escaneá el código de barras</Text>
            </>
          )}
        </View>
      </Pressable>

      {/* panel inferior con ingreso manual */}
      <View style={styles.bottomPanel}>
        <View style={styles.separadorRow}>
          {tecladoVisible && (
            <Pressable style={styles.cerrarTecladoButton} onPress={cerrarTeclado}>
              <FontAwesome name="chevron-down" size={14} color="#888" />
            </Pressable>
          )}
          <Text style={styles.separador}>— o ingresá el código manualmente —</Text>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Código de barras"
            placeholderTextColor="#888"
            keyboardType="number-pad"
            maxLength={13}
            value={codigoInput}
            onChangeText={(t) => {
              setCodigoInput(t);
              if (errorCodigo) {
                setErrorCodigo(null);
                setScanned(false);
                escaneandoRef.current = false;
                ultimoCodigoRef.current = null;
              }
            }}
            onSubmitEditing={handleBuscar}
            returnKeyType="go"
            onFocus={() => setTecladoVisible(true)}
            onBlur={() => setTecladoVisible(false)}
          />

          <Pressable
            style={[styles.buscarButton, (!codigoInput.trim() || cargando) && styles.buscarButtonDisabled]}
            onPress={handleBuscar}
            disabled={!codigoInput.trim() || cargando}
          >
            {cargando ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <FontAwesome name="search" size={18} color="#fff" />
                <Text style={styles.buscarButtonText}>Buscar</Text>
              </>
            )}
          </Pressable>
        </View>

        {errorCodigo && (
          <Text style={styles.errorText}>{errorCodigo}</Text>
        )}
      </View>
    </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },

  // --- seccion de la camara ---

  cameraSection: {
    flex: 1,
    position: "relative",
  },
  scanFrame: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  scanFrameBorder: {
    width: 220,
    height: 140,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  scanHint: {
    fontSize: 15,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
  },

  // --- carga y error en el overlay de la camara ---

  cargandoContainer: {
    alignItems: "center",
    gap: 12,
  },
  cargandoTexto: {
    fontSize: 15,
    color: "#fff",
  },
  errorContainer: {
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 20,
    borderRadius: 14,
    marginHorizontal: 32,
  },
  errorTextoOverlay: {
    fontSize: 15,
    color: "#e57373",
    textAlign: "center",
    fontWeight: "600",
  },
  reintentarButton: {
    marginTop: 4,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#2a7f9e",
    borderRadius: 10,
  },
  reintentarButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },

  // --- permisos de camara ---

  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    padding: 32,
  },
  permissionText: {
    fontSize: 15,
    color: "#999",
    textAlign: "center",
    lineHeight: 22,
  },
  permissionDenied: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    lineHeight: 18,
  },
  permissionButton: {
    backgroundColor: "#2a7f9e",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  permissionButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },

  // --- panel inferior ---

  bottomPanel: {
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 32,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  separadorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    minHeight: 28,
  },
  separador: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
  },
  inputRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#2a2a2a",
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#444",
  },
  cerrarTecladoButton: {
    position: "absolute",
    left: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#2a2a2a",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3a3a3a",
  },
  buscarButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#2a7f9e",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  buscarButtonDisabled: {
    opacity: 0.4,
  },
  buscarButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  errorText: {
    fontSize: 13,
    color: "#e57373",
    textAlign: "center",
  },
});
