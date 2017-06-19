'use strict'

const gulp = require('gulp')
const nodemon = require('gulp-nodemon')

const pug = require('gulp-pug')

const coffee = require('gulp-coffee')
const uglify = require('gulp-uglify')

const sass = require('gulp-sass')
const cleanCSS = require('gulp-clean-css')

const source = 'src/**/*'
const clientOutput = 'build/public'
const html = '.pug'
const styles = '.sass'
const scripts = '.coffee'
const server = 'app.coffee'
const serverOutput = 'build'
const serverFinal = 'build/app.js'

gulp.task('html', function () {
  return gulp.src(source + html)
    .pipe(pug())
    .pipe(gulp.dest(clientOutput))
})

gulp.task('styles', function () {
  return gulp.src(source + styles)
    .pipe(sass())
    .pipe(cleanCSS())
    .pipe(gulp.dest(clientOutput))
})

gulp.task('scripts', function () {
  return gulp.src(source + scripts)
    .pipe(coffee())
    .pipe(uglify())
    .pipe(gulp.dest(clientOutput))
})

gulp.task('server_script', function () {
  return gulp.src(server)
    .pipe(coffee())
    .pipe(gulp.dest(serverOutput))
})

gulp.task('nodemon', ['server_script'], function (cb) {
  nodemon({script: serverFinal})
})

gulp.task('watch', function () {
  gulp.watch(source + html, ['html'])
  gulp.watch(source + styles, ['styles'])
  gulp.watch(source + scripts, ['scripts'])
  gulp.watch(server, ['server_script'])
})

gulp.task('default', ['watch', 'html', 'scripts', 'styles', 'nodemon'])
