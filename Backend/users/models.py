
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.hashers import make_password, check_password as django_check_password
from django.core.validators import MinValueValidator, MaxValueValidator

class Message(models.Model):
    """Chat message between customer and brand, per product"""
    sender_user = models.ForeignKey('CustomUser', on_delete=models.CASCADE, null=True, blank=True, related_name='sent_messages')
    sender_brand = models.ForeignKey('Brand', on_delete=models.CASCADE, null=True, blank=True, related_name='brand_sent_messages')
    receiver_user = models.ForeignKey('CustomUser', on_delete=models.CASCADE, null=True, blank=True, related_name='received_messages')
    receiver_brand = models.ForeignKey('Brand', on_delete=models.CASCADE, null=True, blank=True, related_name='brand_received_messages')
    product = models.ForeignKey('Product', on_delete=models.CASCADE, related_name='messages')
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_from_brand = models.BooleanField(default=False)
    is_read = models.BooleanField(default=False)

    class Meta:
        db_table = 'messages'
        verbose_name = 'Message'
        verbose_name_plural = 'Messages'
        ordering = ['timestamp']

    def __str__(self):
        if self.is_from_brand and self.sender_brand:
            sender = self.sender_brand.username
        elif self.sender_user:
            sender = self.sender_user.username
        else:
            sender = 'Unknown'
        return f"{sender} -> {self.product.name}: {self.message[:30]}"


class CustomUser(AbstractUser):
    """Extended user model for regular customers"""
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    is_email_verified = models.BooleanField(default=False)
    
    # Make email required
    REQUIRED_FIELDS = ['email']
    
    def __str__(self):
        return self.username


class Brand(models.Model):
    """Separate model for Brand/Shop accounts - username is the brand name"""
    username = models.CharField(max_length=100, unique=True)  # This is the brand name
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    brand_description = models.TextField(blank=True, null=True)
    brand_logo = models.URLField(blank=True, null=True)
    brand_website = models.URLField(blank=True, null=True)
    brand_address = models.TextField(blank=True, null=True)
    is_brand_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'brands'
        verbose_name = 'Brand'
        verbose_name_plural = 'Brands'
    
    def set_password(self, raw_password):
        self.password = make_password(raw_password)
    
    def check_password(self, raw_password):
        return django_check_password(raw_password, self.password)
    
    def __str__(self):
        return f"{self.username} (Brand)"
    
    @property
    def brand_name(self):
        """Alias for username - the brand name"""
        return self.username
    
    @property
    def is_brand(self):
        return True


class Product(models.Model):
    """Product model for brands to sell"""
    CATEGORY_CHOICES = [
        ('Men', 'Men'),
        ('Women', 'Women'),
        ('Children', 'Children'),
    ]

    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES, blank=True, null=True)
    subcategory = models.CharField(max_length=100, blank=True, null=True)
    image = models.URLField(blank=True, null=True)
    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'products'
        verbose_name = 'Product'
        verbose_name_plural = 'Products'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.brand.username}"
    
    @property
    def is_on_sale(self):
        return self.sale_price is not None and self.sale_price < self.price


class ProductImage(models.Model):
    """Multiple images for a product (max 4) - stored as base64 in database"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image_data = models.TextField(default='')  # Base64 encoded image data
    image_type = models.CharField(max_length=50, default='image/jpeg')  # MIME type
    order = models.PositiveSmallIntegerField(default=0)  # For ordering images
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'product_images'
        verbose_name = 'Product Image'
        verbose_name_plural = 'Product Images'
        ordering = ['order', 'created_at']
    
    def __str__(self):
        return f"Image for {self.product.name} - {self.order}"


class Wishlist(models.Model):
    """Wishlist model for users to save products"""
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='wishlist_items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='wishlisted_by')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'wishlists'
        verbose_name = 'Wishlist Item'
        verbose_name_plural = 'Wishlist Items'
        unique_together = ['user', 'product']  # Prevent duplicate entries
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.product.name}"


class CartItem(models.Model):
    """Cart model for users to add products before checkout"""
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='cart_items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='in_carts')
    quantity = models.PositiveIntegerField(default=1)
    selected_size = models.CharField(max_length=20, blank=True, null=True)
    selected_color = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'cart_items'
        verbose_name = 'Cart Item'
        verbose_name_plural = 'Cart Items'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.product.name} x{self.quantity}"


class Address(models.Model):
    """Shipping address model for users"""
    LABEL_CHOICES = [
        ('home', 'Home'),
        ('work', 'Work'),
        ('other', 'Other'),
    ]
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='addresses')
    label = models.CharField(max_length=20, choices=LABEL_CHOICES, default='home')
    full_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address_line1 = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20, blank=True, null=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'addresses'
        verbose_name = 'Address'
        verbose_name_plural = 'Addresses'
        ordering = ['-is_default', '-created_at']

    def save(self, *args, **kwargs):
        # If this address is set as default, unset all others for this user
        if self.is_default:
            Address.objects.filter(user=self.user, is_default=True).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} - {self.label}: {self.address_line1}, {self.city}"


class Order(models.Model):
    """Order model representing a completed checkout"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('cod', 'Cash on Delivery'),
        ('card', 'Credit/Debit Card'),
        ('wallet', 'Wallet'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, related_name='orders', null=True, blank=True)
    guest_checkout = models.BooleanField(default=False)
    guest_email = models.EmailField(blank=True, null=True)
    guest_access_token = models.CharField(max_length=64, blank=True, null=True, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='cod')
    payment_status = models.CharField(max_length=20, default='pending')  # pending / paid / failed

    # Snapshot of shipping address at order time
    shipping_full_name = models.CharField(max_length=100)
    shipping_phone = models.CharField(max_length=20, blank=True, null=True)
    shipping_address_line1 = models.CharField(max_length=255)
    shipping_address_line2 = models.CharField(max_length=255, blank=True, null=True)
    shipping_city = models.CharField(max_length=100)
    shipping_state = models.CharField(max_length=100, blank=True, null=True)
    shipping_postal_code = models.CharField(max_length=20, blank=True, null=True)
    shipping_country = models.CharField(max_length=100, default='')

    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    shipping_cost = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'orders'
        verbose_name = 'Order'
        verbose_name_plural = 'Orders'
        ordering = ['-created_at']

    def __str__(self):
        if self.user:
            owner = self.user.username
        else:
            owner = self.guest_email or 'Guest'
        return f"Order #{self.id} by {owner} - {self.status}"


