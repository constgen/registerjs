/*
Async HTTP Request extension. Based on Promise interface.

Core.http(options) and Cpre.httpCache(options)
or
Core.http('url', options) and Cpre.httpCache('url', options)

options = {
	url - string
	headers		- key-value object					- OPTIONAL
	method		- string (GET|POST|DELETE),			- OPTIONAL
				'GET' - default			
	user		- string								- OPTIONAL
	password	- string								- OPTIONAL
	response	- string (arraybuffer|blob|xml		- OPTIONAL
				|document|htmls|html|json|object|text)
				'text' - default
	data	- string|object|document					- OPTIONAL
}

Short: Core.http('url') ~ Core.http({url: 'url', method: 'GET'}) ~ Core.http('url', {method: 'GET'})

Example: 
Core.http({url: 'http://url.com'}).then(
	function done(val){},
	function canceled(err){},
	function progress(prog){}
)
*/

// Reference:
// Status Code Definitions http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html
// Help for NodeJS implementation http://docs.nodejitsu.com/articles/HTTP/clients/how-to-create-a-HTTP-request

Core.extend(function(Core){
	'use strict';
	
	var Cache = {}, // some kind of cache
		Promise = Core.Promise,
		httpRequest,
		undefined;


	//Request function
	httpRequest = function (url, options, cache) {
		var protocol = (location.protocol) == 'https:' ? 'https:' : 'http:';

		//define parameters
		options || (options = {})
		if (typeof url === 'object') {
			options = url
		} else if (typeof url === 'string') {
			options.url = url
		}

		// options.url - Required
		if (!options.url) return Promise();
		
		options.url = Core.template(options.url)  //process url variables
		options.url = Core.URL.normalize(options.url)

		// options.method - Optional. GET, POST, DELETE or HEAD. This parameter is not case-sensitive. If the method is not specified, the default is 'GET'
		;('method' in options && (options.method = options.method.toUpperCase())) || (options.method = 'GET')

		// options.user & options.password - Optional
		options.user || (options.user = '')
		options.password || (options.password = '')

		// options.headers - Optional. An object whose property names are used as header names and property values are used as header values
		options.headers || (options.headers = {})
		;('Content-Type' in options.headers) || (options.headers['Content-Type'] = 'application/x-www-form-urlencoded')
		;('Accept' in options.headers) || (options.headers['Accept'] = '*/*')
		//'If-Modified-Since': 'Mon, 27 Mar 1972 00:00:00 GMT'
		//'Content-Type': 'text/html'
		//'Content-Type': 'application/x-www-form-urlencoded'
		//xml -  'application/xml, text/xml'
        //html - 'text/html'
        //text - 'text/plain'
        //json - 'application/json, text/javascript'
        //js -   'application/javascript, text/javascript'

		// options.response - Optional. 'arraybuffer', 'blob', 'xml', 'document', 'html', 'htmls'(secured html without scripts), 'json', 'object'(not valid json), 'text' (, 'ms-stream')
		options.response || (options.response = 'text')

		// options.data - Optional. Data that is passed directly to the XHR.
		options.data || (options.data = null)

		//mimeType: '',//A mime type to override the XHR mime type.
		//timeout: 0, //in miliseconds
		//options.customRequestInitializer //Optional. A function that you can use to do preprocessing on the XmlHttpRequest.
		
		var xhr,
			i,
			isCanceled,
			responseFromCache,
			promise;

		if (cache) {
			responseFromCache = Cache.getResponse(options)
			//if in Cache, return resolved promise with value from Cache
			if (responseFromCache)
				return Promise(responseFromCache);
		}

		promise = new Promise(
			function (callback, errorback, progressback) {
				xhr = new Core.Util.XHR
				try {
					xhr.open(
						options.method,
						Core.config.cache ? options.url : Core.URL.randomize(options.url),
						true, //always async
						options.user,
						options.password
					)

					//set response type
					switch (options.response) {
						case 'arraybuffer':
							xhr.responseType = 'arraybuffer'; break
						case 'blob':
							xhr.responseType = 'blob'; break
						case 'xml':
						case 'document':
							xhr.responseType = 'document'; break
						case 'json':
							//xhr.responseType = 'json'; break
						case 'htmls':
						case 'html':
						case 'object':
						case 'text':
						default:
							xhr.responseType = 'text'
					}

					//setRequestHeaders
					for (i in options.headers) {
						if (options.headers.hasOwnProperty(i) && options.headers[i])
							xhr.setRequestHeader(i, options.headers[i])
					}

					xhr.onreadystatechange = function () {
						//if aborted
						if (isCanceled) return
						
						if (xhr.readyState == 4) {
							if ((xhr.status >= 200 && xhr.status < 300)) {
								callback(humanResponse(xhr, options), xhr)
							}
							else if (xhr.status == 0) {
								//may be local or responseText may contain exeption if no connection
								try {
									if (xhr.response || xhr.responseXML || xhr.responseText)
										callback(humanResponse(xhr, options), xhr)
									else
										errorback(new Error('Status: ' + xhr.status + '. ' + xhr.statusText), xhr)
								} catch (err) {
									errorback(new Error('No connection'), xhr)
								}
							}
							else {
								//errorback(humanResponse(xhr, options), xhr)
								errorback(new Error('Status: ' + xhr.status + '. ' + xhr.statusText), xhr)
							}
							xhr.onreadystatechange = i = null
						} else {
							//due to IE here is try-cacth
							try {
								progressback(humanResponse(xhr, options), xhr)
							} catch (err) {}
						}
					}

					xhr.send(options.data)
				} catch (err) {
					errorback(err, xhr)
				}
			},
			//how to cancel httpRequest
			function () {
				isCanceled = true
				xhr.abort && xhr.abort()
			}
		)

		if (cache) {
			//save result to cache
			promise.then(function (resp) {
				Cache.setResponse(resp)
			})
		}

		//return Promise
		return promise;
	}

	//function to prepare response data
	function humanResponse(xhr, options) {
		return {
			//objectify headers
			headers: (function () {
				var headers = {}, H = [], header, i = 0;
				if (!xhr.getAllResponseHeaders)
					return headers
				H = xhr.getAllResponseHeaders().split(/\n/)
				while (header = H[i++]) {
					headers[header.substr(0, header.indexOf(':'))] = header.substr(header.indexOf(':') + 1).replace(/^\s+/)
				}
				return headers
			}()),
			//retrieve data in necessary format
			response: (function (type) {
				switch (type) {
					case 'arraybuffer':
					case 'blob':
						//get ready data
						return xhr.response || []
					case 'xml':
					case 'document':
						//get ready XML or try to use core extension for parsing
						return xhr.responseXML || (Core.XML && Core.XML.parse(xhr.responseText)) || null
					case 'htmls':
					case 'html':
						//parse as html
						var doc
						if (!!document.implementation.createHTMLDocument) {
							doc = document.implementation.createHTMLDocument('', '', document.implementation.createDocumentType('html', '', ''));
							doc.documentElement.innerHTML = (type == 'htmls') ? xhr.responseText.replace(/<script[^>]*>([\s\S]+?)<\/script>/gi, '') : xhr.responseText
						}
						else {//fallback
							var iframe = document.createElement('iframe')
							iframe.style.display = 'none'
							document.body.appendChild(iframe)//insert to DOM
							doc = (iframe.contentDocument) ? iframe.contentDocument : iframe.contentWindow.document
							doc.open()
							doc.write((type == 'htmls') ? xhr.responseText.replace(/<script[^>]*>([\s\S]+?)<\/script>/gi, '') : xhr.responseText)
							doc.close()
							//cancel resource loading in iframe with polyfill for IE.
							//parentWindow
							; (doc.defaultView && !!doc.defaultView.stop) ? doc.defaultView.stop() : (!!doc.execCommand ? doc.execCommand('Stop') : null)
							document.body.removeChild(iframe)//clear DOM
						}

						//return document object
						return doc
					case 'json':
						//parse as json
						try {
							//try to use standard JSON or from core extension
							return Core.JSON.parse(xhr.responseText/*.replace(/(\r)|(\n)/g, '')*/)
						} catch (err) {
							//if invalid json
							return;
						}
					case 'object':
						//parse as javascript object
						//check if it is valid javascript object
						if (/(^\{.+\}$)|(^\(\{.+\}\)$)/.test(xhr.responseText))
							return new Function('return ' + xhr.responseText/*.replace(/(\r)|(\n)/g, '')*/)()
						return {}
					case 'text':
					default:
						//no parsing
						return xhr.responseText || ''
				}
			}(options.response)),

			text: xhr.statusText,
			status: xhr.status,
			state: xhr.readyState,
			url: options.url,
			method: options.method
		}
	}

	/*
	var xhr = new XMLHttpRequest();
	xhr.open('GET', '/path/to/image.png', true);

	// Hack to pass bytes through unprocessed.
	xhr.overrideMimeType('text/plain; charset=x-user-defined');

	xhr.onreadystatechange = function(e) {
	  if (this.readyState == 4 && this.status == 200) {
		var binStr = this.responseText;
		for (var i = 0, len = binStr.length; i < len; ++i) {
		  var c = binStr.charCodeAt(i);
		  //String.fromCharCode(c & 0xff);
		  var byte = c & 0xff;  // byte at offset i
		}
	  }
	};

	xhr.send();
	
	*/

	//Kind of cache
	Cache = {
		responses: {},
		setResponse: function (resp) {
			this.responses[resp.method + ' ' + resp.url] = resp
		},
		getResponse: function (options) {
			return this.responses[options.method + ' ' + options.url]
		}
	}



	//Modified Promise constructor for HTTP requests
	var HttpPromise = (function() {
		function HttpPromise(initFunc, cancelFunc) {
			if (this instanceof Promise) { //with `new` operator
				Promise.call(this, initFunc, cancelFunc)
			}
			else { //as a function
				return new HttpPromise(function(resolve) {
					resolve(initFunc)
				})
			}
		}
		HttpPromise.prototype = Object.create(Promise.prototype)
		HttpPromise.prototype.constructor = HttpPromise
		HttpPromise.prototype.then = function(d, e, p) {
			return HttpPromise(
				Promise.prototype.then.call(this, d, e, p)
			)
		}
		HttpPromise.prototype.http = function(url, options) {
			return this.then(function() {
				return httpRequest(url, options)
			})
		}
		HttpPromise.prototype.httpCache = function(url, options) {
			return this.then(function() {
				return httpRequest(url, options, true)
			})
		}
		return HttpPromise;
	}());

	return {
		http: function(url, options) {
			return new HttpPromise(function(d, e, p) {
				httpRequest(url, options).then(d, e, p)
			});
		},
		httpCache: function(url, options) {
			return new HttpPromise(function(d, e, p) {
				httpRequest(url, options, true).then(d, e, p)
			});
		}
	}

})
