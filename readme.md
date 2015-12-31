# pageres-cli [![Build Status](https://travis-ci.org/sindresorhus/pageres-cli.svg?branch=master)](https://travis-ci.org/sindresorhus/pageres-cli) [![](https://img.shields.io/badge/unicorn-approved-ff69b4.svg)](https://www.youtube.com/watch?v=9auOCbH5Ns4)

![](screenshot.png)

![](screenshot-output.png)

Capture screenshots of websites in various resolutions. A good way to make sure your websites are responsive. It's speedy and generates 100 screenshots from 10 different websites in just over a minute. It can also be used to render SVG images.

*See [pageres](https://github.com/sindresorhus/pageres) for the programmatic API and issues tracker.*


## Install

```
$ npm install --global pageres-cli
```

*PhantomJS, which is used for generating the screenshots, is installed automagically, but in some [rare cases](https://github.com/Obvious/phantomjs/issues/102) it might fail to and you'll get an `Error: spawn EACCES` error. [Download](http://phantomjs.org/download.html) PhantomJS manually and reinstall pageres if that happens.*


## Usage

Specify urls and screen resolutions as arguments. Order doesn't matter.

If no resolution is specified it will default to `1366x768` which is the most popular resolution.

```sh
pageres <url> <resolution>
pageres <resolution> <url>

# <url> can also be a local file path.
pageres <file> <resolution>
```

List multiple urls and resolutions for pageres to capture all combinations.

```sh
pageres <url> <resolution> ...

pageres todomvc.com 1024x768 1366x768 # 2 screenshots
pageres todomvc.com yeoman.io 1024x768 # 2 screenshots
pageres todomvc.com yeoman.io 1024x768 1366x768 # 4 screenshots
```

Group arguments with square brackets.

```sh
pageres [ <url> <resolution> ] [ <url> <resolution> ]
pageres [ <url> <resolution> ... ]

# Mix grouped and single arguments
pageres [ yeoman.io 1024x768 1600x900 ] todomvc.com 1366x768

# Options defined inside a group will override the outer ones.
pageres [ yeoman.io 1024x768 --no-crop ] todomvc.com 1366x768 --crop
```

Screenshots are saved in the current directory.

### Examples

```sh
# Basic multi-url, multi-resolution usage
pageres todomvc.com yeoman.io 1366x768 1600x900

# Override outer option within group
pageres [ yeoman.io 1366x768 1600x900 --no-crop ] [ todomvc.com 1024x768 480x320 ] --crop

# Provide a custom filename template
pageres todomvc.com 1024x768 --filename='<%= date %> - <%= url %>'

# Capture a specific element
pageres yeoman.io 1366x768 --selector='.page-header'

# Hide a specific element
pageres yeoman.io 1366x768 --hide='.page-header'

# Capture a local file
pageres unicorn.html 1366x768
```

### Options

##### `-v`, `--verbose`

Verbose output to see errors if you need to troubleshoot.

##### `-c`, `--crop`

Crop to the set height.

```
$ pageres todomvc.com 1024x768 --crop
```

##### `-d`, `--delay=<number>`

Delay screenshot capture.

```
$ pageres todomvc.com 1024x768 --delay=3
```

##### `--filename=<template>`

Custom filename.

```
$ pageres todomvc.com 1024x768 --filename='<%= date %> - <%= url %>'
```

##### `--selector=<element>`

Capture DOM element.

```
$ pageres yeoman.io 1366x768 --selector='.page-header'
```

##### `--hide=<element>`

Hide DOM element. Can be set multiple times.

```
$ pageres yeoman.io 1366x768 --hide='.page-header'
```

##### `--no-crop`

Override a global crop option within a group.

```
$ pageres [ yeoman.io 1366x768 --no-crop ] todomvc.com 1024x768 --crop
```

##### `--cookie=<cookie>`

Browser cookie. Can be set multiple times.

```
$ pageres yeoman.io --cookie='foo=bar'
```

##### `--header=<header>`

Custom HTTP request header. Can be set multiple times.

```
$ pageres yeoman.io --header='Cache-Control: no-cache'
```

##### `--username=<username>`

Username for HTTP auth.

##### `--password=<password>`

Password for HTTP auth.

##### `--scale=<number>`

Scale webpage `n` of times.

##### `--format=<string>`

Image format. Either `png` *(default)* or `jpg`.

##### `--user-agent=<string>`

Custom user agent.


## Config file

You can persist your commands into a file and run it whenever with eg. `sh .pageres`:

```sh
# .pageres
pageres [ todomvc.com 1000x1000 --crop ] [ yeoman.io 500x500 ]
pageres [ google.com 1000x1000 --crop ] [ github.com 500x500 ]
```


## Google Analytics screen resolutions

You can use the most popular resolutions for your site with `pageres` by following these steps:

- In Google Analytics go to the site for which you want screen resolutions
- Select `Audience` => `Technology` => `Browser & OS`
- Click the `Screen Resolution` link in the middle of the screen
- Click the `Export` button at the top, then `Google Spreadsheets`, and select yes for importing
- Select all the resolutions and copy them into a new file and save it
- In your terminal run: `pageres website.com $(awk '{a = $1 " " a} END {print a}' file-from-above-step.txt)`


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
