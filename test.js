/* eslint-disable import/no-dynamic-require */
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
	['4.7.2', null, './plugins/4.json'],
	['5.10.1', null, './plugins/4.json'],
	['6.9.4', null, './plugins/6.json'],
	['7.4.0', null, './plugins/6.json'],
	['8.3.0', null, './plugins/v8-6.0.json'],
	['8.9.4', '6.1.534.50', './plugins/v8-6.0.json'],
	['9.0.0', '6.2.414.32-node.8', './plugins/v8-6.2.json'],
	// TODO: Set actual version once 6.3 ships in Node.js
	['10.0.0', '6.3.something', './plugins/v8-6.3.json']
]) {
	test(buildsCorrectPreset, node, v8, mapping);
}

test('@babel/plugin-transform-modules-commonjs can be disabled', t => {
	const {plugins} = buildPreset('8.9.4', '6.1.534.50', {modules: false});
	t.false(new Set(plugins).has(require('@babel/plugin-transform-modules-commonjs').default));
});
