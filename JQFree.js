(function(window) {

	// 在这个库中我们会实现一些原生ES5的方法来兼容老旧的浏览器

  var ArrayProto = Array.prototype;
  var FuncProto = Function.prototype;
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeTrim         = String.prototype.trim,
    nativeBind         = FuncProto.bind;

    /* 实现DOM选择器并返回包装对象 */
	var _JQF = $ = function(selector) {
		return new _JQF.fn.init(selector);
	};

	/* 为包装对象的原型添加方法 */
	_JQF.fn = _JQF.prototype = {
		init: function(selector) {
			if (typeof selector === "string") {
				var elem = document.querySelectorAll(selector);
				$.merge(this, elem);
			} else if (selector.nodeType) {
				this[0] = selector;
				this.length = 1;
			}
		},

		append: function(ele) {
			if (typeof ele === "string") {
				this[0].innerHTML += ele;
			} else if (ele instanceof _JQF) {
				for (var i = 0, len = ele.length; i < len; i++) {
					this[0].appendChild(ele[i]);
				}
			} else if (ele.nodeType) {
				this[0].appendChild(ele);
			}
			return this;
		},

		prepend: function(ele) {
			if (typeof ele === "string") {
				this[0].innerHTML = ele + this[0].innerHTML;
			} else if (ele instanceof _JQF) {
				for (var i = 0, len = ele.length; i < len; i++) {
					this[0].insertBefore(ele[i], this[0].firstChild);
				}
			} else if (ele.nodeType) {
				this[0].insertBefore(ele, this[0].firstChild);
			}
			return this;
		},

		remove: function() {
			var parent = this[0].parentNode;
			for (var i = this.length - 1; i >= 0; i--) {
				parent.removeChild(this[i]);
			}
		},

		addEvent: function(type, fn) {
			if (this[0].addEventListener) {
				$.fn.addEvent = function(type, fn) {
					for (var i = 0, len = this.length; i < len; i++) {
						this[i].addEventListener(type, fn, false);
					}
				};
			} else if (this[0].attachEvent) {
				$.fn.addEvent = function(type, fn) {
					for (var i = 0, len = this.length; i < len; i++) {
						this[i].attachEvent("on" + type, fn);
					}
				};
			} else {
				$.fn.addEvent = function(type, fn) {
					for (var i = 0, len = this.length; i < len; i++) {
						this[i]["on" + type] = fn;
					}
				};
			}

			return $.fn.addEvent.call(this, type, fn);
		},

		removeEvent: function(type, fn) {
			if (this[0].removeEventListener) {
				$.fn.removeEvent = function(type, fn) {
					for (var i = 0, len = this.length; i < len; i++) {
						this[i].removeEventListener(type, fn, false);
					}
				};
			} else if (this[0].attachEvent) {
				$.fn.removeEvent = function(type, fn) {
					for (var i = 0, len = this.length; i < len; i++) {
						this[i].detachEvent("on" + type, fn);
					}
				};
			} else {
				$.fn.removeEvent = function(type, fn) {
					for (var i = 0, len = this.length; i < len; i++) {
						this[i]["on" + type] = null;
					}
				};
			}

			return $.fn.removeEvent.call(this, type, fn);
		},

		hasClass: function(clsName) {
			var className = this[0].className;
			var reg = new RegExp("\\b" + clsName + "\\b");
			if (!reg.test(className)) {
				return false;
			}
			return true;
		},

		addClass: function(clsName) {
			if (this[0].classList) {
				$.fn.addClass = function(clsName) {
					this[0].classList.add(clsName);
				};
			} else {
				$.fn.addClass = function(clsName) {
					try {
						if (typeof clsName !== "string" || !/^[a-zA-Z_]\w*$/.test(clsName)) {
							throw new Error("Not a correct className format!");
						}
					} catch (e) {
						console.log(e.message);
						return;
					}
					var origClass = this[0].className;
					if (!this.hasClass(clsName)) {
						this[0].className += (origClass.length == 0 ? clsName : " " + clsName);
					}
				};
			}

			return $.fn.addClass.call(this, clsName);
		},

		removeClass: function(clsName) {
			if (this[0].classList) {
				$.fn.removeClass = function(clsName) {
					this[0].classList.remove(clsName);
				};
			} else {
				$.fn.removeClass = function(clsName) {
					try {
						if (typeof clsName !== "string" || !/^[a-zA-Z_]\w*$/.test(clsName)) {
							throw new Error("Not a correct className format!");
						}
					} catch (e) {
						console.log(e.message);
						return;
					}

					var origClass = this[0].className;
					var reg = new RegExp("\\s" + clsName + "\\b\|\\b" + clsName + "\\s");
					origClass = origClass.replace(reg, "");
					this[0].className = origClass.replace(/\s{2,}/g, " ");
				};
			}

			return $.fn.removeClass.call(this, clsName);
		},

		toggleClass: function(clsName) {
			if (this.hasClass(clsName)) {
				this.removeClass(clsName);
			} else {
				this.addClass(clsName);
			}
		},

		attr: function(name, value) {
			this[0].setAttribute(name, value);
		},

		html: function(str) {
			this[0].innerHTML = str;
		},

		data: function(name, value) {
			if (!name) {
				return;
			}
			if (arguments.length === 1) {
				return this[0].dataset[name];
			} else {
				this[0].dataset[name] = value;
			}
		}

	};
	_JQF.fn.init.prototype = _JQF.fn;

	_JQF.extend = function(obj1, obj2) {
		for (var prop in obj2) {
			if (obj2.hasOwnProperty(prop)) {
				obj1[prop] = obj2[prop];
			}
		}
	};

	$.extend(_JQF, {
		merge: function(first, second) {
			var l = second.length,
				i = first.length || 0,
				j = 0;

			if (typeof l === "number") {
				for (; j < l; j++) {
					first[i++] = second[j];
				}
			} else {
				while (second[j] !== undefined) {
					first[i++] = second[j++];
				}
			}

			first.length = i;

			return first;
		},

		createXHR: function() {
			if (typeof XMLHttpRequest !== "undefined") {
				$.createXHR = function() {
					return new XMLHttpRequest();
				};
			} else {
				$.createXHR = function() {
					var xmlVer = ["Microsoft.XMLHTTP", "MSXML2.XMLHTTP"];
					for (var i = xmlVer.length - 1; i >= 0; i--) {
						try {
							return new ActiveXObject(xmlVer[i]);
						} catch (e) {}
					}
				};
			}

			return $.createXHR();
		},

		ajax: function(type, url, callback, param) {
			var xhr = _JQF.createXHR(),
				encodeParams = [];
			if (param) {
				for (var i = param.length - 1; i >= 0; i--) {
					encodeParams.push(encodeURIComponent(param[i].name) + "=" + encodeURIComponent(param[i].value));
				}
				encodeParams = encodeParams.join("&");
			}

			if (type == "POST") {
				xhr.open(type, url, true);
				xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			} else {
				if (param) {
					url += url.indexOf("?") == -1 ? ("?" + encodeParams) : ("&" + encodeParams);
				} else {
					encodeParams = null;
				}
				xhr.open(type, url, true);
			}

			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
					if (xhr.status == 200) {
						callback(xhr.responseText);
					}
				}
			};
			xhr.send(encodeParams);
		},

		bind: function(fn, context) {
			return function() {
				fn.apply(context, arguments);
			};
		},

		trim: function(str) {
			if (nativeTrim) {
				return str.trim();
			}

			return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
		},

		// function iterator(value, index, arr) {}
		each: function(obj, iterator, context) {
			if (obj === null) {
				return;
			}
			if (nativeForEach && obj.forEach === nativeForEach) {
				obj.forEach(iterator, context);
			} else if (obj.length === +obj.length) {
				for (var i = 0, l = obj.length; i < l; i++) {
					iterator.call(context, obj[i], i, obj);
				}
			} else {
				for (var key in obj) {
					if (obj.hasOwnProperty(key)) {
						iterator.call(context, obj[key], key, obj);
					}
				}
			}
		},

		/** 返回一个原始数组元素的回调函数返回值的新数组
		* @param {arr} 进行遍历处理的原始数组。
		* @param {iterator} 遍历处理的方法
		* @param {context} 绑定处理方法的上下文
		* @return {result} 返回的数组 */
		map: function(arr, iterator, context) {
			if (arr === null || !$.isArray(arr)) {
				return;
			}
			if (nativeMap && arr.map === nativeMap) {
				return arr.map(iterator, context);
			}
			var result = [];
			$.each(arr, function(value, index, list) {
				result.push(iterator.call(context, value, index, list));
			});
			return result;
		},
		/** 对数组中的所有元素调用指定的回调函数。 该回调函数的返回值为累积结果，并且此返回值在下一次调用该回调函数时作为参数提供。
		* @param {arr} 原始数组。
		* @param {iterator} 遍历处理的方法,iterator(prevValue, currValue, currentIndex, arr)
		* 	@@param {prevValue} 上一次的累积值。
		* 	@@param {currValue} 当前数组元素的值。
		* 	@@param {currentIndex} 当前元素的数字索引。
		* 	@@param {arr} 当前元素数组。
		* @param {memo} 起始值
		* @return {result} 返回的数组 */
		reduce: function(arr, iterator, initValue, context) {
			if (arr === null ) {
				arr = [];
			}
			var isInit = arguments.length > 2;
			if (nativeReduce && arr.reduce === nativeReduce) {
				if (context) {
					iterator = $.bind(iterator, context);
				}
				return initValue ? arr.reduce(iterator, initValue) : arr.reduce(iterator);
			}
			$.each(arr, function(value, index, list) {
				if (!isInit) {
					isInit = true;
					initValue = value;
				} else {
					initValue = iterator.call(context, initValue, value, index, list);
				}
			});
			return initValue;
		},
		/** 返回数组中的满足回调函数中指定的条件的元素。
		* @param {arr} 进行遍历处理的原始数组。
		* @param {cb} 过滤的方法
		* @param {context} 绑定处理方法的上下文
		* @return {result} 返回的数组 */
		filter: function(arr, cb, context) {
			if (nativeFilter && nativeFilter === arr.filter) {
				return arr.filter(cb,context);
			}
			var result = [];
			$.each(arr,function(value,index,array1){
				if (cb.call(context, value, index, array1)) {
					result.push(value);
				}
			});
			return result;
		},
		/** 确定指定的数组中是否有任一元素在回调函数中返回 true。
		* @param {arr} 进行遍历处理的原始数组。
		* @param {cb} 过滤的方法
		* @param {context} 绑定处理方法的上下文
		* @return {result} 布尔型，数组中是否有任一元素在回调函数中返回 true，否则返回false
		*/
		some: function(arr, cb, context) {
			if (arr === null || !$.isArray(arr)) {
				return;
			}
			if (nativeSome && arr.some === nativeSome) {
				return arr.some(cb, context);
			}
			var result = false;
			$.each(arr, function(value) {
				if (cb.call(context, value)) {
					result = true;
				}
			});
			return result;
		},

		loadScript: function(url, callback) {
			var script = document.createElement('script');
			script.type = 'text/javascript';
			if (script.readyState) {
				script.onreadystatechange = function() {
					if (script.readyState == "loaded" || script.readyState == 'complete') {
						script.onreadystatechange = null;
						callback();
					}
				};
			} else {
				script.onload = function() {
					callback();
				};
			}
			script.src = url;
			document.getElementsByTagName('head')[0].appendChild(script);
		}
	});
	
	$.keys = nativeKeys || function(obj) {
		if (obj !== Object(obj)) throw new TypeError('Invalid object');
		var result = [];
		for(var prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				result.push(prop);
			}
		}
		return result;
	};

	$.invert = function(obj) {
		var result = {};
		var keys = $.keys(obj);
		$.each(keys, function(key){
			result[obj[key]] = key;
		});
		return result;
	};

	entityMap = {
		escape: {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#x27;'
		}
	};
	entityMap.unescape = $.invert(entityMap.escape);

	// Regexes containing the keys and values listed immediately above.
	var entityRegexes = {
		escape: new RegExp('[' + $.keys(entityMap.escape).join('') + ']', 'g'),
		unescape: new RegExp('(' + $.keys(entityMap.unescape).join('|') + ')', 'g')
	};
	
	$.each(['escape', 'unescape'], function(method){
		$[method] = function(string) {
			var rege = entityRegexes[method];
			return string.replace(rege, function(match){
				return entityMap[method][match];
			});
		};
	});

	$.isArray = nativeIsArray || function(obj) {
		return Object.prototype.toString.call(obj) == '[object Array]';
	};

	var _core = {};
	_core.Browser = new function() {
		var _regConfig = {
			Chrome: {
				Reg: /.*(chrome)\/([\w.]+).*/,
				Core: "Webkit"
			},
			Firefox: {
				Reg: /.*(firefox)\/([\w.]+).*/,
				Core: "Moz"
			},
			Opera: {
				Reg: /(opera).+version\/([\w.]+)/,
				Core: "O"
			},
			Safari: {
				Reg: /.*version\/([\w.]+).*(safari).*/,
				Core: "Webkit"
			},
			Ie: {
				Reg: /.*(msie) ([\w.]+).*/,
				Core: "Ms"
			}
		},
			_userAgent = navigator.userAgent.toLowerCase();
		this.getDetail = function() {
			for (var _o in _regConfig) {
				var _result = _regConfig[_o].Reg.exec(_userAgent);
				if (_result != null) {
					return {
						Browser: _result[1] || "",
						Version: _result[2] || "0",
						Core: _regConfig[_o].Core
					};
				}
			}
			return {
				Browser: "UNKNOWN",
				Version: "UNKNOWN",
				Core: "UNKNOWN"
			};
		};
		this.isChrome = function() {
			return _regConfig.Chrome.Reg.test(_userAgent);
		};
		this.isFirefox = function() {
			return _regConfig.Firefox.Reg.test(_userAgent);
		};
		this.isOpera = function() {
			return _regConfig.Opera.Reg.test(_userAgent);
		};
		this.isSafari = function() {
			return _regConfig.Safari.Reg.test(_userAgent);
		};
		this.isIe = function() {
			return _regConfig.Ie.Reg.test(_userAgent);
		};
		this.isIPad = function() {
			return (/ipad/).test(_userAgent);
		};
	};

	window.JQF = window.$ = _JQF;
	window.core = _core;

	if ( typeof define === "function" && define.amd ) {
		define( "JQFree", [], function () { return JQF; } );
	}
})(window);