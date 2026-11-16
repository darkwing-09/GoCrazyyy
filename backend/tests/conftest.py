import os, pytest
os.environ["DATABASE_URL"] = "sqlite:///./test_gocrazy.db"
os.environ["SEED_DEMO"] = "false"
os.environ["RAZORPAY_KEY_ID"] = ""
os.environ["RAZORPAY_KEY_SECRET"] = ""
os.environ["RAZORPAY_WEBHOOK_SECRET"] = "whsec_test"
os.environ["DATAFAST_API_KEY"] = ""
from fastapi.testclient import TestClient  # noqa: E402
from app.main import app  # noqa: E402
from app.db import Base, engine, SessionLocal  # noqa: E402
from app.seed import seed  # noqa: E402


@pytest.fixture(scope="session")
def client():
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        seed(db)
    with TestClient(app) as c:
        yield c
    Base.metadata.drop_all(engine)
    try: os.remove("test_gocrazy.db")
    except OSError: pass
