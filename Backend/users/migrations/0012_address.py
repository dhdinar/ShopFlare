from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0011_alter_message_id'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Address',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('label', models.CharField(
                    choices=[('home', 'Home'), ('work', 'Work'), ('other', 'Other')],
                    default='home',
                    max_length=20,
                )),
                ('full_name', models.CharField(max_length=100)),
                ('phone', models.CharField(blank=True, max_length=20, null=True)),
                ('address_line1', models.CharField(max_length=255)),
                ('address_line2', models.CharField(blank=True, max_length=255, null=True)),
                ('city', models.CharField(max_length=100)),
                ('state', models.CharField(blank=True, max_length=100, null=True)),
                ('postal_code', models.CharField(blank=True, max_length=20, null=True)),
                ('country', models.CharField(default='', max_length=100)),
                ('is_default', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='addresses',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'verbose_name': 'Address',
                'verbose_name_plural': 'Addresses',
                'db_table': 'addresses',
                'ordering': ['-is_default', '-created_at'],
            },
        ),
    ]
