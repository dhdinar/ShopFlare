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

# Create superuser if it doesn't exist
python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='dinarr').exists():
    User.objects.create_superuser('dinarr', 'dhdinar63@gmail.com', '#Dinar11')
    print('Superuser created!')
else:
    print('Superuser already exists.')
EOF
