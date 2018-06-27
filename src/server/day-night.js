const { listen, listenAndSet } = require('./util'),
	states = require('../states');

module.exports = function dayNight(app) {
	listenAndSet(app, '/day', req => states.dayness(1));
	listenAndSet(app, '/night', req => states.dayness(0));
	listen(app, '/smart-on', req => req.lights.auto());
	listen(app, '/smart-toggle', req => req.lights.autoToggle());
}
