import secrets
import datetime
from django.utils import timezone
from django.contrib.auth.hashers import make_password, check_password
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Driver, Vehicle, Booking, Customer

def clean_phone(phone_str):
    if not phone_str:
        return ""
    digits = ''.join(c for c in str(phone_str) if c.isdigit())
    if len(digits) > 10 and digits.startswith('91'):
        digits = digits[2:]
    return digits[-10:] if len(digits) >= 10 else digits

def get_authenticated_driver(request):
    token = request.headers.get('Driver-Token') or request.headers.get('Authorization', '').replace('Bearer ', '').strip()
    if not token:
        return None
    try:
        return Driver.objects.get(session_token=token)
    except Driver.DoesNotExist:
        return None

def get_authenticated_customer(request):
    token = request.headers.get('Customer-Token') or request.headers.get('Authorization', '').replace('Bearer ', '').strip()
    if not token:
        return None
    try:
        return Customer.objects.get(session_token=token)
    except Customer.DoesNotExist:
        return None

# ============================================================================
# DRIVER AUTHENTICATION (MOBILE + PASSWORD ONLY - NO EMAIL)
# ============================================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def driver_register(request):
    """
    Onboard a new driver via mobile number & password.
    No email required. Mobile number is marked unverified by default.
    """
    data = request.data
    name = data.get('name', '').strip()
    phone = clean_phone(data.get('phone', ''))
    password = data.get('password', '').strip()
    confirm_password = data.get('confirmPassword', '').strip()

    if not name or len(name) < 2:
        return Response({'success': False, 'error': 'Please provide a valid full name.'}, status=status.HTTP_400_BAD_REQUEST)
    if not phone or len(phone) < 10:
        return Response({'success': False, 'error': 'Please provide a valid 10-digit mobile number.'}, status=status.HTTP_400_BAD_REQUEST)
    if not password or len(password) < 6:
        return Response({'success': False, 'error': 'Password must be at least 6 characters long.'}, status=status.HTTP_400_BAD_REQUEST)
    if password != confirm_password:
        return Response({'success': False, 'error': 'Passwords do not match.'}, status=status.HTTP_400_BAD_REQUEST)

    # Check existing mobile number
    if Driver.objects.filter(phone__endswith=phone).exists():
        return Response({'success': False, 'error': 'A driver account with this mobile number already exists. Please log in.'}, status=status.HTTP_400_BAD_REQUEST)

    formatted_phone = f"+91 {phone}"
    session_token = secrets.token_hex(24)

    driver = Driver.objects.create(
        name=name,
        phone=formatted_phone,
        password_hash=make_password(password),
        is_phone_verified=False,
        session_token=session_token,
        status='pending',
        documents_approved=False,
        onboarding_step=2,
        last_login_at=timezone.now(),
    )

    return Response({
        'success': True,
        'token': session_token,
        'driver': {
            'id': driver.id,
            'name': driver.name,
            'phone': driver.phone,
            'status': driver.status,
            'onboardingStep': driver.onboarding_step,
            'documentsApproved': driver.documents_approved,
        },
        'message': 'Driver registered successfully. Please complete your profile.'
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def driver_login(request):
    """
    Authenticate driver using mobile number & password.
    """
    data = request.data
    phone = clean_phone(data.get('phone', ''))
    password = data.get('password', '').strip()

    if not phone or len(phone) < 10 or not password:
        return Response({'success': False, 'error': 'Please enter both mobile number and password.'}, status=status.HTTP_400_BAD_REQUEST)

    driver = Driver.objects.filter(phone__endswith=phone).first()
    if not driver or not driver.password_hash:
        return Response({'success': False, 'error': 'Invalid mobile number or password.'}, status=status.HTTP_401_UNAUTHORIZED)

    if not check_password(password, driver.password_hash):
        return Response({'success': False, 'error': 'Invalid mobile number or password.'}, status=status.HTTP_401_UNAUTHORIZED)

    if driver.status == 'suspended':
        return Response({'success': False, 'error': 'Your driver account has been suspended. Please contact dispatch support at +91 90252 32453.'}, status=status.HTTP_403_FORBIDDEN)

    session_token = secrets.token_hex(24)
    driver.session_token = session_token
    driver.last_login_at = timezone.now()
    driver.save(update_fields=['session_token', 'last_login_at'])

    return Response({
        'success': True,
        'token': session_token,
        'driver': {
            'id': driver.id,
            'name': driver.name,
            'phone': driver.phone,
            'status': driver.status,
            'onboardingStep': driver.onboarding_step,
            'documentsApproved': driver.documents_approved,
            'adminNotes': driver.admin_review_notes,
            'rating': float(driver.rating),
            'totalTrips': driver.total_trips,
            'vehicleCategory': driver.vehicle_category,
            'vehicleNumber': driver.vehicle_number,
        }
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def driver_reset_password(request):
    """
    Reset driver password using mobile number confirmation.
    """
    data = request.data
    phone = clean_phone(data.get('phone', ''))
    new_password = data.get('newPassword', '').strip()
    confirm_password = data.get('confirmPassword', '').strip()

    if not phone or len(phone) < 10:
        return Response({'success': False, 'error': 'Please enter a valid 10-digit mobile number.'}, status=status.HTTP_400_BAD_REQUEST)
    if not new_password or len(new_password) < 6:
        return Response({'success': False, 'error': 'Password must be at least 6 characters long.'}, status=status.HTTP_400_BAD_REQUEST)
    if new_password != confirm_password:
        return Response({'success': False, 'error': 'Passwords do not match.'}, status=status.HTTP_400_BAD_REQUEST)

    driver = Driver.objects.filter(phone__endswith=phone).first()
    if not driver:
        return Response({'success': False, 'error': 'Driver account not found with this mobile number.'}, status=status.HTTP_404_NOT_FOUND)

    driver.password_hash = make_password(new_password)
    driver.session_token = None
    driver.save(update_fields=['password_hash', 'session_token'])

    return Response({'success': True, 'message': 'Password has been updated. Please log in with your new password.'})


# ============================================================================
# DRIVER ONBOARDING & PROFILE MANAGEMENT
# ============================================================================

@api_view(['GET'])
@permission_classes([AllowAny])
def driver_profile_get(request):
    """
    Get current logged-in driver's profile and KYC document status.
    """
    driver = get_authenticated_driver(request)
    if not driver:
        return Response({'success': False, 'error': 'Authentication required. Please log in.'}, status=status.HTTP_401_UNAUTHORIZED)

    return Response({
        'success': True,
        'driver': {
            'id': driver.id,
            'name': driver.name,
            'phone': driver.phone,
            'address': driver.address,
            'city': driver.city,
            'emergencyContact': driver.emergency_contact,
            'experienceYears': driver.experience_years,
            'licenseNumber': driver.license_number,
            'licenseExpiry': str(driver.license_expiry) if driver.license_expiry else None,
            'aadhaarNumber': driver.aadhaar_number,
            'vehicleCategory': driver.vehicle_category,
            'vehicleModel': driver.vehicle_model,
            'vehicleNumber': driver.vehicle_number,
            'rcNumber': driver.rc_number,
            'insuranceExpiry': str(driver.insurance_expiry) if driver.insurance_expiry else None,
            'fitnessExpiry': str(driver.fitness_expiry) if driver.fitness_expiry else None,
            'onboardingStep': driver.onboarding_step,
            'documentsApproved': driver.documents_approved,
            'status': driver.status,
            'adminNotes': driver.admin_review_notes,
            'rating': float(driver.rating),
            'totalTrips': driver.total_trips,
        }
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def driver_profile_update(request):
    """
    Step 2: Update personal profile, address and emergency contact.
    """
    driver = get_authenticated_driver(request)
    if not driver:
        return Response({'success': False, 'error': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

    data = request.data
    driver.address = data.get('address', driver.address)
    driver.city = data.get('city', driver.city or 'Pondicherry')
    driver.emergency_contact = data.get('emergencyContact', driver.emergency_contact)
    driver.experience_years = int(data.get('experienceYears', driver.experience_years or 1))
    
    if driver.onboarding_step < 3:
        driver.onboarding_step = 3

    driver.save()
    return Response({'success': True, 'message': 'Driver profile saved.', 'onboardingStep': driver.onboarding_step})


@api_view(['POST'])
@permission_classes([AllowAny])
def driver_documents_submit(request):
    """
    Steps 3 & 4: Submit Driving Licence, Aadhaar, Vehicle Reg, RC & Compliance dates.
    Sets onboarding_step to 5 (Submitted for Admin Review).
    """
    driver = get_authenticated_driver(request)
    if not driver:
        return Response({'success': False, 'error': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

    data = request.data
    driver.license_number = data.get('licenseNumber', '').strip().upper()
    driver.license_expiry = data.get('licenseExpiry') or None
    driver.aadhaar_number = data.get('aadhaarNumber', '').strip()
    
    driver.vehicle_category = data.get('vehicleCategory', 'sedan')
    driver.vehicle_model = data.get('vehicleModel', '').strip()
    driver.vehicle_number = data.get('vehicleNumber', '').strip().upper()
    driver.rc_number = data.get('rcNumber', '').strip().upper()
    driver.insurance_expiry = data.get('insuranceExpiry') or None
    driver.fitness_expiry = data.get('fitnessExpiry') or None

    driver.onboarding_step = 5
    driver.status = 'pending'
    driver.documents_approved = False
    driver.save()

    # Link or register vehicle in fleet roster
    if driver.vehicle_number:
        v_obj, _ = Vehicle.objects.get_or_create(
            registration_number=driver.vehicle_number,
            defaults={
                'category': driver.vehicle_category,
                'model_name': driver.vehicle_model or 'Registered Cab',
                'assigned_driver': driver,
                'insurance_expiry': driver.insurance_expiry,
                'fitness_expiry': driver.fitness_expiry,
                'status': 'active',
            }
        )
        v_obj.assigned_driver = driver
        v_obj.save()

    return Response({
        'success': True,
        'message': 'Driver documents & vehicle submitted for admin approval!',
        'onboardingStep': 5,
        'status': driver.status,
    })


# ============================================================================
# DRIVER DUTY OPPORTUNITIES & ACTIVE JOURNEYS
# ============================================================================

@api_view(['GET'])
@permission_classes([AllowAny])
def driver_duties_list(request):
    """
    View assigned trip duties. Only approved and legally eligible drivers can view active trips.
    """
    driver = get_authenticated_driver(request)
    if not driver:
        return Response({'success': False, 'error': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

    if not driver.documents_approved or driver.status not in ['active', 'on_duty']:
        return Response({
            'success': True,
            'isEligible': False,
            'status': driver.status,
            'message': 'Your account is under document review. Dispatch duties will appear once approved by the admin.',
            'duties': []
        })

    # Find bookings assigned to this driver
    clean_p = clean_phone(driver.phone)
    assigned_bookings = Booking.objects.filter(
        lead__status__in=['confirmed', 'converted', 'whatsapp_clicked', 'enquiry']
    ).select_related('lead').order_by('-created_at')

    matching_duties = []
    for b in assigned_bookings:
        is_assigned = (b.driver == driver) or (b.driver_phone and clean_phone(b.driver_phone) == clean_p)
        if is_assigned:
            matching_duties.append({
                'id': b.id,
                'bookingId': b.booking_id,
                'customerName': b.lead.customer_name,
                'customerPhone': b.lead.customer_phone,
                'pickup': b.lead.pickup,
                'drop': b.lead.drop,
                'tripType': b.lead.trip_type,
                'travelDate': str(b.lead.travel_date),
                'preferredTime': str(b.lead.preferred_time),
                'vehicleType': b.lead.vehicle_type,
                'vehicleNumber': b.vehicle_number or driver.vehicle_number,
                'actualFare': round(float(b.actual_fare or b.lead.estimated_fare or 0)),
                'advancePaid': round(float(b.advance_paid or 0)),
                'balanceAmount': round(float(b.balance_amount or 0)),
                'status': b.status,
                'adminNotes': b.admin_notes,
            })

    return Response({
        'success': True,
        'isEligible': True,
        'status': driver.status,
        'duties': matching_duties,
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def driver_duty_update_status(request, pk):
    """
    Allows driver to update journey status (e.g. in_progress, completed).
    """
    driver = get_authenticated_driver(request)
    if not driver:
        return Response({'success': False, 'error': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        booking = Booking.objects.get(pk=pk)
    except Booking.DoesNotExist:
        return Response({'success': False, 'error': 'Booking voucher not found.'}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    if new_status in ['in_progress', 'completed']:
        booking.status = new_status
        history = getattr(booking, 'status_history', []) or []
        history.append({
            'from': booking.status,
            'to': new_status,
            'timestamp': timezone.now().isoformat(),
            'note': f"Driver {driver.name} marked trip as {new_status}",
        })
        booking.status_history = history
        booking.save()

        if new_status == 'completed':
            driver.total_trips = (driver.total_trips or 0) + 1
            driver.status = 'active'
            driver.save(update_fields=['total_trips', 'status'])
        elif new_status == 'in_progress':
            driver.status = 'on_duty'
            driver.save(update_fields=['status'])

        return Response({'success': True, 'bookingStatus': booking.status})

    return Response({'success': False, 'error': 'Invalid status update.'}, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# CUSTOMER AUTHENTICATION (MOBILE + PASSWORD - NO EMAIL DEPENDENCY)
# ============================================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def customer_register(request):
    """
    Register customer using mobile number & password without email requirement.
    """
    data = request.data
    name = data.get('name', '').strip()
    phone = clean_phone(data.get('phone', ''))
    password = data.get('password', '').strip()
    confirm_password = data.get('confirmPassword', '').strip()

    if not name or len(name) < 2:
        return Response({'success': False, 'error': 'Please provide your full name.'}, status=status.HTTP_400_BAD_REQUEST)
    if not phone or len(phone) < 10:
        return Response({'success': False, 'error': 'Please enter a valid 10-digit mobile number.'}, status=status.HTTP_400_BAD_REQUEST)
    if not password or len(password) < 6:
        return Response({'success': False, 'error': 'Password must be at least 6 characters long.'}, status=status.HTTP_400_BAD_REQUEST)
    if password != confirm_password:
        return Response({'success': False, 'error': 'Passwords do not match.'}, status=status.HTTP_400_BAD_REQUEST)

    if Customer.objects.filter(phone__endswith=phone).exists():
        return Response({'success': False, 'error': 'An account already exists with this mobile number. Please log in.'}, status=status.HTTP_400_BAD_REQUEST)

    formatted_phone = f"+91 {phone}"
    session_token = secrets.token_hex(24)

    customer = Customer.objects.create(
        name=name,
        phone=formatted_phone,
        password_hash=make_password(password),
        is_phone_verified=False,
        session_token=session_token,
        last_login_at=timezone.now(),
    )

    return Response({
        'success': True,
        'token': session_token,
        'customer': {
            'id': customer.id,
            'name': customer.name,
            'phone': customer.phone,
        },
        'message': 'Account created successfully!'
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def customer_login(request):
    """
    Login customer using mobile number & password.
    """
    data = request.data
    phone = clean_phone(data.get('phone', ''))
    password = data.get('password', '').strip()

    if not phone or len(phone) < 10 or not password:
        return Response({'success': False, 'error': 'Please enter your mobile number and password.'}, status=status.HTTP_400_BAD_REQUEST)

    customer = Customer.objects.filter(phone__endswith=phone).first()
    if not customer or not check_password(password, customer.password_hash):
        return Response({'success': False, 'error': 'Invalid mobile number or password.'}, status=status.HTTP_401_UNAUTHORIZED)

    session_token = secrets.token_hex(24)
    customer.session_token = session_token
    customer.last_login_at = timezone.now()
    customer.save(update_fields=['session_token', 'last_login_at'])

    return Response({
        'success': True,
        'token': session_token,
        'customer': {
            'id': customer.id,
            'name': customer.name,
            'phone': customer.phone,
        }
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def customer_bookings_list(request):
    """
    View customer's trips and booking vouchers matching their mobile number.
    """
    customer = get_authenticated_customer(request)
    if not customer:
        return Response({'success': False, 'error': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

    phone_suffix = clean_phone(customer.phone)
    customer_leads = Lead.objects.filter(customer_phone__endswith=phone_suffix).select_related('booking').order_by('-created_at')

    trips = []
    for l in customer_leads:
        b = getattr(l, 'booking', None)
        trips.append({
            'bookingId': b.booking_id if b else f"PTB-{l.id + 1000}",
            'pickup': l.pickup,
            'drop': l.drop,
            'tripType': l.trip_type,
            'travelDate': str(l.travel_date),
            'preferredTime': str(l.preferred_time),
            'vehicleType': l.vehicle_type,
            'status': b.status if b else l.status,
            'driverName': b.driver_name if b else None,
            'driverPhone': b.driver_phone if b else None,
            'vehicleNumber': b.vehicle_number if b else None,
            'fare': round(float(b.actual_fare if b and b.actual_fare else l.estimated_fare or 0)),
            'advancePaid': round(float(b.advance_paid if b else 0)),
            'balanceAmount': round(float(b.balance_amount if b else l.estimated_fare or 0)),
        })

    return Response({'success': True, 'trips': trips})
