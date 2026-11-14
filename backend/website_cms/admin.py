from django.contrib import admin
from .models import SiteSetting

@admin.register(SiteSetting)
class SiteSettingAdmin(admin.ModelAdmin):
    list_display = (
        'contact_phone', 'contact_whatsapp', 'contact_email',
        'is_announcement_active', 'announcement_banner_text', 'updated_at'
    )


