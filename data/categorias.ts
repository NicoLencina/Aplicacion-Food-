export type Categoria = {
  id: string;
  nombre: string;
};

// estas categorias se muestran en el inicio de forma ordenada
export const categorias: Categoria[] = [
  { id: "beverages", nombre: "bebidas" },
  { id: "cereals-and-potatoes", nombre: "cereales" },
  { id: "chocolates", nombre: "chocolates" },
  { id: "meals", nombre: "comidas" },
  { id: "breakfasts", nombre: "desayunos" },
  { id: "biscuits-and-cakes", nombre: "galletas" },
  { id: "dairies", nombre: "lacteos" },
  { id: "desserts", nombre: "postres" },
  { id: "snacks", nombre: "snacks" },
  { id: "plant-based-foods", nombre: "vegetales" },
];
