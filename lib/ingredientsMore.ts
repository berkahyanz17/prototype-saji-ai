import type { Category, Location } from './foodInfo';
import type { Ingredient } from './ingredients';

// kcal, protein, carbs, fat, fiber, sugar (g), sodium (mg), per 100 g (approximate)
type N = [number, number, number, number, number, number, number];

const ing = (
  id: string,
  name: string,
  aliases: string[],
  category: Category,
  location: Location,
  shelf: Ingredient['shelf'],
  unit: string,
  qty: number,
  units: Record<string, number>,
  n: N,
  density?: number
): Ingredient => ({
  id,
  name,
  aliases,
  category,
  location,
  shelf,
  unit,
  qty,
  units,
  density,
  per100: {
    kcal: n[0],
    protein: n[1],
    carbs: n[2],
    fat: n[3],
    fiber: n[4],
    sugar: n[5],
    sodium: n[6],
  },
});

export const MORE_INGREDIENTS: Ingredient[] = [
  // Protein
  ing('sosis', 'sosis', ['sausage', 'sosis ayam', 'sosis sapi'], 'Protein', 'kulkas', { kulkas: 14, freezer: 60 }, 'buah', 6, { buah: 30 }, [250, 12, 4, 20, 0, 1, 800]),
  ing('bakso', 'bakso', ['meatball', 'meatballs'], 'Protein', 'kulkas', { kulkas: 3, freezer: 90 }, 'buah', 10, { buah: 20 }, [180, 11, 10, 10, 0.3, 1, 550]),
  ing('kornet', 'kornet', ['corned beef'], 'Protein', 'rak', { rak: 365, kulkas: 3 }, 'g', 200, {}, [251, 27, 0.5, 16, 0, 0, 950]),
  ing('telur-puyuh', 'telur puyuh', ['quail egg', 'quail eggs'], 'Protein', 'kulkas', { kulkas: 21, rak: 7 }, 'butir', 10, { butir: 10 }, [158, 13, 0.4, 11.1, 0, 0.4, 141]),
  ing('cumi', 'cumi', ['squid', 'calamari'], 'Protein', 'kulkas', { kulkas: 2, freezer: 90 }, 'g', 250, {}, [92, 15.6, 3.1, 1.4, 0, 0, 44]),
  ing('kacang-tanah', 'kacang tanah', ['peanut', 'peanuts', 'kacang'], 'Protein', 'rak', { rak: 180 }, 'g', 200, { sdm: 9 }, [567, 25.8, 16.1, 49.2, 8.5, 4.7, 18]),
  ing('kacang-hijau', 'kacang hijau', ['mung bean', 'mung beans'], 'Protein', 'rak', { rak: 365 }, 'g', 250, {}, [347, 23.9, 62.6, 1.2, 16.3, 6.6, 15]),

  // Karbo
  ing('singkong', 'singkong', ['cassava', 'ketela'], 'Karbo', 'rak', { rak: 3, kulkas: 5 }, 'g', 500, {}, [160, 1.4, 38.1, 0.3, 1.8, 1.7, 14]),
  ing('ubi', 'ubi jalar', ['sweet potato', 'ubi'], 'Karbo', 'rak', { rak: 14, kulkas: 21 }, 'buah', 2, { buah: 130 }, [86, 1.6, 20.1, 0.1, 3, 4.2, 55]),
  ing('oat', 'oat', ['oats', 'oatmeal'], 'Karbo', 'rak', { rak: 365 }, 'g', 500, { sdm: 7 }, [389, 16.9, 66.3, 6.9, 10.6, 1, 2]),
  ing('bihun', 'bihun', ['rice vermicelli', 'kwetiau', 'rice noodles'], 'Karbo', 'rak', { rak: 365 }, 'g', 250, {}, [364, 3.4, 83.2, 0.6, 1.6, 0, 10]),
  ing('maizena', 'tepung maizena', ['cornstarch', 'maizena', 'tepung jagung'], 'Karbo', 'rak', { rak: 730 }, 'g', 100, { sdm: 8 }, [381, 0.3, 91.3, 0.1, 0.9, 0, 9]),
  ing('tepung-beras', 'tepung beras', ['rice flour'], 'Karbo', 'rak', { rak: 365 }, 'g', 500, { sdm: 9 }, [366, 6, 80, 1.4, 2.4, 0.1, 0]),
  ing('tepung-panir', 'tepung panir', ['breadcrumbs', 'tepung roti'], 'Karbo', 'rak', { rak: 180 }, 'g', 200, { sdm: 7 }, [395, 13.4, 72, 5.3, 4.5, 6.2, 732]),

  // Sayur
  ing('selada', 'selada', ['lettuce'], 'Sayur', 'kulkas', { kulkas: 5, rak: 1 }, 'g', 200, {}, [15, 1.4, 2.9, 0.2, 1.3, 0.8, 28]),
  ing('seledri', 'seledri', ['celery'], 'Sayur', 'kulkas', { kulkas: 14, rak: 3 }, 'batang', 3, { batang: 40 }, [14, 0.7, 3, 0.2, 1.6, 1.3, 80]),
  ing('kembang-kol', 'kembang kol', ['cauliflower', 'bunga kol'], 'Sayur', 'kulkas', { kulkas: 7, rak: 2 }, 'g', 400, {}, [25, 1.9, 5, 0.3, 2, 1.9, 30]),
  ing('labu-siam', 'labu siam', ['chayote'], 'Sayur', 'kulkas', { kulkas: 14, rak: 5 }, 'buah', 2, { buah: 200 }, [19, 0.8, 4.5, 0.1, 1.7, 1.7, 2]),
  ing('labu-kuning', 'labu kuning', ['pumpkin', 'kabocha'], 'Sayur', 'rak', { rak: 30, kulkas: 21 }, 'g', 500, {}, [26, 1, 6.5, 0.1, 0.5, 2.8, 1]),
  ing('tauge', 'tauge', ['bean sprouts', 'bean sprout', 'kecambah'], 'Sayur', 'kulkas', { kulkas: 3, rak: 1 }, 'g', 200, {}, [30, 3, 5.9, 0.2, 1.8, 4.1, 6]),
  ing('pare', 'pare', ['bitter melon', 'bitter gourd'], 'Sayur', 'kulkas', { kulkas: 7, rak: 3 }, 'buah', 1, { buah: 200 }, [17, 1, 3.7, 0.2, 2.8, 1.9, 5]),
  ing('bit', 'bit', ['beetroot', 'beet'], 'Sayur', 'kulkas', { kulkas: 21, rak: 7 }, 'buah', 2, { buah: 100 }, [43, 1.6, 9.6, 0.2, 2.8, 6.8, 78]),
  ing('lobak', 'lobak', ['radish', 'daikon'], 'Sayur', 'kulkas', { kulkas: 14, rak: 3 }, 'g', 300, {}, [18, 0.6, 4.1, 0.1, 1.6, 2.5, 21]),
  ing('kacang-polong', 'kacang polong', ['peas', 'green peas'], 'Sayur', 'kulkas', { kulkas: 5, freezer: 180 }, 'g', 250, {}, [81, 5.4, 14.5, 0.4, 5.7, 5.7, 5]),
  ing('zukini', 'zukini', ['zucchini', 'courgette'], 'Sayur', 'kulkas', { kulkas: 7, rak: 2 }, 'buah', 2, { buah: 200 }, [17, 1.2, 3.1, 0.3, 1, 2.5, 8]),

  // Buah
  ing('pisang', 'pisang', ['banana', 'bananas'], 'Buah', 'rak', { rak: 5, kulkas: 7 }, 'buah', 5, { buah: 100 }, [89, 1.1, 22.8, 0.3, 2.6, 12.2, 1]),
  ing('apel', 'apel', ['apple', 'apples'], 'Buah', 'kulkas', { kulkas: 28, rak: 7 }, 'buah', 3, { buah: 180 }, [52, 0.3, 13.8, 0.2, 2.4, 10.4, 1]),
  ing('jeruk', 'jeruk', ['orange', 'oranges', 'jeruk manis'], 'Buah', 'kulkas', { kulkas: 21, rak: 7 }, 'buah', 4, { buah: 130 }, [47, 0.9, 11.8, 0.1, 2.4, 9.4, 0]),
  ing('lemon', 'lemon', ['lemons'], 'Buah', 'kulkas', { kulkas: 21, rak: 7 }, 'buah', 2, { buah: 60 }, [29, 1.1, 9.3, 0.3, 2.8, 2.5, 2]),
  ing('mangga', 'mangga', ['mango', 'mangoes'], 'Buah', 'rak', { rak: 5, kulkas: 7 }, 'buah', 2, { buah: 200 }, [60, 0.8, 15, 0.4, 1.6, 13.7, 1]),
  ing('semangka', 'semangka', ['watermelon'], 'Buah', 'rak', { rak: 7, kulkas: 5 }, 'g', 1000, {}, [30, 0.6, 7.6, 0.2, 0.4, 6.2, 1]),
  ing('pepaya', 'pepaya', ['papaya'], 'Buah', 'rak', { rak: 5, kulkas: 7 }, 'g', 500, {}, [43, 0.5, 10.8, 0.3, 1.7, 7.8, 8]),
  ing('nanas', 'nanas', ['pineapple'], 'Buah', 'rak', { rak: 3, kulkas: 5 }, 'buah', 1, { buah: 500 }, [50, 0.5, 13.1, 0.1, 1.4, 9.9, 1]),
  ing('anggur', 'anggur', ['grape', 'grapes'], 'Buah', 'kulkas', { kulkas: 7, rak: 2 }, 'g', 300, {}, [69, 0.7, 18.1, 0.2, 0.9, 15.5, 2]),
  ing('stroberi', 'stroberi', ['strawberry', 'strawberries'], 'Buah', 'kulkas', { kulkas: 5, rak: 1 }, 'g', 250, {}, [32, 0.7, 7.7, 0.3, 2, 4.9, 1]),
  ing('melon', 'melon', ['cantaloupe'], 'Buah', 'kulkas', { kulkas: 5, rak: 5 }, 'g', 800, {}, [34, 0.8, 8.2, 0.2, 0.9, 7.9, 16]),
  ing('jambu', 'jambu biji', ['guava', 'jambu'], 'Buah', 'rak', { rak: 4, kulkas: 7 }, 'buah', 3, { buah: 120 }, [68, 2.6, 14.3, 1, 5.4, 8.9, 2]),

  // Bumbu
  ing('jeruk-nipis', 'jeruk nipis', ['lime', 'limes'], 'Bumbu', 'kulkas', { kulkas: 14, rak: 5 }, 'buah', 5, { buah: 40 }, [30, 0.7, 10.5, 0.2, 2.8, 1.7, 2]),
  ing('serai', 'serai', ['lemongrass'], 'Bumbu', 'kulkas', { kulkas: 14, rak: 5 }, 'batang', 3, { batang: 30 }, [99, 1.8, 25.3, 0.5, 0, 0, 6]),
  ing('lengkuas', 'lengkuas', ['galangal', 'laos'], 'Bumbu', 'rak', { rak: 14, kulkas: 28 }, 'g', 100, { ruas: 30 }, [71, 1.1, 15.4, 0.9, 2.4, 0, 3]),
  ing('kunyit', 'kunyit', ['turmeric'], 'Bumbu', 'rak', { rak: 730 }, 'g', 50, { sdt: 3 }, [312, 9.7, 67.1, 3.3, 22.7, 3.2, 27]),
  ing('ketumbar', 'ketumbar', ['coriander'], 'Bumbu', 'rak', { rak: 730 }, 'g', 50, { sdt: 2 }, [298, 12.4, 55, 17.8, 41.9, 0, 35]),
  ing('saus-tiram', 'saus tiram', ['oyster sauce'], 'Bumbu', 'rak', { rak: 365, kulkas: 365 }, 'ml', 275, {}, [51, 1.4, 10.9, 0.3, 0.3, 0, 2733], 1.2),
  ing('saus-sambal', 'saus sambal', ['chili sauce', 'sambal', 'sriracha'], 'Bumbu', 'rak', { rak: 365, kulkas: 365 }, 'ml', 275, {}, [93, 1.9, 19, 0.9, 2.2, 15, 2124], 1.1),
  ing('madu', 'madu', ['honey'], 'Bumbu', 'rak', { rak: 1000 }, 'g', 250, { sdm: 21, sdt: 7 }, [304, 0.3, 82.4, 0, 0.2, 82.1, 4]),
  ing('cuka', 'cuka', ['vinegar'], 'Bumbu', 'rak', { rak: 730 }, 'ml', 250, {}, [18, 0, 0, 0, 0, 0, 2], 1.01),
  ing('kaldu-bubuk', 'kaldu bubuk', ['bouillon', 'kaldu', 'penyedap', 'royco', 'masako'], 'Bumbu', 'rak', { rak: 365 }, 'g', 100, { sdt: 4 }, [240, 8, 28, 10, 0, 4, 21000]),

  // Produk susu
  ing('susu-kental-manis', 'susu kental manis', ['condensed milk', 'kental manis', 'skm'], 'Produk susu', 'rak', { rak: 365, kulkas: 7 }, 'g', 370, { sdm: 20 }, [321, 7.9, 54.4, 8.7, 0, 54.4, 127]),
  ing('krim', 'krim', ['cream', 'whipping cream'], 'Produk susu', 'kulkas', { kulkas: 7 }, 'ml', 250, {}, [340, 2.8, 2.8, 36, 0, 2.9, 38], 0.99),
];