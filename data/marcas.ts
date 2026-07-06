export type Marca = {
  id: string;
  nombre: string;
  tagOFF: string;
};

// marcas reales para mostrar en el carrusel y en fichas
// tagOFF asocia cada una con su tag en open food facts (brands_tags)
export const marcas: Marca[] = [
  { id: "marca-1", nombre: "Coca-Cola", tagOFF: "coca-cola" },
  { id: "marca-2", nombre: "La Serenisima", tagOFF: "la-serenisima" },
  { id: "marca-3", nombre: "Arcor", tagOFF: "arcor" },
  { id: "marca-4", nombre: "Quaker", tagOFF: "quaker" },
  { id: "marca-5", nombre: "Danone", tagOFF: "danone" },
  { id: "marca-6", nombre: "Granix", tagOFF: "granix" },
];
