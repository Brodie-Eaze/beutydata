from core.hashing import (email_masked, hash_email, hash_phone, normalize_email,
                          normalize_phone_au, phone_last4)


def test_phone_normalization():
    assert normalize_phone_au("0412 345 678") == "+61412345678"
    assert normalize_phone_au("+61 412 345 678") == "+61412345678"
    assert normalize_phone_au("61412345678") == "+61412345678"


def test_phone_hash_deterministic():
    a = hash_phone("0412 345 678")
    b = hash_phone("+61412345678")
    assert a == b
    assert len(a) == 64


def test_email_hash_case_insensitive():
    assert hash_email("Foo@Bar.COM") == hash_email("foo@bar.com")


def test_email_masked():
    assert email_masked("brodie@example.com") == "b****e@example.com"
    assert email_masked("ab@example.com") == "a*@example.com"


def test_phone_last4():
    assert phone_last4("0412345678") == "5678"


def test_normalize_email_strips():
    assert normalize_email("  Foo@Bar.com  ") == "foo@bar.com"
