from django.conf.urls import patterns, include, url

from django.contrib import admin

from mozio import views

admin.autodiscover()

urlpatterns = patterns('',
    url(r'^edit/', views.edit_polygons),
    url(r'^save/', views.save_polygons, name='save_polygons'),
    url(r'^get/', views.get_polygons,  name='get_polygons'),
    url(r'^show/', views.search_map),
    url(r'^find/', views.find_suppliers, name='find_suppliers'),

    url(r'^admin/', include(admin.site.urls)),
)
