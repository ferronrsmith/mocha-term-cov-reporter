var colors, mocha, pad, printFileReport, printFullReport, printSummary, readReport, _;

_ = require('underscore');

colors = require('colors');

mocha = require('mocha');

pad = function (width, str) {
    var padding, _i, _results;
    padding = width - str.toString().length;
    if (padding > 0) {
        return (function () {
            _results = [];
            for (var _i = 1; 1 <= padding ? _i <= padding : _i >= padding; 1 <= padding ? _i++ : _i--) {
                _results.push(_i);
            }
            return _results;
        }).apply(this).map(function () {
                return ' ';
            }).join('') + str.toString();
    } else {
        return str;
    }
};

readReport = function (data, surround, callback) {
    return data.files.map(function (file) {
        var actualLines, displayLines, groupedLines, lineCount, makeResult, padLineLength, sortedLines, uncoveredLines, _i, _results;
        lineCount = Object.keys(file.source).length;
        padLineLength = _.bind(pad, null, lineCount.toString().length);
        makeResult = function (groups) {
            return {
                filename: file.filename,
                sloc: file.sloc,
                coverage: parseInt(file.coverage, 10),
                groups: groups
            };
        };
        uncoveredLines = (function () {
            _results = [];
            for (var _i = 1; 1 <= lineCount ? _i <= lineCount : _i >= lineCount; 1 <= lineCount ? _i++ : _i--) {
                _results.push(_i);
            }
            return _results;
        }).apply(this).filter(function (line) {
                return file.source[line].coverage === 0;
            });
        if (uncoveredLines.length === 0) {
            return makeResult([]);
        }
        displayLines = _.unique(_.flatten(uncoveredLines.map(function (line) {
            var _j, _ref, _ref1, _results1;
            return (function () {
                _results1 = [];
                for (var _j = _ref = line - surround, _ref1 = line + surround; _ref <= _ref1 ? _j <= _ref1 : _j >= _ref1; _ref <= _ref1 ? _j++ : _j--) {
                    _results1.push(_j);
                }
                return _results1;
            }).apply(this);
        })));
        actualLines = displayLines.filter(function (line) {
            return 1 <= line && line <= lineCount;
        });
        sortedLines = _.sortBy(actualLines, _.identity);
        groupedLines = sortedLines.slice(1).reduce(function (acc, line) {
            var group, value;
            group = _.last(acc);
            value = _.last(group);
            if (value + 1 === line) {
                group.push(line);
            } else {
                acc.push([line]);
            }
            return acc;
        }, [
            [sortedLines[0]]
        ]);
        return makeResult(groupedLines.map(function (group) {
            return group.map(function (line) {
                return {
                    source: "" + (padLineLength(line)) + " " + file.source[line].source,
                    covered: uncoveredLines.indexOf(line) === -1
                };
            });
        }));
    });
};

printSummary = function (stream, dd) {
    return dd.forEach(function (file) {
        var color, title;
        title = "" + file.filename + ": " + file.sloc + " lines, " + file.coverage + "% coverage";
        color = file.groups.length === 0 ? 'green' : 'red';
        return stream.write("" + title[color] + "\n");
    });
};

printFileReport = function (stream, file) {
    var title, _i, _results;
    title = "" + file.filename + ": " + file.sloc + " lines, " + file.coverage + "% coverage";
    if (file.groups.length === 0) {
        stream.write(title.bold.green);
        return stream.write('\n');
    } else {
        stream.write(title.bold);
        stream.write('\n');
        stream.write((function () {
            _results = [];
            for (_i = 1; _i <= 80; _i++) {
                _results.push(_i);
            }
            return _results;
        }).apply(this).map(function (x) {
                return '=';
            }).join('').bold);
        stream.write('\n');
        return file.groups.forEach(function (group) {
            group.forEach(function (line) {
                stream.write(line.covered ? line.source : line.source.red.inverse);
                return stream.write('\n');
            });
            return stream.write('\n\n\n');
        });
    }
};

printFullReport = function (stream, data) {
    printSummary(stream, data);
    if (data.some(function (file) {
        return file.groups.length > 0;
    })) {
        stream.write('\n\n\n');
        data.filter(function (file) {
            return file.groups.length > 0;
        }).forEach(function (file) {
                return printFileReport(stream, file);
            });
        return printSummary(stream, data);
    }
};

module.exports = function (runner) {
    var info;
    info = {};
    mocha.reporters.JSONCov.call(info, runner, false);
    return runner.on('end', function () {
        var outdata;
        outdata = readReport(info.cov, 5);
        return printFullReport(process.stdout, outdata);
    });
};

