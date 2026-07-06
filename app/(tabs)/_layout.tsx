import { Tabs } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// este archivo arma la barra inferior con las tres pantallas principales
export default function RootLayout() {
  return (
    // tabs muestra botones abajo para cambiar de pantalla
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: "#1a1a1a",
        borderTopColor: "#2a2a2a",
      },
      tabBarActiveTintColor: "#2a7f9e",
      tabBarInactiveTintColor: "#888",
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          headerTitle: "Inicio",
          tabBarLabel: "Inicio",
          tabBarIcon: ({ focused }) => (
            <FontAwesome name="home" size={26} color={focused ? "#2a7f9e" : "#888"} />
          )
        }}
      />
      <Tabs.Screen
        name="buscar"
        options={{
          title: "Buscar",
          headerTitle: "Buscar",
          tabBarLabel: "Buscar",
          tabBarIcon: ({ focused }) => (
            <FontAwesome name="search" size={22} color={focused ? "#2a7f9e" : "#888"} />
          )
        }}
      />
      <Tabs.Screen
        name="favoritos"
        options={{
          title: "Favoritos",
          headerTitle: "Favoritos",
          tabBarLabel: "Favoritos",
          tabBarIcon: ({ focused }) => (
            <FontAwesome name="heart" size={20} color={focused ? "#2a7f9e" : "#888"} />
          )
        }}
      />
    </Tabs>
  );
}
