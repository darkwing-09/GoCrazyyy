"""Categories are structural data. Listings only ever come from paid claims."""
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from .models import Category

CATEGORIES = [
    ("ai-agents", "AI Agents & Infrastructure", "bot"),
    ("seo-ai-visibility", "SEO & AI Visibility", "search"),
    ("marketing", "Marketing & Advertising", "megaphone"),
    ("analytics", "Analytics", "bar-chart-3"),
    ("crypto-web3", "Crypto, Web3 & Investing", "bitcoin"),
    ("developer-tools", "Developer Tools", "code-2"),
    ("business-finance-legal", "Business, Finance & Legal", "scale"),
    ("security-privacy", "Security, Privacy & Compliance", "shield-check"),
    ("health-wellness", "Health, Fitness & Wellness", "heart-pulse"),
    ("social-creator", "Social Media & Creator Tools", "share-2"),
    ("leaderboards", "Leaderboards & Attention Markets", "trophy"),
    ("hiring-careers", "Hiring, Jobs & Careers", "briefcase"),
    ("education", "Education & Learning", "graduation-cap"),
    ("agencies-services", "Agencies, Studios & Services", "building-2"),
    ("ecommerce-retail", "Ecommerce & Retail", "shopping-bag"),
    ("domains-web", "Domains & Web Assets", "globe"),
    ("games-entertainment", "Games & Entertainment", "gamepad-2"),
    ("people-profiles", "People & Profiles", "user-round"),
    ("productivity", "Productivity & Personal Tools", "list-checks"),
    ("product-management", "Product Management", "kanban"),
    ("design-creative", "Design & Creative", "palette"),
    ("writing-content", "Writing & Content", "pen-line"),
    ("directories-launch", "Directories, Launch & Discovery", "rocket"),
    ("ai-media", "AI Media Generation", "wand-sparkles"),
    ("audio-voice", "Audio, Voice & Podcasting", "mic"),
    ("sales-leads", "Sales & Lead Generation", "target"),
    ("travel-lifestyle", "Travel, Local & Lifestyle", "map-pin"),
    ("real-estate", "Real Estate & PropTech", "home"),
    ("student-campus", "Student & Campus Builders", "backpack"),
    ("fintech-payments", "Fintech & Payments", "indian-rupee"),
]


def seed_categories(db: Session) -> None:
    """Idempotent; safe when two cold starts race."""
    existing = set(db.execute(select(Category.slug)).scalars())
    for i, (slug, name, icon) in enumerate(CATEGORIES):
        if slug in existing:
            continue
        db.add(Category(slug=slug, name=name, icon=icon, sort=i))
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
