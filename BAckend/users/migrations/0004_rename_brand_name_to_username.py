# Generated manually

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_brand_remove_customuser_brand_address_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='brand',
            old_name='brand_name',
            new_name='username',
        ),
    ]
