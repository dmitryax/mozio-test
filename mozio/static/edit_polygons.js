function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
$.ajaxSetup({
    crossDomain: false, // obviates need for sameOrigin test
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type)) {
            xhr.setRequestHeader("X-CSRFToken", $.cookie('csrftoken'));
        }
    }
});


$(window).load(function () {
    var mapOptions = {
            center: new google.maps.LatLng(24.886436490787712, -70.2685546875),
            zoom: 5,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        },
        map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions),

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
                selectedPolygon.setEditable(false);
                selectedPolygon = null;
            }
        }

        selectShape = function (shape) {
            clearSelection();
            selectedPolygon = shape;
            shape.setEditable(true);
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

            para.append('<b>Polygon</b>').append(list);
            $("#polygonsList").append(para),

            polygons[polygon.__gm_id] = polygon;
            google.maps.event.addListener(polygon, 'click', function() {
                selectShape(polygon);
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

                }
            });
        },

        changeCompany = function () {
            var company_id = $(this).val();
            clearPolygons();

            $.ajax({
                dataType: "json",
                url: getPolygonsUrl,
                data: {'company_id' : company_id},
                success: function (data) {
                    if (!data.error) {
                        createPolygons(data.data.polygons_data);
                    }
                }
            });
        };

        drawingManager.setMap(map);

        google.maps.event.addListener(drawingManager, 'overlaycomplete', function(e) {
            var newPolygon = e.overlay;
            registerPolygon(newPolygon);
            selectShape(newPolygon);
        });

        $('#deleteShapeButton').click(deleteSelectedPolygon);
        $('#saveButton').click(savePolygons);
        $('#companySelect').change(changeCompany).trigger('change');

});