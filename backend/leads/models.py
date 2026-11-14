from django.db import models

class Lead(models.Model):
    TRIP_TYPE_CHOICES = [('oneway', 'One-Way'), ('round', 'Round Trip')]
    STATUS_CHOICES = [
        ('enquiry', 'New Enquiry (Form Submitted)'),
        ('whatsapp_clicked', 'WhatsApp Clicked'),
        ('contacted', 'Customer Contacted'),
        ('quotation_sent', 'Quotation Sent'),
        ('converted', 'Converted to Booking'),
        ('lost', 'Lost / Cancelled'),
    ]

    trip_type = models.CharField(max_length=10, choices=TRIP_TYPE_CHOICES, default='oneway')
    pickup = models.CharField(max_length=255)
    drop = models.CharField(max_length=255)
    travel_date = models.DateField()
    preferred_time = models.TimeField()
    vehicle_type = models.CharField(max_length=50)

    customer_name = models.CharField(max_length=200)
    customer_phone = models.CharField(max_length=30)
    customer_email = models.EmailField(blank=True, null=True)
    requirements = models.TextField(blank=True, null=True)

    optional_stops = models.TextField(blank=True, null=True)
    return_date = models.DateField(blank=True, null=True)
    return_time = models.TimeField(blank=True, null=True)
    passenger_count = models.IntegerField(default=1)
    luggage_info = models.CharField(max_length=150, blank=True, null=True)

    distance_km = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    estimated_fare = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    status = models.CharField(max_length=25, choices=STATUS_CHOICES, default='enquiry')
    whatsapp_clicked = models.BooleanField(default=False)
    whatsapp_clicked_at = models.DateTimeField(blank=True, null=True)

    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Customer Enquiry'
        verbose_name_plural = 'Customer Enquiries'

    def __str__(self):
        return f"Lead #{self.id} - {self.customer_name} ({self.pickup} to {self.drop})"

