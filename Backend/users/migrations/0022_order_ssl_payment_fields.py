from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0021_remove_address_country'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='gateway_raw_response',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='order',
            name='gateway_val_id',
            field=models.CharField(blank=True, max_length=128, null=True),
        ),
        migrations.AddField(
            model_name='order',
            name='paid_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='order',
            name='payment_gateway',
            field=models.CharField(blank=True, max_length=32, null=True),
        ),
        migrations.AddField(
            model_name='order',
            name='transaction_id',
            field=models.CharField(blank=True, max_length=64, null=True, unique=True),
        ),
    ]
