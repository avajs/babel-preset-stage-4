import fs from 'fs';
import test from 'ava';
import proxyquire from 'proxyquire';

const {dependencies} = require('./package.json');

test('plugins are dependencies', t => {
	const set = new Set(Object.keys(dependencies));
	for (const file of fs.readdirSync('./plugins')) {
		if (file.endsWith('.json')) {
			for (const plugin of require(`./plugins/${file}`)) {
				t.true(set.has(plugin), `${file} plugin ${plugin}`);
			}
		}
	}
});

const buildPreset = (node, v8, options) => proxyquire('./', {
	'./plugins/best-match': proxyquire('./plugins/best-match', {
		process: {
			versions: {node, v8}
		}
	})
})(null, options);

function buildsCorrectPreset(t, node, v8, mapping) {
	const {plugins} = buildPreset(node, v8);
	require(mapping).forEach((module, index) => {
		t.is(require(module).default, plugins[index], `${module} at index ${index}`);
	});
}

buildsCorrectPreset.title = (_, node) => `builds correct preset for Node.js ${node}`;

for (const [node, v8, mapping] of [
	['not-v8-at-all', null, './plugins/v8-6.1.json'],
	['8.9.4', '6.1.534.50', './plugins/v8-6.1.json'],
	['8.16.0', '6.2.414.77', './plugins/v8-6.2.json'],
	['10.0.0', '6.6.346.24-node.5', './plugins/v8-6.6.json']
]) {
	test(buildsCorrectPreset, node, v8, mapping);
}

test('@babel/plugin-transform-modules-commonjs can be disabled', t => {
	const {plugins} = buildPreset('8.9.4', '6.1.534.50', {modules: false});
	t.false(new Set(plugins).has(require('@babel/plugin-transform-modules-commonjs').default));
});

test('@babel/plugin-proposal-dynamic-import can be disabled', t => {
	const {plugins} = buildPreset('8.9.4', '6.1.534.50', {modules: false});
	t.false(new Set(plugins).has(require('@babel/plugin-proposal-dynamic-import').default));
});
