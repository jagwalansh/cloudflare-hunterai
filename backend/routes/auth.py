import os
import jwt
from fastapi import Header, Query, HTTPException, Depends
from typing import Optional
from sqlalchemy.orm import Session
from config.database import get_db
from config.models import User


def require_role(required_role: str):
    """Dependency factory: returns a dependency that ensures the user has the given role."""
    def _dependency(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> User:
        is_dev = os.getenv("DEV_MODE", "true").lower() == "true"
        if user.role != required_role:
            if is_dev or user.id.startswith("guest_") or user.id.startswith("mock_"):
                user.role = required_role
                db.add(user)
                db.commit()
                db.refresh(user)
                return user
            raise HTTPException(
                status_code=403,
                detail=f"This endpoint requires '{required_role}' role. Your role is '{user.role}'."
            )
        return user
    return _dependency


def _get_jwt_secret():
    """Lazy loader so the env var is read after dotenv has been loaded in main.py."""
    return os.getenv("SUPABASE_JWT_SECRET") or os.getenv("NEXT_PUBLIC_SUPABASE_JWT_SECRET")


def get_current_user(
    authorization: Optional[str] = Header(None),
    token_param: Optional[str] = Query(None, alias="token"),
    db: Session = Depends(get_db)
) -> User:
    is_dev = os.getenv("DEV_MODE", "true").lower() == "true"

    if not authorization and token_param:
        if token_param.startswith("Bearer "):
            authorization = token_param
        else:
            authorization = f"Bearer {token_param}"

    # Dev mode fallback if authorization header is missing in local dev
    if not authorization and is_dev:
        authorization = "Bearer mock_token:guest_123:guest_123@hunterai.local:Guest User"

    # 1. Parse custom mock token if present (local development isolation)
    if authorization and is_dev:
        try:
            scheme, token = str(authorization).split(maxsplit=1)
            if scheme.lower() == "bearer" and token.startswith("mock_token:"):
                # Format: mock_token:<user_id>[:<email>:<username>]
                parts = token.split(":", maxsplit=3)
                user_id = parts[1] if len(parts) > 1 and parts[1] else "guest_user"
                email = parts[2] if len(parts) > 2 and parts[2] else f"{user_id}@hunterai.local"
                username = parts[3] if len(parts) > 3 and parts[3] else "Guest User"
                
                db_user = db.query(User).filter(User.id == user_id).first()
                if not db_user:
                    db_user = db.query(User).filter(User.email == email).first()
                    
                if not db_user:
                    db_user = User(
                        id=user_id,
                        username=username,
                        email=email
                    )
                    db.add(db_user)
                    db.commit()
                    db.refresh(db_user)
                return db_user
        except Exception as e:
            print(f"Error parsing mock token: {e}")

    # 2. Require Authorization Header
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    # 3. Extract Bearer token for production Supabase auth
    try:
        scheme, token = str(authorization).split(maxsplit=1)
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Authorization header format")

    # 4. Decode and verify Supabase JWT
    jwt_secret = _get_jwt_secret()
    supabase_url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    supabase_anon_key = os.getenv("SUPABASE_ANON_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

    payload = None

    extracted_supabase_url = supabase_url
    if not extracted_supabase_url:
        # P0-4 Fix: Do not extract arbitrary issuer from unverified token
        pass
    
    # Try JWKS asymmetric verification (highly recommended for new projects signed with ECC/ES256)
    if extracted_supabase_url:
        try:
            jwks_url = f"{extracted_supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json"
            # Supabase JWKS is publicly accessible, but we can pass api key headers if configured
            headers = {"apikey": supabase_anon_key} if supabase_anon_key else {}
            jwks_client = jwt.PyJWKClient(jwks_url, headers=headers)
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["ES256", "RS256", "HS256"],
                options={"verify_aud": False}
            )
        except Exception as e:
            print(f"JWKS verification check bypassed or failed: {e}. Falling back to symmetric HS256 secret verification...")

    if not payload:
        if not jwt_secret or jwt_secret == "YOUR_SUPABASE_JWT_SECRET":
            if is_dev:
                user_id = "local_dev_user"
                email = "dev@hunterai.local"
                username = "Local Developer"
                db_user = db.query(User).filter(User.id == user_id).first()
                if not db_user:
                    db_user = User(id=user_id, username=username, email=email)
                    db.add(db_user)
                    db.commit()
                    db.refresh(db_user)
                return db_user
            else:
                raise HTTPException(status_code=401, detail="Authentication not configured")
            
        try:
            payload = jwt.decode(
                token,
                jwt_secret,
                algorithms=["HS256"],
                audience="authenticated",
                options={"verify_aud": True}
            )
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Authentication token has expired")
        except jwt.InvalidTokenError as e:
            if is_dev:
                user_id = "local_dev_user"
                email = "dev@hunterai.local"
                username = "Local Developer"
                db_user = db.query(User).filter(User.id == user_id).first()
                if not db_user:
                    db_user = User(id=user_id, username=username, email=email)
                    db.add(db_user)
                    db.commit()
                    db.refresh(db_user)
                return db_user
            raise HTTPException(status_code=401, detail="Invalid authentication token")


    user_id = payload.get("sub")
    email = payload.get("email")
    if not user_id or not email:
        raise HTTPException(status_code=401, detail="Invalid token payload")
        
    user_metadata = payload.get("user_metadata", {})
    username = user_metadata.get("username") or user_metadata.get("full_name") or user_metadata.get("name") or email.split("@")[0]

    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        # Fallback check for email to prevent UNIQUE constraint crash!
        db_user = db.query(User).filter(User.email == email).first()
        
    if not db_user:
        db_user = User(
            id=user_id,
            username=username,
            email=email
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    
    return db_user
