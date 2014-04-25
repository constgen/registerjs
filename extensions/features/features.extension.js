
// Additional features detection
Core.extend(function (Core) {
	'use strict';
	var undefined;

	// Check CSS3, from Modernizr								
	var checkCSS = (function () {
		//for NodeJs environment
		if (!document) {
			return function () { return false }
		}

		var domPrefixes = 'Webkit Moz O ms Khtml'.split(' '),
			prefs = ' -o- -moz- -ms- -webkit- -khtml- '.split(' '),
			testElem = document.createElement('test'),
			test_style = testElem.style;

		function test_props_all(prop) {
			var uc_prop = prop.charAt(0).toUpperCase() + prop.substr(1),
				props = (prop + ' ' + domPrefixes.join(uc_prop + ' ') + uc_prop).split(' ');
			return !!test_props(props);
		}

		function test_props(props) {
			for (var i in props)
				if (test_style[props[i]] !== undefined)
					return true
		}
		// transitionProperty, backgroundsize, borderimage, boxShadow,
		// animationName, columnCount, boxReflect, overflowScrolling
		// opacity, transformProperty, perspectiveProperty
		// borderRadius

		return function (feature) {
			switch (feature) {
				case 'opacity':
					if (window.operamini) return false;
					test_style.cssText = 'opacity:0.55'
					return /^0.55$/.test(test_style.opacity);
				case 'perspectiveProperty':
					//CSSTRANSFORM3D = ('WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix())
					//return ('WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix())

					// from Modernizr
					if (!!test_props(['WebkitPerspective'])) {
						var st = document.createElement('style'), ret;
						// "@media (transform-3d),(-o-transform-3d),(-moz-transform-3d),(-ms-transform-3d),(-webkit-transform-3d),(modernizr){#modernizr{height:1px}}"
						//console.log('(-'+domPrefixes.join('-transform-3d), (-').toLowerCase()+')')
						st.textContent = '@media (-webkit-transform-3d){#csstransforms3d{left:9px;position:absolute;height:3px;}}'
						testElem.id = 'csstransforms3d'
						testElem.style.position = 'absolute'
						document.head.appendChild(st)
						document.documentElement.appendChild(testElem)
						ret = (testElem.offsetLeft == 9 && testElem.offsetHeight == 3)
						document.documentElement.removeChild(testElem)
						document.head.removeChild(st)
						st = null
						return ret;
					}

					return !!test_props(['perspectiveProperty', 'WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective']);

				case 'transformProperty':
					return !!test_props(['transformProperty', 'WebkitTransform', 'MozTransform', 'OTransform', 'msTransform']);
				case 'gradient': return (function () {
						var s1 = 'background-image:',
							s2 = 'gradient(linear,left top,right bottom,from(#9f9),to(#fff));',
							s3 = 'linear-gradient(left top,#eee,#fff);';
						test_style.cssText = (s1 + prefs.join(s2 + s1) + prefs.join(s3 + s1)).slice(0, -s1.length)
						return !!style.backgroundImage;
					}());
				case 'rgba':
					test_style.cssText = "background-color:rgba(0,0,0,0.5)"
					return !!style.backgroundColor;
				case 'textShadow':
					return (style.textShadow === '')
				case 'multipleBackgrounds':
					style.cssText = "background:url(//:),url(//:),red url(//:)"
					return new RegExp("(url\\s*\\(.*?){3}").test(style.background);
				default:
					return test_props_all(feature)
			}
		}
	}()),
		testInputFieldType = function(type) {
			var inputElem = document.createElement('input')
			inputElem.setAttribute('type', type)
			if (inputElem.type === type) return true
			else return false
		}

	return {
		Features: {
			'css-transform-3d': checkCSS('perspectiveProperty'),
			'css-transform': checkCSS('transformProperty'),
			'css-transition': checkCSS('transitionProperty'),
			'css-animation': checkCSS('animationName'),
			'css-box-shadow': checkCSS('boxShadow'),
			'css-box-reflect': checkCSS("boxReflect"),
			'css-background-size': checkCSS('backgroundsize'),
			'css-border-image': checkCSS('borderimage'),
			'css-columns': checkCSS('columnCount'),
			'css-border-radius': checkCSS('borderRadius'),
			'css-opacity': checkCSS('opacity'),
			'css-gradient': checkCSS('gradient'),
			'css-rgba': checkCSS('rgba'),
			'css-text-shadow': checkCSS('textShadow'),
			'css-background-multiple': checkCSS('multipleBackgrounds'),
			'element-svg': document && !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect,// SVG support (from Modernizr)
			'element-canvas': (function () {
				//From Modernizr
				var elem = document.createElement('canvas');
				return !!(elem.getContext && elem.getContext('2d'));
			}()),
			'element-input[type=range]': testInputFieldType('range'),
			'element-input[type=number]': testInputFieldType('number'),
			'element-input[type=email]': testInputFieldType('email'),
			'element-input[type=url]': testInputFieldType('url'),
			'element-input[type=search]': testInputFieldType('search'),
			'element-input[type=tel]': testInputFieldType('tel'),
			'element-input[type=color]': testInputFieldType('color'),
			'element-input[type=date]': testInputFieldType('date'),
			'element-input[type=month]': testInputFieldType('month'),
			'element-input[type=week]': testInputFieldType('week'),
			'element-input[type=time]': testInputFieldType('time'),
			'element-input[type=datetime]': testInputFieldType('datetime'),
			'element-input[type=datetime-local]': testInputFieldType('datetime-local'),
			'element-input[type=file]': (function () {
				try {
					var fileInput = document.createElement('input')
					fileInput.setAttribute('type', 'file')
					fileInput.style.display = 'none'
					document.body.appendChild(fileInput)
					if (
						fileInput.disabled
						|| fileInput.type != 'file'
						//browser sniffing for Windows Phone, because no another way
						|| (navigator.userAgent && navigator.userAgent.match(/Windows Phone (OS 7|8)/))
					) {
						return false; //not supported
					}
				} catch (err) {
					return false; //not supported
				} finally {
					fileInput && fileInput.parentNode.removeChild(fileInput)
				}
				return true; // supported
			}()),

			//localStorage, sessionStorage
			'js-web-storage': (('localStorage' in window) && window['localStorage'] !== null),

			//querySelector
			'js-query-selector': (!!document.querySelector && !!document.querySelectorAll)


			//detect mouse device/browser
			//'mouse': true,
		}
	}

})
