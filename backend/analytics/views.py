from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import AnalyticsEvent

@api_view(['POST'])
def track_event(request):
    """
    Receives frontend telemetry events without disrupting user actions.
    """
    data = request.data
    try:
        AnalyticsEvent.objects.create(
            event_type=data.get('event_type', 'page_view'),
            page_path=data.get('page_path', '/'),
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT'),
            metadata=data.get('metadata')
        )
    except Exception as e:
        pass
    return Response({'success': True})

