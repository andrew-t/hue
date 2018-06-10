const http = require('http');

class LuxcasterHttp {
	constructor(config) {
		this.config = config;
	}

	get(path = '/') {
		return new Promise((resolve, reject) => {
			const req = http.request({
				hostname: this.config.host,
				method: 'GET',
				path: `/api/${this.config.key}${path}`
			}, res => {
				if (res.statusCode >= 300)
					reject(new Error('HTTP ' + res.statusCode));
				else
					LuxcasterHttp.resData(res)
						.then(resolve, reject);
			});
			req.on('error', reject);
			req.end();
		});
	}

	put(path, payload) {
		return new Promise((resolve, reject) => {
			const req = http.request({
				hostname: this.config.host,
				method: 'PUT',
				path: `/api/${this.config.key}${path}`
			}, res => {
				if (res.statusCode >= 300)
					reject(new Error('HTTP ' + res.statusCode));
				else
					LuxcasterHttp.resData(res)
						.then(resolve, reject);
			});
			req.on('error', reject);
			const body = JSON.stringify(payload);
			console.log(path, body);
			req.write(body);
			req.end();
		});
	}

	static async resData(res) {
		const body = await LuxcasterHttp.resBody(res);
		const data = JSON.parse(body);
		if (data[0] && data[0].error) {
			console.error(data[0].error);
			const error = new Error(data[0].error.description);
			error.code = data[0].error.type;
			error.address = data[0].error.address;
			throw error;
		}
		return data;
	}

	static resBody(res) {
		return new Promise((resolve, reject) => {
			let body = '';
			res.on('data', chunk => body += chunk);
			res.on('end', () => resolve(body));
		});
	}

	requestAuthorization(retries = 5) {
		const req = http.request({
			hostname: this.config.host,
			method: 'POST',
			path: '/api'
		}, res => {
			if (res.statusCode >= 300)
				console.error('Error.', res.statusCode);
			else
				resData(res).then(data => {
					console.log('Auth accepted.');
					console.log('Body:', data);
				}, err => {
					if (err.code == 101) {
						if (retries) {
							console.warn('Failed; retrying');
							setTimeout(() => this.requestAuthorization(retries - 1),
								config.requestAuthRetryTime);
						} else
							console.error('Error', err.message);
					}
				});
		});

		req.on('error', e => console.error('Error', e));

		const body = JSON.stringify({
			devicetype: this.config.deviceType
		});
		console.log(body);
		req.write(body);

		req.end();
	}
}

module.exports = LuxcasterHttp;
