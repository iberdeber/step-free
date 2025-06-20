import re
from datetime import datetime
from typing import Dict, Any, Tuple

class AuthService:
    def __init__(self, supabase_client):
        self.supabase = supabase_client
        
    def validate_email(self, email: str) -> Tuple[bool, str]:
        """Validate email format."""
        email_pattern = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
        if not email_pattern.match(email):
            return False, "Invalid email format"
        return True, ""
        
    def validate_password(self, password: str) -> Tuple[bool, str]:
        """Validate password strength."""
        if len(password) < 8:
            return False, "Password must be at least 8 characters long"
        if not re.search(r'[A-Z]', password):
            return False, "Password must contain at least one uppercase letter"
        if not re.search(r'[a-z]', password):
            return False, "Password must contain at least one lowercase letter"
        if not re.search(r'\d', password):
            return False, "Password must contain at least one number"
        return True, ""

    def signup(self, email: str, password: str) -> Dict[str, Any]:
        """Sign up a new user with validation."""
        # Validate input
        email_valid, email_error = self.validate_email(email)
        if not email_valid:
            raise ValueError(email_error)
            
        password_valid, password_error = self.validate_password(password)
        if not password_valid:
            raise ValueError(password_error)

        try:
            # Attempt to sign up the user
            response = self.supabase.auth.sign_up({
                "email": email,
                "password": password
            })
            
            if not response.user:
                raise ValueError("Failed to create user")

            # Return user data
            return {
                "id": response.user.id,
                "email": response.user.email,
                "created_at": response.user.created_at,
                "message": "Please check your email for verification"
            }
            
        except Exception as e:
            if "User already registered" in str(e):
                raise ValueError("Email already registered")
            raise ValueError(f"Signup failed: {str(e)}")
        
    def signin(self, email: str, password: str) -> Dict[str, Any]:
        """Sign in a user."""
        try:
            # Validate email format
            email_valid, email_error = self.validate_email(email)
            if not email_valid:
                raise ValueError(email_error)

            # Attempt to sign in
            response = self.supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            if not response.user or not response.session:
                raise ValueError("Invalid credentials")

            return {
                "id": response.user.id,
                "email": response.user.email,
                "access_token": response.session.access_token,
                "refresh_token": response.session.refresh_token,
                "expires_at": datetime.fromtimestamp(response.session.expires_at).isoformat()
            }
            
        except Exception as e:
            if "Invalid login credentials" in str(e):
                raise ValueError("Invalid email or password")
            raise ValueError(f"Login failed: {str(e)}")

    def signout(self, access_token: str) -> Dict[str, str]:
        """Sign out a user."""
        try:
            # Just call sign_out directly without setting session
            # The frontend already includes the token in the Authorization header
            self.supabase.auth.sign_out()
            return {"message": "Successfully signed out"}
        except Exception as e:
            raise ValueError(f"Signout failed: {str(e)}")

    def get_current_user(self, access_token: str) -> Dict[str, Any]:
        """Get the current user's information."""
        try:
            self.supabase.auth.set_session(access_token)
            response = self.supabase.auth.get_user()
            
            if not response.user:
                raise ValueError("No user found")

            return {
                "id": response.user.id,
                "email": response.user.email,
                "email_verified": response.user.email_confirmed_at is not None,
                "last_sign_in": response.user.last_sign_in_at,
                "created_at": response.user.created_at
            }
        except Exception as e:
            raise ValueError(f"Failed to get user: {str(e)}") 