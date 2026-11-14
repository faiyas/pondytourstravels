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
from bookings.models import Booking, Driver, Vehicle
from pricing.models import VehiclePricing
from analytics.models import AnalyticsEvent

DEFAULT_DRIVERS = [
    {
        'id': 1,
        'name': 'Murugan K',
        'phone': '+91 98401 23456',
        'licenseNumber': 'TN-31-20150001234',
        'vehicleModel': 'Maruti Suzuki Dzire',
        'vehicleNumber': 'PY-01-CB-4521',
        'status': 'active',
        'documentsApproved': True,
        'rating': 4.9,
        'totalTrips': 142,
    },
    {
        'id': 2,
        'name': 'Senthil Nathan',
        'phone': '+91 94432 78901',
        'licenseNumber': 'PY-01-20180005678',
        'vehicleModel': 'Toyota Innova Crysta',
        'vehicleNumber': 'PY-01-EF-8902',
        'status': 'on_duty',
        'documentsApproved': True,
        'rating': 5.0,
        'totalTrips': 210,
    },
    {
        'id': 3,
        'name': 'Manikandan R',
        'phone': '+91 97890 12345',
        'licenseNumber': 'TN-32-20190009012',
        'vehicleModel': 'Maruti Ertiga MUV',
        'vehicleNumber': 'TN-31-AZ-6543',
        'status': 'active',
        'documentsApproved': True,
        'rating': 4.8,
        'totalTrips': 98,
    },
    {
        'id': 4,
        'name': 'Vijayakumar S',
        'phone': '+91 90421 65432',
        'licenseNumber': 'PY-01-20210003456',
        'vehicleModel': 'Toyota Innova 6+1',
        'vehicleNumber': 'PY-01-BD-1122',
        'status': 'pending',
        'documentsApproved': False,
        'rating': 4.7,
        'totalTrips': 12,
    },
]

