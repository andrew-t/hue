const { listen, listenAndSet } = require('./util'),
	states = require('../states');

module.exports = function dayNight(app) {
	listenAndSet(app, '/day', req => day);
	listenAndSet(app, '/night', req => night);
	listenAndSet(app, '/smart-on', req => appropriatePreset());

	listen(app, '/smart-toggle', async (req, res) => {
		if (await req.lights.isOn())
			await req.lights.turnOff();
		else
			await req.lights.set(appropriatePreset());
	});
}

const day = states.white(70000, 1),
	night = states.white(10000, 0.2);
function appropriatePreset() {
	const h = new Date().getHours();
	return (h >= 22 || h <= 4) ? night : day;
}
