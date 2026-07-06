import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

// este archivo define la navegacion general de la app
export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      {/* stack sirve para abrir pantallas una arriba de otra */}
      <Stack screenOptions={{ headerBackButtonDisplayMode: "minimal" }}>
      {/* este grupo contiene las tres pantallas principales */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* estas rutas muestran pantallas filtradas de la maqueta */}
      <Stack.Screen name="categorias/[nombre]" />
      <Stack.Screen name="marcas/[nombre]" />
      <Stack.Screen name="etiquetas/[nombre]" />
      <Stack.Screen name="fichas/[id]" />
    </Stack>
    </>
  );
}
