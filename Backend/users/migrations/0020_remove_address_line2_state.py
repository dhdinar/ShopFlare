from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0019_guest_checkout_fields'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='address',
            name='address_line2',
        ),
        migrations.RemoveField(
            model_name='address',
            name='state',
        ),
    ]
