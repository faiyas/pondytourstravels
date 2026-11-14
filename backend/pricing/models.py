from django.db import models

class VehiclePricing(models.Model):
    VEHICLE_CHOICES = [
        ('sedan', 'Sedan (Dzire / Etios)'),
        ('muv', 'MUV / SUV (Ertiga)'),
        ('innova', 'Innova 6+1'),
        ('crysta', 'Innova Crysta 6+1 Luxury'),
    ]

    vehicle_code = models.CharField(max_length=20, choices=VEHICLE_CHOICES, unique=True)
    display_name = models.CharField(max_length=100)
    oneway_rate_per_km = models.DecimalField(max_digits=6, decimal_places=2)
    roundtrip_rate_per_km = models.DecimalField(max_digits=6, decimal_places=2)
    min_oneway_km = models.IntegerField(default=130)
    min_roundtrip_km = models.IntegerField(default=250)
    driver_allowance_per_day = models.DecimalField(max_digits=6, decimal_places=2, default=400.00)
    over_400km_driver_allowance = models.DecimalField(max_digits=6, decimal_places=2, default=600.00)
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['oneway_rate_per_km']
        verbose_name = 'Vehicle Pricing Rule'
        verbose_name_plural = 'Vehicle Pricing Rules'

    def __str__(self):
        return f"{self.display_name} - ₹{self.oneway_rate_per_km}/km"