DEFAULT_VEHICLES = [
    {
        'id': 1,
        'category': 'sedan',
        'modelName': 'Maruti Suzuki Dzire VXI',
        'registrationNumber': 'PY-01-CB-4521',
        'assignedDriver': 'Murugan K',
        'insuranceExpiry': '2027-08-15',
        'fitnessExpiry': '2028-03-20',
        'status': 'active',
    },
    {
        'id': 2,
        'category': 'crysta',
        'modelName': 'Toyota Innova Crysta ZX 2.4',
        'registrationNumber': 'PY-01-EF-8902',
        'assignedDriver': 'Senthil Nathan',
        'insuranceExpiry': '2027-11-30',
        'fitnessExpiry': '2028-09-10',
        'status': 'active',
    },
    {
        'id': 3,
        'category': 'muv',
        'modelName': 'Maruti Suzuki Ertiga ZXI',
        'registrationNumber': 'TN-31-AZ-6543',
        'assignedDriver': 'Manikandan R',
        'insuranceExpiry': '2027-04-12',
        'fitnessExpiry': '2027-12-05',
        'status': 'active',
    },
    {
        'id': 4,
        'category': 'innova',
        'modelName': 'Toyota Innova 2.5V 7-Seater',
        'registrationNumber': 'PY-01-BD-1122',
        'assignedDriver': 'Vijayakumar S',
        'insuranceExpiry': '2026-12-15',
        'fitnessExpiry': '2027-06-30',
        'status': 'maintenance',
    },
]

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
    Returns KPI metrics for the admin dashboard.
    Accurately separates WhatsApp clicks from confirmed bookings.
    Calculates conversion rate based on confirmed bookings.
    """
    today = timezone.localdate()
    total_leads = Lead.objects.count()
    today_leads = Lead.objects.filter(created_at__date=today).count()
    new_enquiries = Lead.objects.filter(status='enquiry').count()
    whatsapp_clicks = Lead.objects.filter(whatsapp_clicked=True).count()
    
    total_bookings = Booking.objects.count()
    pending_bookings = Booking.objects.filter(status='pending').count()
    active_trips = Booking.objects.filter(status__in=['confirmed', 'driver_assigned', 'in_progress']).count()
    completed_trips = Booking.objects.filter(status='completed').count()
    cancelled_trips = Booking.objects.filter(status='cancelled').count()

    # Confirmed bookings include confirmed, driver_assigned, in_progress, and completed
    confirmed_bookings = Booking.objects.filter(status__in=['confirmed', 'driver_assigned', 'in_progress', 'completed']).count()

    # Conversion rate based on actual confirmed bookings vs total leads (NOT clicks)
    conversion_rate = 0.0
    if total_leads > 0:
        conversion_rate = round((confirmed_bookings / total_leads) * 100, 1)

    cancellation_rate = 0.0
    if total_bookings > 0:
        cancellation_rate = round((cancelled_trips / total_bookings) * 100, 1)

    return Response({
        'todayLeads': today_leads,
        'totalLeads': total_leads,
        'newEnquiries': new_enquiries,
        'pendingBookings': pending_bookings,
        'activeTrips': active_trips,
        'completedTrips': completed_trips,
        'cancelledTrips': cancelled_trips,
        'totalBookings': total_bookings,
        'whatsappClicks': whatsapp_clicks,
        'conversionRate': conversion_rate,
        'cancellationRate': cancellation_rate,
        # backward compatibility keys
        'activeBookings': active_trips,
        'completedBookings': completed_trips,
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
            'distanceKm': round(float(lead.distance_km)),
            'estimatedFare': round(float(lead.estimated_fare)),
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
            'estimatedFare': round(float(b.lead.estimated_fare)),
            'driverName': b.driver_name,
            'driverPhone': b.driver_phone,
            'vehicleNumber': b.vehicle_number,
            'actualFare': round(float(b.actual_fare)) if b.actual_fare else round(float(b.lead.estimated_fare)),
            'advancePaid': round(float(b.advance_paid)),
            'balanceAmount': round(float(b.balance_amount)),
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
        booking.actual_fare = round(float(data['actualFare']))
    if 'advancePaid' in data and data['advancePaid'] is not None:
        booking.advance_paid = round(float(data['advancePaid']))
    if 'balanceAmount' in data and data['balanceAmount'] is not None:
        booking.balance_amount = round(float(data['balanceAmount']))
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

# ============================================================================
# DRIVER MANAGEMENT
# ============================================================================

@api_view(['GET', 'POST'])
@authentication_classes([TokenAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def admin_drivers_manage(request):
    """
    List registered drivers or register a new driver
    """
    if request.method == 'GET':
        try:
            drivers = Driver.objects.all().order_by('-created_at')
            if not drivers.exists():
                for d in DEFAULT_DRIVERS:
                    Driver.objects.create(
                        name=d['name'],
                        phone=d['phone'],
                        license_number=d['licenseNumber'],
                        vehicle_model=d['vehicleModel'],
                        vehicle_number=d['vehicleNumber'],
                        status=d['status'],
                        documents_approved=d['documentsApproved'],
                        rating=d['rating'],
                        total_trips=d['totalTrips']
                    )
                drivers = Driver.objects.all().order_by('-created_at')

            data = []
            for d in drivers:
                data.append({
                    'id': d.id,
                    'name': d.name,
                    'phone': d.phone,
                    'licenseNumber': d.license_number,
                    'vehicleModel': d.vehicle_model,
                    'vehicleNumber': d.vehicle_number,
                    'status': d.status,
                    'documentsApproved': d.documents_approved,
                    'rating': float(d.rating),
                    'totalTrips': d.total_trips,
                    'createdAt': d.created_at.isoformat(),
                })
            return Response({'drivers': data})
        except Exception:
            return Response({'drivers': DEFAULT_DRIVERS})

    if request.method == 'POST':
        data = request.data
        try:
            driver = Driver.objects.create(
                name=data.get('name', '').strip(),
                phone=data.get('phone', '').strip(),
                license_number=data.get('licenseNumber', '').strip(),
                vehicle_model=data.get('vehicleModel', '').strip(),
                vehicle_number=data.get('vehicleNumber', '').strip().upper(),
                status=data.get('status', 'active'),
                documents_approved=data.get('documentsApproved', True),
            )
            return Response({'success': True, 'driver': {
                'id': driver.id,
                'name': driver.name,
                'phone': driver.phone,
                'status': driver.status,
            }})
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH', 'DELETE'])
@authentication_classes([TokenAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def admin_driver_detail(request, pk):
    """
    Update status, approve documents, or delete driver
    """
    try:
        driver = Driver.objects.get(pk=pk)
    except Exception:
        return Response({'success': False, 'error': 'Driver not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        driver.delete()
        return Response({'success': True, 'message': 'Driver deleted successfully'})

    data = request.data
    if 'status' in data:
        driver.status = data['status']
    if 'documentsApproved' in data:
        driver.documents_approved = bool(data['documentsApproved'])
    if 'name' in data:
        driver.name = data['name']
    if 'phone' in data:
        driver.phone = data['phone']
    if 'licenseNumber' in data:
        driver.license_number = data['licenseNumber']
    if 'vehicleModel' in data:
        driver.vehicle_model = data['vehicleModel']
    if 'vehicleNumber' in data:
        driver.vehicle_number = data['vehicleNumber'].upper()

    driver.save()
    return Response({'success': True, 'driverId': driver.id})


# ============================================================================
# VEHICLE MANAGEMENT
# ============================================================================

@api_view(['GET', 'POST'])
@authentication_classes([TokenAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def admin_vehicles_manage(request):
    """
    List fleet vehicles or add a new vehicle
    """
    if request.method == 'GET':
        try:
            vehicles = Vehicle.objects.select_related('assigned_driver').all().order_by('-created_at')
            if not vehicles.exists():
                for v in DEFAULT_VEHICLES:
                    d_obj = Driver.objects.filter(name=v['assignedDriver']).first()
                    Vehicle.objects.create(
                        category=v['category'],
                        model_name=v['modelName'],
                        registration_number=v['registrationNumber'],
                        assigned_driver=d_obj,
                        insurance_expiry=v['insuranceExpiry'],
                        fitness_expiry=v['fitnessExpiry'],
                        status=v['status']
                    )
                vehicles = Vehicle.objects.select_related('assigned_driver').all().order_by('-created_at')

            data = []
            for v in vehicles:
                data.append({
                    'id': v.id,
                    'category': v.category,
                    'modelName': v.model_name,
                    'registrationNumber': v.registration_number,
                    'assignedDriver': v.assigned_driver.name if v.assigned_driver else None,
                    'driverPhone': v.assigned_driver.phone if v.assigned_driver else None,
                    'insuranceExpiry': str(v.insurance_expiry) if v.insurance_expiry else None,
                    'fitnessExpiry': str(v.fitness_expiry) if v.fitness_expiry else None,
                    'status': v.status,
                    'createdAt': v.created_at.isoformat(),
                })
            return Response({'vehicles': data})
        except Exception:
            return Response({'vehicles': DEFAULT_VEHICLES})

    if request.method == 'POST':
        data = request.data
        try:
            driver_obj = None
            if data.get('assignedDriverId'):
                driver_obj = Driver.objects.filter(pk=data['assignedDriverId']).first()

            vehicle = Vehicle.objects.create(
                category=data.get('category', 'sedan'),
                model_name=data.get('modelName', '').strip(),
                registration_number=data.get('registrationNumber', '').strip().upper(),
                assigned_driver=driver_obj,
                insurance_expiry=data.get('insuranceExpiry') or None,
                fitness_expiry=data.get('fitnessExpiry') or None,
                status=data.get('status', 'active'),
            )
            return Response({'success': True, 'vehicleId': vehicle.id})
        except Exception as e:
            return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH', 'DELETE'])
@authentication_classes([TokenAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def admin_vehicle_detail(request, pk):
    """
    Update status, driver assignment, or delete vehicle
    """
    try:
        vehicle = Vehicle.objects.get(pk=pk)
    except Exception:
        return Response({'success': False, 'error': 'Vehicle not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        vehicle.delete()
        return Response({'success': True, 'message': 'Vehicle deleted successfully'})

    data = request.data
    if 'status' in data:
        vehicle.status = data['status']
    if 'category' in data:
        vehicle.category = data['category']
    if 'modelName' in data:
        vehicle.model_name = data['modelName']
    if 'registrationNumber' in data:
        vehicle.registration_number = data['registrationNumber'].upper()
    if 'insuranceExpiry' in data:
        vehicle.insurance_expiry = data['insuranceExpiry'] or None
    if 'fitnessExpiry' in data:
        vehicle.fitness_expiry = data['fitnessExpiry'] or None
    if 'assignedDriverId' in data:
        vehicle.assigned_driver = Driver.objects.filter(pk=data['assignedDriverId']).first()

    vehicle.save()
    return Response({'success': True, 'vehicleId': vehicle.id})


# ============================================================================
# REPORTS & ANALYTICS
# ============================================================================

@api_view(['GET'])
@authentication_classes([TokenAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def admin_reports_data(request):
    """
    Aggregated reports for monthly bookings, completed trips, revenue, cancellation rate & driver performance
    """
    total_leads = Lead.objects.count()
    total_bookings = Booking.objects.count()
    completed_bookings = Booking.objects.filter(status='completed')
    cancelled_bookings = Booking.objects.filter(status='cancelled')

    # Revenue from completed & active trips
    all_active_fares = Booking.objects.filter(status__in=['confirmed', 'driver_assigned', 'in_progress', 'completed'])
    total_revenue = sum(round(float(b.actual_fare or b.lead.estimated_fare or 0)) for b in all_active_fares)

    cancellation_rate = 0.0
    if total_bookings > 0:
        cancellation_rate = round((cancelled_bookings.count() / total_bookings) * 100, 1)

    conversion_rate = 0.0
    if total_leads > 0:
        conversion_rate = round((all_active_fares.count() / total_leads) * 100, 1)

    # Vehicle distribution
    vehicle_counts = {
        'sedan': Booking.objects.filter(lead__vehicle_type__iexact='sedan').count(),
        'muv': Booking.objects.filter(lead__vehicle_type__in=['muv', 'ertiga']).count(),
        'innova': Booking.objects.filter(lead__vehicle_type__iexact='innova').count(),
        'crysta': Booking.objects.filter(lead__vehicle_type__in=['crysta', 'luxury']).count(),
    }

    # Top popular routes
    top_routes = []
    leads_by_route = Lead.objects.values('pickup', 'drop').annotate(count=Count('id')).order_by('-count')[:5]
    for r in leads_by_route:
        top_routes.append({
            'route': f"{r['pickup']} ➔ {r['drop']}",
            'count': r['count']
        })

    # Driver performance list
    driver_stats = []
    try:
        drivers = Driver.objects.all().order_by('-total_trips')
        for d in drivers:
            driver_bookings = Booking.objects.filter(Q(driver=d) | Q(driver_phone=d.phone))
            driver_rev = sum(round(float(b.actual_fare or 0)) for b in driver_bookings)
            driver_stats.append({
                'name': d.name,
                'phone': d.phone,
                'trips': d.total_trips or driver_bookings.count(),
                'rating': float(d.rating),
                'revenue': driver_rev,
                'status': d.status,
            })
    except Exception:
        pass

    return Response({
        'totalRevenue': total_revenue,
        'totalBookings': total_bookings,
        'completedTrips': completed_bookings.count(),
        'cancelledTrips': cancelled_bookings.count(),
        'cancellationRate': cancellation_rate,
        'conversionRate': conversion_rate,
        'totalLeads': total_leads,
        'vehicleDistribution': vehicle_counts,
        'topRoutes': top_routes,
        'driverStats': driver_stats,
    })



