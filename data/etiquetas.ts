export type Etiqueta = {
  id: string;
  nombre: string;
  tagOFF: string;
  imagen?: number;
};

// estos filtros se muestran como botones chicos en el inicio
// tagOFF usa prefijo en: porque open food facts trabaja con labels_tags
export const etiquetas: Etiqueta[] = [
  { id: "organic", nombre: "Orgánico", tagOFF: "en:organic", imagen: require("../assets/images/filtros/Organico.jpg") },
  { id: "vegan", nombre: "Vegano", tagOFF: "en:vegan", imagen: require("../assets/images/filtros/Vegano.jpg") },
  { id: "vegetarian", nombre: "Vegetariano", tagOFF: "en:vegetarian", imagen: require("../assets/images/filtros/Vegetariano.jpg") },
  { id: "gluten-free", nombre: "Sin gluten", tagOFF: "en:gluten-free", imagen: require("../assets/images/filtros/Sin Gluten.jpg") },
  { id: "no-added-sugar", nombre: "sin azucar", tagOFF: "en:no-added-sugar", imagen: require("../assets/images/filtros/Bajos en azucar .jpg") },
  { id: "fair-trade", nombre: "Comercio justo", tagOFF: "en:fair-trade", imagen: require("../assets/images/filtros/precio justo.jpg") },
  { id: "lactose-free", nombre: "Sin lactosa", tagOFF: "en:lactose-free", imagen: require("../assets/images/filtros/Sin lacteo .jpg") },
  { id: "palm-oil-free", nombre: "Sin palma", tagOFF: "en:palm-oil-free", imagen: require("../assets/images/filtros/libre de aceite de palma.jpg") },
  { id: "high-fiber", nombre: "Alto en fibra", tagOFF: "en:high-fiber", imagen: require("../assets/images/filtros/Alto en fibras.jpg") },
  { id: "low-fat", nombre: "Bajo en grasas", tagOFF: "en:low-fat", imagen: require("../assets/images/filtros/Bajo en grasas.jpg") },
];
