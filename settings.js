const lights = require('./set-lights');

function dayLights() {
	return lights.all(
		lights.white(90000, 1));
}

function nightLights() {
	return lights.all(
		lights.white(15000, 0.3));
}

function smartLights() {
	const h = new Date().getHours();
	return (h > 20 || h < 6)
		? nightLights()
		: dayLights();
}

function off() {
	return lights.all(lights.off);
}
