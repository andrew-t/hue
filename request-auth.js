const config = require('./config.json').lights,
	http = require('http'),
	{ get } = require('./util');

function requestAuthorization(retries = 5) {
	const req = http.request({
		hostname: config.host,
		method: 'POST',
		path: '/api'
	}, res => {
		if (res.statusCode >= 300) {
			console.error('Error.', res.statusCode);
		} else {
			resData(res).then(data => {
				console.log('Auth accepted.');
				console.log('Body:', data);
			}, err => {
				if (err.code == 101) {
					if (retries) {
						console.warn('Failed; retrying');
						setTimeout(() => requestAuthorization(retries - 1),
							config.requestAuthRetryTime);
					} else
						console.error('Error', err.message);
				}
			});
		}
	});

	req.on('error', e => {
		console.error('Error', e);
	});

	const body = JSON.stringify({
		devicetype: config.deviceType
	});
	console.log(body);
	req.write(body);

	req.end();
}

// requestAuthorization(config.requestAuthRetries);
