"""Заполнение БД базовым контентом и тестовыми данными."""
import json
from datetime import datetime, timezone

from .extensions import db
from .models import (
    Subsidiary, Category, Service, Article, Faq, Template, News,
    Page, ContentBlock, Office, Contact, Vacancy, Role, Permission, FormSchema,
)


SUBSIDIARIES = [
    {
        'id': 'damu', 'slug': 'damu',
        'name': 'АО «Фонд развития предпринимательства «Даму»',
        'short_name': 'Даму',
        'description': 'Финансовая поддержка субъектов малого и среднего предпринимательства.',
        'mission': 'Делать предпринимательство в Казахстане доступным и эффективным.',
        'website': 'https://damu.kz',
        'email': 'info@damu.kz',
        'phone': '1408',
        'address': 'г. Алматы, пр. Аль-Фараби, 71',
        'sort_order': 1,
    },
    {
        'id': 'dbk', 'slug': 'dbk',
        'name': 'АО «Банк развития Казахстана»',
        'short_name': 'БРК',
        'description': 'Финансирование инвестиционных проектов в приоритетных секторах экономики.',
        'website': 'https://kdb.kz',
        'email': 'info@kdb.kz',
        'phone': '+7 (7172) 79-26-79',
        'address': 'г. Астана, пр. Мангилик Ел, 55А',
        'sort_order': 2,
    },
    {
        'id': 'kaznex', 'slug': 'kazakhexport',
        'name': 'АО «Экспортная страховая компания «KazakhExport»',
        'short_name': 'KazakhExport',
        'description': 'Страхование экспортных и инвестиционных кредитов от коммерческих и политических рисков.',
        'website': 'https://kazakhexport.kz',
        'email': 'info@kazakhexport.kz',
        'phone': '+7 (7172) 70-15-15',
        'sort_order': 3,
    },
    {
        'id': 'kif', 'slug': 'kif',
        'name': 'АО «Казахстанский инвестиционный фонд»',
        'short_name': 'KIF',
        'description': 'Прямые инвестиции в проекты несырьевого сектора.',
        'website': 'https://kif.kz',
        'sort_order': 4,
    },
    {
        'id': 'kazyna', 'slug': 'kazyna-capital',
        'name': 'АО «Kazyna Capital Management»',
        'short_name': 'KCM',
        'description': 'Управление фондами прямых инвестиций.',
        'website': 'https://kcm.kz',
        'sort_order': 5,
    },
    {
        'id': 'kzh', 'slug': 'qazaqstan-investment-corp',
        'name': 'АО «Қазақстанская жилищная компания»',
        'short_name': 'QIC',
        'description': 'Лизинг производственного оборудования и поддержка обрабатывающей промышленности.',
        'website': 'https://qic.kz',
        'sort_order': 6,
    },
    {
        'id': 'esil', 'slug': 'baiterek-development',
        'name': 'АО «Baiterek Development»',
        'short_name': 'Baiterek Development',
        'description': 'Развитие инфраструктурных и инновационных проектов Холдинга.',
        'sort_order': 7,
    },
]

CATEGORIES = [
    {'id': 'financing', 'slug': 'financing', 'name': 'Финансирование',
     'description': 'Кредиты, займы, микрокредитование', 'icon': 'wallet', 'sort_order': 1},
    {'id': 'guarantees', 'slug': 'guarantees', 'name': 'Гарантии',
     'description': 'Государственные гарантии по кредитам', 'icon': 'shield', 'sort_order': 2},
    {'id': 'grants', 'slug': 'grants', 'name': 'Гранты и субсидии',
     'description': 'Безвозвратные государственные субсидии', 'icon': 'gift', 'sort_order': 3},
    {'id': 'leasing', 'slug': 'leasing', 'name': 'Лизинг',
     'description': 'Финансовый лизинг оборудования', 'icon': 'truck', 'sort_order': 4},
    {'id': 'export', 'slug': 'export', 'name': 'Экспортная поддержка',
     'description': 'Страхование и кредитование экспорта', 'icon': 'globe', 'sort_order': 5},
    {'id': 'investment', 'slug': 'investment', 'name': 'Инвестиции',
     'description': 'Прямые инвестиции и софинансирование', 'icon': 'trending-up', 'sort_order': 6},
    {'id': 'consulting', 'slug': 'consulting', 'name': 'Консультации и обучение',
     'description': 'Консалтинг и образовательные программы', 'icon': 'book-open', 'sort_order': 7},
]

