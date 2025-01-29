from django.shortcuts import render
from rest_framework.views import APIView
from .models import Event
from rest_framework.response import Response
from .serializer import EventSerializer
# Create your views here.


class EventView(APIView):
    def get(self, request):
        output = [
            {
                "id": event.id,
                "name": event.name,
                "start": event.start,
                "end": event.end
            }
            for event in Event.objects.all()
        ]
        return Response(status=200, data=output)

    def post(self, request):

        data = request.data.get('events')
        for event in data:
            serializer = EventSerializer(data=event)
            if serializer.is_valid(raise_exception=True):
                serializer.save()
            else:
                return Response(data=serializer.errors)
        return Response(status=200)
