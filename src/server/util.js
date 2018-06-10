function listen(app, path, handler) {
	app.get(path, async (req, res, next) => {
		try {
			await handler(req, res);
			res.status(204);
			res.end();
		} catch (e) {
			next(e);
		}
	});
}

function listenAndSet(app, path, getState) {
	listen(app, path, async (req, res) => {
		await req.lights.set(await getState(req));
	});
}

// note: '%' is '%25' in a URL
function asNumber(input) {
	if (/%$/.test(input))
		return parseFloat(input) / 100;
	return parseFloat(input);
}

function errorHandler(error, req, res, next) {
	res.status(400);
	res.set('content-type')
	res.send(error.stack);
	res.end();
}

function logger(req, res, next) {
	console.log(req.method, req.path, req.query);
	next();
}

module.exports = {
	listen,
	listenAndSet,
	asNumber,
	errorHandler,
	logger
};
