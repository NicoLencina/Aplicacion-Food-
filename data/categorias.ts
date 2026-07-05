export type Categoria = {
  id: string;
  nombre: string;
  tagOFF: string;
};

// estas categorias se muestran en el inicio de forma ordenada
// tagOFF asocia cada una con su tag en open food facts
export const categorias: Categoria[] = [
  { id: "beverages", nombre: "bebidas", tagOFF: "en:beverages" },
  { id: "cereals-and-potatoes", nombre: "cereales", tagOFF: "en:cereals-and-potatoes" },
  { id: "chocolates", nombre: "chocolates", tagOFF: "en:chocolates" },
  { id: "meals", nombre: "comidas", tagOFF: "en:meals" },
  { id: "breakfasts", nombre: "desayunos", tagOFF: "en:breakfasts" },
  { id: "biscuits-and-cakes", nombre: "galletas", tagOFF: "en:biscuits-and-cakes" },
  { id: "dairies", nombre: "lacteos", tagOFF: "en:dairies" },
  { id: "desserts", nombre: "postres", tagOFF: "en:desserts" },
  { id: "snacks", nombre: "snacks", tagOFF: "en:snacks" },
  { id: "plant-based-foods", nombre: "vegetales", tagOFF: "en:plant-based-foods" },
];
