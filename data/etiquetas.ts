export type Etiqueta = {
  id: string;
  nombre: string;
};

// estos filtros se muestran como botones chicos en el inicio
export const etiquetas: Etiqueta[] = [
  { id: "organic", nombre: "organico" },
  { id: "vegan", nombre: "vegano" },
  { id: "vegetarian", nombre: "vegetariano" },
  { id: "gluten-free", nombre: "sin gluten" },
  { id: "no-added-sugar", nombre: "sin azucar" },
  { id: "fair-trade", nombre: "comercio justo" },
  { id: "lactose-free", nombre: "sin lactosa" },
  { id: "palm-oil-free", nombre: "sin palma" },
  { id: "high-fiber", nombre: "alta fibra" },
  { id: "low-fat", nombre: "baja grasa" },
];
