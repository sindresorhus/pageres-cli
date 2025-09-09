import fs from 'node:fs';
import {spawn} from 'node:child_process';
import {test} from 'node:test';
import assert from 'node:assert';
import {execa, execaCommand} from 'execa';
import {pEvent} from 'p-event';

test('generate screenshot', async () => {
	await execa('./cli.js', ['https://sindresorhus.com', '320x240']);

	assert.ok(fs.existsSync('sindresorhus.com-320x240.png'));
	fs.unlinkSync('sindresorhus.com-320x240.png');
});

test('remove temporary files on cancel', async () => {
	const subprocess = spawn('./cli.js', ['https://sindresorhus.com', '320x240']);

	const promise = pEvent(subprocess, 'exit');

	setTimeout(() => {
		subprocess.kill('SIGINT');
	}, 500);

	await promise;

	assert.ok(!fs.existsSync('sindresorhus.com-320x240.png'));
});

test('show error if no url is specified', async () => {
	await assert.rejects(
		execa('./cli.js', ['320x240']),
		{message: /Specify a URL/},
	);
});

test('use 1366x768 as default resolution', async () => {
	await execa('./cli.js', ['https://sindresorhus.com']);

	assert.ok(fs.existsSync('sindresorhus.com-1366x768.png'));
	fs.unlinkSync('sindresorhus.com-1366x768.png');
});

test('show error for unsupported keywords', async () => {
	await assert.rejects(
		execa('./cli.js', ['https://sindresorhus.com', 'iphone5s']),
		{message: /Device keywords are no longer supported/},
	);
});

test('generate screenshots with multiple filename', async () => {
	await execaCommand('./cli.js [ https://google.com --filename=google ] [ https://sindresorhus.com --filename=sindre ]');

	assert.ok(fs.existsSync('google.png'));
	fs.unlinkSync('google.png');

	assert.ok(fs.existsSync('sindre.png'));
	fs.unlinkSync('sindre.png');
});

test('show help screen', async () => {
	const {stdout} = await execa('./cli.js', ['--help']);
	assert.match(stdout, /pageres <url>/);
});

test('show version', async () => {
	const {stdout} = await execa('./cli.js', ['--version']);
	const packageVersion = JSON.parse(fs.readFileSync('./package.json', 'utf8'))?.version;
	assert.strictEqual(stdout, packageVersion);
});
