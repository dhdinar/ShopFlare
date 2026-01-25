from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Brand, Product


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'is_email_verified', 'is_active']
    list_filter = ['is_email_verified', 'is_active', 'is_staff']
    search_fields = ['username', 'email', 'first_name', 'last_name']


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'is_brand_verified', 'is_active', 'created_at']
    list_filter = ['is_brand_verified', 'is_active']
    search_fields = ['username', 'email']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'brand', 'price', 'sale_price', 'category', 'stock', 'is_active', 'created_at']
    list_filter = ['is_active', 'category', 'brand']
    search_fields = ['name', 'description', 'brand__username']
    readonly_fields = ['created_at', 'updated_at']
