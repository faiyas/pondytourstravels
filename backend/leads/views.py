from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from .models import Lead
from bookings.models import Booking

@api_view(['POST'])
def create_lead(request):
    """
    Saves a new booking form enquiry from the website into PostgreSQL.
    Automatically generates a Booking voucher and returns IDs for WhatsApp dispatch.
    """
    data = request.data
    try:
        est_fare = round(float(data.get('estimatedFare', 0) or 0))
        dist_km = round(float(data.get('distance', 0) or 0), 1)

        lead = Lead.objects.create(
            trip_type=data.get('tripType', 'oneway'),
            pickup=data.get('pickup', '').strip(),
            drop=data.get('drop', '').strip(),
            travel_date=data.get('travelDate'),
            preferred_time=data.get('preferredTime'),
            vehicle_type=data.get('vehicleType', 'sedan'),
            customer_name=data.get('fullName', '').strip(),
            customer_phone=data.get('phone', '').strip(),
            customer_email=data.get('email', '').strip() or None,
            requirements=data.get('requirements', '').strip() or None,
            distance_km=dist_km,
            estimated_fare=est_fare,
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT'),
        )
        
        # Unique booking code
        booking_id = f"PTB-{lead.id + 1000}"
        Booking.objects.create(
            booking_id=booking_id,
            lead=lead,
            actual_fare=est_fare,
            advance_paid=0,
            balance_amount=est_fare,
        )

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
    """
    Records when the user actually taps the WhatsApp confirmation button.
    Differentiates between raw enquiries and actual WhatsApp interactions.
    """
    try:
        lead = Lead.objects.get(id=lead_id)
        lead.whatsapp_clicked = True
        lead.whatsapp_clicked_at = timezone.now()
        lead.status = 'whatsapp_clicked'
        lead.save()
        return Response({'success': True, 'message': 'WhatsApp click recorded.'})
    except Lead.DoesNotExist:
        return Response({'success': False, 'error': 'Lead not found'}, status=status.HTTP_404_NOT_FOUND)

