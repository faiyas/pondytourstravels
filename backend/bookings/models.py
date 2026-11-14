from django.db import models
from leads.models import Lead

class Driver(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active & Available'),
        ('on_duty', 'On Duty / In Trip'),
        ('suspended', 'Suspended'),
        ('pending', 'Pending Approval'),
        ('rejected', 'Application Rejected'),
    ]

    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=30, unique=True)
    password_hash = models.CharField(max_length=128, blank=True, null=True)
    is_phone_verified = models.BooleanField(default=False)
    session_token = models.CharField(max_length=64, blank=True, null=True)

    # Driver Profile & Address
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, default='Pondicherry')
    emergency_contact = models.CharField(max_length=30, blank=True, null=True)
    experience_years = models.IntegerField(default=1)

    # Driving License & ID Documents
    license_number = models.CharField(max_length=50, blank=True, null=True)
    license_expiry = models.DateField(null=True, blank=True)
    aadhaar_number = models.CharField(max_length=30, blank=True, null=True)

    # Vehicle Registration & Compliance Documents
    vehicle_category = models.CharField(max_length=30, default='sedan')
    vehicle_model = models.CharField(max_length=100, blank=True, null=True)
    vehicle_number = models.CharField(max_length=50, blank=True, null=True)
    rc_number = models.CharField(max_length=50, blank=True, null=True)
    insurance_expiry = models.DateField(null=True, blank=True)
    fitness_expiry = models.DateField(null=True, blank=True)

    # Onboarding Status & Admin Review
    onboarding_step = models.IntegerField(default=1)
    documents_approved = models.BooleanField(default=False)
    admin_review_notes = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    rating = models.DecimalField(max_digits=3, decimal_places=1, default=4.9)
    total_trips = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Driver'
        verbose_name_plural = 'Drivers'

    def __str__(self):
        return f"{self.name} ({self.phone}) - {self.status}"

class Customer(models.Model):
    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=30, unique=True)
    password_hash = models.CharField(max_length=128)
    is_phone_verified = models.BooleanField(default=False)
    session_token = models.CharField(max_length=64, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_login_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Customer Account'
        verbose_name_plural = 'Customer Accounts'

    def __str__(self):
        return f"{self.name} ({self.phone})"

class Vehicle(models.Model):
    CATEGORY_CHOICES = [
        ('sedan', 'Sedan (Dzire / Etios)'),
        ('muv', 'MUV / SUV (Ertiga)'),
        ('innova', 'Innova 6+1'),
        ('crysta', 'Innova Crysta Luxury'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('maintenance', 'Under Maintenance'),
        ('inactive', 'Inactive'),
    ]

    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='sedan')
    model_name = models.CharField(max_length=100)
    registration_number = models.CharField(max_length=50, unique=True)
    assigned_driver = models.ForeignKey(Driver, on_delete=models.SET_NULL, null=True, blank=True, related_name='vehicles')
    insurance_expiry = models.DateField(null=True, blank=True)
    fitness_expiry = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Vehicle'
        verbose_name_plural = 'Vehicles'

    def __str__(self):
        return f"{self.registration_number} - {self.model_name}"

class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Confirmation'),
        ('quotation_sent', 'Quotation Sent'),
        ('confirmed', 'Confirmed'),
        ('driver_assigned', 'Driver Assigned'),
        ('in_progress', 'Trip In Progress'),
        ('completed', 'Trip Completed'),
        ('cancelled', 'Cancelled'),
    ]

    booking_id = models.CharField(max_length=30, unique=True)
    lead = models.OneToOneField(Lead, on_delete=models.CASCADE, related_name='booking')

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    driver = models.ForeignKey(Driver, on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings')
    driver_name = models.CharField(max_length=150, blank=True, null=True)
    driver_phone = models.CharField(max_length=30, blank=True, null=True)
    vehicle_number = models.CharField(max_length=50, blank=True, null=True)

    actual_fare = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    advance_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    balance_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    admin_notes = models.TextField(blank=True, null=True)
    cancellation_reason = models.TextField(blank=True, null=True)
    status_history = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Booking Voucher'
        verbose_name_plural = 'Booking Vouchers'

    def __str__(self):
        return f"Booking {self.booking_id} - {self.lead.customer_name}"


