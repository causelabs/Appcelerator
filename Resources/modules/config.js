/**
 * Config.js
 *
 * Configuration information
 *
 * @author Shane A. Stillwell
 */

var env;

/**
 * Stub in Ti for unit testing
 */
if (typeof Ti === 'object') {
    env = Ti.App.Properties.getString('environment') || 'local';
} else {
    env = 'local';
}

// List of options that depend on env (local|staging|production)
options = {
    apiHosts: {
        local: 'http://localhost:3000',
        staging: 'http://localhost:3000',
        production: 'http://localhost:3000'
    }
};

module.exports = {
    apiHost             : options.apiHosts[env]
};
