const on = { on: true },
	off = { on: false };
Object.freeze(on);
Object.freeze(off);

module.exports = {
	// payload generators
	hsl, rgb, white, dim,
	// canned payloads
	on, off,
	// day/night settings
	dayness, appropriateState
}

const colTemp = require('./color-temperature');

function dim(brightness) {
	return hsl(0, 0, brightness);
}

// hue is 0..360; others are 0..1
function hsl(hue, saturation, lightness) {
	// console.log(hue, saturation, lightness)
	if (!lightness)
		return off;
	return {
		on: true,
		hue: cycle(65535, Math.round(hue * 65535 / 360)),
		sat: clamp(0, 255, Math.round(saturation * 255)),
		bri: clamp(0, 255, Math.round(lightness * 255))
	};
}

// params are 0..1
function rgb(red, green, blue) {
	red = clamp(0, 1, red);
	green = clamp(0, 1, green);
	blue = clamp(0, 1, blue);
	// https://www.rapidtables.com/convert/color/rgb-to-hsl.html
	const cMax = Math.max(red, green, blue),
		cMin = Math.min(red, green, blue),
		chroma = cMax - cMin;
	if (!chroma)
		return hsl(0, 0, cMax);
	let hue;
	if (cMax == red)
		hue = ((green - blue) / chroma) % 6;
	else if (cMax == green)
		hue = ((blue - red) / chroma) + 2;
	else if (cMax == blue)
		hue = ((red - green) / chroma) + 4;
	const lightness = (cMax + cMin) / 2;
	// not 100% this is right but it seems to work better:
	// i think Hue's API defines RGB(1,1,1-ε) as hsl(0,ε,1)
	// but this hsl reference defines it at hsl(0,1,1-ε)
	return hsl(
		hue * 60,
		chroma, // / (1 - Math.abs(2 * lightness - 1)),
		cMax // lightness
	);
}

function white(temp = 65000, brightness = 1) {
	const { red, green, blue } = colTemp(temp);
	//console.log('rgb', red, green, blue);
	const payload = rgb(red, green, blue);
	payload.bri = clamp(0, 255, Math.round(payload.bri * brightness));
	return payload;
}

// put('/groups/0/action', { on: true }).then(console.log, console.error)

function clamp(min, max, value) {
	if (value < min)
		return min;
	if (value > max)
		return max;
	return value;
}

function cycle(max, value) {
	value %= max;
	if (value < 0)
		value += max;
	return value;
}

function dayness(n) {
	return white(n * 60000 + 10000, n * 0.8 + 0.2)
}

function appropriateState() {
	const h = (Date.now() % 86400000) / 3600000;
	if (h >= 23 || h <= 4) return dayness(0);
	if (h <= 22 && h >= 6) return dayness(1);
	if (h > 12) return dayness(h - 22);
	else return dayness(3 - h / 2);
}
