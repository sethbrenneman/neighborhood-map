"use-strict";

var map;

var infoWindow;

var locations = [];

// each location contains:
// --a title
// --lat / lng coordinates
// --a foursquare id
// --an array of keywords to filter by
// --a boolean to keep track of visibility

locations = [{
    title: "Wisconsin Capitol",
    location: {
      lat: 43.074676,
      lng: -89.384130
    },
    id: "4b141851f964a520369d23e3",
    filters: ["historic", "recreational"]
  },
  {
    title: "Picnic Point",
    location: {
      lat: 43.08972120000001,
      lng: -89.41543000000001
    },
    id: "4fd1320ae4b0e16f019d6252",
    filters: ["recreational"]
  },
  {
    title: "The Old Fashioned",
    location: {
      lat: 43.076153,
      lng: -89.383526
    },
    id: "4afcc582f964a520bc2522e3",
    filters: ["restaurant"]
  },
  {
    title: "Madison Children's Museum",
    location: {
      lat: 43.076790285220824,
      lng: -89.38442207631435
    },
    id: "4c00441837850f473508983f",
    filters: ["recreational"]
  },
  {
    title: "Overture Center for the Arts",
    location: {
      lat: 43.0745936,
      lng: -89.38825659999998
    },
    id: "4b086ebbf964a520c50b23e3",
    filters: ["historic", "recreational"]
  },
  {
    title: "Camp Randall Stadium",
    location: {
      lat: 43.06994,
      lng: -89.4126943
    },
    id: "4b15507ff964a520b0b023e3",
    filters: ["sports", "historic"]
  },
  {
    title: "Breese Stevens Field",
    location: {
      lat: 43.08283663244908,
      lng: -89.37286327824701
    },
    id: "4c2169399a67a593e6ffda87",
    filters: ["sports"]
  },
  {
    title: "Monona Terrace Community and Convention Center",
    location: {
      lat: 43.0717708,
      lng: -89.38030779999997
    },
    id: "4b4a10e8f964a520807926e3",
    filters: ["restaurant", "recreational"]
  },
  {
    title: "Memorial Union Terrace",
    location: {
      lat: 43.07634887787908,
      lng: -89.39991474151611
    },
    id: "4a96dd50f964a520432720e3",
    filters: ["restaurant", "recreational"]
  },
  {
    title: "Machinery Row Bicycles",
    location: {
      lat: 43.0759009,
      lng: -89.3749823
    },
    id: "4bb66cc62ea19521cda6ab2f",
    filters: ["sports", "recreational"]
  },
  {
    title: "Olbrich Botanical Gardens",
    location: {
      lat: 43.09239340786083,
      lng: -89.33572651446806
    },
    id: "4b55ea91f964a5204bf627e3",
    filters: ["historic", "recreational"]
  },
  {
    title: "Brittingham Boats",
    location: {
      lat: 43.063569430221854,
      lng: -89.39115310768813
    },
    id: "51b26286498e94a1a295312d",
    filters: ["recreational"]
  },
  {
    title: "Plaka Taverna",
    location: {
      lat: 43.075654,
      lng: -89.37727899999999
    },
    id: "4b6321b2f964a52057652ae3",
    filters: ["restaurant"]
  }
];


locations.forEach(function(element) {
  element.visible = ko.observable(true);
});

var viewModel = function() {
  self = this;
  // keep track of whether or not to show the dropdown menu
  self.showDropdown = ko.observable(false);
  // keep track of the currently selected location
  self.currentlySelected = ko.observable(null);

  self.locations = ko.observableArray(locations);

  self.toggleDropdown = function() {
    self.showDropdown(!self.showDropdown());
  };

  self.filter = function(category, data) {
    self.locations().forEach(function(element) {
      // set each element's visible property based on category clicked
      element.visible(element.filters.includes(category) || category == 'all');

      // if the currently selected location was removed by the filter, clear currentlySelected
      if (!element.visible() && self.currentlySelected() == element) {
        self.setSelected(null);
      }
    });

    // markers need to be updated
    renderMarkers();
  };

  self.setSelected = function(element) {

    // change the current selection to the element
    if (self.currentlySelected() != element) {
      self.currentlySelected(element);
    }

    // if the element clicked IS the current selection, set the current selection to null
    else {
      self.currentlySelected(null);
    }

    // updated markers
    renderMarkers();
  };
};



