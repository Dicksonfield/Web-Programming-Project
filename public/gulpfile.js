var gulp = require("gulp");
var sass = require("gulp-sass");
var sassGlob = require("gulp-sass-glob");
var cleanCSS = require("gulp-clean-css");
var concat = require("gulp-concat");
var wait = require("gulp-wait");

var styleList = [
    "./scss/main.scss",
];

gulp.task("styles", function () {
    return gulp
        .src(styleList)
        .pipe(concat("main.css"))
        .pipe(wait(1500))
        .pipe(sassGlob())
        .pipe(sass.sync().on("error", sass.logError))
        .pipe(cleanCSS())
        .pipe(gulp.dest("./css"));
});

gulp.task("watch", function () {
    gulp.watch("./scss/**/*.scss", gulp.series("styles"));
});

gulp.task("default", gulp.parallel("styles", "watch"));
