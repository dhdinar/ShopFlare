from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    """Extended user model with additional fields"""
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    is_email_verified = models.BooleanField(default=False)
    
    # Make email required
    REQUIRED_FIELDS = ['email']
    
    def __str__(self):
        return self.username
