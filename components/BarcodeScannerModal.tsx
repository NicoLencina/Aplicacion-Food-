import { CameraView, useCameraPermissions } from "expo-camera";
import type { BarcodeScanningResult, BarcodeType } from "expo-camera";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { sanitizarCodigoBarras } from "@/utils/barcode";
import { fetchProductoPorCodigo } from "@/services/openFoodFacts";
import type { ProductoAPIDetalle } from "@/transformers/openFoodFactsTransformer";

// ---------------------------------------------------------------------------
// Tipos de código de barras para la cámara
// ---------------------------------------------------------------------------

const TIPOS_BARCODE: BarcodeType[] = [
  "ean13",
  "ean8",
  "upc_a",
  "upc_e",
  "code128",
];

// ---------------------------------------------------------------------------
// Estado del producto buscado
// ---------------------------------------------------------------------------

type ProductState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "found"; producto: ProductoAPIDetalle }
  | { status: "not_found"; error: string };

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BarcodeScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onProductoEncontrado: (codigo: string) => void;
}

// ---------------------------------------------------------------------------
// Modal del escáner
// ---------------------------------------------------------------------------

export default function BarcodeScannerModal({
  visible,
  onClose,
  onProductoEncontrado,
}: BarcodeScannerModalProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [productState, setProductState] = useState<ProductState>({
    status: "idle",
  });

  // Ref que indica si el modal está visible (evita setState post-close)
  const activoRef = useRef(false);

  // Contador de generación de escaneo. Cada vez que se inicia un nuevo
  // escaneo (al abrir el modal o al tocar "Volver a escanear") se
  // incrementa, invalidando respuestas de fetch anteriores.
  const scanGenerationRef = useRef(0);

  // Reinicia todo el estado del escáner para permitir un nuevo escaneo.
  // Esto invalida cualquier fetch en vuelo incrementando scanGeneration.
  const reiniciarEstado = useCallback(() => {
    setScanned(false);
    setScannedCode(null);
    setProductState({ status: "idle" });
    scanGenerationRef.current += 1;
  }, []);

  // Sincronizar activoRef con la visibilidad del modal y reiniciar al abrir
  useEffect(() => {
    activoRef.current = visible;
    if (visible) {
      reiniciarEstado();
    }
  }, [visible, reiniciarEstado]);

  const handleBarcodeScanned = useCallback(
    (result: BarcodeScanningResult) => {
      // El prop onBarcodeScanned ya se desactiva cuando scanned=true,
      // pero esta guardia extra cubre casos borde de concurrencia
      if (scanned) return;

      const sanitizado = sanitizarCodigoBarras(result.data);

      if (!sanitizado.valido) {
        setScanned(true);
        setScannedCode(result.data);
        setProductState({ status: "not_found", error: sanitizado.error });
        return;
      }

      const generation = scanGenerationRef.current;
      setScanned(true);
      setScannedCode(sanitizado.codigo);
      setProductState({ status: "loading" });

      fetchProductoPorCodigo(sanitizado.codigo)
        .then((res) => {
          // Ignorar si el modal se cerró o si se inició un nuevo escaneo
          if (!activoRef.current || scanGenerationRef.current !== generation) {
            return;
          }

          if (res.encontrado && res.producto) {
            setProductState({ status: "found", producto: res.producto });
          } else {
            setProductState({
              status: "not_found",
              error: "Producto no encontrado",
            });
          }
        })
        .catch((e: Error) => {
          if (!activoRef.current || scanGenerationRef.current !== generation) {
            return;
          }

          const mensaje =
            e?.message && e.message !== "Error"
              ? e.message
              : "Error al buscar producto";
          setProductState({ status: "not_found", error: mensaje });
        });
    },
    [scanned],
  );

  const handleVerProducto = useCallback(() => {
    if (!scannedCode) return;
    onProductoEncontrado(scannedCode);
    onClose();
  }, [scannedCode, onProductoEncontrado, onClose]);

  const handleVolverAEscanear = useCallback(() => {
    reiniciarEstado();
  }, [reiniciarEstado]);

  // -----------------------------------------------------------------------
  // Render según permisos
  // -----------------------------------------------------------------------

  const renderContent = () => {
    // Permisos aún cargando
    if (!permission) {
      return (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={COLORES_MODAL.acento} />
          <Text style={styles.loadingText}>Cargando cámara...</Text>
        </View>
      );
    }

    // Permisos no concedidos
    if (!permission.granted) {
      return (
        <View style={styles.centeredContainer}>
          <FontAwesome name="camera" size={48} color={COLORES_MODAL.textoSuave} />
          <Text style={styles.permissionTitle}>
            Acceso a la cámara requerido
          </Text>
          <Text style={styles.permissionText}>
            Necesitamos acceso a la cámara para escanear códigos de barras de
            productos.
          </Text>

          {permission.canAskAgain ? (
            <Pressable
              style={styles.requestButton}
              onPress={requestPermission}
            >
              <Text style={styles.requestButtonText}>
                Permitir acceso a la cámara
              </Text>
            </Pressable>
          ) : (
            <Text style={styles.permissionDeniedText}>
              El acceso a la cámara fue denegado permanentemente. Podés
              habilitarlo desde los ajustes del dispositivo.
            </Text>
          )}

          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cerrar</Text>
          </Pressable>
        </View>
      );
    }

    // Permisos concedidos — mostrar cámara
    return (
      <View style={styles.cameraWrapper}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: TIPOS_BARCODE }}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        />

        {/* Overlay con instrucciones mientras no se escaneó nada */}
        {!scanned && (
          <View style={styles.scanOverlay}>
            <View style={styles.scanFrame}>
              <FontAwesome
                name="barcode"
                size={40}
                color={COLORES_MODAL.texto}
              />
              <Text style={styles.scanHintText}>
                Escaneá el código de barras del producto
              </Text>
            </View>
          </View>
        )}

        {/* Overlay con resultado después del escaneo */}
        {scanned && (
          <ResultOverlay
            productState={productState}
            onVerProducto={handleVerProducto}
            onVolverAEscanear={handleVolverAEscanear}
            scannedCode={scannedCode}
          />
        )}

        {/* Botón de cerrar modal */}
        <Pressable style={styles.modalCloseButton} onPress={onClose}>
          <FontAwesome name="close" size={22} color="#fff" />
        </Pressable>
      </View>
    );
  };

  return (
    <Modal
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
      presentationStyle="fullScreen"
    >
      <View style={styles.modalSafe}>{renderContent()}</View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Overlay con el resultado después de escanear
// ---------------------------------------------------------------------------

function ResultOverlay({
  productState,
  onVerProducto,
  onVolverAEscanear,
  scannedCode,
}: {
  productState: ProductState;
  onVerProducto: () => void;
  onVolverAEscanear: () => void;
  scannedCode: string | null;
}) {
  return (
    <View style={styles.resultOverlayContainer}>
      {productState.status === "loading" && (
        <View style={styles.resultCard}>
          <ActivityIndicator size="large" color={COLORES_RESULT.acento} />
          <Text style={styles.resultLoadingText}>Buscando producto...</Text>
        </View>
      )}

      {productState.status === "found" && (
        <View style={styles.resultCard}>
          <Text style={styles.resultEmoji}>✅</Text>
          <Text style={styles.resultProductName} numberOfLines={2}>
            {productState.producto.nombre}
          </Text>
          {productState.producto.marcas ? (
            <Text style={styles.resultProductBrand} numberOfLines={1}>
              {productState.producto.marcas}
            </Text>
          ) : null}

          <View style={styles.resultActions}>
            <Pressable style={styles.primaryButton} onPress={onVerProducto}>
              <Text style={styles.primaryButtonText}>Ver producto</Text>
            </Pressable>
            <Pressable
              style={styles.secondaryButton}
              onPress={onVolverAEscanear}
            >
              <Text style={styles.secondaryButtonText}>Volver a escanear</Text>
            </Pressable>
          </View>
        </View>
      )}

      {productState.status === "not_found" && (
        <View style={styles.resultCard}>
          <Text style={styles.resultEmoji}>⚠️</Text>
          <Text style={styles.resultErrorTitle}>
            {productState.error}
          </Text>
          {scannedCode ? (
            <Text style={styles.resultCodeText}>Código: {scannedCode}</Text>
          ) : null}
          <Pressable
            style={styles.secondaryButton}
            onPress={onVolverAEscanear}
          >
            <Text style={styles.secondaryButtonText}>Volver a escanear</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Estilos
// ---------------------------------------------------------------------------

const COLORES_MODAL = {
  fondo: "#111",
  texto: "#fff",
  textoSuave: "#999",
  acento: "#2a7f9e",
} as const;

const COLORES_RESULT = {
  acento: "#2a7f9e",
  texto: "#222",
  textoSuave: "#666",
  fondo: "#fff",
  error: "#c62828",
} as const;

const styles = StyleSheet.create({
  // --- Modal base ---
  modalSafe: {
    flex: 1,
    backgroundColor: COLORES_MODAL.fondo,
  },

  // --- Contenedor centrado (permisos, carga) ---
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
    padding: 32,
    backgroundColor: COLORES_MODAL.fondo,
  },
  loadingText: {
    fontSize: 15,
    color: COLORES_MODAL.textoSuave,
    marginTop: 8,
  },

  // --- Permisos ---
  permissionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORES_MODAL.texto,
    marginTop: 12,
    textAlign: "center",
  },
  permissionText: {
    fontSize: 14,
    color: COLORES_MODAL.textoSuave,
    textAlign: "center",
    lineHeight: 20,
  },
  requestButton: {
    backgroundColor: COLORES_MODAL.acento,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 8,
  },
  requestButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  permissionDeniedText: {
    fontSize: 13,
    color: COLORES_MODAL.textoSuave,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 8,
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  cancelButtonText: {
    fontSize: 14,
    color: COLORES_MODAL.textoSuave,
  },

  // --- Cámara ---
  cameraWrapper: {
    flex: 1,
    position: "relative",
  },

  // --- Overlay de escaneo ---
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  scanFrame: {
    alignItems: "center",
    gap: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.6)",
    borderRadius: 16,
    padding: 32,
  },
  scanHintText: {
    fontSize: 15,
    color: COLORES_MODAL.texto,
    fontWeight: "500",
    textAlign: "center",
  },

  // --- Overlay de resultado ---
  resultOverlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    paddingBottom: 60,
    paddingHorizontal: 20,
  },
  resultCard: {
    backgroundColor: COLORES_RESULT.fondo,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  resultEmoji: {
    fontSize: 32,
  },
  resultLoadingText: {
    fontSize: 15,
    color: COLORES_RESULT.textoSuave,
    marginTop: 8,
  },
  resultProductName: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORES_RESULT.texto,
    textAlign: "center",
  },
  resultProductBrand: {
    fontSize: 14,
    color: COLORES_RESULT.textoSuave,
    textAlign: "center",
  },
  resultErrorTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORES_RESULT.error,
    textAlign: "center",
  },
  resultCodeText: {
    fontSize: 12,
    color: COLORES_RESULT.textoSuave,
    marginBottom: 4,
  },
  resultActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    width: "100%",
  },
  primaryButton: {
    flex: 1,
    backgroundColor: COLORES_RESULT.acento,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORES_RESULT.acento,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORES_RESULT.acento,
  },

  // --- Cerrar modal ---
  modalCloseButton: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
