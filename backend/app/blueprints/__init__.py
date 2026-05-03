from .health import bp as health_bp
from .auth import bp as auth_bp
from .services import bp as services_bp
from .applications import bp as applications_bp
from .documents import bp as documents_bp
from .notifications import bp as notifications_bp
from .subsidiaries import bp as subsidiaries_bp
from .categories import bp as categories_bp
from .articles import bp as articles_bp
from .pages import bp as pages_bp
from .faq import bp as faq_bp
from .templates import bp as templates_bp
from .news import bp as news_bp
from .contacts import bp as contacts_bp
from .vacancies import bp as vacancies_bp
from .search import bp as search_bp
from .calculators import bp as calculators_bp
from .bookings import bp as bookings_bp
from .webhooks import bp as webhooks_bp


def register_blueprints(app):
    for bp in (
        health_bp, auth_bp,
        services_bp, applications_bp, documents_bp, notifications_bp,
        subsidiaries_bp, categories_bp, articles_bp, pages_bp,
        faq_bp, templates_bp, news_bp, contacts_bp, vacancies_bp,
        search_bp, calculators_bp, bookings_bp, webhooks_bp,
    ):
        app.register_blueprint(bp)