class OrderItem(models.Model):
    """Individual line items in an order"""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, related_name='order_items')
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, related_name='order_items')

    # Snapshot of product info at order time
    product_name = models.CharField(max_length=200)
    product_price = models.DecimalField(max_digits=10, decimal_places=2)  # unit price paid
    quantity = models.PositiveIntegerField(default=1)
    selected_size = models.CharField(max_length=20, blank=True, null=True)
    selected_color = models.CharField(max_length=50, blank=True, null=True)
    line_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    class Meta:
        db_table = 'order_items'
        verbose_name = 'Order Item'
        verbose_name_plural = 'Order Items'

    def __str__(self):
        return f"Order #{self.order.id} - {self.product_name} x{self.quantity}"

    def save(self, *args, **kwargs):
        self.line_total = self.product_price * self.quantity
        super().save(*args, **kwargs)


class Review(models.Model):
    """Review model for users to rate and review products"""
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='reviews')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveSmallIntegerField(
        default=5,
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )  # 1-5 stars
    title = models.CharField(max_length=200, blank=True, null=True)
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'reviews'
        verbose_name = 'Review'
        verbose_name_plural = 'Reviews'
        unique_together = ['user', 'product']  # One review per user per product
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.product.name} ({self.rating} stars)"


class Notification(models.Model):
    """In-app notifications for customer and brand accounts"""
    TYPE_CHOICES = [
        ('order', 'Order'),
        ('message', 'Message'),
        ('system', 'System'),
    ]

    recipient_user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications',
    )
    recipient_brand = models.ForeignKey(
        Brand,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications',
    )
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='system')
    title = models.CharField(max_length=160)
    body = models.TextField(blank=True, null=True)
    is_read = models.BooleanField(default=False)

    related_order = models.ForeignKey(
        Order,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notifications',
    )
    related_product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notifications',
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-created_at']

    def __str__(self):
        recipient = self.recipient_user or self.recipient_brand
        return f"{recipient}: {self.title}"


class EmailVerificationCode(models.Model):
    """One-time email verification code for customer and brand accounts"""

    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='email_verification_codes',
    )
    brand = models.ForeignKey(
        Brand,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='email_verification_codes',
    )
    code_hash = models.CharField(max_length=128)
    expires_at = models.DateTimeField()
    attempts = models.PositiveSmallIntegerField(default=0)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'email_verification_codes'
        verbose_name = 'Email Verification Code'
        verbose_name_plural = 'Email Verification Codes'
        ordering = ['-created_at']

    def __str__(self):
        recipient = self.user or self.brand
        return f"Verification code for {recipient}"


class PasswordResetCode(models.Model):
    """One-time password reset code for customer and brand accounts"""

    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='password_reset_codes',
    )
    brand = models.ForeignKey(
        Brand,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='password_reset_codes',
    )
    code_hash = models.CharField(max_length=128)
    expires_at = models.DateTimeField()
    attempts = models.PositiveSmallIntegerField(default=0)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'password_reset_codes'
        verbose_name = 'Password Reset Code'
        verbose_name_plural = 'Password Reset Codes'
        ordering = ['-created_at']

    def __str__(self):
        recipient = self.user or self.brand
        return f"Password reset code for {recipient}"
