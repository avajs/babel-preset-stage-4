'use strict';
const process = require('process'); // eslint-disable-line node/prefer-global/process

function getClosestVersion() {
	if (!process.versions.v8) {
		// Assume compatibility with Node.js 8.9.4
		return 'v8-6.1';
	}

	const v8 = parseFloat(process.versions.v8);
	if (v8 >= 6.6) {
		return 'v8-6.6';
	}

	if (v8 >= 6.2) {
		return 'v8-6.2';
	}

	return 'v8-6.1';
}

module.exports = require(`./${getClosestVersion()}.json`);
