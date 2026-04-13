from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0020_remove_address_line2_state'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='address',
            name='country',
        ),
    ]
