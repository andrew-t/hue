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
		const state = states.appropriateState();
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
