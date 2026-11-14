#!/usr/bin/env bash
# ==============================================================================
# Pondy Tours & Travels - Automated Backend Installation & Deployment Script
# Target Server: AIO (Debian 13)
# Target Path:   /data/home/pondy_backend
# Target Port:   8001 (Isolated from Pharma on 8000)
# ==============================================================================

set -e

echo ">>> [1/7] Navigating to /data/home/pondy_backend..."
cd /data/home/pondy_backend

# Activate the isolated virtual environment
source /data/home/pondy_backend/venv/bin/activate

echo ">>> [2/7] Writing Environment Configuration (.env)..."
if [ ! -f .env ]; then
  DJANGO_SECRET=$(python3 -c "import secrets; print(secrets.token_urlsafe(50))")
  cat << EOF > .env
SECRET_KEY=${DJANGO_SECRET}
DEBUG=False
ALLOWED_HOSTS=*
PORT=8001

DB_NAME=pondy_db
DB_USER=pondy_user
DB_PASSWORD=${DB_PASSWORD:-pondy_secure_pass_2026}
DB_HOST=127.0.0.1
DB_PORT=5432

CORS_ALLOW_ALL_ORIGINS=True
EOF
  chmod 600 .env
  echo "    .env created with generated SECRET_KEY."
else
  echo "    .env already exists, preserving existing settings."
fi

echo ">>> [3/7] Writing config/settings.py..."
cat << 'EOF' > /data/home/pondy_backend/config/settings.py
import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(os.path.join(BASE_DIR, '.env'))

SECRET_KEY = os.getenv('SECRET_KEY', 'pondy-insecure-secret-key-prod')
DEBUG = os.getenv('DEBUG', 'False') == 'True'
ALLOWED_HOSTS = [h.strip() for h in os.getenv('ALLOWED_HOSTS', '*').split(',') if h.strip()]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'rest_framework',
    'corsheaders',

    'leads',
    'bookings',
    'pricing',
    'analytics',
    'website_cms',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'pondy_db'),
        'USER': os.getenv('DB_USER', 'pondy_user'),
        'PASSWORD': os.getenv('DB_PASSWORD', ''),
        'HOST': os.getenv('DB_HOST', '127.0.0.1'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-in'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static_collected')
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOW_ALL_ORIGINS = os.getenv('CORS_ALLOW_ALL_ORIGINS', 'True') == 'True'
CORS_ALLOW_CREDENTIALS = True

REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50,
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
}
EOF

echo ">>> [4/7] Writing App Models..."
# Pricing Models
cat << 'EOF' > /data/home/pondy_backend/pricing/models.py
from django.db import models

class VehiclePricing(models.Model):
    VEHICLE_CHOICES = [
        ('sedan', 'Sedan (Dzire / Etios)'),
        ('muv', 'MUV / SUV (Ertiga)'),
        ('innova', 'Innova 6+1'),
        ('crysta', 'Innova Crysta 6+1 Luxury'),
    ]

    vehicle_code = models.CharField(max_length=20, choices=VEHICLE_CHOICES, unique=True)
    display_name = models.CharField(max_length=100)
    oneway_rate_per_km = models.DecimalField(max_digits=6, decimal_places=2)
    roundtrip_rate_per_km = models.DecimalField(max_digits=6, decimal_places=2)
    min_oneway_km = models.IntegerField(default=130)
    min_roundtrip_km = models.IntegerField(default=250)
    driver_allowance_per_day = models.DecimalField(max_digits=6, decimal_places=2, default=400.00)
    over_400km_driver_allowance = models.DecimalField(max_digits=6, decimal_places=2, default=600.00)
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['oneway_rate_per_km']
        verbose_name = 'Vehicle Pricing Rule'
        verbose_name_plural = 'Vehicle Pricing Rules'

    def __str__(self):
        return f"{self.display_name} - ₹{self.oneway_rate_per_km}/km"
EOF

# Leads Models
cat << 'EOF' > /data/home/pondy_backend/leads/models.py
from django.db import models

