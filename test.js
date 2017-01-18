/* eslint-disable import/no-dynamic-require */
import test from 'ava';
import proxyquire from 'proxyquire';

const {dependencies} = require('./package.json');
const v4 = require('./plugins/4.json');
const v6 = require('./plugins/6.json');

test('plugins are dependencies', t => {
	const set = new Set(Object.keys(dependencies));

	for (const plugin of v4) {
		t.true(set.has(plugin), `v4 plugin ${plugin}`);
	}
	for (const plugin of v6) {
		t.true(set.has(plugin), `v6 plugin ${plugin}`);
	}
});

function buildsCorrectPreset(t, version, mapping) {
	const buildPreset = proxyquire('./index', {
		process: {
			versions: {
				node: version
			}
		}
	});

	const {plugins} = buildPreset();
	require(mapping).forEach((module, index) => {
		t.true(require(module) === plugins[index], `${module} at index ${index}`);
	});
}
buildsCorrectPreset.title = (_, version) => `builds correct preset for Node.js ${version}`;

for (const [version, mapping] of [
	['4.7.2', './plugins/4.json'],
	['5.10.1', './plugins/4.json'],
	['6.9.4', './plugins/6.json'],
	['7.4.0', './plugins/6.json']
]) {
	test(buildsCorrectPreset, version, mapping);
}
