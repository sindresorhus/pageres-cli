import fs from 'node:fs';
import {spawn} from 'node:child_process';
import {execa, execaCommand} from 'execa';
import test from 'ava';
import {pEvent} from 'p-event';

test('generate screenshot', async t => {
	await execa('./cli.js', ['https://sindresorhus.com', '320x240']);

	t.true(fs.existsSync('sindresorhus.com-320x240.png'));
	fs.unlinkSync('sindresorhus.com-320x240.png');
});

test('remove temporary files on cancel', async t => {
	const subprocess = spawn('./cli.js', ['https://sindresorhus.com', '320x240']);

	const promise = pEvent(subprocess, 'exit');

	setTimeout(() => {
		subprocess.kill('SIGINT');
	}, 500);

	await promise;

	t.false(fs.existsSync('sindresorhus.com-320x240.png'));
});

test('show error if no url is specified', async t => {
	await t.throwsAsync(execa('./cli.js', ['320x240']), {message: /Specify a URL/});
});

test('use 1366x768 as default resolution', async t => {
	await execa('./cli.js', ['https://sindresorhus.com']);

	t.true(fs.existsSync('sindresorhus.com-1366x768.png'));
	fs.unlinkSync('sindresorhus.com-1366x768.png');
});

test('generate screenshots using keywords', async t => {
	await execa('./cli.js', ['https://sindresorhus.com', 'iphone5s']);

	t.true(fs.existsSync('sindresorhus.com-320x568.png'));
	fs.unlinkSync('sindresorhus.com-320x568.png');
});

test('generate screenshots with multiple filename', async t => {
	await execaCommand('./cli.js [ https://google.com --filename=google ] [ https://sindresorhus.com --filename=sindre ]');

	t.true(fs.existsSync('google.png'));
	fs.unlinkSync('google.png');

	t.true(fs.existsSync('sindre.png'));
	fs.unlinkSync('sindre.png');
});

test('show help screen', async t => {
	const {stdout} = await execa('./cli.js', ['--help']);
	t.regex(stdout, /pageres <url>/);
});

test('show version', async t => {
	const {stdout} = await execa('./cli.js', ['--version']);
	t.is(stdout, JSON.parse(fs.readFileSync('./package.json', 'utf8'))?.version);
});
