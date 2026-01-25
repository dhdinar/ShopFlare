from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
import base64

from .serializers import (UserSerializer, BrandSerializer, RegisterSerializer, 
                          BrandRegisterSerializer, LoginSerializer, 
                          ProductSerializer, ProductCreateUpdateSerializer,
                          ProductImageSerializer, WishlistSerializer, CartItemSerializer,
                          ReviewSerializer, ReviewCreateSerializer,
                          MessageSerializer)
from .models import Brand, Product, ProductImage, Wishlist, CartItem, Review, Message
from .authentication import BrandUser

User = get_user_model()


def get_brand_from_request(request):
    """Get brand from authenticated request (works with CustomJWTAuthentication)"""
    if hasattr(request, 'user') and request.user and request.user.is_authenticated:
        if isinstance(request.user, BrandUser):
            return request.user.brand
        if hasattr(request.user, 'user_type') and request.user.user_type == 'brand':
            return request.user.brand
    return None


def get_brand_from_token(request):
    """Extract brand from JWT token"""
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.split(' ')[1]
    try:
        from rest_framework_simplejwt.tokens import AccessToken
        decoded = AccessToken(token)
        brand_id = decoded.get('brand_id')
        if brand_id:
            return Brand.objects.get(id=brand_id)
    except Exception:
        pass
    return None


def get_tokens_for_user(user):
    """Generate JWT tokens for a user"""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


def get_tokens_for_brand(brand):
    """Generate JWT tokens for a brand (manual token generation)"""
    from rest_framework_simplejwt.tokens import AccessToken
    from datetime import timedelta
    from django.conf import settings
    import uuid
    
    # Create tokens manually for brand
    refresh = RefreshToken()
    refresh['brand_id'] = brand.id
    refresh['brand_name'] = brand.brand_name
    refresh['user_type'] = 'brand'
    refresh['token_type'] = 'refresh'
    
    access = refresh.access_token
    access['brand_id'] = brand.id
    access['brand_name'] = brand.brand_name
    access['user_type'] = 'brand'
    
    return {
        'refresh': str(refresh),
        'access': str(access),
    }


