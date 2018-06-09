const config = require('./config.json').lights,
	http = require('http');

// http://blog.ef.net/2012/11/02/philips-hue-api.html

module.exports = { get, put };

function get(path) {
	return new Promise((resolve, reject) => {
		const req = http.request({
			hostname: config.host,
			method: 'GET',
			path: `/api/${config.key}${path}`
		}, res => {
			if (res.statusCode >= 300)
				reject(new Error('HTTP ' + res.statusCode));
			else
				resData(res).then(resolve, reject);
		});
		req.on('error', reject);
		req.end();
	});
}

function put(path, payload) {
	return new Promise((resolve, reject) => {
		const req = http.request({
			hostname: config.host,
			method: 'PUT',
			path: `/api/${config.key}${path}`
		}, res => {
			if (res.statusCode >= 300)
				reject(new Error('HTTP ' + res.statusCode));
			else
				resData(res).then(resolve, reject);
		});
		req.on('error', reject);
		const body = JSON.stringify(payload);
		console.log(path, body);
		req.write(body);
		req.end();
	});
}

async function resData(res) {
	const body = await resBody(res);
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

function resBody(res) {
	return new Promise((resolve, reject) => {
		let body = '';
		res.on('data', chunk => body += chunk);
		res.on('end', () => resolve(body));
	});
}
