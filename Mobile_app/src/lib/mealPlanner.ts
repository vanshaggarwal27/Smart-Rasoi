export type Gender = "male" | "female";
export type Goal = "fatloss" | "cut" | "maintain" | "bulk" | "muscle" | "gain";
export type ActivityLevel = "low" | "moderate" | "high";

export interface UserProfile {
  age: number;
  weight: number;
  height: number;
  gender: Gender;
  goal: Goal;
  activity_level: ActivityLevel;
  budget: number;
}

export interface MenuItem {
  id?: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  price: number;
}

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  low: 1.2,
  moderate: 1.55,
  high: 1.725,
};

const getGoalAdjustment = (goal: Goal): number => {
  if (goal === "fatloss" || goal === "cut") return -400;
  if (goal === "muscle" || goal === "gain" || goal === "bulk") return 300;
  return 0; // maintain
};

export const calculateCalories = (user: UserProfile) => {
  let bmr: number;
  if (user.gender === "male") {
    bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age + 5;
  } else {
    bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age - 161;
  }

  const multiplier = ACTIVITY_MULTIPLIERS[user.activity_level] || 1.55;
  const maintenance_calories = bmr * multiplier;
  const target_calories = maintenance_calories + getGoalAdjustment(user.goal);

  return {
    bmr: Number(bmr.toFixed(2)),
    maintenance_calories: Number(maintenance_calories.toFixed(2)),
    target_calories: Number(Math.max(target_calories, 1).toFixed(2)),
  };
};

export const calculateMacros = (user: UserProfile, total_calories: number) => {
  const protein_g = 1.8 * user.weight;
  const fat_calories = 0.25 * total_calories;
  const fats_g = fat_calories / 9;

  const protein_calories = protein_g * 4;
  const carb_calories = Math.max(total_calories - protein_calories - fat_calories, 0);
  const carbs_g = carb_calories / 4;

  return {
    calories: Number(total_calories.toFixed(2)),
    protein_g: Number(protein_g.toFixed(2)),
    carbs_g: Number(carbs_g.toFixed(2)),
    fats_g: Number(fats_g.toFixed(2)),
  };
};

const scoreCombination = (
  total_protein: number,
  total_calories: number,
  total_price: number,
  target_calories: number,
  budget: number,
  protein_weight: number = 12.0,
  calorie_penalty_weight: number = 0.8,
  budget_penalty_weight: number = 20.0
) => {
  const calorie_penalty = calorie_penalty_weight * Math.abs(total_calories - target_calories);
  const budget_penalty = budget_penalty_weight * Math.max(total_price - budget, 0);
  return protein_weight * total_protein - calorie_penalty - budget_penalty;
};

const combinationTotals = (combo: MenuItem[]) => {
  return combo.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fats: acc.fats + item.fats,
      price: acc.price + item.price,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0, price: 0 }
  );
};

// Helper: combinations with replacement generator in TS
function combinationsWithReplacement<T>(arr: T[], r: number): T[][] {
  const result: T[][] = [];
  function backtrack(start: number, combo: T[]) {
    if (combo.length === r) {
      result.push([...combo]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      combo.push(arr[i]);
      backtrack(i, combo);
      combo.pop();
    }
  }
  backtrack(0, []);
  return result;
}

export const generateMealPlan = (
  user: UserProfile,
  cafeteria_menu: MenuItem[],
  max_items: number = 6,
  protein_weight: number = 12.0
) => {
  const calorie_info = calculateCalories(user);
  const target_calories = calorie_info.target_calories;
  const macro_targets = calculateMacros(user, target_calories);
  
  const min_calories = 0.9 * target_calories;
  const max_calories = 1.1 * target_calories;

  let best_valid: { score: number; combo: MenuItem[]; totals: any } | null = null;
  let best_fallback: { score: number; combo: MenuItem[]; totals: any } | null = null;

  for (let item_count = 1; item_count <= max_items; item_count++) {
    const combos = combinationsWithReplacement(cafeteria_menu, item_count);
    
    for (const combo of combos) {
      const totals = combinationTotals(combo);
      const score = scoreCombination(
        totals.protein,
        totals.calories,
        totals.price,
        target_calories,
        user.budget,
        protein_weight
      );

      const within_budget = totals.price <= user.budget;
      const within_calories = min_calories <= totals.calories && totals.calories <= max_calories;
      const enough_protein = totals.protein >= macro_targets.protein_g;
      const valid = within_budget && within_calories && enough_protein;

      const candidate = { score, combo, totals };

      if (valid && (!best_valid || score > best_valid.score)) {
        best_valid = candidate;
      }
      if (within_budget && (!best_fallback || score > best_fallback.score)) {
        best_fallback = candidate;
      }
    }
  }

  const chosen = best_valid || best_fallback;

  if (!chosen) {
    return {
      selected_food_items: [],
      total_calories: 0,
      total_protein: 0,
      total_carbs: 0,
      total_fats: 0,
      total_price: 0,
      targets: {
        calories: target_calories,
        protein_g: macro_targets.protein_g,
        calorie_range: [Number(min_calories.toFixed(2)), Number(max_calories.toFixed(2))],
        carbs_g: macro_targets.carbs_g,
        fats_g: macro_targets.fats_g,
      },
      score: null,
      constraints_met: {
        calories_within_10_percent: false,
        protein_target_met: false,
        within_budget: false,
      },
      explanation: "No meal combination could be purchased within the given budget."
    };
  }

  const { score, combo, totals } = chosen;
  const constraints_met = {
    calories_within_10_percent: min_calories <= totals.calories && totals.calories <= max_calories,
    protein_target_met: totals.protein >= macro_targets.protein_g,
    within_budget: totals.price <= user.budget,
  };

  const allMet = Object.values(constraints_met).every(v => v);
  let explanation = "";
  if (allMet) {
    explanation = "Selected the highest-scoring combination that meets the calorie range, reaches the protein target, and stays within the budget.";
  } else {
    const unmet = Object.entries(constraints_met).filter(([_, is_met]) => !is_met).map(([k]) => k.replace(/_/g, " "));
    explanation = `No combination met every constraint, so this is the best within-budget fallback by score. Unmet constraints: ${unmet.join(', ')}.`;
  }

  return {
    selected_food_items: combo,
    total_calories: Number(totals.calories.toFixed(2)),
    total_protein: Number(totals.protein.toFixed(2)),
    total_carbs: Number(totals.carbs.toFixed(2)),
    total_fats: Number(totals.fats.toFixed(2)),
    total_price: Number(totals.price.toFixed(2)),
    targets: {
      calories: target_calories,
      protein_g: macro_targets.protein_g,
      calorie_range: [Number(min_calories.toFixed(2)), Number(max_calories.toFixed(2))],
      carbs_g: macro_targets.carbs_g,
      fats_g: macro_targets.fats_g,
    },
    score: Number(score.toFixed(2)),
    constraints_met,
    explanation
  };
};
