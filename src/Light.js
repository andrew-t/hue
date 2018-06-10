const { piggyback } = require('./util'),
	states = require('./states');

class Light {
	constructor(luxcaster, id, data) {
		this.id = id;
		this.luxcaster = luxcaster;
		this.name = data.name;
	}

	matches(name) {
		return (name == this.id) ||
			(this.name.toLowerCase() == name.toLowerCase());
	}

	async isOn() {
		const state = (await this.getState()).state;
		return state.on && state.bri > 0;
	}

	set(payload) {
		return this.luxcaster.http.put(
			`/lights/${this.id}/state`, payload);
	}

	turnOn() {
		return this.set(states.on);
	}
	turnOff() {
		return this.set(states.off);
	}

	async toggle() {
		if (await this.isOn())
			await this.turnOff();
		else await this.turnOn();
	}
}

Light.prototype.getState = piggyback(function () {
	return this.luxcaster.http.get(`/lights/${this.id}`);
});

module.exports = Light;
