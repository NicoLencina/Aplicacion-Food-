export type Marca = {
  id: string;
  nombre: string;
  tagOFF: string;
  imagen?: number;
};

// marcas reales para mostrar en el carrusel y en fichas
// tagOFF asocia cada una con su tag en open food facts (brands_tags)
export const marcas: Marca[] = [
  { id: "marca-1", nombre: "Coca-Cola", tagOFF: "coca-cola", imagen: require("../assets/images/marcas/Coca-Cola_Other.jpg") },
  { id: "marca-2", nombre: "La Serenisima", tagOFF: "la-serenisima", imagen: require("../assets/images/marcas/Serenísima.jpg") },
  { id: "marca-3", nombre: "Arcor", tagOFF: "arcor", imagen: require("../assets/images/marcas/Arcor .jpg") },
  { id: "marca-4", nombre: "Quaker", tagOFF: "quaker", imagen: require("../assets/images/marcas/quaker.jpg") },
  { id: "marca-5", nombre: "Danone", tagOFF: "danone", imagen: require("../assets/images/marcas/Danone.jpg") },
  { id: "marca-6", nombre: "Granix", tagOFF: "granix", imagen: require("../assets/images/marcas/granix.jpg") },
];
