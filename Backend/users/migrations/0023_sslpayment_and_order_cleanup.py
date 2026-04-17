from django.db import migrations, models


def copy_order_payment_data_to_sslpayment(apps, schema_editor):
    Order = apps.get_model('users', 'Order')
    SSLPayment = apps.get_model('users', 'SSLPayment')

    orders = Order.objects.exclude(transaction_id__isnull=True).exclude(transaction_id='')
    for order in orders.iterator():
        status = 'pending'
        if order.payment_status == 'paid':
            status = 'paid'
        elif order.status == 'cancelled':
            status = 'cancelled'
        elif order.payment_status == 'failed':
            status = 'failed'

        SSLPayment.objects.update_or_create(
            order=order,
            defaults={
                'transaction_id': order.transaction_id,
                'payment_gateway': order.payment_gateway or 'sslcommerz',
                'status': status,
                'amount': order.total_amount,
                'gateway_val_id': order.gateway_val_id,
                'gateway_raw_response': order.gateway_raw_response,
                'paid_at': order.paid_at,
            },
        )


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0022_order_ssl_payment_fields'),
    ]

    operations = [
        migrations.CreateModel(
            name='SSLPayment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('transaction_id', models.CharField(db_index=True, max_length=64, unique=True)),
                ('payment_gateway', models.CharField(default='sslcommerz', max_length=32)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('paid', 'Paid'), ('failed', 'Failed'), ('cancelled', 'Cancelled')], default='pending', max_length=20)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=12)),
                ('gateway_val_id', models.CharField(blank=True, max_length=128, null=True)),
                ('payment_url', models.URLField(blank=True, max_length=500, null=True)),
                ('gateway_raw_response', models.TextField(blank=True, null=True)),
                ('paid_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('order', models.OneToOneField(on_delete=models.deletion.CASCADE, related_name='ssl_payment', to='users.order')),
            ],
            options={
                'verbose_name': 'SSL Payment',
                'verbose_name_plural': 'SSL Payments',
                'db_table': 'ssl_payments',
                'ordering': ['-created_at'],
            },
        ),
        migrations.RunPython(copy_order_payment_data_to_sslpayment, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name='order',
            name='gateway_raw_response',
        ),
        migrations.RemoveField(
            model_name='order',
            name='gateway_val_id',
        ),
        migrations.RemoveField(
            model_name='order',
            name='paid_at',
        ),
        migrations.RemoveField(
            model_name='order',
            name='payment_gateway',
        ),
        migrations.RemoveField(
            model_name='order',
            name='transaction_id',
        ),
    ]
