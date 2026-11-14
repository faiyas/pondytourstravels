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

