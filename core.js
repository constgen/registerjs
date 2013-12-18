/*
Version 3.3.6
Compatable with: NodeJS, AMD.

IO:
	out:
		app-ready
		app-load
		layout-update
*/

; (function (browserWindow, nodeGlobal) {
	'use strict';
	
	if (browserWindow && browserWindow.Core) return
	
	var undefined,
		global = browserWindow || nodeGlobal,
		window = browserWindow || {},
		document = window.document,
		location = window.location,

		/*internal*/
		Core = {version: '3.3.6'}, // Application Core
		ModulesRegistry = {}, // Registered Modules collection
		Sandbox, // Modules Sandbox constructor
		Module, // Module object constructor
		Resources = {},// Resource manager
		Includes = [],// Included modules collection
		Events = {}, //Collection of Core events handlers
		Actions = {}, //Collection of sandboxes actions handlers
		TemplateRules = [], //common templating rules
		SandboxTemplateRules = [], //module templating rules
		lastRegisteredModuleName = '',
		requestAnimationFrame,
		cancelAnimationFrame,

		/*shortcuts*/
		noop = function() { },
		setTimeout_1 = function(func) { return setTimeout(func, 1) },
		setTimeout_10 = function(func) { return setTimeout(func, 10) },
		setInterval_15 = function(func) { return setInterval(func, 15) };
	


	/*Fixes, polyfills*/
	
	//NodeJS polyfill
	if (nodeGlobal) {
		location = {
			protocol: '',
			hostname: require('os').hostname(),
			search: ''
		}
	}

	//document.head polyfill
	if (document) {
		document.head || (document.head = document.getElementsByTagName && document.getElementsByTagName('head')[0])
	}
	
	// compressed with http://www.refresh-sf.com/yui/
	// Array forEach
	[].forEach || (Array.prototype.forEach = function(g, b) { if (this == null) { throw new TypeError("this is null or not defined") } var d, c, e, f = Object(this), a = f.length >>> 0; if ({}.toString.call(g) != "[object Function]") { throw new TypeError(g + " is not a function") } if (b) { d = b } c = 0; while (c < a) { if (c in f) { e = f[c]; g.call(d, e, c, f) } c++ } });
	// Array map
	[].map || (Array.prototype.map = function(i, h) { if (this == null) { throw new TypeError("this is null or not defined") } if ({}.toString.call(i) != "[object Function]") { throw new TypeError(i + " is not a function") } var b, a, c, d, g, f = Object(this), e = f.length >>> 0; h && (b = h); a = new Array(e); c = 0; while (c < e) { if (c in f) { d = f[c]; g = i.call(b, d, c, f); a[c] = g } c++ } return a });
	// Array filter
	[].filter || (Array.prototype.filter = function(b) { if (this == null) { throw new TypeError("this is null or not defined") } if (typeof b != "function") { throw new TypeError(b + " is not a function") } var f = Object(this), a = f.length >>> 0, e = [], d = arguments[1], c, g; for (c = 0; c < a; c++) { if (c in f) { g = f[c]; if (b.call(d, g, c, f)) { e.push(g) } } } return e });
	// Array some
	[].some || (Array.prototype.some = function(b) { if (this == null) { throw new TypeError("this is null or not defined") } if (typeof b != "function") { throw new TypeError(b + " is not a function") } var e = Object(this), a = e.length >>> 0, d = arguments[1], c; for (c = 0; c < a; c++) { if (c in e && b.call(d, e[c], c, e)) { return true } } return false });
	// Array every
	[].every || (Array.prototype.every || function(b) { if (this == null) { throw new TypeError("this is null or not defined") } if (typeof b != "function") { throw new TypeError(b + " is not a function") } var e = Object(this), a = e.length >>> 0, d = arguments[1], c; for (c = 0; c < a; c++) { if (c in e && !b.call(d, e[c], c, e)) { return false } } return true });
	// Function bind
	(function(){}).bind || (Function.prototype.bind = function(a) { if (typeof this !== "function") { throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable") } var e = Array.prototype.slice.call(arguments, 1), d = this, b = function() { }, c = function() { return d.apply(this instanceof b && a ? this : a, e.concat(Array.prototype.slice.call(arguments))) }; b.prototype = this.prototype; c.prototype = new b(); return c });
	//Object create
	Object.create = Object.create || (function () { function F() { } return function (o) { if (arguments.length != 1) { throw new Error("Object.create implementation only accepts one parameter.") } F.prototype = o; return new F() } }());
	//String trim
	''.trim || (String.prototype.trim = function() { return this.replace(/^[\s\uFEFF\u00A0]+|[\s\uFEFF\u00A0]+$/g, '') });
	
	//internal `requestAnimationFrame`
	(function() {
		var lastTime = 0,
			vendors = ['webkit', 'moz', 'ms'],
			x;
		for (x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
			requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
			cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
		}

		if (!requestAnimationFrame) {
			requestAnimationFrame = function(callback) {
				var currTime = new Date().getTime(),
					timeToCall = Math.max(0, 16 - (currTime - lastTime)),
					id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);

				lastTime = currTime + timeToCall
				return id;
			};
		}
		if (!cancelAnimationFrame) {
			cancelAnimationFrame = function(id) {
				clearTimeout(id)
			}
		}
	}());

	// fix absent console
	global.console || (global.console = { log: noop })
	// fix absent console.error
	global.console.error || (global.console.error = noop)
	// fix absent console.dir
	global.console.dir || (global.console.dir = function (param) {
		var i, string = '';
		if (typeof param === 'object') {
			/*array*/
			if (param.length) {
				return console.log('[' + param.toString() + ']');
			}
			/*object*/
			string += '{\n'
			for (i in param) {
				string += '  ' + i + ': ' + param[i] + '\n'
			}
			string += '}'
			return console.log(string);
		} else { return console.log(param); }
	})


	//Collection of all resources objects
	Resources = {
		sequence: {js: [], css: [],	media: [], text: [], other: []},
		urls: {},
		add: function (url, options, executionFunction) {
			this.urls[url] = {
				type: options.type,
				format: options.format,
				async: options.async,
				defer: options.defer,
				reload: options.reload,
				loaded: false,
				executed: false,
				executionFunction: executionFunction
				//cancelFunction: cancelFunction
			}

			//if has handler add to sequence
			if (typeof executionFunction !== 'function')
				return;

			//define type of resource
			if (options.type === 'script')
				this.sequence.js.push(url)
			else if (options.type === 'style')
				this.sequence.css.push(url)
			else if (options.type === 'image')
				this.sequence.media.push(url)
			else if (options.type === 'text')
				this.sequence.text.push(url)
			else
				this.sequence.other.push(url)
		},
		ready: function (readyUrl, isReady) {
			var Resources = this;
			this.urls[readyUrl].loaded = true
			//if not ready, mark as executed, to not break sequence
			isReady = (isReady === undefined) ? true : isReady
			this.urls[readyUrl].executed = !isReady
			

			//update resources execution. Cascading is preserved for styles.
			;['js', 'css', 'media', 'text', 'other'].forEach(function(type) {
				var resource, i = 0;
				while (resource = Resources.urls[Resources.sequence[type][i++]]) {
					if (!resource.loaded && !resource.executed)
						break
					else if (resource.loaded && !resource.executed) {
						resource.executionFunction()
						resource.executed = true
					}
				}
			})
		},
		notReady: function(readyUrl) {
			return this.ready(readyUrl, false)
		}
	}





	/* Promise 1.7 */

	var Promise = Core.Promise = (function (global) {
		var Deferred,
			Promise,
			PromiseCollection,
			undefined,
			isFunc = function (func) {
				return (typeof func === 'function')
			},
			setImmediate = global.setImmediate || (global.msClearImmediate && global.msSetImmediate) /*IE10*/ || function (callback) {
				return setTimeout(callback, 1) //emulation
			},
			clearImmediate = global.clearImmediate || global.msClearImmediate /*IE10*/ || function (callback) {
				return clearTimeout(callback, 1) //emulation
			};

		Deferred = function (canceler) {
			this.canceler = canceler
			this.isResolved = false
			this.isRejected = false
			this.result = []//arguments array
			this.Callbacks = []
			this.newPromise
			//Deferred may serve Promise or not
			this.promise = undefined
		}


		Deferred.prototype.updateResult = function (newResult) {
			if (newResult !== undefined)
				this.result = [newResult]
		}

		Deferred.prototype.call = function (handler) {
			var func = this.isResolved ? handler.done : handler.canceled,
				defer = this,
				newResult;
			
			if (func) {
				try {
					newResult = func.apply(defer.promise || defer, defer.result); //new or old value
					if (newResult && typeof newResult.then === "function" && newResult !== (defer.promise || defer)) {
						this.newPromise = newResult //save a link to the new Promise object
						while (handler = this.Callbacks.shift()) { //migrate handlers to new promise
							newResult.then(handler.done, handler.canceled, handler.progress)
						}
						//check if return value have changed
						newResult.then(defer.updateResult, defer.updateResult, defer.updateResult)
						return
					}
					else
						defer.updateResult(newResult)
				}
				catch (err) {
					//if exeption is in doneCallback, switch to rejected state from this moment
					if (!defer.isRejected) {
						defer.isResolved = false
						defer.reject(err)
					}
					throw err
				}
			} else {
				//if Deferred rejected and there is no errorback, throw Error
				//if (isRejected) throw result[0]
			}
		}

		Deferred.prototype.resolve = function (/*args*/) {
			//prevent second resolve
			if (this.isResolved || this.isRejected) {
				return this
			}
			var handler;
			this.result = arguments //save value
			this.isResolved = true
			while (handler = this.Callbacks.shift()) {
				this.call(handler)
			}
			//clear
			handler = null
			this.Callbacks = []
			return this
		}

		Deferred.prototype.reject = function (/*args*/) {
			//prevent second reject
			if (this.isResolved || this.isRejected) {
				return this
			}
			var handler;
			this.result = arguments //save value
			this.isResolved = false
			this.isRejected = true
			while (handler = this.Callbacks.shift()) {
				this.call(handler)
			}
			//clear
			handler = null
			this.Callbacks = []
			return this
		}

		Deferred.prototype.progress = function(/*args*/) {
			if (this.isResolved || this.isRejected) return this;
			var handler, i = 0, ret;
			this.result = arguments //save value
			try {
				while (handler = this.Callbacks[i++]) {
					handler.progress && (ret = handler.progress.apply(this.promise, this.result))
					//progress handler can't return promise
					if (!(ret && typeof ret.then === 'function'))
						this.updateResult(ret)
				}
			} catch (err) {
				throw err
			}
			return this
		}

		Deferred.prototype.then = function (doneCallback, canceledCallback, progressCallback) {
			var handler = {
				done: isFunc(doneCallback) ? doneCallback : undefined,
				canceled: isFunc(canceledCallback) ? canceledCallback : undefined,
				progress: isFunc(progressCallback) ? progressCallback : undefined
			}
			//if new Promise appeared in chain, attach callbacks to new Promise
			if (this.newPromise) {
				this.newPromise.then(doneCallback, canceledCallback, progressCallback)
			}
				//if Deferred is resolved or rejected, execute doneCallback immediately
			else if (this.isResolved || this.isRejected)
				this.call(handler)
			else {
				this.Callbacks.push(handler)
			}
			return this
		}

		Deferred.prototype.cancel = function () {
			isFunc(this.canceler) && this.canceler()
			if (this.newPromise) {
				this.newPromise.cancel()
			}
			else {
				this.reject(new Error('Canceled'))
			}
			return this
		}

		/*Helpers*/
		//wait before resolve promise
		Deferred.prototype.wait = function (ms) {
			var id,
				timer = (ms) ? setTimeout : setImmediate;
			id = timer(this.resolve.bind(this), ms)
			return this.then(
				function () {//done
					(ms) ? clearTimeout(id) : clearImmediate(id)
				},
				function () {//canceled
					(ms) ? clearTimeout(id) : clearImmediate(id)
				}
			)
		}
		//wait before reject and cancel promise
		Deferred.prototype.timeout = function (ms) {
			var id, defer = this, 
				timer = (ms) ? setTimeout : setImmediate;
			id = timer(function () {
				defer.reject(new Error('Timedout'))
				//and do cancelatin
				defer.cancel()
			}, ms)

			return this.then(
				function() {//done
					(ms) ? clearTimeout(id) : clearImmediate(id)
				},
				function() {//canceled
					(ms) ? clearTimeout(id) : clearImmediate(id)
				}
			)
		}
		//call progress with interval before promise is resolved or rejected
		Deferred.prototype.interval = function (ms) {
			var id,
				timer = (ms) ? setTimeout : setImmediate;
			id = timer(this.progress.bind(this), ms)
			return this.then(
				function() {//done
					(ms) ? clearTimeout(id) : clearImmediate(id)
				},
				function() {//canceled
					(ms) ? clearTimeout(id) : clearImmediate(id)
				}
			)
		}
		//create delay between callbacks and errorbacks, has no effect to progressback
		Deferred.prototype.delay = function (ms) {
			if (ms) {
				var delayPromise = new Deferred(), defer = this;
				this.then(
					function() {//done
						return delayPromise.wait(ms).then(function () { return defer.result[0] })
					},
					function() {//canceled
						return delayPromise.timeout(ms).then(null, function () { return defer.result[0] })
					}
				)
			}
			return this;
		}
		//Current promise can't be resolved until passed promise will resolve. If passed promise will fail, current promise also will fail with that error
		Deferred.prototype.and = function (anotherPromise) {
			return this.then(
				function (val) {//done
					return Promise(anotherPromise).then(
						function () { return val }, //success
						function (err) { return err }) //switch to error state with this error
				}
			)
		}

		// Polymorph Promise constructor.
		// Promise constructor has to be used with `new` operator, 
		// else returns istant resolved promise object.
		Promise = function (initFunc, cancelFunc) {
			var isInstance = (this instanceof Promise),
				defer;//Deferred, that will serve this Promise
			
			//if called as a constructor
			if (isInstance) {
				defer = new Deferred(cancelFunc)
				defer.promise = this

				if (isFunc(initFunc)) {
					// create promise
					initFunc(defer.resolve.bind(defer), defer.reject.bind(defer), defer.progress.bind(defer))
				}
				else {
					// if `initFunc` is not a function, create passive promise with preseted result
					defer.then(function () { return initFunc })
				}

				defer.promise.then = function(d, e, p) {defer.then(d, e, p); return this}
				defer.promise.cancel = function () {defer.cancel(); return this}
				defer.promise.wait = function(ms) {defer.wait(ms); return this}
				defer.promise.timeout = function(ms) {defer.timeout(ms); return this}
				defer.promise.interval = function(ms) {defer.interval(ms); return this}
				defer.promise.delay = function(ms) {defer.delay(ms); return this}
				defer.promise.and = function(p) {defer.and(p); return this}
			}
				//if called to as a function
			else {
				defer = new Deferred()
				defer.promise = new Promise(function(d, e, p) { defer.then(function(r) { d(r) }, function(r) { e(r) }) })
				if (initFunc instanceof Promise) {
					//return passed promise as it is
					return initFunc;
				}
				else if (Promise.isPromise(initFunc)) {
					//redefine promise if another promise was passed as first argument
					initFunc.then(defer.resolve.bind(defer), defer.reject.bind(defer), defer.progress.bind(defer))
				}
				else if (isFunc(initFunc)) {
					//make promise resolved with function returned value
					defer.resolve(initFunc())
				}
				else if (initFunc instanceof Error || (initFunc && initFunc.toString && /Error:/.test(initFunc.toString()))) {
					//make promise rejected with passed error
					defer.reject(initFunc)
				}
				else {
					//make promise resolved with passed value
					defer.resolve(initFunc)
				}

				
			}

			return defer.promise;
		}

		PromiseCollection = function(specificFunc) {
			return function() {
				var promArr = [],
					props = {
						length: 0,
						done: 0,
						error: 0,
						Results: [],
						ErrorResults: []
					};

				Array.prototype.forEach.call(arguments, function(itm) {
					if (itm instanceof Array || (typeof itm === 'object' && 0 in itm)) //like Array
						promArr = promArr.concat(Array.prototype.slice.call(itm))
					else
						promArr.push(itm)
				})
				props.length = promArr.length

				return new Promise(function(resolve, reject, progress) {
					//create closure of current state for callbacks
					var itemCallbacks = specificFunc(props, resolve, reject, progress)

					promArr.forEach(function(p, i) {
						//ensure that item is Promise
						p = Promise(p)
						setImmediate(function() {
							p.then(
								itemCallbacks.itemResolved.bind(p, i),
								itemCallbacks.itemRejected.bind(p, i),
								itemCallbacks.itemProgress.bind(p, i)
							)
						})
					})
				}, function () {
					//cancel all Promises in array
					promArr && setImmediate(function() {
						promArr.forEach(function(p) {
							p.cancel()
						})
					})
				})
			}
		}

		//`every` method, gathers many promises and becomes resolved, when they all resolved
		Promise.every = PromiseCollection(function(props, resolveCollection, rejectCollection, progressCollection) {
			//if no arguments, resolve collection
			if (!props.length) {
				resolveCollection([])
			}

			return {
				itemResolved: function(i, result) {
					progressCollection(result)
					props.done += 1;
					props.Results[i] = result
					if (props.done == props.length) {
						resolveCollection(props.Results)
					}
				},
				itemRejected: function(i, err) {
					rejectCollection(err)
				},
				itemProgress: noop
			}
		})

		//`any` method, gathers many promises and becomes resolved, when they all fullfilled with any results.
		Promise.any = PromiseCollection(function(props, resolveCollection, rejectCollection, progressCollection) {
			//if no arguments, resolve collection
			if (!props.length) {
				resolveCollection([])
			}

			return {
				itemResolved: function(i, result) {
					progressCollection(result)
					props.done += 1;
					props.Results[i] = result
					if (props.done == props.length) {
						resolveCollection(props.Results)
					}
				},
				itemRejected: function(i, err) {
					progressCollection(err)
					props.done += 1
					props.Results[i] = err
					if (props.done == props.length) {
						resolveCollection(props.Results)
					}
				},
				itemProgress: noop
			}
		})
		//`some` method, gathers many promises and becomes resolved, when they all fullfilled with any results. But if all promises are rejected `some` also becomes rejected.
		Promise.some = PromiseCollection(function(props, resolveCollection, rejectCollection, progressCollection) {
			return {
				itemResolved: function(i, result) {
					progressCollection(result)
					props.done += 1;
					props.Results[i] = result
					if (props.done == props.length) {
						//return only successful results
						resolveCollection(props.Results.filter(function() {return true}))
					}
				},
				itemRejected: function(i, err) {
					progressCollection(err)
					props.done += 1
					props.error += 1
					props.ErrorResults[i] = err
					if (props.error == props.length) {
						//if all promise collection was rejected
						rejectCollection(props.ErrorResults)
					} else if (props.done == props.length) {
						resolveCollection(props.Results)
					}
				},
				itemProgress: noop
			}
		})
		
		//Determines if `value` is a Promise-like object
		Promise.isPromise = function(value) {
			return value && typeof value === 'object' && typeof value.then === 'function';
		}
		
		//expose `Promise` constructor and helpers
		return Promise;
	}(global));//`global` is an environment global variable


	

	// Promise of document 'DOMContentLoaded'
	Core.DOMReady = new Promise(function (onready, onabort) {
		var isReady,
			frameElement = 1;
		function complete() {
			if (isReady) return;
			//IEContentLoaded
			if (
				window.event
				&& window.event.type == 'readystatechange'
				&& document.readyState
				&& document.readyState !== 'complete'
			) return;

			isReady = true
			// remove handlers to clean memory
			// W3C
			if (window.addEventListener) {
				document.removeEventListener('DOMContentLoaded', complete, false)
				window.removeEventListener('load', complete, false)
			}
				// IE
			else if (window.attachEvent) {
				document.detachEvent('onreadystatechange', complete)
				window.detachEvent('onload', complete)
			}
			onready(document) //callback
		}

		// W3C
		if (window.addEventListener) {
			document.addEventListener('DOMContentLoaded', complete, false)
			// fallback. this is always called
			window.addEventListener('load', complete, false)
		}
			// IE
		else if (window.attachEvent) {
			// for iframes
			document.attachEvent('onreadystatechange', complete) //readyState checked in `complete` function
			// avoid frames with different domains issue
			try { frameElement = window.frameElement } catch (e) { }
			if (!frameElement && document.head.doScroll) {
				(function () {
					try {
						document.head.doScroll('left')
						complete()
					} catch (e) {
						setTimeout_10(arguments.callee)
						return;
					}
				}())
			}
			// fallback
			window.attachEvent('onload', complete)
		}
	})


	// Promise of window 'load'
	Core.DOMLoaded = new Promise(
		function (loaded, aborted) {
			function complete(e) {
				// remove handlers to clean memory
				// W3C
				if (window.addEventListener) {
					window.removeEventListener('load', complete, false)
					window.removeEventListener('abort', complete, false)
				}
					// IE
				else if (window.attachEvent) {
					window.detachEvent('onload', complete)
					window.detachEvent('onabort', complete)
				}
				e || (e = window.event)
				switch (e.type) {
					case 'load': loaded(window); break //callback
					case 'abort': aborted(new Error('Aborted')); break //callback
				}
			}

			// W3C
			if (window.addEventListener) {
				window.addEventListener('load', complete, false)
				window.addEventListener('abort', complete, false)
			}
				// IE
			else if (window.attachEvent) {
				window.attachEvent('onload', complete)
				window.attachEvent('onabort', complete)
			}
		},
		function () {
			//cancel page loading
			if (!!window.stop) window.stop()
			else if (!!document.execCommand) document.execCommand('Stop')
		}
	)
	
	// document.readyState polyfill
	if (document && !document.readyState) {
		document.readyState = 'loading'
		Core.DOMReady.then(function() { document.readyState = 'interactive' })
		Core.DOMLoaded.then(function() { document.readyState = 'complete' })
	}

	//Promise of included UI modules
	Core.UIReady = new Promise(function (loaded, error, progressed) {
		Core.DOMReady.then(
			function () {
				Promise.any(Includes).then(loaded, error, progressed)
			}, error, progressed
		)
	})

	
	//Because of dinamic loader DOMReady and DOMLoaded need to be deferred while necessary resources will be ready
	//Advanced DOMLoaded, that fulfills only when all (inclusive async) resources loaded
	Core.DOMLoaded = (function() {
		var loadedPromise = Core.DOMLoaded,
			resourcesPromise,
			Proms = [], i;

		return new Promise(function(loaded, aborted, progressed) {
			Core.DOMReady.then(function () {
				for (i in Resources.urls) {
					Proms.push(Resources.urls[i].promise)
				}
				resourcesPromise = Promise.any(Proms).and(loadedPromise).then(loaded, aborted, progressed)
			})
		}, function () {
			Core.DOMReady.cancel()
			for (i in Resources.urls) {
				Resources.urls[i].promise.cancel()
			}
			resourcesPromise && resourcesPromise.cancel()
			loadedPromise.cancel()
		})
	}())


	//Advanced DOMReady, that fulfills only when all sync or deferred resources loaded
	Core.DOMReady.then(
		function () {
			var Proms = [], resource, i;
			for (i in Resources.urls) {
				resource = Resources.urls[i]
				if (!resource.async) {
					Proms.push(resource.promise)
				}
			}
			return Promise.any(Proms);
		},
		function () {
			//on cancel
			var resource, i;
			for (i in Resources.urls) {
				resource = Resources.urls[i]
				if (!resource.async) {
					resource.promise.cancel()
				}
			}
		}
	)




	/* Loader 1.8 */
	//help for dev http://pieisgood.org/test/script-link-events/ 
	Core.load = function(src, options) {
		options || (options = {})

		//`options` may also be String of attributes/parameters, separated by space or comma: 'defer reload' or 'async, reload'
		if (typeof options === 'string') {
			options = {
				defer: /(^|\s*,\s*|\s+)defer($|\s*,\s*|\s+)/.test(options),
				async: /(^|\s*,\s*|\s+)async($|\s*,\s*|\s+)/.test(options),
				reload: /(^|\s*,\s*|\s+)reload($|\s*,\s*|\s+)/.test(options)
			}
		}
		
		var n,
			elem,
			loadPromise,
			isLoaded = false,
			isCanceled = false,
			textContent = '',
			timerId;

		//if first param is DOM element
		if (src && src.nodeName) {
			elem = src
			src = elem.getAttribute ? (elem.getAttribute('src') || elem.getAttribute('href')) : (elem.src || elem.href)
			switch (elem.nodeName.toLowerCase()) {
				//JavaScript files
				case 'script': options.type = 'script'; break
					//CSS files
				case 'style': case 'link': options.type = 'style'; break
					//Image files
				case 'img': options.type = 'image'; break
					//audio
				case 'audio': options.type = 'audio'; break
					//video
				case 'video': options.type = 'video'; break
				default: options.type = undefined
			}
			options.async = !!elem.async
			options.defer = !!elem.defer
		}
		
		if (!src) return Promise(elem);

		if (src instanceof Array) {
			return Promise.every(src.map(function(url) {
				return Core.load(url, options)
			}));
		}

		//if have to reload resource one more time
		if (options.reload && (src in Resources.urls)) {
			src = Core.URL.randomize(src)
		}

		//prevent double resource loading
		if (!options.reload && (src in Resources.urls)) {
			return Resources.urls[src].promise;
		}
		
		src = Core.template(src)  //process url variables
		n = src.split('?')[0].lastIndexOf('.')
		if (n == -1 && !options.type) {
			return Promise();
		}

		//define format of resource
		options.format || (options.format = (n == -1) ? undefined : src.split('?')[0].substr(n + 1))
		
		//define type of resource
		if (!options.type) {
			switch (options.format) {
				//JavaScript files
				case 'js': options.type = 'script'; break
					//CSS files
				case 'css': options.type = 'style'; break
					//Image files
				case 'jpg': case 'jpeg':
				case 'gif': case 'png':
				case 'svg': case 'webp':
				case 'bmp': options.type = 'image'; break
					//fonts
				case 'woff': case 'eot':
				case 'ttf': case 'otf': options.type = 'font'; break
					//audio
				case 'mp3': case 'ogg':
				case 'wav': case 'aac':
				case 'm4a': options.type = 'audio'; break
					//video
				case 'mp4': case 'ogv':
				case 'webm': case 'ogv':
				case 'avi': case 'mov':
				case 'm4v': options.type = 'video'; break
					//json files
				case 'json': options.type = 'json'; break
					//text files
				case 'html': case 'htm':
				case 'txt': case 'tpl': options.type = 'text'; break
					//default undefined type of resource
				default: options.type = undefined
			}
		}

		switch (options.type) {
			case 'script':
				loadPromise = new Promise(function(loaded, failed, progress) {
					//Reference:
					//	https://spreadsheets.google.com/lv?key=tDdcrv9wNQRCNCRCflWxhYQ
					//	http://www.phpied.com/preload-cssjavascript-without-execution/

					//BUGS:
					// - 'onerror' callbacks not always preserve execution order
					// - in Safari triggers 'onload' instead of 'onerror' for external resources
					// - cancelation of loading (as Promise) does not cancel script loading, because of browsers behavior. File request still will be alive, but Promise will be rejected with canceled state. It may cause unnecessary delay in deferred sequence.
					// - in IE 6-9 alert during loading may cause 'onerror'


					elem = elem || document.createElement('script')
					elem.type = elem.type || 'text/javascript'

					//predefine possible error message
					failed = failed.bind(null, new Error('Error 404: Script \'' + src + '\' not found'))

					//old webkit (v534.13 and lower) has no execution order for dinamicly created scripts
					var isBrokenOrderBrowser = (function() {
						var match;
						if (!navigator.userAgent) return false;
						match = /(webkit)[\/]([\w.]+)/i.exec(navigator.userAgent)
						//check version of webkit
						if (match && match[2]) return (parseFloat(match[2], 10) <= 534.13);
						return false;
					}()),
						//Opera, that do not support 'defer' and 'async', and always loads scripts synchronously
						isOldOpera = !!(window.opera && Object.prototype.toString.call(window.opera) == "[object Opera]" && !('async' in elem)),
						len, script;

					//'defer' fallback for deferred loading
					if (isBrokenOrderBrowser && options.defer) {
						// First script is prefetched, after that it is inserted to DOM in correct order one by one to be executed.
						len = Resources.sequence.js.length;

						elem.onload = function () {
							if (isLoaded) return
							//else
							this.onload = this.onerror = null
							isLoaded = true
							loaded(elem) //callback
						}
						elem.onerror = function (e) {
							this.onload = this.onerror = null
							isCanceled = true
							this.parentNode && this.parentNode.removeChild(this)
							failed() //errorback
						}
						elem.defer = true
						elem.async = false

						//Add to resource collection
						Resources.add(src, options, noop) //empty function need to be here
						//setup SRC, considering cache
						elem.src || (elem.src = Core.config.cache ? src : Core.URL.randomize(src))

						//start prefetch in parallel way
						script = document.createElement('script')
						script.type = 'text/prefetch'
						script.onload = function () {
							if (len) {
								Resources.urls[Resources.sequence.js[len - 1]].promise.then(function () {
									//insert to DOM, after previous resorce loaded
									document.head.appendChild(elem)
								}, function () {
									//insert to DOM, after previous resorce loaded
									document.head.appendChild(elem)
								})
							}
							else {
								//insert to DOM
								document.head.appendChild(elem)
							}
						}
						script.src = elem.src
						document.head.appendChild(script)
					}

						//Async
					else if (options.defer || options.async) {
						//options.defer - Parallel loading. Scripts will be ready in order, that they are loaded, but executed in right order.
						//options.async - Cancels `defer`. Parallel loading. Scripts will be executed in order, that they are loaded.

						//for old IE < 10
						if (!-[1, ] || (document.documentMode && document.documentMode <= 9)) {
							if (options.async) {
								//Add to resource collection
								Resources.add(src, options)
							}
							else {
								//Add to resource collection and attach handler to be executed in correct order
								Resources.add(src, options, function() {
									//insert to DOM
									//document.body ? document.body.appendChild(elem) : document.head.appendChild(elem)
									document.head.appendChild(elem)
									//because IE can't detect 404
									if (elem.readyState == 'loading') {
										elem.onerror() //call errorback
									} else {
										isLoaded = true
										elem.onreadystatechange = elem.onerror = null
										loaded(elem) //callback
									}
								})
							}
							
							elem.onreadystatechange = function() {
								if (isLoaded) return;
								if (this.readyState && !/complete|loaded/.test(this.readyState)) {
									progress(this.readyState) //progressback
								}
								else if (options.async) {
									//insert to DOM
									//document.body ? document.body.appendChild(elem) : document.head.appendChild(elem)
									document.head.appendChild(elem)
									//because IE can't detect 404
									if (elem.readyState == 'loading') {
										elem.onerror() //call errorback
									} else {
										isLoaded = true
										this.onreadystatechange = this.onerror = null
										loaded(elem) //callback
									}
								} else {
									Resources.ready(src)
								}
								
							}
						}
							//for sane browsers
						else {
							//Add to resource collection
							Resources.add(src, options)
							elem.onload = function() {
								isLoaded = true
								this.onload = this.onerror = null
								loaded(elem) //callback
							}
							//insert to DOM
							document.head.appendChild(elem)
						}

						elem.onerror = function (e) {
							isCanceled = true
							this.onload = this.onreadystatechange = this.onerror = null
							this.parentNode && this.parentNode.removeChild(this)
							//to not break sequence
							if (!options.async) {
								Resources.notReady(src) //404
							}
							failed() //errorback
						}

						//for Opera, imitate asynchronous execution, to preserve UI rendering blocking
						timerId = Util.asyncCall(isOldOpera, function() {
							if (options.async) {
								elem.defer = true //for fallback
								elem.async = true
							}
							else {
								elem.defer = true
								elem.async = false
							}
							//setup SRC, considering cache
							elem.src || (elem.src = Core.config.cache ? src : Core.URL.randomize(src))
							
						})
					}

						//Sync
					else {
						//Scripts executes emediatly as they are loaded. Rendering stops until script is not loaded. Browser rendering flow is blocked. Code from script may be used after Core.load() declaretion.

						//Add to resource collection
						Resources.add(src, options)
						Core.requestSync(src).then(
							function(textContent) {
								isLoaded = true
								elem.setAttribute('data-src', src)
								//catch error in IE
								try {
									elem.innerHTML = textContent// + '\n//@ sourceURL="'+src+'"'
								} catch (err) {
									elem.text = textContent// + '\n//@ sourceURL="' + src + '"'
								}
								//insert to DOM
								document.head.appendChild(elem)
								loaded(elem) //callback
							},
							function() {
								isCanceled = true
								failed() //errorback
							}
						)
						
					}

				},
				//on cancel loading
				function () {
					// if Promise fulfilled
					if (isLoaded || isCanceled) return
					isCanceled = true
					elem.onload = elem.onreadystatechange = elem.onerror = null
					//elem.src && (elem.src = '#')
					//stop any delayed execution
					clearTimeout(timerId)
					//remove element from DOM
					elem.parentNode && elem.parentNode.removeChild(elem)
					//to not break sequence
					if (options.defer && !options.async) {
						Resources.notReady(src) //404
					}
				})
				break;

			case 'style':
				loadPromise = new Promise(function (loaded, failed, progress) {
					//Reference:
					//	http://www.backalleycoder.com/2011/03/20/link-tag-css-stylesheet-load-event/
					//	http://www.phpied.com/when-is-a-stylesheet-really-loaded/

					// ISSUES: 
					// - in Firefox < 8: 'onerror' not accures because of fallback tricks. 'load' event accures instead.
					// - in IE and Safari: if css-file is empty or has no styles, browser triggers 'onerror'.

					//predefine possible error message
					failed = failed.bind(null, new Error('Error 404: CSS \'' + src + '\' not found'))

					//Async
					if (options.defer || options.async) {
						if (options.async) {
							//Add to resource collection
							Resources.add(src, options)
						}
						else {
							//Add to resource collection and attach handler to be executed in correct order
							Resources.add(src, options, function () {
								//change place in DOM, to change cascading rules
								document.head.appendChild(elem)
								isLoaded = true
								loaded(elem) //callback
							})
						}

						elem = document.createElement('link')
						elem.rel = 'stylesheet'
						elem.type = 'text/css'
						if (options.media) {
							elem.media = options.media
						}

						//check support for onload event. Next variables are used for workarounds.
						//some browsers don't support 'onload' & 'onerror'
						var isOnloadNotSupported = (elem.onload !== null),
							//Browsers that do nothing. It is Safari
							isBrokenBrowser = (Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0) || (/android|silk/.test(navigator.userAgent.toLowerCase() || navigator.vendor.toLowerCase())),
							//Opera just do nothing when 404
							isOnerrorNotSupported = (window.opera && Object.prototype.toString.call(window.opera) == "[object Opera]"),
							//IE trigers 'onload' even when 404
							isIE = ('readyState' in elem);

						elem.onload = function () {
							//Fix absent 'onerror'. Check for CSS rules in syle sheet.
							if (isIE) {
								try {
									if (
										elem.sheet && elem.sheet.cssRules && elem.sheet.cssRules.length
										|| elem.styleSheet && elem.styleSheet.rules && elem.styleSheet.rules.length
									) {
										//success, then continue
									}
									else {
										elem.onerror() //call errorback
										return; //exit function
									}
								} catch (err) {
									elem.onerror() //call errorback
									return; //exit function
								}
							}

							//clean
							this.onload = this.onreadystatechange = this.onerror = null
							if (options.async) {
								//change place in DOM, to change cascading rules
								document.head.appendChild(this)
								isLoaded = true
								loaded(elem) //callback
							}
							else {
								//remove from DOM to prevent effect on page untill it will be reinsered to another place to change queue
								document.head.removeChild(this)
								Resources.ready(src)
							}
						}
						//IE exclusive
						elem.onreadystatechange = function () {
							if (!/complete|loaded/.test(this.readyState)) {
								progress(this.readyState) //progressback
							}
						}
						elem.onerror = function (e) {
							this.onload = this.onreadystatechange = this.onerror = null
							isCanceled = true
							this.parentNode && this.parentNode.removeChild(this)
							//to not break sequence
							if (!options.async) {
								Resources.notReady(src) //404
							}
							failed() //errorback
						}

						//setup SRC, considering cache
						elem.href = Core.config.cache ? src : Core.URL.randomize(src)
						//execution depends on async or not async
						Util.asyncCall(options.async, function () {
							//insert to DOM
							document.head.appendChild(elem)

							//fix absent 'onerror'
							if (isOnerrorNotSupported) {
								Core.URL.isAvailableAsync(elem.href).then(function (isAvail) {
									if (!isAvail) elem.onerror && elem.onerror() //404, call errorback
								})
							}
							//fix absent 'onload'
							var style, pollingId;
							if (isOnloadNotSupported) {
								//detect 404
								//Core.URL.isAvailableAsync(elem.href).then(function (isAvail) {
								//	if (!isAvail) {
								//		elem.onerror && elem.onerror()
								//		return
								//	}
								//Style import trick
								style = document.createElement('style');
								style.type = 'text/css'
								style.textContent = '@import "' + elem.href + '"'
								pollingId = setInterval_15(function () {
									try {
										style.sheet.cssRules; // accessable when loaded
										elem.onload && elem.onload()
										clearInterval(pollingId)
										//remove from DOM
										style.parentNode && style.parentNode.removeChild(style)
										//clean
										style = pollingId = undefined
									} catch (e) { }
								})
								//insert to DOM
								document.head.appendChild(style)
								//})
							}
								//fix absent 'onload' and 'onerror'
							else if (isBrokenBrowser) {
								pollingId = setInterval_15(function() {
									try {
										//elem.sheet.cssRules; // accessable when loaded
										if (/*elem.sheet.cssRules &&*/ elem.sheet.cssRules.length) {
											elem.onload && elem.onload() //call callback
										} else {
											elem.onerror && elem.onerror() //call errorback
										}
										clearInterval(pollingId)
										pollingId = undefined
									} catch (err) {
										//for Safari 5. It has cross-origin restriction.
										//next is stolen from 'yepnope'
										//console.log(err)
										if ((err.code == 1e3) || (err.message == 'security' || err.message == 'denied')) {
											// if it's a security error, that means it loaded a cross domain file, 
											// so we can't do anything beside to call 'onload'
											elem.onload && elem.onload()
											clearInterval(pollingId)
											pollingId = null
										}
									}
								})

							}
						})
					}

						//Sync
					else {
						//Add to resource collection
						Resources.add(src, options)
						Core.requestSync(src).then(
							function(textContent) {
								textContent = Util.relocateCSS(textContent, src, location.href)//fix all URLs
								elem = Util.injectCSS(textContent, { 'data-src': src, 'media': options.media })
								isLoaded = true
								loaded(elem) //callback
							},
							function(err) {
								isCanceled = true
								failed() //errorback
							}
						)
					}
				},
				//on cancel loading
				function () {
					// if Promise fulfilled
					if (isLoaded || isCanceled) return
					isCanceled = true
					elem.onload = elem.onreadystatechange = elem.onerror = null
					//elem.href && (elem.href = '#')
					//stop any delayed execution
					clearTimeout(timerId)
					//remove element from DOM
					elem.parentNode && elem.parentNode.removeChild(elem)
					//to not break sequence
					if (options.defer && !options.async) {
						Resources.notReady(src) //404
					}
				})
				break;

			case 'image':
				loadPromise = new Promise(function (loaded, failed, progress) {
					//BUGS: 
					//	- if cache is anabled, in FF image is loaded successfully even if loading was canceled, because it was already in cache
					//	- onabort works only in IE and only if image is inserted in DOM. If image is not in DOM in IE, it can't be aborted.
					//	- in FF cancelation don't stop downloading of image

					// Image loading can't be synchronous, by default it is asynchronous.

					// callbacks may have call order
					if (options.defer && !options.async) {
						// Add to resource collection and attach handler to be executed in correct order.
						// Images load as soon as they are ready, but callbacks execute in right sequence.
						// Images has their own sequence, that not relative to 'js' or 'css' etc.
						Resources.add(src, options, function () {
							isLoaded = true
							loaded(elem) //callback
						})
					} else {
						// Add to resource collection
						Resources.add(src, options)
					}

					elem = elem || new Image()
					elem.onload = elem.onreadystatechange = function() {
						clearInterval(timerId)
						if (this.readyState && !/complete|loaded/.test(this.readyState)) {
							progress(elem, this.readyState) //progressback
							return
						}
						//else
						this.onload = this.onreadystatechange = this.onerror = this.onabort = null
						// if callbacks have call order
						if (options.defer && !options.async) {
							Resources.ready(src)
						} else {
							isLoaded = true
							loaded(elem) //callback
						}
					}
					elem.onerror = function(e) {
						clearInterval(timerId)
						this.onload = this.onreadystatechange = this.onerror = this.onabort = null
						isCanceled = true
						failed(new Error('Error 404: Image \'' + src + '\' not found')) //errorback
					}
					//window.onabort
					elem.onabort = function() {
						clearInterval(timerId)
						this.onload = this.onreadystatechange = this.onerror = this.onabort = null
						isCanceled = true
						failed(new Error('Aborted')) //errorback
					}
					//setup SRC, considering cache
					elem.src || (elem.src = (Core.config.cache && Core.config.cacheImages) ? src : Core.URL.randomize(src))

					timerId = setInterval_15(function() {
						//check image sizes
						if (elem.width) {
							clearInterval(timerId)
							progress(elem, elem.readyState || 'uninitialized') //progressback
						}
					})

					//if image cached sometimes onload doesn't handle
					if (elem.complete && elem.onload) { elem.onload() }
				},
				//on cancel loading
				function () {
					if (isLoaded || isCanceled) return
					isCanceled = true
					elem.onload = elem.onreadystatechange = elem.onabort = elem.onerror = null
					//stop any delayed execution
					clearInterval(timerId)
					elem.src = '#'
					//to not break sequence
					if (options.defer && !options.async) {
						Resources.notReady(src) //404
					}
				})
				break;
			
			case 'audio':
			case 'video':
			case 'media':
				loadPromise = new Promise(function(loaded, failed, progress) {
					//Reference:
					// http://remysharp.com/2010/12/23/audio-sprites/
					// http://www.whatwg.org/specs/web-apps/current-work/multipage/the-video-element.html#attr-media-crossorigin
					// http://blog.millermedeiros.com/html5-video-issues-on-the-ipad-and-how-to-solve-them/
					// http://my.opera.com/core/blog/2010/03/03/everything-you-need-to-know-about-html5-video-and-audio-2
					// http://www.sitepoint.com/essential-audio-and-video-events-for-html5/ 
					// http://www.w3schools.com/tags/ref_av_dom.asp
					// http://tiffanybbrown.com/2010/07/05/the-html5-video-progress-event/

					/*ISSUES:
					- iOS can't preload media
					- Because of Blink (Chrome, Opera, ...) preload issue workaround there is little audio artefact
						if start playing after full load, and when protocol is "http:".
					- IE9 (and IE10?) has an internal limit of 41 simultaneous audio and video elements/objects. The 42nd won't be loaded.
					- limit: Win8 IE10 about 870 media elements
					- limit: Win7 IE9-10 41 media elements
					- limit: Win8 Chrome about 90 media elements
					- limit: Win7 Chrome about 250 media elements
					- recomended: configure server for multiple access for single file

					*/
					// Audio/Video loading can't be synchronous, by default it is asynchronous.

					// callbacks may have call order
					if (options.defer && !options.async) {
						// Add to resource collection and attach handler to be executed in correct order.
						// Images load as soon as they are ready, but callbacks execute in right sequence.
						// Images has their own sequence, that not relative to 'js' or 'css' etc.
						Resources.add(src, options, function () {
							isLoaded = true
							loaded(elem) //callback
						})
					} else {
						// Add to resource collection
						Resources.add(src, options)
					}

					elem = elem || (options.type == 'audio') ? document.createElement('audio') : document.createElement('video')
					elem.autoplay = false
					elem.preload = 'auto'
					elem.autobuffer = true
					//check support
					if (!elem.play) {
						failed(new Error('MEDIA_ERR_SRC_NOT_SUPPORTED'))
						return;
					}
					
					var isProblemWebkit = !!window.webkitURL,//try to detect Blink browsers
						onProgress = function (e) {
							//console.log(this.buffered.length && (this.duration - this.buffered.end(0)))
							//console.log(this.buffered.length)
							//console.log(e, e.loaded, e.total)

							//Dirty job. Blink browsers do not load files fully, so make them to do this
							clearTimeout(timerId)
							if (isProblemWebkit && this.buffered.length && (this.currentTime < this.buffered.end(0)) && this.paused && !this.ended) {
								timerId = setTimeout(function () {
									elem.currentTime = parseInt(elem.buffered.end(0) + elem.buffered.end(0) * 0.1)
								}, 50)
							}
							
							//if buffer is not full, than it is not loaded
							if (e.type != 'load') {
								//current browsers
								if (this.buffered && !(this.buffered.length && ((this.buffered.end(0) - this.duration).toFixed(3) >= 0))){
									progress(
										e.type,
										this.buffered.length && (this.buffered.end(0) / this.duration).toFixed(5) || 0,
										elem
									) //progressback (status, progress, audioElement)
									return;
								}
									//old browsers
								else if (!this.buffered && !(e.total > 0 && ((e.loaded - e.total) >= 0))) {
									//e.lengthComputable
									progress(
										e.type,
										e.total && (e.loaded / e.total).toFixed(5) || 0,
										elem
									) //progressback (status, progress, audioElement)
									return;
								}
							}
							//else it is loaded
							clearTimeout(timerId)
							if (isProblemWebkit && (this.ended || this.paused) && !elem.complete) {
								this.currentTime = 0
							}
							elem.cleanHandlers()
							// if callbacks have call order
							if (options.defer && !options.async) {
								Resources.ready(src)
							} else {
								isLoaded = true
								loaded(elem) //callback
							}
						},
						onError = function(e) {
							var i, err,
								code = e.target.error.code,
								MediaError = e.target.error.constructor;
							
							for (i in MediaError) {
								if (MediaError[i] == code) {
									err = i
									break;
								}
							}
							elem.cleanHandlers()
							isCanceled = true
							failed(new Error(err)) //errorback
						},
						onAbort = function() {
							elem.cleanHandlers()
							isCanceled = true
							failed(new Error('Aborted')) //errorback
						};

					elem.cleanHandlers = function() {
						//crazyness for IE10- and Blink 30-
						if ('oncanplay' in elem) {
							elem.onloadstart = elem.ondurationchange = elem.onloadedmetadata =
							elem.onloadeddata = elem.onprogress = elem.oncanplay = elem.oncanplaythrough =
							elem.onload = elem.onerror = elem.oncancel = elem.onabort = null
						}
						else {
							Util.removeDOMEvent(elem, 'loadstart', onProgress)
							Util.removeDOMEvent(elem, 'durationchange', onProgress)
							Util.removeDOMEvent(elem, 'loadedmetadata', onProgress)
							Util.removeDOMEvent(elem, 'loadeddata', onProgress)
							Util.removeDOMEvent(elem, 'progress', onProgress)
							Util.removeDOMEvent(elem, 'canplay', onProgress)
							Util.removeDOMEvent(elem, 'canplaythrough', onProgress)
							Util.removeDOMEvent(elem, 'load', onProgress)

							Util.removeDOMEvent(elem, 'error', onError)

							Util.removeDOMEvent(elem, 'cancel', onAbort)
							Util.removeDOMEvent(elem, 'abort', onAbort)
						}
						delete this.cleanHandlers
					}

					//crazyness for IE10- and Blink 30-
					if ('oncanplay' in elem) {
						elem.onloadstart = elem.ondurationchange = elem.onloadedmetadata =
						elem.onloadeddata =	elem.onprogress = elem.oncanplay = elem.oncanplaythrough =
						elem.onload = onProgress

						elem.onerror = onError

						elem.oncancel =	elem.onabort = onAbort
					} else {
						Util.addDOMEvent(elem, 'loadstart', onProgress)
						Util.addDOMEvent(elem, 'durationchange', onProgress)
						Util.addDOMEvent(elem, 'loadedmetadata', onProgress)
						Util.addDOMEvent(elem, 'loadeddata', onProgress)
						Util.addDOMEvent(elem, 'progress', onProgress)
						Util.addDOMEvent(elem, 'canplay', onProgress)
						Util.addDOMEvent(elem, 'canplaythrough', onProgress)
						Util.addDOMEvent(elem, 'load', onProgress)

						Util.addDOMEvent(elem, 'error', onError)

						Util.addDOMEvent(elem, 'cancel', onAbort)
						Util.addDOMEvent(elem, 'abort', onAbort)
					}
					
					//setup SRC, considering cache
					elem.src || (elem.src = (Core.config.cache && Core.config.cacheMedia) ? src : Core.URL.randomize(src))
						
					//if media is already loaded(complete)
					if (this.buffered && this.buffered.length && ((this.buffered.end(0) - this.duration).toFixed(3) >= 0)) {
						elem.complete = true
						onProgress({type: 'load'})
					}
						//else start preload
					else if (!elem.duration) {
						elem.load() // Only IE9+ and Firefox deals correctly with this
					}
				},
				//on cancel loading
				function () {
					if (isLoaded || isCanceled) return;
					isCanceled = true
					elem.cleanHandlers && elem.cleanHandlers()
					//stop any delayed execution
					clearTimeout(timerId)
					elem.removeAttribute("src")
					elem.load()
					//to not break sequence
					if (options.defer && !options.async) {
						Resources.notReady(src) //404
					}
				})
				break;

			case 'json':
				loadPromise = new Promise(function (loaded, failed, progress) {
					//Defer
					if (options.defer && !options.async) {
						// Add to resource collection and attach handler to be executed in correct order.
						// JSONs has their own sequence, that is not relative to 'js' or 'css' etc.
						Resources.add(src, options, function () {
							isLoaded = true
							loaded(textContent) //callback
						})
					}
						//Async or sync
					else {
						// Add to resource collection
						Resources.add(src, options)
					}

					//Async or defer or sync
					elem = Core[(options.defer || options.async) ? 'requestAsync' : 'requestSync'](src).then(
						function(result) {
							try {
								textContent = Core.JSON.parse(result)
								if (options.defer && !options.async) {
									Resources.ready(src)
								} else {
									isLoaded = true
									loaded(textContent) //callback
								}
							} catch (err) {
								isCanceled = true
								failed(err) //errback
							}
						},
						function (err) {
							isCanceled = true
							failed(err) //errback
						},
						function (val) { progress(val) }
					)
				},
				//on cancel loading
				function () {
					if (isLoaded || isCanceled) return;
					isCanceled = true
					//cancel Promise `requestAsync`
					elem && elem.cancel()
					//to not break sequence
					if (options.defer && !options.async) {
						Resources.notReady(src) //404
					}
				})
				break;

			case 'jsonp':
				loadPromise = new Promise(function(loaded, failed, progress) {
					var callbackName = 'coreJsonCallback_' + Math.round(Math.random() * Math.pow(10, 15)),
						match;

					if (!/(\?|\&)callback=/.test(src)) {
						src += (src.indexOf('?') === -1 ? '?' : '&') + 'callback=' + callbackName
					} else {
						match = /callback=((.+)&|(.+)$)/.exec(src)
						callbackName = match[2] || match[3]
					}
					//save `callbacName` in outer scope
					textContent = callbackName
					window[callbackName] = function(/*data*/) {
						delete window[callbackName]
						isLoaded = true
						loaded.apply(null, arguments)//callback
					}
					options.type = 'script'
					elem = Core.load(src, options).then(null, function(err) {
						delete window[callbackName]
						isCanceled = true
						failed(err) //errback
					}, progress)
				},
				//on cancel loading
				function () {
					if (isLoaded || isCanceled) return;
					isCanceled = true
					//cancel Promise
					elem && elem.cancel()
					//destroy handler
					delete window[textContent]
				})
				break;

			case 'text':
			default:
				loadPromise = new Promise(function(loaded, failed, progress) {
					//async, defer - Nothing will be inserted into document. Returned value is a String.
					//sync - Requested text emediatly will be inserted to document. Returned value is a String.

					//Defer
					if (options.defer && !options.async) {
						// Add to resource collection and attach handler to be executed in correct order.
						// Documents has theire own sequence, that not relative to 'js' or 'css' etc.
						Resources.add(src, options, function() {
							isLoaded = true
							loaded(textContent) //callback
						})
					}
						//Async or sync
					else {
						// Add to resource collection
						Resources.add(src, options)
					}

					//Async or defer or sync
					elem = Core[(options.defer || options.async) ? 'requestAsync' : 'requestSync'](src).then(
						function(result) {
							try {
								//process variables in text if resorce defined as a text file
								textContent = (options.type == 'text') ? Core.template(result) : result
								if (options.defer && !options.async) {
									Resources.ready(src)
								} else {
									if (!options.async && options.type == 'text') {
										//insert to DOM if resorce defined as a text file, otherwise just return the text content
										document.writeln(textContent)
									}
									isLoaded = true
									loaded(textContent) //callback
								}
							} catch (err) {
								isCanceled = true
								failed(err) //errback
							}
							
						},
						function(err) {
							isCanceled = true
							failed(err) //errback
						},
						function(val) { progress(val) }
					)
				},
				//on cancel loading
				function () {
					if (isLoaded || isCanceled) return
					isCanceled = true
					//stop any delayed execution
					clearTimeout(timerId)
					//cancel Promise `requestAsync`
					elem && elem.cancel()
					//to not break sequence
					if (options.defer && !options.async) {
						Resources.notReady(src) //404
					}
				})
		}

		//save promise in sorces collection to be used on every double request
		Resources.urls[src].promise = loadPromise

		//retur Promise object
		return loadPromise;
	}


	


	/* Module constructor */

	Module = function(moduleName, moduleBody) {
		this.body = moduleBody
		this.style = null //switchable styles - style/link object
		this.name = moduleName
		this.url = '.'
		this.initiated = false
		this.promise = Promise() //empty resolved Promise
		this.sandbox = undefined //will be changed in future
	}

	Module.prototype.start = function() {
		var module = this;
		if (!module.initiated) {
			//if module has switchable styles
			if (module.body.css) {
				module.style = Util.injectCSS(module.body.css, { 'data-module': module.name })
			}
			
			//if has initialization function
			if (typeof module.body.init === 'function') {
				try {
					module.promise = Promise(module.body.init()) // start module life and save last Promise
					module.initiated = true //switch initiated status
				} catch (err) {
					//remove styles back 
					module.style && document.head.removeChild(module.style)
					module.style = null
					Util.fixError(err) //implement err.line
					module.promise = new Promise().cancel().then(null, function() { return err }) //return rejected promise
				}
			}
			else {
				module.initiated = true //switch initiated status
			}
		}

		return module.promise;
	}

	Module.prototype.stop = function() {
		var module = this;

		if (module.initiated) {
			//if has destoying function
			if (typeof module.body.destroy === 'function') {
				try {
					module.promise = Promise(module.body.destroy()) // end module life and save last Promise
					module.initiated = false //switch initiated status
					module.body.runtime_listen && (module.body.runtime_listen = undefined) //remove runtime listeners
				} catch (err) {
					Util.fixError(err) //implement err.line
					module.promise = new Promise().cancel().then(null, function() { return err }) //return rejected promise
				}
			}
			else {
				module.promise = Promise() // end module life and save last Promise
				module.initiated = false //switch initiated status
				module.body.runtime_listen && (module.body.runtime_listen = undefined) //remove runtime listeners
			}
		}

		//if module has switchable styles
		if (!module.initiated && module.style && document) {
			document.head.removeChild(module.style)
			module.style = null
		}

		return module.promise;
	}




	/* Sandbox constructor */
	//Creates new sandbox instance
	Sandbox = function(moduleName) {
		this.template = Templater(this)//pass new sandbox as a context
		this.moduleName = moduleName
		this.moduleUrl = '.'
	}

	Sandbox.prototype.hasFeature = function(featureName) {
		var feature;
		if (typeof featureName !== 'string') return;
		if (featureName in Core.Features) {
			feature = Core.Features[featureName]
			return (typeof feature === 'function') ? feature() : feature;
		}
		return false;
	}

	//Alias for `Core.load(url, options)`, but with additional context templating rules for URLs
	Sandbox.prototype.load = function(url) {
		url = this.template(url) //apply module variables
		return Core.load.apply(Core, arguments);
	}

	Sandbox.prototype.Promise = Promise

	//alternative way to add listener of core events. These events are removed on every stopping of Module, so they may be used in init()
	Sandbox.prototype.listen = function(eventType, handler) {
		if (eventType && handler && ModulesRegistry[this.moduleName]) {
			ModulesRegistry[this.moduleName].body.runtime_listen || (ModulesRegistry[this.moduleName].body.runtime_listen = {})
			var listener = ModulesRegistry[this.moduleName].body.runtime_listen[eventType] || [];
			listener = (listener instanceof Array) ? listener.concat(handler) : [listener].concat(handler)
			ModulesRegistry[this.moduleName].body.runtime_listen[eventType] = listener
		}
		return this;  // return Sandbox object
	}

	//Generates action in Core with attached details.
	Sandbox.prototype.action = function(actionType, detail) {
		if (actionType && (actionType in Actions)) {
			detail = (detail && typeof detail === 'object') ? detail : {}
			var i = 0, func;
			while (func = Actions[actionType][i++])
				func(detail, {
					type: actionType,
					targetName: this.moduleName,
					timeStamp: (new Date()).getTime(),
					detail: detail
				})
		}
		return this; // return Sandbox object
	}

	//Ads new templating rule for sandbox.template() call
	Sandbox.addTemplateRule = function(regexp, result) {
		SandboxTemplateRules.push({ regexp: regexp, result: result })
	}

	//module templating rules
	Sandbox.addTemplateRule(/{module:url}/g, function (context) { return context.moduleUrl })
	Sandbox.addTemplateRule(/{module:name}/g, function (context) { return context.moduleName })
	//Sandbox.addTemplateRule(/{data:.+}/g, function (context) { return ModulesRegistry[context.moduleName] ? (ModulesRegistry[context.moduleName].body.data || '') : undefined })


	


	/* Templater factory */
	
	var Templater = function (sandbox) {
		var context = sandbox || {}; //context is a module sandbox

		return function (string) {
			if (!(typeof string == 'string' || string instanceof String)) return '';
			var	parseRule = function (rule) {
				var regexp = rule.regexp,
					result;
				if (typeof rule.result === 'function') {
					result = rule.result(context)
				}
				if (result !== undefined && result !== null) {
					string = string.replace(regexp, result)
				}
			};
			//parse context rules first
			sandbox && SandboxTemplateRules.forEach(parseRule)
			//then common rules
			TemplateRules.forEach(parseRule)

			return string; //return new string
		}
	}

	Core.template = Templater()

	//Ads new templating rule for Core.template() call
	Core.addTemplateRule = function(regexp, result) {
		TemplateRules.push({regexp: regexp,	result: result})
	}

	//base Core variables
	Core.addTemplateRule(/{baseUrl}/gi, function () { return Core.config.baseUrl })
	//DOM
	Core.addTemplateRule(/{location:protocol}/g, location.protocol)
	Core.addTemplateRule(/{location:search}/g, function() { return location.search ? location.search.substr(1) : '' })
	Core.addTemplateRule(/{location:url}/g, function() { return location.protocol ? (location.protocol + '//' + location.host + location.pathname) : '' })
	Core.addTemplateRule(/{location:hash}/g, function() { return location.hash ? location.hash.substr(1) : '' })


	






	/*Utility Functions*/
	
	var Util = Core.Util = {} //private utilities
		
	//Limited frequency of function execution
	Util.limited = function(func, ms) {
		var callRemains = false,
			lastCallDate = null;
		if (ms) { //use timeout
			return function() {
				var context = this,
					args = arguments,
					nowDate = new Date().getTime();
				if (!lastCallDate || nowDate - lastCallDate >= ms) {
					lastCallDate = nowDate
					func.apply(context, args)
				}
			}
		}
		else { //use animation frame
			return function() {
				var context = this,
					args = arguments;
				if (!callRemains) {
					callRemains = true
					requestAnimationFrame(function() {
						callRemains = false
						func.apply(context, args)
					})
				}
			}
		}
	}

	//Delay function execution until rapid calling will end/stop
	Util.deferred = function(func, ms) {
		var timer = null;
		if (ms) { //use timeout
			return function() {
				var that = this,
					args = arguments;
				if (timer) { clearTimeout(timer) }
				timer = setTimeout(function() {
					func.apply(that, args)
					timer = null
				}, ms)
			}
		}
		else { //use animation frame
			return function() {
				var context = this,
					args = arguments;
				if (timer) { clearTimeout(timer) }
				timer = setTimeout(function() {
					requestAnimationFrame(function() {
						func.apply(context, args)
						timer = null
					})
				}, 85)
			}
		}
	}

	//Cross browser XmlHttpRequest constructor
	Util.XHR = function() {
		var HttpRequest;
		HttpRequest = (function () {
			try { return new XMLHttpRequest() } catch (err) { }
			try { return new ActiveXObject("Msxml2.XMLHTTP") } catch (err) { }
			try { return new ActiveXObject("Microsoft.XMLHTTP") } catch (err) { }
		}())
		if (!HttpRequest) {
			HttpRequest = {}
			HttpRequest.open = HttpRequest.send = noop
			Core.error('No Support: XMLHttpRequest')
		}
		return HttpRequest;
	}

	//Error line number absence fixing
	Util.fixError = function(err) {
		err.line = err.line || err.lineNumber || (function () {
			if (!err.stack) return 0;
			var Stacks = err.stack,
				line;
			//remove first message string in Chrome
			Stacks = Stacks.replace(new RegExp('(\.+): ' + err.message + '\n'), '')
			//devide errors in stack
			Stacks = Stacks.split('\n')
			//strip line number
			line = Stacks[0].replace(/(\s+|\))$/i, '').match(/:\d(:?\d)*$/g)
			line = (line && line.length) ? line[0].substr(1) : '*'
			return line
		}())
		//try to find the file in what an error accured
		err.source = (err.sourceURL || err.fileName || (function () {
			return ''
		}())).split('?')[0]
		return err;
	}

	//Request for text content of any file. Used for internal tasks
	Util.requestTextContent = function(url, isAsync) {
		return new Promise(function (complete, error) {
			var xhr = new Util.XHR;
			url = Core.template(url)
			try {
				xhr.open('GET', Core.config.cache ? url : Core.URL.randomize(url), isAsync)
				xhr.onreadystatechange = function () {
					if (xhr.readyState == 4) {
						//normal
						if (xhr.status == 200)
							complete(xhr.responseText) //success
							//local
						else if (xhr.status == 0 && xhr.responseText) {
							complete(xhr.responseText) //success
						} else {
							error(new Error('Error 404: file \'' + url + '\' was not found')) //fail
						}
						//clean
						this.onreadystatechange = null
					}
				}
				xhr.send(null)
				//crossdomain
			} catch (err) {
				error(err) //fail
			}
		})
	}

	//Evaluate JavaScript expression in closed function scope. `var` and `return` statements are not allowed
	Util.execute = function(expression) {  //returns result
		return (new Function('return (' + expression + ')'))();
	}

	//Call function asynchronously or not
	Util.asyncCall = function(isAsync, func) {
		return isAsync ? setTimeout_1(func) : (undefined, func())
	}

	//Recursively merges one object to another
	Util.merge = function(objTo, objFrom) {
		var extend = function(objTo, objFrom) {
			var i;
			for (i in objFrom) {
				if (!objFrom.hasOwnProperty(i)) continue;
				//if property exist, extend it
				if (objTo[i] && typeof objTo[i] === 'object') {
					extend(objTo[i], objFrom[i])
				}
					//else create new property
				else {
					objTo[i] = objFrom[i]
				}
			}
		}
		if (objTo && objFrom && typeof objTo === 'object' && typeof objFrom === 'object') {
			extend(objTo, objFrom)
		}
		return objTo;
	}

	//Parses string of CSS and correct all url() statements accordingly to new css-file location
	Util.relocateCSS = function(cssText, oldCssLocation, newCssLocation) {
		if (!cssText) return '';
		//defaults
		if (!oldCssLocation && location.href) oldCssLocation = location.href
		if (!newCssLocation && location.href) newCssLocation = location.href

		//normalize paths
		oldCssLocation = Core.URL.normalize(oldCssLocation)
		newCssLocation = Core.URL.normalize(newCssLocation)

		//fix paths
		if (/(\.css|\.html|\.xhtml|\.jsp|\.asp|\.aspx\.php)$/.test(oldCssLocation)) {
			oldCssLocation = oldCssLocation.substr(0, oldCssLocation.lastIndexOf('/'))
		}
		if (/(\.css|\.html|\.xhtml|\.jsp|\.asp|\.aspx\.php)$/.test(newCssLocation)) {
			newCssLocation = newCssLocation.substr(0, newCssLocation.lastIndexOf('/'))
		}

		var isOldCssLocationAbsolute = /^(http|file|\/)/.test(oldCssLocation),
			isNewCssLocationAbsolute = /^(http|file|\/)/.test(newCssLocation);

		return cssText.replace(/url\(\"?'?(.+?)\"?'?\)/g, function (urlExpression, url) {
			var PathDirs = oldCssLocation.split('/'),
				pathUrl,
				currentUrl;

			//if URL is absolute or data-URI
			if (url.match(/^(http|data|file|\/)/)) {
				return urlExpression; //return original expression
			}

				//eles URL is relative
			else {
				/*Now handle many different situations*/
				//1. both `oldCssLocation` and `newCssLocation` are relative
				if (!isOldCssLocationAbsolute && !isNewCssLocationAbsolute) {
					currentUrl = (function () {
						var len = newCssLocation.split('/').length,
							rel = '';
						while (newCssLocation && len--) {
							rel += '../'
						}
						return rel;
					}())

					//concatenate old location and relative css url to create full path url
					while (url.indexOf('../') === 0 && PathDirs.length) {
						url = url.replace(/^\.\.\//, '')
						PathDirs.pop()
					}
					pathUrl = PathDirs.join('/')
					//create full url
					url = currentUrl + (pathUrl ? (pathUrl + '/') : '') + url

				}
					//2. otherwise 
				else {
					//concatenate old location and relative css url to create full path url
					while (url.indexOf('../') === 0 && PathDirs.length) {
						url = url.replace(/^\.\.\//, '')
						PathDirs.pop()
					}
					pathUrl = PathDirs.join('/')
					//create full url
					url = (pathUrl ? (pathUrl + '/') : '') + url
				}

				return 'url(' + url + ')';
			}
		})
	}

	//Inserts <style> element to document
	Util.injectCSS = function(cssText, Attrs, el) {
		// http://davidwalsh.name/add-rules-stylesheets
		if (!document || !cssText) return null;
		var i, styleElem = el || document.createElement('style');
		if (Attrs instanceof Object) {
			for (i in Attrs) {
				if (Attrs[i]) {
					styleElem.setAttribute(i, Attrs[i] === true ? '' : Attrs[i])
				}
			}
		}
		if (!el) { document.head.appendChild(styleElem) }
		try {// Not IE
			styleElem.appendChild(document.createTextNode(cssText))
		} catch (err) {// IE
			styleElem.styleSheet.cssText = cssText
		}
		return styleElem;
	}
	
	// Browser events
	Util.addDOMEvent = function(elem, type, handler) {
		if (elem.attachEvent) {
			elem['e' + type + handler] = handler
			elem[type + handler] = function() { elem['e' + type + handler](window.event) }
			elem.attachEvent('on' + type, elem[type + handler])
		} else if (elem.addEventListener)
			elem.addEventListener(type, handler, false)
	}
	Util.removeDOMEvent = function(elem, type, handler) {
		if (elem.detachEvent) {
			elem.detachEvent('on' + type, elem[type + handler])
			elem['e' + type + handler] = null
			elem[type + handler] = null
		} else if (elem.removeEventListener)
			elem.removeEventListener(type, handler, false)
	}
	

	Core.URL = {} //Basic URL manipulation

	//Adds a parameter with random value, if not exists
	Core.URL.randomize = function(url) { //returns URL
		if (!/(\?|\&)rand=/.test(url)) {
			return url + (url.indexOf('?') === -1 ? '?' : '&') + 'rand=' + (Math.random() * Math.pow(10,7)).toFixed(0)
		}
		return url
	}

	//Checks if URL is not in the same domain
	Core.URL.isExternal = function(url) {//returns Boolean
		url = Core.template(url) //replace variables in url
		return (
			(/htt(p|ps):\/\//i.test(url))
			&& !(new RegExp('htt(p|ps):\\/\\/' + location.hostname, 'i').test(url))
		)
	}

	//Synchronously checks file by url for existence/availability
	Core.URL.isAvailable = function(url) { //returns Boolean
		var xhr = new Util.XHR;
		url = Core.template(url)
		try {
			xhr.open('HEAD', Core.URL.randomize(url), false)
			xhr.send()
			if (xhr.readyState != 4) return false;
			switch (xhr.status) {
				case 200: case 301: case 302: case 303: case 307: return true;
				case 0:
					return (!/^https*:\/\//.test(url) && !!xhr.responseText);//local
				default: return false;
			}
		} catch (err) {
			return false
		}
	}

	//Asynchronously checks file by url for existence/availability
	Core.URL.isAvailableAsync = function(url) { //returns Promise
		return new Promise(function (available, error) {
			var xhr = new Util.XHR;
			url = Core.template(url)
			try {
				xhr.open('HEAD', Core.URL.randomize(url), true)
				xhr.onreadystatechange = function () {
					if (xhr.readyState != 4) return false;
					//console.log(url, xhr.responseText, xhr.status)
					switch (xhr.status) {
						case 200: case 301: case 302: case 303: case 307:
							available(true)//available
							break; 
						case 0:
							available(!/^https*:\/\//.test(url) && !!xhr.responseText)//local
							break;
						default: available(false) //not available
					}
					//clean
					this.onreadystatechange = null
				}
				xhr.send()
			} catch (err) {
				error(err) //error and not available
			}
		})
	}

	//Normalizes paths
	Core.URL.normalize = function (url) {
		if (!url) return '';
		url = url.trim()
		url = url.replace(/^\/\//g, location.protocol + '//')//insert protocol
		url = url.replace(/\\/g, '/')//normalize slashes 
		url = url.replace(/^.\//, '')//remove first relative mark
		url = url.replace(/\/+$/, '')//remove last slash
		return url;
	}


	Core.JSON = {}//Basic JSON manipulation
	Core.JSON.parse = global.JSON ? JSON.parse : Util.execute
	Core.JSON.stringify = global.JSON ? JSON.stringify : function(value) {
		return (function stringify(value) {
			var k, Items;
			if (!value) {
				return String(value)
			}
			else {
				switch (Object.prototype.toString.call(value)){
					case '[object Function]':
						return 'undefined';
					case '[object Object]':
						Items = []
						for (k in value) {
							if (value.hasOwnProperty(k)) {
								Items.push('"' + k + '":' + stringify(value[k]))
							}
						}
						return '{' + String(Items) + '}';
					case '[object Array]':
						return '[' + String(value) + ']';
					case '[object String]':
						return '"' + escape(value) + '"';
					default:
						return String(value);
				}
			}
		}(value))
	}


	// Oldschool request
	Core.request = function(url, error) {
		var response;
		Util.requestTextContent(url, false).then(
			function (r) { response = r },
			function (e) { error(e) }
		)
		return response || ' ';
	}
	// Synchronous request
	Core.requestSync = function(url) { //returns Promise
		return Util.requestTextContent(url, false)
	}
	// Asynchronous request
	Core.requestAsync = function(url) { //returns Promise
		return Util.requestTextContent(url, true)
	}


	





	// Error handler
	Core.error = function(/*arguments*/) {
		var i = 0, msg, Err = [];

		//join all messages and error objects from arguments to one string
		while (msg = arguments[i++]) {
			Err.push(((msg.message) ? (msg.name +': '+ msg.message) : msg))
		}
		console.error(Err.join(' '))
		return this;
	}

	//App configuration.
	Core.config = {
		//Default home URL
		baseUrl: location.href ? (location.protocol + '//' + location.host + location.pathname.substr(0, location.pathname.lastIndexOf('/'))) : '',
		cache: false, //browser default http cache
		cacheImages: false, //cache image resources. Ignored if `cache` is false
		cacheMedia: false //cache media resources. Ignored if `cache` is false
	}
	
	// Send global events
	Core.invoke = function(eventType, detail) {
		if (!eventType) return;
		detail = (detail && typeof detail === 'object') ? detail : {}
		var i, n, handler;
		
		//find handlers in Core listeners collection
		if (eventType in Events) {
			n = 0;
			while (handler = Events[eventType][n++]) {
				handler(detail)
			}
		}


		for (i in ModulesRegistry) {
			//find handlers in module 'listen' collection
			if (
				ModulesRegistry[i]
				&& ModulesRegistry[i].initiated
				&& 'listen' in ModulesRegistry[i].body
				&& eventType in ModulesRegistry[i].body.listen
			) {
				//single function
				if (typeof ModulesRegistry[i].body.listen[eventType] === 'function') {
					try {//catch errors without stopping app execution
						ModulesRegistry[i].body.listen[eventType](detail)
					} catch (err) {
						Util.fixError(err) //implement err.line
						Core.error('[Module: ' + ModulesRegistry[i].name + ':listen.' + eventType + ':' + err.line + ']', err)
					}
				}
					//array of functions
				else if (ModulesRegistry[i].body.listen[eventType].length) {
					n = 0;
					while (handler = ModulesRegistry[i].body.listen[eventType][n++]) {
						try {//catch errors without stopping app execution
							handler(detail)
						} catch (err) {
							Util.fixError(err) //implement err.line
							Core.error('[Module: ' + ModulesRegistry[i].name + ':listen.' + eventType + '.handler(' + (n - 1) + '):' + err.line + ']', err)
						}
					}

				}
			}

			//find handlers in module 'runtime_listen' collection
			if (
				ModulesRegistry[i]
				&& ModulesRegistry[i].initiated
				&& ModulesRegistry[i].body['runtime_listen']
				&& eventType in ModulesRegistry[i].body.runtime_listen
			) {
				n = 0;
				while (handler = ModulesRegistry[i].body.runtime_listen[eventType][n++]) {
					try {//catch errors without stopping app execution
						handler(detail)
					} catch (err) {
						Util.fixError(err) //implement err.line
						Core.error('[Module: ' + ModulesRegistry[i].name + ':runtime_listen.' + eventType + '.handler(' + (n - 1) + '):' + err.line + ']', err)
					}
				}
			}
		
		}
		
		return this;
	}

	// Adds Core event listeners in runtime. This is an alternative way to add listener of Core events.
	Core.listen = function(eventType, handler) {
		var listener;
		if (eventType && handler) {
			listener = Events[eventType] || [];
			listener = (listener instanceof Array) ? listener.concat(handler) : [listener].concat(handler)
			Events[eventType] = listener
		}
		return this;  // return Core object
	}
	// Generates action in Core with attached details
	Core.action = function(actionType, detail) {
		if (eveactionTypent && (actionType in Actions)) {
			var i = 0, func;
			while (func = Actions[actionType][i++])
				func(detail, {
					type: actionType,
					targetName: 'Core',
					timeStamp: (new Date()).getTime(),
					detail: detail
				})
		}
		return this; // return Core object
	}




	
	// 'layout-update' defaults
	Core.listen('layout-update', function(detail) {
		('width' in detail) || (detail.width = document.documentElement.offsetWidth);
		('height' in detail) || (detail.height = document.documentElement.offsetHeight);
		('orientation' in detail) || (
			detail.orientation = ('orientation' in window) ?
				((window.orientation == 0 || window.orientation == 180) ? 'portraid' : 'landscape')
				: ((detail.height > detail.width) ? 'portraid' : 'landscape')

		);
		('layout' in detail) || (detail.layout = 'default');
	})


	// bind DOM event to action 
	Core.DOMReady.then(function () { Core.invoke('app-ready') })
	Core.DOMLoaded.then(function () { Core.invoke('app-load') })
	
	//layout event
	Util.addDOMEvent(window, 'resize', Util.limited(function() {
		Core.invoke('layout-update')
	}))
	Core.DOMReady.then(function () {
		//layout event
		Core.invoke('layout-update')
	})





	//Feature detection collection
	Core.Features =  {
		'touch': document && (('createTouch' in document) || (/android|blackberry/i.test(navigator.userAgent) && 'ontouchstart' in window)),
		'retina': (function () {
			return (
				(window.devicePixelRatio && window.devicePixelRatio >= 2)
				|| 'matchMedia' in window && window.matchMedia('(min-resolution: 2dppx), (min--moz-device-pixel-ratio:2), (-o-min-device-pixel-ratio:2), (-webkit-min-device-pixel-ratio:2)').matches
				|| (window.screen && screen.deviceXDPI && screen.logicalXDPI && screen.deviceXDPI / screen.logicalXDPI >= 2) //IE9+
			) ? true : false
		}())
	}
	






	/*Core public interface */
	//Method for extending Core.config object. Old values will be overwritten with new ones
	Core.configure = function(config) {
		if (!config) return
		var	url = (typeof config === 'string') ? Core.template(config) : '';

		//if argument is config file url
		if (url && Core.URL.isAvailable(url)) {
			config = Util.execute(Core.request(url))
			if (config) {
				Util.merge(Core.config, config)
			}
		}
			//if argument is config object
		else {
			Util.merge(Core.config, config)
		}

		return this;
	}

	//Includes files in document, if they are available: index.html, style.css, ie.css, register.js
	Core.include = function (path) {
		if (!path) return
		path = path.replace(/\/+$/, '')//remove last dash
		var Proms = [],
			template = Templater({
				moduleUrl: path /*future module info*/
			});

		//css
		Proms.push(Core.load(path + '/style.css', 'defer'))
		if (!-[1, ]) { //always for IE <=8
			Proms.push(Core.load(path + '/ie.css', 'defer'))
		}

		//html
		//setup unknown type to prevent insertion into document by default
		if (Core.URL.isAvailable(path + '/index.html')) {
			Proms.push(Core.load(path + '/index.html', { type: 'unknown' }).then(function (text) {
				text = template(text)
				document.writeln(text)
				return text;
			}))
		}

		//js
		Proms.push(Core.load(path + '/register.js', 'defer reload').then(function() {
			var module = ModulesRegistry[lastRegisteredModuleName]
			module.url = module.moduleUrl = path
		}))

		//add to Includes collection
		Includes = Includes.concat(Proms)
		//return Promise collection
		return Promise.any(Proms);
	}

	Core.register = function(moduleName, moduleBody) {
		var sandbox, isModule;
		//`moduleBody` may be object or function-constructor that returns object.
		if (typeof moduleBody === 'function') {
			//attach sandbox to module
			sandbox = new Sandbox(moduleName)
			moduleBody = new moduleBody(sandbox) //returns object {init: ..., destroy: ..., listen: ...} or undefined
		}
		//little optimization
		isModule = ('css' in moduleBody) || ('init' in moduleBody) || ('destroy' in moduleBody) || ('listen' in moduleBody)
		if (isModule) {
			//if module has is an object, register it
			ModulesRegistry[moduleName] = new Module(moduleName, moduleBody)
			ModulesRegistry[moduleName].sandbox = sandbox
			lastRegisteredModuleName = moduleName
		}
		//else cancel registration
		return this;
	}

	Core.start = function(/*args*/) {
		var module,
			moduleName,
			length = arguments.length,
			i = 0,
			Proms = []; //Promises collection

		while (moduleName = arguments[i++]) {
			module = ModulesRegistry[moduleName]
			if (!module) { continue; }//ignore unexisting modules
			Proms.push(module.start().then(null, function (err) {
				Core.error('[Module: ' + module.name + ':init:' + err.line + ']', err)
			}))
		}

		return Promise.some(Proms).then(
			(length > 1) ? null : function (results) { return Promise(results[0]) },
			(length > 1) ? null : function (errors) { return errors[0] }
		);
	}
	
	Core.stop = function(/*args*/) {
		var module,
			moduleName,
			length = arguments.length,
			i = 0,
			Proms = []; //Promises collection

		while (moduleName = arguments[i++]) {
			module = ModulesRegistry[moduleName]
			if (!module) { continue; }//ignore unexisting modules
			Proms.push(module.stop().then(null, function (err) {
				Core.error('[Module: ' + module.name + ':destroy:' + err.line + ']', err)
			}))
		}

		return Promise.some(Proms).then(
			(length > 1) ? null : function (results) { return Promise(results[0]) },
			(length > 1) ? null : function (errors) { return errors[0] }
		);
	}
	
	Core.startAll = function() {
		var moduleName, Proms = [];
		for (moduleName in ModulesRegistry) { Proms.push(Core.start(moduleName)) }
		return Promise.any(Proms);
	}

	Core.stopAll = function() {
		var moduleName, Proms = [];
		for (moduleName in ModulesRegistry) { Proms.push(Core.stop(moduleName)) }
		return Promise.any(Proms);
	}

	//Extends Core object with new properties and methods.
	Core.extend = function(extendFunc) {
		var obj, i, j;

		if (typeof extendFunc !== 'function' && (typeof extendFunc !== 'object' || (extendFunc instanceof Array))) {
			Core.error('Core.extend() argument must be a function or object.')
			return
		}

		obj = (typeof extendFunc === 'function') ? extendFunc(Core, Sandbox) : extendFunc

		if (!obj) return

		for (i in obj) {
			if (i in Core) {
				if (/^register|start|stop|extend|invoke|load|template$/.test(i)) {
					Core.error('"' + i + '" feature is not extendable')
					continue
				}
				for (j in obj[i]) {
					if (i == 'Actions' || i == 'actions'/*for backward compatability*/) {
						if (typeof obj[i][j] === 'function') {
							Actions[j] = (j in Actions) ? Actions[j].concat([obj[i][j]]) : [obj[i][j]]
						}
						else if (obj[i][j].length)//type array
							Actions[j] = (j in Actions) ? Actions[j].concat(obj[i][j]) : obj[i][j]
					} else
						Core[i][j] = obj[i][j]
				}
			} else {
				Core[i] = obj[i]
			}
		}
		
		return this;
	}
	

	//Expose Core as a module, that is compatible witn CommonJS and AMD
	;(function (global, factory) {
		//NodeJS
		if (typeof exports === 'object') {
			module.exports = factory()
		}
		//AMD
		else if (typeof define === 'function' && define.amd) {
			(document && document.body) ? define(factory) : define('Core', [], factory)
		}
		//Expose public Core interface object
		else if (global) {
			global.Core = {
				load: Core.load,
				UIReady: Core.UIReady,
				DOMReady: Core.DOMReady,
				DOMLoaded: Core.DOMLoaded,
				include: Core.include,
				register: Core.register,
				start: Core.start,
				stop: Core.stop,
				startAll: Core.startAll,
				stopAll: Core.stopAll,
				extend: Core.extend,
				configure: Core.configure
			}
		}
	}(global, function() { return Core }))

}((typeof window !== 'undefined') ? window : undefined, (typeof global !== 'undefined') ? global : undefined))