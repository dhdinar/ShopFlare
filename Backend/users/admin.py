from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Brand, Product, ProductImage, Wishlist, CartItem, Review, Message, Address


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    # CustomUser fields: id, username, email, first_name, last_name, phone_number, bio, is_email_verified + AbstractUser fields
    list_display = ['id', 'username', 'email', 'first_name', 'last_name', 'phone_number', 'bio', 'is_email_verified', 'is_active', 'is_staff', 'date_joined']
    list_filter = ['is_email_verified', 'is_active', 'is_staff', 'date_joined']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'phone_number']
    ordering = ['-date_joined']
    
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('phone_number', 'bio', 'is_email_verified')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Custom Fields', {'fields': ('email', 'phone_number', 'bio', 'is_email_verified')}),
    )


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    # Brand fields: id, username, email, password, phone_number, brand_description, brand_logo, brand_website, brand_address, is_brand_verified, is_active, created_at, updated_at
    list_display = ['id', 'username', 'email', 'phone_number', 'brand_description', 'brand_logo', 'brand_website', 'brand_address', 'is_brand_verified', 'is_active', 'created_at', 'updated_at']
    list_filter = ['is_brand_verified', 'is_active', 'created_at']
    search_fields = ['username', 'email', 'phone_number', 'brand_description', 'brand_address']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Account Info', {'fields': ('username', 'email', 'password', 'phone_number')}),
        ('Brand Details', {'fields': ('brand_description', 'brand_logo', 'brand_website', 'brand_address')}),
        ('Status', {'fields': ('is_brand_verified', 'is_active')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    # Product fields: id, brand, name, description, price, sale_price, category, image, stock, is_active, created_at, updated_at
    list_display = ['id', 'name', 'brand', 'short_description', 'price', 'sale_price', 'category', 'image', 'stock', 'is_active', 'created_at', 'updated_at']
    list_filter = ['is_active', 'category', 'brand', 'created_at']
    search_fields = ['name', 'description', 'brand__username', 'category']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Product Info', {'fields': ('brand', 'name', 'description', 'category', 'image')}),
        ('Pricing', {'fields': ('price', 'sale_price')}),
        ('Inventory', {'fields': ('stock', 'is_active')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
    
    def short_description(self, obj):
        if obj.description:
            return obj.description[:50] + '...' if len(obj.description) > 50 else obj.description
        return '-'
    short_description.short_description = 'Description'


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    # ProductImage fields: id, product, image_data, image_type, order, created_at
    list_display = ['id', 'product', 'image_type', 'order', 'created_at']
    list_filter = ['image_type', 'created_at']
    search_fields = ['product__name']
    readonly_fields = ['created_at']
    ordering = ['product', 'order']


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    # Wishlist fields: id, user, product, created_at
    list_display = ['id', 'user', 'product', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'product__name']
    readonly_fields = ['created_at']
    ordering = ['-created_at']


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    # CartItem fields: id, user, product, quantity, selected_size, selected_color, created_at, updated_at
    list_display = ['id', 'user', 'product', 'quantity', 'selected_size', 'selected_color', 'created_at', 'updated_at']
    list_filter = ['created_at', 'selected_size', 'selected_color']
    search_fields = ['user__username', 'product__name']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    # Review fields: id, user, product, rating, title, comment, created_at, updated_at
    list_display = ['id', 'user', 'product', 'rating', 'title', 'comment', 'created_at', 'updated_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['user__username', 'product__name', 'title', 'comment']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    # Message fields: id, sender_user, sender_brand, receiver_user, receiver_brand, product, message, timestamp, is_from_brand
    list_display = ['id', 'sender_user', 'sender_brand', 'receiver_user', 'receiver_brand', 'product', 'short_message', 'is_from_brand', 'timestamp']
    list_filter = ['is_from_brand', 'timestamp']
    search_fields = ['sender_user__username', 'sender_brand__username', 'product__name', 'message']
    readonly_fields = ['timestamp']
    ordering = ['-timestamp']
    
    def short_message(self, obj):
        return obj.message[:50] + '...' if len(obj.message) > 50 else obj.message
    short_message.short_description = 'Message'


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'label', 'full_name', 'city', 'country', 'is_default', 'created_at']
    list_filter = ['label', 'is_default', 'country', 'created_at']
    search_fields = ['user__username', 'full_name', 'address_line1', 'city', 'country']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['user', '-is_default', '-created_at']
