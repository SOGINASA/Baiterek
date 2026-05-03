from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Meal, UserGoals, WaterEntry
from datetime import datetime, timedelta, timezone
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

tips_bp = Blueprint('tips', __name__)

# Казахские переводы советов (id -> {title, description})
TIPS_KK = {
    # КАЛОРИИ
    1: {
        "title": "Порция мөлшерін бақылаңыз",
        "description": "Егер калориялар мақсатты мөлшерден асса, ең калориялы тағамдар порциясын азайтудан бастаңыз. Көкөністер мен басқа көлемді тағамдар тоюдың сақталуына көмектеседі."
    },
    2: {
        "title": "Тәтті сусындарды ауыстырыңыз",
        "description": "Тәтті сусындар мен калориялы кофе жалпы калорийді оңай арттырады. Жиірек су, қантсыз шай немесе сіроп жоқ кофе таңдаңыз."
    },
    3: {
        "title": "Кешкі асыра жеуді бақылаңыз",
        "description": "Артық калориялардың негізгі бөлігі кешке жиналса, кешкі асты алдын ала жоспарлаңыз және ұйқыдан бұрын бақылаусыз тістемек тағамдарды алып тастаңыз."
    },
    4: {
        "title": "Баяу тамақтаныңыз",
        "description": "Тамақтанудың баяу қарқыны тоюды жақсырақ байқауға және асыра жеу қаупін азайтуға көмектеседі."
    },
    5: {
        "title": "Тойыратын өнімдерді көбейтіңіз",
        "description": "Көкөністер, бұршақтар, тұтас дәнді дақылдар және тойыну қабілеті жақсы басқа өнімдер калорияларды оңайырақ бақылауға көмектеседі."
    },
    6: {
        "title": "Тамақтануды алдын ала жоспарлаңыз",
        "description": "Тамақтану жоспарланбаған кезде кездейсоқ тістемек тағамдар мен жеткізуде калорияны асыру оңайырақ. Негізгі тамақтануды алдын ала ойластырыңыз."
    },
    9: {
        "title": "Экран алдында машинамен тамақтанбаңыз",
        "description": "Назар телефонға немесе сериалға кеткенде жеген мөлшерді байқау қиынырақ. Саналы және фонсыз тамақтануы жақсырақ."
    },
    10: {
        "title": "Күнделікті белсенділікті арттырыңыз",
        "description": "Серуен, баспалдақ, қысқа жылыту және тұрақты қозғалыс энергияны жұмсауға және салмақты ұстап тұруға көмектеседі."
    },
    # БЕЛОК
    21: {
        "title": "Ақуызды бірінші немесе негізгі тамақтануға қосыңыз",
        "description": "Ақуыз аз болса, бір қарапайым қадамнан бастаңыз: күніне бірінші немесе ең ірі тамақтануыңызға ақуыз көзін қосыңыз."
    },
    22: {
        "title": "Сапалы ақуыз көздерін таңдаңыз",
        "description": "Балық, құс, жұмыртқа, сүзбе, йогурт, бұршақтар, тофу және басқа соя өнімдері жарайды. Бір өнімге сүйенбей, кезектестіру жақсырақ."
    },
    23: {
        "title": "Бұршақтар қосыңыз",
        "description": "Фасоль, нұт, жасымық және бұршақ ақуыз да, сапалы көмірсулар да жинауға көмектеседі."
    },
    24: {
        "title": "Тістемек тағамдарды ақуызды етіңіз",
        "description": "Тістемек тағамдар үшін шынымен тойдыратын өнімдерді жиірек таңдаңыз: қантсыз йогурт, сүзбе, кефир, жұмыртқа."
    },
    25: {
        "title": "Сүт өнімдерін немесе олардың баламаларын пайдаланыңыз",
        "description": "Сүзбе, йогурт, кефир, орташа мөлшерде ірімшік немесе байытылған балама өнімдер ақуызды толықтыруға көмектеседі."
    },
    26: {
        "title": "Ақуызды күн бойы бөлін тамақтаныңыз",
        "description": "Ақуызды бір үлкен тамақтанумен жинамай, күн ішіндегі бірнеше тамақтануға бөлу ыңғайлырақ."
    },
    27: {
        "title": "Протеиндік өнім — тек қолайлы құрал",
        "description": "Қалыпты тамақпен ақуызды жинау қиын болса, протеиндік коктейл немесе батончик ыңғайлы қосымша бола алады, бірақ рационның міндетті негізі емес."
    },
    # УГЛЕВОДЫ
    31: {
        "title": "Көмірсуларды сапалы етіңіз",
        "description": "Көмірсулар көп болса, тәттіліктер, тәтті сусындар және ақ нанның үлесін азайтыңыз, ал негізді дәнді дақылдардан, бұршақтардан, жемістер мен көкөністерден жасаңыз."
    },
    32: {
        "title": "Көмірсуларды ақуызбен үйлестіріңіз",
        "description": "Көмірсулар ақуызбен бірге болғанда, тою әдетте жақсырақ сақталады және тамақтану теңгерімдірек болады."
    },
    # ЖИРЫ
    41: {
        "title": "Жасырын майлардың үлесін азайтыңыз",
        "description": "Майлар тым көп болса, қуырылған тағамдарды, майлы соустарды, шұжықтарды, фастфудты және жиі калориялы снектерді азайтыңыз."
    },
    42: {
        "title": "Пайдалырақ майларды таңдаңыз",
        "description": "Балық, жаңғақтар, тұқымдар, авокадо және өсімдік майларын жиірек пайдаланыңыз — тек қуырылған және өңделген өнімдерден гөрі."
    },
    # ВОДА
    51: {
        "title": "Күні бойы жүйелі ішіңіз",
        "description": "Шөлдеуге жетпеуге тырысыңыз. Су және басқа тәтті емес сусындар қалыпты гидратацияны сақтауға көмектеседі."
    },
    111: {
        "title": "Су туралы еске салу орнатыңыз",
        "description": "Ішуді жиі ұмытсаңыз, еске салулар артық күш жұмсамай сұйықтықты толықтыруға шынымен көмектеседі."
    },
    112: {
        "title": "Суды қолжетімді жерде ұстаңыз",
        "description": "Жаныңыздағы су бөтелкесі ішуді жүйелірек етеді және суды тәтті сусынмен ауыстыру мүмкіндігін азайтады."
    },
    # ОБРАЗ ЖИЗНИ / ФУНДАМЕНТ
    52: {
        "title": "Ұйқы тәбетке де әсер етеді",
        "description": "Ұйқы жетіспеушілігі жиі аштықты және тамақ таңдауды бақылауды қиындатады. Тұрақты ұйқы режимі — қалыпты тамақтану мінез-құлқының бөлігі."
    },
    54: {
        "title": "Тұрақты белсенділік балансты ұстауға көмектеседі",
        "description": "Жаттығулар пайдалы, бірақ күні бойы жүйелі қозғалу және бүкіл күнді отырыс режимінде өткізбеу де маңызды."
    },
    55: {
        "title": "Стрестен туындаған асыра жеуді бақылаңыз",
        "description": "Стресс жиі тәбетті бұзады және калориялы тағамға тартады. Кейде мәселе БЖУ-де емес, шаршаған бастың ішінде."
    },
    56: {
        "title": "Жазбалар неғұрлым дәл болса, кеңестер пайдалырақ",
        "description": "Тамақ пен суды жүйелі жазып отырсаңыз, кеңестер әлдеқайда нақты және пайдалы болады."
    },
    58: {
        "title": "Көкөністер рационды жақсартудың оңай жолы",
        "description": "Көкөністер артық калорийсіз тамақтану көлемін арттыруға және рационды теңгерімдірек етуге көмектеседі."
    },
    59: {
        "title": "Өзіңізге сай тамақтану режимін таңдаңыз",
        "description": "Барлығына бірдей тамақтанудың идеалды жиілігі жоқ. Калория мен БЖУ бойынша жоспарды асыра жемеуге және ұстауға көмектесетін режим таңдаңыз."
    },
    # МОТИВАЦИЯ
    101: {
        "title": "Тұрақтылық мінсіздіктен маңыздырақ",
        "description": "Бір мінсіз емес күн ештеңені бұзбайды. Жақсы шешімдерді жүйелі қайталау әлдеқайда маңыздырақ."
    },
}


