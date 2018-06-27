const states = states = require('./states');

// Implementations should add:
// * async autoOn()
// * async isOn()
// * async set(statePayload)

class Lightable {
	constructor(luxcaster, id, data, lightIds) {
		this.luxcaster = luxcaster;
		this.id = id;
		this.name = data.name;
		this.lightIds = lightIds;
	}

	get lights() {
		return this.lightIds.map(id => this.luxcaster.light(id));
	}

	matches(name) {
		return (name == this.id) ||
			(this.name.toLowerCase() == name.toLowerCase());
	}

	turnOn() {
		return this.set(states.on);
	}
	turnOff() {
		return this.set(states.off);
	}

	async toggle() {
		await this.isOn() ? await this.turnOff() : await this.turnOn();
	}
	async autoToggle() {
		await this.isOn() ? await this.turnOff() : await this.autoOn();
	}
}

module.exports = Lightable;
