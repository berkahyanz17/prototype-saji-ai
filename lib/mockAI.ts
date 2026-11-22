export type Dish = {
  id: string;
  name: string;
  minutes: number;
  calories: number;
  uses: string[];
};

export type ScanResult = {
  ingredients: string[];
  dishes: Dish[];
};

// Fake analysis. Later, replace the body with a call to your backend.
export async function analyzePhoto(_uri: string): Promise<ScanResult> {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return {
    ingredients: ['Egg', 'Tomato', 'Onion', 'Rice'],
    dishes: [
      { id: '1', name: 'Egg Fried Rice', minutes: 15, calories: 420, uses: ['Egg', 'Rice', 'Onion'] },
      { id: '2', name: 'Tomato Omelette', minutes: 10, calories: 280, uses: ['Egg', 'Tomato', 'Onion'] },
      { id: '3', name: 'Tomato Egg Rice Bowl', minutes: 20, calories: 460, uses: ['Egg', 'Tomato', 'Rice'] },
    ],
  };
}