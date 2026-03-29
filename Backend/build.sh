#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Print migration plan for visibility in deploy logs
python manage.py showmigrations

# Collect static files
python manage.py collectstatic --no-input

# Run migrations
python manage.py migrate --noinput --verbosity 2

# Create or update superuser (works without shell access on Render free plan)
# Prefer env vars from Render dashboard; fallback values keep current behavior.
python manage.py shell << EOF
import os
from django.contrib.auth import get_user_model

User = get_user_model()
username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'dinarr')
email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'dhdinar63@gmail.com')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', '#Dinar11')

user, created = User.objects.get_or_create(
    username=username,
    defaults={
        'email': email,
        'is_staff': True,
        'is_superuser': True,
        'is_active': True,
    },
)

user.email = email
user.is_staff = True
user.is_superuser = True
user.is_active = True
user.set_password(password)
user.save()

print('Superuser created' if created else 'Superuser updated')
EOF