# База всех советов
ALL_TIPS = [
    # КАЛОРИИ
    {
        "id": 1,
        "title": "Контролируйте размер порций",
        "description": "Если калорий выходит больше цели, начните с уменьшения порций самых калорийных продуктов. Овощи и другие объёмные продукты помогут сохранить сытость.",
        "icon": "Utensils",
        "category": "calories",
        "priority": "high",
        "condition": "exceeds_calories"
    },
    {
        "id": 2,
        "title": "Замените сладкие напитки",
        "description": "Сладкие напитки и калорийный кофе легко увеличивают общий калораж. Чаще выбирайте воду, несладкий чай или кофе без сиропов.",
        "icon": "Coffee",
        "category": "calories",
        "priority": "high",
        "condition": "exceeds_calories"
    },
    {
        "id": 3,
        "title": "Следите за вечерним перееданием",
        "description": "Если основная часть лишних калорий набирается вечером, заранее планируйте ужин и уберите бесконтрольные перекусы перед сном.",
        "icon": "Moon",
        "category": "calories",
        "priority": "medium",
        "condition": "exceeds_calories"
    },
    {
        "id": 4,
        "title": "Ешьте медленнее",
        "description": "Более спокойный темп еды помогает лучше замечать насыщение и уменьшает риск переедания.",
        "icon": "Timer",
        "category": "calories",
        "priority": "medium",
        "condition": "exceeds_calories"
    },
    {
        "id": 5,
        "title": "Добавьте больше сытных продуктов",
        "description": "Овощи, бобовые, цельнозерновые и другие продукты с хорошей насыщающей способностью помогают легче контролировать калории.",
        "icon": "Leaf",
        "category": "calories",
        "priority": "medium",
        "condition": "exceeds_calories"
    },
    {
        "id": 6,
        "title": "Планируйте еду заранее",
        "description": "Когда питание не спланировано, проще перебрать калории на случайных перекусах и доставке. Старайтесь заранее продумывать основные приёмы пищи.",
        "icon": "CalendarDays",
        "category": "calories",
        "priority": "high",
        "condition": "exceeds_calories"
    },
    {
        "id": 9,
        "title": "Не ешьте на автомате перед экраном",
        "description": "Когда внимание уходит в телефон или сериал, сложнее заметить объём съеденного. Лучше есть осознанно и без фона.",
        "icon": "Smartphone",
        "category": "calories",
        "priority": "medium",
        "condition": "exceeds_calories"
    },
    {
        "id": 10,
        "title": "Добавьте больше повседневной активности",
        "description": "Прогулки, лестницы, короткие разминки и регулярное движение помогают тратить больше энергии и поддерживать вес.",
        "icon": "Activity",
        "category": "calories",
        "priority": "medium",
        "condition": "exceeds_calories"
    },

    # БЕЛОК
    {
        "id": 21,
        "title": "Добавьте белок в первый или основной приём пищи",
        "description": "Если белка мало, начните с одного простого шага: включайте источник белка в завтрак или в самый крупный приём пищи дня.",
        "icon": "Egg",
        "category": "protein",
        "priority": "high",
        "condition": "low_protein"
    },
    {
        "id": 22,
        "title": "Выбирайте разнообразные источники белка",
        "description": "Подойдут рыба, птица, яйца, творог, йогурт, бобовые, тофу и другие соевые продукты. Лучше чередовать источники, а не полагаться только на один.",
        "icon": "Fish",
        "category": "protein",
        "priority": "high",
        "condition": "low_protein"
    },
    {
        "id": 23,
        "title": "Добавьте бобовые",
        "description": "Фасоль, нут, чечевица и горох помогают добирать и белок, и более качественные углеводы.",
        "icon": "Sprout",
        "category": "protein",
        "priority": "medium",
        "condition": "low_protein"
    },
    {
        "id": 24,
        "title": "Сделайте перекусы более белковыми",
        "description": "Для перекусов чаще выбирайте продукты, которые действительно насыщают: йогурт без лишнего сахара, творог, кефир, яйца.",
        "icon": "Apple",
        "category": "protein",
        "priority": "medium",
        "condition": "low_protein"
    },
    {
        "id": 25,
        "title": "Используйте молочные продукты или их аналоги",
        "description": "Творог, йогурт, кефир, сыр в умеренном количестве или обогащённые альтернативы могут помочь добрать белок.",
        "icon": "Milk",
        "category": "protein",
        "priority": "medium",
        "condition": "low_protein"
    },
    {
        "id": 26,
        "title": "Распределяйте белок по дню",
        "description": "Белок удобнее добирать не одним большим приёмом пищи, а распределять по нескольким приёмам в течение дня.",
        "icon": "Clock",
        "category": "protein",
        "priority": "medium",
        "condition": "low_protein"
    },
    {
        "id": 27,
        "title": "Протеиновый продукт — только как удобный инструмент",
        "description": "Если обычной едой белок добрать сложно, протеиновый коктейль или батончик могут быть удобным дополнением, но не обязательной основой рациона.",
        "icon": "FlaskConical",
        "category": "protein",
        "priority": "low",
        "condition": "low_protein"
    },

    # УГЛЕВОДЫ
    {
        "id": 31,
        "title": "Сделайте углеводы качественнее",
        "description": "Если углеводов много, уменьшайте долю сладостей, сладких напитков и белой выпечки, а основу делайте из круп, бобовых, фруктов и овощей.",
        "icon": "Wheat",
        "category": "carbs",
        "priority": "high",
        "condition": "high_carbs"
    },
    {
        "id": 32,
        "title": "Сочетайте углеводы с белком",
        "description": "Когда углеводы идут вместе с белком, сытость обычно держится лучше, а питание становится более сбалансированным.",
        "icon": "Scale",
        "category": "carbs",
        "priority": "medium",
        "condition": "high_carbs"
    },

    # ЖИРЫ
    {
        "id": 41,
        "title": "Снизьте долю скрытых жиров",
        "description": "Если жиров выходит слишком много, сократите жареное, жирные соусы, колбасы, фастфуд и частые калорийные снеки.",
        "icon": "Flame",
        "category": "fats",
        "priority": "high",
        "condition": "high_fats"
    },
    {
        "id": 42,
        "title": "Выбирайте более полезные жиры",
        "description": "Чаще используйте рыбу, орехи, семена, авокадо и растительные масла, а не только жареные и переработанные продукты.",
        "icon": "Droplets",
        "category": "fats",
        "priority": "medium",
        "condition": "high_fats"
    },

    # ВОДА
    {
        "id": 51,
        "title": "Пейте регулярно в течение дня",
        "description": "Старайтесь не доводить себя до жажды. Вода и другие несладкие напитки помогают поддерживать нормальную гидратацию.",
        "icon": "GlassWater",
        "category": "hydration",
        "priority": "high",
        "condition": "low_water"
    },
    {
        "id": 111,
        "title": "Поставьте напоминания о воде",
        "description": "Если часто забываете пить, напоминания действительно помогают добирать жидкость без лишних усилий.",
        "icon": "Bell",
        "category": "hydration",
        "priority": "medium",
        "condition": "low_water"
    },
    {
        "id": 112,
        "title": "Держите воду под рукой",
        "description": "Бутылка воды рядом делает питьё более регулярным и снижает шанс заменить воду сладким напитком.",
        "icon": "Droplet",
        "category": "hydration",
        "priority": "medium",
        "condition": "low_water"
    },

    # ОБРАЗ ЖИЗНИ / ФУНДАМЕНТ
    {
        "id": 52,
        "title": "Сон влияет и на аппетит тоже",
        "description": "Недосып часто мешает контролировать голод и выбор еды. Стабильный режим сна — часть нормального пищевого поведения.",
        "icon": "BedDouble",
        "category": "habits",
        "priority": "low",
        "condition": "always"
    },
    {
        "id": 54,
        "title": "Регулярная активность помогает держать баланс",
        "description": "Тренировки полезны, но ещё важнее просто регулярно двигаться и не проводить весь день в режиме полного покоя.",
        "icon": "Dumbbell",
        "category": "habits",
        "priority": "low",
        "condition": "always"
    },
    {
        "id": 55,
        "title": "Следите за стрессовым перееданием",
        "description": "Стресс часто сбивает аппетит и тянет к более калорийной еде. Иногда проблема не в БЖУ, а в перегруженной голове.",
        "icon": "Brain",
        "category": "habits",
        "priority": "low",
        "condition": "always"
    },
    {
        "id": 56,
        "title": "Чем точнее записи — тем полезнее советы",
        "description": "Когда вы регулярно записываете еду и воду, советы становятся намного точнее и полезнее.",
        "icon": "NotebookPen",
        "category": "habits",
        "priority": "medium",
        "condition": "insufficient_tracking"
    },
    {
        "id": 58,
        "title": "Овощи — простой способ улучшить рацион",
        "description": "Овощи помогают увеличить объём еды без лишних калорий и делают рацион более сбалансированным.",
        "icon": "Carrot",
        "category": "habits",
        "priority": "low",
        "condition": "always"
    },
    {
        "id": 59,
        "title": "Подберите режим питания под себя",
        "description": "Нет одной идеальной частоты приёмов пищи для всех. Выберите такой режим, который помогает вам не переедать и держать план по калориям и БЖУ.",
        "icon": "LayoutGrid",
        "category": "habits",
        "priority": "low",
        "condition": "always"
    },

    # МОТИВАЦИЯ
    {
        "id": 101,
        "title": "Последовательность важнее идеальности",
        "description": "Один неидеальный день ничего не ломает. Гораздо важнее повторять хорошие решения регулярно.",
        "icon": "TrendingUp",
        "category": "motivation",
        "priority": "low",
        "condition": "always"
    },
]

