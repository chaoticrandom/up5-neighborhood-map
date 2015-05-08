//requires: data.js custom-bindings.js

$(function () {
//category constructor function
	up5.Category = function () {
    this.id = ko.observable(); //unique category id
    this.name = ko.observable();
  };
//category to navigation object is used for displaying categories in menu
// it is based on category with addition of several properties
	up5.CategoryToNav = function () {
    var self = this;
		self.id = ko.observable();
    self.name = ko.observable();
		self.isVisible = ko.observable(); //visibility flag
		self.htmlId = ko.pureComputed(function() {
			return 'category-' + this.id(); //used for html id selector name
		}, self);
		self.subcategories = ko.observableArray([]); //array of related "subcategories to navigation"
		//subscription to change related subcategories visibility flags
		self.isVisible.subscribe(function() {
			for (var i = 0; i < self.subcategories().length; i++) {
				self.subcategories()[i].isVisible(self.isVisible());
			}
		});
  };
	up5.CategoryToNav.prototype = new up5.Category();
//subcategory constructor function
	up5.SubCategory = function () {
    this.id = ko.observable(); //unique subcategory id
    this.categoryId = ko.observable(); //foreign key to category table
    this.name = ko.observable();
  };
//subcategory to navigation object is used for displaying subcategories in menu
// it is based on subcategory with addition of several properties
	up5.SubCategoryToNav = function () {
    var self = this;
		self.id = ko.observable();
    self.categoryId = ko.observable(); //each subcategory relates to only one category
    self.name = ko.observable();
		self.htmlId = ko.pureComputed(function() {
			return 'subcategory-' + this.id(); //used for html id selector name
		}, self);
		self.icon = ko.pureComputed(function() {
			//marker image name is based on its subcategory
			//this image path is used to display marker's image in menu
			return this.name() ? 'images/' + this.name().replace(/\s+/g, '') + '-marker.png': '';
		}, self);
		self.isVisible = ko.observable(); //visibility flag
  };
	up5.SubCategoryToNav.prototype = new up5.SubCategory();
//place constructor function
	up5.Place = function() {
		var self = this;
		self.placeId = ko.observable(); //unique place id (usage of id's simulates database structure)
		self.placeName = ko.observable(); // place name
		self.category = ko.observable(); //category object
		self.subcategory = ko.observable(); //subcategory object
		self.lat = ko.observable(); //latitude
		self.lng = ko.observable(); //longtitude
		self.markerCoords = ko.pureComputed(function() {
			//computed google LatLng object
			return new google.maps.LatLng(this.lat(), this.lng());
	    }, self);
		self.icon = ko.pureComputed(function() {
			//computed marker icon path based on subcategory name
			return this.subcategory() ? 'images/' + this.subcategory().name().replace(/\s+/g, '') + '-marker.png' : "";
		}, self);
		self.marker = ko.pureComputed(function() {
			//place's marker is an instance of PlacePin object which is described below
			return new up5.PlacePin(up5.vm.googlemap(), this.markerCoords(), this.placeName(), this.icon()).placeId(this.placeId());
		}, self);
		//when infowindow is opened it displays start message and allows user to choose desirable info
		//by clicking on corresponding button, only one button's state could be "true" at a time
		//this behaviour simulates tabs within infowindow
		self.fsInfoState = ko.observable(false); //state of Foursquare Card button in infowindow
		self.fsPhotosState = ko.observable(false); //state of Foursquare Photos button in infowindow
		self.wikiState = ko.observable(false); //state of Wikipedia button in infowindow
		self.startMsgState = ko.pureComputed(function() {
			//computed state of start message which is displayed when all buttons states are "false"
			var state = this.fsInfoState() + this.fsPhotosState() + this.wikiState();
			return !state;
		}, self);
		//ajax errors object
		self.apiErrors = ko.observable({
			fsSearch: ko.observable(null), //Foursquare search query errors
			fsInfo: ko.observable(null), //Foursquare venue query errors
			fsPhotos: ko.observable(null), //Foursquare venue's photos query errors
			wikiSearch: ko.observable(null), //Wikipedia search query errors
			wikiQuery: ko.observable(null) //wikipedia description query errors
		});
		//app searches Foursquare for list of suggested Places
		self.fsSearchResult = ko.observable(); //Foursquare search query result
		//then, app queries top result of previous search from Foursquare venue search
		self.fsInfo = ko.observable(); //Foursquare venue query result
		//then, app queries photos of previous search result
		self.fsPhotos = ko.observable(); //Foursquare venue's photos query result
		//computed array of assembled 300*300 photo urls
		self.fsPhotosFiltered = ko.pureComputed(function() {
			if (typeof self.fsPhotos() !== 'undefined'){
				var photoList = [];
				var photos = self.fsPhotos().response.photos.items;
				for(var i=0; i < photos.length; i++) {
					var photoPath = ko.observable(photos[i].prefix + '300x300' + photos[i].suffix);
					photoList.push(photoPath);
				}
				return photoList;
			}
		});
		//computed photo which is used as a Foursquare Card photo
		//taken from response's "bestPhoto" property
		self.fsTitlePhoto = ko.computed(function() {
			if (typeof self.fsInfo() !== 'undefined'){
				var bestPhoto = self.fsInfo().response.venue.bestPhoto;
				return bestPhoto.prefix + '300x300' +	bestPhoto.suffix;
			}
			else
				return false;
		});
		self.wiki = ko.observable(); //Wikipedia search result
		//state subscriptions are necessary for "tabbed" behaviour of infowindow display buttons
		self.fsInfoState.subscribe(function() {
			if (self.fsInfoState())	{
				self.fsPhotosState(false);
				self.wikiState(false);
			}
		});
		self.fsPhotosState.subscribe(function() {
			if (self.fsPhotosState()) {
				self.fsInfoState(false);
				self.wikiState(false);
			}
		});
		self.wikiState.subscribe(function() {
			if (self.wikiState()) {
				self.fsInfoState(false);
				self.fsPhotosState(false);
			}
		});
		//subscription to trigger ajax venue request of top search result
		//if Foursquare search result exists
		self.fsSearchResult.subscribe(function() {
			if (typeof self.fsSearchResult() !== 'undefined') {
				up5.vm.getFoursquareInfo(self);
			}
		});
		//subscription to trigger ajax photots request of venue
		//if Foursquare venue result exists
		self.fsInfo.subscribe(function() {
			if (typeof self.fsInfo() !== 'undefined') {
				up5.vm.getFoursquarePhotos(self);
			}
		});
	};
//placepin constructor
	up5.PlacePin = function Marker(map, coords, title, icon) {
		var self = this;
		self.markerObj = ko.computed(function() { //google marker object
			var marker =  new google.maps.Marker({
		  	position: coords,
				title: title,
				icon: new google.maps.MarkerImage(icon, null, null, null, new google.maps.Size(32, 37)),
				animation: google.maps.Animation.DROP
			});
			return marker;
		});
		self.initialPos = coords; //is used to restore marker's position after reverse marker animation
		self.placeId = ko.observable();
		self.isVisible = ko.observable(false); //visibility flag
		//subscription to show/hide marker if visibility flag is changed
		self.isVisible.subscribe(function(currentState) {
		  if (currentState) {
		    self.markerObj().setAnimation(google.maps.Animation.DROP);
				self.markerObj().setPosition( self.initialPos );
				self.markerObj().setMap(map);
		  } else {
				self.removeMarkerWithAnimation(map, self.markerObj());
		  }
		});
	};
//custom reverse marker animation
	up5.PlacePin.prototype.removeMarkerWithAnimation = function (mymap, marker){
		(function animationStep(){
				//Converting GPS to World Coordinates
				var newPosition = mymap.getProjection().fromLatLngToPoint(marker.getPosition());
				//Moving 35px to up
				newPosition.y -= 35 / (1 << mymap.getZoom());
				//Converting World Coordinates to GPS
				newPosition = mymap.getProjection().fromPointToLatLng(newPosition);
				//updating maker's position
				marker.setPosition( newPosition );
				//Checking whether marker is out of bounds
				if( mymap.getBounds().getNorthEast().lat() < newPosition.lat() ){
						marker.setMap(null);
				}
				else {
						//Repeating animation step
						setTimeout(animationStep,10);
				}
		})();
	};
//viewmodel
	up5.vm = function() {
		var
			metadata = {
				pageTitle: 'Project#5 @Udacity Front End Web Developer NanoDegree',
				personal: {
						author: 'Vladimir Yussupov',
						vendorlibs: [
							'Knockout JS',
							'JQuery',
							'InfoBubble',
							'Semantic UI'
						]
				}
			},
			mapContainer = document.getElementById('map-canvas'),
			//Google map options object
			mapOptions = {
				center: {lat: 55.958513, lng: -3.216331},
				zoom: 12,
				mapTypeControl: true,
				mapTypeControlOptions: {
					style: google.maps.MapTypeControlStyle.DEFAULT,
        	position: google.maps.ControlPosition.RIGHT_BOTTOM,
					mapTypeIds: [
						google.maps.MapTypeId.ROADMAP,
						google.maps.MapTypeId.SATELLITE
					]
				},
				zoomControl: true,
				zoomControlOptions: {
					style: google.maps.ZoomControlStyle.SMALL,
					position: google.maps.ControlPosition.RIGHT_TOP
				},
				streetViewControl: true,
				streetViewControlOptions: {
					position: google.maps.ControlPosition.RIGHT_TOP
				},
				styles: [
					{
						featureType: "poi",
						stylers: [
						{ visibility: "off" }
						]
					}
				]
			},
			//Foursquare config object
			foursquareConfig = {
				apiUrl: 'https://api.foursquare.com/',
				searchQ: 'v2/venues/search',
				venueQ: 'v2/venues/',
				client_id: '?client_id=RQZBTVDEWNFSFDSVVLBEEUWBTXFKPIVCH3EUBNE1UNYLEK55',
				client_secret: '&client_secret=ORLCOGGR1WU53EI2DC0MLRBLKNJY5PVCJKIEKN5QKPC3P3I4',
				version: '&v=20140806&m=foursquare'
			},
			//InfoBubble object is used as a replacement for standard Google infowindow object
			infowindow = new InfoBubble({
	      content: document.getElementById("infowindow"),
	      shadowStyle: 1,
				minWidth: 340,
				maxWidth: 351,
				minHeight: 350,
				maxHeight: 470,
	      padding: 10,
				hideCloseButton: true,
	      arrowSize: 10,
	      borderWidth: 0,
	      disableAutoPan: false,
	      arrowPosition: 30,
	      arrowStyle: 2
    	}),
			//computed google maps object
			googlemap = ko.computed(function() {
				var mapObject = new google.maps.Map(mapContainer, mapOptions);
				//listener for map to react on browser resize
				google.maps.event.addDomListener(window, "resize", function() {
					var center = mapObject.getCenter();
					google.maps.event.trigger(mapObject, "resize");
					mapObject.setCenter(center);
				});
				//listener to hide UI elements if map was clicked
				google.maps.event.addListener(mapObject, 'click', function() {
					infowindow.close();
					$('#places-selection').removeClass('active visible');
					$( '#places-selection-mobile' ).removeClass('active visible');
					$('#places-list').css("display", "none");
					$('#categories-selection')
						.dropdown('hide');
					$( '#categories-selection' ).removeClass('active visible');
					$('#accordion').css( "display", "none");
					$( '#categories-selection-mobile' ).removeClass('active visible');
				});
				return mapObject;
			}),
			//array for raw places data
			places = ko.observableArray([]),
			//computed places lookup object allows to select place by its id as placeLookupObj[id]
			placeLookupObj = ko.pureComputed(function() {
				var lookup = {};
				for (var i = 0, len = places().length; i < len; i++) {
					lookup[places()[i].placeId()] = places()[i];
				}
				return lookup;
			}),
			selectedPlace = ko.observable(), //currently selected place
			//computed array of distinct categories for menu
			//each category includes list of distinct related subcategories
			categories = ko.pureComputed(function() {
				var lookup = {};
				var items = places();
				var subcategories = [];
				var result = [];
				var i, id, name, categoryId;
				for (i = 0; i < items.length; i++) {
					id = items[i].subcategory().id();
					categoryId = items[i].subcategory().categoryId();
					name = items[i].subcategory().name();
					if (!(id in lookup)) {
						lookup[id] = 1;
						subcategories.push(new up5.SubCategoryToNav()
							.id(id)
							.categoryId(categoryId)
							.name(name)
							.isVisible(true)
						);
					}
				}
				lookup = {};

				for (i = 0; i < items.length; i++) {
					id = items[i].category().id();
					name = items[i].category().name();
					categoryId = items[i].subcategory().categoryId();
					var subcategoryId = items[i].subcategory().id();
					var subcategoryName = items[i].subcategory().name();
					if (!(id in lookup)) {
						lookup[id] = 1;
						result.push(new up5.CategoryToNav()
							.id(id)
							.name(name)
							.isVisible(true)
							.subcategories([])
						);
					}
				}
				subcategories.sort(sortCategory);
				for (i = 0; i < result.length; i++) {
					for (var j = 0; j < subcategories.length; j++) {
						if (result[i].id() === subcategories[j].categoryId()) {
							result[i].subcategories().push(subcategories[j]);
						}
					}
				}

				return result.sort(sortCategory);
			}),
			//computed array of places to show based on visibility flags of categories / subcategories
			placesToShow = ko.pureComputed(function () {
				var subcategoryIdList = [];
				for (var i = 0; i < categories().length; i++) {
					for (var j = 0; j < categories()[i].subcategories().length; j++) {
						if (categories()[i].subcategories()[j].isVisible())
							subcategoryIdList.push(categories()[i].subcategories()[j].id());
					}
				}
				return ko.utils.arrayFilter(places(), function (p) {
          return (subcategoryIdList.indexOf(p.subcategory().id()) > -1);
        }).sort(sortPlaces);
			}),
			//computed array of markers
			markers = ko.pureComputed(function() {
				var result = [];
				for (var i = 0; i < places().length; i++) {
					result.push(places()[i].marker());
				}
				//function to add click event listener for marker
				//on click event: infowindow opens, selectedPlace variable changes
				//and google map pans to marker position
				var addListener = function(marker) {
					google.maps.event.clearListeners(marker.markerObj(), 'click');
					google.maps.event.addListener(marker.markerObj(), 'click', function() {
						infowindow.open(googlemap(), marker.markerObj());
						selectPlace(placeLookupObj()[marker.placeId()]);
						googlemap().panTo(marker.markerObj().getPosition());
					});
				};

				for (var j = 0; j < result.length; j++) {
					addListener(result[j]);
				}
				return result;
			}),
			//user's search filter variable
			filter = ko.observable(''),
			//paged computed array of filtered places
			//paged function described in custom-bindings.js
			filteredItems = ko.computed(function() {
				var f = filter().toLowerCase();
				if (!f) {
				return placesToShow();
				} else {
					return ko.utils.arrayFilter(placesToShow(), function(item) {
					return (ko.utils.stringStartsWith(item.placeName().toLowerCase(), f)) ||
									(item.placeName().toLowerCase().indexOf(f) > -1);
					});
				}
			}).paged(5),
			//select place function
			//when place is selected - init Foursquare primary search and Wikipedia search
			selectPlace = function(p) {
				selectedPlace(p);
				searchFoursquare(p);
				getWikiDescription(p);
      },
			//select place from UI, opens infowindow and controls UI behaviour
			selectPlaceFromUI = function(p) {
				infowindow.open(googlemap(), p.marker().markerObj());
				selectPlace(p);
				googlemap().panTo(p.marker().markerObj().getPosition());
				$('#places-selection').removeClass('active visible');
				$( '#places-selection-mobile' ).removeClass('active visible');
				$('#places-list').css("display", "none");
			},
			//private places sort function
			sortPlaces = function (a, b) {
				if (a.placeName().toLowerCase() < b.placeName().toLowerCase())
					return -1;
				if (a.placeName().toLowerCase() > b.placeName().toLowerCase())
					return 1;
				return 0;
      },
			//private categories sort function
			sortCategory = function (a,b) {
				if (a.name().toLowerCase() < b.name().toLowerCase())
					return -1;
				if (a.name().toLowerCase() > b.name().toLowerCase())
					return 1;
				return 0;
			},
			//load initial data to places() observable array
			loadPlaces = function() {
				var temp = [];
				$.each(up5.initialData.Places, function (i, p) {
					temp.push(new up5.Place()
										.placeId(p.placeId)
										.placeName(p.placeName)
										.category(new up5.Category()
                      .id(p.category.id)
                      .name(p.category.name))
										.subcategory(new up5.SubCategory()
	                    .id(p.subcategory.id)
	                    .categoryId(p.category.id)
	                    .name(p.subcategory.name))
										.lat(p.lat)
										.lng(p.lng)
					);
				});
				//push all data to observable array at once
				places(temp);
				temp = undefined;
			},
			//this function is used to control categories / subcategories visibility
			//it is bound to checkboxes click event to show/hide markers of chosen category / subcategory
			applyVisibility = function() {
				var visiblePlacesIdList = ko.utils.arrayMap(placesToShow(), function(item) {
						return item.placeId();
				});
				//function to apply delay for visibility changed
				//this behaviour allows to show / hide markers one by one
				var toggleVisibility = function(param, val, delay) {
					setTimeout(function() {
						param(val);
					}, delay);
				};
				for (var i = 0; i < markers().length; i++) {
					if (visiblePlacesIdList.indexOf(markers()[i].placeId()) > -1) {
						toggleVisibility(markers()[i].isVisible, true, 20*i);
					}
					else {
						toggleVisibility(markers()[i].isVisible, false, 20*i);
					}
				}
			},
			//primary Foursquare search function
			searchFoursquare = function(place) {
				//search place by its name and lat/lng, proximity - 1000 meters
				//show only two results
				var query = foursquareConfig.apiUrl + foursquareConfig.searchQ + foursquareConfig.client_id + foursquareConfig.client_secret + '&ll=' + place.lat() + ',' + place.lng() + '&query='+ place.placeName() + '&limit=2&radius=1000' + foursquareConfig.version;
				var curPlace = places()[places().indexOf(place)];
				//request data if search result for this place isn't exist or result was unsuccessful
				if ((!curPlace.fsSearchResult()) || (curPlace.fsSearchResult().meta.code !== 200)) {
					$.ajax({
						dataType: "json",
						url: query,
						processData: false,
						success: function(data) { //if success
							data.receiveTime = Date.now(); //save receive time
							places()[places().indexOf(place)].fsSearchResult(data); //save data to fsSearchResult()
							places()[places().indexOf(place)].apiErrors().fsSearch(null); //clear errors
						},
						timeout: 5000 //request timeout = 5 seconds
					}).fail( function( xhr, status ) {
						if( status == "timeout" ) {
							//request time exceeds timeout - save error message
							places()[places().indexOf(place)].apiErrors().fsSearch('Request timeout: Failed to search through Foursquare venues, please check your network connection and retry search later.');
						}
						else {
							//if failure - save error message
							places()[places().indexOf(place)].apiErrors().fsSearch('Request error: Failed to search through Foursquare venues, please check your network connection and retry search later.');
						}
					});
				}
				//if search result for this place exists or result was successful
				else {
					//check time difference between last teceive time and now
					//if it's less than 10 minutes - do not trigger another request and use existing info
					//else - trigger another request with the same as above failure handling logic
					var timeDif = (Date.now() - curPlace.fsSearchResult().receiveTime) / 1000;
					if (timeDif > 600) {
						$.ajax({
							dataType: "json",
							url: query,
							processData: false,
							success: function(data) {
								data.receiveTime = Date.now();
								places()[places().indexOf(place)].fsSearchResult(data);
								places()[places().indexOf(place)].apiErrors().fsSearch(null);
							},
							timeout: 5000
						}).fail( function( xhr, status ) {
							if( status == "timeout" ) {
								places()[places().indexOf(place)].apiErrors().fsSearch('Request timeout: Failed to search through Foursquare venues, please check your network connection and retry search later.');
							}
							else {
								places()[places().indexOf(place)].apiErrors().fsSearch('Request error: Failed to search through Foursquare venues, please check your network connection and retry search later.');
							}
						});
					}
					else
						console.log('Too early to update');
				}
			},
			//Foursquare specific venue search function
			//is triggered when primary Foursquare search was successfully completed
			getFoursquareInfo = function(place) {
				var fsResponse = places()[places().indexOf(place)].fsSearchResult().response.venues;
				//if primary search's resulting array isn't empty
				if (fsResponse.length) {
					//search for venue which was first in primary search's resulting array
					var placeQuery = foursquareConfig.apiUrl + foursquareConfig.venueQ + fsResponse[0].id +
								foursquareConfig.client_id + foursquareConfig.client_secret + foursquareConfig.version;
					$.ajax({
						dataType: "json",
						url: placeQuery,
						processData: false,
						success: function(data) {
							data.receiveTime = Date.now(); //save data receive time
							places()[places().indexOf(place)].fsInfo(data); //save data to fsInfo()
							places()[places().indexOf(place)].apiErrors().fsInfo(null); //clear api errors
						},
						timeout: 5000 //timeout = 5 seconds
					}).fail( function( xhr, status ) {
						//same logics for error handling as in previous function
						if( status == "timeout" ) {
							places()[places().indexOf(place)].apiErrors().fsInfo('Request timeout: Failed to search suggested venue information, please check your network connection and retry search later.');
						}
						else {
							places()[places().indexOf(place)].apiErrors().fsInfo('Request error: Failed to search suggested venue information, please check your network connection and retry search later.');
						}
					});
				}
			},
			//search photos for Foursquare venues
			//this function is triggered when Foursquare venue search was successfully completed
			getFoursquarePhotos = function(place) {
				var fsResponse = places()[places().indexOf(place)].fsInfo().response.venue;
				//if venue search object exists
				if (fsResponse) {
					//search photos of this venue, show only 16 photos
					var photoQuery = foursquareConfig.apiUrl + foursquareConfig.venueQ + fsResponse.id +
						'/photos' + foursquareConfig.client_id + foursquareConfig.client_secret + '&group=venue&limit=16' + foursquareConfig.version;
					$.ajax({
						dataType: "json",
						url: photoQuery,
						processData: false,
						success: function(data) { //similar logic as in previous Foursquare functions
							data.receiveTime = Date.now();
							places()[places().indexOf(place)].fsPhotos(data);
							places()[places().indexOf(place)].apiErrors().fsPhotos(null);
						},
						timeout: 5000
					}).fail( function( xhr, status ) {
						if( status == "timeout" ) {
							places()[places().indexOf(place)].apiErrors().fsPhotos("Request timeout: Failed to search suggested venue's photos, please check your network connection and retry search later.");
						}
						else {
							places()[places().indexOf(place)].apiErrors().fsPhotos("Request error: Failed to search suggested venue's photos, please check your network connection and retry search later.");
						}
					});
				}
			},
			//search through Wikipedia API
			getWikiDescription = function(place) {
				//capitalize place's name for Wikipedia query
				var placeName = place.placeName().replace(/\w\S*/g, function(txt) {
					return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
				});
				//encode spaces in place's name
				var searchPlace = encodeURIComponent(placeName);
				//search for place using its name
				//returns array of suggested places with last revision timestamp and
				//title snippet for each place
				//title snippet has indication of searchmatch for every word in place's name
				//I use this information to calculate suggested result
				var search = 'https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&srsearch=' + searchPlace + '&srprop=timestamp%7Ctitlesnippet&continue=&callback=?';
				//array for search results
				var searchArray = [];
				//array for suggested links to display in infowindow
				var suggestedLinks = [];
				$.ajax({
					dataType: "json",
					url: search,
					processData: false,
					success: function(data) { //if success
						searchArray = data.query.search;
						places()[places().indexOf(place)].apiErrors().wikiSearch(null); //clear api errors
						var max = 0;
						var title = '';
						var lastModified;
						//assemble Wikipedia links from search results and push them to array
						for (var i = 0; i < searchArray.length; i++) {
							suggestedLinks.push({
								url: 'http://en.wikipedia.org/wiki/' + encodeURIComponent(searchArray[i].title),
								title: searchArray[i].title
							});
							//count search matches
							var count = (searchArray[i].titlesnippet.match(/searchmatch/g) || []).length;
							if (count > max) {
								max = count;
								title = searchArray[i].title;
								lastModified = searchArray[i].timestamp;
							}
							//save search mathes for each result
							searchArray[i].matchCount = count;
						}
						//query extracts property from Wikipedia
						//title contains best search match from search results
						var query = 'https://en.wikipedia.org/w/api.php?format=json&action=query&titles=' + encodeURIComponent(title) + '&prop=extracts&exintro&explaintext&callback=?';

						$.ajax({
							dataType: "json",
							url: query,
							processData: false,
							success: function(data) { //if success
								places()[places().indexOf(place)].apiErrors().wikiQuery(null); //clear api errors
								var result = {};
								result.receiveTime = Date.now();
								//if data exists
								if (data.query) {
									for (var page in data.query.pages) {
										result.page = data.query.pages[page];
										//assemble Wikipedia link
										result.page.pageUrl = 'http://en.wikipedia.org/?curid=' + result.page.pageid;
										//save last revision time
										result.page.lastModified = lastModified.replace('T', ', ').replace('Z', '');
										break;
									}
								}
								//if not - save message about "no results.." as an extract to show to a user
								else {
									result.page = {
										extract: 'No matching results with title: "' + placeName + '"'
									};
								}
								//save suggested links array
								result.suggestedLinks = suggestedLinks;
								//save short description to limit the output
								result.page.shortDesc = result.page.extract.substr(0, 375) + '...';
								//save result to wiki()
								places()[places().indexOf(place)].wiki(result);
							},
							timeout: 5000
						}).fail( function( xhr, status ) {
							if( status == "timeout" ) {
								places()[places().indexOf(place)].apiErrors().wikiQuery('Request timeout: Failed to query suggested place description from Wikipedia, please check your network connection and retry search later.');
							}
							else {
								places()[places().indexOf(place)].apiErrors().wikiQuery('Request error: Failed to query suggested place description from Wikipedia, please check your network connection and retry search later.');
							}
						});
					},
					timeout: 5000
				}).fail( function( xhr, status ) {
					if( status == "timeout" ) {
						places()[places().indexOf(place)].apiErrors().wikiSearch('Request timeout: Failed to search suggested places list at Wikipedia, please check your network connection and retry search later.');
					}
					else {
						places()[places().indexOf(place)].apiErrors().wikiSearch('Request error: Failed to search suggested places list at Wikipedia, please check your network connection and retry search later.');
					}
				});
			},
			//initialize Semantic UI components and infowindow
			initUI = function() {
				//desktop navigation
				$('#categories-selection').click(function() {
					$('#places-selection').removeClass('active visible');
					$('#places-list').css("display", "none");
				});
				$('#categories-selection')
					.dropdown({
						action: 'nothing',
						allowCategorySelection: true,
						fullTextSearch: true
					});

				$('#places-selection').click(function() {
					$('#categories-selection')
						.dropdown('hide');
					$( '#categories-selection' ).removeClass('active visible');
					$('#places-list').css( "display", function() {
			  		return $(this).css("display") === 'none' ? 'block' : 'none';
					});
					$('#places-selection').toggleClass("active");
					$('#places-filter').val('');
					up5.vm.filter('');
				});

				//mobile navigation
				$('#categories-selection-mobile').click(function() {
					$( '#places-selection-mobile' ).removeClass('active visible');
					$('#places-list').css("display", "none");
					$('#accordion').css( "display", function() {
			  		return $(this).css("display") === 'none' ? 'inline-block' : 'none';
					});
					$('#categories-selection-mobile').toggleClass("active");
				});

				$('#places-selection-mobile').click(function() {
					$('#accordion').css( "display", "none");
					$( '#categories-selection-mobile' ).removeClass('active visible');
					$('#places-list').css( "display", function() {
						return $(this).css("display") === 'none' ? 'block' : 'none';
					});
					$('#places-selection-mobile').toggleClass("active");
					$('#places-filter').val('');
					up5.vm.filter('');
				});

				$('#accordion')
			  .accordion({
					exclusive: false,
					animateChildren: false,
					duration: 200,
					selector: {
			      trigger: '.title .icon'
			    }
				});

				$('#infowindow').css('display', 'block');
			};
			return {
          metadata: metadata,
					googlemap: googlemap,
					infowindow: infowindow,
          places: places,
					placeLookupObj: placeLookupObj,
					selectedPlace: selectedPlace,
					selectPlace: selectPlace,
					selectPlaceFromUI: selectPlaceFromUI,
          loadPlaces: loadPlaces,
					categories: categories,
					placesToShow: placesToShow,
					markers: markers,
					filter: filter,
					filteredItems: filteredItems,
					applyVisibility: applyVisibility,
					searchFoursquare: searchFoursquare,
					getFoursquareInfo: getFoursquareInfo,
					getFoursquarePhotos: getFoursquarePhotos,
					getWikiDescription: getWikiDescription,
					initUI: initUI
      };
	}();
	//add listener once when google map is loaded
	google.maps.event.addListenerOnce(up5.vm.googlemap(), 'tilesloaded', function(){
		up5.vm.loadPlaces(); //load initial data
		ko.applyBindings(up5.vm);	//apply bindings
		up5.vm.initUI();	//initialize UI
	});
});
