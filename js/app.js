//========= MODEL ============//
//list of some of my favorite Brooklyn spots to eat or see a show.
var defaultPins = [
    {
        title: "Brooklyn Bowl",
        lat: 40.7218813,
        lng: -73.9595887
    },
    {
        title: "Barclay's Center",
        lat: 40.6826976,
        lng: -73.976844
    },
    {
        title: "Melody Lanes Bowling",
        lat: 40.652783,
        lng: -74.0051327
    },
    {
        title: "Music Hall of Williamsburg",
        lat: 40.7191281,
        lng: -73.9639286
    },
    {
        title: "Prospect Park",
        lat: 40.6642882,
        lng: -73.9629868
    },
    {
        title: "Pino's La Forchetta Pizza",
        lat: 40.67127,
        lng: -73.979768
    },
    {
    	title: "Luigi's Pizza",
    	lat: 40.6613891,
    	lng: -73.9919883
    },
    {
    	title: "Brothers Pizza",
    	lat: 40.6626746,
    	lng: -73.9950759
    },
    {
    	title: "Artichoke Basille's Pizza",
    	lat: 40.6809066,
    	lng: -73.9792659
    },
    {
        title: "Giovanni's Brooklyn Eats",
        lat: 40.6683481,
        lng: -73.9754816
    },
    {
        title: "Prime Meats Restaurant",
        lat: 40.6875495,
        lng: -73.9972692
    },
    {
        title: "La Palina Restaurant",
        lat: 40.6109601,
        lng: -73.9810417
    },
    {
    	title: "Royal Palm's Shuffleboard Club",
    	lat: 40.6770025,
    	lng:-73.9889047
    },
    {
    	title: "Ample Hills Creamery",
    	lat: 40.6770385,
    	lng: -74.0038115

    },
    {
    	title: "Sunset Park Diner",
    	lat: 40.6512961,
    	lng: -74.005888
    },
    {
    	title: "Zaytoons Cafe",
    	lat: 40.6812666,
    	lng: -73.9980409
    },
    {
    	title: "Fatty Daddy Tacos",
    	lat: 40.6691746,
    	lng: -73.9888422
    },
    {
    	title: "Rachel's Taqueria",
    	lat: 40.6702137,
    	lng: -73.9854422
    },
    {
    	title: "New Kiku Sushi",
    	lat: 40.6664918,
    	lng: -73.9848066
    },
    {
    	title: "Calexico",
    	lat: 40.6746577,
    	lng: -73.9871771
    },
    {
    	title: "Dinosaur Bar-B-Que",
    	lat: 40.6746988,
    	lng: -73.9872853
    },
    {
    	title: "Luna Park",
    	lat: 40.57291,
    	lng: -73.9809569
    },
    {
    	title: "Nathan's Famous",
    	lat: 40.57291,
    	lng: -73.9809569
    },
    {
    	title: "Coney Island Beach and Boardwalk",
    	lat: 40.57291,
    	lng: -73.9809569
    }
];

openWindows = [];
//============VIEW============//
var map;
var CLIENT_ID = "WRADQOL10MYGJETLNKXVMSPYUC2QVOUSEU5WLF5GGMVUI0H5";
var CLIENT_SECRET = "UH3M5NC5F3OOC14EXZWUYZK1IUBVK2UCRDOQ3JT4Z2WSXH0P";
//location service creates map from the locations in the model
var LocationService = function(data){
    var self = this;
    //define location variables
    this.title = data.title;
    this.url ="";
    this.lat = data.lat;
    this.lng = data.lng;
    this.visible = ko.observable(true);

    //get venue website URL from foursquare
    var foursquare = 'https://api.foursquare.com/v2/venues/search?ll='+ this.lat + ',' + this.lng + '&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET + '&v=20170101' + '&query=' + this.title;
    $.getJSON(foursquare).done(function(data){
        var results = data.response.venues[0];
        self.url = results.url;
        console.log(self);
    }).fail( function(){
        alert("Failed to retrieve data from Foursquare");
    }
    );

    //create and populate google map marker and infowindow with url from foursquare
    this.markerContent = self.url;
    this.infowindow = new google.maps.InfoWindow({
        content: self.markerContent
    });
    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(data.lat, data.lng),
        map: map,
        title: data.title
    });
    //show marker and add listener which shows infowindow
    this.showMarker = ko.computed(function(){
        if(this.visible() === true){
            this.marker.setMap(map);
        } else {
            this.marker.setMap(null);
        }
        return true;
    }, this);
    this.marker.addListener('click', function(){
        for(x = 0; x<openWindows.length; x++) {
            openWindows[x].infowindow.close();
            openWindows[x].marker.setAnimation(null);
        }
        openWindows.push(self);
        self.urlString = "<a href =" + self.url + " target='_blank'>" + self.url + "</a>";
        self.infowindow.setContent(self.urlString);
        self.infowindow.open(map, this);
        
        console.log(openWindows);
        self.marker.setAnimation(google.maps.Animation.BOUNCE);
    });
    this.openMarker = function(place){
        google.maps.event.trigger(self.marker, 'click');
    };
};

//======ViewModel======//

function ViewModel() {
    var self = this;
    this.searchText = ko.observable("");
    this.locationList = ko.observableArray([]);
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: {lat: 40.6826976, lng: -73.976844}
    });
    defaultPins.forEach(function(locationItem){
        self.locationList.push(new LocationService(locationItem));
    });
    //filter pins and list items based on user text input
    this.filteredPins = ko.computed(function(){
        var filterString = self.searchText();
        if(filterString){
            //if the user has typed input, filter out locations with titles which do not contain the input text
            return ko.utils.arrayFilter(self.locationList(), function(locationItem){
            var locationTitle = locationItem.title;
            //create boolean variable indicating whether a location title contains the input text
            var boolean = (locationTitle.search(filterString) >= 0);
            //display locations with titles containing the input text
            locationItem.visible(boolean);
            return boolean;
            });
        } else {
            //if the user has not input text, show all locations
            self.locationList().forEach(function(locationItem){
                locationItem.visible(true);
            });
            return self.locationList();
        }
        
    });
}

function callback() {
    ko.applyBindings(new ViewModel());
}

function errorHandler(){
    alert("Error retrieving Google Map");
}