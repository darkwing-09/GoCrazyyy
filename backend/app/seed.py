"""Synthetic demo data so the boards are not empty on first run. Every row is flagged is_demo."""
import random
from datetime import datetime, timedelta, timezone
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from .models import Category, Listing, Payment, Click

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

# (slug, title, domain, category, description, total ₹, clicks)
DEMO = [
    ("kaagaz-ai", "Kaagaz AI · paperwork that files itself", "kaagaz.ai", "ai-agents", "Describe the compliance task. A team of agents drafts, files and tracks every GST, MCA and ROC form for you.", 170060, 71449),
    ("tutti-creators", "Tutti · the marketplace to monetise influence", "tutti.so", "marketing", "Join campaigns from real brands and get paid on effective exposure, not vanity metrics.", 160000, 18350),
    ("jugnu", "Jugnu · your personal AI computer", "jugnu.app", "ai-agents", "Chat once and a team of AI agents and skills handles the rest. Runs on your laptop, speaks Hinglish.", 140280, 24785),
    ("outrankr", "Outrankr · grow organic traffic on auto-pilot", "outrankr.in", "seo-ai-visibility", "Backlinks and SEO-optimised content shipped weekly while you build the product.", 130050, 22517),
    ("orynth", "Orynth · list your product and earn", "orynth.dev", "crypto-web3", "Discover early-stage products, back their creators and share the upside.", 127160, 17397),
    ("citecraft", "CiteCraft · citation outreach for AI search", "citecraft.io", "seo-ai-visibility", "Get your brand onto the pages ChatGPT, Gemini and Perplexity already cite.", 127110, 9380),
    ("sahi-compliance", "Sahi · AI compliance software", "sahi.co", "security-privacy", "Automate SOC 2, ISO 27001 and DPDP. 580+ integrations.", 100000, 15240),
    ("zerorank", "ZeroRank · track your AI search visibility", "zerorank.ai", "seo-ai-visibility", "See where you show up across AI assistants and fix the gaps.", 40040, 1920),
    ("flopay", "FloPay · payment orchestration that keeps revenue flowing", "flopay.in", "fintech-payments", "Route every UPI, card and netbanking payment through the gateway most likely to succeed.", 37600, 4120),
    ("pecan-ai", "Pecan AI · predictive analytics for ops", "pecan.ai", "ai-agents", "Forecast demand, churn and cash from the data you already have.", 37500, 3301),
    ("modulate", "Modulate · frontier infra for agents", "modulate.dev", "developer-tools", "Sandboxed runtimes, tracing and evals for production agents.", 35600, 2870),
    ("context-dev", "Context.dev · web search for LLMs", "context.dev", "developer-tools", "Clean, cited search results built for agents, not humans.", 35550, 2504),
    ("latamhire", "LATAMHire · Latin American talent for Indian startups", "latamhire.com", "hiring-careers", "Vetted engineers in overlapping time zones, hired in a week.", 35620, 1105),
    ("linkie", "Linkie by Publer · your link in bio", "linkie.to", "social-creator", "One page for every link, with analytics that matter.", 31410, 980),
    ("winning", "winning.in · is your business winning?", "winning.in", "leaderboards", "A public pay-to-rank leaderboard for businesses. Claim the top spot and your rivals see it.", 31290, 4904),
    ("fuel-log", "Fuel Log · calorie tracking that stays out of the way", "fuellog.app", "health-wellness", "Log a meal in a sentence. Indian dishes included.", 35000, 2150),
    ("otio", "Otio · your AI research and writing partner", "otio.ai", "education", "Summarise papers, draft essays, cite properly.", 30000, 1780),
    ("neocam", "NeoCam · retro camera app", "neocam.app", "design-creative", "Film looks for your phone camera, no subscription.", 10270, 865),
    ("ai-humanizer", "AI Humanizer & Undetectable rewriter", "humanize.so", "writing-content", "Make AI drafts read like you wrote them.", 6600, 432),
    ("launchdir", "Best Launch Directories 2026", "launchdir.in", "directories-launch", "Every place to post your launch, ranked by traffic.", 6000, 1290),
    ("visuallift", "VisualLift · AI product photos", "visuallift.ai", "ai-media", "Studio-grade product shots from one phone photo.", 4000, 350),
    ("autoMailer", "AutoMailer · cold email that lands", "automailer.in", "sales-leads", "Warm up, personalise, send, follow up.", 4000, 610),
    ("wento", "Wento · your trips, with friends", "wento.app", "travel-lifestyle", "Plan, split and share a trip in one chat.", 1510, 240),
    ("gharpe", "GharPe · rent without brokers", "gharpe.in", "real-estate", "Verified flats, zero brokerage, Bengaluru and Pune.", 5010, 1310),
    ("campuscart", "CampusCart · hostel essentials in 20 min", "campuscart.in", "student-campus", "Built by students at NIT Trichy for every hostel in India.", 2990, 777),
    ("hackmate", "HackMate · find your hackathon team", "hackmate.in", "student-campus", "Match with builders by skill, college and timezone.", 1990, 410),
    ("rupeeflow", "RupeeFlow · trial balance in a click", "rupeeflow.in", "business-finance-legal", "Upload Tally exports, get investor-ready statements.", 29990, 2004),
    ("oneword", "ONEWORD.", "oneword.in", "leaderboards", "A single global word on the internet. Anyone can pay to change it.", 3650, 772),
    ("premier-classe", "Premier de la Classe · the paid ranking of French startups", "premierdelaclasse.lol", "seo-ai-visibility", "Le seul classement de startups françaises qui assume.", 5020, 159),
    ("letterfriend", "Letter Friend · handwritten notes service", "letterfriend.com", "marketing", "100% genuine handwritten notes, posted for you.", 13030, 718),
    ("affiliateo", "Affiliateo · affiliate marketing platform", "affiliateo.com", "marketing", "Track every sale, view and payout for your creators.", 13020, 1287),
    ("mailivery", "Mailivery · email warm-up and deliverability", "mailivery.io", "marketing", "Peer-to-peer warm-up that boosts sender reputation.", 3950, 171),
    ("colonist", "Colonist · play Settlers online", "colonist.io", "games-entertainment", "Free browser board game with friends.", 4140, 2201),
    ("robbyfrank", "@RobbyFrank", "x.com", "people-profiles", "@RobbyFrank on X", 3100, 220),
    ("nameforge", "NameForge · business name generator", "nameforge.in", "domains-web", "Brandable names with the .in available.", 6030, 540),
    ("lawofattraction", "Law of Attraction Coach", "loacoach.app", "productivity", "Daily prompts, streaks, no nonsense.", 5640, 330),
    ("projectecho", "Project Echo · product feedback board", "projectecho.dev", "product-management", "Collect, rank and ship what users ask for.", 750, 98),
    ("bnpl-india", "Buy Now, Pay Later for D2C", "bnpl.in", "ecommerce-retail", "Add EMIs to any Shopify store in a day.", 4440, 702),
    ("ai-transform", "AI Transformation Partners", "aitp.agency", "agencies-services", "We ship your first agent in 30 days.", 10740, 301),
    ("realtime-translate", "Real-Time AI Translation for calls", "rtt.ai", "audio-voice", "Hindi to English on live calls, 300ms latency.", 2170, 142),
    ("stg-analytics", "Website analytics for founders", "stg.so", "analytics", "One dashboard, the five numbers that matter.", 1000, 410),
    ("pumpfun-x", "PumpFunCoin on X", "x.com", "crypto-web3", "Memecoin launch tracker.", 31360, 1900),
    ("fiber-stable", "Fiber · the stablecoin wallet", "fiber.money", "crypto-web3", "Hold USD, spend INR.", 25000, 1333),
]

