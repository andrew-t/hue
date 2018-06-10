module.exports = async (req, res, next) => {
	if (!req.query.if)
		return next();

	let ok = true;

	for (const condition of Array.isArray(req.query.if) ? req.query.if : [ req.query.if ])
		if (ok) switch (condition) {
			case 'on':
				ok = await req.lights.isOn();
				break;
			case 'off':
				ok = !await req.lights.isOn();
				break;
			default:
				next(new Error('bad if: ' + condition));
				return;
		}

	if (ok)
		next();
	else {
		res.status(204);
		res.end();
	}
};
