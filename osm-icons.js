var _ = require('underscore'),
	presets = require('iD/data/presets/presets.json'),
	fs = require('fs');

var icons = {};
for(var key in presets) {
	icons[key] = presets[key].icon;
}

fs.writeFileSync('src/js/osm-icons.json', JSON.stringify(icons));