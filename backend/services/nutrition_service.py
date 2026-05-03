from datetime import datetime, timezone


def _activity_multiplier(workouts_per_week):
    w = workouts_per_week or 0
    if w <= 0:
        return 1.2
    if w <= 2:
        return 1.375
    if w <= 4:
        return 1.55
    if w <= 6:
        return 1.725
    return 1.9


def _goal_adjustment(weight_kg, target_weight_kg):
    if not target_weight_kg or not weight_kg:
        return 1.0
    if target_weight_kg < weight_kg - 0.5:
        return 0.85
    if target_weight_kg > weight_kg + 0.5:
        return 1.10
    return 1.0


def calculate_nutrition_goals(user):
    """Calculate calorie + macro goals from user profile via Mifflin-St Jeor.

    Returns dict with calories/protein/carbs/fats, or None if required profile
    data is missing (weight, height, birth_year, gender).
    """
    if not user.weight_kg or not user.height_cm or not user.birth_year or not user.gender:
        return None

    gender = user.gender.lower()
    if gender not in ('male', 'female'):
        return None

    age = datetime.now(timezone.utc).year - int(user.birth_year)
    if age < 10 or age > 100:
        return None

    weight = float(user.weight_kg)
    height = float(user.height_cm)

    if gender == 'male':
        bmr = 10 * weight + 6.25 * height - 5 * age + 5
    else:
        bmr = 10 * weight + 6.25 * height - 5 * age - 161

    tdee = bmr * _activity_multiplier(user.workouts_per_week)
    calories = tdee * _goal_adjustment(weight, user.target_weight_kg)
    calories = int(round(calories))

    protein = int(round(weight * 1.8))
    fats = int(round((calories * 0.27) / 9))
    carbs = max(0, int(round((calories - protein * 4 - fats * 9) / 4)))

    return {
        'calories_goal': calories,
        'protein_goal': protein,
        'fats_goal': fats,
        'carbs_goal': carbs,
    }
