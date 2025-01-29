from rest_framework import serializers
from .models import Event
from django.db.models import Q


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['id', 'name', 'start', 'end']

    start = serializers.DateTimeField()
    end = serializers.DateTimeField()

    def validate(self, data):
        start = data.get('start')
        end = data.get('end')
        if start > end:
            raise serializers.ValidationError(
                "Start date must be before end date"
            )
        same_day_events = Event.objects.filter(
            Q(start__date=start.date()) | Q(end__date=end.date())
        )
        if same_day_events.filter(
                    Q(start__time=start.time()) |
                    Q(end__time=end.time())
                    ).exists() or same_day_events.filter(
                        Q(start__time__lte=start.time()) &
                        Q(end__time__gte=start.time())
                    ).exists() or same_day_events.filter(
                        Q(start__time__lte=end.time()) &
                        Q(end__time__gte=end.time())
                    ).exists():
            raise serializers.ValidationError(
                detail={'error': "Two events cannot happen at the same time"}
            )

        return data
