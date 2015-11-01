import fs from 'fs';
import {spawn} from 'child_process';
import test from 'ava';
import pathExists from 'path-exists';
import {version as pkgVersion} from '../package.json';

process.chdir(__dirname);

test.serial('generate screenshot', t => {
	const cp = spawn('../cli.js', ['yeoman.io', '320x240']);

	cp.on('close', () => {
		t.assert(pathExists.sync('yeoman.io-320x240.png'));
		fs.unlinkSync('yeoman.io-320x240.png');

		t.end();
	});
});

test('remove temporary files on cancel', t => {
	t.plan(1);

	const cp = spawn('../cli.js', ['yeoman.io', '320x240']);

	cp.on('exit', () => t.false(pathExists.sync('yeoman.io-320x240.png')));

	setTimeout(() => {
		cp.kill('SIGINT');
	}, 500);
});

test('show error if no url is specified', t => {
	t.plan(1);

	const cp = spawn('../cli.js', ['320x240']);

	cp.stderr.setEncoding('utf8');
	cp.stderr.on('data', data => t.regexTest(/Specify a url/, data));
});

test('use 1366x768 as default resolution', t => {
	t.plan(1);

	const cp = spawn('../cli.js', ['yeoman.io']);

	cp.on('close', () => {
		t.true(pathExists.sync('yeoman.io-1366x768.png'));
		fs.unlinkSync('yeoman.io-1366x768.png');
	});
});

test('generate screenshots using keywords', t => {
	t.plan(1);

	const cp = spawn('../cli.js', ['yeoman.io', 'iphone5s']);

	cp.on('close', () => {
		t.true(pathExists.sync('yeoman.io-320x568.png'));
		fs.unlinkSync('yeoman.io-320x568.png');
	});
});

test('show help screen', t => {
	t.plan(1);

	const cp = spawn('../cli.js', ['--help']);

	cp.stdout.setEncoding('utf8');
	cp.stdout.on('data', data => t.regexTest(/Capture screenshots of websites in various resolutions./, data));
});

test('show version', t => {
	t.plan(1);

	const cp = spawn('../cli.js', ['--version']);

	cp.stdout.setEncoding('utf8');
	cp.stdout.on('data', data => t.regexTest(new RegExp(pkgVersion), data));
});
