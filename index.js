'use strict';
/* eslint-disable import/no-dynamic-require, import/no-unresolved */
const process = require('process');

function getClosestVersion() {
	const version = parseFloat(process.versions.node);
	if (version >= 6) {
		return 6;
	}

	// Node.js 4 is the minimal supported version.
	return 4;
}

function buildPreset() {
	const plugins = require(`./plugins/${getClosestVersion()}.json`)
		.map(module => require(module));

	return {plugins};
}
module.exports = buildPreset;
