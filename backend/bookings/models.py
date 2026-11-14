from django.db import models
from leads.models import Lead

class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Confirmation'),
        ('confirmed', 'Confirmed'),
        ('driver_assigned', 'Driver Assigned'),
        ('in_progress', 'Trip In Progress'),
        ('completed', 'Trip Completed'),
        ('cancelled', 'Cancelled'),
    ]

    booking_id = models.CharField(max_length=30, unique=True)
    lead = models.OneToOneField(Lead, on_delete=models.CASCADE, related_name='booking')

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    driver_name = models.CharField(max_length=150, blank=True, null=True)
    driver_phone = models.CharField(max_length=30, blank=True, null=True)
    vehicle_number = models.CharField(max_length=50, blank=True, null=True)

    actual_fare = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    advance_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    balance_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    admin_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Booking Voucher'
        verbose_name_plural = 'Booking Vouchers'

    def __str__(self):
        return f"Booking {self.booking_id} - {self.lead.customer_name}"