# Максимум советов с condition == "always" в одном ответе
MAX_ALWAYS_TIPS = 3
# Максимум советов всего
MAX_TOTAL_TIPS = 12


def get_translated_tip(tip, language):
    """Возвращает совет с переводом на нужный язык"""
    if language == 'kk' and tip['id'] in TIPS_KK:
        translated = tip.copy()
        translated['title'] = TIPS_KK[tip['id']]['title']
        translated['description'] = TIPS_KK[tip['id']]['description']
        return translated
    return tip


def check_condition(condition, user_stats):
    """Проверяет, применим ли совет к пользователю"""
    if condition == "always":
        return True

    if condition == "insufficient_tracking":
        return user_stats.get("days_with_meals", 0) < 4

    if condition == "exceeds_calories":
        return user_stats.get("avg_calories", 0) > user_stats.get("target_calories", 2000) * 1.05

    if condition == "low_protein":
        return user_stats.get("avg_protein", 0) < user_stats.get("target_protein", 100) * 0.85

    if condition == "high_carbs":
        return user_stats.get("avg_carbs", 0) > user_stats.get("target_carbs", 250) * 1.15

    if condition == "high_fats":
        return user_stats.get("avg_fats", 0) > user_stats.get("target_fats", 70) * 1.15

    if condition == "low_water":
        return user_stats.get("avg_water_ml", 0) < user_stats.get("water_goal_ml", 2000) * 0.8

    return False


