<h1>Module Sandbox Reference</h1>

<h2>Module</h2>
<p>
Модуль в предложеной струтуре - это JavaScript объект, который работает обособленно от всей системы, а для связи с приложением использует <code>sandbox</code>. Для того чтобы его использовать, его всегда нужно сперва зарегистрировать. Любой модуль должен иметь уникальное имя в системе и содержать обязательный метод <code>init</code>. Пример:
</p>
<pre><code>Core.register('firstModule', {
	init: function(){
		//module started his life
	}
})</code></pre>
<p>Так же у модуля могут быть не обязательные свойства и методы, такие как <code>listen</code> и <code>destroy</code>.</p>
<p><code>init</code>, <code>destroy</code>, <code>listen</code> - это зарегистрированые структурой имена свойств.</p>
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
Это был упрощённый способ регистрации модуля. Более развёрнутый метод предпологает наличие <code>sandbox</code> объекта, поэтому вместо объекта используется функция которая исполняется немедленно и возвращает объект модуля.
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
<code>sandbox</code> - объект к которому модуль может обращаться для получения доступа к функциям приложения. Его описание будет ниже.
</p>

<p>
Если модуль будет иметь значение <code>0</code>, <code>false</code>, <code>null</code> или <code>undefined</code> то ничего не зарегистрируется под указанным именем.
</p>

<p>
На практике модуль используется в связке с фрагментом HTML, который он обслуживает. Ниже приведён пример рекомендумого способа регистрации модуля.
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
<code>root</code> - корневой HTML-элемент. Если элемент не найден то модуль не регистрируется.<br>
<code>module</code> - cсылка на объект самого модуля. Используется для доступа к методам модуля в любой части его кода.<br>
<code>myMethod</code>, <code>myProp</code> - ваши личные свойства и методы. Они всегда могут получить доступ к любой части модуля т.к. им доступна ссылка <code>module</code>, и как уже сказано ранее им доступен объект <code>sandbox</code>.
</p>

<br>
<h2 id="sandbox">Sandbox</h2>

<h3>sandbox.action({string Event}, {object Detail})</h3>

<h3>sandbox.listen({string Event}, {function Handler})</h3>


<h3>sandbox.hasFeature({string})</h3>
<p>Возвращает <code>true</code> или <code>false</code> состояние поддержки браузером указанной технологии. Если поддержка не может быть проверена то возвращает <code>false</code>. Названия характеристик делятся на 3 группы: JavaScript, CSS, HTML. Соответственно их записи начинаются с префиксов 'js-', 'css-', 'element-'. Так же имеются общие характеристики, которые не относятся к группам, они записываются без префиксов.</p>
<p>
Список стандартных характеристик, которые доступны всегда:<br>
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
Остальные доступны только при подключении расширения 'features.core.js'.<br>
<code>'element-canvas'</code><br>
<code>'element-input[type=range]'</code><br>
<code>'js-webStorage'</code><br>
(Здесь список будет пополняться в дальнейшем)
</p>

<h3>sandbox.template({string})</h3>
<p>Преобразует любую строку с переменными вида {variable} в строку со значениями этих переменных. Переменные используются для абстрагирования от окружения в котором исполняется приложение. Пример:</p>
<code>sandbox.template('{baseUrl}/plugins/lightbox.js') // -> http://github.com/plugins/lightbox.js</code>
<p>
Доступные переменные:
<code>{baseUrl}</code> - адрес к корневой папке приложения<br>
??????????????????????
</p>


<h3>sandbox.alert({string Message}, {object Options})</h3>
<p>Универсальная функция для всех платформ. Аналог <code>alert()</code> из браузера. Возвращает Promise object (т.к. может быть асинхронным), который успешно завершается со значением <code>true</code> при нажатии на кнопку OK.</p>

<h3>sandbox.confirm({string Message}, {object Options})</h3>
<p>Универсальная функция для всех платформ. Аналог <code>confirm()</code> из браузера. Возвращает Promise object (т.к. может быть асинхронным), который успешно завершается со значением <code>true</code> при нажатии на кнопку OK или со значением <code>false</code> при нажатии на кнопку CANCEL.</p>

<h3>sandbox.notification({string Message}, {object Options})</h3>
<p>Универсальная функция для всех платформ. Аналог <code>window.webkitNotifications</code> из браузера. Возвращает Promise object, который успешно завершается со значением <code>true</code> при нажатии на всплывающее сообщение или со значением <code>false</code> при нажатии на кнопку закрытия сообщения.</p>


<h3>sandbox.data({*}).format({string})</h3>

<h3>sandbox.data({*}).filter({string})</h3>

<h3>sandbox.data({*}).sort({string})</h3>

<h3>sandbox.Event</h3>

<h3>sandbox.load({string URL}, {object Options})</h3>
<p>Алиас на <code>Core.load({string URL}, {object Options})</code></p>

<h3>sandbox.Promise({function}|{*}, {optional function canceler})</h3>
<p>Алиас на <code>Core.Promise({function}|{*}, {optional function canceler})</code></p>





