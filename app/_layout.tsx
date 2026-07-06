import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

// este archivo define la navegacion general de la app
export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <View style={{ flex: 1, backgroundColor: "#1a1a1a" }}>
      {/* stack sirve para abrir pantallas una arriba de otra */}
      <Stack screenOptions={{ headerBackButtonDisplayMode: "minimal" }}>
        {/* tabs tiene Home, Buscar y Favoritos */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* estas rutas muestran pantallas filtradas de la maqueta */}
        <Stack.Screen name="categorias/[nombre]" />
        <Stack.Screen name="marcas/[nombre]" />
        <Stack.Screen name="etiquetas/[nombre]" />

        {/* ficha de producto: pantalla completa sin tab bar */}
        <Stack.Screen name="fichas/[id]" />
      </Stack>
      </View>
    </>
  );
}
