from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, validator
import re

from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])
auth_service = AuthService()


class SendOTPRequest(BaseModel):
    phone_number: str  # E.164 format: +919876543210

    @validator("phone_number")
    def validate_phone(cls, v):
        # Accept raw 10-digit Indian numbers too, auto-prefix +91
        digits = re.sub(r"\D", "", v)
        if len(digits) == 10:
            v = f"+91{digits}"
        if not re.match(r"^\+[1-9]\d{7,14}$", v):
            raise ValueError("Enter a valid 10-digit mobile number")
        return v


class VerifyOTPRequest(BaseModel):
    phone_number: str
    otp: str


@router.post("/send-otp")
async def send_otp(body: SendOTPRequest):
    """Send OTP to phone number via Twilio Verify."""
    result = await auth_service.send_otp(body.phone_number)
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])
    return {"message": "OTP sent successfully", "phone_number": body.phone_number}


@router.post("/verify-otp")
async def verify_otp(body: VerifyOTPRequest):
    """Verify OTP and register/update user in DB."""
    result = await auth_service.verify_otp(body.phone_number, body.otp)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return {
        "message": "Phone verified successfully",
        "user": result["user"],
        "access_token": result["access_token"],
        "token_type": result["token_type"]
    }
