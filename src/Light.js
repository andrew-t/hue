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
		checkAndUpdateSoon();
		return this.luxcaster.http.put(`/lights/${this.id}/state`, state);

		function checkAndUpdateSoon() {
			setTimeout(() => {
				this.getState().then(actual => {
					if (actual.on == state.on &&
						actual.bri == state.bri &&
						actual.hue == state.hue &&
						actual.sat == state.sat)
							return this.autoOn();
					else console.log('Cancelling auto for', this.name, state, actual);
				})
				.catch(error => {
					console.error('Error updating auto light', this.name, error);
					checkAndUpdateSoon();
				});
			}, this.luxcaster.config.autoInterval || 60000);
		}
	}
}

Light.prototype.getState = piggyback(function () {
	return this.luxcaster.http.get(`/lights/${this.id}`);
});

module.exports = Light;
