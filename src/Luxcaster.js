const LuxcasterHttp = require('./LuxcasterHttp'),
	Light = require('./Light'),
	Group = require('./Group'),
	{ piggyback } = require('./util');

class Luxcaster {
	constructor(config) {
		this.config = config;
		this.http = new LuxcasterHttp(config);
	}

	async init() {
		const state = await this.getState();
		this.name = state.config.name;

		this.lights = Object.entries(state.lights)
			.map(([ id, light ]) =>
				new Light(this, id, light));

		this.groups = Object.entries(state.groups)
			.map(([ id, group ]) =>
				new Group(this, id, group));

		// This is a special case that seems to be hardcoded:
		this.all = new Group(this, 0, {
			name: 'all',
			lightIds: this.lights.map(light => light.id)
		});
		this.groups.push(this.all);
	}

	light(id) {
		return this.lights.find(light => light.matches(id));
	}
	group(id) {
		return this.groups.find(group => group.matches(id));
	}
}

Luxcaster.prototype.getState = piggyback(function() {
	return this.http.get();
});

module.exports = Luxcaster;
