const { piggyback } = require('./util'),
	states = require('./states'),
	Lightable = require('./Lightable');

class Group extends Lightable {
	constructor(luxcaster, id, data) {
		super(luxcaster, id, data, data.lights);
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

	autoOn() {
		return Promise.all(this.lights.map(light => light.auto()));
	}
}

Group.prototype.getState = piggyback(function () {
	return this.luxcaster.http.get(`/groups/${this.id}`);
});

module.exports = Group;
