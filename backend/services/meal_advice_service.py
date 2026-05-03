"""
Service for generating personalized AI advice for meals based on user's diet goals,
religious restrictions, and other profile information.
"""

import re
import logging

from services.groq_client import call_groq_chat


logger = logging.getLogger(__name__)


# System prompt for personalized meal advice
MEAL_ADVICE_SYSTEM_PROMPT = """Ты — эксперт по питанию и диетологии в приложении FoodTrack. Твоя задача — давать персонализированные советы по питанию, учитывая особенности пользователя.

ПРАВИЛА:
1. Давай краткие, полезные советы (2-4 предложения).
2. Отвечай на русском языке.
3. Учитывай диетические ограничения, цели похудения/набора веса, уровень активности и состояние здоровья.
4. Будь конкретным: сравнивай КБЖУ блюда с целями пользователя.
5. Если блюдо не подходит под диету пользователя — предложи альтернативу или способ адаптации.
6. Дай один конкретный совет по улучшению рациона.
7. Не повторяй информацию о КБЖУ, которая уже указана — сосредоточься на советах и рекомендациях.
"""


def build_user_context(user_profile: dict, goals: dict, meal_data: dict) -> str:
    """
    Build user context string for the AI prompt.

    Args:
        user_profile: User profile data (diet, health_flags, etc.)
        goals: User goals (calories_goal, protein_goal, etc.)
        meal_data: Analyzed meal data (calories, protein, carbs, fats, name)
    """
    # Диета пользователя
    diet_map = {
        'none': 'Обычное питание',
        'keto': 'Кето-диета (низкоуглеводная, высокожировая)',
        'vegetarian': 'Вегетарианская диета',
        'vegan': 'Веганская диета (полный отказ от животных продуктов)',
        'halal': 'Халяль (мусульманские ограничения: без свинины, алкоголя, нехаляльных добавок)',
        'lowcarb': 'Низкоуглеводная диета',
        'custom': 'Особый рацион'
    }

    # Тип цели
    goal_type_map = {
        'lose': 'Похудение',
        'maintain': 'Поддержание веса',
        'gain': 'Набор мышечной массы'
    }

    # Уровень активности
    activity_map = {
        'sedentary': 'Малоподвижный образ жизни',
        'light': 'Лёгкая активность (1-2 тренировки в неделю)',
        'moderate': 'Умеренная активность (3-4 тренировки в неделю)',
        'active': 'Высокая активность (5-6 тренировок в неделю)',
        'very_active': 'Очень высокая активность (ежедневные тренировки)'
    }

    diet = user_profile.get('diet', 'none')
    diet_notes = user_profile.get('diet_notes', '')
    health_flags = user_profile.get('health_flags', [])
    health_notes = user_profile.get('health_notes', '')

    context = f"""Информация о пользователе:
- Диета: {diet_map.get(diet, diet)}
- Цель: {goal_type_map.get(goals.get('goal_type', 'maintain'), 'Поддержание веса')}
- Уровень активности: {activity_map.get(goals.get('activity_level', 'moderate'), 'Умеренная активность')}
- Дневная цель калорий: {goals.get('calories_goal', 2000)} ккал
- Дневная цель белка: {goals.get('protein_goal', 100)} г
- Дневная цель углеводов: {goals.get('carbs_goal', 200)} г
- Дневная цель жиров: {goals.get('fats_goal', 70)} г"""

    if diet_notes:
        context += f"\n- Особенности диеты: {diet_notes}"

    if health_flags and isinstance(health_flags, list):
        context += f"\n- Особенности здоровья: {', '.join(health_flags)}"

    if health_notes:
        context += f"\n- Заметки о здоровье: {health_notes}"

    # Информация о приёме пищи
    context += f"""

Информация о приёме пищи:
- Название: {meal_data.get('name', 'Неизвестно')}
- Калории: {meal_data.get('calories', 0)} ккал
- Белки: {meal_data.get('protein', 0)} г
- Углеводы: {meal_data.get('carbs', 0)} г
- Жиры: {meal_data.get('fats', 0)} г"""

    if meal_data.get('tags'):
        tags = meal_data.get('tags')
        if isinstance(tags, str):
            import json
            try:
                tags = json.loads(tags)
            except:
                tags = []
        if tags:
            context += f"\n- Теги: {', '.join(tags)}"

    return context


def generate_personalized_advice(user_profile: dict, goals: dict, meal_data: dict, language: str = 'ru') -> str:
    """
    Generate personalized AI advice for a meal based on user profile and goals.

    Args:
        user_profile: User profile data from User model
        goals: User goals from UserGoals model
        meal_data: Analyzed meal data (name, calories, protein, carbs, fats, tags)
        language: Language code ('ru' for Russian, 'kk' for Kazakh)

    Returns:
        Personalized advice string
    """
    # Определяем язык для ответа
    language_map = {
        'ru': 'русском',
        'kk': 'казахском',
    }
    lang_name = language_map.get(language, 'русском')

    user_context = build_user_context(user_profile, goals, meal_data)

    user_prompt = f"""{user_context}

Дай персонализированный совет по этому приёму пищи. Учитывай:
1. Насколько этот приём пищи соответствует целям пользователя
2. Подходит ли это блюдо под диету пользователя
3. Как можно улучшить рацион

Ответь на {lang_name} языке кратким советом (2-4 предложения):"""

    messages = [
        {"role": "system", "content": MEAL_ADVICE_SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt}
    ]

    try:
        advice = call_groq_chat(messages, max_tokens=1024)

        # Clean up the advice
        advice = advice.strip()

        # Reject responses that contain HTML tags or look like error messages
        if re.search(r'<[^>]+>', advice) or 'NoneType' in advice or 'has no attribute' in advice:
            raise ValueError(f"Provider returned invalid/error response: {advice[:80]}")

        # Limit length if too long
        if len(advice) > 500:
            advice = advice[:497] + "..."

        logger.info(f"Generated personalized advice: {advice[:100]}...")
        return advice

    except Exception as e:
        logger.error(f"Failed to generate personalized advice: {e}")
        # Return a fallback message
        return "Попробуйте следить за размером порции для достижения ваших целей."
