from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.utils import timezone
from django.db.models import Q, Count
import datetime

from leads.models import Lead
from bookings.models import Booking
from pricing.models import VehiclePricing
from analytics.models import AnalyticsEvent

@api_view(['POST'])
@permission_classes([AllowAny])
def admin_login(request):
    """
    Authenticate staff/admin user and return a persistent API Token
    """
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '').strip()

    if not username or not password:
        return Response({'success': False, 'error': 'Please provide both username and password.'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(username=username, password=password)
    if not user:
        return Response({'success': False, 'error': 'Invalid credentials. Please check your username and password.'}, status=status.HTTP_401_UNAUTHORIZED)

    if not user.is_staff and not user.is_superuser:
        return Response({'success': False, 'error': 'Access denied: You do not have staff admin privileges.'}, status=status.HTTP_403_FORBIDDEN)

    token, _ = Token.objects.get_or_create(user=user)
    return Response({
        'success': True,
        'token': token.key,
        'user': {
            'username': user.username,
            'email': user.email,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser
        }
    })

@api_view(['GET'])
@authentication_classes([TokenAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def admin_stats(request):
    """
    Returns KPI metrics for the admin dashboard
    """
    today = timezone.localdate()
    total_leads = Lead.objects.count()
    today_leads = Lead.objects.filter(created_at__date=today).count()
    whatsapp_clicks = Lead.objects.filter(whatsapp_clicked=True).count()
    
    conversion_rate = 0.0
    if total_leads > 0:
        conversion_rate = round((whatsapp_clicks / total_leads) * 100, 1)

    total_bookings = Booking.objects.count()
    active_bookings = Booking.objects.filter(status__in=['confirmed', 'driver_assigned', 'in_progress']).count()
    completed_bookings = Booking.objects.filter(status='completed').count()

    return Response({
        'totalLeads': total_leads,
        'todayLeads': today_leads,
        'whatsappClicks': whatsapp_clicks,
        'conversionRate': conversion_rate,
        'totalBookings': total_bookings,
        'activeBookings': active_bookings,
        'completedBookings': completed_bookings,
    })

@api_view(['GET'])
@authentication_classes([TokenAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def admin_leads_list(request):
    """
    List customer enquiries with search & status filters
    """
    queryset = Lead.objects.all().order_by('-created_at')

    status_filter = request.GET.get('status')
    if status_filter and status_filter != 'all':
        queryset = queryset.filter(status=status_filter)

    search = request.GET.get('search')
    if search:
        search = search.strip()
        queryset = queryset.filter(
            Q(customer_name__icontains=search) |
            Q(customer_phone__icontains=search) |
            Q(pickup__icontains=search) |
            Q(drop__icontains=search)
        )

    leads_data = []
    for lead in queryset[:150]:
        booking_id = None
        if hasattr(lead, 'booking'):
            booking_id = lead.booking.booking_id

        leads_data.append({
            'id': lead.id,
            'bookingId': booking_id,
            'customerName': lead.customer_name,
            'customerPhone': lead.customer_phone,
            'customerEmail': lead.customer_email,
            'pickup': lead.pickup,
            'drop': lead.drop,
            'tripType': lead.trip_type,
            'travelDate': str(lead.travel_date),
            'preferredTime': str(lead.preferred_time),
            'vehicleType': lead.vehicle_type,
            'distanceKm': float(lead.distance_km),
            'estimatedFare': float(lead.estimated_fare),
            'status': lead.status,
            'whatsappClicked': lead.whatsapp_clicked,
            'whatsappClickedAt': lead.whatsapp_clicked_at.isoformat() if lead.whatsapp_clicked_at else None,
            'requirements': lead.requirements,
            'createdAt': lead.created_at.isoformat(),
        })

    return Response({'leads': leads_data})

@api_view(['PATCH'])
@authentication_classes([TokenAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def admin_lead_update(request, pk):
    """
    Update status of an enquiry (e.g. contacted, converted, lost)
    """
    try:
        lead = Lead.objects.get(pk=pk)
    except Lead.DoesNotExist:
        return Response({'success': False, 'error': 'Lead not found'}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    if new_status:
        lead.status = new_status
        lead.save()

    return Response({'success': True, 'leadId': lead.id, 'status': lead.status})

@api_view(['GET'])
@authentication_classes([TokenAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def admin_bookings_list(request):
    """
    List all confirmed bookings with dispatch details
    """
    queryset = Booking.objects.select_related('lead').all().order_by('-created_at')

    status_filter = request.GET.get('status')
    if status_filter and status_filter != 'all':
        queryset = queryset.filter(status=status_filter)

    bookings_data = []
    for b in queryset[:150]:
        bookings_data.append({
            'id': b.id,
            'bookingId': b.booking_id,
            'status': b.status,
            'customerName': b.lead.customer_name,
            'customerPhone': b.lead.customer_phone,
            'customerEmail': b.lead.customer_email,
            'pickup': b.lead.pickup,
            'drop': b.lead.drop,
            'tripType': b.lead.trip_type,
            'travelDate': str(b.lead.travel_date),
            'preferredTime': str(b.lead.preferred_time),
            'vehicleType': b.lead.vehicle_type,
            'estimatedFare': float(b.lead.estimated_fare),
            'driverName': b.driver_name,
            'driverPhone': b.driver_phone,
            'vehicleNumber': b.vehicle_number,
            'actualFare': float(b.actual_fare) if b.actual_fare else float(b.lead.estimated_fare),
            'advancePaid': float(b.advance_paid),
            'balanceAmount': float(b.balance_amount),
            'adminNotes': b.admin_notes,
            'createdAt': b.created_at.isoformat(),
        })

    return Response({'bookings': bookings_data})

@api_view(['PATCH'])
@authentication_classes([TokenAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def admin_booking_update(request, pk):
    """
    Update booking dispatch details (assign driver, update status, record payments)
    """
    try:
        booking = Booking.objects.get(pk=pk)
    except Booking.DoesNotExist:
        return Response({'success': False, 'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)

    data = request.data
    if 'status' in data:
        booking.status = data['status']
    if 'driverName' in data:
        booking.driver_name = data['driverName']
    if 'driverPhone' in data:
        booking.driver_phone = data['driverPhone']
    if 'vehicleNumber' in data:
        booking.vehicle_number = data['vehicleNumber']
    if 'actualFare' in data and data['actualFare'] is not None:
        booking.actual_fare = float(data['actualFare'])
    if 'advancePaid' in data and data['advancePaid'] is not None:
        booking.advance_paid = float(data['advancePaid'])
    if 'balanceAmount' in data and data['balanceAmount'] is not None:
        booking.balance_amount = float(data['balanceAmount'])
    if 'adminNotes' in data:
        booking.admin_notes = data['adminNotes']

    booking.save()
    return Response({'success': True, 'bookingId': booking.booking_id})

@api_view(['GET', 'PUT'])
@authentication_classes([TokenAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def admin_pricing_manage(request):
    """
    Get or update vehicle pricing rules live from the React Admin Dashboard
    """
    if request.method == 'GET':
        vehicles = VehiclePricing.objects.all().order_by('oneway_rate_per_km')
        data = []
        for v in vehicles:
            data.append({
                'code': v.vehicle_code,
                'name': v.display_name,
                'onewayRate': float(v.oneway_rate_per_km),
                'roundtripRate': float(v.roundtrip_rate_per_km),
                'minOnewayKm': v.min_oneway_km,
                'minRoundtripKm': v.min_roundtrip_km,
                'driverAllowance': float(v.driver_allowance_per_day),
                'over400Allowance': float(v.over_400km_driver_allowance),
                'isActive': v.is_active,
            })
        return Response({'pricing': data})

    if request.method == 'PUT':
        updates = request.data.get('pricing', [])
        for item in updates:
            code = item.get('code')
            if not code:
                continue
            VehiclePricing.objects.filter(vehicle_code=code).update(
                oneway_rate_per_km=item.get('onewayRate', 14.0),
                roundtrip_rate_per_km=item.get('roundtripRate', 12.0),
                min_oneway_km=item.get('minOnewayKm', 130),
                min_roundtrip_km=item.get('minRoundtripKm', 250),
                driver_allowance_per_day=item.get('driverAllowance', 400.0),
                over_400km_driver_allowance=item.get('over400Allowance', 600.0),
                is_active=item.get('isActive', True),
            )
        return Response({'success': True, 'message': 'Vehicle pricing matrix updated successfully.'})