DEALS = [
    ("formsai", "FormsAI · build forms by describing them", "formsai.app", "productivity", "Type what you need, get a form with validation.", 360, "40% off for 12 months", "GOCRAZY40"),
    ("buildtolaunch", "Build to Launch · 30-day founder cohort", "buildtolaunch.in", "education", "Ship your MVP with 40 other founders.", 350, "₹2,000 off the next cohort", "LAUNCH2K"),
    ("vemetric", "Vemetric · simple, yet powerful analytics", "vemetric.com", "analytics", "Product analytics without the setup week.", 310, "3 months free on annual", "BF3FREE"),
    ("proporbit", "PropOrbit · find your next edge", "proporbit.app", "seo-ai-visibility", "Compare lines, market estimates and injury context in one calm research tab.", 100, "80% off for 12 months", "ORBIT80"),
    ("adspends", "AdSpends · search ad intelligence", "adspends.io", "marketing", "See what competitors bid on.", 150, "50% off first year", "SPEND50"),
]


def seed(db: Session) -> None:
    if db.execute(select(func.count(Category.id))).scalar():
        return
    cats = {}
    for i, (slug, name, icon) in enumerate(CATEGORIES):
        c = Category(slug=slug, name=name, icon=icon, sort=i)
        db.add(c)
        cats[slug] = c
    db.flush()
    rng = random.Random(7)
    now = datetime.now(timezone.utc)
    launch = now - timedelta(days=62)

    def add_listing(slug, title, domain, cat, desc, deal=None, coupon=None, age_days=None):
        url = f"https://{domain}" if domain != "x.com" else f"https://x.com/{slug}"
        created = launch + timedelta(days=age_days if age_days is not None else rng.uniform(0, 55))
        l = Listing(slug=slug, url=url, domain=domain, title=title, description=desc,
                    favicon=f"https://www.google.com/s2/favicons?domain={domain}&sz=128",
                    category_id=cats[cat].id, published=True, is_demo=True, created_at=created,
                    published_at=created, deal_text=deal, coupon=coupon)
        db.add(l)
        db.flush()
        return l, created

    def add_payments(l, created, total_rupees, board):
        # Split the total into 1–5 cumulative payments, oldest first (100 + 200 + 300 = 600).
        n = rng.randint(1, 5) if total_rupees > 500 else 1
        cuts = sorted(rng.sample(range(1, total_rupees), n - 1)) if n > 1 else []
        parts = [b - a for a, b in zip([0] + cuts, cuts + [total_rupees])]
        t = created
        for i, part in enumerate(parts):
            t = t + timedelta(days=rng.uniform(0, 12)) if i else t
            t = min(t, now - timedelta(minutes=5))
            db.add(Payment(provider_payment_id=f"pay_demo_{l.slug}_{board}_{i}", listing_id=l.id,
                           amount_paise=part * 100, board=board, method="upi", source="seed", captured_at=t))

    for slug, title, domain, cat, desc, total, clicks in DEMO:
        l, created = add_listing(slug, title, domain, cat, desc)
        add_payments(l, created, total, "main")
        for _ in range(min(clicks, 400)):  # cap so seeding stays fast; the count is still synthetic
            db.add(Click(listing_id=l.id, at=created + timedelta(seconds=rng.uniform(0, 55 * 86400))))

    for slug, title, domain, cat, desc, total, deal, coupon in DEALS:
        l, created = add_listing(slug, title, domain, cat, desc, deal, coupon, age_days=rng.uniform(50, 60))
        add_payments(l, created, total, "deals")

    # A few payments today so the Today board is not empty.
    today_ids = rng.sample([d[0] for d in DEMO], 4)
    for i, slug in enumerate(today_ids):
        l = db.execute(select(Listing).where(Listing.slug == slug)).scalar_one()
        db.add(Payment(provider_payment_id=f"pay_demo_today_{slug}", listing_id=l.id,
                       amount_paise=[1600, 1100, 500, 300][i] * 100, board="main", method="upi", source="seed",
                       captured_at=now - timedelta(hours=rng.uniform(0.2, 4))))
    db.commit()
