module.exports.piggyback = function piggyback(p) {
	let promise = null;
	return function piggybackedFunction() {
		if (!promise) {
			promise = p.call(this);
			promise.then(() => promise = null);
		}
		return promise;
	};
};
