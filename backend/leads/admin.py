from django.contrib import admin
from .models import Lead

@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'customer_name', 'customer_phone', 'pickup', 'drop',
        'trip_type', 'vehicle_type', 'estimated_fare', 'status',
        'whatsapp_clicked', 'created_at'
    )
    list_filter = ('status', 'trip_type', 'vehicle_type', 'whatsapp_clicked', 'created_at')
    search_fields = ('customer_name', 'customer_phone', 'customer_email', 'pickup', 'drop')
    readonly_fields = ('created_at', 'updated_at', 'whatsapp_clicked_at', 'ip_address', 'user_agent')

