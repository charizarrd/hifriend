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
	var templateSource = $('#tracks-template').html();
	var template = Handlebars.compile(templateSource);
	var results = $('#results');

	// each playlist
	for (var i = 0; i < playlists.length; i++) {
		// each track
		for (var j = 0; j < playlist_tracks[i].length; j++) {
			var current = playlist_tracks[i][j];
			var name = current.track.name.toLowerCase();
			var album = current.track.album.name.toLowerCase();
			var artists = current.track.artists;
			var match = false;

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
				temp.playlist = playlists[i].name;
				console.log(playlists[i]);
				console.log(playlists[i].name);
				if (current.track.artists.length > 0)
					temp.artists.name = current.track.artists[0].name;
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
				total = data.total;

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
		return;
	});
}
