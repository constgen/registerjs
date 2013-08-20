<h1>Module Sandbox Reference</h1>

<h2>Module</h2>
<p>
  In proposed structure Module is JavaScript object that operates separately from the whole system and as a connection with application uses <code>sandbox</code>. In order to use it you need register it. Any module must have unique name in system and must contain method <code>init</code>. Example:
</p>
<pre><code>Core.register('firstModule', {
	init: function(){
		//module started his life
	}
})</code></pre>
<p>Also module has optional properties and methods such as <code>listen</code> and <code>destroy</code>.</p>
<p><code>init</code>, <code>destroy</code>, <code>listen</code> are property names that are registered by structure.</p>
<pre><code>Core.register('secondModule', {
	init: function(){
		//start module's life: attach bindings, show content, etc.
	},
	destroy: function(){
		//end module's life: detach bindings, remove content, etc.
	},
	listen: {
		'app-load': function(detail){},
		'content-update': [
			function(detail){},
			function(detail){}
		]
	}
})</code></pre>
<p>
  It was simplified method to register module. Extended method requires <code>sandbox</code> object, so object is used instead of function that executed immediately and returns an object module.
</p>
<pre><code>Core.register('thirdModule', function(sandbox){
	return {
		init: function(){
			//has access to sandbox
			//start module's life: attach bindings, show content, etc.
		},
		destroy: function(){
			//has access to sandbox
			//end module's life: detach bindings, remove content, etc.
		},
		listen: {
			'app-load': function(detail){
				//has access to sandbox
			},
			'content-update': [
				function(detail){},
				function(detail){}
			]
		}
	}
})</code></pre>
<p>
<code>sandbox</code> - module can refer this object to gain access to application functions.
</p>

<p>
If module returns value <code>0</code>, <code>false</code>, <code>null</code> or <code>undefined</code> then nothing will be registered
</p>

<p>
  In most cases module is used with HTML fragment, which it serves. The following example shows the recommended method of module registration.
</p>
<pre><code>Core.register('thirdModule', function(sandbox){
	return (function (root) {
		// if root element is undefined do not register module
		if (!root) return
		// create reference to module object
		var module = {
			init: function () {	},

			destroy: function () {},

			myMethod: function(){ 
				//has access to module.myProp and other
			},

			myProp: {},

			listen: {}
		}
		// return module object
		return module;
	}(document.querySelector('.moduleElement'))) // root HTML element
})</code></pre>
<p>
<code>root</code> - root HTML element. If none are found then the module will not be registered.<br>
<code>module</code> - reference to module itself. Used to access module methods in any part of its code.<br>
<code>myMethod</code>, <code>myProp</code> - your own properties and methods. 
They always have access to any part of module as they have <code>module</code> reference, and they can access <code>sandbox</code> object.
</p>

<br>
<h2 id="sandbox">Sandbox</h2>

<h3>sandbox.action({string Event}, {object Detail})</h3>

<h3>sandbox.listen({string Event}, {function Handler})</h3>


<h3>sandbox.hasFeature({string})</h3>
<p>Returns <code>true</code> or <code>false</code> state of browser support this technology. If support cannot be checked then it returns <code>false</code>. Feature names are divided in 3 groups: JavaScript, CSS, HTML. Their names start with prefixes 'js-', 'css-', 'element-'. Also there are common features, they don't have prefixes.</p>

List of feature detections that are always available:<br>
<code>'css-transform3d'</code><br>
<code>'css-transform'</code><br>
<code>'css-transition'</code><br>
<code>'css-animation'</code><br>
<code>'css-box-shadow'</code><br>
<code>'css-background-size'</code><br>
<code>'css-border-image'</code><br>
<code>'css-columns'</code><br>
<code>'css-border-radius'</code><br>
<code>'css-opacity'</code><br>
<code>'element-svg'</code><br>
<code>'touch'</code><br>
<code>'retina'</code><br>
<code>'cordova'</code><br>
</p>
<p>
Other feature detections will be available when 'features.core.js' extension included.<br>
<code>'element-canvas'</code><br>
<code>'element-input[type=range]'</code><br>
<code>'js-webStorage'</code><br>
(This list will be updated in the future)
</p>

<h3>sandbox.template({string})</h3>
<p>Converts any string of variables like {variable} to string with values of these variables. The variables are used to abstract from the application environment. Example:</p>
<code>sandbox.template('{baseUrl}/plugins/lightbox.js') // -> http://github.com/plugins/lightbox.js</code>
<p>
Available variables:
<code>{baseUrl}</code> - address of the application's root directory<br>
</p>


<h3>sandbox.alert({string Message}, {object Options})</h3>
<p>
  Common function for every platform. Similar to browser's <code>alert()</code>. Returns Promise object (it can be asynchronious), will be successfully fulfilled with <code>true</code> if 'OK' button was clicked.
</p>

<h3>sandbox.confirm({string Message}, {object Options})</h3>
<p>
  Common function for every platform. Similar to browser's <code>confirm()</code>. Returns Promise object (it can be asynchronious), will be successfully fulfilled with <code>true</code> if 'OK' button was clicked, 
  or with value <code>false</code> if 'CANCEL' button was prressed</p>

<h3>sandbox.notification({string Message}, {object Options})</h3>
<p>
  Common function for every platform. Similar to browser's <code>window.webkitNotifications</code>. Returns Promise object (it can be asynchronious), will be successfully fulfilled with <code>true</code> if pop-up message was clicked, or <code>false</code> if close button on pop-up message was clicked.</p>


<h3>sandbox.data({*}).format({string})</h3>

<h3>sandbox.data({*}).filter({string})</h3>

<h3>sandbox.data({*}).sort({string})</h3>

<h3>sandbox.Event</h3>

<h3>sandbox.load({string URL}, {object Options})</h3>
<p>Alias for <code>Core.load({string URL}, {object Options})</code></p>

<h3>sandbox.Promise({function}|{*}, {optional function canceler})</h3>
<p>Alias for <code>Core.Promise({function}|{*}, {optional function canceler})</code></p>





