# BikeIT

A WordPress theme to collect reviews on bike-friendly city spots

---

## Development

This theme turn WordPress into a [SPA](http://en.wikipedia.org/wiki/Single-page_application) built on [AngularJS](https://angularjs.org/) with [WP REST API](http://wp-api.org/) plugin.

JavaScript and views can be found at `src/` directory. Backend at `functions.php` and `inc/` directory.

*View `Gruntfile.js` to understand better the frontend file structure.*

### Requirements

 - npm

Install grunt-cli

```
$ npm install -g grunt-cli
```

Install theme javascript dependencies:

```
$ npm install
```

Run `grunt` to watch for source changes. *LiveReload* support is enabled.
