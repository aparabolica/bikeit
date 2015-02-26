module.exports = function(grunt) {

	grunt.initConfig({
		browserify: {
			all: {
				options: {
					transform: ['browserify-shim'],
				},
				files: {
					'js/vendor.js': ['src/js/vendor.js'],
					'js/main.js': ['src/js/index.js']
				}
			}
		},
		uglify: {
			all: {
				options: {
					mangle: true,
					compress: true
				},
				files: {
					'js/vendor.js': 'js/vendor.js',
					'js/main.js': 'js/main.js',
				}
			}
		},
		less: {
			all: {
				options: {
					compress: true
				},
				files: {
					'css/main.css': 'src/css/main.less',
					'css/responsive.css': 'src/css/responsive.less'
				}
			}
		},
		jade: {
			all: {
				options: {
					doctype: 'html'
				},
				files: [{
					expand: true,
					cwd: 'src',
					src: ['**/*.jade'],
					dest: '.',
					ext: '.html'
				}]
			}
		},
		copy: {
			main: {
				files: [
					{
						cwd: 'src',
						src: ['**', '!**/*.less', '!**/*.jade', '!js/**/*'],
						dest: '.',
						expand: true
					},
					{
						cwd: 'node_modules/leaflet/dist',
						src: ['**', '!**/*.js'],
						dest: 'css',
						expand: true
					},
					{
						cwd: 'node_modules/ng-dialog/css',
						src: ['**'],
						dest: 'css',
						expand: true
					}
				]
			},
			maki: {
				files: [
					{
						cwd: 'node_modules/maki/www/images',
						src: ['maki-sprite.png', 'maki-sprite@2x.png', 'maki-sprite.dark.png', 'maki-sprite.dark@2x.png'],
						dest: 'img',
						expand: true
					},
					{
						src: 'node_modules/maki/www/maki-sprite.css',
						dest: 'css/maki-sprite.css'
					}
				]
			}
		},
		pot: {
			options: {
				text_domain: 'bikeit',
				language: 'PHP',
				keywords: [
					'__',
					'_e',
					'_ex',
					'_n',
					'_nx'
				],
				dest: 'languages/'
			},
			files: {
				src: ['**/*.php', '!inc/acf/**/*.php', '!node_modules/**/*.php', '!inc/class-tgm*'],
				expand: true
			}
		},
		watch: {
			options: {
				livereload: true
			},
			php: {
				files: '**/*.php',
				tasks: ['pot']
			},
			css: {
				files: 'src/css/**/*.less',
				tasks: ['less']
			},
			jade: {
				files: 'src/views/**/*.jade',
				tasks: ['jade']
			},
			files: {
				files: ['src/**/*', '!src/**/*.less', '!src/**/*.jade', '!src/**/*.js'],
				tasks: ['copy']
			},
			scripts: {
				files: 'src/js/**/*.js',
				tasks: ['browserify']
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-jade');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-pot');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask(
		'javascript',
		'Compile scripts.',
		['browserify', 'uglify']
	);

	grunt.registerTask(
		'views',
		'Compile views.',
		['jade', 'less']
	);

	grunt.registerTask(
		'build',
		'Compiles everything.',
		['javascript', 'views', 'copy', 'pot']
	);

	grunt.registerTask(
		'default',
		'Build, start server and watch.',
		['browserify', 'views', 'copy', 'watch']
	);

}