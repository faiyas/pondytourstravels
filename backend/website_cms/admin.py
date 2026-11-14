from django.contrib import admin
from .models import SiteSetting, SMTPSettings

@admin.register(SiteSetting)
class SiteSettingAdmin(admin.ModelAdmin):
    list_display = (
        'contact_phone', 'contact_whatsapp', 'contact_email',
        'is_announcement_active', 'announcement_banner_text', 'updated_at'
    )

@admin.register(SMTPSettings)
class SMTPSettingsAdmin(admin.ModelAdmin):
    list_display = (
        'admin_notification_email', 'smtp_host', 'smtp_port',
        'smtp_user', 'from_email', 'is_active', 'updated_at'
    )


