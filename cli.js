#!/usr/bin/env node
/* eslint-disable no-inline-comments */
'use strict';
var multiline = require('multiline');
var updateNotifier = require('update-notifier');
var getStdin = require('get-stdin');
var subarg = require('subarg');
var sudoBlock = require('sudo-block');
var logSymbols = require('log-symbols');
var arrayUniq = require('array-uniq');
var arrayDiffer = require('array-differ');
var arrify = require('arrify');
var objectAssign = require('object-assign');
var Pageres = require('pageres');
var parseHeaders = require('parse-headers');
var pkg = require('./package.json');

var options = subarg(process.argv.slice(2), {
	boolean: [
		'verbose',
		'crop',
		'help',
		'version'
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
});

var args = options._;

delete options._;

function showHelp() {
	console.log(multiline(function () {
/*
  Capture screenshots of websites in various resolutions.

  Specify urls and screen resolutions as arguments. Order doesn't matter.
  Group arguments with [ ]. Options defined inside a group will override the outer ones.
  Screenshots are saved in the current directory.

  Usage
    pageres <url> <resolution>
    pageres [ <url> <resolution> ] [ <url> <resolution> ]
    pageres [ <url> <resolution> ... ] < <file>
    cat <file> | pageres [ <url> <resolution> ... ]

  Example
    pageres todomvc.com yeoman.io 1366x768 1600x900
    pageres [ yeoman.io 1366x768 1600x900 --no-crop ] [ todomvc.com 1024x768 480x320 ] --crop
    pageres todomvc.com 1024x768 --filename='<%= date %> - <%= url %>'
    pageres yeoman.io 1366x768 --selector='.page-header'
    pageres --delay 3 1366x768 < urls.txt
    pageres unicorn.html 1366x768
    cat screen-resolutions.txt | pageres todomvc.com yeoman.io

  Options
    -v, --verbose            Verbose output
    -c, --crop               Crop to the set height
    -d, --delay=<seconds>    Delay screenshot capture
    --filename=<template>    Custom filename
    --selector=<element>     Capture DOM element
    --hide=<element>         Hide DOM element (Can be set multiple times)
    --cookie=<cookie>        Browser cookie (Can be set multiple times)
    --header=<string>        Custom HTTP request header (Can be set multiple times)
    --username=<username>    Username for HTTP auth
    --password=<password>    Password for HTTP auth
    --scale=<number>         Scale webpage
    --format=<string>        Image format

  <url> can also be a local file path.

  You can also pipe in a newline separated list of urls and screen resolutions which will get merged with the arguments.
	*/}));
}

function generate(args, options) {
	var pageres = new Pageres()
		.dest(process.cwd());

	args.forEach(function (arg) {
		pageres.src(arg.url, arg.sizes, arg.options);
	});

	if (options.verbose) {
		pageres.on('warn', console.error.bind(console));
	}

	pageres.run(function (err) {
		if (err) {
			if (err.noStack) {
				console.error(err.message);
				process.exit(1);
			} else {
				throw err;
			}
		}

		pageres.successMessage();
	});
}

function get(args) {
	var ret = [];

	args.forEach(function (arg) {
		if (!arg.url.length) {
			console.error(logSymbols.warning, 'Specify a url');
			process.exit(1);
		}

		if (!arg.sizes.length && !arg.keywords.length) {
			arg.sizes = ['1366x768'];
		}

		if (arg.keywords.length) {
			arg.sizes = arg.sizes.concat(arg.keywords);
		}

		arg.url.forEach(function (el) {
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
	return args.map(function (arg) {
		var options = objectAssign({}, globalOptions, arg);

		arg = arg._;
		delete options._;

		if (options.cookie) {
			options.cookie = arrify(options.cookie);
		}

		if (options.header) {
			options.header = parseHeaders(arrify(options.header).join('\n'));
		}

		// plural makes more sense for programmatic options
		options.cookies = options.cookie;
		options.headers = options.header;
		delete options.cookie;
		delete options.header;

		if (options.hide) {
			options.hide = arrify(options.hide);
		}

		var urlRegex = /https?:\/\/|localhost|\./;
		var sizeRegex = /^\d{3,4}x\d{3,4}$/i;

		var url = arrayUniq(arg.filter(function (a) {
			return urlRegex.test(a);
		}));

		var sizes = arrayUniq(arg.filter(function (a) {
			return sizeRegex.test(a);
		}));

		var keywords = arrayDiffer(arg, url.concat(sizes));

		return {
			url: url,
			sizes: sizes,
			keywords: keywords,
			options: options
		};
	});
}

function init(args, options) {
	if (options.version) {
		console.log(pkg.version);
		process.exit();
	}

	if (options.help) {
		showHelp();
		process.exit();
	}

	if (args.length === 0) {
		showHelp();
		process.exit(1);
	}

	var nonGroupedArgs = args.filter(function (arg) {
		return !arg._;
	});

	// filter grouped args
	args = args.filter(function (arg) {
		return arg._;
	});

	if (nonGroupedArgs.length) {
		args.push({_: nonGroupedArgs});
	}

	var parsedArgs = parse(args, options);
	var items = get(parsedArgs);

	generate(items, options);
}

sudoBlock();
updateNotifier({pkg: pkg}).notify();

if (process.stdin.isTTY) {
	init(args, options);
} else {
	getStdin(function (data) {
		[].push.apply(args, data.trim().split(/\r?\n/));
		init(args, options);
	});
}
