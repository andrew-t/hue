const { piggyback } = require('./util'),
	states = require('./states');

class Group {
	constructor(luxcaster, id, data) {
		this.id = id;
		this.luxcaster = luxcaster;
		this.name = data.name;
	}

	matches(name) {
		return (name == this.id) ||
			(this.name.toLowerCase() == name.toLowerCase());
	}

	isOn() {
		return this.anyOn();
	}
	async allOn() {
		const state = (await this.getState()).state;
		return state.all_on;
	}
	async anyOn() {
		const state = (await this.getState()).state;
		return state.any_on;
	}

	set(payload) {
		return this.luxcaster.http.put(
			`/groups/${this.id}/action`, payload);
	}

	turnOn() {
		return this.set(states.on);
	}
	turnOff() {
		return this.set(states.off);
	}

	async toggle() {
		if (await this.anyOn())
			await this.turnOff();
		else await this.turnOn();
	}
}

Group.prototype.getState = piggyback(function () {
	return this.luxcaster.http.get(`/groups/${this.id}`);
});

module.exports = Group;
