from django.db import models

class AnalyticsEvent(models.Model):
    EVENT_TYPES = [
        ('page_view', 'Page View'),
        ('phone_click', 'Phone Call Click'),
        ('whatsapp_float_click', 'Floating WhatsApp Click'),
        ('form_whatsapp_click', 'Form WhatsApp Click'),
        ('fare_calculate', 'Fare Calculator Used'),
    ]

    event_type = models.CharField(max_length=30, choices=EVENT_TYPES)
    page_path = models.CharField(max_length=255)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    metadata = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Analytics Event'
        verbose_name_plural = 'Analytics Events'

    def __str__(self):
        return f"{self.get_event_type_display()} on {self.page_path} at {self.created_at:%Y-%m-%d %H:%M}"

