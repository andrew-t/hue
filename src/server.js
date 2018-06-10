const config = require('../config.json'),
	Luxcaster = require('./Luxcaster'),
	lux = new Luxcaster(config.lights),
	states = require('./states'),
	express = require('express'),
	app = express();

function listen(path, handler) {
	app.get(path, async (req, res, next) => {
		try {
			await handler(req, res);
			res.status(204);
			res.end();
		} catch (e) {
			next(e);
		}
	});
}

function listenAndSet(path, getState) {
	listen(path, (req, res) => set(req, getState(req)));
}

app.use((req, res, next) => {
	console.log(req.method, req.path, req.query);
	next();
});

listenAndSet('/on', req => states.on);

listenAndSet('/hsl', req => states.hsl(
	asNumber(req.query.h),
	asNumber(req.query.s),
	asNumber(req.query.l)));

listenAndSet('/rgb', req => states.rgb(
	asNumber(req.query.r),
	asNumber(req.query.g),
	asNumber(req.query.b)));

listenAndSet('/white', req => states.white(
	asNumber(req.query.temperature || '65000'),
	asNumber(req.query.brightness || '1')));

listenAndSet('/dim', req => states.dim(
	asNumber(req.query.brightness || '0.3')));

listenAndSet('/off', req => states.off);

listen('/toggle', async (req, res) => {
	await (getControllable(req).toggle());
});

// more specific things
listenAndSet('/day', req => day);
listenAndSet('/night', req => night);
listenAndSet('/smart-on', req => appropriatePreset());

listen('/smart-toggle', async (req, res) => {
	const c = getControllable(req);
	if (await c.isOn())
		await c.turnOff();
	else
		await set(req, appropriatePreset());
});

const day = states.white(70000, 1),
	night = states.white(20000, 0.2);
function appropriatePreset() {
	const h = new Date().getHours();
	return (h >= 22 || h <= 4) ? night : day;
}

// note: '%' is '%25' in a URL
function asNumber(input) {
	if (/%$/.test(input))
		return parseFloat(input) / 100;
	return parseFloat(input);
}

function getControllable(req) {
	if (req.query.light)
		return lux.light(req.query.light);
	else if (req.query.group)
		return lux.group(req.query.group);
	return lux.all;
}

function set(req, payload) {
	console.log('setting to ', payload);
	return getControllable(req).set(payload);
}

app.use((error, req, res, next) => {
	res.status(400);
	res.set('content-type')
	res.send(error.stack);
	res.end();
});

lux.init().then(() =>
	app.listen(config.server.port, () =>
		console.log(`Listening on port ${config.server.port}`)));