ROLES = [
    ('user', 'Пользователь', 'Стандартный пользователь портала'),
    ('author', 'Автор', 'Создание и редактирование контента и услуг в рамках scope'),
    ('admin', 'Администратор', 'Полный доступ к системе'),
]

PERMISSIONS = [
    ('content.read', 'Просмотр контента'),
    ('content.write', 'Создание/редактирование контента'),
    ('services.read', 'Просмотр услуг'),
    ('services.write', 'Управление услугами'),
    ('applications.read', 'Просмотр заявок'),
    ('applications.write', 'Управление заявками'),
    ('users.manage', 'Управление пользователями'),
    ('audit.read', 'Просмотр журналов аудита'),
    ('reports.read', 'Просмотр отчётов'),
]


DEFAULT_FORM_SCHEMA = {
    'fields': [
        {'name': 'amount', 'label': 'Запрашиваемая сумма (тенге)', 'type': 'number',
         'required': True, 'min': 100000, 'max': 1000000000},
        {'name': 'term_months', 'label': 'Срок (мес.)', 'type': 'integer',
         'required': True, 'min': 1, 'max': 84},
        {'name': 'purpose', 'label': 'Цель', 'type': 'string',
         'required': True, 'max_length': 1000},
        {'name': 'agreement', 'label': 'Согласие на обработку данных',
         'type': 'boolean', 'required': True},
    ]
}


