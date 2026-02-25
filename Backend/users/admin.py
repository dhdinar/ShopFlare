from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Brand, Product, ProductImage, Wishlist, CartItem, Review, Message


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ['id', 'username', 'email', 'first_name', 'last_name', 'phone_number', 'is_email_verified', 'is_active', 'is_staff', 'date_joined']
    list_filter = ['is_email_verified', 'is_active', 'is_staff', 'date_joined']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'phone_number']
    ordering = ['-date_joined']


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ['id', 'username', 'email', 'phone_number', 'brand_website', 'is_brand_verified', 'is_active', 'created_at', 'updated_at']
    list_filter = ['is_brand_verified', 'is_active', 'created_at']
    search_fields = ['username', 'email', 'phone_number', 'brand_description']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'brand', 'price', 'sale_price', 'category', 'stock', 'is_active', 'created_at', 'updated_at']
    list_filter = ['is_active', 'category', 'brand', 'created_at']
    search_fields = ['name', 'description', 'brand__username', 'category']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ['id', 'product', 'image_type', 'order', 'created_at']
    list_filter = ['image_type', 'created_at']
    search_fields = ['product__name']
    readonly_fields = ['created_at']
    ordering = ['product', 'order']


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'product', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'product__name']
    readonly_fields = ['created_at']
    ordering = ['-created_at']


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'product', 'quantity', 'selected_size', 'selected_color', 'created_at', 'updated_at']
    list_filter = ['created_at', 'selected_size', 'selected_color']
    search_fields = ['user__username', 'product__name']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'product', 'rating', 'title', 'created_at', 'updated_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['user__username', 'product__name', 'title', 'comment']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'sender_user', 'sender_brand', 'receiver_user', 'receiver_brand', 'product', 'is_from_brand', 'timestamp']
    list_filter = ['is_from_brand', 'timestamp']
    search_fields = ['sender_user__username', 'sender_brand__username', 'product__name', 'message']
    readonly_fields = ['timestamp']
    ordering = ['-timestamp']
