/*
 * Ajax细胞 
 */
;(function (name, definition) {
	if (typeof define == 'function') {
		define(name,[],definition);
	} else {
		window[name] = definition;
	}
})('cell_ajax',function() {

	var DOC = document,
		head = DOC.getElementsByTagName('head')[0];
		W3C = DOC.addEventListener;

	function Cell() {}

	cellfn = Cell.prototype = {
		/**
		 * Ajax请求
		 * @param {String} url : ajax请求地址
		 * @param {Object} options : ajax请求配置信息
			 * @options {String} type : 请求类型，默认为GET
			 * @options {Function} onSuccess : 请求成功的回调
			 * @options {Function} onError : 请求失败的回调
			 * @options {Function} onTimeout : 请求超时的回调
			 * @options {Number} timeout : 超时时间，默认为 5000 毫秒
			 * @options {Boolean} asyn : 是否异步，默认为true
			 * @options {Object} data : 请求时发送给服务器的数据
			 * @options {String} dataType : 服务器返回数据的类型
			 * @options {object String} data : ajax数据
		 */
		ajax : function(url, options) {

			var options = {
				type : options.type && options.type.toUpperCase() || "GET",
				onSuccess : options.onSuccess || function() {},
				onError : options.onError || function() {},
				onTimeout : options.onTimeout || function() {},
				timeout : options.timeout || 5000,
				asyn : options.asyn || true,
				data : options.data || '',
				dataType : options.dataType || '*',
				accepts: {
					xml: "application/xml, text/xml",
					html: "text/html",
					text: "text/plain",
					json: "application/json, text/javascript",
					"*": "*/*"
				}
			};

			var timeoutTimer = setTimeout(function () {
				requestTimeout = true;
				options.onTimeout();
				xhr = null;
			},options.timeout);

			var xhr = createXHR(),
				hasContent = /POST/.test(options.type);

			options.data = this.buildAjaxParam(options.data);

			if (!hasContent) {
				url += url.indexOf("?") == -1 ? ("?" + options.data) : ("&" + options.data);
				delete options.data;
			}

			xhr.open(options.type, url, options.asyn);

			if (options.data && hasContent) {
				xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			}
			
			xhr.setRequestHeader("Accept",
				options.dataType && options.accepts[ options.dataType ] ?
				options.accepts[ options.dataType ] : options.accepts[ "*" ]
			);

			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
					clearTimeout(timeoutTimer);
					if (httpSuccess(xhr)) {
						convertData = convertHttpData(xhr, options.dataType);
						options.onSuccess(convertData);
					} else {
						options.onError();
					}
				}
			};

			xhr.send(options.data);
		},

		buildAjaxParam : function(o) {
			var encodeParams,
				s = [];

			for ( key in o ) {
				s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(o[key]);
			}

			encodeParams = s.join('&');

			return encodeParams;
		},

		toJSON : function(o) {

			// 如果存在原生JSON对象则直接调用
			if ( window.JSON && window.JSON.stringify ) {
				var json = JSON.stringify(o, function(key, val){
					if (typeof val === 'function') {
						return val + '';
					}
					return val;
				});
				return json;
			}
			
		},

		parseJSON : function(data) {
			var res = '';

			if ( !data || typeof data !== "string") {
				return null;
			}

			if ( window.JSON && window.JSON.parse ) {
				return window.JSON.parse( data );
			}

			try {
				res = (new Function("return" + data))();
			} catch (e) {
				throw new Error('parse error');
				return;
			}
			return res;
		},

		loadStyle : function(url) {
			var node = DOC.createElement("link");
			node.rel = "stylesheet";
			node.href = url;
			head.insertBefore(node, head.firstChild);
		},

		loadScript : function(url, options) {
			var option = {
				onPending : options.onPending ||
				function () {},
				onError : options.onError ||
				function () {},
				onSuccess : options.onSuccess ||
				function () {}
			};

			//通过script节点加载目标模块,IE6-8不支持onload
			var node = DOC.createElement("script");

			node[W3C ? "onload" : "onreadystatechange"] = function () {
				if (W3C || /loaded|complete/i.test(node.readyState)) {
					node.onreadystatechange = node.onload = null;
					option.onSuccess.call(this, node.src);
				}
			};

			node.onerror = function () {
				option.onError.call(this, node.src);
			}

			node.src = url;
			head.insertBefore(node, head.firstChild);
			option.onPending.call(this, node.src);
		}
	};

	/**
	 * YUI2的创建xhr对象的封装
	 * @return {object XmlHttpRequest} XHR对象
	 * @private function
	 */
	function createXHR() {
		var msxml_progid = [
			'MSXML2.XMLHTTP.6.0',
			'MSXML3.XMLHTTP',
			'Microsoft.XMLHTTP', //不支持readyState 3
			'MSXML2.XMLHTTP.3.0' //不支持readyState 3
		];
		var xhr;
		try {
			xhr = new XMLHttpRequest();
		} catch (e) {
			for (var i = 0, len = msxml_progid.length; i < len; ++i) {
				try {
					xhr = new ActiveXObject(msxml_progid[i]);
					break;
				} catch (e2) {}
			}
		}
		finally {
			return xhr;
		}
	}

	/**
	 * 判断AJAX请求是否成功。
	 * @param  {object XmlHttpRequest} XHR对象
	 * @return  {Boolean}  如果请求成功则返回true，否则返回false
	 * @private function
	 */
	function httpSuccess(r) {
		try {
            //alert( location.protocol == "file:" );
            // 如果得不到服务器状态，且我们在请求本地文件，设为成功
            return !r.status && location.protocol == "file:" || 
            // 所有 200 - 300 之间的状态码都表示成功
            ( r.status >= 200 && r.status < 300 ) ||
            // 文档未作修改设为成功
            r.status == 304 ||
            // Safari 在文档未修改时返回空状态
            navigator.userAgent.indexOf("Safari") >= 0 && typeof r.status == "undefined";
        }catch (e){}
        // 若检查状态失败，就设置请求为失败
        return false;
	}

	function convertHttpData(r, type) {
		
		// 根据预期返回的数据类型对数据进行转化
		return r.responseText;
	}

	var cell = new Cell;

	return cell;
});