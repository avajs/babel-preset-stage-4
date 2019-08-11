'use strict';
module.exports = (api, options) => {
	const transformModules = !options || options.modules !== false;
	const plugins = require('./plugins/best-match')
		.filter(module => {
			if (transformModules) {
				return true;
			}

			return module !== '@babel/plugin-transform-modules-commonjs' && module !== '@babel/plugin-proposal-dynamic-import';
		})
		.map(module => require(module).default);

	return {plugins};
};
