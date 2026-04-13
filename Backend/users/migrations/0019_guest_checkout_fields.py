from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0018_passwordresetcode'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='guest_access_token',
            field=models.CharField(blank=True, db_index=True, max_length=64, null=True),
        ),
        migrations.AddField(
            model_name='order',
            name='guest_checkout',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='order',
            name='guest_email',
            field=models.EmailField(blank=True, max_length=254, null=True),
        ),
        migrations.AlterField(
            model_name='order',
            name='user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='orders', to='users.customuser'),
        ),
    ]
