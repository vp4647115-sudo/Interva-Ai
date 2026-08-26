from app.services.theirstack_client import build_theirstack_payload


def test_blank_job_search_is_scoped_to_recent_listings() -> None:
    payload = build_theirstack_payload({"page": 1, "limit": 20})

    assert payload["posted_at_max_age_days"] == 30


def test_company_search_does_not_add_default_date_filter() -> None:
    payload = build_theirstack_payload({"company": "Acme", "page": 1, "limit": 20})

    assert payload["company_name_or"] == ["Acme"]
    assert "posted_at_max_age_days" not in payload