def get_priority(condition, user_stats):
    """Вычисляет динамический приоритет совета"""
    if condition == "insufficient_tracking":
        tracked = user_stats.get("days_with_meals", 0)
        return "high" if tracked <= 2 else "medium"

    if condition == "exceeds_calories":
        excess = user_stats.get("avg_calories", 0) - user_stats.get("target_calories", 2000)
        if excess > 400:
            return "high"
        elif excess > 150:
            return "medium"
        return "low"

    if condition == "low_protein":
        shortage = user_stats.get("target_protein", 100) - user_stats.get("avg_protein", 0)
        if shortage > 35:
            return "high"
        elif shortage > 15:
            return "medium"
        return "low"

    if condition == "high_carbs":
        excess = user_stats.get("avg_carbs", 0) - user_stats.get("target_carbs", 250)
        if excess > 60:
            return "high"
        elif excess > 25:
            return "medium"
        return "low"

    if condition == "high_fats":
        excess = user_stats.get("avg_fats", 0) - user_stats.get("target_fats", 70)
        if excess > 25:
            return "high"
        elif excess > 10:
            return "medium"
        return "low"

    if condition == "low_water":
        ratio = user_stats.get("avg_water_ml", 0) / max(user_stats.get("water_goal_ml", 2000), 1)
        if ratio < 0.5:
            return "high"
        elif ratio < 0.8:
            return "medium"
        return "low"

    return "low"


