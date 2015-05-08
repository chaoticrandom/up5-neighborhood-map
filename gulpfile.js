var
	gulp = require('gulp'),
  del = require('del'),
  newer = require('gulp-newer'),
	concat = require('gulp-concat'),
  size = require('gulp-size'),
  preprocess = require('gulp-preprocess'),
	minifyhtml = require('gulp-minify-html');
	imagemin = require('gulp-imagemin'),
  sass = require('gulp-sass'),
  pleeease = require('gulp-pleeease'),
	csso = require('gulp-csso'),
  jshint = require('gulp-jshint'),
	stripdebug = require('gulp-strip-debug'),
	uglify = require('gulp-uglify'),
	deporder = require('gulp-deporder'),
	merge = require('merge-stream'),
  pkg = require('./package.json'),
  browsersync = require('browser-sync');

var
	devBuild = ((process.env.NODE_ENV || 'development').trim().toLowerCase() !== 'production'),
	source = 'source/',
	dest = 'build/',
	html = {
		in: source + '*.html',
		watch: [source + '*.html', source + 'template/**/*'],
		out: dest,
		context: {
			devBuild: devBuild,
			name: pkg.name,
			author: pkg.author,
			version: pkg.version
		},
		minifyOpt: {
			comments: true
		}
	},
	images = {
		in: source + 'images/*.*',
		out: dest + 'images'
	},
  css = {
		libs: {
			components: source + 'css/libs/*.css',
			themes: source + 'css/libs/themes/**/*',
			output: 'semantic.min.css'
		},
		sass: source + 'css/scss/main.scss',
		watch: source + 'css/**/*',
		out: dest + 'css/',
		sassOpt: {
			outputStyle: 'nested',
			imagePath: '../images',
			precision: 3,
			errLogToConsole: true
		},
		pleeeaseOpt: {
			autoprefixer: {browsers: ['last 2 versions', '> 2%']},
			rem: ['16px'],
			pseudoElements: true,
			mqpacker: true,
			minifier: !devBuild
		}
	},
  js = {
		lib: {
			in: source + 'js/vendor/',
			out: dest + 'js/',
			filename: 'libs.js'
		},
		app: {
			in: source + 'js/app/**/*',
			out: dest + 'js/',
			filename: 'main.js'
		}
	},
	syncOpt = {
		server: {
			baseDir: dest,
			index: 'index.html'
		},
		open: false,
		notify: true
	};

console.log(pkg.name + ' ' + pkg.version + ', ' + (devBuild? 'development' : 'production') + ' build');

gulp.task('clean', function() {
	del([
		dest + '*'
	]);
});
//preprocess html and minify if production build
gulp.task('html', function() {
	var page = gulp.src(html.in).pipe(preprocess({ context: html.context}));
	if(!devBuild) {
		page = page
			.pipe(size({title: 'HTML in'}))
			.pipe(minifyhtml(html.minifyOpt))
			.pipe(size({title: 'HTML out'}));
	}
	return page.pipe(gulp.dest(html.out));
});
//move favicon and minify new images and move them to build folder
gulp.task('images', function() {
	var favicon = gulp.src(source + 'favicon.ico')
		.pipe(newer(dest))
		.pipe(gulp.dest(dest));
	var img = gulp.src(images.in)
		.pipe(newer(images.out))
		.pipe(imagemin())
		.pipe(gulp.dest(images.out));
	return merge(img, favicon);
});
//css task
gulp.task('css', function() {
//concatenate and minify Semantic UI components files
	var libs = gulp.src(css.libs.components)
		.pipe(concat(css.libs.output))
		.pipe(csso());
//move Semantic UI themes folder to build
	var themes = gulp.src(css.libs.themes)
		.pipe(newer(css.out))
		.pipe(gulp.dest(css.out + 'themes'));
//assemble sass files
	var sassFiles =  gulp.src(css.sass)
		.pipe(sass(css.sassOpt))
		.pipe(size({title: 'CSS in'}))
		.pipe(pleeease(css.pleeeaseOpt))
		.pipe(size({title: 'CSS out'}));
//concatenate Semantic UI and sass files into main.js
	var main = merge(libs, sassFiles)
		.pipe(concat('main.css'))
		.pipe(gulp.dest(css.out))
		.pipe(browsersync.reload({stream: true}));
//merge output streams
	return merge(main, themes);
});
//js task
gulp.task('js', function() {
	//if development build
	if (devBuild) {
		del([
			dest + 'js/*'
		]);
		//move new vendor libs to build folder
		var vendor = gulp.src(js.lib.in + '*.js')
			.pipe(newer(js.lib.out))
			.pipe(gulp.dest(js.lib.out));
		//concatenate and minify Semantic UI component files
		//usage of component files instead of general lib file saves output file's size
		var semantic = gulp.src(js.lib.in + 'semantic-ui/*.js')
			.pipe(concat('semantic.min.js'))
			.pipe(uglify())
			.pipe(gulp.dest(js.lib.out));
		//pipe new app files through jshint and put them into build folder
		var app = gulp.src(js.app.in)
			.pipe(newer(js.app.out))
			.pipe(jshint())
			.pipe(jshint.reporter('default'))
			.pipe(jshint.reporter('fail'))
			.pipe(gulp.dest(js.app.out));
//merge streams
		return merge(vendor, semantic, app);
	}
	//if production build
	else {
		del([
			dest + 'js/*'
		]);
//concatenate and minify vendor files into libs.js
		var vendor = gulp.src(js.lib.in + '**/*')
			.pipe(concat(js.lib.filename))
			.pipe(size({ title: 'JS in'}))
			.pipe(stripdebug())
			.pipe(uglify())
			.pipe(size({ title: 'JS out'}))
			.pipe(gulp.dest(js.lib.out));
//concatenate and minify app files into main.js
		var app = gulp.src(js.app.in)
			.pipe(deporder())
			.pipe(concat(js.app.filename))
			.pipe(size({ title: 'JS in'}))
			.pipe(stripdebug())
			.pipe(uglify())
			.pipe(size({ title: 'JS out'}))
			.pipe(gulp.dest(js.app.out));
//merge streams
		return merge(vendor, app);
	}
});
//app js files watch task
gulp.task('js-watch', function() {
	if (devBuild) {
		return gulp.src(js.app.in)
			.pipe(newer(js.app.out))
			.pipe(jshint())
			.pipe(jshint.reporter('default'))
			.pipe(jshint.reporter('fail'))
			.pipe(gulp.dest(js.app.out));
	}
	else {
		del([
			dest + 'js/' + js.app.filename
		]);

		return gulp.src(js.app.in)
			.pipe(deporder())
			.pipe(concat(js.app.filename))
			.pipe(size({ title: 'JS in'}))
			.pipe(stripdebug())
			.pipe(uglify())
			.pipe(size({ title: 'JS out'}))
			.pipe(gulp.dest(js.app.out));
	}
});
//browsersync task
gulp.task('browsersync', function() {
	browsersync(syncOpt);
});

//one task to rule them all
gulp.task('default', ['html', 'images', 'js', 'css', 'browsersync'], function() {

	gulp.watch(html.watch, ['html', browsersync.reload]);
	gulp.watch(css.watch, ['css']);
	gulp.watch(js.app.in, ['js-watch', browsersync.reload]);
	gulp.watch(images.in, ['images']);

});
