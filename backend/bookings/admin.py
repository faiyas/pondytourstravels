from django.contrib import admin
from .models import Booking, Driver, Vehicle, Customer

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'is_phone_verified', 'created_at', 'last_login_at')
    search_fields = ('name', 'phone')

@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'license_number', 'vehicle_model', 'vehicle_number', 'status', 'documents_approved', 'rating', 'total_trips')
    list_filter = ('status', 'documents_approved')
    search_fields = ('name', 'phone', 'license_number', 'vehicle_number')

@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('registration_number', 'category', 'model_name', 'assigned_driver', 'insurance_expiry', 'fitness_expiry', 'status')
    list_filter = ('category', 'status')
    search_fields = ('registration_number', 'model_name')

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


