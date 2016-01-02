$(document).ready(function() {
	getPlaylists();
	getTracks();

	$('#search-btn').click(function() {
		console.log('hello');
		console.log($('#search-query').val().toLowerCase());
		search($('#search-query').val().toLowerCase())
	});
});

var total = 10;
var playlists = [];
var playlist_tracks = [];

function search(query) {
	var templateSource = $('#tracks-template2').html();
	var template = Handlebars.compile(templateSource);
	var results = $('#results');
	// console.log(query);

	// each playlist
	for (var i = 0; i < playlists.length; i++) {
		// each track
		for (var j = 0; j < playlist_tracks[i].length; j++) {
			var current = playlist_tracks[i][j];
			// console.log(current);
			var name = current.track.name.toLowerCase();
			var album = current.track.album.name.toLowerCase();
			var artists = current.track.artists;
			var match = false;
			// console.log(name);
			// console.log(name.indexOf(query));

			if ((name.indexOf(query) > -1) || (album.indexOf(query) > -1))
				match = true;
			else {
				for (var k = 0; k < artists.length; k++) {
					if (artists[k].name.toLowerCase().indexOf(query) > -1) {
						match = true;
						break;
					}
				}
			}

			if (match) {
				var temp = current.track;
				// console.log(temp);
				temp.playlist = playlists[i].name;
				console.log(playlists[i]);
				console.log(playlists[i].name);
				if (current.track.artists.length > 0)
					temp.artists.name = current.track.artists[0].name;
				// console.log(temp);
				results.append(template(temp));
			}
		}
	}
}

function getTracks() {
	for (var i = 0; i < playlists.length; i++) {
		var current = playlists[i];
		$.when(
			$.ajax({
				url: '/tracks',
				data : {
					playlist_id : current.id,
				},
				dataType: "json",
				async: false,
			
				success: function(data) {
					var tracks = [];
					for (var j = 0; j < data.total; j++) {
						var t = data.items[j];
						tracks.push(t);
					}
					playlist_tracks.push(tracks);
				},

				error: function() {
				  console.log('process error');
				},

			})
		).done(function() {
			// console.log('here');
			return;
		});
	}
}

function getPlaylists() {
	var limit = 10;
	var current = 0;

	while (current < total) {
		getPlaylist(limit, current);
		current = current + limit;
		console.log(current);
		// console.log(total);
	}
}

function getPlaylist(limit, offset) {
	$.when(
		$.ajax({
			url: '/playlists',
			data : {
				limit : limit,
				offset : offset,
			},
			dataType: "json",
			async: false,
		
			success: function(data) {
				// console.log(data);
				total = data.total;
				// console.log(total);
				// console.log('process sucess');
				// showPlaylists(data);

				// add to playlists
				for (var i = 0; i < data.items.length; i++) {
					var p = data.items[i];
					var pattern = /[0-9]+\/[0-9]+/;
					if (!(p.owner.id.localeCompare("charizarrd93"))) {
						if (p.collaborative) {
							if (p.name.search(pattern) >= 0) {
								playlists.push(p);
							}
						}
					}
				}
			},

			error: function() {
			  console.log('process error');
			},

		})
	).done(function() {
		// console.log('here');
		return;
	});
}

function showPlaylists(data) {
	// console.log(data);
	// console.log(data.items);
	// console.log(data.items[0]);
	var num = data.items.length;
	var templateSource = $('#playlist-template').html();
	var template = Handlebars.compile(templateSource);
	var results = $('#playlists');

	for (var i = 0; i < num; i++) {
		var p = data.items[i];
		// console.log(p);
		// console.log(p.name);
		var pattern = /[0-9]+\/[0-9]+/;
		if (!(p.owner.id.localeCompare("charizarrd93"))) {
			if (p.collaborative) {
				if (p.name.search(pattern) >= 0) {
					results.append(template(p));
					playlists.push(p);
				}
			}
		}
	}
}
