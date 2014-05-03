from django.db import models

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