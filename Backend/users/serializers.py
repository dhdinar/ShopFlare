from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
import re
from .models import Brand, Product, ProductImage, Wishlist, CartItem, Review, Message, Address, Order, OrderItem, Notification, SSLPayment

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user details"""
    user_type = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'phone_number', 'bio', 'is_email_verified', 'user_type']
        read_only_fields = ['id', 'is_email_verified', 'email']
    
    def get_user_type(self, obj):
        return 'user'


class BrandSerializer(serializers.ModelSerializer):
    """Serializer for brand details"""
    user_type = serializers.SerializerMethodField()
    
    class Meta:
        model = Brand
        fields = ['id', 'username', 'email', 'phone_number', 
                  'brand_description', 'brand_logo', 'brand_website', 
                  'brand_address', 'is_brand_verified', 'user_type']
        read_only_fields = ['id', 'is_brand_verified', 'email']
    
    def get_user_type(self, obj):
        return 'brand'


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name']
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
        }
    
    def validate_username(self, value):
        # Check if username exists in User model (case-insensitive)
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        # Check if username exists in Brand model
        if Brand.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value
    
    def validate_email(self, value):
        # Check if email exists in User model (case-insensitive)
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        # Check if email exists in Brand model
        if Brand.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class BrandRegisterSerializer(serializers.ModelSerializer):
    """Serializer for brand registration"""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = Brand
        fields = ['username', 'email', 'password', 'password2', 'phone_number',
                  'brand_description', 'brand_website', 'brand_address']
        extra_kwargs = {
            'phone_number': {'required': False},
            'brand_description': {'required': False},
            'brand_website': {'required': False},
            'brand_address': {'required': False},
        }
    
    def validate_username(self, value):
        # Check if username exists in Brand model (case-insensitive)
        if Brand.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        # Check if username exists in User model
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value
    
    def validate_email(self, value):
        # Check if email exists in Brand model (case-insensitive)
        if Brand.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        # Check if email exists in User model
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        brand = Brand(**validated_data)
        brand.set_password(password)
        brand.save()
        return brand


class LoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class VerificationSendSerializer(serializers.Serializer):
    """Serializer for sending or resending verification codes"""
    email = serializers.EmailField(required=True)
    user_type = serializers.ChoiceField(choices=['user', 'brand'], required=True)


class VerificationConfirmSerializer(serializers.Serializer):
    """Serializer for confirming email verification code"""
    email = serializers.EmailField(required=True)
    user_type = serializers.ChoiceField(choices=['user', 'brand'], required=True)
    code = serializers.CharField(required=True, max_length=6, min_length=6)


class ForgotPasswordRequestSerializer(serializers.Serializer):
    """Serializer for requesting a forgot-password code"""
    email = serializers.EmailField(required=True)


class ForgotPasswordConfirmSerializer(serializers.Serializer):
    """Serializer for confirming reset code and setting new password"""
    email = serializers.EmailField(required=True)
    code = serializers.CharField(required=True, max_length=6, min_length=6)
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])
    new_password2 = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({'new_password': "Password fields didn't match."})
        return attrs


class ProductImageSerializer(serializers.ModelSerializer):
    """Serializer for product images (base64 stored in database)"""
    image_base64 = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductImage
        fields = ['id', 'image_base64', 'image_type', 'order', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_image_base64(self, obj):
        """Return raw base64 data (without data URI prefix)"""
        if obj.image_data:
            return obj.image_data
        return None


class ProductSerializer(serializers.ModelSerializer):
    """Serializer for products"""
    brand_name = serializers.CharField(source='brand.username', read_only=True)
    is_on_sale = serializers.BooleanField(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    total_ratings = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'sale_price', 'category', 'subcategory',
                  'image', 'stock', 'is_active', 'is_on_sale', 'brand_name', 
                  'created_at', 'updated_at', 'images', 'average_rating', 'total_ratings']
        read_only_fields = ['id', 'created_at', 'updated_at', 'brand_name', 'is_on_sale']
    
    def get_average_rating(self, obj):
        from django.db.models import Avg
        from .models import Review
        avg = Review.objects.filter(product=obj).aggregate(Avg('rating'))['rating__avg']
        return round(avg, 1) if avg else 0
    
    def get_total_ratings(self, obj):
        from .models import Review
        return Review.objects.filter(product=obj).count()


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating products"""
    
    class Meta:
        model = Product
        fields = ['name', 'description', 'price', 'sale_price', 'category', 'subcategory',
                  'image', 'stock', 'is_active']
    
    def create(self, validated_data):
        # Brand is set from the view
        return Product.objects.create(**validated_data)


