import jwt
import sqlite3
import os
from datetime import datetime, timedelta
from typing import Optional

from twilio.rest import Client
from app.core.config import get_settings

settings = get_settings()

# Reuse the same DB your project already uses
DB_PATH = os.path.join(os.path.dirname(__file__), "../../financial_forensics.db")

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN  = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_VERIFY_SID  = os.getenv("TWILIO_VERIFY_SID")


def _get_db():
    """Get a SQLite connection to the existing financial_forensics.db."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # lets us access columns by name
    return conn


def _ensure_users_table():
    """Create users table if it doesn't exist yet."""
    conn = _get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            phone_number TEXT UNIQUE NOT NULL,
            is_verified  INTEGER DEFAULT 0,
            created_at   TEXT DEFAULT (datetime('now'))
        )
    """)
    conn.commit()
    conn.close()


class AuthService:
    def __init__(self):
        _ensure_users_table()
        self.twilio = Client(settings.twilio_account_sid if hasattr(settings, 'twilio_account_sid') else os.getenv("TWILIO_ACCOUNT_SID"), 
                             settings.twilio_auth_token if hasattr(settings, 'twilio_auth_token') else os.getenv("TWILIO_AUTH_TOKEN"))
        self.verify_sid = settings.twilio_verify_sid if hasattr(settings, 'twilio_verify_sid') else os.getenv("TWILIO_VERIFY_SID")

    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.jwt_expiry_minutes)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm)
        return encoded_jwt

    async def send_otp(self, phone_number: str) -> dict:
        """Send OTP via Twilio Verify."""
        try:
            self.twilio.verify.v2.services(
                self.verify_sid
            ).verifications.create(
                to=phone_number,
                channel="sms"
            )
            return {"success": True}
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def verify_otp(self, phone_number: str, otp: str) -> dict:
        """Check OTP with Twilio, then upsert user into SQLite."""
        # 1. Verify OTP
        try:
            check = self.twilio.verify.v2.services(
                self.verify_sid
            ).verification_checks.create(
                to=phone_number,
                code=otp
            )
        except Exception as e:
            return {"success": False, "error": str(e)}

        if check.status != "approved":
            return {"success": False, "error": "Invalid or expired OTP"}

        # 2. Upsert user into DB
        try:
            conn = _get_db()
            conn.execute("""
                INSERT INTO users (phone_number, is_verified)
                VALUES (?, 1)
                ON CONFLICT(phone_number)
                DO UPDATE SET is_verified = 1
            """, (phone_number,))
            conn.commit()

            row = conn.execute(
                "SELECT id, phone_number, is_verified, created_at FROM users WHERE phone_number = ?",
                (phone_number,)
            ).fetchone()
            conn.close()

            user = {
                "id": row["id"],
                "phone_number": row["phone_number"],
                "is_verified": bool(row["is_verified"]),
                "created_at": row["created_at"],
            }
            
            access_token = self.create_access_token(data={"sub": str(user["id"]), "phone": user["phone_number"]})

            return {
                "success": True,
                "user": user,
                "access_token": access_token,
                "token_type": "bearer"
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