ko.applyBindings(new viewModel());

var initMap = function() {

  map = new google.maps.Map(document.getElementById("map"), {
    center: {
      lat: 43.074685,
      lng: -89.38418
    },
    zoom: 14
  });

  infoWindow = new google.maps.InfoWindow();

  self.locations().forEach(function(element) {
    var marker = new google.maps.Marker({
      position: element.location,
      title: element.title,
      map: map
    });
    marker.addListener('click', function() {
      self.setSelected(element);
    });
    element.marker = marker;
  });
};

var mapErrorHandler = function() {
  $("#map").html("<div class=\"map-error\">Your map could not load due to an error!  See browser console for details.");
};

var renderMarkers = function() {
  // remove infoWindow if no locations are selected
  if (!self.currentlySelected()) {
    infoWindow.close();
  }

  self.locations().forEach(function(element) {
    // locations that are not visible have their markers removed
    if (!element.visible()) {
      element.marker.setMap(null);
    }

    // locations that are visible are added to the map if they are not already there
    else {
      if (!element.marker.getMap()) {
        element.marker.setMap(map);
      }
    }

    // the currently selected location gets its marker animated and infoWindow populated
    if (self.currentlySelected() == element) {
      infoWindow.open(map, element.marker);
      populateInfoWindow(element);
      element.marker.setAnimation(google.maps.Animation.BOUNCE);
    } else {
      element.marker.setAnimation(null);
    }
  });
};

var populateInfoWindow = function(element) {
  var url = "https://api.foursquare.com/v2/venues/" + element.id + "?client_id=TBMEZ3VIKYRD1G1V3SOKNVVQEZJLMMPWX4Y3GEV5XTHDWEBV&client_secret=5SC5VPLHUOFPUF0U4ZWZMCZTHWWJ1XDEQAIS2YVZNRAIEBDU&v=20180109";
  $.ajax({
    type: "GET",
    dataType: "jsonp",
    cache: false,
    url: url,
    success: function(data) {
      // on successful api call, populate infoWindow with name, address, phone and an image
      if (data.meta.code == 200) {
        var venue = data.response.venue;
        var content = "<div class=\"min-info\">Information courtesy of Foursquare</div>";
        content += "<div class=\"venue-name\">" + venue.name + "</div>";
        content += "<div class=\"venue-address\"> Address: ";
        venue.location.formattedAddress.forEach(function(item) {
          if (item != "United States") {
            content += "<div>" + item + "</div>";
          }
        });
        if (venue.contact.formattedPhone) {
          content += "</div><div class=\"venue-phone\"> Phone: " + venue.contact.formattedPhone + "</div>";
        } else {
          content += "</div><div class=\"venue-phone\"> Phone: N/A</div>";
        }
        content += "<img src=\"" + venue.bestPhoto.prefix + "200x200" + venue.bestPhoto.suffix + "\">";
        content += "<br><a href=\"" + venue.shortUrl + "\">" + venue.name + "</a>";
        infoWindow.setContent(content);
      }
      // let user know if foursquare could not retrieve data
      else {
        infoWindow.setContent("Unfortunately, additional info could not be successfully retrieved.  Error code: " + data.meta.code);
      }
    },
    error: function(jqXHR) {
      // let user know if api call failed
      infoWindow.setContent("Unfortunately, additional info could not be successfully retrieved.  API call failed.  Error code: " + jqXHR.status);
    }
  });
};