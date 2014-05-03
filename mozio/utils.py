from .models import POINT_ACCURACY, Vertex, Point

def save_polygon_in_table(company, polygon):
    vertices = Vertex.objects.filter(polygon=polygon)
    if not vertices:
        return

    path_length = len(vertices)
    start_point = vertices[0].lat, vertices[0].lng

    def point_inside_polygon(x, y):
        inside = False

        p1x, p1y = start_point
        for i in range(path_length + 1):
            p2x, p2y = vertices[i % path_length].lat, vertices[i % path_length].lng
            if y > min(p1y, p2y):
                if y <= max(p1y, p2y):
                    if x <= max(p1x, p2x):
                        if p1y != p2y:
                            xinters = (y-p1y)*(p2x-p1x)/(p2y-p1y)+p1x
                        if p1x == p2x or x <= xinters:
                            inside = not inside
            p1x, p1y = p2x, p2y

        return inside

    min_lat = min(v.lat for v in vertices)
    max_lat = max(v.lat for v in vertices)
    min_lng = min(v.lng for v in vertices)
    max_lng = max(v.lng for v in vertices)
    step = 1. / 10**POINT_ACCURACY

    for lng in frange(min_lng, max_lng, step):
        for lat in frange(min_lat, max_lat, step):
            if point_inside_polygon(lat + step/2, lng + step/2):
                Point.objects.get_or_create(lat=lat, lng=lng, company=company)

def frange(start, stop, step):
    r = start
    while r < stop:
        yield r
        r += step