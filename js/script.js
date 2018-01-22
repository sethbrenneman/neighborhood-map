var map;

var locations = [];

function showDropdown() {
  document.getElementById("dropdown-menu").classList.toggle("show");
}

locations = [
  {title: "Wisconsin Capitol", location: {lat: 43.074676, lng: -89.384130}, id: "4b141851f964a520369d23e3", filters: ["historic", "recreational"]},
  {title: "Picnic Point", location: {lat: 43.08972120000001, lng: -89.41543000000001}, id: "4fd1320ae4b0e16f019d6252", filters: ["recreational"]},
  {title: "The Old Fashioned", location: {lat:43.076153, lng:-89.383526}, id: "4afcc582f964a520bc2522e3", filters: ["restaurant"]},
  {title: "Madison Children's Museum", location: {lat: 43.076790285220824, lng: -89.38442207631435}, id: "4c00441837850f473508983f", filters: ["recreational"]},
  {title: "Overture Center for the Arts", location: {lat: 43.0745936, lng: -89.38825659999998}, id: "4b086ebbf964a520c50b23e3", filters: ["historic", "recreational"]},
  {title: "Camp Randall Stadium", location: {lat: 43.06994, lng: -89.4126943}, id: "4b15507ff964a520b0b023e3", filters: ["sports", "historic"]},
  {title: "Breese Stevens Field", location: {lat: 43.08283663244908, lng: -89.37286327824701}, id: "4c2169399a67a593e6ffda87", filters: ["sports"]},
  {title: "Monona Terrace Community and Convention Center", location: {lat: 43.0717708, lng: -89.38030779999997}, id: "4b4a10e8f964a520807926e3", filters: ["restaurant", "recreational"]},
  {title: "Memorial Union Terrace", location: {lat: 43.07634887787908, lng: -89.39991474151611}, id: "4a96dd50f964a520432720e3", filters: ["restaurant", "recreational"]},
  {title: "Machinery Row Bicycles", location: {lat: 43.0759009, lng: -89.3749823}, id: "4bb66cc62ea19521cda6ab2f", filters: ["sports", "recreational"]},
  {title: "Olbrich Botanical Gardens", location: {lat: 43.09239340786083, lng: -89.33572651446806}, id: "4b55ea91f964a5204bf627e3", filters: ["historic", "recreational"]},
  {title: "Brittingham Boats", location: {lat: 43.063569430221854, lng: -89.39115310768813}, id: "51b26286498e94a1a295312d", filters: ["recreational"]},
  {title: "Plaka Taverna", location: {lat: 43.075654, lng: -89.37727899999999}, id: "4b6321b2f964a52057652ae3", filters: ["restaurant"]}
];

locations.forEach(function(element) {
  element.visible = ko.observable(true);
  element.currentlySelected = ko.observable(false);
})

var viewModel = function() {
  self = this;

  self.foursquare = ko.observable();

  self.showDropdown = ko.observable(false);

  self.locations = ko.observableArray(locations);

  self.toggleDropdown = function() {
    self.showDropdown(!self.showDropdown());
  }

  self.filter = function(category, data) {
    // toggle visible observable in each location if it's filter keyword matches the category clicked (or category clicked was 'all')
    for (var i = 0; i < self.locations().length; i++) {
      //set visible to true or false
      self.locations()[i].visible(locations[i].filters.includes(category) || category == 'all');
      //remove / put markers back on map
      if(!self.locations()[i].visible()) {
        self.locations()[i].marker.setMap(null);
      }
      else {
        self.locations()[i].marker.setMap(map);
      }

      //if applying the filter removes the currently selected item, deselect it
      if (!self.locations()[i].visible() && self.locations()[i].currentlySelected()) {
        console.log(self.locations()[i].title);
        console.log("STOPALLANIMATIONS");
        self.locations()[i].currentlySelected(false);
        self.stopAllAnimation();
      }
    }
  };

  self.clearSelection = function() {
    self.locations().forEach(function(element){element.currentlySelected(false)});
  }

  self.setSelected = function(element) {
    if (element.currentlySelected()) {
      self.clearSelection();
    }
    else {
      self.clearSelection();
      element.currentlySelected(true);
    }
    self.toggleMarker(element);
  };

  self.stopAllAnimation = function() {
    self.locations().forEach(function(element) {element.marker.setAnimation(null)});
  }

  self.toggleMarker = function(e) {
    if (!e.marker.getAnimation()) {
      self.stopAllAnimation();
      e.marker.setAnimation(google.maps.Animation.BOUNCE);
    }
    else {
      self.stopAllAnimation();
    }
  };
};



ko.applyBindings(new viewModel());

function initMap() {

    map = new google.maps.Map(document.getElementById("map"), {
    center: {lat: 43.074685, lng: -89.38418},
    zoom: 14
  });

  for(var i = 0; i < locations.length; i++) {
    var marker = new google.maps.Marker({position: locations[i].location, title: locations[i].title, map: map});
    // marker.addListener('click', display(this));
    locations[i].marker = marker;
  }
}


var list = function() {
  $.each(locations, function(i, item) {
    // console.log(locations[i].title);
    var url = "https://api.foursquare.com/v2/venues/search?ll=" + item.location.lat + "," + item.location.lng + "&client_id=GPXNB11D35APIACAZ3AEIB0ULUGCT053LCBYGKJNFFKN51WF&client_secret=J2F0KJ5JV0XUNSNR0DNTDECSTGJBTBRUFZRPSZTNIWGSTRAW&v=20180109"
    $.ajax({
      type: "GET",
      dataType: "jsonp",
      cache: false,
      url: url,
      success: function(data) {
        $.ajax({
          type: "GET",
          dataType: "jsonp",
          cache: false,
          url: "https://api.foursquare.com/v2/venues/" + item.id + "?client_id=GPXNB11D35APIACAZ3AEIB0ULUGCT053LCBYGKJNFFKN51WF&client_secret=J2F0KJ5JV0XUNSNR0DNTDECSTGJBTBRUFZRPSZTNIWGSTRAW&v=20180109",
          success: function(moredata) {
            console.log(i);
            console.log(item.title);
            console.log(data);
            console.log(moredata);
          }
        });
      }
    });
  });
}

// list();