const { resolve } = require('path');
const WebpackLicensePlugin = require('webpack-license-plugin');

module.exports = {
    mode: 'development',
    entry: './cdn.js',
    output: {
        filename: 'index.js',
        path: resolve(__dirname, 'dist'),
    },
    plugins: [
        new WebpackLicensePlugin({
            outputFilename: 'license.txt'
        })
    ]
};