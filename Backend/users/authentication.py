from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import AccessToken
from .models import Brand


class BrandUser:
    """A mock user object for brand authentication"""
    def __init__(self, brand):
        self.brand = brand
        self.id = brand.id
        self.pk = brand.id
        self.username = brand.username
        self.email = brand.email
        self.is_authenticated = True
        self.is_active = brand.is_active
        self.is_brand = True
        self.is_staff = False
        self.is_superuser = False
        self.user_type = 'brand'

    def has_perm(self, perm, obj=None):
        return False

    def has_module_perms(self, app_label):
        return False


class CustomJWTAuthentication(JWTAuthentication):
    """
    Custom JWT Authentication that handles both User and Brand tokens.
    """
    
    def authenticate(self, request):
        # First, try standard JWT authentication for users
        try:
            result = super().authenticate(request)
            if result is not None:
                return result
        except (AuthenticationFailed, Exception):
            pass
        
        # If standard auth fails, try brand token authentication
        header = self.get_header(request)
        if header is None:
            return None
        
        raw_token = self.get_raw_token(header)
        if raw_token is None:
            return None
        
        try:
            # Try to decode as brand token
            validated_token = AccessToken(raw_token)
            brand_id = validated_token.get('brand_id')
            
            if brand_id:
                try:
                    brand = Brand.objects.get(id=brand_id)
                    if not brand.is_active:
                        raise AuthenticationFailed('Brand account is disabled')
                    
                    # Return a BrandUser wrapper
                    return (BrandUser(brand), validated_token)
                except Brand.DoesNotExist:
                    raise AuthenticationFailed('Brand not found')
            
        except Exception as e:
            # Token is invalid
            pass
        
        return None
