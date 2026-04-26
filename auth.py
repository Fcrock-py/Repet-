import hashlib
import hmac
import base64
import json
import time

SECRET_KEY = "repet_plus_secret_key_2026"

def hash_password(password: str) -> str:
    salt = "repet_salt"
    return hashlib.sha256((password + salt).encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed

def create_token(user_id: int) -> str:
    payload = {
        "user_id": user_id,
        "exp": time.time() + 60 * 60 * 24 * 7
    }
    data = base64.b64encode(json.dumps(payload).encode()).decode()
    sig = hmac.new(SECRET_KEY.encode(), data.encode(), hashlib.sha256).hexdigest()
    return data + "." + sig

def verify_token(token: str):
    try:
        parts = token.split(".")
        if len(parts) != 2:
            return None
        data, sig = parts
        expected_sig = hmac.new(SECRET_KEY.encode(), data.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected_sig):
            return None
        payload = json.loads(base64.b64decode(data).decode())
        if payload["exp"] < time.time():
            return None
        return payload["user_id"]
    except Exception:
        return None