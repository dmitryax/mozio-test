$(window).load(function () {

    var mapOptions = {
            center: new google.maps.LatLng(24.886436490787712, -70.2685546875),
            zoom: 5,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        },
        map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions),

        infowindow = new google.maps.InfoWindow({ map: map, title: "Uluru (Ayers Rock)" }),

        updateInfowindow = function (coords, companies) {
            if (companies.length) {
                content = "<b>Area is serving by:</b><br />" + companies.join('<br />');
            } else {
                content = "<b>There is no any supplier available here";
            }

            infowindow.open(map);
            infowindow.setPosition(coords);
            infowindow.setContent(content);
        },

        clickHandler = function (e) {
            query_data = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng()
            }
             $.ajax({
                url: getSuppliersUrl,
                data: query_data,
                success: function (data) {
                    if (!data.error) {
                        updateInfowindow(e.latLng, data.data.companies)
                    }

                }
            });
        };

        infowindow.close();
        google.maps.event.addListener(map, 'click', clickHandler);
});