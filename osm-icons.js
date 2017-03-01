var _ = require('underscore'),
	presets = require('iD/data/presets/presets.json'),
	fs = require('fs');

var icons = {};
for(var key in presets) {
	for(var cat in presets[key]) {
		if(presets[key][cat].icon) {
			icons[cat] = presets[key][cat].icon;
		}
	}
}

fs.writeFileSync('src/js/osm-icons.json', JSON.stringify(icons));
