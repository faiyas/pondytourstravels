from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        'booking_id', 'get_customer', 'get_phone', 'get_route',
        'status', 'driver_name', 'driver_phone', 'vehicle_number', 'created_at'
    )
    list_filter = ('status', 'created_at')
    search_fields = ('booking_id', 'lead__customer_name', 'lead__customer_phone', 'driver_name', 'vehicle_number')

    def get_customer(self, obj):
        return obj.lead.customer_name
    get_customer.short_description = 'Customer'

    def get_phone(self, obj):
        return obj.lead.customer_phone
    get_phone.short_description = 'Phone'

    def get_route(self, obj):
        return f"{obj.lead.pickup} -> {obj.lead.drop}"
    get_route.short_description = 'Route'
