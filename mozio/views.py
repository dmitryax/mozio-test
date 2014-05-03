from handy.ajax import ajax

from django.shortcuts import render
from django.utils import simplejson as json

from .models import Company, Polygon, Vertex


def edit_polygons(request):
    companies = Company.objects.all()
    return render(request, 'edit_polygons.html', {'companies': companies})

@ajax
@ajax.catch(Company.DoesNotExist)
def save_polygons(request):
    try:
        company_id = int(request.POST.get('company_id'))
        polygons_json = request.POST.get('polygons_data')
        polygons = json.loads(polygons_json)
        assert isinstance(polygons, list)
    except (TypeError, ValueError, AssertionError):
        raise ajax.error('wrong_agruments')

    company = Company.objects.get(id=company_id)

    Polygon.objects.filter(company=company).delete()
    for polygon in polygons:
        save_polygon(company, polygon)

    return polygons

@ajax
@ajax.catch(Company.DoesNotExist)
def get_polygons(request):
    try:
        company_id = int(request.GET.get('company_id'))
    except TypeError, ValueError:
        raise ajax.error('wrong_agrument')

    company = Company.objects.get(id=company_id)
    return {'polygons_data': get_polygons_array(company)}


def get_polygons_array(company):
    polygons = Polygon.objects.filter(company=company)
    polygons_array = []
    for polygon in polygons:
        vertices = Vertex.objects.filter(polygon=polygon)
        polygons_array.append([[v.lat, v.lng] for v in vertices])

    return polygons_array


def save_polygon(company, polygon_array):
    polygon = Polygon(company=company)
    polygon.save()
    for i, vertex_data in enumerate(polygon_array):
        Vertex(polygon=polygon, seq_number=i,
               lat=int(vertex_data[0]), lng=int(vertex_data[1])).save()

