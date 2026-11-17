import pytest
from app import metadata


@pytest.mark.parametrize("url", ["http://127.0.0.1/", "http://localhost:8000/", "http://10.0.0.5/", "http://169.254.169.254/latest", "file:///etc/passwd"])
def test_private_targets_blocked(url):
    with pytest.raises(metadata.BlockedURL):
        metadata._assert_public(url)


def test_normalise_strips_tracking_and_handles():
    assert metadata.normalise("https://Example.com/path/?utm_source=x#top") == ("https://example.com/path", None)
    assert metadata.normalise("@gocrazy") == ("https://x.com/gocrazy", "gocrazy")