@tips_bp.route('get', methods=['GET'])
@jwt_required()
def get_tips():
    """Получить персонализированные советы для пользователя"""
    try:
        user_id = int(get_jwt_identity())

        # Язык
        language = request.headers.get('Accept-Language', 'ru')
        if ',' in language:
            language = language.split(',')[0]
        if '-' in language:
            language = language.split('-')[0]
        language = request.args.get('lang', language)

        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Пользователь не найден'}), 404

        goals = UserGoals.query.filter_by(user_id=user_id).first()

        week_ago = datetime.now(timezone.utc).date() - timedelta(days=7)

        meals_week = Meal.query.filter(
            Meal.user_id == user_id,
            Meal.meal_date >= week_ago
        ).all()

        days_with_meals = len(set(m.meal_date for m in meals_week))
        meal_divisor = days_with_meals or 1

        total_cals    = sum(m.calories or 0 for m in meals_week)
        total_protein = sum(m.protein  or 0 for m in meals_week)
        total_carbs   = sum(m.carbs    or 0 for m in meals_week)
        total_fats    = sum(m.fats     or 0 for m in meals_week)

        water_entries = WaterEntry.query.filter(
            WaterEntry.user_id == user_id,
            WaterEntry.date >= week_ago
        ).all()

        days_with_water = len(set(w.date for w in water_entries))
        water_divisor   = days_with_water or 1
        total_water_ml  = sum(w.amount_ml for w in water_entries)
        avg_water_ml    = total_water_ml / water_divisor

        water_goal_ml = goals.water_goal if goals and goals.water_goal else 2000

        user_stats = {
            'avg_calories': total_cals    / meal_divisor,
            'avg_protein':  total_protein / meal_divisor,
            'avg_carbs':    total_carbs   / meal_divisor,
            'avg_fats':     total_fats    / meal_divisor,

            'target_calories': goals.calories_goal if goals and goals.calories_goal else 2000,
            'target_protein':  goals.protein_goal  if goals and goals.protein_goal  else 100,
            'target_carbs':    goals.carbs_goal     if goals and goals.carbs_goal    else 250,
            'target_fats':     goals.fats_goal      if goals and goals.fats_goal     else 70,

            'avg_water_ml':    avg_water_ml,
            'water_goal_ml':   water_goal_ml,

            'days_with_meals': days_with_meals,
            'days_with_water': days_with_water,
        }

        # Фильтруем и присваиваем динамический приоритет
        conditional_tips = []
        always_tips = []

        for tip in ALL_TIPS:
            if not check_condition(tip['condition'], user_stats):
                continue
            tip_copy = get_translated_tip(tip, language)
            tip_copy = dict(tip_copy)
            tip_copy['priority'] = get_priority(tip['condition'], user_stats)

            if tip['condition'] in ('always',):
                always_tips.append(tip_copy)
            else:
                conditional_tips.append(tip_copy)

        # Сортируем по приоритету
        priority_order = {'high': 0, 'medium': 1, 'low': 2}
        conditional_tips.sort(key=lambda t: priority_order.get(t['priority'], 2))
        always_tips.sort(key=lambda t: priority_order.get(t['priority'], 2))

        # Ограничиваем always-советы и total
        always_tips = always_tips[:MAX_ALWAYS_TIPS]
        relevant_tips = (conditional_tips + always_tips)[:MAX_TOTAL_TIPS]

        # Применяем фильтры из query params
        category = request.args.get('category')
        priority = request.args.get('priority')
        search   = request.args.get('search', '').lower()

        filtered_tips = relevant_tips

        if category and category != 'all':
            filtered_tips = [t for t in filtered_tips if t['category'] == category]

        if priority and priority != 'all':
            filtered_tips = [t for t in filtered_tips if t['priority'] == priority]

        if search:
            filtered_tips = [t for t in filtered_tips if
                             search in t['title'].lower() or
                             search in t['description'].lower()]

        logger.info(f"[GET /tips] user_id={user_id}, found {len(filtered_tips)} tips "
                    f"(cond={len(conditional_tips)}, always={len(always_tips)})")

        return jsonify({
            'tips': filtered_tips,
            'count': len(filtered_tips),
            'user_stats': user_stats
        })

    except Exception as e:
        logger.error(f"[GET /tips] Ошибка: {e}", exc_info=True)
        return jsonify({'error': 'Ошибка получения советов'}), 500
