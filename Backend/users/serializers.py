from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import Brand, Product, ProductImage, Wishlist, CartItem, Review, Message, Address

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user details"""
    user_type = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'phone_number', 'bio', 'is_email_verified', 'user_type']
        read_only_fields = ['id', 'is_email_verified']
    
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
        read_only_fields = ['id', 'is_brand_verified']
    
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
        fields = ['id', 'name', 'description', 'price', 'sale_price', 'category', 
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
        fields = ['name', 'description', 'price', 'sale_price', 'category', 
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
            'product', 'message', 'timestamp', 'is_from_brand',
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

    class Meta:
        model = Address
        fields = [
            'id', 'label', 'full_name', 'phone',
            'address_line1', 'address_line2',
            'city', 'state', 'postal_code', 'country',
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
