export type Etiqueta = {
  id: string;
  nombre: string;
  tagOFF: string;
};

// estos filtros se muestran como botones chicos en el inicio
// tagOFF usa prefijo en: porque open food facts trabaja con labels_tags
export const etiquetas: Etiqueta[] = [
  { id: "organic", nombre: "organico", tagOFF: "en:organic" },
  { id: "vegan", nombre: "vegano", tagOFF: "en:vegan" },
  { id: "vegetarian", nombre: "vegetariano", tagOFF: "en:vegetarian" },
  { id: "gluten-free", nombre: "sin gluten", tagOFF: "en:gluten-free" },
  { id: "no-added-sugar", nombre: "sin azucar", tagOFF: "en:no-added-sugar" },
  { id: "fair-trade", nombre: "comercio justo", tagOFF: "en:fair-trade" },
  { id: "lactose-free", nombre: "sin lactosa", tagOFF: "en:lactose-free" },
  { id: "palm-oil-free", nombre: "sin palma", tagOFF: "en:palm-oil-free" },
  { id: "high-fiber", nombre: "alta fibra", tagOFF: "en:high-fiber" },
  { id: "low-fat", nombre: "baja grasa", tagOFF: "en:low-fat" },
];
