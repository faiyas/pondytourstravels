from django.contrib import admin
from .models import AnalyticsEvent

@admin.register(AnalyticsEvent)
class AnalyticsEventAdmin(admin.ModelAdmin):
    list_display = ('event_type', 'page_path', 'ip_address', 'created_at')
    list_filter = ('event_type', 'created_at')
    search_fields = ('page_path', 'ip_address')
    readonly_fields = ('event_type', 'page_path', 'ip_address', 'user_agent', 'metadata', 'created_at')

