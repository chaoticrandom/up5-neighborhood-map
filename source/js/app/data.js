var up5 = up5 || { }; //Udacity project5 namespace

//initial data object
//each place relates to one category and one subcategory
up5.initialData = { Places: [
			{	placeId: 1, placeName: 'Museum of Edinburgh',
				category: {	id: 1, name: 'Culture & Entertainment'},
        subcategory: {id: 1, categoryId: 1, name: 'museum'},
				lat: 55.951399, lng: -3.179439
			},
			{	placeId: 2,	placeName: 'Edinburgh Museum of Childhood',
				category: {	id: 1, name: 'Culture & Entertainment'},
        subcategory: {id: 1, categoryId: 1, name: 'museum'},
				lat: 55.950417, lng: -3.185566
			},
			{	placeId: 3, placeName: 'Scottish National Gallery',
				category: {	id: 1, name: 'Culture & Entertainment'},
        subcategory: {id: 2, categoryId: 1, name: 'gallery'},
				lat: 55.950925,	lng: -3.195689
			},
      {	placeId: 4, placeName: "People's Story Museum",
				category: {	id: 1, name: 'Culture & Entertainment'},
        subcategory: {id: 1, categoryId: 1, name: 'museum'},
				lat: 55.951499,	lng: -3.179872
			},
      { placeId: 5, placeName: 'Scott Monument',
				category: {	id: 3, name: 'Tourism'},
        subcategory: {id: 3, categoryId: 3, name: 'monument'},
				lat: 55.952386,	lng: -3.193283
      },
      { placeId: 6, placeName: 'Edinburgh Castle',
				category: {	id: 3, name: 'Tourism'},
        subcategory: {id: 4, categoryId: 3, name: 'castle'},
				lat: 55.948592,	lng: -3.199927
      },
      { placeId: 7, placeName: 'St. Giles Cathedral',
				category: {	id: 4, name: 'Cult & Religion'},
        subcategory: {id: 5, categoryId: 4, name: 'cathedral'},
				lat: 55.949469,	lng: -3.190893
      },
      { placeId: 8, placeName: 'Motel One Edinburgh-Royal',
				category: {	id: 2, name: 'Hotels & Restaurants'},
        subcategory: {id: 6, categoryId: 2, name: 'hotel'},
				lat: 55.950721,	lng: -3.191493
      },
      { placeId: 9, placeName: 'Motel One Edinburgh-Princes',
				category: {	id: 2, name: 'Hotels & Restaurants'},
        subcategory: {id: 6, categoryId: 2, name: 'hotel'},
				lat: 55.953377,	lng: -3.190219
      },
      { placeId: 10, placeName: 'The Elephant House',
				category: {	id: 2, name: 'Hotels & Restaurants'},
        subcategory: {id: 7, categoryId: 2, name: 'cafe'},
				lat: 55.947554, lng: -3.191869
      },
      { placeId: 11, placeName: 'Scottish National Portrait Gallery',
				category: {	id: 1, name: 'Culture & Entertainment'},
        subcategory: {id: 2, categoryId: 1, name: 'gallery'},
				lat: 55.955506,	lng: -3.193737
      },
      { placeId: 12, placeName: 'Scottish National Gallery of Modern Art Two',
				category: {	id: 1, name: 'Culture & Entertainment'},
        subcategory: {id: 2, categoryId: 1, name: 'gallery'},
				lat: 55.951801, lng: -3.224249
      },
      { placeId: 13, placeName: 'Scottish National Gallery of Modern Art One',
				category: {	id: 1, name: 'Culture & Entertainment'},
        subcategory: {id: 2, categoryId: 1, name: 'gallery'},
				lat: 55.950822, lng: -3.227704
      },
      { placeId: 14, placeName: 'Greyfriars Kirkyard',
				category: {	id: 4, name: 'Cult & Religion'},
        subcategory: {id: 8, categoryId: 4, name: 'cemetary'},
				lat: 55.947140, lng: -3.192837
      },
      { placeId: 15, placeName: 'National Museum of Scotland',
        category: {	id: 1, name: 'Culture & Entertainment'},
        subcategory: {id: 1, categoryId: 1, name: 'museum'},
				lat: 55.946966, lng: -3.190874
      },
      { placeId: 16, placeName: 'Nelson Monument',
        category: {	id: 3, name: 'Tourism'},
        subcategory: {id: 3, categoryId: 3, name: 'monument'},
				lat: 55.954417, lng: -3.182654
      },
      { placeId: 17, placeName: 'Old Calton Burial Ground',
				category: {	id: 4, name: 'Cult & Religion'},
        subcategory: {id: 8, categoryId: 4, name: 'cemetary'},
				lat: 55.953543, lng: -3.185969
      },
      { placeId: 18, placeName: "Arthur's Seat",
        category: {	id: 3, name: 'Tourism'},
        subcategory: {id: 9, categoryId: 3, name: 'panoramic view'},
				lat: 55.944079, lng: -3.161835
      },
      { placeId: 19, placeName: "Edinburgh Zoo",
        category: {	id: 1, name: 'Culture & Entertainment'},
        subcategory: {id: 10, categoryId: 1, name: 'zoo'},
				lat: 55.943340, lng: -3.269866
      },
      { placeId: 20, placeName: "Viva Mexico",
        category: {	id: 2, name: 'Hotels & Restaurants'},
        subcategory: {id: 11, categoryId: 2, name: 'restaurant'},
				lat: 55.950694, lng: -3.189544
      },
      { placeId: 21, placeName: "Maxies",
        category: {	id: 2, name: 'Hotels & Restaurants'},
        subcategory: {id: 11, categoryId: 2, name: 'restaurant'},
				lat: 55.948612, lng: -3.194487
      },
      { placeId: 22, placeName: "Malt Shovel Inn",
        category: {	id: 2, name: 'Hotels & Restaurants'},
        subcategory: {id: 11, categoryId: 2, name: 'restaurant'},
				lat: 55.950659, lng: -3.190683
      },
      { placeId: 23, placeName: "Maggie Dicksons",
        category: {	id: 2, name: 'Hotels & Restaurants'},
        subcategory: {id: 11, categoryId: 2, name: 'restaurant'},
				lat: 55.947957, lng: -3.195035
      },
      { placeId: 24, placeName: "Wellington Coffee",
        category: {	id: 2, name: 'Hotels & Restaurants'},
        subcategory: {id: 7, categoryId: 2, name: 'cafe'},
				lat: 55.953662, lng: -3.197588
      },
      { placeId: 25, placeName: "Has Beans",
        category: {	id: 2, name: 'Hotels & Restaurants'},
        subcategory: {id: 7, categoryId: 2, name: 'cafe'},
				lat: 55.950849, lng: -3.183124
      },
      { placeId: 26, placeName: "Frankenstein",
        category: {	id: 2, name: 'Hotels & Restaurants'},
        subcategory: {id: 12, categoryId: 2, name: 'bar'},
				lat: 55.947383, lng: -3.191781
      },
      { placeId: 27, placeName: "Dropkick Murphys Edinburgh",
        category: {	id: 2, name: 'Hotels & Restaurants'},
        subcategory: {id: 12, categoryId: 2, name: 'bar'},
				lat: 55.947889, lng: -3.191387
      },
      { placeId: 28, placeName: "Premier Inn Edinburgh",
        category: {	id: 2, name: 'Hotels & Restaurants'},
        subcategory: {id: 6, categoryId: 2, name: 'hotel'},
				lat: 55.951033, lng: -3.203961
      },
      { placeId: 29, placeName: "The Balmoral Hotel",
        category: {	id: 2, name: 'Hotels & Restaurants'},
        subcategory: {id: 6, categoryId: 2, name: 'hotel'},
				lat: 55.953124, lng: -3.189693
      },
      { placeId: 30, placeName: "St. Mary's Cathedral",
        category: {	id: 4, name: 'Cult & Religion'},
        subcategory: {id: 5, categoryId: 4, name: 'cathedral'},
				lat: 55.948513, lng: -3.216331
      },
      { placeId: 31, placeName: "Lauriston Castle",
        category: {	id: 3, name: 'Tourism'},
        subcategory: {id: 4, categoryId: 3, name: 'castle'},
				lat: 55.971157, lng: -3.278464
      },
      { placeId: 32, placeName: "Edinburgh Dungeon",
        category: {	id: 1, name: 'Culture & Entertainment'},
        subcategory: {id: 13, categoryId: 1, name: 'attraction'},
				lat: 55.951117, lng: -3.190911
      },
      { placeId: 33, placeName: "Our Dynamic Earth",
        category: {	id: 1, name: 'Culture & Entertainment'},
        subcategory: {id: 13, categoryId: 1, name: 'attraction'},
				lat: 55.950688, lng: -3.174751
      },
      { placeId: 34, placeName: "Camera Obscura & World of Illusions",
        category: {	id: 1, name: 'Culture & Entertainment'},
        subcategory: {id: 13, categoryId: 1, name: 'attraction'},
				lat: 55.948925, lng: -3.195770
      },
      { placeId: 35, placeName: "Scottish Parliament Building",
        category: {	id: 3, name: 'Tourism'},
        subcategory: {id: 14, categoryId: 3, name: 'parliament'},
				lat: 55.951971, lng: -3.175573
      }
	]
};
