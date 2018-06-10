const on = { on: true },
	off = { on: false };
Object.freeze(on);
Object.freeze(off);

module.exports = {
	// payload generators
	hsl, rgb, white, dim,
	// canned payloads
	on, off
}

function dim(brightness) {
	return hsl(0, 0, brightness);
}

// hue is 0..360; others are 0..1
function hsl(hue, saturation, lightness) {
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
		delta = cMax - cMin;
	let hue;
	if (!delta)
		hue = 0;
	else if (cMax == red)
		hue = ((green - blue) / delta) % 6;
	else if (cMax == green)
		hue = ((blue - red) / delta) + 2;
	else if (cMax == blue)
		hue = ((red - green) / delta) + 4;
	const lightness = (cMax + cMin) / 2;
	return hsl(
		hue * 60,
		delta ? delta / (1 - Math.abs(2 * lightness - 1)) : 0,
		cMax
	);
}

function white(temp = 65000, brightness = 1) {
	let red, green, blue;

	if (temp <= 66000)
		red = 1;
	else
		red = 1.292936186062745 * Math.pow(temp / 100 - 60, -0.1332047592);

	if (temp <= 66000)
		green = 0.3900815787690196 * Math.log(temp / 100) - 0.6318414437886275;
	else
		green = 1.129890860895294 * Math.pow(temp / 100 - 60, -0.0755148492);

	if (temp >= 66000)
		blue = 1;
	else if (temp <= 19000)
		blue = 0;
	else
		blue = 0.543206789110196 * Math.log(temp / 100 - 10) - 1.19625408914;

	// console.log('rgb', red, green, blue);
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
