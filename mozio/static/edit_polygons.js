// CSRF protection
function csrfSafeMethod(method) {
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
$.ajaxSetup({
    crossDomain: false,
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type)) {
            xhr.setRequestHeader("X-CSRFToken", $.cookie('csrftoken'));
        }
    }
});


$(window).load(function () {
    var map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions),

        polygons = {},
        selectedPolygon,

        drawingManager = new google.maps.drawing.DrawingManager({
            drawingMode: google.maps.drawing.OverlayType.POLYGON,
            drawingControl: true,
            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [google.maps.drawing.OverlayType.POLYGON]
            },
            polygonOptions: {
                editable: true
            },
            rectangleOptions: {
                editable: true
            }
        }),

        clearSelection = function () {
            if (selectedPolygon) {
                $('#polygon'+ selectedPolygon.__gm_id).removeClass('active');
                selectedPolygon.setEditable(false);
                selectedPolygon = null;
            }
        }

        selectPolygon = function (polygon) {
            clearSelection();
            selectedPolygon = polygon;
            polygon.setEditable(true);
            $('#polygon'+ selectedPolygon.__gm_id).addClass('active');
        },

        deleteSelectedPolygon = function () {
            if (selectedPolygon) {
                selectedPolygon.setMap(null);
                delete polygons[selectedPolygon.__gm_id]
                $('#polygon'+ selectedPolygon.__gm_id).remove();
            }
        },

        getPolygonsArray = function (shapes) {
            return _.map(shapes, function(shape) {
                return _.map(shape.getPath().getArray(), function(vertex) {
                    return [vertex.lat(), vertex.lng()];
                });
            });
        },

        clearPolygons = function () {
            _.each(polygons, function (polygon) {
                polygon.setMap(null);
            });
            polygons = {};

            $('.polygon-coords').remove();
        },

        showVertex = function (vertex) {
            var decimalPlaces = 5;
            return vertex.lat().toFixed(decimalPlaces) + ", " + vertex.lng().toFixed(decimalPlaces);
        },

        registerPolygon = function (polygon) {
            var vertices = polygon.getPath().getArray(),

                coords = _.map(vertices, function (vertex) {
                    return '<li>' + showVertex(vertex) + '</li>';
                }),
                list = '<ul>' + coords.join('') + '</ul>',
                para = $('<p class="polygon-coords" id="polygon'+ polygon.__gm_id +'"></p>');

            para.append('<b>Polygon#' + polygon.__gm_id + '</b>').append(list);
            $("#polygonsList").append(para),

            polygons[polygon.__gm_id] = polygon;
            google.maps.event.addListener(polygon, 'click', function() {
                selectPolygon(polygon);
            });

        },

        createPolygons = function (polygons_data) {
            _.each(polygons_data, function (polygon_data) {
                var vertices = _.map(polygon_data, function (vertex) {
                        return new google.maps.LatLng(vertex[0], vertex[1]);
                    }),
                    polygon = new google.maps.Polygon({paths: vertices});

                polygon.setMap(map);
                registerPolygon(polygon);
            });
        },

        savePolygons = function () {
            var company_id = $('#companySelect').val();
                polygons_data = getPolygonsArray(polygons);

            $.ajax({
                type: "POST",
                dataType: "json",
                url: savePolygonsUrl,
                data: {'polygons_data': JSON.stringify(polygons_data),
                       'company_id' : company_id},
                success: function (data) {
                    if (data.success) {
                        $.growl('Data successfully saved!', { type: 'success' });
                    } else {
                        $.growl('Error: ' + data.error, { type: 'danger' });
                    }
                },
                error: function (e, txt, msg) {
                    $.growl('Error: ' + msg, { type: 'danger' });
                }
            });
        },

        changeCompany = function () {
            var company_id = $(this).val();
            clearPolygons();

            if (company_id) {
                $.ajax({
                    dataType: "json",
                    url: getPolygonsUrl,
                    data: {'company_id' : company_id},
                    success: function (data) {
                        if (data.success) {
                            createPolygons(data.data.polygons_data);
                        } else {
                            $.growl('Error: ' + data.error, { type: 'danger' });
                        }
                    },
                    error: function (e, txt, msg) {
                        $.growl('Error: ' + msg, { type: 'danger' });
                    }
                });
            }
        };

        drawingManager.setMap(map);

        google.maps.event.addListener(drawingManager, 'overlaycomplete', function(e) {
            var newPolygon = e.overlay;
            if (newPolygon.getPath().getArray().length > 2) {
                registerPolygon(newPolygon);
                selectPolygon(newPolygon);
            } else {
                newPolygon.setMap(null);
            }
        });

        $('#deleteShapeButton').click(deleteSelectedPolygon);
        $('#saveButton').click(savePolygons);
        $('#companySelect').change(changeCompany);

});