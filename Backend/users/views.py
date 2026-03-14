from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser


from .serializers import (UserSerializer, BrandSerializer, RegisterSerializer,
                          BrandRegisterSerializer, LoginSerializer,
                          ProductSerializer, ProductCreateUpdateSerializer,
                          ProductImageSerializer, WishlistSerializer, CartItemSerializer,
                          ReviewSerializer, ReviewCreateSerializer,
                          MessageSerializer, AddressSerializer, ChangePasswordSerializer,
                          OrderSerializer, CheckoutSerializer, OrderStatusUpdateSerializer)
from .models import Brand, Product, ProductImage, Wishlist, CartItem, Review, Message, Address, Order, OrderItem
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
    from django.db import transaction

    brand = get_brand_from_request(request)
    if not brand:
        brand = get_brand_from_token(request)
    
    if not brand:
        return Response({'detail': 'Brand authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
    
    # Validate images count BEFORE creating the product
    images_data = request.data.get('images', [])
    if len(images_data) > 4:
        return Response({'detail': 'Maximum 4 images allowed'}, status=status.HTTP_400_BAD_REQUEST)

    serializer = ProductCreateUpdateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    with transaction.atomic():
        product = serializer.save(brand=brand)
        
        for index, img in enumerate(images_data):
            if isinstance(img, dict) and 'data' in img:
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
    from django.db.models import Q

    product = Product.objects.filter(id=product_id).first()
    if not product:
        return Response({'detail': 'Product not found'}, status=404)

    user = request.user
    is_brand = isinstance(user, BrandUser)
    brand = user.brand if is_brand else None

    # Optional: filter by chat partner for user-to-user chats
    chat_with = request.query_params.get('chat_with')  # username of the other party
    
    if is_brand:
        messages = Message.objects.filter(
            Q(product=product) & (Q(sender_brand=brand) | Q(receiver_brand=brand))
        ).order_by('timestamp')
        Message.objects.filter(
            id__in=messages.values_list('id', flat=True),
            receiver_brand=brand,
            is_read=False,
        ).update(is_read=True)
    elif chat_with:
        # User-to-user chat: show messages between current user and the specified user on this product
        from .models import CustomUser
        other_user = CustomUser.objects.filter(username=chat_with).first()
        if not other_user:
            return Response({'detail': 'User not found'}, status=404)
        messages = Message.objects.filter(
            Q(product=product) & (
                (Q(sender_user=user) & Q(receiver_user=other_user)) |
                (Q(sender_user=other_user) & Q(receiver_user=user))
            )
        ).order_by('timestamp')
        Message.objects.filter(
            id__in=messages.values_list('id', flat=True),
            receiver_user=user,
            is_read=False,
        ).update(is_read=True)
    else:
        # Customer sees messages they sent/received on this product
        messages = Message.objects.filter(
            Q(product=product) & (
                Q(sender_user=user) | Q(receiver_user=user) |
                (Q(is_from_brand=True) & Q(product__messages__sender_user=user))
            )
        ).distinct().order_by('timestamp')
        Message.objects.filter(
            id__in=messages.values_list('id', flat=True),
            receiver_user=user,
            is_read=False,
        ).update(is_read=True)

    serializer = MessageSerializer(messages, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message_view(request):
    """Send a message for a product chat (customer-to-brand or user-to-user)"""
    data = request.data
    product_id = data.get('product') or data.get('product_id')
    message_text = data.get('message')
    receiver_username = data.get('receiver_username')  # For user-to-user chat
    if not product_id or not message_text:
        return Response({'detail': 'product and message are required'}, status=400)
    try:
        product_id = int(product_id)
    except (ValueError, TypeError):
        return Response({'detail': 'Invalid product id'}, status=400)
    product = Product.objects.filter(id=product_id).first()
    if not product:
        return Response({'detail': 'Product not found'}, status=404)
    user = request.user
    is_brand = isinstance(user, BrandUser)
    msg = Message(product=product, message=message_text)

    if receiver_username and not is_brand:
        # User-to-user message
        from .models import CustomUser
        receiver = CustomUser.objects.filter(username=receiver_username).first()
        if not receiver:
            return Response({'detail': 'Receiver not found'}, status=404)
        msg.sender_user = user
        msg.receiver_user = receiver
        msg.is_from_brand = False
    elif is_brand:
        msg.sender_brand = user.brand
        # Find the user who started this conversation
        first_msg = Message.objects.filter(
            product=product, is_from_brand=False
        ).order_by('timestamp').first()
        if first_msg and first_msg.sender_user:
            msg.receiver_user = first_msg.sender_user
        msg.is_from_brand = True
    else:
        msg.sender_user = user
        msg.receiver_brand = product.brand
        msg.is_from_brand = False
    msg.save()
    return Response(MessageSerializer(msg).data, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def conversations_list_view(request):
    """Get all conversations for the current user/brand, grouped by product + chat partner."""
    from django.db.models import Q
    from collections import OrderedDict

    user = request.user
    is_brand = isinstance(user, BrandUser)

    if is_brand:
        brand = user.brand
        msgs = Message.objects.filter(
            Q(sender_brand=brand) | Q(receiver_brand=brand)
        ).select_related('product', 'product__brand', 'sender_user', 'sender_brand', 'receiver_user', 'receiver_brand'
        ).order_by('-timestamp')
    else:
        msgs = Message.objects.filter(
            Q(sender_user=user) | Q(receiver_user=user)
        ).select_related('product', 'product__brand', 'sender_user', 'sender_brand', 'receiver_user', 'receiver_brand'
        ).order_by('-timestamp')

        # Also include brand replies on products where user has sent a message
        user_product_ids = Message.objects.filter(sender_user=user).values_list('product_id', flat=True).distinct()
        brand_replies = Message.objects.filter(
            product_id__in=user_product_ids, is_from_brand=True
        ).select_related('product', 'product__brand', 'sender_user', 'sender_brand', 'receiver_user', 'receiver_brand'
        ).order_by('-timestamp')

        msgs_list = list(msgs) + [m for m in brand_replies if m.id not in {x.id for x in msgs}]
        msgs_list.sort(key=lambda m: m.timestamp, reverse=True)
        msgs = msgs_list

    # Group by product + chat partner (to separate brand chats from user-to-user chats)
    unread_counts = {}

    def get_conversation_meta(msg_item):
        pid_local = msg_item.product_id
        product_local = msg_item.product

        if is_brand:
            other_name_local = None
            if msg_item.sender_user:
                other_name_local = msg_item.sender_user.username
            elif msg_item.receiver_user:
                other_name_local = msg_item.receiver_user.username
            if not other_name_local:
                other_name_local = 'Customer'
            chat_type_local = 'brand'
            convo_key_local = f"{pid_local}_brand_{other_name_local}"
        else:
            is_user_to_user_local = (
                msg_item.sender_brand is None and msg_item.receiver_brand is None and
                msg_item.sender_user is not None and msg_item.receiver_user is not None
            )
            if is_user_to_user_local:
                if msg_item.sender_user_id == user.id:
                    other_name_local = msg_item.receiver_user.username
                else:
                    other_name_local = msg_item.sender_user.username
                chat_type_local = 'user'
                convo_key_local = f"{pid_local}_user_{other_name_local}"
            else:
                other_name_local = product_local.brand.username if product_local.brand else 'Brand'
                chat_type_local = 'brand'
                convo_key_local = f"{pid_local}_brand"

        return convo_key_local, chat_type_local, other_name_local

    for msg in msgs:
        convo_key, _, _ = get_conversation_meta(msg)
        is_unread_for_current_user = False
        if is_brand:
            is_unread_for_current_user = (msg.receiver_brand_id == brand.id and not msg.is_read)
        else:
            is_unread_for_current_user = (msg.receiver_user_id == user.id and not msg.is_read)

        if is_unread_for_current_user:
            unread_counts[convo_key] = unread_counts.get(convo_key, 0) + 1

    seen_convos = OrderedDict()
    for msg in msgs:
        pid = msg.product_id
        product = msg.product
        convo_key, chat_type, other_name = get_conversation_meta(msg)

        if is_brand:
            is_last_from_me = (msg.sender_brand_id == brand.id)
        else:
            is_last_from_me = (msg.sender_user_id == user.id)

        if convo_key not in seen_convos:
            # Get product image
            product_image = None
            try:
                first_img = product.images.first()
                if first_img and first_img.image_data:
                    product_image = f"data:{first_img.image_type};base64,{first_img.image_data}"
            except Exception:
                pass

            last_sender_name = None
            if msg.sender_brand:
                last_sender_name = msg.sender_brand.username
            elif msg.sender_user:
                last_sender_name = msg.sender_user.username

            seen_convos[convo_key] = {
                'product_id': pid,
                'product_name': product.name,
                'product_image': product_image,
                'brand_name': product.brand.username if product.brand else 'Unknown',
                'other_party_name': other_name,
                'last_message': msg.message,
                'last_message_time': msg.timestamp.isoformat(),
                'is_last_from_brand': msg.is_from_brand,
                'is_last_from_me': is_last_from_me,
                'last_sender_name': last_sender_name,
                'unread_count': unread_counts.get(convo_key, 0),
                'chat_type': chat_type,  # 'brand' or 'user'
            }

    conversations = list(seen_convos.values())
    return Response(conversations)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message_to_brand_view(request):
    """Send a message to a brand (initiates or continues a product chat).
    Used from review profile clicks where we know the brand username."""
    data = request.data
    brand_username = data.get('brand_username')
    product_id = data.get('product_id')
    message_text = data.get('message')

    if not brand_username or not message_text:
        return Response({'detail': 'brand_username and message are required'}, status=400)

    brand = Brand.objects.filter(username=brand_username).first()
    if not brand:
        return Response({'detail': 'Brand not found'}, status=404)

    user = request.user
    is_brand = isinstance(user, BrandUser)

    # If product_id provided, use that product; otherwise find or use the first product by brand
    if product_id:
        product = Product.objects.filter(id=product_id).first()
        if not product:
            return Response({'detail': 'Product not found'}, status=404)
    else:
        product = Product.objects.filter(brand=brand).first()
        if not product:
            return Response({'detail': 'No products found for this brand'}, status=404)

    msg = Message(
        product=product,
        message=message_text,
        is_from_brand=is_brand,
    )
    if is_brand:
        msg.sender_brand = brand
    else:
        msg.sender_user = user
        msg.receiver_brand = brand
    msg.save()
    return Response(MessageSerializer(msg).data, status=201)


from django.http import HttpResponse

# ==================== Address Views ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def address_list_view(request):
    """List all addresses of current user"""
    addresses = Address.objects.filter(user=request.user)
    serializer = AddressSerializer(addresses, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def address_create_view(request):
    """Create a new address for current user"""
    serializer = AddressSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save(user=request.user)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def address_detail_view(request, address_id):
    """Retrieve, update or delete a specific address"""
    try:
        address = Address.objects.get(id=address_id, user=request.user)
    except Address.DoesNotExist:
        return Response({'detail': 'Address not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(AddressSerializer(address).data)

    if request.method in ('PUT', 'PATCH'):
        partial = request.method == 'PATCH'
        serializer = AddressSerializer(address, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    if request.method == 'DELETE':
        address.delete()
        return Response({'message': 'Address deleted'}, status=status.HTTP_200_OK)


# ==================== Change Password Views ====================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    """Change password for authenticated customer"""
    serializer = ChangePasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user = request.user
    if not user.check_password(serializer.validated_data['old_password']):
        return Response({'detail': 'Old password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(serializer.validated_data['new_password'])
    user.save()
    return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def change_brand_password_view(request):
    """Change password for authenticated brand"""
    from django.contrib.auth.password_validation import validate_password
    from django.core.exceptions import ValidationError as DjangoValidationError

    brand = get_brand_from_token(request)
    if not brand:
        return Response({'detail': 'Brand authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    new_password2 = request.data.get('new_password2')

    if not old_password or not new_password or not new_password2:
        return Response({'detail': 'old_password, new_password and new_password2 are required'},
                        status=status.HTTP_400_BAD_REQUEST)

    if not brand.check_password(old_password):
        return Response({'detail': 'Old password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)

    if new_password != new_password2:
        return Response({'detail': "Passwords didn't match"}, status=status.HTTP_400_BAD_REQUEST)

    # Validate password strength
    try:
        validate_password(new_password)
    except DjangoValidationError as e:
        return Response({'detail': list(e.messages)}, status=status.HTTP_400_BAD_REQUEST)

    brand.set_password(new_password)
    brand.save()
    return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)


# ==================== Brand Analytics View ====================

@api_view(['GET'])
@permission_classes([AllowAny])
def brand_analytics_view(request):
    """Get analytics data for a brand"""
    brand = get_brand_from_token(request)
    if not brand:
        return Response({'detail': 'Brand authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

    from django.db.models import Sum, Avg, Count

    products = Product.objects.filter(brand=brand)
    total_products = products.count()
    active_products = products.filter(is_active=True).count()

    # Wishlist count (products from this brand saved by users)
    wishlist_count = Wishlist.objects.filter(product__brand=brand).count()

    # Cart count (products from this brand in user carts)
    cart_count = CartItem.objects.filter(product__brand=brand).aggregate(
        total=Sum('quantity'))['total'] or 0

    # Reviews
    review_stats = Review.objects.filter(product__brand=brand).aggregate(
        total=Count('id'), avg_rating=Avg('rating'))
    total_reviews = review_stats['total'] or 0
    avg_rating = round(review_stats['avg_rating'] or 0, 1)

    # Top 5 products by wishlist saves
    top_products = (
        products.filter(is_active=True)
        .annotate(saves=Count('wishlisted_by'))
        .order_by('-saves')[:5]
    )
    top_products_data = [
        {'id': p.id, 'name': p.name, 'price': str(p.price), 'saves': p.saves}
        for p in top_products
    ]

    return Response({
        'total_products': total_products,
        'active_products': active_products,
        'wishlist_saves': wishlist_count,
        'cart_adds': int(cart_count),
        'total_reviews': total_reviews,
        'average_rating': avg_rating,
        'top_products': top_products_data,
    })


def health(request):
    return HttpResponse("OK")


# ==================== Checkout / Order Views ====================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def checkout_view(request):
    """Place an order from the user's current cart"""
    from django.db import transaction
    from decimal import Decimal

    serializer = CheckoutSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    # Resolve shipping address
    address_id = data.get('address_id')
    if address_id:
        try:
            addr = Address.objects.get(id=address_id, user=request.user)
        except Address.DoesNotExist:
            return Response({'detail': 'Address not found'}, status=status.HTTP_404_NOT_FOUND)
        shipping = {
            'shipping_full_name': addr.full_name,
            'shipping_phone': addr.phone or '',
            'shipping_address_line1': addr.address_line1,
            'shipping_address_line2': addr.address_line2 or '',
            'shipping_city': addr.city,
            'shipping_state': addr.state or '',
            'shipping_postal_code': addr.postal_code or '',
            'shipping_country': addr.country,
        }
    else:
        shipping = {
            'shipping_full_name': data.get('shipping_full_name', ''),
            'shipping_phone': data.get('shipping_phone', ''),
            'shipping_address_line1': data.get('shipping_address_line1', ''),
            'shipping_address_line2': data.get('shipping_address_line2', ''),
            'shipping_city': data.get('shipping_city', ''),
            'shipping_state': data.get('shipping_state', ''),
            'shipping_postal_code': data.get('shipping_postal_code', ''),
            'shipping_country': data.get('shipping_country', ''),
        }

    cart_items = CartItem.objects.filter(user=request.user).select_related('product')
    if not cart_items.exists():
        return Response({'detail': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

    # Check stock availability
    for item in cart_items:
        if item.product.stock < item.quantity:
            return Response(
                {'detail': f'Insufficient stock for "{item.product.name}". Available: {item.product.stock}'},
                status=status.HTTP_400_BAD_REQUEST
            )

    # Calculate totals
    SHIPPING_COST = Decimal('0.00')
    subtotal = sum(
        (item.product.sale_price if item.product.is_on_sale else item.product.price) * item.quantity
        for item in cart_items
    )
    total_amount = subtotal + SHIPPING_COST

    # Use atomic transaction to prevent partial failures
    with transaction.atomic():
        # Lock product rows to prevent race conditions
        product_ids = [item.product_id for item in cart_items]
        products = {p.id: p for p in Product.objects.select_for_update().filter(id__in=product_ids)}

        # Re-check stock with locked rows
        for item in cart_items:
            product = products[item.product_id]
            if product.stock < item.quantity:
                return Response(
                    {'detail': f'Insufficient stock for "{product.name}". Available: {product.stock}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Create the order
        order = Order.objects.create(
            user=request.user,
            payment_method=data.get('payment_method', 'cod'),
            notes=data.get('notes', ''),
            subtotal=subtotal,
            shipping_cost=SHIPPING_COST,
            total_amount=total_amount,
            **shipping
        )

        # Create order items and deduct stock
        for item in cart_items:
            product = products[item.product_id]
            unit_price = product.sale_price if product.is_on_sale else product.price
            OrderItem.objects.create(
                order=order,
                product=product,
                brand=product.brand,
                product_name=product.name,
                product_price=unit_price,
                quantity=item.quantity,
                selected_size=item.selected_size,
                selected_color=item.selected_color,
            )
            product.stock -= item.quantity
            product.save(update_fields=['stock'])

        # Clear the cart
        cart_items.delete()

    return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_list_view(request):
    """List all orders for the current user"""
    orders = Order.objects.filter(user=request.user).prefetch_related('items')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_detail_view(request, order_id):
    """Get a specific order's details"""
    try:
        order = Order.objects.prefetch_related('items').get(id=order_id, user=request.user)
    except Order.DoesNotExist:
        return Response({'detail': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
    return Response(OrderSerializer(order).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def order_cancel_view(request, order_id):
    """Cancel a pending order (customer)"""
    from django.db import transaction

    try:
        order = Order.objects.get(id=order_id, user=request.user)
    except Order.DoesNotExist:
        return Response({'detail': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    if order.status not in ('pending', 'confirmed'):
        return Response(
            {'detail': f'Cannot cancel an order with status "{order.status}"'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Restore stock atomically
    with transaction.atomic():
        for item in order.items.select_related('product'):
            if item.product:
                item.product.stock += item.quantity
                item.product.save(update_fields=['stock'])

        order.status = 'cancelled'
        order.save(update_fields=['status', 'updated_at'])

    return Response(OrderSerializer(order).data)


# ---- Brand-side order views ----

@api_view(['GET'])
@permission_classes([AllowAny])
def brand_orders_view(request):
    """List all orders that contain this brand's products"""
    brand = get_brand_from_token(request)
    if not brand:
        return Response({'detail': 'Brand authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

    # Orders that have at least one item belonging to this brand
    orders = (
        Order.objects
        .filter(items__brand=brand)
        .prefetch_related('items')
        .distinct()
        .order_by('-created_at')
    )
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def brand_order_status_update_view(request, order_id):
    """Brand updates the status of an order that contains their products"""
    brand = get_brand_from_token(request)
    if not brand:
        return Response({'detail': 'Brand authentication required'}, status=status.HTTP_401_UNAUTHORIZED)

    # Ensure at least one item in this order belongs to this brand
    if not Order.objects.filter(id=order_id, items__brand=brand).exists():
        return Response({'detail': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = OrderStatusUpdateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    order = Order.objects.get(id=order_id)
    order.status = serializer.validated_data['status']
    order.save(update_fields=['status', 'updated_at'])
    return Response(OrderSerializer(order).data)
