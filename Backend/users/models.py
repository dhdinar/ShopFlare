
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.hashers import make_password, check_password as django_check_password

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
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    category = models.CharField(max_length=100, blank=True, null=True)
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
    address_line2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100, blank=True, null=True)
    postal_code = models.CharField(max_length=20, blank=True, null=True)
    country = models.CharField(max_length=100, default='')
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


class Review(models.Model):
    """Review model for users to rate and review products"""
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='reviews')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveSmallIntegerField(default=5)  # 1-5 stars
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
