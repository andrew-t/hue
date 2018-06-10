const config = require('../config.json'),
	Luxcaster = require('./Luxcaster'),
	lux = new Luxcaster(config.lights),
	express = require('express'),
	{ errorHandler, logger } = require('./server/util'),
	dayNight = require('./server/day-night'),
	conditions = require('./server/if'),
	which = require('./server/which'),
	basics = require('./server/basics'),
	app = express();

app.use(logger);
app.use(which(lux));
app.use(conditions);
basics(app);
dayNight(app);
app.use(errorHandler);

lux.init().then(() =>
	app.listen(config.server.port, () =>
		console.log(`Listening on port ${config.server.port}`)));
