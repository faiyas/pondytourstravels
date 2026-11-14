from django.contrib import admin
from .models import VehiclePricing

@admin.register(VehiclePricing)
class VehiclePricingAdmin(admin.ModelAdmin):
    list_display = (
        'display_name', 'vehicle_code', 'oneway_rate_per_km',
        'roundtrip_rate_per_km', 'driver_allowance_per_day',
        'over_400km_driver_allowance', 'is_active', 'updated_at'
    )
    list_editable = (
        'oneway_rate_per_km', 'roundtrip_rate_per_km',
        'driver_allowance_per_day', 'is_active'
    )
    search_fields = ('display_name', 'vehicle_code')
