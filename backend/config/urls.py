from django.contrib import admin
from django.urls import path
from leads.views import create_lead, track_whatsapp_click
from pricing.views import get_pricing_matrix
from analytics.views import track_event
from config.admin_api import (
    admin_login,
    admin_stats,
    admin_leads_list,
    admin_lead_update,
    admin_lead_convert,
    admin_bookings_list,
    admin_booking_update,
    admin_pricing_manage,
    admin_drivers_manage,
    admin_driver_detail,
    admin_vehicles_manage,
    admin_vehicle_detail,
    admin_reports_data,
)

admin.site.site_header = "Pondy Tours & Travels Admin"
admin.site.site_title = "Pondy Tours Dispatch"
admin.site.index_title = "Lead & Booking Management"

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Public Client API Endpoints
    path('api/leads/enquiry/', create_lead, name='create_lead'),
    path('api/leads/<int:lead_id>/whatsapp-click/', track_whatsapp_click, name='track_whatsapp_click'),
    path('api/pricing/', get_pricing_matrix, name='pricing_matrix'),
    path('api/analytics/track/', track_event, name='track_event'),

    # React Admin Dashboard Endpoints
    path('api/auth/login/', admin_login, name='admin_login'),
    path('api/admin/stats/', admin_stats, name='admin_stats'),
    path('api/admin/leads/', admin_leads_list, name='admin_leads_list'),
    path('api/admin/leads/<int:pk>/', admin_lead_update, name='admin_lead_update'),
    path('api/admin/leads/<int:pk>/convert/', admin_lead_convert, name='admin_lead_convert'),
    path('api/admin/bookings/', admin_bookings_list, name='admin_bookings_list'),
    path('api/admin/bookings/<int:pk>/', admin_booking_update, name='admin_booking_update'),
    path('api/admin/pricing/', admin_pricing_manage, name='admin_pricing_manage'),
    path('api/admin/drivers/', admin_drivers_manage, name='admin_drivers_manage'),
    path('api/admin/drivers/<int:pk>/', admin_driver_detail, name='admin_driver_detail'),
    path('api/admin/vehicles/', admin_vehicles_manage, name='admin_vehicles_manage'),
    path('api/admin/vehicles/<int:pk>/', admin_vehicle_detail, name='admin_vehicle_detail'),
    path('api/admin/reports/', admin_reports_data, name='admin_reports_data'),
]