class Lead(models.Model):
    TRIP_TYPE_CHOICES = [('oneway', 'One-Way'), ('round', 'Round Trip')]
    STATUS_CHOICES = [
        ('enquiry', 'New Enquiry (Form Submitted)'),
        ('whatsapp_clicked', 'WhatsApp Clicked'),
        ('contacted', 'Customer Contacted'),
        ('converted', 'Converted to Booking'),
        ('lost', 'Lost / Cancelled'),
    ]

    trip_type = models.CharField(max_length=10, choices=TRIP_TYPE_CHOICES, default='oneway')
    pickup = models.CharField(max_length=255)
    drop = models.CharField(max_length=255)
    travel_date = models.DateField()
    preferred_time = models.TimeField()
    vehicle_type = models.CharField(max_length=50)

    customer_name = models.CharField(max_length=200)
    customer_phone = models.CharField(max_length=30)
    customer_email = models.EmailField(blank=True, null=True)
    requirements = models.TextField(blank=True, null=True)

    distance_km = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    estimated_fare = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    status = models.CharField(max_length=25, choices=STATUS_CHOICES, default='enquiry')
    whatsapp_clicked = models.BooleanField(default=False)
    whatsapp_clicked_at = models.DateTimeField(blank=True, null=True)

    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Lead #{self.id} - {self.customer_name} ({self.pickup} to {self.drop})"
EOF

# Bookings Models
cat << 'EOF' > /data/home/pondy_backend/bookings/models.py
from django.db import models
from leads.models import Lead

