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
    
    # Core API Endpoints
    path('api/leads/enquiry/', create_lead, name='create_lead'),
    path('api/leads/<int:lead_id>/whatsapp-click/', track_whatsapp_click, name='track_whatsapp_click'),
    path('api/pricing/', get_pricing_matrix, name='pricing_matrix'),
    path('api/analytics/track/', track_event, name='track_event'),
]
