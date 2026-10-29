// Valores aproximados por 100 g. A fonte de dados pode ser substituída por uma API
// ou tabela persistida sem alterar o montador de refeições.
export const foodDatabase = [
  { id: 'arroz-branco-cozido', name: 'Arroz branco cozido', category: 'Carboidratos', defaultPortion: 120, calories: 130, protein: 2.5, carbs: 28.2, fat: 0.3, fiber: 1.6, sugar: 0.1, sodium: 1, tags: 'arroz branco' },
  { id: 'arroz-integral-cozido', name: 'Arroz integral cozido', category: 'Carboidratos', defaultPortion: 120, calories: 124, protein: 2.6, carbs: 25.8, fat: 1, fiber: 2.7, sugar: 0.2, sodium: 1, tags: 'arroz integral' },
  { id: 'feijao-carioca-cozido', name: 'Feijão carioca cozido', category: 'Carboidratos', defaultPortion: 100, calories: 76, protein: 4.8, carbs: 13.6, fat: 0.5, fiber: 8.5, sugar: 0.3, sodium: 2, tags: 'feijão feijao' },
  { id: 'quinoa-cozida', name: 'Quinoa cozida', category: 'Carboidratos', defaultPortion: 100, calories: 120, protein: 4.4, carbs: 21.3, fat: 1.9, fiber: 2.8, sugar: 0.9, sodium: 7, tags: 'quinoa' },
  { id: 'macarrao-cozido', name: 'Macarrão cozido', category: 'Carboidratos', defaultPortion: 120, calories: 157, protein: 5.8, carbs: 30.9, fat: 0.9, fiber: 1.8, sugar: 0.6, sodium: 1, tags: 'massa macarrão macarrao' },
  { id: 'batata-doce-cozida', name: 'Batata-doce cozida', category: 'Carboidratos', defaultPortion: 150, calories: 86, protein: 1.6, carbs: 20.1, fat: 0.1, fiber: 3, sugar: 4.2, sodium: 55, tags: 'batata doce' },
  { id: 'batata-inglesa-cozida', name: 'Batata inglesa cozida', category: 'Carboidratos', defaultPortion: 150, calories: 87, protein: 1.9, carbs: 20.1, fat: 0.1, fiber: 1.8, sugar: 0.9, sodium: 4, tags: 'batata inglesa' },
  { id: 'aveia-em-flocos', name: 'Aveia em flocos', category: 'Carboidratos', defaultPortion: 40, calories: 394, protein: 13.9, carbs: 66.3, fat: 8.5, fiber: 9.1, sugar: 1.2, sodium: 2, tags: 'aveia cereal' },
  { id: 'pao-integral', name: 'Pão integral', category: 'Carboidratos', defaultPortion: 50, calories: 247, protein: 13, carbs: 41.4, fat: 4.2, fiber: 6.5, sugar: 5, sodium: 427, tags: 'pão pao fatia' },
  { id: 'tapioca', name: 'Tapioca', category: 'Carboidratos', defaultPortion: 60, calories: 230, protein: 0.2, carbs: 54.3, fat: 0.2, fiber: 0.9, sugar: 0.5, sodium: 1, tags: 'goma tapioca' },

  { id: 'peito-de-frango-grelhado', name: 'Peito de frango grelhado', category: 'Proteínas', defaultPortion: 150, calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74, tags: 'frango peito' },
  { id: 'patinho-moido-cozido', name: 'Patinho moído cozido', category: 'Proteínas', defaultPortion: 120, calories: 209, protein: 26, carbs: 0, fat: 10, fiber: 0, sugar: 0, sodium: 72, tags: 'carne patinho carne moída' },
  { id: 'ovo-de-galinha', name: 'Ovo de galinha', category: 'Proteínas', defaultPortion: 100, calories: 143, protein: 12.6, carbs: 0.7, fat: 9.5, fiber: 0, sugar: 0.4, sodium: 142, tags: 'ovo ovos' },
  { id: 'tilapia-grelhada', name: 'Tilápia grelhada', category: 'Proteínas', defaultPortion: 150, calories: 128, protein: 26, carbs: 0, fat: 2.7, fiber: 0, sugar: 0, sodium: 56, tags: 'peixe tilápia tilapia' },
  { id: 'atum-em-agua', name: 'Atum em água', category: 'Proteínas', defaultPortion: 100, calories: 116, protein: 26, carbs: 0, fat: 1, fiber: 0, sugar: 0, sodium: 247, tags: 'atum peixe' },
  { id: 'salmao-grelhado', name: 'Salmão grelhado', category: 'Proteínas', defaultPortion: 150, calories: 208, protein: 20.5, carbs: 0, fat: 13.4, fiber: 0, sugar: 0, sodium: 59, tags: 'salmão salmao peixe' },
  { id: 'tofu', name: 'Tofu', category: 'Proteínas', defaultPortion: 120, calories: 76, protein: 8.1, carbs: 1.9, fat: 4.8, fiber: 0.3, sugar: 0.6, sodium: 7, tags: 'tofu vegetal vegano' },

  { id: 'banana', name: 'Banana', category: 'Frutas', defaultPortion: 90, calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6, sugar: 12.2, sodium: 1, tags: 'banana fruta' },
  { id: 'maca', name: 'Maçã', category: 'Frutas', defaultPortion: 130, calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, fiber: 2.4, sugar: 10.4, sodium: 1, tags: 'maçã maca fruta' },
  { id: 'mamao', name: 'Mamão', category: 'Frutas', defaultPortion: 150, calories: 43, protein: 0.5, carbs: 10.8, fat: 0.3, fiber: 1.7, sugar: 7.8, sodium: 8, tags: 'mamão mamao fruta' },
  { id: 'laranja', name: 'Laranja', category: 'Frutas', defaultPortion: 150, calories: 47, protein: 0.9, carbs: 11.8, fat: 0.1, fiber: 2.4, sugar: 9.4, sodium: 0, tags: 'laranja fruta' },
  { id: 'abacate', name: 'Abacate', category: 'Frutas', defaultPortion: 80, calories: 160, protein: 2, carbs: 8.5, fat: 14.7, fiber: 6.7, sugar: 0.7, sodium: 7, tags: 'abacate fruta' },

  { id: 'iogurte-grego-natural', name: 'Iogurte grego natural', category: 'Laticínios', defaultPortion: 170, calories: 97, protein: 9, carbs: 3.9, fat: 5, fiber: 0, sugar: 3.6, sodium: 36, tags: 'iogurte yogurt grego' },
  { id: 'cottage', name: 'Queijo cottage', category: 'Laticínios', defaultPortion: 100, calories: 98, protein: 11.1, carbs: 3.4, fat: 4.3, fiber: 0, sugar: 2.7, sodium: 364, tags: 'cottage queijo' },
  { id: 'leite-desnatado', name: 'Leite desnatado', category: 'Laticínios', defaultPortion: 200, calories: 34, protein: 3.4, carbs: 5, fat: 0.1, fiber: 0, sugar: 5, sodium: 42, tags: 'leite' },
  { id: 'queijo-minas', name: 'Queijo minas frescal', category: 'Laticínios', defaultPortion: 40, calories: 264, protein: 17.4, carbs: 3.2, fat: 20.6, fiber: 0, sugar: 0.5, sodium: 600, tags: 'queijo minas' },

  { id: 'brocolis-cozido', name: 'Brócolis cozido', category: 'Vegetais', defaultPortion: 100, calories: 35, protein: 2.4, carbs: 7.2, fat: 0.4, fiber: 3.3, sugar: 1.4, sodium: 41, tags: 'brócolis brocolis vegetal' },
  { id: 'alface', name: 'Alface', category: 'Vegetais', defaultPortion: 50, calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, fiber: 1.3, sugar: 0.8, sodium: 28, tags: 'alface salada vegetal' },
  { id: 'cenoura-cozida', name: 'Cenoura cozida', category: 'Vegetais', defaultPortion: 100, calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, fiber: 2.8, sugar: 4.7, sodium: 69, tags: 'cenoura vegetal' },
  { id: 'tomate', name: 'Tomate', category: 'Vegetais', defaultPortion: 100, calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sugar: 2.6, sodium: 5, tags: 'tomate vegetal' },

  { id: 'pasta-de-amendoim', name: 'Pasta de amendoim', category: 'Gorduras', defaultPortion: 20, calories: 588, protein: 25, carbs: 20, fat: 50, fiber: 6, sugar: 9.2, sodium: 486, tags: 'amendoim pasta' },
  { id: 'amendoas', name: 'Amêndoas', category: 'Gorduras', defaultPortion: 20, calories: 579, protein: 21.2, carbs: 21.6, fat: 49.9, fiber: 12.5, sugar: 4.4, sodium: 1, tags: 'amêndoa amendoa castanhas oleaginosa' },
  { id: 'chia', name: 'Semente de chia', category: 'Gorduras', defaultPortion: 15, calories: 486, protein: 16.5, carbs: 42.1, fat: 30.7, fiber: 34.4, sugar: 0, sodium: 16, tags: 'chia semente' },
  { id: 'azeite-de-oliva', name: 'Azeite de oliva', category: 'Gorduras', defaultPortion: 10, calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0, sodium: 0, tags: 'azeite óleo oleo' },
]

export const foodCategories = ['Todos', ...new Set(foodDatabase.map((food) => food.category))]