class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Confirmation'),
        ('confirmed', 'Confirmed'),
        ('driver_assigned', 'Driver Assigned'),
        ('in_progress', 'Trip In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    booking_id = models.CharField(max_length=30, unique=True)
    lead = models.OneToOneField(Lead, on_delete=models.CASCADE, related_name='booking')

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    driver_name = models.CharField(max_length=150, blank=True, null=True)
    driver_phone = models.CharField(max_length=30, blank=True, null=True)
    vehicle_number = models.CharField(max_length=50, blank=True, null=True)

    actual_fare = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    advance_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    balance_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    admin_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Booking {self.booking_id} - {self.lead.customer_name}"
EOF

# Analytics Models
cat << 'EOF' > /data/home/pondy_backend/analytics/models.py
from django.db import models

class AnalyticsEvent(models.Model):
    EVENT_TYPES = [
        ('page_view', 'Page View'),
        ('phone_click', 'Phone Call Click'),
        ('whatsapp_float_click', 'Floating WhatsApp Click'),
        ('form_whatsapp_click', 'Form WhatsApp Click'),
        ('fare_calculate', 'Fare Calculator Used'),
    ]

    event_type = models.CharField(max_length=30, choices=EVENT_TYPES)
    page_path = models.CharField(max_length=255)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    metadata = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
EOF

# Website CMS Models
cat << 'EOF' > /data/home/pondy_backend/website_cms/models.py
from django.db import models

class SiteSetting(models.Model):
    contact_phone = models.CharField(max_length=30, default='+91 63740 70342')
    contact_whatsapp = models.CharField(max_length=30, default='+91 63740 70342')
    contact_email = models.EmailField(default='pondytourstravels@gmail.com')
    office_address = models.TextField(default='123 Beach Road, White Town, Pondicherry, 605001, India.')
    announcement_banner_text = models.CharField(max_length=255, blank=True, null=True)
    is_announcement_active = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "Global Site Settings"
EOF

echo ">>> [5/7] Writing Views and API URLs..."
cat << 'EOF' > /data/home/pondy_backend/leads/views.py
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from .models import Lead
from bookings.models import Booking

@api_view(['POST'])
def create_lead(request):
    data = request.data
    try:
        lead = Lead.objects.create(
            trip_type=data.get('tripType', 'oneway'),
            pickup=data.get('pickup', ''),
            drop=data.get('drop', ''),
            travel_date=data.get('travelDate'),
            preferred_time=data.get('preferredTime'),
            vehicle_type=data.get('vehicleType', 'sedan'),
            customer_name=data.get('fullName', ''),
            customer_phone=data.get('phone', ''),
            customer_email=data.get('email') or None,
            requirements=data.get('requirements') or None,
            distance_km=float(data.get('distance', 0) or 0),
            estimated_fare=float(data.get('estimatedFare', 0) or 0),
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT'),
        )
        
        booking_id = f"PTB-{lead.id + 1000}"
        Booking.objects.create(booking_id=booking_id, lead=lead)

        return Response({
            'success': True,
            'leadId': lead.id,
            'bookingId': booking_id,
            'message': 'Enquiry saved successfully in PostgreSQL.'
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def track_whatsapp_click(request, lead_id):
    try:
        lead = Lead.objects.get(id=lead_id)
        lead.whatsapp_clicked = True
        lead.whatsapp_clicked_at = timezone.now()
        lead.status = 'whatsapp_clicked'
        lead.save()
        return Response({'success': True, 'message': 'WhatsApp click recorded.'})
    except Lead.DoesNotExist:
        return Response({'success': False, 'error': 'Lead not found'}, status=status.HTTP_404_NOT_FOUND)
EOF

cat << 'EOF' > /data/home/pondy_backend/pricing/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import VehiclePricing

@api_view(['GET'])
def get_pricing_matrix(request):
    vehicles = VehiclePricing.objects.filter(is_active=True)
    data = {}
    for v in vehicles:
        data[v.vehicle_code] = {
            'name': v.display_name,
            'oneway_rate': float(v.oneway_rate_per_km),
            'roundtrip_rate': float(v.roundtrip_rate_per_km),
            'min_oneway_km': v.min_oneway_km,
            'min_roundtrip_km': v.min_roundtrip_km,
            'driver_allowance': float(v.driver_allowance_per_day),
            'over_400km_allowance': float(v.over_400km_driver_allowance),
        }
    return Response(data)
EOF

cat << 'EOF' > /data/home/pondy_backend/analytics/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import AnalyticsEvent

@api_view(['POST'])
def track_event(request):
    data = request.data
    AnalyticsEvent.objects.create(
        event_type=data.get('event_type', 'page_view'),
        page_path=data.get('page_path', '/'),
        ip_address=request.META.get('REMOTE_ADDR'),
        user_agent=request.META.get('HTTP_USER_AGENT'),
        metadata=data.get('metadata')
    )
    return Response({'success': True})
EOF

cat << 'EOF' > /data/home/pondy_backend/config/urls.py
from django.contrib import admin
from django.urls import path
from leads.views import create_lead, track_whatsapp_click
from pricing.views import get_pricing_matrix
from analytics.views import track_event

admin.site.site_header = "Pondy Tours & Travels Admin"
admin.site.site_title = "Pondy Tours Dispatch"
admin.site.index_title = "Lead & Booking Management"

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/leads/enquiry/', create_lead, name='create_lead'),
    path('api/leads/<int:lead_id>/whatsapp-click/', track_whatsapp_click, name='track_whatsapp_click'),
    path('api/pricing/', get_pricing_matrix, name='pricing_matrix'),
    path('api/analytics/track/', track_event, name='track_event'),
]
EOF

cat << 'EOF' > /data/home/pondy_backend/leads/admin.py
from django.contrib import admin
from .models import Lead

@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer_name', 'customer_phone', 'pickup', 'drop', 'trip_type', 'vehicle_type', 'estimated_fare', 'status', 'created_at')
    list_filter = ('status', 'trip_type', 'vehicle_type', 'created_at')
    search_fields = ('customer_name', 'customer_phone', 'pickup', 'drop')
    readonly_fields = ('created_at', 'updated_at', 'whatsapp_clicked_at')
EOF

cat << 'EOF' > /data/home/pondy_backend/bookings/admin.py
from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('booking_id', 'get_customer', 'get_route', 'status', 'driver_name', 'driver_phone', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('booking_id', 'lead__customer_name', 'driver_name', 'driver_phone')

    def get_customer(self, obj):
        return obj.lead.customer_name
    get_customer.short_description = 'Customer'

    def get_route(self, obj):
        return f"{obj.lead.pickup} -> {obj.lead.drop}"
    get_route.short_description = 'Route'
EOF

cat << 'EOF' > /data/home/pondy_backend/pricing/admin.py
from django.contrib import admin
from .models import VehiclePricing

@admin.register(VehiclePricing)
class VehiclePricingAdmin(admin.ModelAdmin):
    list_display = ('display_name', 'oneway_rate_per_km', 'roundtrip_rate_per_km', 'driver_allowance_per_day', 'is_active')
    list_editable = ('oneway_rate_per_km', 'roundtrip_rate_per_km', 'driver_allowance_per_day', 'is_active')
EOF

cat << 'EOF' > /data/home/pondy_backend/analytics/admin.py
from django.contrib import admin
from .models import AnalyticsEvent

@admin.register(AnalyticsEvent)
class AnalyticsEventAdmin(admin.ModelAdmin):
    list_display = ('event_type', 'page_path', 'ip_address', 'created_at')
    list_filter = ('event_type', 'created_at')
EOF

cat << 'EOF' > /data/home/pondy_backend/website_cms/admin.py
from django.contrib import admin
from .models import SiteSetting

@admin.register(SiteSetting)
class SiteSettingAdmin(admin.ModelAdmin):
    list_display = ('contact_phone', 'contact_whatsapp', 'contact_email', 'is_announcement_active', 'updated_at')
EOF

echo ">>> [6/7] Applying Database Migrations & Seeding Pricing..."
python manage.py makemigrations
python manage.py migrate

python manage.py shell << 'EOF'
from pricing.models import VehiclePricing

rates = [
    {'vehicle_code': 'sedan', 'display_name': 'Sedan (Dzire / Etios)', 'oneway_rate_per_km': 14.00, 'roundtrip_rate_per_km': 12.00, 'driver_allowance_per_day': 400.00},
    {'vehicle_code': 'muv', 'display_name': 'MUV / SUV (Ertiga)', 'oneway_rate_per_km': 19.00, 'roundtrip_rate_per_km': 16.00, 'driver_allowance_per_day': 400.00},
    {'vehicle_code': 'innova', 'display_name': 'Innova 6+1', 'oneway_rate_per_km': 20.00, 'roundtrip_rate_per_km': 18.00, 'driver_allowance_per_day': 500.00},
    {'vehicle_code': 'crysta', 'display_name': 'Innova Crysta Luxury', 'oneway_rate_per_km': 23.00, 'roundtrip_rate_per_km': 21.00, 'driver_allowance_per_day': 500.00},
]

for r in rates:
    VehiclePricing.objects.update_or_create(vehicle_code=r['vehicle_code'], defaults=r)
print("Seeded vehicle pricing rules successfully.")
EOF

python manage.py collectstatic --noinput

echo ">>> [7/7] Setting up Systemd Service (pondy_backend.service)..."
sudo bash -c 'cat << "EOF" > /etc/systemd/system/pondy_backend.service
[Unit]
Description=Pondy Tours and Travels Django Gunicorn Service
After=network.target postgresql.service

[Service]
User=user
Group=user
WorkingDirectory=/data/home/pondy_backend
ExecStart=/data/home/pondy_backend/venv/bin/gunicorn \
    --workers 3 \
    --bind 0.0.0.0:8001 \
    --timeout 120 \
    --access-logfile /data/home/pondy_backend/logs/access.log \
    --error-logfile /data/home/pondy_backend/logs/error.log \
    config.wsgi:application
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF'

mkdir -p /data/home/pondy_backend/logs
sudo systemctl daemon-reload
sudo systemctl enable pondy_backend
sudo systemctl restart pondy_backend

echo
echo "=========================================================="
echo ">>> SUCCESS! Pondy Backend is active on Port 8001."
echo ">>> Pharma on Port 8000 remains untouched."
echo "=========================================================="
curl -I http://127.0.0.1:8001/api/pricing/
echo
echo "Pharma Health Check:"
curl -I http://127.0.0.1:8000/ 2>&1 | head -5

