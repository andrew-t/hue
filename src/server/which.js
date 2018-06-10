module.exports = lux => (req, res, next) => {
	if (req.query.light)
		req.lights = lux.light(req.query.light);
	else if (req.query.group)
		req.lights = lux.group(req.query.group);
	else
		req.lights = lux.all;
	next();
};