class RegisterView(generics.CreateAPIView):
    """User registration endpoint"""
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        tokens = get_tokens_for_user(user)
        user_data = UserSerializer(user).data
        
        return Response({
            'user': user_data,
            'access': tokens['access'],
            'refresh': tokens['refresh'],
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)


class BrandRegisterView(generics.CreateAPIView):
    """Brand registration endpoint"""
    queryset = Brand.objects.all()
    permission_classes = [AllowAny]
    serializer_class = BrandRegisterSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        brand = serializer.save()
        
        tokens = get_tokens_for_brand(brand)
        brand_data = BrandSerializer(brand).data
        
        return Response({
            'user': brand_data,
            'access': tokens['access'],
            'refresh': tokens['refresh'],
            'message': 'Brand registered successfully'
        }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """User/Brand login endpoint - checks both tables"""
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    username = serializer.validated_data['username']
    password = serializer.validated_data['password']
    
    # First, try to authenticate as a regular user
    user = authenticate(username=username, password=password)
    
    if user is not None:
        if not user.is_active:
            return Response(
                {'detail': 'User account is disabled'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        tokens = get_tokens_for_user(user)
        user_data = UserSerializer(user).data
        
        return Response({
            'user': user_data,
            'access': tokens['access'],
            'refresh': tokens['refresh'],
            'message': 'Login successful'
        })
    
    # If not a user, try to authenticate as a brand by username
    try:
        brand = Brand.objects.get(username=username)
        if brand.check_password(password):
            if not brand.is_active:
                return Response(
                    {'detail': 'Brand account is disabled'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            tokens = get_tokens_for_brand(brand)
            brand_data = BrandSerializer(brand).data
            
            return Response({
                'user': brand_data,
                'access': tokens['access'],
                'refresh': tokens['refresh'],
                'message': 'Login successful'
            })
    except Brand.DoesNotExist:
        pass
    
    # Also try brand login by email
    try:
        brand = Brand.objects.get(email=username)
        if brand.check_password(password):
            if not brand.is_active:
                return Response(
                    {'detail': 'Brand account is disabled'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            tokens = get_tokens_for_brand(brand)
            brand_data = BrandSerializer(brand).data
            
            return Response({
                'user': brand_data,
                'access': tokens['access'],
                'refresh': tokens['refresh'],
                'message': 'Login successful'
            })
    except Brand.DoesNotExist:
        pass
    
    # Neither user nor brand found
    return Response(
        {'detail': 'Invalid credentials'},
        status=status.HTTP_401_UNAUTHORIZED
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """User logout endpoint - blacklist the refresh token"""
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """Get current user profile"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile_view(request):
    """Update current user profile"""
    serializer = UserSerializer(request.user, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


# ==================== Brand Profile Views ====================

@api_view(['GET'])
@permission_classes([AllowAny])
def brand_profile_view(request):
    """Get brand profile from token"""
    brand = get_brand_from_token(request)
    if not brand:
        return Response({'detail': 'Brand authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    serializer = BrandSerializer(brand)
    return Response(serializer.data)


@api_view(['PUT', 'PATCH'])
@permission_classes([AllowAny])
def update_brand_profile_view(request):
    """Update brand profile"""
    brand = get_brand_from_token(request)
    if not brand:
        return Response({'detail': 'Brand authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    serializer = BrandSerializer(brand, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


# ==================== Product CRUD Views ====================

@api_view(['GET'])
@permission_classes([AllowAny])
def product_list_view(request):
    """List all products (public) or brand's products"""
    # Try to get brand from request (CustomJWTAuthentication handles both user and brand tokens)
    brand = get_brand_from_request(request)
    
    if not brand:
        # Also try the manual token extraction as fallback
        brand = get_brand_from_token(request)
    
    if brand:
        # Return only this brand's products
        products = Product.objects.filter(brand=brand)
    else:
        # Return all active products for unauthenticated or regular users
        products = Product.objects.filter(is_active=True)
    
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
@parser_classes([JSONParser, MultiPartParser, FormParser])
def product_create_view(request):
    """Create a new product with images (brand only)"""
    brand = get_brand_from_request(request)
    if not brand:
        brand = get_brand_from_token(request)
    
    if not brand:
        return Response({'detail': 'Brand authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    serializer = ProductCreateUpdateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    product = serializer.save(brand=brand)
    
    # Handle base64 images (max 4)
    # Expecting: images = [{"data": "base64string", "type": "image/jpeg"}, ...]
    images_data = request.data.get('images', [])
    if len(images_data) > 4:
        return Response({'detail': 'Maximum 4 images allowed'}, status=status.HTTP_400_BAD_REQUEST)
    
    for index, img in enumerate(images_data):
        if isinstance(img, dict) and 'data' in img:
            # Remove data URI prefix if present
            image_data = img['data']
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            image_type = img.get('type', 'image/jpeg')
            ProductImage.objects.create(
                product=product,
                image_data=image_data,
                image_type=image_type,
                order=index
            )
    
    return Response(ProductSerializer(product, context={'request': request}).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([AllowAny])
def product_detail_view(request, product_id):
    """Get product details"""
    try:
        product = Product.objects.get(id=product_id)
        serializer = ProductSerializer(product, context={'request': request})
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)



@api_view(['PUT', 'PATCH'])
@permission_classes([AllowAny])
@parser_classes([JSONParser, MultiPartParser, FormParser])
def product_update_view(request, product_id):
    """Update a product with images (brand owner only)"""
    brand = get_brand_from_request(request)
    if not brand:
        brand = get_brand_from_token(request)
    
    if not brand:
        return Response({'detail': 'Brand authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        product = Product.objects.get(id=product_id, brand=brand)
    except Product.DoesNotExist:
        return Response({'detail': 'Product not found or not owned by you'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = ProductCreateUpdateSerializer(product, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    
    # Handle base64 images if provided (max 4)
    images_data = request.data.get('images', [])
    if images_data:
        # Check total count (existing + new)
        existing_count = product.images.count()
        if existing_count + len(images_data) > 4:
            return Response({'detail': f'Maximum 4 images allowed. You have {existing_count} images.'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        for index, img in enumerate(images_data):
            if isinstance(img, dict) and 'data' in img:
                # Remove data URI prefix if present
                image_data = img['data']
                if ',' in image_data:
                    image_data = image_data.split(',')[1]
                
                image_type = img.get('type', 'image/jpeg')
                ProductImage.objects.create(
                    product=product,
                    image_data=image_data,
                    image_type=image_type,
                    order=existing_count + index
                )
    
    return Response(ProductSerializer(product, context={'request': request}).data)


@api_view(['DELETE'])
@permission_classes([AllowAny])
def product_delete_view(request, product_id):
    """Delete a product (brand owner only)"""
    brand = get_brand_from_request(request)
    if not brand:
        brand = get_brand_from_token(request)
    
    if not brand:
        return Response({'detail': 'Brand authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        product = Product.objects.get(id=product_id, brand=brand)
    except Product.DoesNotExist:
        return Response({'detail': 'Product not found or not owned by you'}, status=status.HTTP_404_NOT_FOUND)
    
    product.delete()
    return Response({'message': 'Product deleted successfully'}, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([AllowAny])
def product_image_delete_view(request, image_id):
    """Delete a product image (brand owner only)"""
    brand = get_brand_from_request(request)
    if not brand:
        brand = get_brand_from_token(request)
    
    if not brand:
        return Response({'detail': 'Brand authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        image = ProductImage.objects.get(id=image_id, product__brand=brand)
        image.delete()
        return Response({'message': 'Image deleted successfully'}, status=status.HTTP_200_OK)
    except ProductImage.DoesNotExist:
        return Response({'detail': 'Image not found or not owned by you'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([AllowAny])
def brand_products_view(request, brand_id):
    """Get all products from a specific brand (public)"""
    try:
        brand = Brand.objects.get(id=brand_id)
        products = Product.objects.filter(brand=brand, is_active=True)
        serializer = ProductSerializer(products, many=True, context={'request': request})
        return Response({
            'brand': BrandSerializer(brand).data,
            'products': serializer.data
        })
    except Brand.DoesNotExist:
        return Response({'detail': 'Brand not found'}, status=status.HTTP_404_NOT_FOUND)


# ==================== WISHLIST VIEWS ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def wishlist_list_view(request):
    """Get user's wishlist"""
    wishlist_items = Wishlist.objects.filter(user=request.user)
    serializer = WishlistSerializer(wishlist_items, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def wishlist_add_view(request):
    """Add product to wishlist"""
    product_id = request.data.get('product_id')
    if not product_id:
        return Response({'detail': 'product_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        product = Product.objects.get(id=product_id, is_active=True)
    except Product.DoesNotExist:
        return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    
    wishlist_item, created = Wishlist.objects.get_or_create(user=request.user, product=product)
    
    if created:
        serializer = WishlistSerializer(wishlist_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response({'detail': 'Product already in wishlist'}, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def wishlist_remove_view(request, product_id):
    """Remove product from wishlist"""
    try:
        wishlist_item = Wishlist.objects.get(user=request.user, product_id=product_id)
        wishlist_item.delete()
        return Response({'message': 'Removed from wishlist'}, status=status.HTTP_200_OK)
    except Wishlist.DoesNotExist:
        return Response({'detail': 'Product not in wishlist'}, status=status.HTTP_404_NOT_FOUND)


# ==================== CART VIEWS ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cart_list_view(request):
    """Get user's cart"""
    cart_items = CartItem.objects.filter(user=request.user)
    serializer = CartItemSerializer(cart_items, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cart_add_view(request):
    """Add product to cart"""
    product_id = request.data.get('product_id')
    quantity = request.data.get('quantity', 1)
    selected_size = request.data.get('selected_size', '')
    selected_color = request.data.get('selected_color', '')
    
    if not product_id:
        return Response({'detail': 'product_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        product = Product.objects.get(id=product_id, is_active=True)
    except Product.DoesNotExist:
        return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if item with same size/color already in cart
    cart_item, created = CartItem.objects.get_or_create(
        user=request.user, 
        product=product,
        selected_size=selected_size,
        selected_color=selected_color,
        defaults={'quantity': quantity}
    )
    
    if not created:
        # Update quantity if already exists
        cart_item.quantity += quantity
        cart_item.save()
    
    serializer = CartItemSerializer(cart_item)
    return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def cart_update_view(request, item_id):
    """Update cart item quantity"""
    quantity = request.data.get('quantity')
    
    if quantity is None:
        return Response({'detail': 'quantity is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        cart_item = CartItem.objects.get(id=item_id, user=request.user)
        
        if quantity <= 0:
            cart_item.delete()
            return Response({'message': 'Item removed from cart'}, status=status.HTTP_200_OK)
        
        cart_item.quantity = quantity
        cart_item.save()
        serializer = CartItemSerializer(cart_item)
        return Response(serializer.data)
    except CartItem.DoesNotExist:
        return Response({'detail': 'Cart item not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def cart_remove_view(request, item_id):
    """Remove item from cart"""
    try:
        cart_item = CartItem.objects.get(id=item_id, user=request.user)
        cart_item.delete()
        return Response({'message': 'Removed from cart'}, status=status.HTTP_200_OK)
    except CartItem.DoesNotExist:
        return Response({'detail': 'Cart item not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def cart_clear_view(request):
    """Clear entire cart"""
    CartItem.objects.filter(user=request.user).delete()
    return Response({'message': 'Cart cleared'}, status=status.HTTP_200_OK)


# ============ REVIEW ENDPOINTS ============

@api_view(['GET'])
@permission_classes([AllowAny])
def product_reviews_view(request, product_id):
    """Get all reviews for a product with average rating"""
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # All ratings (for average calculation)
    all_ratings = Review.objects.filter(product=product)
    
    # Only reviews with comments (for display)
    reviews_with_comments = Review.objects.filter(product=product).exclude(comment__isnull=True).exclude(comment='')
    serializer = ReviewSerializer(reviews_with_comments, many=True)
    
    # Calculate average rating from ALL ratings
    total_ratings = all_ratings.count()
    if total_ratings > 0:
        from django.db.models import Avg
        avg_rating = all_ratings.aggregate(Avg('rating'))['rating__avg']
    else:
        avg_rating = 0
    
    # Count only reviews with comments
    total_reviews = reviews_with_comments.count()
    
    # Get user's own rating if authenticated and user is a real customer
    user_rating = None
    from django.contrib.auth import get_user_model
    CustomUser = get_user_model()
    if request.user and request.user.is_authenticated and isinstance(request.user, CustomUser):
        user_review = Review.objects.filter(product=product, user=request.user).first()
        if user_review:
            user_rating = user_review.rating
    
    return Response({
        'reviews': serializer.data,
        'average_rating': round(avg_rating, 1) if avg_rating else 0,
        'total_reviews': total_reviews,
        'total_ratings': total_ratings,
        'user_rating': user_rating
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def review_create_view(request):
    """Create or update a review for a product"""
    product_id = request.data.get('product_id')
    
    if not product_id:
        return Response({'detail': 'product_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        product = Product.objects.get(id=product_id, is_active=True)
    except Product.DoesNotExist:
        return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if user already reviewed this product
    existing_review = Review.objects.filter(user=request.user, product=product).first()
    
    if existing_review:
        # Update existing review - preserve comment if not provided or empty
        new_rating = request.data.get('rating', existing_review.rating)
        new_comment = request.data.get('comment')
        new_title = request.data.get('title')
        
        # Only update fields that are explicitly provided with non-empty values
        existing_review.rating = new_rating
        if new_comment is not None and new_comment != '':
            existing_review.comment = new_comment
        if new_title is not None and new_title != '':
            existing_review.title = new_title
        
        existing_review.save()
        return Response(ReviewSerializer(existing_review).data, status=status.HTTP_200_OK)
    else:
        # Create new review
        serializer = ReviewCreateSerializer(data=request.data)
        if serializer.is_valid():
            review = Review.objects.create(
                user=request.user,
                product=product,
                rating=serializer.validated_data.get('rating', 5),
                title=serializer.validated_data.get('title', ''),
                comment=serializer.validated_data.get('comment', '')
            )
            return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def review_delete_view(request, review_id):
    """Delete user's own review"""
    try:
        review = Review.objects.get(id=review_id, user=request.user)
        review.delete()
        return Response({'message': 'Review deleted'}, status=status.HTTP_200_OK)
    except Review.DoesNotExist:
        return Response({'detail': 'Review not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_reviews_view(request):
    """Get all reviews by current user"""
    reviews = Review.objects.filter(user=request.user)
    serializer = ReviewSerializer(reviews, many=True)
    return Response(serializer.data)


# ============ MESSAGE ENDPOINTS ============

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def product_messages_view(request, product_id):
    """Get all messages for a product between the current user/brand and the other party"""
    product = Product.objects.filter(id=product_id).first()
    if not product:
        return Response({'detail': 'Product not found'}, status=404)

    # Determine user type
    user = request.user
    is_brand = hasattr(user, 'is_brand') and user.is_brand
    
    if is_brand:
        # Brand: show all messages for this product where brand is sender or receiver
        messages = Message.objects.filter(product=product, 
            sender_brand=product.brand) | Message.objects.filter(product=product, receiver_brand=product.brand)
    else:
        # Customer: show all messages for this product where user is sender or receiver
        messages = Message.objects.filter(product=product, 
            sender_user=user) | Message.objects.filter(product=product, receiver_user=user)
    messages = messages.order_by('timestamp')
    serializer = MessageSerializer(messages, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message_view(request):
    """Send a message for a product chat (customer or brand)"""
    data = request.data
    product_id = data.get('product')
    message_text = data.get('message')
    if not product_id or not message_text:
        return Response({'detail': 'product and message are required'}, status=400)
    product = Product.objects.filter(id=product_id).first()
    if not product:
        return Response({'detail': 'Product not found'}, status=404)
    user = request.user
    is_brand = hasattr(user, 'is_brand') and user.is_brand
    msg = Message(product=product, message=message_text)
    if is_brand:
        msg.sender_brand = product.brand
        # For now, send to all users who messaged this product (or null)
    else:
        msg.sender_user = user
        msg.receiver_brand = product.brand
    msg.is_from_brand = is_brand
    msg.save()
    return Response(MessageSerializer(msg).data, status=201)

