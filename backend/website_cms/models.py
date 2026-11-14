from django.db import models

class SiteSetting(models.Model):
    contact_phone = models.CharField(max_length=30, default='+91 63740 70342')
    contact_whatsapp = models.CharField(max_length=30, default='+91 63740 70342')
    contact_email = models.EmailField(default='pondytourstravels@gmail.com')
    office_address = models.TextField(default='123 Beach Road, White Town, Pondicherry, 605001, India.')
    announcement_banner_text = models.CharField(max_length=255, blank=True, null=True)
    is_announcement_active = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Site Contact & Announcement Setting'
        verbose_name_plural = 'Site Contact & Announcement Settings'

    def __str__(self):
        return "Global Site Settings"


class SMTPSettings(models.Model):
    is_active = models.BooleanField(default=True, help_text="Enable automated email dispatch")
    smtp_host = models.CharField(max_length=255, default='smtp.gmail.com')
    smtp_port = models.IntegerField(default=587)
    smtp_user = models.CharField(max_length=255, blank=True, null=True, help_text="Sender Email / SMTP Username")
    smtp_password = models.CharField(max_length=255, blank=True, null=True, help_text="App Password")
    use_tls = models.BooleanField(default=True)
    use_ssl = models.BooleanField(default=False)
    from_name = models.CharField(max_length=150, default='Pondy Tours & Travels')
    from_email = models.CharField(max_length=255, default='pondytourstravels@gmail.com')
    admin_notification_email = models.EmailField(default='pondytourstravels@gmail.com', help_text="Receiver email where admin receives new enquiry alerts")
    notify_admin_on_new_enquiry = models.BooleanField(default=True)
    notify_customer_on_confirmed = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'SMTP & Email Configuration'
        verbose_name_plural = 'SMTP & Email Configurations'

    def __str__(self):
        return f"SMTP Config ({self.admin_notification_email})"

    @classmethod
    def get_settings(cls):
        obj, _ = cls.objects.get_or_create(id=1)
        return obj


