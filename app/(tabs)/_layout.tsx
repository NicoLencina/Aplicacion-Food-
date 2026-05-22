import { Tabs } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// este archivo arma la barra inferior con las tres pantallas principales
export default function RootLayout() {
  return (
    // tabs muestra botones abajo para cambiar de pantalla
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          headerTitle: "Inicio",
          tabBarLabel: "Inicio",
          tabBarActiveTintColor: "#222",
          tabBarIcon: ({ focused }) => (
            <FontAwesome name="home" size={26} color={focused ? "#222" : "#777"} />
          )
        }}
      />
      <Tabs.Screen
        name="buscar"
        options={{
          title: "Buscar",
          headerTitle: "Buscar",
          tabBarLabel: "Buscar",
          tabBarActiveTintColor: "#222",
          tabBarIcon: ({ focused }) => (
            <FontAwesome name="search" size={22} color={focused ? "#222" : "#777"} />
          )
        }}
      />
      <Tabs.Screen
        name="favoritos"
        options={{
          title: "Favoritos",
          headerTitle: "Favoritos",
          tabBarLabel: "Favoritos",
          tabBarActiveTintColor: "#222",
          tabBarIcon: ({ focused }) => (
            <FontAwesome name={"heart"} size={20} color={focused ? "#222" : "#777"} />
          )
        }}
      />
    </Tabs>
  );
}
