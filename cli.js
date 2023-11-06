#!/usr/bin/env node
import process from 'node:process';
import updateNotifier from 'update-notifier';
import subarg from 'subarg';
import sudoBlock from 'sudo-block';
import logSymbols from 'log-symbols';
import arrayUniq from 'array-uniq';
import arrayDiffer from 'array-differ';
import Pageres from 'pageres';
import parseHeaders from 'parse-headers';
import meow from 'meow';

const subargOptions = {
	boolean: [
		'verbose',
		'crop',
		'overwrite',
		'darkMode',
	],
	default: {
		delay: 0,
		scale: 1,
	},
	alias: {
		v: 'verbose',
		c: 'crop',
		d: 'delay',
	},
};

const cli = meow(`
	Specify urls and screen resolutions as arguments. Order doesn't matter.
	Group arguments with [ ]. Options defined inside a group will override the outer ones.
	Screenshots are saved in the current directory.

	Usage
	  $ pageres <url> <resolution>
	  $ pageres [ <url> <resolution> ] [ <url> <resolution> ]

	Examples
	  $ pageres https://sindresorhus.com https://example.com 1366x768 1600x900
	  $ pageres https://sindresorhus.com https://example.com 1366x768 1600x900 --overwrite
	  $ pageres [ https://example.com 1366x768 1600x900 --no-crop ] [ https://sindresorhus.com 1024x768 480x320 ] --crop
	  $ pageres https://sindresorhus.com 1024x768 --filename='<%= date %> - <%= url %>'
	  $ pageres https://example.com 1366x768 --selector='.page-header'
	  $ pageres unicorn.html 1366x768

	Options
	  --verbose, -v            Verbose output
	  --crop, -c               Crop to the set height
	  --delay=<seconds>, -d    Delay screenshot capture
	  --filename=<template>    Custom filename
	  --overwrite              Overwrite file if it exists
	  --selector=<element>     Capture DOM element
	  --hide=<element>         Hide DOM element (Can be set multiple times)
	  --cookie=<cookie>        Browser cookie (Can be set multiple times)
	  --header=<string>        Custom HTTP request header (Can be set multiple times)
	  --username=<username>    Username for HTTP auth
	  --password=<password>    Password for HTTP auth
	  --scale=<number>         Scale webpage
	  --format=<string>        Image format
	  --css=<string>           Apply custom CSS
	  --darkMode               Emulate preference of dark color scheme

	<url> can also be a local file path
`, {
	importMeta: import.meta,
	flags: {
		verbose: {
			type: 'boolean',
			shortFlag: 'v',
		},
		crop: {
			type: 'boolean',
			shortFlaf: 'c',
		},
		overwrite: {
			type: 'boolean',
		},
		darkMode: {
			type: 'boolean',
		},
		delay: {
			type: 'number',
			shortFlag: 'd',
			default: 0,
		},
		scale: {
			type: 'number',
			default: 1,
		},
	},
});

async function generate(arguments_, options) {
	const pageres = new Pageres({
		incrementalName: !options.overwrite,
	})
		.destination(process.cwd());

	for (const argument of arguments_) {
		pageres.source(argument.url, argument.sizes, argument.options);
	}

	await pageres.run();
	pageres.successMessage();
}

function get(args) {
	const returnValue = [];

	for (const argument of args) {
		if (argument.url.length === 0) {
			console.error(logSymbols.warning, 'Specify a URL');
			process.exit(1);
		}

		if (argument.sizes.length === 0 && argument.keywords.length === 0) {
			argument.sizes = ['1366x768'];
		}

		if (argument.keywords.length > 0) {
			argument.sizes = [...argument.sizes, ...argument.keywords];
		}

		for (const url of argument.url) {
			returnValue.push({
				url,
				sizes: argument.sizes,
				options: argument.options,
			});
		}
	}

	return returnValue;
}

function parse(arguments_, globalOptions) {
	const filename = [globalOptions.filename].flat();
	delete globalOptions.filename;

	return arguments_.map((argument, index) => {
		const options = {
			...globalOptions,
			...argument,
		};

		argument = argument._;
		delete options._;

		if (options.cookie) {
			options.cookies = [options.cookie].flat();
			delete options.cookie;
		}

		if (options.header) {
			options.headers = parseHeaders([options.header].flat().join('\n'));
			delete options.header;
		}

		if (filename[index]) {
			options.filename = filename[index];
		}

		if (options.hide) {
			options.hide = [options.hide].flat();
		}

		const urlRegex = /https?:\/\/|localhost|\./;
		const sizeRegex = /^\d{3,4}x\d{3,4}$/i;
		const url = arrayUniq(argument.filter(x => urlRegex.test(x)));
		const sizes = arrayUniq(argument.filter(x => sizeRegex.test(x)));
		const keywords = arrayDiffer(argument, [...url, ...sizes]);

		return {
			url,
			sizes,
			keywords,
			options,
		};
	});
}

async function init(arguments_, options) {
	if (arguments_.length === 0) {
		cli.showHelp(1);
	}

	const nonGroupedArgs = arguments_.filter(argument => !argument._);

	// Filter grouped args
	arguments_ = arguments_.filter(argument => argument._);

	if (nonGroupedArgs.length > 0) {
		arguments_.push({_: nonGroupedArgs});
	}

	const parsedArgs = parse(arguments_, options);
	const items = get(parsedArgs);

	await generate(items, options);
}

sudoBlock();
updateNotifier({pkg: cli.pkg}).notify();

const arguments_ = subarg(cli.input, subargOptions)._;

await init(arguments_, cli.flags);
