/**
 * Ti.Network.HTTPClient proxy library
 *
 * This service will proxy for an XHR request and is mostly meant to be used
 * with a backend that talkes JSON. It will also work nicely with unit testing
 * and just provide a response of "{success: 1}"
 *
 * Usage
 *
 * var network = require('services/network');
 *
 * var xhr = new network.xhr({
 *      host: 'http://EXAMPLE.COM',
 *      method: 'GET',
 *      url: '/api/user',
 *      data: {id: 1234},
 *      callback: function(){
 *          console.log(this.responseText);
 *          }
 *
 *      );
 *
 *  xhr.send();
 *
 *
 * @author Shane A. Stillwell
 */

var _      = require('lib/underscore'),
    config = require('modules/config');

/**
 * Provide network services
 */
var mockXhr = function(){
    this.open = function(method, url){};
    this.onload = function() {};
    this.setRequestHeader = function(name, value) {};
    this.send = function(data){
        if (typeof this.onload === 'function') {
            var result = {
                responseText: '{"success": 1}'
            };
            this.onload.apply(result, ['success']);
        }
    };
};


var getClient = function() {

    if (typeof Ti === 'object') {
        return Ti.Network.createHTTPClient();
    }

    // Send a mock object
    return new mockXhr();
};

/**
 * Proxy object to Ti.Network.createHTTPClient()
 */
var xhr = exports.xhr = function(options) {

    this.host    = config.apiHost;
    this.method  = 'GET';
    this.url     = null;
    this.data    = null;
    this.onload  = function() {};
    this.headers = {};
    this.onerror = function(e) {
        console.log('XHR error: ' + this.connectionType + ' ' + this.location);
        console.log(this.statusText);
    };
    
    _.extend(this, options);

    this.client = getClient();

};

xhr.prototype.open = function(method, url) {

    this.method = method || this.method;
    this.url    = url || this.url;
     
};

/**
 * Prepare the request and send it
 */
xhr.prototype.send = function(data) {
    this.data = data || this.data;

    // Append the data as a query string for GET requests
    // Then clear this.data
    if ('GET' === this.method && this.data) {
        this.url = this.url + '?' + toQueryString(this.data);
        this.data = null;
    }

    ////console.log('Method, URL ' + this.method + this.url);

    this.client.open(this.method, this.host + this.url);

    // Only set this if we are POST'n or PUT'n, otherwise Appcelerator
    // complains
    if ('PUT' === this.method || 'POST' === this.method) {
        this.client.setRequestHeader("Content-Type",'application/json');
    }

    // Set the headers
    var headerKeys = _.keys(this.headers);
    for (var i = 0; i < headerKeys.length; i++) {

        var key   = headerKeys[i],
            value = this.headers[key];
        this.client.setRequestHeader(key, value);
    }

    this.client.onload = this.onload;
    this.client.onerror = this.onerror;

    // If data is still an object, then we'll stingify it
    if (_.isObject(this.data)) {
        this.data = JSON.stringify(this.data);
    }

    this.client.send(this.data);

};

/**
 * Set headers on request
 */
xhr.prototype.setRequestHeader = function(name, value) {

    this.headers[name] = value;
};

/**
 * Onload
 */
xhr.prototype.onload = function(callback) {
    this.onload = callback;
};

/**
 * On Error
 */
xhr.prototype.onerror = function(callback) {
    this.onerror = callback;
};


/**
 * Convert a nice peaceful object into a raging query string
 *
 * @param {object} obj
 *
 * @author Shane A. Stillwell
 */
function toQueryString(obj) {
    var parts = [];
    for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
            parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
        }
    }
    return parts.join("&");
}
