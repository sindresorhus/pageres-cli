#!/usr/bin/env node
'use strict';
const updateNotifier = require('update-notifier');
const subarg = require('subarg');
const sudoBlock = require('sudo-block');
const logSymbols = require('log-symbols');
const arrayUniq = require('array-uniq');
const arrayDiffer = require('array-differ');
const arrify = require('arrify');
const Pageres = require('pageres');
const parseHeaders = require('parse-headers');
const meow = require('meow');

const options = {
	boolean: [
		'verbose',
		'crop',
		'overwrite'
	],
	default: {
		delay: 0,
		scale: 1
	},
	alias: {
		v: 'verbose',
		c: 'crop',
		d: 'delay'
	}
};

const cli = meow(`
	Specify urls and screen resolutions as arguments. Order doesn't matter.
	Group arguments with [ ]. Options defined inside a group will override the outer ones.
	Screenshots are saved in the current directory.

	Usage
	  pageres <url> <resolution>
	  pageres [ <url> <resolution> ] [ <url> <resolution> ]

	Example
	  pageres todomvc.com yeoman.io 1366x768 1600x900
	  pageres todomvc.com yeoman.io 1366x768 1600x900 --overwrite
	  pageres [ yeoman.io 1366x768 1600x900 --no-crop ] [ todomvc.com 1024x768 480x320 ] --crop
	  pageres todomvc.com 1024x768 --filename='<%= date %> - <%= url %>'
	  pageres yeoman.io 1366x768 --selector='.page-header'
	  pageres unicorn.html 1366x768

	Options
	  -v, --verbose            Verbose output
	  -c, --crop               Crop to the set height
	  -d, --delay=<seconds>    Delay screenshot capture
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

	<url> can also be a local file path.
`, options);

function generate(args, options) {
	const pageres = new Pageres({incrementalName: !options.overwrite})
		.dest(process.cwd());

	args.forEach(arg => {
		pageres.src(arg.url, arg.sizes, arg.options);
	});

	if (options.verbose) {
		pageres.on('warn', console.error.bind(console));
	}

	pageres.run()
		.then(() => {
			pageres.successMessage();
		})
		.catch(err => {
			if (err.noStack) {
				console.error(err.message);
				process.exit(1);
			} else {
				throw err;
			}
		});
}

function get(args) {
	const ret = [];

	args.forEach(arg => {
		if (arg.url.length === 0) {
			console.error(logSymbols.warning, 'Specify a url');
			process.exit(1);
		}

		if (arg.sizes.length === 0 && arg.keywords.length === 0) {
			arg.sizes = ['1366x768'];
		}

		if (arg.keywords.length > 0) {
			arg.sizes = arg.sizes.concat(arg.keywords);
		}

		arg.url.forEach(el => {
			ret.push({
				url: el,
				sizes: arg.sizes,
				options: arg.options
			});
		});
	});

	return ret;
}

function parse(args, globalOptions) {
	return args.map(arg => {
		const options = Object.assign({}, globalOptions, arg);

		arg = arg._;
		delete options._;

		if (options.cookie) {
			options.cookie = arrify(options.cookie);
		}

		if (options.header) {
			options.header = parseHeaders(arrify(options.header).join('\n'));
		}

		// Plural makes more sense for programmatic options
		options.cookies = options.cookie;
		options.headers = options.header;
		delete options.cookie;
		delete options.header;

		if (options.hide) {
			options.hide = arrify(options.hide);
		}

		const urlRegex = /https?:\/\/|localhost|\./;
		const sizeRegex = /^\d{3,4}x\d{3,4}$/i;
		const url = arrayUniq(arg.filter(x => urlRegex.test(x)));
		const sizes = arrayUniq(arg.filter(x => sizeRegex.test(x)));
		const keywords = arrayDiffer(arg, url.concat(sizes));

		return {
			url,
			sizes,
			keywords,
			options
		};
	});
}

function init(args, options) {
	if (args.length === 0) {
		cli.showHelp(1);
	}

	const nonGroupedArgs = args.filter(x => !x._);

	// Filter grouped args
	args = args.filter(x => x._);

	if (nonGroupedArgs.length > 0) {
		args.push({_: nonGroupedArgs});
	}

	const parsedArgs = parse(args, options);
	const items = get(parsedArgs);

	generate(items, options);
}

sudoBlock();
updateNotifier({pkg: cli.pkg}).notify();

init(subarg(cli.input, options)._, cli.flags);