class WishlistSerializer(serializers.ModelSerializer):
    """Serializer for wishlist items"""
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Wishlist
        fields = ['id', 'product', 'product_id', 'created_at']
        read_only_fields = ['id', 'created_at']


class CartItemSerializer(serializers.ModelSerializer):
    """Serializer for cart items"""
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'selected_size', 'selected_color', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for product reviews"""
    username = serializers.CharField(source='user.username', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'user_id', 'username', 'product', 'rating', 'title', 'comment', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user_id', 'username', 'created_at', 'updated_at']


class ReviewCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating reviews"""
    product_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Review
        fields = ['product_id', 'rating', 'title', 'comment']
    
    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value


class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.SerializerMethodField()
    receiver_username = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = [
            'id', 'sender_user', 'sender_brand', 'receiver_user', 'receiver_brand',
            'product', 'message', 'timestamp', 'is_from_brand', 'is_read',
            'sender_username', 'receiver_username',
        ]
        read_only_fields = ['id', 'timestamp', 'sender_username', 'receiver_username']

    def get_sender_username(self, obj):
        if obj.is_from_brand and obj.sender_brand:
            return obj.sender_brand.username
        elif obj.sender_user:
            return obj.sender_user.username
        return None

    def get_receiver_username(self, obj):
        if obj.receiver_brand:
            return obj.receiver_brand.username
        elif obj.receiver_user:
            return obj.receiver_user.username
        return None


class AddressSerializer(serializers.ModelSerializer):
    """Serializer for user shipping addresses"""

    phone = serializers.CharField(required=True, allow_blank=False)

    def validate_phone(self, value):
        if not re.fullmatch(r'\d{11}', value or ''):
            raise serializers.ValidationError('Phone number must be exactly 11 digits.')
        return value

    class Meta:
        model = Address
        fields = [
            'id', 'label', 'full_name', 'phone',
            'address_line1',
            'city', 'postal_code',
            'is_default', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password"""
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])
    new_password2 = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        return attrs


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for individual order line items"""

    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name', 'product_price',
            'quantity', 'selected_size', 'selected_color', 'line_total',
        ]
        read_only_fields = ['id', 'line_total']


class OrderSerializer(serializers.ModelSerializer):
    """Serializer for orders (read)"""
    items = OrderItemSerializer(many=True, read_only=True)
    username = serializers.SerializerMethodField()
    transaction_id = serializers.SerializerMethodField()
    payment_gateway = serializers.SerializerMethodField()
    gateway_val_id = serializers.SerializerMethodField()
    paid_at = serializers.SerializerMethodField()

    def get_username(self, obj):
        if obj.user:
            return obj.user.username
        return obj.guest_email or 'Guest'

    def get_transaction_id(self, obj):
        payment = getattr(obj, 'ssl_payment', None)
        return payment.transaction_id if payment else None

    def get_payment_gateway(self, obj):
        payment = getattr(obj, 'ssl_payment', None)
        return payment.payment_gateway if payment else None

    def get_gateway_val_id(self, obj):
        payment = getattr(obj, 'ssl_payment', None)
        return payment.gateway_val_id if payment else None

    def get_paid_at(self, obj):
        payment = getattr(obj, 'ssl_payment', None)
        return payment.paid_at if payment else None

    class Meta:
        model = Order
        fields = [
            'id', 'username', 'guest_checkout', 'guest_email', 'guest_access_token',
            'transaction_id', 'payment_gateway', 'gateway_val_id', 'paid_at',
            'status', 'payment_method', 'payment_status',
            'shipping_full_name', 'shipping_phone',
            'shipping_address_line1', 'shipping_address_line2',
            'shipping_city', 'shipping_state', 'shipping_postal_code', 'shipping_country',
            'subtotal', 'shipping_cost', 'total_amount',
            'notes', 'items', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'username', 'guest_checkout', 'guest_email', 'guest_access_token',
            'transaction_id', 'payment_gateway', 'gateway_val_id', 'paid_at',
            'subtotal', 'total_amount', 'created_at', 'updated_at'
        ]


