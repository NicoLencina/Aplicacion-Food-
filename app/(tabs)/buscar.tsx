import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import BarcodeScannerModal from "@/components/BarcodeScannerModal";

// ---------------------------------------------------------------------------
// Pantalla principal de búsqueda
// ---------------------------------------------------------------------------

export default function SearchScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [codigoPendiente, setCodigoPendiente] = useState<string | null>(null);

  const handleOpen = useCallback(() => {
    setCodigoPendiente(null);
    setModalVisible(true);
  }, []);

  const handleClose = useCallback(() => {
    setModalVisible(false);
  }, []);

  const handleProductoEncontrado = useCallback((codigo: string) => {
    setCodigoPendiente(codigo);
  }, []);

  // Cuando el modal termina de cerrarse y hay un código pendiente, navegar.
  // Esto evita el setTimeout mágico y el riesgo de navegar antes de que el
  // modal termine su animación de cierre.
  useEffect(() => {
    if (!modalVisible && codigoPendiente) {
      const codigo = codigoPendiente;
      setCodigoPendiente(null);
      router.push(`/fichas/${encodeURIComponent(codigo)}`);
    }
  }, [modalVisible, codigoPendiente]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buscar por código de barras</Text>
      <Text style={styles.subtitle}>
        Escaneá el código de barras de un producto para ver su información
        nutricional y clasificación.
      </Text>

      <Pressable style={styles.cameraButton} onPress={handleOpen}>
        <FontAwesome name="camera" size={28} color="#fff" />
        <Text style={styles.cameraButtonText}>Escanear</Text>
      </Pressable>

      <BarcodeScannerModal
        visible={modalVisible}
        onClose={handleClose}
        onProductoEncontrado={handleProductoEncontrado}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Estilos
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    padding: 24,
    backgroundColor: "#222",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#aaa",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 320,
  },
  cameraButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#2a7f9e",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    marginTop: 16,
  },
  cameraButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
  },
});
