// An example configuration file.
exports.config = {
    specs: ['*.test.js'],
    baseUrl: "http://localhost:3001/",
    framework: "mocha",
    showColors: true,
    mochaOpts: {
        reporter: "spec"
    }
};