class CheckoutSerializer(serializers.Serializer):
    """Serializer for placing an order (checkout)"""
    address_id = serializers.IntegerField(required=False, help_text='ID of an existing saved address')
    # Or inline address fields
    shipping_full_name = serializers.CharField(max_length=100, required=False)
    shipping_phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    shipping_address_line1 = serializers.CharField(max_length=255, required=False)
    shipping_address_line2 = serializers.CharField(max_length=255, required=False, allow_blank=True)
    shipping_city = serializers.CharField(max_length=100, required=False)
    shipping_state = serializers.CharField(max_length=100, required=False, allow_blank=True)
    shipping_postal_code = serializers.CharField(max_length=20, required=False, allow_blank=True)
    shipping_country = serializers.CharField(max_length=100, required=False)
    shipping_cost = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, min_value=0)

    payment_method = serializers.ChoiceField(choices=['cod', 'card', 'wallet'], default='cod')
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        # Must supply either address_id or full address fields
        if not attrs.get('address_id'):
            required = ['shipping_full_name', 'shipping_address_line1', 'shipping_city', 'shipping_country']
            missing = [f for f in required if not attrs.get(f)]
            if missing:
                raise serializers.ValidationError(
                    f"Provide address_id or fill: {', '.join(missing)}"
                )
        return attrs


class GuestCheckoutItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)
    selected_size = serializers.CharField(max_length=20, required=False, allow_blank=True)
    selected_color = serializers.CharField(max_length=50, required=False, allow_blank=True)


class GuestCheckoutSerializer(serializers.Serializer):
    guest_email = serializers.EmailField(required=True)
    shipping_full_name = serializers.CharField(max_length=100, required=True)
    shipping_phone = serializers.CharField(max_length=20, required=True, allow_blank=False)
    shipping_address_line1 = serializers.CharField(max_length=255, required=True)
    shipping_address_line2 = serializers.CharField(max_length=255, required=False, allow_blank=True)
    shipping_city = serializers.CharField(max_length=100, required=True)
    shipping_state = serializers.CharField(max_length=100, required=False, allow_blank=True)
    shipping_postal_code = serializers.CharField(max_length=20, required=False, allow_blank=True)
    shipping_country = serializers.CharField(max_length=100, required=True)
    shipping_cost = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, min_value=0)
    payment_method = serializers.ChoiceField(choices=['cod', 'card', 'wallet'], default='cod')
    notes = serializers.CharField(required=False, allow_blank=True)
    items = GuestCheckoutItemSerializer(many=True, required=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError('At least one item is required.')
        return value

    def validate_shipping_phone(self, value):
        if not re.fullmatch(r'\d{11}', value or ''):
            raise serializers.ValidationError('Phone number must be exactly 11 digits.')
        return value


class OrderStatusUpdateSerializer(serializers.Serializer):
    """Serializer for brand to update order status"""
    status = serializers.ChoiceField(
        choices=['confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']
    )


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for in-app notifications"""

    class Meta:
        model = Notification
        fields = [
            'id',
            'notification_type',
            'title',
            'body',
            'is_read',
            'related_order',
            'related_product',
            'created_at',
        ]
        read_only_fields = fields
