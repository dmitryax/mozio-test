from django.db import models

# Didgits number for databese point(lat/lng) representation
POINT_ACCURACY = 0

class Company(models.Model):
    name = models.CharField(max_length=200)

    def __str__(self):
        return self.name

class Polygon(models.Model):
    company = models.ForeignKey(Company)

class Vertex(models.Model):
    polygon = models.ForeignKey(Polygon)
    seq_number = models.IntegerField('Sequence number')
    lat = models.FloatField('Latitude')
    lng = models.FloatField('Longitude')


class Point(models.Model):
    """Point in cache square table representing companies' service area"""
    lat = models.DecimalField(max_digits=POINT_ACCURACY+3, decimal_places=POINT_ACCURACY)
    lng = models.DecimalField(max_digits=POINT_ACCURACY+3, decimal_places=POINT_ACCURACY)
    company = models.ForeignKey(Company)
