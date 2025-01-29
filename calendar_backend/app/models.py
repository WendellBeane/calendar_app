from django.db import models

# Create your models here.


class Event(models.Model):
    name = models.CharField(max_length=100)
    start = models.DateTimeField(db_index=True)
    end = models.DateTimeField(db_index=True)