def run_seed():
    if Subsidiary.query.first() is not None:
        return

    # Roles + permissions
    perms_by_code = {}
    for code, desc in PERMISSIONS:
        p = Permission(code=code, description=desc)
        db.session.add(p)
        perms_by_code[code] = p
    db.session.flush()

    role_perms = {
        'user': ['content.read', 'services.read'],
        'author': ['content.read', 'content.write', 'services.read', 'services.write'],
        'admin': list(perms_by_code.keys()),
    }
    for code, name, desc in ROLES:
        role = Role(code=code, name=name, description=desc)
        role.permissions = [perms_by_code[c] for c in role_perms[code]]
        db.session.add(role)

    # Subsidiaries
    for s in SUBSIDIARIES:
        db.session.add(Subsidiary(**s))

    # Categories
    for c in CATEGORIES:
        db.session.add(Category(**c))

    db.session.flush()

    # Базовая форма заявки
    base_form = FormSchema(
        code='default-loan-form',
        name='Стандартная форма заявки на финансирование',
        version=1,
        schema=json.dumps(DEFAULT_FORM_SCHEMA, ensure_ascii=False),
    )
    db.session.add(base_form)
    db.session.flush()

    # Services
    services = [
        {
            'id': 'damu-micro-loan', 'slug': 'damu-micro-loan',
            'title': 'Микрокредитование МСБ',
            'subtitle': 'До 30 млн тенге на пополнение оборотных средств',
            'category_id': 'financing', 'type': 'loan', 'subsidiary_id': 'damu',
            'tags': json.dumps(['МСБ', 'Оборотные средства', 'Льготная ставка'], ensure_ascii=False),
            'amount_min': 1_000_000, 'amount_max': 30_000_000,
            'rate': '6% годовых', 'term': 'до 36 мес.',
            'is_popular': True, 'is_priority': True,
            'description': 'Льготное микрокредитование для субъектов малого и среднего бизнеса.',
            'result': 'Выдача микрокредита на согласованных условиях.',
            'conditions': json.dumps([
                'Срок деятельности — не менее 6 месяцев',
                'Расчётный счёт в РК',
                'Отсутствие задолженности по налогам',
            ], ensure_ascii=False),
            'documents': json.dumps([
                'Заявление установленной формы',
                'Свидетельство о регистрации (БИН)',
                'Финансовая отчётность за 2 года',
                'Бизнес-план',
            ], ensure_ascii=False),
            'timeline': '7–15 рабочих дней',
            'form_schema_id': base_form.id,
        },
        {
            'id': 'damu-guarantee', 'slug': 'damu-guarantee',
            'title': 'Государственная гарантия по кредиту',
            'subtitle': 'Гарантия до 85% от суммы кредита',
            'category_id': 'guarantees', 'type': 'guarantee', 'subsidiary_id': 'damu',
            'tags': json.dumps(['Гарантия', 'МСБ', 'Банки'], ensure_ascii=False),
            'amount_min': 5_000_000, 'amount_max': 500_000_000,
            'rate': '0.5% комиссия', 'term': 'до 84 мес.',
            'is_popular': True,
            'description': 'Государственная гарантия позволяет получить кредит при отсутствии достаточного залогового обеспечения.',
            'result': 'Договор гарантии и сопровождение кредита.',
            'conditions': json.dumps([
                'Резидент РК', 'МСБ по критериям законодательства',
                'Кредитование в банке-партнёре Даму',
            ], ensure_ascii=False),
            'documents': json.dumps([
                'Заявка в банк-партнёр', 'Финансовая отчётность', 'Учредительные документы',
            ], ensure_ascii=False),
            'timeline': '10–20 рабочих дней',
            'form_schema_id': base_form.id,
        },
        {
            'id': 'kaznex-export-insurance', 'slug': 'kaznex-export-insurance',
            'title': 'Страхование экспортных кредитов',
            'subtitle': 'Защита от коммерческих и политических рисков',
            'category_id': 'export', 'type': 'guarantee', 'subsidiary_id': 'kaznex',
            'tags': json.dumps(['Экспорт', 'Страхование', 'Риски'], ensure_ascii=False),
            'amount_min': 10_000_000, 'amount_max': 5_000_000_000,
            'rate': 'от 0.3% годовых', 'term': 'до 5 лет',
            'is_popular': True,
            'description': 'Страхование экспортных сделок от риска неоплаты иностранным покупателем.',
            'conditions': json.dumps([
                'Экспортёр — резидент РК',
                'Экспорт несырьевых товаров',
                'Контракт с иностранным покупателем',
            ], ensure_ascii=False),
            'documents': json.dumps([
                'Экспортный контракт', 'Заявление на страхование',
                'Финансовая отчётность экспортёра',
            ], ensure_ascii=False),
            'timeline': '15–30 рабочих дней',
            'form_schema_id': base_form.id,
        },
        {
            'id': 'kzh-leasing', 'slug': 'kzh-leasing',
            'title': 'Финансовый лизинг оборудования',
            'subtitle': 'Приобретение оборудования без крупных единовременных затрат',
            'category_id': 'leasing', 'type': 'leasing', 'subsidiary_id': 'kzh',
            'tags': json.dumps(['Лизинг', 'Оборудование', 'Производство'], ensure_ascii=False),
            'amount_min': 5_000_000, 'amount_max': 2_000_000_000,
            'rate': '7% годовых', 'term': 'до 84 мес.',
            'description': 'Финансовый лизинг производственного оборудования.',
            'conditions': json.dumps([
                'Деятельность не менее 1 года',
                'Оборудование — новое или б/у до 5 лет',
                'Аванс от 15%',
            ], ensure_ascii=False),
            'documents': json.dumps([
                'Заявка на лизинг', 'Финансовая отчётность', 'Счёт-фактура на оборудование',
            ], ensure_ascii=False),
            'timeline': '10–15 рабочих дней',
            'form_schema_id': base_form.id,
        },
        {
            'id': 'damu-grant', 'slug': 'damu-grant',
            'title': 'Грант для начинающих предпринимателей',
            'subtitle': 'Безвозвратная субсидия до 5 млн тенге',
            'category_id': 'grants', 'type': 'grant', 'subsidiary_id': 'damu',
            'tags': json.dumps(['Грант', 'Начинающие', 'Безвозвратно'], ensure_ascii=False),
            'amount_min': 0, 'amount_max': 5_000_000,
            'rate': 'Безвозвратно', 'term': 'Единоразово',
            'is_popular': True,
            'description': 'Безвозвратная государственная субсидия для открытия или развития малого бизнеса.',
            'conditions': json.dumps([
                'Возраст до 35 лет ИЛИ деятельность до 2 лет',
                'Прохождение обучения «Бастау Бизнес»',
                'Бизнес-проект прошёл отбор',
            ], ensure_ascii=False),
            'documents': json.dumps([
                'Заявление', 'Бизнес-план', 'Сертификат о прохождении обучения',
                'Удостоверение личности',
            ], ensure_ascii=False),
            'timeline': '20–30 рабочих дней',
            'form_schema_id': base_form.id,
        },
    ]
    for sv in services:
        db.session.add(Service(**sv))

    # News
    news_items = [
        {
            'id': 'news-001', 'slug': 'baiterek-2025-strategy',
            'title': 'Байтерек объявляет новую стратегию 2025',
            'subtitle': 'Расширение программ поддержки МСБ и стартапов',
            'summary': 'Холдинг увеличит объёмы финансирования инновационных проектов на 40%.',
            'content': 'В 2025 году холдинг увеличит объёмы финансирования инновационных проектов на 40% и откроет 15 новых консультационных центров.',
            'subsidiary_id': None,
        },
        {
            'id': 'news-002', 'slug': 'damu-new-program',
            'title': 'Даму запускает программу микрокредитования стартапов',
            'subtitle': 'Специальные условия для инновационных компаний',
            'summary': 'Микрокредиты до 50 млн тенге для технологических стартапов по ставке 0%.',
            'content': 'С марта 2025 года Даму предоставляет микрокредиты до 50 млн тенге для технологических стартапов.',
            'subsidiary_id': 'damu',
        },
        {
            'id': 'news-003', 'slug': 'kazakhexport-new-markets',
            'title': 'KazakhExport покрыл новые рынки Юго-Восточной Азии',
            'subtitle': 'Страхование поставок в 5 новых стран',
            'summary': 'Расширение покрытия стран для экспортного страхования.',
            'content': 'Линейка страновых лимитов KazakhExport пополнилась 5 новыми странами региона.',
            'subsidiary_id': 'kaznex',
        },
    ]
    for n in news_items:
        db.session.add(News(**n))

    # Articles (knowledge base)
    articles = [
        {
            'slug': 'how-to-apply-for-microloan',
            'title': 'Как подать заявку на микрокредит в Даму',
            'subtitle': 'Пошаговая инструкция',
            'summary': 'От подачи заявки до получения средств — все шаги.',
            'content': 'Шаг 1. Зарегистрируйтесь на портале...\nШаг 2. Заполните заявку...',
            'category': 'guide',
            'tags': json.dumps(['Микрокредит', 'Даму', 'Инструкция'], ensure_ascii=False),
            'subsidiary_id': 'damu',
            'reading_time': 5,
        },
        {
            'slug': 'business-plan-template',
            'title': 'Шаблон бизнес-плана для МСБ',
            'subtitle': 'Готовая структура и примеры',
            'summary': 'Скачайте шаблон бизнес-плана для подачи заявки.',
            'content': 'Структура бизнес-плана включает...',
            'category': 'knowledge_base',
            'tags': json.dumps(['Бизнес-план', 'Шаблоны'], ensure_ascii=False),
            'reading_time': 10,
        },
    ]
    for a in articles:
        db.session.add(Article(**a))

    # FAQ
    faqs = [
        {'question': 'Как зарегистрироваться на портале?',
         'answer': 'Нажмите «Регистрация» и заполните форму. Для юр. лиц требуется БИН.',
         'category': 'general'},
        {'question': 'Сколько рассматривается заявка?',
         'answer': 'Срок зависит от услуги: от 7 до 30 рабочих дней. Точный срок указан в карточке услуги.',
         'category': 'applications'},
        {'question': 'Что такое ЭЦП и как ею подписать документ?',
         'answer': 'ЭЦП — электронная цифровая подпись. Используется через NCALayer для подписания документов в личном кабинете.',
         'category': 'documents'},
    ]
    for f in faqs:
        db.session.add(Faq(**f))

    # Templates
    templates = [
        {'title': 'Шаблон бизнес-плана', 'description': 'Структурированный шаблон для МСБ',
         'file_url': '/static/templates/business-plan.docx', 'file_type': 'docx',
         'category': 'business_plan'},
        {'title': 'Заявление на микрокредит', 'description': 'Форма заявления Даму',
         'file_url': '/static/templates/microloan-app.pdf', 'file_type': 'pdf',
         'category': 'application_forms', 'subsidiary_id': 'damu',
         'service_id': 'damu-micro-loan'},
    ]
    for t in templates:
        db.session.add(Template(**t))

    # Pages (corporate)
    home = Page(slug='about-baiterek', title='О Холдинге',
                summary='Национальный управляющий холдинг «Байтерек»',
                content='Информация о Холдинге, его миссии, структуре и стратегии.',
                section='corporate')
    db.session.add(home)
    db.session.flush()

    db.session.add(ContentBlock(page_id=home.id, block_type='hero',
                                title='Единый портал поддержки бизнеса',
                                body='Все меры государственной поддержки в одном окне',
                                sort_order=1))

    # Subsidiary pages
    for s in SUBSIDIARIES:
        page = Page(
            slug=f'subsidiary-{s["slug"]}',
            title=s['name'],
            summary=s['description'],
            content=s.get('description', ''),
            section='subsidiary',
            subsidiary_id=s['id'],
        )
        db.session.add(page)

    # Offices
    offices = [
        {'subsidiary_id': 'damu', 'name': 'Центральный офис Даму',
         'city': 'Алматы', 'region': 'Алматы',
         'address': 'пр. Аль-Фараби, 71', 'phone': '1408',
         'working_hours': 'Пн-Пт 9:00-18:00'},
        {'subsidiary_id': 'damu', 'name': 'Региональный филиал Даму Астана',
         'city': 'Астана', 'region': 'Астана',
         'address': 'ул. Достык, 13', 'phone': '+7 7172 70-12-12',
         'working_hours': 'Пн-Пт 9:00-18:00'},
        {'subsidiary_id': 'dbk', 'name': 'Головной офис БРК',
         'city': 'Астана', 'region': 'Астана',
         'address': 'пр. Мангилик Ел, 55А', 'phone': '+7 7172 79-26-79',
         'working_hours': 'Пн-Пт 9:00-18:00'},
    ]
    for o in offices:
        db.session.add(Office(**o))

    # Contacts
    contacts = [
        {'subsidiary_id': 'damu', 'name': 'Колл-центр Даму',
         'department': 'Поддержка пользователей', 'phone': '1408', 'email': 'info@damu.kz'},
        {'subsidiary_id': None, 'name': 'Пресс-служба Холдинга',
         'department': 'PR', 'email': 'press@baiterek.gov.kz'},
    ]
    for c in contacts:
        db.session.add(Contact(**c))

    # Vacancies (redirect-stub)
    db.session.add(Vacancy(
        title='Все вакансии Холдинга',
        description='Перейдите на HR-портал Холдинга для просмотра вакансий.',
        external_url='https://hr.baiterek.gov.kz',
    ))

    db.session.commit()
