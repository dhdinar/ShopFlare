from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0012_address'),
    ]

    operations = [
        migrations.CreateModel(
            name='Order',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(
                    choices=[
                        ('pending', 'Pending'),
                        ('confirmed', 'Confirmed'),
                        ('processing', 'Processing'),
                        ('shipped', 'Shipped'),
                        ('delivered', 'Delivered'),
                        ('cancelled', 'Cancelled'),
                        ('refunded', 'Refunded'),
                    ],
                    default='pending',
                    max_length=20,
                )),
                ('payment_method', models.CharField(
                    choices=[
                        ('cod', 'Cash on Delivery'),
                        ('card', 'Credit/Debit Card'),
                        ('wallet', 'Wallet'),
                    ],
                    default='cod',
                    max_length=20,
                )),
                ('payment_status', models.CharField(default='pending', max_length=20)),
                ('shipping_full_name', models.CharField(max_length=100)),
                ('shipping_phone', models.CharField(blank=True, max_length=20, null=True)),
                ('shipping_address_line1', models.CharField(max_length=255)),
                ('shipping_address_line2', models.CharField(blank=True, max_length=255, null=True)),
                ('shipping_city', models.CharField(max_length=100)),
                ('shipping_state', models.CharField(blank=True, max_length=100, null=True)),
                ('shipping_postal_code', models.CharField(blank=True, max_length=20, null=True)),
                ('shipping_country', models.CharField(default='', max_length=100)),
                ('subtotal', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('shipping_cost', models.DecimalField(decimal_places=2, default=0, max_digits=8)),
                ('total_amount', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('notes', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='orders',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'verbose_name': 'Order',
                'verbose_name_plural': 'Orders',
                'db_table': 'orders',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='OrderItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('product_name', models.CharField(max_length=200)),
                ('product_price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('quantity', models.PositiveIntegerField(default=1)),
                ('selected_size', models.CharField(blank=True, max_length=20, null=True)),
                ('selected_color', models.CharField(blank=True, max_length=50, null=True)),
                ('line_total', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('order', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='items',
                    to='users.order',
                )),
                ('product', models.ForeignKey(
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='order_items',
                    to='users.product',
                )),
                ('brand', models.ForeignKey(
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='order_items',
                    to='users.brand',
                )),
            ],
            options={
                'verbose_name': 'Order Item',
                'verbose_name_plural': 'Order Items',
                'db_table': 'order_items',
            },
        ),
    ]
