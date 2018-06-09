const { get } = require('./util'),
	fs = require('fs');

get().then(data =>
	fs.writeFileSync('example.json',
		JSON.stringify(data, null, 2)));
