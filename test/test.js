import fs from 'fs';
import {spawn} from 'child_process';
import test from 'ava';
import pathExists from 'path-exists';
import execFile from 'get-exec-file';
import {version as pkgVersion} from '../package.json';

test('generate screenshot', async t => {
	await execFile('../cli.js', ['yeoman.io', '320x240']);

	t.true(pathExists.sync('yeoman.io-320x240.png'));
	fs.unlinkSync('yeoman.io-320x240.png');
});

test.cb('remove temporary files on cancel', t => {
	t.plan(1);

	const cp = spawn('../cli.js', ['yeoman.io', '320x240']);

	cp.on('exit', () => {
		t.false(pathExists.sync('yeoman.io-320x240.png'));
		t.end();
	});

	setTimeout(() => {
		cp.kill('SIGINT');
	}, 500);
});

test('show error if no url is specified', async t => {
	await t.throws(execFile('../cli.js', ['320x240']), /Specify a url/);
});

test('use 1366x768 as default resolution', async t => {
	await execFile('../cli.js', ['yeoman.io']);

	t.true(pathExists.sync('yeoman.io-1366x768.png'));
	fs.unlinkSync('yeoman.io-1366x768.png');
});

test('generate screenshots using keywords', async t => {
	await execFile('../cli.js', ['yeoman.io', 'iphone5s']);

	t.true(pathExists.sync('yeoman.io-320x568.png'));
	fs.unlinkSync('yeoman.io-320x568.png');
});

test('show help screen', async t => {
	const {stdout} = await execFile('../cli.js', ['--help']);

	t.regexTest(/Capture screenshots of websites in various resolutions./, stdout);
});

test('show version', async t => {
	const {stdout} = await execFile('../cli.js', ['--version']);

	t.is(stdout.trim(), pkgVersion);
});
