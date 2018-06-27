const { piggyback } = require('./util'),
	states = require('./states'),
	Lightable = require('./Lightable');

class Light extends Lightable {
	constructor(luxcaster, id, data) {
		super(luxcaster, id, data, [ id ]);
	}

	async isOn() {
		const state = (await this.getState()).state;
		return state.on && state.bri > 0;
	}

	set(payload) {
		return this.luxcaster.http.put(`/lights/${this.id}/state`, payload);
	}

	autoOn() {
		const state = appropriateState();
		setTimeout(() => this.getState().then(actual => {
			if (actual.on == state.on &&
				actual.bri == state.bri &&
				actual.hue == state.hue &&
				actual.sat == state.sat)
					this.autoOn();
			else console.log('Cancelling auto for', this.name, state, actual);
		}, this.luxcaster.config.autoInterval || 60000);
		return this.luxcaster.http.put(`/lights/${this.id}/state`, state);
	}
}

Light.prototype.getState = piggyback(function () {
	return this.luxcaster.http.get(`/lights/${this.id}`);
});

module.exports = Light;

function dayness(n) {
	return states.white(n * 60000 + 10000, n * 0.8 + 0.2)
}

function appropriateState() {
	const h = (Date.now() % 86400000) / 3600000;
	if (h >= 23 || h <= 4) return dayness(0);
	if (h <= 22 && h >= 6) return dayness(1);
	if (h > 12) return dayness(h - 22);
	else return dayness(3 - h / 2);
}
