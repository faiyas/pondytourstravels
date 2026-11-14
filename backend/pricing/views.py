from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import VehiclePricing

@api_view(['GET', 'HEAD'])
def get_pricing_matrix(request):
    """
    Returns the live active pricing matrix to the frontend booking calculator.
    Allows administrators to change rates instantly from the Django admin.
    """
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

