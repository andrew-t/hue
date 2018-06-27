const states = require('../states'),
	{ listenAndSet, listen, asNumber } = require('./util');

module.exports = function basics(app) {
	listenAndSet(app, '/on', req => states.on);
	listen(app, '/toggle', req => req.lights.toggle());

	listenAndSet(app, '/hsl', req => states.hsl(
		asNumber(req.query.h),
		asNumber(req.query.s),
		asNumber(req.query.l)));

	listenAndSet(app, '/rgb', req => states.rgb(
		asNumber(req.query.r),
		asNumber(req.query.g),
		asNumber(req.query.b)));

	listenAndSet(app, '/white', req => states.white(
		asNumber(req.query.temperature || '65000'),
		asNumber(req.query.brightness || '1')));

	listenAndSet(app, '/dim', req => states.dim(
		asNumber(req.query.brightness || '0.3')));

	listenAndSet(app, '/off', req => states.off);
};
