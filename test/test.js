import fs from 'fs';
import {spawn} from 'child_process';
import test from 'ava';
import pathExists from 'path-exists';

process.chdir(__dirname);

test.serial('generate screenshot', function (t) {
	t.plan(2);

	var cp = spawn('../cli.js', ['yeoman.io', '320x240'], {
		stdio: [process.stdin, null, null]
	});

	cp.on('close', function () {
		t.assert(pathExists.sync('yeoman.io-320x240.png'));

		fs.unlink('yeoman.io-320x240.png', function (err) {
			t.ifError(err);
		});
	});
});

// test('generate screenshots from a list of screen resolutions', t => {
// 	const read = fs.createReadStream('fixture.txt');
// 	const cp = spawn('../cli.js', ['yeoman.io']);

// 	cp.on('close', function () {
// 		t.true(pathExists.sync('yeoman.io-1440x900.png'));
// 		t.true(pathExists.sync('yeoman.io-1280x1024.png'));
// 		t.true(pathExists.sync('yeoman.io-768x1024.png'));
// 		fs.unlinkSync('yeoman.io-1440x900.png');
// 		fs.unlinkSync('yeoman.io-1280x1024.png');
// 		fs.unlinkSync('yeoman.io-768x1024.png');

// 		t.end();
// 	});

// 	read.pipe(cp.stdin);
// });

// test('remove temporary files on cancel', t => {
// 	t.plan(1);

// 	const cp = spawn('../cli.js', ['yeoman.io', '320x240'], {
// 		stdio: [process.stdin, null, null]
// 	});

// 	cp.on('exit', function () {
// 		const files = fs.readdirSync(__dirname);

// 		t.true(files.indexOf('yeoman.io-320x240.png') === -1);
// 	});

// 	setTimeout(function () {
// 		cp.kill('SIGINT');
// 	}, 500);
// });

// test('show error if no url is specified', function (t) {
// 	t.plan(1);

// 	var cp = spawn('../cli.js', ['320x240'], {
// 		stdio: [process.stdin, null, null]
// 	});

// 	cp.stderr.setEncoding('utf8');
// 	cp.stderr.on('data', function (data) {
// 		t.assert(/Specify a url/.test(data), data);
// 	});
// });

// test('use 1366x768 as default resolution', function (t) {
// 	t.plan(2);

// 	var cp = spawn('../cli.js', ['yeoman.io'], {
// 		stdio: [process.stdin, null, null]
// 	});

// 	cp.on('close', function () {
// 		t.assert(pathExists.sync('yeoman.io-1366x768.png'));

// 		fs.unlink('yeoman.io-1366x768.png', function (err) {
// 			t.assert(!err, err);
// 		});
// 	});
// });

// test('generate screenshots using keywords', function (t) {
// 	t.plan(2);

// 	var cp = spawn('../cli.js', ['yeoman.io', 'iphone5s'], {
// 		stdio: [process.stdin, null, null]
// 	});

// 	cp.on('close', function () {
// 		t.assert(pathExists.sync('yeoman.io-320x568.png'));

// 		fs.unlink('yeoman.io-320x568.png', function (err) {
// 			t.assert(!err, err);
// 		});
// 	});
// });

// test('show help screen', function (t) {
// 	t.plan(1);

// 	var cp = spawn('../cli.js', ['--help']);

// 	cp.stdout.setEncoding('utf8');
// 	cp.stdout.on('data', function (data) {
// 		console.log(data);

// 		t.assert(/Capture screenshots of websites in various resolutions./.test(data), data);
// 	});

// 	cp.stderr.on('data', function (data) {
// 		console.log(data);
// 	});

// 	cp.on('close', function () {
// 		console.log('closed');
// 	});
// });

// test('show version', function (t) {
// 	t.plan(1);

// 	var cp = spawn('../cli.js', ['--version'], {
// 		stdio: [process.stdin, null, null]
// 	});

// 	cp.stdout.setEncoding('utf8');
// 	cp.stdout.on('data', function (data) {
// 		var regex = new RegExp(require('../package.json').version);
// 		t.assert(regex.test(data), data);
// 	});
// });
