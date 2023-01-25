/*
Unobtrusive JavaScript
https://github.com/rails/rails/blob/main/actionview/app/assets/javascripts
Released under the MIT license
 */
;

(function() {
  var context = this;

  (function() {
    (function() {
      this.Rails = {
        linkClickSelector: 'a[data-confirm], a[data-method], a[data-remote]:not([disabled]), a[data-disable-with], a[data-disable]',
        buttonClickSelector: {
          selector: 'button[data-remote]:not([form]), button[data-confirm]:not([form])',
          exclude: 'form button'
        },
        inputChangeSelector: 'select[data-remote], input[data-remote], textarea[data-remote]',
        formSubmitSelector: 'form',
        formInputClickSelector: 'form input[type=submit], form input[type=image], form button[type=submit], form button:not([type]), input[type=submit][form], input[type=image][form], button[type=submit][form], button[form]:not([type])',
        formDisableSelector: 'input[data-disable-with]:enabled, button[data-disable-with]:enabled, textarea[data-disable-with]:enabled, input[data-disable]:enabled, button[data-disable]:enabled, textarea[data-disable]:enabled',
        formEnableSelector: 'input[data-disable-with]:disabled, button[data-disable-with]:disabled, textarea[data-disable-with]:disabled, input[data-disable]:disabled, button[data-disable]:disabled, textarea[data-disable]:disabled',
        fileInputSelector: 'input[name][type=file]:not([disabled])',
        linkDisableSelector: 'a[data-disable-with], a[data-disable]',
        buttonDisableSelector: 'button[data-remote][data-disable-with], button[data-remote][data-disable]'
      };

    }).call(this);
  }).call(context);

  var Rails = context.Rails;

  (function() {
    (function() {
      var nonce;

      nonce = null;

      Rails.loadCSPNonce = function() {
        var ref;
        return nonce = (ref = document.querySelector("meta[name=csp-nonce]")) != null ? ref.content : void 0;
      };

      Rails.cspNonce = function() {
        return nonce != null ? nonce : Rails.loadCSPNonce();
      };

    }).call(this);
    (function() {
      var expando, m;

      m = Element.prototype.matches || Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector;

      Rails.matches = function(element, selector) {
        if (selector.exclude != null) {
          return m.call(element, selector.selector) && !m.call(element, selector.exclude);
        } else {
          return m.call(element, selector);
        }
      };

      expando = '_ujsData';

      Rails.getData = function(element, key) {
        var ref;
        return (ref = element[expando]) != null ? ref[key] : void 0;
      };

      Rails.setData = function(element, key, value) {
        if (element[expando] == null) {
          element[expando] = {};
        }
        return element[expando][key] = value;
      };

      Rails.$ = function(selector) {
        return Array.prototype.slice.call(document.querySelectorAll(selector));
      };

    }).call(this);
    (function() {
      var $, csrfParam, csrfToken;

      $ = Rails.$;

      csrfToken = Rails.csrfToken = function() {
        var meta;
        meta = document.querySelector('meta[name=csrf-token]');
        return meta && meta.content;
      };

      csrfParam = Rails.csrfParam = function() {
        var meta;
        meta = document.querySelector('meta[name=csrf-param]');
        return meta && meta.content;
      };

      Rails.CSRFProtection = function(xhr) {
        var token;
        token = csrfToken();
        if (token != null) {
          return xhr.setRequestHeader('X-CSRF-Token', token);
        }
      };

      Rails.refreshCSRFTokens = function() {
        var param, token;
        token = csrfToken();
        param = csrfParam();
        if ((token != null) && (param != null)) {
          return $('form input[name="' + param + '"]').forEach(function(input) {
            return input.value = token;
          });
        }
      };

    }).call(this);
    (function() {
      var CustomEvent, fire, matches, preventDefault;

      matches = Rails.matches;

      CustomEvent = window.CustomEvent;

      if (typeof CustomEvent !== 'function') {
        CustomEvent = function(event, params) {
          var evt;
          evt = document.createEvent('CustomEvent');
          evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
          return evt;
        };
        CustomEvent.prototype = window.Event.prototype;
        preventDefault = CustomEvent.prototype.preventDefault;
        CustomEvent.prototype.preventDefault = function() {
          var result;
          result = preventDefault.call(this);
          if (this.cancelable && !this.defaultPrevented) {
            Object.defineProperty(this, 'defaultPrevented', {
              get: function() {
                return true;
              }
            });
          }
          return result;
        };
      }

      fire = Rails.fire = function(obj, name, data) {
        var event;
        event = new CustomEvent(name, {
          bubbles: true,
          cancelable: true,
          detail: data
        });
        obj.dispatchEvent(event);
        return !event.defaultPrevented;
      };

      Rails.stopEverything = function(e) {
        fire(e.target, 'ujs:everythingStopped');
        e.preventDefault();
        e.stopPropagation();
        return e.stopImmediatePropagation();
      };

      Rails.delegate = function(element, selector, eventType, handler) {
        return element.addEventListener(eventType, function(e) {
          var target;
          target = e.target;
          while (!(!(target instanceof Element) || matches(target, selector))) {
            target = target.parentNode;
          }
          if (target instanceof Element && handler.call(target, e) === false) {
            e.preventDefault();
            return e.stopPropagation();
          }
        });
      };

    }).call(this);
    (function() {
      var AcceptHeaders, CSRFProtection, createXHR, cspNonce, fire, prepareOptions, processResponse;

      cspNonce = Rails.cspNonce, CSRFProtection = Rails.CSRFProtection, fire = Rails.fire;

      AcceptHeaders = {
        '*': '*/*',
        text: 'text/plain',
        html: 'text/html',
        xml: 'application/xml, text/xml',
        json: 'application/json, text/javascript',
        script: 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript'
      };

      Rails.ajax = function(options) {
        var xhr;
        options = prepareOptions(options);
        xhr = createXHR(options, function() {
          var ref, response;
          response = processResponse((ref = xhr.response) != null ? ref : xhr.responseText, xhr.getResponseHeader('Content-Type'));
          if (Math.floor(xhr.status / 100) === 2) {
            if (typeof options.success === "function") {
              options.success(response, xhr.statusText, xhr);
            }
          } else {
            if (typeof options.error === "function") {
              options.error(response, xhr.statusText, xhr);
            }
          }
          return typeof options.complete === "function" ? options.complete(xhr, xhr.statusText) : void 0;
        });
        if ((options.beforeSend != null) && !options.beforeSend(xhr, options)) {
          return false;
        }
        if (xhr.readyState === XMLHttpRequest.OPENED) {
          return xhr.send(options.data);
        }
      };

      prepareOptions = function(options) {
        options.url = options.url || location.href;
        options.type = options.type.toUpperCase();
        if (options.type === 'GET' && options.data) {
          if (options.url.indexOf('?') < 0) {
            options.url += '?' + options.data;
          } else {
            options.url += '&' + options.data;
          }
        }
        if (AcceptHeaders[options.dataType] == null) {
          options.dataType = '*';
        }
        options.accept = AcceptHeaders[options.dataType];
        if (options.dataType !== '*') {
          options.accept += ', */*; q=0.01';
        }
        return options;
      };

      createXHR = function(options, done) {
        var xhr;
        xhr = new XMLHttpRequest();
        xhr.open(options.type, options.url, true);
        xhr.setRequestHeader('Accept', options.accept);
        if (typeof options.data === 'string') {
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        }
        if (!options.crossDomain) {
          xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
          CSRFProtection(xhr);
        }
        xhr.withCredentials = !!options.withCredentials;
        xhr.onreadystatechange = function() {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            return done(xhr);
          }
        };
        return xhr;
      };

      processResponse = function(response, type) {
        var parser, script;
        if (typeof response === 'string' && typeof type === 'string') {
          if (type.match(/\bjson\b/)) {
            try {
              response = JSON.parse(response);
            } catch (error) {}
          } else if (type.match(/\b(?:java|ecma)script\b/)) {
            script = document.createElement('script');
            script.setAttribute('nonce', cspNonce());
            script.text = response;
            document.head.appendChild(script).parentNode.removeChild(script);
          } else if (type.match(/\b(xml|html|svg)\b/)) {
            parser = new DOMParser();
            type = type.replace(/;.+/, '');
            try {
              response = parser.parseFromString(response, type);
            } catch (error) {}
          }
        }
        return response;
      };

      Rails.href = function(element) {
        return element.href;
      };

      Rails.isCrossDomain = function(url) {
        var e, originAnchor, urlAnchor;
        originAnchor = document.createElement('a');
        originAnchor.href = location.href;
        urlAnchor = document.createElement('a');
        try {
          urlAnchor.href = url;
          return !(((!urlAnchor.protocol || urlAnchor.protocol === ':') && !urlAnchor.host) || (originAnchor.protocol + '//' + originAnchor.host === urlAnchor.protocol + '//' + urlAnchor.host));
        } catch (error) {
          e = error;
          return true;
        }
      };

    }).call(this);
    (function() {
      var matches, toArray;

      matches = Rails.matches;

      toArray = function(e) {
        return Array.prototype.slice.call(e);
      };

      Rails.serializeElement = function(element, additionalParam) {
        var inputs, params;
        inputs = [element];
        if (matches(element, 'form')) {
          inputs = toArray(element.elements);
        }
        params = [];
        inputs.forEach(function(input) {
          if (!input.name || input.disabled) {
            return;
          }
          if (matches(input, 'fieldset[disabled] *')) {
            return;
          }
          if (matches(input, 'select')) {
            return toArray(input.options).forEach(function(option) {
              if (option.selected) {
                return params.push({
                  name: input.name,
                  value: option.value
                });
              }
            });
          } else if (input.checked || ['radio', 'checkbox', 'submit'].indexOf(input.type) === -1) {
            return params.push({
              name: input.name,
              value: input.value
            });
          }
        });
        if (additionalParam) {
          params.push(additionalParam);
        }
        return params.map(function(param) {
          if (param.name != null) {
            return (encodeURIComponent(param.name)) + "=" + (encodeURIComponent(param.value));
          } else {
            return param;
          }
        }).join('&');
      };

      Rails.formElements = function(form, selector) {
        if (matches(form, 'form')) {
          return toArray(form.elements).filter(function(el) {
            return matches(el, selector);
          });
        } else {
          return toArray(form.querySelectorAll(selector));
        }
      };

    }).call(this);
    (function() {
      var allowAction, fire, stopEverything;

      fire = Rails.fire, stopEverything = Rails.stopEverything;

      Rails.handleConfirm = function(e) {
        if (!allowAction(this)) {
          return stopEverything(e);
        }
      };

      Rails.confirm = function(message, element) {
        return confirm(message);
      };

      allowAction = function(element) {
        var answer, callback, message;
        message = element.getAttribute('data-confirm');
        if (!message) {
          return true;
        }
        answer = false;
        if (fire(element, 'confirm')) {
          try {
            answer = Rails.confirm(message, element);
          } catch (error) {}
          callback = fire(element, 'confirm:complete', [answer]);
        }
        return answer && callback;
      };

    }).call(this);
    (function() {
      var disableFormElement, disableFormElements, disableLinkElement, enableFormElement, enableFormElements, enableLinkElement, formElements, getData, isXhrRedirect, matches, setData, stopEverything;

      matches = Rails.matches, getData = Rails.getData, setData = Rails.setData, stopEverything = Rails.stopEverything, formElements = Rails.formElements;

      Rails.handleDisabledElement = function(e) {
        var element;
        element = this;
        if (element.disabled) {
          return stopEverything(e);
        }
      };

      Rails.enableElement = function(e) {
        var element;
        if (e instanceof Event) {
          if (isXhrRedirect(e)) {
            return;
          }
          element = e.target;
        } else {
          element = e;
        }
        if (matches(element, Rails.linkDisableSelector)) {
          return enableLinkElement(element);
        } else if (matches(element, Rails.buttonDisableSelector) || matches(element, Rails.formEnableSelector)) {
          return enableFormElement(element);
        } else if (matches(element, Rails.formSubmitSelector)) {
          return enableFormElements(element);
        }
      };

      Rails.disableElement = function(e) {
        var element;
        element = e instanceof Event ? e.target : e;
        if (matches(element, Rails.linkDisableSelector)) {
          return disableLinkElement(element);
        } else if (matches(element, Rails.buttonDisableSelector) || matches(element, Rails.formDisableSelector)) {
          return disableFormElement(element);
        } else if (matches(element, Rails.formSubmitSelector)) {
          return disableFormElements(element);
        }
      };

      disableLinkElement = function(element) {
        var replacement;
        if (getData(element, 'ujs:disabled')) {
          return;
        }
        replacement = element.getAttribute('data-disable-with');
        if (replacement != null) {
          setData(element, 'ujs:enable-with', element.innerHTML);
          element.innerHTML = replacement;
        }
        element.addEventListener('click', stopEverything);
        return setData(element, 'ujs:disabled', true);
      };

      enableLinkElement = function(element) {
        var originalText;
        originalText = getData(element, 'ujs:enable-with');
        if (originalText != null) {
          element.innerHTML = originalText;
          setData(element, 'ujs:enable-with', null);
        }
        element.removeEventListener('click', stopEverything);
        return setData(element, 'ujs:disabled', null);
      };

      disableFormElements = function(form) {
        return formElements(form, Rails.formDisableSelector).forEach(disableFormElement);
      };

      disableFormElement = function(element) {
        var replacement;
        if (getData(element, 'ujs:disabled')) {
          return;
        }
        replacement = element.getAttribute('data-disable-with');
        if (replacement != null) {
          if (matches(element, 'button')) {
            setData(element, 'ujs:enable-with', element.innerHTML);
            element.innerHTML = replacement;
          } else {
            setData(element, 'ujs:enable-with', element.value);
            element.value = replacement;
          }
        }
        element.disabled = true;
        return setData(element, 'ujs:disabled', true);
      };

      enableFormElements = function(form) {
        return formElements(form, Rails.formEnableSelector).forEach(enableFormElement);
      };

      enableFormElement = function(element) {
        var originalText;
        originalText = getData(element, 'ujs:enable-with');
        if (originalText != null) {
          if (matches(element, 'button')) {
            element.innerHTML = originalText;
          } else {
            element.value = originalText;
          }
          setData(element, 'ujs:enable-with', null);
        }
        element.disabled = false;
        return setData(element, 'ujs:disabled', null);
      };

      isXhrRedirect = function(event) {
        var ref, xhr;
        xhr = (ref = event.detail) != null ? ref[0] : void 0;
        return (xhr != null ? xhr.getResponseHeader("X-Xhr-Redirect") : void 0) != null;
      };

    }).call(this);
    (function() {
      var stopEverything;

      stopEverything = Rails.stopEverything;

      Rails.handleMethod = function(e) {
        var csrfParam, csrfToken, form, formContent, href, link, method;
        link = this;
        method = link.getAttribute('data-method');
        if (!method) {
          return;
        }
        href = Rails.href(link);
        csrfToken = Rails.csrfToken();
        csrfParam = Rails.csrfParam();
        form = document.createElement('form');
        formContent = "<input name='_method' value='" + method + "' type='hidden' />";
        if ((csrfParam != null) && (csrfToken != null) && !Rails.isCrossDomain(href)) {
          formContent += "<input name='" + csrfParam + "' value='" + csrfToken + "' type='hidden' />";
        }
        formContent += '<input type="submit" />';
        form.method = 'post';
        form.action = href;
        form.target = link.target;
        form.innerHTML = formContent;
        form.style.display = 'none';
        document.body.appendChild(form);
        form.querySelector('[type="submit"]').click();
        return stopEverything(e);
      };

    }).call(this);
    (function() {
      var ajax, fire, getData, isCrossDomain, isRemote, matches, serializeElement, setData, stopEverything,
        slice = [].slice;

      matches = Rails.matches, getData = Rails.getData, setData = Rails.setData, fire = Rails.fire, stopEverything = Rails.stopEverything, ajax = Rails.ajax, isCrossDomain = Rails.isCrossDomain, serializeElement = Rails.serializeElement;

      isRemote = function(element) {
        var value;
        value = element.getAttribute('data-remote');
        return (value != null) && value !== 'false';
      };

      Rails.handleRemote = function(e) {
        var button, data, dataType, element, method, url, withCredentials;
        element = this;
        if (!isRemote(element)) {
          return true;
        }
        if (!fire(element, 'ajax:before')) {
          fire(element, 'ajax:stopped');
          return false;
        }
        withCredentials = element.getAttribute('data-with-credentials');
        dataType = element.getAttribute('data-type') || 'script';
        if (matches(element, Rails.formSubmitSelector)) {
          button = getData(element, 'ujs:submit-button');
          method = getData(element, 'ujs:submit-button-formmethod') || element.method;
          url = getData(element, 'ujs:submit-button-formaction') || element.getAttribute('action') || location.href;
          if (method.toUpperCase() === 'GET') {
            url = url.replace(/\?.*$/, '');
          }
          if (element.enctype === 'multipart/form-data') {
            data = new FormData(element);
            if (button != null) {
              data.append(button.name, button.value);
            }
          } else {
            data = serializeElement(element, button);
          }
          setData(element, 'ujs:submit-button', null);
          setData(element, 'ujs:submit-button-formmethod', null);
          setData(element, 'ujs:submit-button-formaction', null);
        } else if (matches(element, Rails.buttonClickSelector) || matches(element, Rails.inputChangeSelector)) {
          method = element.getAttribute('data-method');
          url = element.getAttribute('data-url');
          data = serializeElement(element, element.getAttribute('data-params'));
        } else {
          method = element.getAttribute('data-method');
          url = Rails.href(element);
          data = element.getAttribute('data-params');
        }
        ajax({
          type: method || 'GET',
          url: url,
          data: data,
          dataType: dataType,
          beforeSend: function(xhr, options) {
            if (fire(element, 'ajax:beforeSend', [xhr, options])) {
              return fire(element, 'ajax:send', [xhr]);
            } else {
              fire(element, 'ajax:stopped');
              return false;
            }
          },
          success: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:success', args);
          },
          error: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:error', args);
          },
          complete: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:complete', args);
          },
          crossDomain: isCrossDomain(url),
          withCredentials: (withCredentials != null) && withCredentials !== 'false'
        });
        return stopEverything(e);
      };

      Rails.formSubmitButtonClick = function(e) {
        var button, form;
        button = this;
        form = button.form;
        if (!form) {
          return;
        }
        if (button.name) {
          setData(form, 'ujs:submit-button', {
            name: button.name,
            value: button.value
          });
        }
        setData(form, 'ujs:formnovalidate-button', button.formNoValidate);
        setData(form, 'ujs:submit-button-formaction', button.getAttribute('formaction'));
        return setData(form, 'ujs:submit-button-formmethod', button.getAttribute('formmethod'));
      };

      Rails.preventInsignificantClick = function(e) {
        var data, insignificantMetaClick, link, metaClick, method, nonPrimaryMouseClick;
        link = this;
        method = (link.getAttribute('data-method') || 'GET').toUpperCase();
        data = link.getAttribute('data-params');
        metaClick = e.metaKey || e.ctrlKey;
        insignificantMetaClick = metaClick && method === 'GET' && !data;
        nonPrimaryMouseClick = (e.button != null) && e.button !== 0;
        if (nonPrimaryMouseClick || insignificantMetaClick) {
          return e.stopImmediatePropagation();
        }
      };

    }).call(this);
    (function() {
      var $, CSRFProtection, delegate, disableElement, enableElement, fire, formSubmitButtonClick, getData, handleConfirm, handleDisabledElement, handleMethod, handleRemote, loadCSPNonce, preventInsignificantClick, refreshCSRFTokens;

      fire = Rails.fire, delegate = Rails.delegate, getData = Rails.getData, $ = Rails.$, refreshCSRFTokens = Rails.refreshCSRFTokens, CSRFProtection = Rails.CSRFProtection, loadCSPNonce = Rails.loadCSPNonce, enableElement = Rails.enableElement, disableElement = Rails.disableElement, handleDisabledElement = Rails.handleDisabledElement, handleConfirm = Rails.handleConfirm, preventInsignificantClick = Rails.preventInsignificantClick, handleRemote = Rails.handleRemote, formSubmitButtonClick = Rails.formSubmitButtonClick, handleMethod = Rails.handleMethod;

      if ((typeof jQuery !== "undefined" && jQuery !== null) && (jQuery.ajax != null)) {
        if (jQuery.rails) {
          throw new Error('If you load both jquery_ujs and rails-ujs, use rails-ujs only.');
        }
        jQuery.rails = Rails;
        jQuery.ajaxPrefilter(function(options, originalOptions, xhr) {
          if (!options.crossDomain) {
            return CSRFProtection(xhr);
          }
        });
      }

      Rails.start = function() {
        if (window._rails_loaded) {
          throw new Error('rails-ujs has already been loaded!');
        }
        window.addEventListener('pageshow', function() {
          $(Rails.formEnableSelector).forEach(function(el) {
            if (getData(el, 'ujs:disabled')) {
              return enableElement(el);
            }
          });
          return $(Rails.linkDisableSelector).forEach(function(el) {
            if (getData(el, 'ujs:disabled')) {
              return enableElement(el);
            }
          });
        });
        delegate(document, Rails.linkDisableSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.linkDisableSelector, 'ajax:stopped', enableElement);
        delegate(document, Rails.buttonDisableSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.buttonDisableSelector, 'ajax:stopped', enableElement);
        delegate(document, Rails.linkClickSelector, 'click', preventInsignificantClick);
        delegate(document, Rails.linkClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.linkClickSelector, 'click', handleConfirm);
        delegate(document, Rails.linkClickSelector, 'click', disableElement);
        delegate(document, Rails.linkClickSelector, 'click', handleRemote);
        delegate(document, Rails.linkClickSelector, 'click', handleMethod);
        delegate(document, Rails.buttonClickSelector, 'click', preventInsignificantClick);
        delegate(document, Rails.buttonClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.buttonClickSelector, 'click', handleConfirm);
        delegate(document, Rails.buttonClickSelector, 'click', disableElement);
        delegate(document, Rails.buttonClickSelector, 'click', handleRemote);
        delegate(document, Rails.inputChangeSelector, 'change', handleDisabledElement);
        delegate(document, Rails.inputChangeSelector, 'change', handleConfirm);
        delegate(document, Rails.inputChangeSelector, 'change', handleRemote);
        delegate(document, Rails.formSubmitSelector, 'submit', handleDisabledElement);
        delegate(document, Rails.formSubmitSelector, 'submit', handleConfirm);
        delegate(document, Rails.formSubmitSelector, 'submit', handleRemote);
        delegate(document, Rails.formSubmitSelector, 'submit', function(e) {
          return setTimeout((function() {
            return disableElement(e);
          }), 13);
        });
        delegate(document, Rails.formSubmitSelector, 'ajax:send', disableElement);
        delegate(document, Rails.formSubmitSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.formInputClickSelector, 'click', preventInsignificantClick);
        delegate(document, Rails.formInputClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.formInputClickSelector, 'click', handleConfirm);
        delegate(document, Rails.formInputClickSelector, 'click', formSubmitButtonClick);
        document.addEventListener('DOMContentLoaded', refreshCSRFTokens);
        document.addEventListener('DOMContentLoaded', loadCSPNonce);
        return window._rails_loaded = true;
      };

      if (window.Rails === Rails && fire(document, 'rails:attachBindings')) {
        Rails.start();
      }

    }).call(this);
  }).call(this);

  if (typeof module === "object" && module.exports) {
    module.exports = Rails;
  } else if (typeof define === "function" && define.amd) {
    define(Rails);
  }
}).call(this);
/*
 Copyright (C) Federico Zivolo 2018
 Distributed under the MIT License (license terms are at http://opensource.org/licenses/MIT).
 */
(function(e,t){'object'==typeof exports&&'undefined'!=typeof module?module.exports=t():'function'==typeof define&&define.amd?define(t):e.Popper=t()})(this,function(){'use strict';function e(e){return e&&'[object Function]'==={}.toString.call(e)}function t(e,t){if(1!==e.nodeType)return[];var o=getComputedStyle(e,null);return t?o[t]:o}function o(e){return'HTML'===e.nodeName?e:e.parentNode||e.host}function n(e){if(!e)return document.body;switch(e.nodeName){case'HTML':case'BODY':return e.ownerDocument.body;case'#document':return e.body;}var i=t(e),r=i.overflow,p=i.overflowX,s=i.overflowY;return /(auto|scroll|overlay)/.test(r+s+p)?e:n(o(e))}function r(e){return 11===e?re:10===e?pe:re||pe}function p(e){if(!e)return document.documentElement;for(var o=r(10)?document.body:null,n=e.offsetParent;n===o&&e.nextElementSibling;)n=(e=e.nextElementSibling).offsetParent;var i=n&&n.nodeName;return i&&'BODY'!==i&&'HTML'!==i?-1!==['TD','TABLE'].indexOf(n.nodeName)&&'static'===t(n,'position')?p(n):n:e?e.ownerDocument.documentElement:document.documentElement}function s(e){var t=e.nodeName;return'BODY'!==t&&('HTML'===t||p(e.firstElementChild)===e)}function d(e){return null===e.parentNode?e:d(e.parentNode)}function a(e,t){if(!e||!e.nodeType||!t||!t.nodeType)return document.documentElement;var o=e.compareDocumentPosition(t)&Node.DOCUMENT_POSITION_FOLLOWING,n=o?e:t,i=o?t:e,r=document.createRange();r.setStart(n,0),r.setEnd(i,0);var l=r.commonAncestorContainer;if(e!==l&&t!==l||n.contains(i))return s(l)?l:p(l);var f=d(e);return f.host?a(f.host,t):a(e,d(t).host)}function l(e){var t=1<arguments.length&&void 0!==arguments[1]?arguments[1]:'top',o='top'===t?'scrollTop':'scrollLeft',n=e.nodeName;if('BODY'===n||'HTML'===n){var i=e.ownerDocument.documentElement,r=e.ownerDocument.scrollingElement||i;return r[o]}return e[o]}function f(e,t){var o=2<arguments.length&&void 0!==arguments[2]&&arguments[2],n=l(t,'top'),i=l(t,'left'),r=o?-1:1;return e.top+=n*r,e.bottom+=n*r,e.left+=i*r,e.right+=i*r,e}function m(e,t){var o='x'===t?'Left':'Top',n='Left'==o?'Right':'Bottom';return parseFloat(e['border'+o+'Width'],10)+parseFloat(e['border'+n+'Width'],10)}function h(e,t,o,n){return $(t['offset'+e],t['scroll'+e],o['client'+e],o['offset'+e],o['scroll'+e],r(10)?o['offset'+e]+n['margin'+('Height'===e?'Top':'Left')]+n['margin'+('Height'===e?'Bottom':'Right')]:0)}function c(){var e=document.body,t=document.documentElement,o=r(10)&&getComputedStyle(t);return{height:h('Height',e,t,o),width:h('Width',e,t,o)}}function g(e){return le({},e,{right:e.left+e.width,bottom:e.top+e.height})}function u(e){var o={};try{if(r(10)){o=e.getBoundingClientRect();var n=l(e,'top'),i=l(e,'left');o.top+=n,o.left+=i,o.bottom+=n,o.right+=i}else o=e.getBoundingClientRect()}catch(t){}var p={left:o.left,top:o.top,width:o.right-o.left,height:o.bottom-o.top},s='HTML'===e.nodeName?c():{},d=s.width||e.clientWidth||p.right-p.left,a=s.height||e.clientHeight||p.bottom-p.top,f=e.offsetWidth-d,h=e.offsetHeight-a;if(f||h){var u=t(e);f-=m(u,'x'),h-=m(u,'y'),p.width-=f,p.height-=h}return g(p)}function b(e,o){var i=2<arguments.length&&void 0!==arguments[2]&&arguments[2],p=r(10),s='HTML'===o.nodeName,d=u(e),a=u(o),l=n(e),m=t(o),h=parseFloat(m.borderTopWidth,10),c=parseFloat(m.borderLeftWidth,10);i&&'HTML'===o.nodeName&&(a.top=$(a.top,0),a.left=$(a.left,0));var b=g({top:d.top-a.top-h,left:d.left-a.left-c,width:d.width,height:d.height});if(b.marginTop=0,b.marginLeft=0,!p&&s){var y=parseFloat(m.marginTop,10),w=parseFloat(m.marginLeft,10);b.top-=h-y,b.bottom-=h-y,b.left-=c-w,b.right-=c-w,b.marginTop=y,b.marginLeft=w}return(p&&!i?o.contains(l):o===l&&'BODY'!==l.nodeName)&&(b=f(b,o)),b}function y(e){var t=1<arguments.length&&void 0!==arguments[1]&&arguments[1],o=e.ownerDocument.documentElement,n=b(e,o),i=$(o.clientWidth,window.innerWidth||0),r=$(o.clientHeight,window.innerHeight||0),p=t?0:l(o),s=t?0:l(o,'left'),d={top:p-n.top+n.marginTop,left:s-n.left+n.marginLeft,width:i,height:r};return g(d)}function w(e){var n=e.nodeName;return'BODY'===n||'HTML'===n?!1:'fixed'===t(e,'position')||w(o(e))}function E(e){if(!e||!e.parentElement||r())return document.documentElement;for(var o=e.parentElement;o&&'none'===t(o,'transform');)o=o.parentElement;return o||document.documentElement}function v(e,t,i,r){var p=4<arguments.length&&void 0!==arguments[4]&&arguments[4],s={top:0,left:0},d=p?E(e):a(e,t);if('viewport'===r)s=y(d,p);else{var l;'scrollParent'===r?(l=n(o(t)),'BODY'===l.nodeName&&(l=e.ownerDocument.documentElement)):'window'===r?l=e.ownerDocument.documentElement:l=r;var f=b(l,d,p);if('HTML'===l.nodeName&&!w(d)){var m=c(),h=m.height,g=m.width;s.top+=f.top-f.marginTop,s.bottom=h+f.top,s.left+=f.left-f.marginLeft,s.right=g+f.left}else s=f}return s.left+=i,s.top+=i,s.right-=i,s.bottom-=i,s}function x(e){var t=e.width,o=e.height;return t*o}function O(e,t,o,n,i){var r=5<arguments.length&&void 0!==arguments[5]?arguments[5]:0;if(-1===e.indexOf('auto'))return e;var p=v(o,n,r,i),s={top:{width:p.width,height:t.top-p.top},right:{width:p.right-t.right,height:p.height},bottom:{width:p.width,height:p.bottom-t.bottom},left:{width:t.left-p.left,height:p.height}},d=Object.keys(s).map(function(e){return le({key:e},s[e],{area:x(s[e])})}).sort(function(e,t){return t.area-e.area}),a=d.filter(function(e){var t=e.width,n=e.height;return t>=o.clientWidth&&n>=o.clientHeight}),l=0<a.length?a[0].key:d[0].key,f=e.split('-')[1];return l+(f?'-'+f:'')}function L(e,t,o){var n=3<arguments.length&&void 0!==arguments[3]?arguments[3]:null,i=n?E(t):a(t,o);return b(o,i,n)}function S(e){var t=getComputedStyle(e),o=parseFloat(t.marginTop)+parseFloat(t.marginBottom),n=parseFloat(t.marginLeft)+parseFloat(t.marginRight),i={width:e.offsetWidth+n,height:e.offsetHeight+o};return i}function T(e){var t={left:'right',right:'left',bottom:'top',top:'bottom'};return e.replace(/left|right|bottom|top/g,function(e){return t[e]})}function C(e,t,o){o=o.split('-')[0];var n=S(e),i={width:n.width,height:n.height},r=-1!==['right','left'].indexOf(o),p=r?'top':'left',s=r?'left':'top',d=r?'height':'width',a=r?'width':'height';return i[p]=t[p]+t[d]/2-n[d]/2,i[s]=o===s?t[s]-n[a]:t[T(s)],i}function D(e,t){return Array.prototype.find?e.find(t):e.filter(t)[0]}function N(e,t,o){if(Array.prototype.findIndex)return e.findIndex(function(e){return e[t]===o});var n=D(e,function(e){return e[t]===o});return e.indexOf(n)}function P(t,o,n){var i=void 0===n?t:t.slice(0,N(t,'name',n));return i.forEach(function(t){t['function']&&console.warn('`modifier.function` is deprecated, use `modifier.fn`!');var n=t['function']||t.fn;t.enabled&&e(n)&&(o.offsets.popper=g(o.offsets.popper),o.offsets.reference=g(o.offsets.reference),o=n(o,t))}),o}function k(){if(!this.state.isDestroyed){var e={instance:this,styles:{},arrowStyles:{},attributes:{},flipped:!1,offsets:{}};e.offsets.reference=L(this.state,this.popper,this.reference,this.options.positionFixed),e.placement=O(this.options.placement,e.offsets.reference,this.popper,this.reference,this.options.modifiers.flip.boundariesElement,this.options.modifiers.flip.padding),e.originalPlacement=e.placement,e.positionFixed=this.options.positionFixed,e.offsets.popper=C(this.popper,e.offsets.reference,e.placement),e.offsets.popper.position=this.options.positionFixed?'fixed':'absolute',e=P(this.modifiers,e),this.state.isCreated?this.options.onUpdate(e):(this.state.isCreated=!0,this.options.onCreate(e))}}function W(e,t){return e.some(function(e){var o=e.name,n=e.enabled;return n&&o===t})}function B(e){for(var t=[!1,'ms','Webkit','Moz','O'],o=e.charAt(0).toUpperCase()+e.slice(1),n=0;n<t.length;n++){var i=t[n],r=i?''+i+o:e;if('undefined'!=typeof document.body.style[r])return r}return null}function H(){return this.state.isDestroyed=!0,W(this.modifiers,'applyStyle')&&(this.popper.removeAttribute('x-placement'),this.popper.style.position='',this.popper.style.top='',this.popper.style.left='',this.popper.style.right='',this.popper.style.bottom='',this.popper.style.willChange='',this.popper.style[B('transform')]=''),this.disableEventListeners(),this.options.removeOnDestroy&&this.popper.parentNode.removeChild(this.popper),this}function A(e){var t=e.ownerDocument;return t?t.defaultView:window}function M(e,t,o,i){var r='BODY'===e.nodeName,p=r?e.ownerDocument.defaultView:e;p.addEventListener(t,o,{passive:!0}),r||M(n(p.parentNode),t,o,i),i.push(p)}function I(e,t,o,i){o.updateBound=i,A(e).addEventListener('resize',o.updateBound,{passive:!0});var r=n(e);return M(r,'scroll',o.updateBound,o.scrollParents),o.scrollElement=r,o.eventsEnabled=!0,o}function F(){this.state.eventsEnabled||(this.state=I(this.reference,this.options,this.state,this.scheduleUpdate))}function R(e,t){return A(e).removeEventListener('resize',t.updateBound),t.scrollParents.forEach(function(e){e.removeEventListener('scroll',t.updateBound)}),t.updateBound=null,t.scrollParents=[],t.scrollElement=null,t.eventsEnabled=!1,t}function U(){this.state.eventsEnabled&&(cancelAnimationFrame(this.scheduleUpdate),this.state=R(this.reference,this.state))}function Y(e){return''!==e&&!isNaN(parseFloat(e))&&isFinite(e)}function j(e,t){Object.keys(t).forEach(function(o){var n='';-1!==['width','height','top','right','bottom','left'].indexOf(o)&&Y(t[o])&&(n='px'),e.style[o]=t[o]+n})}function K(e,t){Object.keys(t).forEach(function(o){var n=t[o];!1===n?e.removeAttribute(o):e.setAttribute(o,t[o])})}function q(e,t,o){var n=D(e,function(e){var o=e.name;return o===t}),i=!!n&&e.some(function(e){return e.name===o&&e.enabled&&e.order<n.order});if(!i){var r='`'+t+'`';console.warn('`'+o+'`'+' modifier is required by '+r+' modifier in order to work, be sure to include it before '+r+'!')}return i}function G(e){return'end'===e?'start':'start'===e?'end':e}function z(e){var t=1<arguments.length&&void 0!==arguments[1]&&arguments[1],o=me.indexOf(e),n=me.slice(o+1).concat(me.slice(0,o));return t?n.reverse():n}function V(e,t,o,n){var i=e.match(/((?:\-|\+)?\d*\.?\d*)(.*)/),r=+i[1],p=i[2];if(!r)return e;if(0===p.indexOf('%')){var s;switch(p){case'%p':s=o;break;case'%':case'%r':default:s=n;}var d=g(s);return d[t]/100*r}if('vh'===p||'vw'===p){var a;return a='vh'===p?$(document.documentElement.clientHeight,window.innerHeight||0):$(document.documentElement.clientWidth,window.innerWidth||0),a/100*r}return r}function _(e,t,o,n){var i=[0,0],r=-1!==['right','left'].indexOf(n),p=e.split(/(\+|\-)/).map(function(e){return e.trim()}),s=p.indexOf(D(p,function(e){return-1!==e.search(/,|\s/)}));p[s]&&-1===p[s].indexOf(',')&&console.warn('Offsets separated by white space(s) are deprecated, use a comma (,) instead.');var d=/\s*,\s*|\s+/,a=-1===s?[p]:[p.slice(0,s).concat([p[s].split(d)[0]]),[p[s].split(d)[1]].concat(p.slice(s+1))];return a=a.map(function(e,n){var i=(1===n?!r:r)?'height':'width',p=!1;return e.reduce(function(e,t){return''===e[e.length-1]&&-1!==['+','-'].indexOf(t)?(e[e.length-1]=t,p=!0,e):p?(e[e.length-1]+=t,p=!1,e):e.concat(t)},[]).map(function(e){return V(e,i,t,o)})}),a.forEach(function(e,t){e.forEach(function(o,n){Y(o)&&(i[t]+=o*('-'===e[n-1]?-1:1))})}),i}function X(e,t){var o,n=t.offset,i=e.placement,r=e.offsets,p=r.popper,s=r.reference,d=i.split('-')[0];return o=Y(+n)?[+n,0]:_(n,p,s,d),'left'===d?(p.top+=o[0],p.left-=o[1]):'right'===d?(p.top+=o[0],p.left+=o[1]):'top'===d?(p.left+=o[0],p.top-=o[1]):'bottom'===d&&(p.left+=o[0],p.top+=o[1]),e.popper=p,e}for(var J=Math.min,Q=Math.round,Z=Math.floor,$=Math.max,ee='undefined'!=typeof window&&'undefined'!=typeof document,te=['Edge','Trident','Firefox'],oe=0,ne=0;ne<te.length;ne+=1)if(ee&&0<=navigator.userAgent.indexOf(te[ne])){oe=1;break}var i=ee&&window.Promise,ie=i?function(e){var t=!1;return function(){t||(t=!0,window.Promise.resolve().then(function(){t=!1,e()}))}}:function(e){var t=!1;return function(){t||(t=!0,setTimeout(function(){t=!1,e()},oe))}},re=ee&&!!(window.MSInputMethodContext&&document.documentMode),pe=ee&&/MSIE 10/.test(navigator.userAgent),se=function(e,t){if(!(e instanceof t))throw new TypeError('Cannot call a class as a function')},de=function(){function e(e,t){for(var o,n=0;n<t.length;n++)o=t[n],o.enumerable=o.enumerable||!1,o.configurable=!0,'value'in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}return function(t,o,n){return o&&e(t.prototype,o),n&&e(t,n),t}}(),ae=function(e,t,o){return t in e?Object.defineProperty(e,t,{value:o,enumerable:!0,configurable:!0,writable:!0}):e[t]=o,e},le=Object.assign||function(e){for(var t,o=1;o<arguments.length;o++)for(var n in t=arguments[o],t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n]);return e},fe=['auto-start','auto','auto-end','top-start','top','top-end','right-start','right','right-end','bottom-end','bottom','bottom-start','left-end','left','left-start'],me=fe.slice(3),he={FLIP:'flip',CLOCKWISE:'clockwise',COUNTERCLOCKWISE:'counterclockwise'},ce=function(){function t(o,n){var i=this,r=2<arguments.length&&void 0!==arguments[2]?arguments[2]:{};se(this,t),this.scheduleUpdate=function(){return requestAnimationFrame(i.update)},this.update=ie(this.update.bind(this)),this.options=le({},t.Defaults,r),this.state={isDestroyed:!1,isCreated:!1,scrollParents:[]},this.reference=o&&o.jquery?o[0]:o,this.popper=n&&n.jquery?n[0]:n,this.options.modifiers={},Object.keys(le({},t.Defaults.modifiers,r.modifiers)).forEach(function(e){i.options.modifiers[e]=le({},t.Defaults.modifiers[e]||{},r.modifiers?r.modifiers[e]:{})}),this.modifiers=Object.keys(this.options.modifiers).map(function(e){return le({name:e},i.options.modifiers[e])}).sort(function(e,t){return e.order-t.order}),this.modifiers.forEach(function(t){t.enabled&&e(t.onLoad)&&t.onLoad(i.reference,i.popper,i.options,t,i.state)}),this.update();var p=this.options.eventsEnabled;p&&this.enableEventListeners(),this.state.eventsEnabled=p}return de(t,[{key:'update',value:function(){return k.call(this)}},{key:'destroy',value:function(){return H.call(this)}},{key:'enableEventListeners',value:function(){return F.call(this)}},{key:'disableEventListeners',value:function(){return U.call(this)}}]),t}();return ce.Utils=('undefined'==typeof window?global:window).PopperUtils,ce.placements=fe,ce.Defaults={placement:'bottom',positionFixed:!1,eventsEnabled:!0,removeOnDestroy:!1,onCreate:function(){},onUpdate:function(){},modifiers:{shift:{order:100,enabled:!0,fn:function(e){var t=e.placement,o=t.split('-')[0],n=t.split('-')[1];if(n){var i=e.offsets,r=i.reference,p=i.popper,s=-1!==['bottom','top'].indexOf(o),d=s?'left':'top',a=s?'width':'height',l={start:ae({},d,r[d]),end:ae({},d,r[d]+r[a]-p[a])};e.offsets.popper=le({},p,l[n])}return e}},offset:{order:200,enabled:!0,fn:X,offset:0},preventOverflow:{order:300,enabled:!0,fn:function(e,t){var o=t.boundariesElement||p(e.instance.popper);e.instance.reference===o&&(o=p(o));var n=B('transform'),i=e.instance.popper.style,r=i.top,s=i.left,d=i[n];i.top='',i.left='',i[n]='';var a=v(e.instance.popper,e.instance.reference,t.padding,o,e.positionFixed);i.top=r,i.left=s,i[n]=d,t.boundaries=a;var l=t.priority,f=e.offsets.popper,m={primary:function(e){var o=f[e];return f[e]<a[e]&&!t.escapeWithReference&&(o=$(f[e],a[e])),ae({},e,o)},secondary:function(e){var o='right'===e?'left':'top',n=f[o];return f[e]>a[e]&&!t.escapeWithReference&&(n=J(f[o],a[e]-('right'===e?f.width:f.height))),ae({},o,n)}};return l.forEach(function(e){var t=-1===['left','top'].indexOf(e)?'secondary':'primary';f=le({},f,m[t](e))}),e.offsets.popper=f,e},priority:['left','right','top','bottom'],padding:5,boundariesElement:'scrollParent'},keepTogether:{order:400,enabled:!0,fn:function(e){var t=e.offsets,o=t.popper,n=t.reference,i=e.placement.split('-')[0],r=Z,p=-1!==['top','bottom'].indexOf(i),s=p?'right':'bottom',d=p?'left':'top',a=p?'width':'height';return o[s]<r(n[d])&&(e.offsets.popper[d]=r(n[d])-o[a]),o[d]>r(n[s])&&(e.offsets.popper[d]=r(n[s])),e}},arrow:{order:500,enabled:!0,fn:function(e,o){var n;if(!q(e.instance.modifiers,'arrow','keepTogether'))return e;var i=o.element;if('string'==typeof i){if(i=e.instance.popper.querySelector(i),!i)return e;}else if(!e.instance.popper.contains(i))return console.warn('WARNING: `arrow.element` must be child of its popper element!'),e;var r=e.placement.split('-')[0],p=e.offsets,s=p.popper,d=p.reference,a=-1!==['left','right'].indexOf(r),l=a?'height':'width',f=a?'Top':'Left',m=f.toLowerCase(),h=a?'left':'top',c=a?'bottom':'right',u=S(i)[l];d[c]-u<s[m]&&(e.offsets.popper[m]-=s[m]-(d[c]-u)),d[m]+u>s[c]&&(e.offsets.popper[m]+=d[m]+u-s[c]),e.offsets.popper=g(e.offsets.popper);var b=d[m]+d[l]/2-u/2,y=t(e.instance.popper),w=parseFloat(y['margin'+f],10),E=parseFloat(y['border'+f+'Width'],10),v=b-e.offsets.popper[m]-w-E;return v=$(J(s[l]-u,v),0),e.arrowElement=i,e.offsets.arrow=(n={},ae(n,m,Q(v)),ae(n,h,''),n),e},element:'[x-arrow]'},flip:{order:600,enabled:!0,fn:function(e,t){if(W(e.instance.modifiers,'inner'))return e;if(e.flipped&&e.placement===e.originalPlacement)return e;var o=v(e.instance.popper,e.instance.reference,t.padding,t.boundariesElement,e.positionFixed),n=e.placement.split('-')[0],i=T(n),r=e.placement.split('-')[1]||'',p=[];switch(t.behavior){case he.FLIP:p=[n,i];break;case he.CLOCKWISE:p=z(n);break;case he.COUNTERCLOCKWISE:p=z(n,!0);break;default:p=t.behavior;}return p.forEach(function(s,d){if(n!==s||p.length===d+1)return e;n=e.placement.split('-')[0],i=T(n);var a=e.offsets.popper,l=e.offsets.reference,f=Z,m='left'===n&&f(a.right)>f(l.left)||'right'===n&&f(a.left)<f(l.right)||'top'===n&&f(a.bottom)>f(l.top)||'bottom'===n&&f(a.top)<f(l.bottom),h=f(a.left)<f(o.left),c=f(a.right)>f(o.right),g=f(a.top)<f(o.top),u=f(a.bottom)>f(o.bottom),b='left'===n&&h||'right'===n&&c||'top'===n&&g||'bottom'===n&&u,y=-1!==['top','bottom'].indexOf(n),w=!!t.flipVariations&&(y&&'start'===r&&h||y&&'end'===r&&c||!y&&'start'===r&&g||!y&&'end'===r&&u);(m||b||w)&&(e.flipped=!0,(m||b)&&(n=p[d+1]),w&&(r=G(r)),e.placement=n+(r?'-'+r:''),e.offsets.popper=le({},e.offsets.popper,C(e.instance.popper,e.offsets.reference,e.placement)),e=P(e.instance.modifiers,e,'flip'))}),e},behavior:'flip',padding:5,boundariesElement:'viewport'},inner:{order:700,enabled:!1,fn:function(e){var t=e.placement,o=t.split('-')[0],n=e.offsets,i=n.popper,r=n.reference,p=-1!==['left','right'].indexOf(o),s=-1===['top','left'].indexOf(o);return i[p?'left':'top']=r[o]-(s?i[p?'width':'height']:0),e.placement=T(t),e.offsets.popper=g(i),e}},hide:{order:800,enabled:!0,fn:function(e){if(!q(e.instance.modifiers,'hide','preventOverflow'))return e;var t=e.offsets.reference,o=D(e.instance.modifiers,function(e){return'preventOverflow'===e.name}).boundaries;if(t.bottom<o.top||t.left>o.right||t.top>o.bottom||t.right<o.left){if(!0===e.hide)return e;e.hide=!0,e.attributes['x-out-of-boundaries']=''}else{if(!1===e.hide)return e;e.hide=!1,e.attributes['x-out-of-boundaries']=!1}return e}},computeStyle:{order:850,enabled:!0,fn:function(e,t){var o=t.x,n=t.y,i=e.offsets.popper,r=D(e.instance.modifiers,function(e){return'applyStyle'===e.name}).gpuAcceleration;void 0!==r&&console.warn('WARNING: `gpuAcceleration` option moved to `computeStyle` modifier and will not be supported in future versions of Popper.js!');var s,d,a=void 0===r?t.gpuAcceleration:r,l=p(e.instance.popper),f=u(l),m={position:i.position},h={left:Z(i.left),top:Q(i.top),bottom:Q(i.bottom),right:Z(i.right)},c='bottom'===o?'top':'bottom',g='right'===n?'left':'right',b=B('transform');if(d='bottom'==c?-f.height+h.bottom:h.top,s='right'==g?-f.width+h.right:h.left,a&&b)m[b]='translate3d('+s+'px, '+d+'px, 0)',m[c]=0,m[g]=0,m.willChange='transform';else{var y='bottom'==c?-1:1,w='right'==g?-1:1;m[c]=d*y,m[g]=s*w,m.willChange=c+', '+g}var E={"x-placement":e.placement};return e.attributes=le({},E,e.attributes),e.styles=le({},m,e.styles),e.arrowStyles=le({},e.offsets.arrow,e.arrowStyles),e},gpuAcceleration:!0,x:'bottom',y:'right'},applyStyle:{order:900,enabled:!0,fn:function(e){return j(e.instance.popper,e.styles),K(e.instance.popper,e.attributes),e.arrowElement&&Object.keys(e.arrowStyles).length&&j(e.arrowElement,e.arrowStyles),e},onLoad:function(e,t,o,n,i){var r=L(i,t,e,o.positionFixed),p=O(o.placement,r,t,e,o.modifiers.flip.boundariesElement,o.modifiers.flip.padding);return t.setAttribute('x-placement',p),j(t,{position:o.positionFixed?'fixed':'absolute'}),o},gpuAcceleration:void 0}}},ce});

/*!
  * Bootstrap v4.3.1 (https://getbootstrap.com/)
  * Copyright 2011-2019 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
  * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
  */

!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports,require("jquery"),require("popper.js")):"function"==typeof define&&define.amd?define(["exports","jquery","popper.js"],e):e((t=t||self).bootstrap={},t.jQuery,t.Popper)}(this,function(t,g,u){"use strict";function i(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i)}}function s(t,e,n){return e&&i(t.prototype,e),n&&i(t,n),t}function l(o){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{},e=Object.keys(r);"function"==typeof Object.getOwnPropertySymbols&&(e=e.concat(Object.getOwnPropertySymbols(r).filter(function(t){return Object.getOwnPropertyDescriptor(r,t).enumerable}))),e.forEach(function(t){var e,n,i;e=o,i=r[n=t],n in e?Object.defineProperty(e,n,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[n]=i})}return o}g=g&&g.hasOwnProperty("default")?g.default:g,u=u&&u.hasOwnProperty("default")?u.default:u;var e="transitionend";function n(t){var e=this,n=!1;return g(this).one(_.TRANSITION_END,function(){n=!0}),setTimeout(function(){n||_.triggerTransitionEnd(e)},t),this}var _={TRANSITION_END:"bsTransitionEnd",getUID:function(t){for(;t+=~~(1e6*Math.random()),document.getElementById(t););return t},getSelectorFromElement:function(t){var e=t.getAttribute("data-target");if(!e||"#"===e){var n=t.getAttribute("href");e=n&&"#"!==n?n.trim():""}try{return document.querySelector(e)?e:null}catch(t){return null}},getTransitionDurationFromElement:function(t){if(!t)return 0;var e=g(t).css("transition-duration"),n=g(t).css("transition-delay"),i=parseFloat(e),o=parseFloat(n);return i||o?(e=e.split(",")[0],n=n.split(",")[0],1e3*(parseFloat(e)+parseFloat(n))):0},reflow:function(t){return t.offsetHeight},triggerTransitionEnd:function(t){g(t).trigger(e)},supportsTransitionEnd:function(){return Boolean(e)},isElement:function(t){return(t[0]||t).nodeType},typeCheckConfig:function(t,e,n){for(var i in n)if(Object.prototype.hasOwnProperty.call(n,i)){var o=n[i],r=e[i],s=r&&_.isElement(r)?"element":(a=r,{}.toString.call(a).match(/\s([a-z]+)/i)[1].toLowerCase());if(!new RegExp(o).test(s))throw new Error(t.toUpperCase()+': Option "'+i+'" provided type "'+s+'" but expected type "'+o+'".')}var a},findShadowRoot:function(t){if(!document.documentElement.attachShadow)return null;if("function"!=typeof t.getRootNode)return t instanceof ShadowRoot?t:t.parentNode?_.findShadowRoot(t.parentNode):null;var e=t.getRootNode();return e instanceof ShadowRoot?e:null}};g.fn.emulateTransitionEnd=n,g.event.special[_.TRANSITION_END]={bindType:e,delegateType:e,handle:function(t){if(g(t.target).is(this))return t.handleObj.handler.apply(this,arguments)}};var o="alert",r="bs.alert",a="."+r,c=g.fn[o],h={CLOSE:"close"+a,CLOSED:"closed"+a,CLICK_DATA_API:"click"+a+".data-api"},f="alert",d="fade",m="show",p=function(){function i(t){this._element=t}var t=i.prototype;return t.close=function(t){var e=this._element;t&&(e=this._getRootElement(t)),this._triggerCloseEvent(e).isDefaultPrevented()||this._removeElement(e)},t.dispose=function(){g.removeData(this._element,r),this._element=null},t._getRootElement=function(t){var e=_.getSelectorFromElement(t),n=!1;return e&&(n=document.querySelector(e)),n||(n=g(t).closest("."+f)[0]),n},t._triggerCloseEvent=function(t){var e=g.Event(h.CLOSE);return g(t).trigger(e),e},t._removeElement=function(e){var n=this;if(g(e).removeClass(m),g(e).hasClass(d)){var t=_.getTransitionDurationFromElement(e);g(e).one(_.TRANSITION_END,function(t){return n._destroyElement(e,t)}).emulateTransitionEnd(t)}else this._destroyElement(e)},t._destroyElement=function(t){g(t).detach().trigger(h.CLOSED).remove()},i._jQueryInterface=function(n){return this.each(function(){var t=g(this),e=t.data(r);e||(e=new i(this),t.data(r,e)),"close"===n&&e[n](this)})},i._handleDismiss=function(e){return function(t){t&&t.preventDefault(),e.close(this)}},s(i,null,[{key:"VERSION",get:function(){return"4.3.1"}}]),i}();g(document).on(h.CLICK_DATA_API,'[data-dismiss="alert"]',p._handleDismiss(new p)),g.fn[o]=p._jQueryInterface,g.fn[o].Constructor=p,g.fn[o].noConflict=function(){return g.fn[o]=c,p._jQueryInterface};var v="button",y="bs.button",E="."+y,C=".data-api",T=g.fn[v],S="active",b="btn",I="focus",D='[data-toggle^="button"]',w='[data-toggle="buttons"]',A='input:not([type="hidden"])',N=".active",O=".btn",k={CLICK_DATA_API:"click"+E+C,FOCUS_BLUR_DATA_API:"focus"+E+C+" blur"+E+C},P=function(){function n(t){this._element=t}var t=n.prototype;return t.toggle=function(){var t=!0,e=!0,n=g(this._element).closest(w)[0];if(n){var i=this._element.querySelector(A);if(i){if("radio"===i.type)if(i.checked&&this._element.classList.contains(S))t=!1;else{var o=n.querySelector(N);o&&g(o).removeClass(S)}if(t){if(i.hasAttribute("disabled")||n.hasAttribute("disabled")||i.classList.contains("disabled")||n.classList.contains("disabled"))return;i.checked=!this._element.classList.contains(S),g(i).trigger("change")}i.focus(),e=!1}}e&&this._element.setAttribute("aria-pressed",!this._element.classList.contains(S)),t&&g(this._element).toggleClass(S)},t.dispose=function(){g.removeData(this._element,y),this._element=null},n._jQueryInterface=function(e){return this.each(function(){var t=g(this).data(y);t||(t=new n(this),g(this).data(y,t)),"toggle"===e&&t[e]()})},s(n,null,[{key:"VERSION",get:function(){return"4.3.1"}}]),n}();g(document).on(k.CLICK_DATA_API,D,function(t){t.preventDefault();var e=t.target;g(e).hasClass(b)||(e=g(e).closest(O)),P._jQueryInterface.call(g(e),"toggle")}).on(k.FOCUS_BLUR_DATA_API,D,function(t){var e=g(t.target).closest(O)[0];g(e).toggleClass(I,/^focus(in)?$/.test(t.type))}),g.fn[v]=P._jQueryInterface,g.fn[v].Constructor=P,g.fn[v].noConflict=function(){return g.fn[v]=T,P._jQueryInterface};var L="carousel",j="bs.carousel",H="."+j,R=".data-api",x=g.fn[L],F={interval:5e3,keyboard:!0,slide:!1,pause:"hover",wrap:!0,touch:!0},U={interval:"(number|boolean)",keyboard:"boolean",slide:"(boolean|string)",pause:"(string|boolean)",wrap:"boolean",touch:"boolean"},W="next",q="prev",M="left",K="right",Q={SLIDE:"slide"+H,SLID:"slid"+H,KEYDOWN:"keydown"+H,MOUSEENTER:"mouseenter"+H,MOUSELEAVE:"mouseleave"+H,TOUCHSTART:"touchstart"+H,TOUCHMOVE:"touchmove"+H,TOUCHEND:"touchend"+H,POINTERDOWN:"pointerdown"+H,POINTERUP:"pointerup"+H,DRAG_START:"dragstart"+H,LOAD_DATA_API:"load"+H+R,CLICK_DATA_API:"click"+H+R},B="carousel",V="active",Y="slide",z="carousel-item-right",X="carousel-item-left",$="carousel-item-next",G="carousel-item-prev",J="pointer-event",Z=".active",tt=".active.carousel-item",et=".carousel-item",nt=".carousel-item img",it=".carousel-item-next, .carousel-item-prev",ot=".carousel-indicators",rt="[data-slide], [data-slide-to]",st='[data-ride="carousel"]',at={TOUCH:"touch",PEN:"pen"},lt=function(){function r(t,e){this._items=null,this._interval=null,this._activeElement=null,this._isPaused=!1,this._isSliding=!1,this.touchTimeout=null,this.touchStartX=0,this.touchDeltaX=0,this._config=this._getConfig(e),this._element=t,this._indicatorsElement=this._element.querySelector(ot),this._touchSupported="ontouchstart"in document.documentElement||0<navigator.maxTouchPoints,this._pointerEvent=Boolean(window.PointerEvent||window.MSPointerEvent),this._addEventListeners()}var t=r.prototype;return t.next=function(){this._isSliding||this._slide(W)},t.nextWhenVisible=function(){!document.hidden&&g(this._element).is(":visible")&&"hidden"!==g(this._element).css("visibility")&&this.next()},t.prev=function(){this._isSliding||this._slide(q)},t.pause=function(t){t||(this._isPaused=!0),this._element.querySelector(it)&&(_.triggerTransitionEnd(this._element),this.cycle(!0)),clearInterval(this._interval),this._interval=null},t.cycle=function(t){t||(this._isPaused=!1),this._interval&&(clearInterval(this._interval),this._interval=null),this._config.interval&&!this._isPaused&&(this._interval=setInterval((document.visibilityState?this.nextWhenVisible:this.next).bind(this),this._config.interval))},t.to=function(t){var e=this;this._activeElement=this._element.querySelector(tt);var n=this._getItemIndex(this._activeElement);if(!(t>this._items.length-1||t<0))if(this._isSliding)g(this._element).one(Q.SLID,function(){return e.to(t)});else{if(n===t)return this.pause(),void this.cycle();var i=n<t?W:q;this._slide(i,this._items[t])}},t.dispose=function(){g(this._element).off(H),g.removeData(this._element,j),this._items=null,this._config=null,this._element=null,this._interval=null,this._isPaused=null,this._isSliding=null,this._activeElement=null,this._indicatorsElement=null},t._getConfig=function(t){return t=l({},F,t),_.typeCheckConfig(L,t,U),t},t._handleSwipe=function(){var t=Math.abs(this.touchDeltaX);if(!(t<=40)){var e=t/this.touchDeltaX;0<e&&this.prev(),e<0&&this.next()}},t._addEventListeners=function(){var e=this;this._config.keyboard&&g(this._element).on(Q.KEYDOWN,function(t){return e._keydown(t)}),"hover"===this._config.pause&&g(this._element).on(Q.MOUSEENTER,function(t){return e.pause(t)}).on(Q.MOUSELEAVE,function(t){return e.cycle(t)}),this._config.touch&&this._addTouchEventListeners()},t._addTouchEventListeners=function(){var n=this;if(this._touchSupported){var e=function(t){n._pointerEvent&&at[t.originalEvent.pointerType.toUpperCase()]?n.touchStartX=t.originalEvent.clientX:n._pointerEvent||(n.touchStartX=t.originalEvent.touches[0].clientX)},i=function(t){n._pointerEvent&&at[t.originalEvent.pointerType.toUpperCase()]&&(n.touchDeltaX=t.originalEvent.clientX-n.touchStartX),n._handleSwipe(),"hover"===n._config.pause&&(n.pause(),n.touchTimeout&&clearTimeout(n.touchTimeout),n.touchTimeout=setTimeout(function(t){return n.cycle(t)},500+n._config.interval))};g(this._element.querySelectorAll(nt)).on(Q.DRAG_START,function(t){return t.preventDefault()}),this._pointerEvent?(g(this._element).on(Q.POINTERDOWN,function(t){return e(t)}),g(this._element).on(Q.POINTERUP,function(t){return i(t)}),this._element.classList.add(J)):(g(this._element).on(Q.TOUCHSTART,function(t){return e(t)}),g(this._element).on(Q.TOUCHMOVE,function(t){var e;(e=t).originalEvent.touches&&1<e.originalEvent.touches.length?n.touchDeltaX=0:n.touchDeltaX=e.originalEvent.touches[0].clientX-n.touchStartX}),g(this._element).on(Q.TOUCHEND,function(t){return i(t)}))}},t._keydown=function(t){if(!/input|textarea/i.test(t.target.tagName))switch(t.which){case 37:t.preventDefault(),this.prev();break;case 39:t.preventDefault(),this.next()}},t._getItemIndex=function(t){return this._items=t&&t.parentNode?[].slice.call(t.parentNode.querySelectorAll(et)):[],this._items.indexOf(t)},t._getItemByDirection=function(t,e){var n=t===W,i=t===q,o=this._getItemIndex(e),r=this._items.length-1;if((i&&0===o||n&&o===r)&&!this._config.wrap)return e;var s=(o+(t===q?-1:1))%this._items.length;return-1===s?this._items[this._items.length-1]:this._items[s]},t._triggerSlideEvent=function(t,e){var n=this._getItemIndex(t),i=this._getItemIndex(this._element.querySelector(tt)),o=g.Event(Q.SLIDE,{relatedTarget:t,direction:e,from:i,to:n});return g(this._element).trigger(o),o},t._setActiveIndicatorElement=function(t){if(this._indicatorsElement){var e=[].slice.call(this._indicatorsElement.querySelectorAll(Z));g(e).removeClass(V);var n=this._indicatorsElement.children[this._getItemIndex(t)];n&&g(n).addClass(V)}},t._slide=function(t,e){var n,i,o,r=this,s=this._element.querySelector(tt),a=this._getItemIndex(s),l=e||s&&this._getItemByDirection(t,s),c=this._getItemIndex(l),h=Boolean(this._interval);if(o=t===W?(n=X,i=$,M):(n=z,i=G,K),l&&g(l).hasClass(V))this._isSliding=!1;else if(!this._triggerSlideEvent(l,o).isDefaultPrevented()&&s&&l){this._isSliding=!0,h&&this.pause(),this._setActiveIndicatorElement(l);var u=g.Event(Q.SLID,{relatedTarget:l,direction:o,from:a,to:c});if(g(this._element).hasClass(Y)){g(l).addClass(i),_.reflow(l),g(s).addClass(n),g(l).addClass(n);var f=parseInt(l.getAttribute("data-interval"),10);this._config.interval=f?(this._config.defaultInterval=this._config.defaultInterval||this._config.interval,f):this._config.defaultInterval||this._config.interval;var d=_.getTransitionDurationFromElement(s);g(s).one(_.TRANSITION_END,function(){g(l).removeClass(n+" "+i).addClass(V),g(s).removeClass(V+" "+i+" "+n),r._isSliding=!1,setTimeout(function(){return g(r._element).trigger(u)},0)}).emulateTransitionEnd(d)}else g(s).removeClass(V),g(l).addClass(V),this._isSliding=!1,g(this._element).trigger(u);h&&this.cycle()}},r._jQueryInterface=function(i){return this.each(function(){var t=g(this).data(j),e=l({},F,g(this).data());"object"==typeof i&&(e=l({},e,i));var n="string"==typeof i?i:e.slide;if(t||(t=new r(this,e),g(this).data(j,t)),"number"==typeof i)t.to(i);else if("string"==typeof n){if("undefined"==typeof t[n])throw new TypeError('No method named "'+n+'"');t[n]()}else e.interval&&e.ride&&(t.pause(),t.cycle())})},r._dataApiClickHandler=function(t){var e=_.getSelectorFromElement(this);if(e){var n=g(e)[0];if(n&&g(n).hasClass(B)){var i=l({},g(n).data(),g(this).data()),o=this.getAttribute("data-slide-to");o&&(i.interval=!1),r._jQueryInterface.call(g(n),i),o&&g(n).data(j).to(o),t.preventDefault()}}},s(r,null,[{key:"VERSION",get:function(){return"4.3.1"}},{key:"Default",get:function(){return F}}]),r}();g(document).on(Q.CLICK_DATA_API,rt,lt._dataApiClickHandler),g(window).on(Q.LOAD_DATA_API,function(){for(var t=[].slice.call(document.querySelectorAll(st)),e=0,n=t.length;e<n;e++){var i=g(t[e]);lt._jQueryInterface.call(i,i.data())}}),g.fn[L]=lt._jQueryInterface,g.fn[L].Constructor=lt,g.fn[L].noConflict=function(){return g.fn[L]=x,lt._jQueryInterface};var ct="collapse",ht="bs.collapse",ut="."+ht,ft=g.fn[ct],dt={toggle:!0,parent:""},gt={toggle:"boolean",parent:"(string|element)"},_t={SHOW:"show"+ut,SHOWN:"shown"+ut,HIDE:"hide"+ut,HIDDEN:"hidden"+ut,CLICK_DATA_API:"click"+ut+".data-api"},mt="show",pt="collapse",vt="collapsing",yt="collapsed",Et="width",Ct="height",Tt=".show, .collapsing",St='[data-toggle="collapse"]',bt=function(){function a(e,t){this._isTransitioning=!1,this._element=e,this._config=this._getConfig(t),this._triggerArray=[].slice.call(document.querySelectorAll('[data-toggle="collapse"][href="#'+e.id+'"],[data-toggle="collapse"][data-target="#'+e.id+'"]'));for(var n=[].slice.call(document.querySelectorAll(St)),i=0,o=n.length;i<o;i++){var r=n[i],s=_.getSelectorFromElement(r),a=[].slice.call(document.querySelectorAll(s)).filter(function(t){return t===e});null!==s&&0<a.length&&(this._selector=s,this._triggerArray.push(r))}this._parent=this._config.parent?this._getParent():null,this._config.parent||this._addAriaAndCollapsedClass(this._element,this._triggerArray),this._config.toggle&&this.toggle()}var t=a.prototype;return t.toggle=function(){g(this._element).hasClass(mt)?this.hide():this.show()},t.show=function(){var t,e,n=this;if(!this._isTransitioning&&!g(this._element).hasClass(mt)&&(this._parent&&0===(t=[].slice.call(this._parent.querySelectorAll(Tt)).filter(function(t){return"string"==typeof n._config.parent?t.getAttribute("data-parent")===n._config.parent:t.classList.contains(pt)})).length&&(t=null),!(t&&(e=g(t).not(this._selector).data(ht))&&e._isTransitioning))){var i=g.Event(_t.SHOW);if(g(this._element).trigger(i),!i.isDefaultPrevented()){t&&(a._jQueryInterface.call(g(t).not(this._selector),"hide"),e||g(t).data(ht,null));var o=this._getDimension();g(this._element).removeClass(pt).addClass(vt),this._element.style[o]=0,this._triggerArray.length&&g(this._triggerArray).removeClass(yt).attr("aria-expanded",!0),this.setTransitioning(!0);var r="scroll"+(o[0].toUpperCase()+o.slice(1)),s=_.getTransitionDurationFromElement(this._element);g(this._element).one(_.TRANSITION_END,function(){g(n._element).removeClass(vt).addClass(pt).addClass(mt),n._element.style[o]="",n.setTransitioning(!1),g(n._element).trigger(_t.SHOWN)}).emulateTransitionEnd(s),this._element.style[o]=this._element[r]+"px"}}},t.hide=function(){var t=this;if(!this._isTransitioning&&g(this._element).hasClass(mt)){var e=g.Event(_t.HIDE);if(g(this._element).trigger(e),!e.isDefaultPrevented()){var n=this._getDimension();this._element.style[n]=this._element.getBoundingClientRect()[n]+"px",_.reflow(this._element),g(this._element).addClass(vt).removeClass(pt).removeClass(mt);var i=this._triggerArray.length;if(0<i)for(var o=0;o<i;o++){var r=this._triggerArray[o],s=_.getSelectorFromElement(r);if(null!==s)g([].slice.call(document.querySelectorAll(s))).hasClass(mt)||g(r).addClass(yt).attr("aria-expanded",!1)}this.setTransitioning(!0);this._element.style[n]="";var a=_.getTransitionDurationFromElement(this._element);g(this._element).one(_.TRANSITION_END,function(){t.setTransitioning(!1),g(t._element).removeClass(vt).addClass(pt).trigger(_t.HIDDEN)}).emulateTransitionEnd(a)}}},t.setTransitioning=function(t){this._isTransitioning=t},t.dispose=function(){g.removeData(this._element,ht),this._config=null,this._parent=null,this._element=null,this._triggerArray=null,this._isTransitioning=null},t._getConfig=function(t){return(t=l({},dt,t)).toggle=Boolean(t.toggle),_.typeCheckConfig(ct,t,gt),t},t._getDimension=function(){return g(this._element).hasClass(Et)?Et:Ct},t._getParent=function(){var t,n=this;_.isElement(this._config.parent)?(t=this._config.parent,"undefined"!=typeof this._config.parent.jquery&&(t=this._config.parent[0])):t=document.querySelector(this._config.parent);var e='[data-toggle="collapse"][data-parent="'+this._config.parent+'"]',i=[].slice.call(t.querySelectorAll(e));return g(i).each(function(t,e){n._addAriaAndCollapsedClass(a._getTargetFromElement(e),[e])}),t},t._addAriaAndCollapsedClass=function(t,e){var n=g(t).hasClass(mt);e.length&&g(e).toggleClass(yt,!n).attr("aria-expanded",n)},a._getTargetFromElement=function(t){var e=_.getSelectorFromElement(t);return e?document.querySelector(e):null},a._jQueryInterface=function(i){return this.each(function(){var t=g(this),e=t.data(ht),n=l({},dt,t.data(),"object"==typeof i&&i?i:{});if(!e&&n.toggle&&/show|hide/.test(i)&&(n.toggle=!1),e||(e=new a(this,n),t.data(ht,e)),"string"==typeof i){if("undefined"==typeof e[i])throw new TypeError('No method named "'+i+'"');e[i]()}})},s(a,null,[{key:"VERSION",get:function(){return"4.3.1"}},{key:"Default",get:function(){return dt}}]),a}();g(document).on(_t.CLICK_DATA_API,St,function(t){"A"===t.currentTarget.tagName&&t.preventDefault();var n=g(this),e=_.getSelectorFromElement(this),i=[].slice.call(document.querySelectorAll(e));g(i).each(function(){var t=g(this),e=t.data(ht)?"toggle":n.data();bt._jQueryInterface.call(t,e)})}),g.fn[ct]=bt._jQueryInterface,g.fn[ct].Constructor=bt,g.fn[ct].noConflict=function(){return g.fn[ct]=ft,bt._jQueryInterface};var It="dropdown",Dt="bs.dropdown",wt="."+Dt,At=".data-api",Nt=g.fn[It],Ot=new RegExp("38|40|27"),kt={HIDE:"hide"+wt,HIDDEN:"hidden"+wt,SHOW:"show"+wt,SHOWN:"shown"+wt,CLICK:"click"+wt,CLICK_DATA_API:"click"+wt+At,KEYDOWN_DATA_API:"keydown"+wt+At,KEYUP_DATA_API:"keyup"+wt+At},Pt="disabled",Lt="show",jt="dropup",Ht="dropright",Rt="dropleft",xt="dropdown-menu-right",Ft="position-static",Ut='[data-toggle="dropdown"]',Wt=".dropdown form",qt=".dropdown-menu",Mt=".navbar-nav",Kt=".dropdown-menu .dropdown-item:not(.disabled):not(:disabled)",Qt="top-start",Bt="top-end",Vt="bottom-start",Yt="bottom-end",zt="right-start",Xt="left-start",$t={offset:0,flip:!0,boundary:"scrollParent",reference:"toggle",display:"dynamic"},Gt={offset:"(number|string|function)",flip:"boolean",boundary:"(string|element)",reference:"(string|element)",display:"string"},Jt=function(){function c(t,e){this._element=t,this._popper=null,this._config=this._getConfig(e),this._menu=this._getMenuElement(),this._inNavbar=this._detectNavbar(),this._addEventListeners()}var t=c.prototype;return t.toggle=function(){if(!this._element.disabled&&!g(this._element).hasClass(Pt)){var t=c._getParentFromElement(this._element),e=g(this._menu).hasClass(Lt);if(c._clearMenus(),!e){var n={relatedTarget:this._element},i=g.Event(kt.SHOW,n);if(g(t).trigger(i),!i.isDefaultPrevented()){if(!this._inNavbar){if("undefined"==typeof u)throw new TypeError("Bootstrap's dropdowns require Popper.js (https://popper.js.org/)");var o=this._element;"parent"===this._config.reference?o=t:_.isElement(this._config.reference)&&(o=this._config.reference,"undefined"!=typeof this._config.reference.jquery&&(o=this._config.reference[0])),"scrollParent"!==this._config.boundary&&g(t).addClass(Ft),this._popper=new u(o,this._menu,this._getPopperConfig())}"ontouchstart"in document.documentElement&&0===g(t).closest(Mt).length&&g(document.body).children().on("mouseover",null,g.noop),this._element.focus(),this._element.setAttribute("aria-expanded",!0),g(this._menu).toggleClass(Lt),g(t).toggleClass(Lt).trigger(g.Event(kt.SHOWN,n))}}}},t.show=function(){if(!(this._element.disabled||g(this._element).hasClass(Pt)||g(this._menu).hasClass(Lt))){var t={relatedTarget:this._element},e=g.Event(kt.SHOW,t),n=c._getParentFromElement(this._element);g(n).trigger(e),e.isDefaultPrevented()||(g(this._menu).toggleClass(Lt),g(n).toggleClass(Lt).trigger(g.Event(kt.SHOWN,t)))}},t.hide=function(){if(!this._element.disabled&&!g(this._element).hasClass(Pt)&&g(this._menu).hasClass(Lt)){var t={relatedTarget:this._element},e=g.Event(kt.HIDE,t),n=c._getParentFromElement(this._element);g(n).trigger(e),e.isDefaultPrevented()||(g(this._menu).toggleClass(Lt),g(n).toggleClass(Lt).trigger(g.Event(kt.HIDDEN,t)))}},t.dispose=function(){g.removeData(this._element,Dt),g(this._element).off(wt),this._element=null,(this._menu=null)!==this._popper&&(this._popper.destroy(),this._popper=null)},t.update=function(){this._inNavbar=this._detectNavbar(),null!==this._popper&&this._popper.scheduleUpdate()},t._addEventListeners=function(){var e=this;g(this._element).on(kt.CLICK,function(t){t.preventDefault(),t.stopPropagation(),e.toggle()})},t._getConfig=function(t){return t=l({},this.constructor.Default,g(this._element).data(),t),_.typeCheckConfig(It,t,this.constructor.DefaultType),t},t._getMenuElement=function(){if(!this._menu){var t=c._getParentFromElement(this._element);t&&(this._menu=t.querySelector(qt))}return this._menu},t._getPlacement=function(){var t=g(this._element.parentNode),e=Vt;return t.hasClass(jt)?(e=Qt,g(this._menu).hasClass(xt)&&(e=Bt)):t.hasClass(Ht)?e=zt:t.hasClass(Rt)?e=Xt:g(this._menu).hasClass(xt)&&(e=Yt),e},t._detectNavbar=function(){return 0<g(this._element).closest(".navbar").length},t._getOffset=function(){var e=this,t={};return"function"==typeof this._config.offset?t.fn=function(t){return t.offsets=l({},t.offsets,e._config.offset(t.offsets,e._element)||{}),t}:t.offset=this._config.offset,t},t._getPopperConfig=function(){var t={placement:this._getPlacement(),modifiers:{offset:this._getOffset(),flip:{enabled:this._config.flip},preventOverflow:{boundariesElement:this._config.boundary}}};return"static"===this._config.display&&(t.modifiers.applyStyle={enabled:!1}),t},c._jQueryInterface=function(e){return this.each(function(){var t=g(this).data(Dt);if(t||(t=new c(this,"object"==typeof e?e:null),g(this).data(Dt,t)),"string"==typeof e){if("undefined"==typeof t[e])throw new TypeError('No method named "'+e+'"');t[e]()}})},c._clearMenus=function(t){if(!t||3!==t.which&&("keyup"!==t.type||9===t.which))for(var e=[].slice.call(document.querySelectorAll(Ut)),n=0,i=e.length;n<i;n++){var o=c._getParentFromElement(e[n]),r=g(e[n]).data(Dt),s={relatedTarget:e[n]};if(t&&"click"===t.type&&(s.clickEvent=t),r){var a=r._menu;if(g(o).hasClass(Lt)&&!(t&&("click"===t.type&&/input|textarea/i.test(t.target.tagName)||"keyup"===t.type&&9===t.which)&&g.contains(o,t.target))){var l=g.Event(kt.HIDE,s);g(o).trigger(l),l.isDefaultPrevented()||("ontouchstart"in document.documentElement&&g(document.body).children().off("mouseover",null,g.noop),e[n].setAttribute("aria-expanded","false"),g(a).removeClass(Lt),g(o).removeClass(Lt).trigger(g.Event(kt.HIDDEN,s)))}}}},c._getParentFromElement=function(t){var e,n=_.getSelectorFromElement(t);return n&&(e=document.querySelector(n)),e||t.parentNode},c._dataApiKeydownHandler=function(t){if((/input|textarea/i.test(t.target.tagName)?!(32===t.which||27!==t.which&&(40!==t.which&&38!==t.which||g(t.target).closest(qt).length)):Ot.test(t.which))&&(t.preventDefault(),t.stopPropagation(),!this.disabled&&!g(this).hasClass(Pt))){var e=c._getParentFromElement(this),n=g(e).hasClass(Lt);if(n&&(!n||27!==t.which&&32!==t.which)){var i=[].slice.call(e.querySelectorAll(Kt));if(0!==i.length){var o=i.indexOf(t.target);38===t.which&&0<o&&o--,40===t.which&&o<i.length-1&&o++,o<0&&(o=0),i[o].focus()}}else{if(27===t.which){var r=e.querySelector(Ut);g(r).trigger("focus")}g(this).trigger("click")}}},s(c,null,[{key:"VERSION",get:function(){return"4.3.1"}},{key:"Default",get:function(){return $t}},{key:"DefaultType",get:function(){return Gt}}]),c}();g(document).on(kt.KEYDOWN_DATA_API,Ut,Jt._dataApiKeydownHandler).on(kt.KEYDOWN_DATA_API,qt,Jt._dataApiKeydownHandler).on(kt.CLICK_DATA_API+" "+kt.KEYUP_DATA_API,Jt._clearMenus).on(kt.CLICK_DATA_API,Ut,function(t){t.preventDefault(),t.stopPropagation(),Jt._jQueryInterface.call(g(this),"toggle")}).on(kt.CLICK_DATA_API,Wt,function(t){t.stopPropagation()}),g.fn[It]=Jt._jQueryInterface,g.fn[It].Constructor=Jt,g.fn[It].noConflict=function(){return g.fn[It]=Nt,Jt._jQueryInterface};var Zt="modal",te="bs.modal",ee="."+te,ne=g.fn[Zt],ie={backdrop:!0,keyboard:!0,focus:!0,show:!0},oe={backdrop:"(boolean|string)",keyboard:"boolean",focus:"boolean",show:"boolean"},re={HIDE:"hide"+ee,HIDDEN:"hidden"+ee,SHOW:"show"+ee,SHOWN:"shown"+ee,FOCUSIN:"focusin"+ee,RESIZE:"resize"+ee,CLICK_DISMISS:"click.dismiss"+ee,KEYDOWN_DISMISS:"keydown.dismiss"+ee,MOUSEUP_DISMISS:"mouseup.dismiss"+ee,MOUSEDOWN_DISMISS:"mousedown.dismiss"+ee,CLICK_DATA_API:"click"+ee+".data-api"},se="modal-dialog-scrollable",ae="modal-scrollbar-measure",le="modal-backdrop",ce="modal-open",he="fade",ue="show",fe=".modal-dialog",de=".modal-body",ge='[data-toggle="modal"]',_e='[data-dismiss="modal"]',me=".fixed-top, .fixed-bottom, .is-fixed, .sticky-top",pe=".sticky-top",ve=function(){function o(t,e){this._config=this._getConfig(e),this._element=t,this._dialog=t.querySelector(fe),this._backdrop=null,this._isShown=!1,this._isBodyOverflowing=!1,this._ignoreBackdropClick=!1,this._isTransitioning=!1,this._scrollbarWidth=0}var t=o.prototype;return t.toggle=function(t){return this._isShown?this.hide():this.show(t)},t.show=function(t){var e=this;if(!this._isShown&&!this._isTransitioning){g(this._element).hasClass(he)&&(this._isTransitioning=!0);var n=g.Event(re.SHOW,{relatedTarget:t});g(this._element).trigger(n),this._isShown||n.isDefaultPrevented()||(this._isShown=!0,this._checkScrollbar(),this._setScrollbar(),this._adjustDialog(),this._setEscapeEvent(),this._setResizeEvent(),g(this._element).on(re.CLICK_DISMISS,_e,function(t){return e.hide(t)}),g(this._dialog).on(re.MOUSEDOWN_DISMISS,function(){g(e._element).one(re.MOUSEUP_DISMISS,function(t){g(t.target).is(e._element)&&(e._ignoreBackdropClick=!0)})}),this._showBackdrop(function(){return e._showElement(t)}))}},t.hide=function(t){var e=this;if(t&&t.preventDefault(),this._isShown&&!this._isTransitioning){var n=g.Event(re.HIDE);if(g(this._element).trigger(n),this._isShown&&!n.isDefaultPrevented()){this._isShown=!1;var i=g(this._element).hasClass(he);if(i&&(this._isTransitioning=!0),this._setEscapeEvent(),this._setResizeEvent(),g(document).off(re.FOCUSIN),g(this._element).removeClass(ue),g(this._element).off(re.CLICK_DISMISS),g(this._dialog).off(re.MOUSEDOWN_DISMISS),i){var o=_.getTransitionDurationFromElement(this._element);g(this._element).one(_.TRANSITION_END,function(t){return e._hideModal(t)}).emulateTransitionEnd(o)}else this._hideModal()}}},t.dispose=function(){[window,this._element,this._dialog].forEach(function(t){return g(t).off(ee)}),g(document).off(re.FOCUSIN),g.removeData(this._element,te),this._config=null,this._element=null,this._dialog=null,this._backdrop=null,this._isShown=null,this._isBodyOverflowing=null,this._ignoreBackdropClick=null,this._isTransitioning=null,this._scrollbarWidth=null},t.handleUpdate=function(){this._adjustDialog()},t._getConfig=function(t){return t=l({},ie,t),_.typeCheckConfig(Zt,t,oe),t},t._showElement=function(t){var e=this,n=g(this._element).hasClass(he);this._element.parentNode&&this._element.parentNode.nodeType===Node.ELEMENT_NODE||document.body.appendChild(this._element),this._element.style.display="block",this._element.removeAttribute("aria-hidden"),this._element.setAttribute("aria-modal",!0),g(this._dialog).hasClass(se)?this._dialog.querySelector(de).scrollTop=0:this._element.scrollTop=0,n&&_.reflow(this._element),g(this._element).addClass(ue),this._config.focus&&this._enforceFocus();var i=g.Event(re.SHOWN,{relatedTarget:t}),o=function(){e._config.focus&&e._element.focus(),e._isTransitioning=!1,g(e._element).trigger(i)};if(n){var r=_.getTransitionDurationFromElement(this._dialog);g(this._dialog).one(_.TRANSITION_END,o).emulateTransitionEnd(r)}else o()},t._enforceFocus=function(){var e=this;g(document).off(re.FOCUSIN).on(re.FOCUSIN,function(t){document!==t.target&&e._element!==t.target&&0===g(e._element).has(t.target).length&&e._element.focus()})},t._setEscapeEvent=function(){var e=this;this._isShown&&this._config.keyboard?g(this._element).on(re.KEYDOWN_DISMISS,function(t){27===t.which&&(t.preventDefault(),e.hide())}):this._isShown||g(this._element).off(re.KEYDOWN_DISMISS)},t._setResizeEvent=function(){var e=this;this._isShown?g(window).on(re.RESIZE,function(t){return e.handleUpdate(t)}):g(window).off(re.RESIZE)},t._hideModal=function(){var t=this;this._element.style.display="none",this._element.setAttribute("aria-hidden",!0),this._element.removeAttribute("aria-modal"),this._isTransitioning=!1,this._showBackdrop(function(){g(document.body).removeClass(ce),t._resetAdjustments(),t._resetScrollbar(),g(t._element).trigger(re.HIDDEN)})},t._removeBackdrop=function(){this._backdrop&&(g(this._backdrop).remove(),this._backdrop=null)},t._showBackdrop=function(t){var e=this,n=g(this._element).hasClass(he)?he:"";if(this._isShown&&this._config.backdrop){if(this._backdrop=document.createElement("div"),this._backdrop.className=le,n&&this._backdrop.classList.add(n),g(this._backdrop).appendTo(document.body),g(this._element).on(re.CLICK_DISMISS,function(t){e._ignoreBackdropClick?e._ignoreBackdropClick=!1:t.target===t.currentTarget&&("static"===e._config.backdrop?e._element.focus():e.hide())}),n&&_.reflow(this._backdrop),g(this._backdrop).addClass(ue),!t)return;if(!n)return void t();var i=_.getTransitionDurationFromElement(this._backdrop);g(this._backdrop).one(_.TRANSITION_END,t).emulateTransitionEnd(i)}else if(!this._isShown&&this._backdrop){g(this._backdrop).removeClass(ue);var o=function(){e._removeBackdrop(),t&&t()};if(g(this._element).hasClass(he)){var r=_.getTransitionDurationFromElement(this._backdrop);g(this._backdrop).one(_.TRANSITION_END,o).emulateTransitionEnd(r)}else o()}else t&&t()},t._adjustDialog=function(){var t=this._element.scrollHeight>document.documentElement.clientHeight;!this._isBodyOverflowing&&t&&(this._element.style.paddingLeft=this._scrollbarWidth+"px"),this._isBodyOverflowing&&!t&&(this._element.style.paddingRight=this._scrollbarWidth+"px")},t._resetAdjustments=function(){this._element.style.paddingLeft="",this._element.style.paddingRight=""},t._checkScrollbar=function(){var t=document.body.getBoundingClientRect();this._isBodyOverflowing=t.left+t.right<window.innerWidth,this._scrollbarWidth=this._getScrollbarWidth()},t._setScrollbar=function(){var o=this;if(this._isBodyOverflowing){var t=[].slice.call(document.querySelectorAll(me)),e=[].slice.call(document.querySelectorAll(pe));g(t).each(function(t,e){var n=e.style.paddingRight,i=g(e).css("padding-right");g(e).data("padding-right",n).css("padding-right",parseFloat(i)+o._scrollbarWidth+"px")}),g(e).each(function(t,e){var n=e.style.marginRight,i=g(e).css("margin-right");g(e).data("margin-right",n).css("margin-right",parseFloat(i)-o._scrollbarWidth+"px")});var n=document.body.style.paddingRight,i=g(document.body).css("padding-right");g(document.body).data("padding-right",n).css("padding-right",parseFloat(i)+this._scrollbarWidth+"px")}g(document.body).addClass(ce)},t._resetScrollbar=function(){var t=[].slice.call(document.querySelectorAll(me));g(t).each(function(t,e){var n=g(e).data("padding-right");g(e).removeData("padding-right"),e.style.paddingRight=n||""});var e=[].slice.call(document.querySelectorAll(""+pe));g(e).each(function(t,e){var n=g(e).data("margin-right");"undefined"!=typeof n&&g(e).css("margin-right",n).removeData("margin-right")});var n=g(document.body).data("padding-right");g(document.body).removeData("padding-right"),document.body.style.paddingRight=n||""},t._getScrollbarWidth=function(){var t=document.createElement("div");t.className=ae,document.body.appendChild(t);var e=t.getBoundingClientRect().width-t.clientWidth;return document.body.removeChild(t),e},o._jQueryInterface=function(n,i){return this.each(function(){var t=g(this).data(te),e=l({},ie,g(this).data(),"object"==typeof n&&n?n:{});if(t||(t=new o(this,e),g(this).data(te,t)),"string"==typeof n){if("undefined"==typeof t[n])throw new TypeError('No method named "'+n+'"');t[n](i)}else e.show&&t.show(i)})},s(o,null,[{key:"VERSION",get:function(){return"4.3.1"}},{key:"Default",get:function(){return ie}}]),o}();g(document).on(re.CLICK_DATA_API,ge,function(t){var e,n=this,i=_.getSelectorFromElement(this);i&&(e=document.querySelector(i));var o=g(e).data(te)?"toggle":l({},g(e).data(),g(this).data());"A"!==this.tagName&&"AREA"!==this.tagName||t.preventDefault();var r=g(e).one(re.SHOW,function(t){t.isDefaultPrevented()||r.one(re.HIDDEN,function(){g(n).is(":visible")&&n.focus()})});ve._jQueryInterface.call(g(e),o,this)}),g.fn[Zt]=ve._jQueryInterface,g.fn[Zt].Constructor=ve,g.fn[Zt].noConflict=function(){return g.fn[Zt]=ne,ve._jQueryInterface};var ye=["background","cite","href","itemtype","longdesc","poster","src","xlink:href"],Ee={"*":["class","dir","id","lang","role",/^aria-[\w-]*$/i],a:["target","href","title","rel"],area:[],b:[],br:[],col:[],code:[],div:[],em:[],hr:[],h1:[],h2:[],h3:[],h4:[],h5:[],h6:[],i:[],img:["src","alt","title","width","height"],li:[],ol:[],p:[],pre:[],s:[],small:[],span:[],sub:[],sup:[],strong:[],u:[],ul:[]},Ce=/^(?:(?:https?|mailto|ftp|tel|file):|[^&:/?#]*(?:[/?#]|$))/gi,Te=/^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[a-z0-9+/]+=*$/i;function Se(t,s,e){if(0===t.length)return t;if(e&&"function"==typeof e)return e(t);for(var n=(new window.DOMParser).parseFromString(t,"text/html"),a=Object.keys(s),l=[].slice.call(n.body.querySelectorAll("*")),i=function(t,e){var n=l[t],i=n.nodeName.toLowerCase();if(-1===a.indexOf(n.nodeName.toLowerCase()))return n.parentNode.removeChild(n),"continue";var o=[].slice.call(n.attributes),r=[].concat(s["*"]||[],s[i]||[]);o.forEach(function(t){(function(t,e){var n=t.nodeName.toLowerCase();if(-1!==e.indexOf(n))return-1===ye.indexOf(n)||Boolean(t.nodeValue.match(Ce)||t.nodeValue.match(Te));for(var i=e.filter(function(t){return t instanceof RegExp}),o=0,r=i.length;o<r;o++)if(n.match(i[o]))return!0;return!1})(t,r)||n.removeAttribute(t.nodeName)})},o=0,r=l.length;o<r;o++)i(o);return n.body.innerHTML}var be="tooltip",Ie="bs.tooltip",De="."+Ie,we=g.fn[be],Ae="bs-tooltip",Ne=new RegExp("(^|\\s)"+Ae+"\\S+","g"),Oe=["sanitize","whiteList","sanitizeFn"],ke={animation:"boolean",template:"string",title:"(string|element|function)",trigger:"string",delay:"(number|object)",html:"boolean",selector:"(string|boolean)",placement:"(string|function)",offset:"(number|string|function)",container:"(string|element|boolean)",fallbackPlacement:"(string|array)",boundary:"(string|element)",sanitize:"boolean",sanitizeFn:"(null|function)",whiteList:"object"},Pe={AUTO:"auto",TOP:"top",RIGHT:"right",BOTTOM:"bottom",LEFT:"left"},Le={animation:!0,template:'<div class="tooltip" role="tooltip"><div class="arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:!1,selector:!1,placement:"top",offset:0,container:!1,fallbackPlacement:"flip",boundary:"scrollParent",sanitize:!0,sanitizeFn:null,whiteList:Ee},je="show",He="out",Re={HIDE:"hide"+De,HIDDEN:"hidden"+De,SHOW:"show"+De,SHOWN:"shown"+De,INSERTED:"inserted"+De,CLICK:"click"+De,FOCUSIN:"focusin"+De,FOCUSOUT:"focusout"+De,MOUSEENTER:"mouseenter"+De,MOUSELEAVE:"mouseleave"+De},xe="fade",Fe="show",Ue=".tooltip-inner",We=".arrow",qe="hover",Me="focus",Ke="click",Qe="manual",Be=function(){function i(t,e){if("undefined"==typeof u)throw new TypeError("Bootstrap's tooltips require Popper.js (https://popper.js.org/)");this._isEnabled=!0,this._timeout=0,this._hoverState="",this._activeTrigger={},this._popper=null,this.element=t,this.config=this._getConfig(e),this.tip=null,this._setListeners()}var t=i.prototype;return t.enable=function(){this._isEnabled=!0},t.disable=function(){this._isEnabled=!1},t.toggleEnabled=function(){this._isEnabled=!this._isEnabled},t.toggle=function(t){if(this._isEnabled)if(t){var e=this.constructor.DATA_KEY,n=g(t.currentTarget).data(e);n||(n=new this.constructor(t.currentTarget,this._getDelegateConfig()),g(t.currentTarget).data(e,n)),n._activeTrigger.click=!n._activeTrigger.click,n._isWithActiveTrigger()?n._enter(null,n):n._leave(null,n)}else{if(g(this.getTipElement()).hasClass(Fe))return void this._leave(null,this);this._enter(null,this)}},t.dispose=function(){clearTimeout(this._timeout),g.removeData(this.element,this.constructor.DATA_KEY),g(this.element).off(this.constructor.EVENT_KEY),g(this.element).closest(".modal").off("hide.bs.modal"),this.tip&&g(this.tip).remove(),this._isEnabled=null,this._timeout=null,this._hoverState=null,(this._activeTrigger=null)!==this._popper&&this._popper.destroy(),this._popper=null,this.element=null,this.config=null,this.tip=null},t.show=function(){var e=this;if("none"===g(this.element).css("display"))throw new Error("Please use show on visible elements");var t=g.Event(this.constructor.Event.SHOW);if(this.isWithContent()&&this._isEnabled){g(this.element).trigger(t);var n=_.findShadowRoot(this.element),i=g.contains(null!==n?n:this.element.ownerDocument.documentElement,this.element);if(t.isDefaultPrevented()||!i)return;var o=this.getTipElement(),r=_.getUID(this.constructor.NAME);o.setAttribute("id",r),this.element.setAttribute("aria-describedby",r),this.setContent(),this.config.animation&&g(o).addClass(xe);var s="function"==typeof this.config.placement?this.config.placement.call(this,o,this.element):this.config.placement,a=this._getAttachment(s);this.addAttachmentClass(a);var l=this._getContainer();g(o).data(this.constructor.DATA_KEY,this),g.contains(this.element.ownerDocument.documentElement,this.tip)||g(o).appendTo(l),g(this.element).trigger(this.constructor.Event.INSERTED),this._popper=new u(this.element,o,{placement:a,modifiers:{offset:this._getOffset(),flip:{behavior:this.config.fallbackPlacement},arrow:{element:We},preventOverflow:{boundariesElement:this.config.boundary}},onCreate:function(t){t.originalPlacement!==t.placement&&e._handlePopperPlacementChange(t)},onUpdate:function(t){return e._handlePopperPlacementChange(t)}}),g(o).addClass(Fe),"ontouchstart"in document.documentElement&&g(document.body).children().on("mouseover",null,g.noop);var c=function(){e.config.animation&&e._fixTransition();var t=e._hoverState;e._hoverState=null,g(e.element).trigger(e.constructor.Event.SHOWN),t===He&&e._leave(null,e)};if(g(this.tip).hasClass(xe)){var h=_.getTransitionDurationFromElement(this.tip);g(this.tip).one(_.TRANSITION_END,c).emulateTransitionEnd(h)}else c()}},t.hide=function(t){var e=this,n=this.getTipElement(),i=g.Event(this.constructor.Event.HIDE),o=function(){e._hoverState!==je&&n.parentNode&&n.parentNode.removeChild(n),e._cleanTipClass(),e.element.removeAttribute("aria-describedby"),g(e.element).trigger(e.constructor.Event.HIDDEN),null!==e._popper&&e._popper.destroy(),t&&t()};if(g(this.element).trigger(i),!i.isDefaultPrevented()){if(g(n).removeClass(Fe),"ontouchstart"in document.documentElement&&g(document.body).children().off("mouseover",null,g.noop),this._activeTrigger[Ke]=!1,this._activeTrigger[Me]=!1,this._activeTrigger[qe]=!1,g(this.tip).hasClass(xe)){var r=_.getTransitionDurationFromElement(n);g(n).one(_.TRANSITION_END,o).emulateTransitionEnd(r)}else o();this._hoverState=""}},t.update=function(){null!==this._popper&&this._popper.scheduleUpdate()},t.isWithContent=function(){return Boolean(this.getTitle())},t.addAttachmentClass=function(t){g(this.getTipElement()).addClass(Ae+"-"+t)},t.getTipElement=function(){return this.tip=this.tip||g(this.config.template)[0],this.tip},t.setContent=function(){var t=this.getTipElement();this.setElementContent(g(t.querySelectorAll(Ue)),this.getTitle()),g(t).removeClass(xe+" "+Fe)},t.setElementContent=function(t,e){"object"!=typeof e||!e.nodeType&&!e.jquery?this.config.html?(this.config.sanitize&&(e=Se(e,this.config.whiteList,this.config.sanitizeFn)),t.html(e)):t.text(e):this.config.html?g(e).parent().is(t)||t.empty().append(e):t.text(g(e).text())},t.getTitle=function(){var t=this.element.getAttribute("data-original-title");return t||(t="function"==typeof this.config.title?this.config.title.call(this.element):this.config.title),t},t._getOffset=function(){var e=this,t={};return"function"==typeof this.config.offset?t.fn=function(t){return t.offsets=l({},t.offsets,e.config.offset(t.offsets,e.element)||{}),t}:t.offset=this.config.offset,t},t._getContainer=function(){return!1===this.config.container?document.body:_.isElement(this.config.container)?g(this.config.container):g(document).find(this.config.container)},t._getAttachment=function(t){return Pe[t.toUpperCase()]},t._setListeners=function(){var i=this;this.config.trigger.split(" ").forEach(function(t){if("click"===t)g(i.element).on(i.constructor.Event.CLICK,i.config.selector,function(t){return i.toggle(t)});else if(t!==Qe){var e=t===qe?i.constructor.Event.MOUSEENTER:i.constructor.Event.FOCUSIN,n=t===qe?i.constructor.Event.MOUSELEAVE:i.constructor.Event.FOCUSOUT;g(i.element).on(e,i.config.selector,function(t){return i._enter(t)}).on(n,i.config.selector,function(t){return i._leave(t)})}}),g(this.element).closest(".modal").on("hide.bs.modal",function(){i.element&&i.hide()}),this.config.selector?this.config=l({},this.config,{trigger:"manual",selector:""}):this._fixTitle()},t._fixTitle=function(){var t=typeof this.element.getAttribute("data-original-title");(this.element.getAttribute("title")||"string"!==t)&&(this.element.setAttribute("data-original-title",this.element.getAttribute("title")||""),this.element.setAttribute("title",""))},t._enter=function(t,e){var n=this.constructor.DATA_KEY;(e=e||g(t.currentTarget).data(n))||(e=new this.constructor(t.currentTarget,this._getDelegateConfig()),g(t.currentTarget).data(n,e)),t&&(e._activeTrigger["focusin"===t.type?Me:qe]=!0),g(e.getTipElement()).hasClass(Fe)||e._hoverState===je?e._hoverState=je:(clearTimeout(e._timeout),e._hoverState=je,e.config.delay&&e.config.delay.show?e._timeout=setTimeout(function(){e._hoverState===je&&e.show()},e.config.delay.show):e.show())},t._leave=function(t,e){var n=this.constructor.DATA_KEY;(e=e||g(t.currentTarget).data(n))||(e=new this.constructor(t.currentTarget,this._getDelegateConfig()),g(t.currentTarget).data(n,e)),t&&(e._activeTrigger["focusout"===t.type?Me:qe]=!1),e._isWithActiveTrigger()||(clearTimeout(e._timeout),e._hoverState=He,e.config.delay&&e.config.delay.hide?e._timeout=setTimeout(function(){e._hoverState===He&&e.hide()},e.config.delay.hide):e.hide())},t._isWithActiveTrigger=function(){for(var t in this._activeTrigger)if(this._activeTrigger[t])return!0;return!1},t._getConfig=function(t){var e=g(this.element).data();return Object.keys(e).forEach(function(t){-1!==Oe.indexOf(t)&&delete e[t]}),"number"==typeof(t=l({},this.constructor.Default,e,"object"==typeof t&&t?t:{})).delay&&(t.delay={show:t.delay,hide:t.delay}),"number"==typeof t.title&&(t.title=t.title.toString()),"number"==typeof t.content&&(t.content=t.content.toString()),_.typeCheckConfig(be,t,this.constructor.DefaultType),t.sanitize&&(t.template=Se(t.template,t.whiteList,t.sanitizeFn)),t},t._getDelegateConfig=function(){var t={};if(this.config)for(var e in this.config)this.constructor.Default[e]!==this.config[e]&&(t[e]=this.config[e]);return t},t._cleanTipClass=function(){var t=g(this.getTipElement()),e=t.attr("class").match(Ne);null!==e&&e.length&&t.removeClass(e.join(""))},t._handlePopperPlacementChange=function(t){var e=t.instance;this.tip=e.popper,this._cleanTipClass(),this.addAttachmentClass(this._getAttachment(t.placement))},t._fixTransition=function(){var t=this.getTipElement(),e=this.config.animation;null===t.getAttribute("x-placement")&&(g(t).removeClass(xe),this.config.animation=!1,this.hide(),this.show(),this.config.animation=e)},i._jQueryInterface=function(n){return this.each(function(){var t=g(this).data(Ie),e="object"==typeof n&&n;if((t||!/dispose|hide/.test(n))&&(t||(t=new i(this,e),g(this).data(Ie,t)),"string"==typeof n)){if("undefined"==typeof t[n])throw new TypeError('No method named "'+n+'"');t[n]()}})},s(i,null,[{key:"VERSION",get:function(){return"4.3.1"}},{key:"Default",get:function(){return Le}},{key:"NAME",get:function(){return be}},{key:"DATA_KEY",get:function(){return Ie}},{key:"Event",get:function(){return Re}},{key:"EVENT_KEY",get:function(){return De}},{key:"DefaultType",get:function(){return ke}}]),i}();g.fn[be]=Be._jQueryInterface,g.fn[be].Constructor=Be,g.fn[be].noConflict=function(){return g.fn[be]=we,Be._jQueryInterface};var Ve="popover",Ye="bs.popover",ze="."+Ye,Xe=g.fn[Ve],$e="bs-popover",Ge=new RegExp("(^|\\s)"+$e+"\\S+","g"),Je=l({},Be.Default,{placement:"right",trigger:"click",content:"",template:'<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-header"></h3><div class="popover-body"></div></div>'}),Ze=l({},Be.DefaultType,{content:"(string|element|function)"}),tn="fade",en="show",nn=".popover-header",on=".popover-body",rn={HIDE:"hide"+ze,HIDDEN:"hidden"+ze,SHOW:"show"+ze,SHOWN:"shown"+ze,INSERTED:"inserted"+ze,CLICK:"click"+ze,FOCUSIN:"focusin"+ze,FOCUSOUT:"focusout"+ze,MOUSEENTER:"mouseenter"+ze,MOUSELEAVE:"mouseleave"+ze},sn=function(t){var e,n;function i(){return t.apply(this,arguments)||this}n=t,(e=i).prototype=Object.create(n.prototype),(e.prototype.constructor=e).__proto__=n;var o=i.prototype;return o.isWithContent=function(){return this.getTitle()||this._getContent()},o.addAttachmentClass=function(t){g(this.getTipElement()).addClass($e+"-"+t)},o.getTipElement=function(){return this.tip=this.tip||g(this.config.template)[0],this.tip},o.setContent=function(){var t=g(this.getTipElement());this.setElementContent(t.find(nn),this.getTitle());var e=this._getContent();"function"==typeof e&&(e=e.call(this.element)),this.setElementContent(t.find(on),e),t.removeClass(tn+" "+en)},o._getContent=function(){return this.element.getAttribute("data-content")||this.config.content},o._cleanTipClass=function(){var t=g(this.getTipElement()),e=t.attr("class").match(Ge);null!==e&&0<e.length&&t.removeClass(e.join(""))},i._jQueryInterface=function(n){return this.each(function(){var t=g(this).data(Ye),e="object"==typeof n?n:null;if((t||!/dispose|hide/.test(n))&&(t||(t=new i(this,e),g(this).data(Ye,t)),"string"==typeof n)){if("undefined"==typeof t[n])throw new TypeError('No method named "'+n+'"');t[n]()}})},s(i,null,[{key:"VERSION",get:function(){return"4.3.1"}},{key:"Default",get:function(){return Je}},{key:"NAME",get:function(){return Ve}},{key:"DATA_KEY",get:function(){return Ye}},{key:"Event",get:function(){return rn}},{key:"EVENT_KEY",get:function(){return ze}},{key:"DefaultType",get:function(){return Ze}}]),i}(Be);g.fn[Ve]=sn._jQueryInterface,g.fn[Ve].Constructor=sn,g.fn[Ve].noConflict=function(){return g.fn[Ve]=Xe,sn._jQueryInterface};var an="scrollspy",ln="bs.scrollspy",cn="."+ln,hn=g.fn[an],un={offset:10,method:"auto",target:""},fn={offset:"number",method:"string",target:"(string|element)"},dn={ACTIVATE:"activate"+cn,SCROLL:"scroll"+cn,LOAD_DATA_API:"load"+cn+".data-api"},gn="dropdown-item",_n="active",mn='[data-spy="scroll"]',pn=".nav, .list-group",vn=".nav-link",yn=".nav-item",En=".list-group-item",Cn=".dropdown",Tn=".dropdown-item",Sn=".dropdown-toggle",bn="offset",In="position",Dn=function(){function n(t,e){var n=this;this._element=t,this._scrollElement="BODY"===t.tagName?window:t,this._config=this._getConfig(e),this._selector=this._config.target+" "+vn+","+this._config.target+" "+En+","+this._config.target+" "+Tn,this._offsets=[],this._targets=[],this._activeTarget=null,this._scrollHeight=0,g(this._scrollElement).on(dn.SCROLL,function(t){return n._process(t)}),this.refresh(),this._process()}var t=n.prototype;return t.refresh=function(){var e=this,t=this._scrollElement===this._scrollElement.window?bn:In,o="auto"===this._config.method?t:this._config.method,r=o===In?this._getScrollTop():0;this._offsets=[],this._targets=[],this._scrollHeight=this._getScrollHeight(),[].slice.call(document.querySelectorAll(this._selector)).map(function(t){var e,n=_.getSelectorFromElement(t);if(n&&(e=document.querySelector(n)),e){var i=e.getBoundingClientRect();if(i.width||i.height)return[g(e)[o]().top+r,n]}return null}).filter(function(t){return t}).sort(function(t,e){return t[0]-e[0]}).forEach(function(t){e._offsets.push(t[0]),e._targets.push(t[1])})},t.dispose=function(){g.removeData(this._element,ln),g(this._scrollElement).off(cn),this._element=null,this._scrollElement=null,this._config=null,this._selector=null,this._offsets=null,this._targets=null,this._activeTarget=null,this._scrollHeight=null},t._getConfig=function(t){if("string"!=typeof(t=l({},un,"object"==typeof t&&t?t:{})).target){var e=g(t.target).attr("id");e||(e=_.getUID(an),g(t.target).attr("id",e)),t.target="#"+e}return _.typeCheckConfig(an,t,fn),t},t._getScrollTop=function(){return this._scrollElement===window?this._scrollElement.pageYOffset:this._scrollElement.scrollTop},t._getScrollHeight=function(){return this._scrollElement.scrollHeight||Math.max(document.body.scrollHeight,document.documentElement.scrollHeight)},t._getOffsetHeight=function(){return this._scrollElement===window?window.innerHeight:this._scrollElement.getBoundingClientRect().height},t._process=function(){var t=this._getScrollTop()+this._config.offset,e=this._getScrollHeight(),n=this._config.offset+e-this._getOffsetHeight();if(this._scrollHeight!==e&&this.refresh(),n<=t){var i=this._targets[this._targets.length-1];this._activeTarget!==i&&this._activate(i)}else{if(this._activeTarget&&t<this._offsets[0]&&0<this._offsets[0])return this._activeTarget=null,void this._clear();for(var o=this._offsets.length;o--;){this._activeTarget!==this._targets[o]&&t>=this._offsets[o]&&("undefined"==typeof this._offsets[o+1]||t<this._offsets[o+1])&&this._activate(this._targets[o])}}},t._activate=function(e){this._activeTarget=e,this._clear();var t=this._selector.split(",").map(function(t){return t+'[data-target="'+e+'"],'+t+'[href="'+e+'"]'}),n=g([].slice.call(document.querySelectorAll(t.join(","))));n.hasClass(gn)?(n.closest(Cn).find(Sn).addClass(_n),n.addClass(_n)):(n.addClass(_n),n.parents(pn).prev(vn+", "+En).addClass(_n),n.parents(pn).prev(yn).children(vn).addClass(_n)),g(this._scrollElement).trigger(dn.ACTIVATE,{relatedTarget:e})},t._clear=function(){[].slice.call(document.querySelectorAll(this._selector)).filter(function(t){return t.classList.contains(_n)}).forEach(function(t){return t.classList.remove(_n)})},n._jQueryInterface=function(e){return this.each(function(){var t=g(this).data(ln);if(t||(t=new n(this,"object"==typeof e&&e),g(this).data(ln,t)),"string"==typeof e){if("undefined"==typeof t[e])throw new TypeError('No method named "'+e+'"');t[e]()}})},s(n,null,[{key:"VERSION",get:function(){return"4.3.1"}},{key:"Default",get:function(){return un}}]),n}();g(window).on(dn.LOAD_DATA_API,function(){for(var t=[].slice.call(document.querySelectorAll(mn)),e=t.length;e--;){var n=g(t[e]);Dn._jQueryInterface.call(n,n.data())}}),g.fn[an]=Dn._jQueryInterface,g.fn[an].Constructor=Dn,g.fn[an].noConflict=function(){return g.fn[an]=hn,Dn._jQueryInterface};var wn="bs.tab",An="."+wn,Nn=g.fn.tab,On={HIDE:"hide"+An,HIDDEN:"hidden"+An,SHOW:"show"+An,SHOWN:"shown"+An,CLICK_DATA_API:"click"+An+".data-api"},kn="dropdown-menu",Pn="active",Ln="disabled",jn="fade",Hn="show",Rn=".dropdown",xn=".nav, .list-group",Fn=".active",Un="> li > .active",Wn='[data-toggle="tab"], [data-toggle="pill"], [data-toggle="list"]',qn=".dropdown-toggle",Mn="> .dropdown-menu .active",Kn=function(){function i(t){this._element=t}var t=i.prototype;return t.show=function(){var n=this;if(!(this._element.parentNode&&this._element.parentNode.nodeType===Node.ELEMENT_NODE&&g(this._element).hasClass(Pn)||g(this._element).hasClass(Ln))){var t,i,e=g(this._element).closest(xn)[0],o=_.getSelectorFromElement(this._element);if(e){var r="UL"===e.nodeName||"OL"===e.nodeName?Un:Fn;i=(i=g.makeArray(g(e).find(r)))[i.length-1]}var s=g.Event(On.HIDE,{relatedTarget:this._element}),a=g.Event(On.SHOW,{relatedTarget:i});if(i&&g(i).trigger(s),g(this._element).trigger(a),!a.isDefaultPrevented()&&!s.isDefaultPrevented()){o&&(t=document.querySelector(o)),this._activate(this._element,e);var l=function(){var t=g.Event(On.HIDDEN,{relatedTarget:n._element}),e=g.Event(On.SHOWN,{relatedTarget:i});g(i).trigger(t),g(n._element).trigger(e)};t?this._activate(t,t.parentNode,l):l()}}},t.dispose=function(){g.removeData(this._element,wn),this._element=null},t._activate=function(t,e,n){var i=this,o=(!e||"UL"!==e.nodeName&&"OL"!==e.nodeName?g(e).children(Fn):g(e).find(Un))[0],r=n&&o&&g(o).hasClass(jn),s=function(){return i._transitionComplete(t,o,n)};if(o&&r){var a=_.getTransitionDurationFromElement(o);g(o).removeClass(Hn).one(_.TRANSITION_END,s).emulateTransitionEnd(a)}else s()},t._transitionComplete=function(t,e,n){if(e){g(e).removeClass(Pn);var i=g(e.parentNode).find(Mn)[0];i&&g(i).removeClass(Pn),"tab"===e.getAttribute("role")&&e.setAttribute("aria-selected",!1)}if(g(t).addClass(Pn),"tab"===t.getAttribute("role")&&t.setAttribute("aria-selected",!0),_.reflow(t),t.classList.contains(jn)&&t.classList.add(Hn),t.parentNode&&g(t.parentNode).hasClass(kn)){var o=g(t).closest(Rn)[0];if(o){var r=[].slice.call(o.querySelectorAll(qn));g(r).addClass(Pn)}t.setAttribute("aria-expanded",!0)}n&&n()},i._jQueryInterface=function(n){return this.each(function(){var t=g(this),e=t.data(wn);if(e||(e=new i(this),t.data(wn,e)),"string"==typeof n){if("undefined"==typeof e[n])throw new TypeError('No method named "'+n+'"');e[n]()}})},s(i,null,[{key:"VERSION",get:function(){return"4.3.1"}}]),i}();g(document).on(On.CLICK_DATA_API,Wn,function(t){t.preventDefault(),Kn._jQueryInterface.call(g(this),"show")}),g.fn.tab=Kn._jQueryInterface,g.fn.tab.Constructor=Kn,g.fn.tab.noConflict=function(){return g.fn.tab=Nn,Kn._jQueryInterface};var Qn="toast",Bn="bs.toast",Vn="."+Bn,Yn=g.fn[Qn],zn={CLICK_DISMISS:"click.dismiss"+Vn,HIDE:"hide"+Vn,HIDDEN:"hidden"+Vn,SHOW:"show"+Vn,SHOWN:"shown"+Vn},Xn="fade",$n="hide",Gn="show",Jn="showing",Zn={animation:"boolean",autohide:"boolean",delay:"number"},ti={animation:!0,autohide:!0,delay:500},ei='[data-dismiss="toast"]',ni=function(){function i(t,e){this._element=t,this._config=this._getConfig(e),this._timeout=null,this._setListeners()}var t=i.prototype;return t.show=function(){var t=this;g(this._element).trigger(zn.SHOW),this._config.animation&&this._element.classList.add(Xn);var e=function(){t._element.classList.remove(Jn),t._element.classList.add(Gn),g(t._element).trigger(zn.SHOWN),t._config.autohide&&t.hide()};if(this._element.classList.remove($n),this._element.classList.add(Jn),this._config.animation){var n=_.getTransitionDurationFromElement(this._element);g(this._element).one(_.TRANSITION_END,e).emulateTransitionEnd(n)}else e()},t.hide=function(t){var e=this;this._element.classList.contains(Gn)&&(g(this._element).trigger(zn.HIDE),t?this._close():this._timeout=setTimeout(function(){e._close()},this._config.delay))},t.dispose=function(){clearTimeout(this._timeout),this._timeout=null,this._element.classList.contains(Gn)&&this._element.classList.remove(Gn),g(this._element).off(zn.CLICK_DISMISS),g.removeData(this._element,Bn),this._element=null,this._config=null},t._getConfig=function(t){return t=l({},ti,g(this._element).data(),"object"==typeof t&&t?t:{}),_.typeCheckConfig(Qn,t,this.constructor.DefaultType),t},t._setListeners=function(){var t=this;g(this._element).on(zn.CLICK_DISMISS,ei,function(){return t.hide(!0)})},t._close=function(){var t=this,e=function(){t._element.classList.add($n),g(t._element).trigger(zn.HIDDEN)};if(this._element.classList.remove(Gn),this._config.animation){var n=_.getTransitionDurationFromElement(this._element);g(this._element).one(_.TRANSITION_END,e).emulateTransitionEnd(n)}else e()},i._jQueryInterface=function(n){return this.each(function(){var t=g(this),e=t.data(Bn);if(e||(e=new i(this,"object"==typeof n&&n),t.data(Bn,e)),"string"==typeof n){if("undefined"==typeof e[n])throw new TypeError('No method named "'+n+'"');e[n](this)}})},s(i,null,[{key:"VERSION",get:function(){return"4.3.1"}},{key:"DefaultType",get:function(){return Zn}},{key:"Default",get:function(){return ti}}]),i}();g.fn[Qn]=ni._jQueryInterface,g.fn[Qn].Constructor=ni,g.fn[Qn].noConflict=function(){return g.fn[Qn]=Yn,ni._jQueryInterface},function(){if("undefined"==typeof g)throw new TypeError("Bootstrap's JavaScript requires jQuery. jQuery must be included before Bootstrap's JavaScript.");var t=g.fn.jquery.split(" ")[0].split(".");if(t[0]<2&&t[1]<9||1===t[0]&&9===t[1]&&t[2]<1||4<=t[0])throw new Error("Bootstrap's JavaScript requires at least jQuery v1.9.1 but less than v4.0.0")}(),t.Util=_,t.Alert=p,t.Button=P,t.Carousel=lt,t.Collapse=bt,t.Dropdown=Jt,t.Modal=ve,t.Popover=sn,t.Scrollspy=Dn,t.Tab=Kn,t.Toast=ni,t.Tooltip=Be,Object.defineProperty(t,"__esModule",{value:!0})});

/*!
 * Bootstrap-select v1.13.14 (https://developer.snapappointments.com/bootstrap-select)
 *
 * Copyright 2012-2020 SnapAppointments, LLC
 * Licensed under MIT (https://github.com/snapappointments/bootstrap-select/blob/master/LICENSE)
 */


!function(e,t){void 0===e&&void 0!==window&&(e=window),"function"==typeof define&&define.amd?define(["jquery"],function(e){return t(e)}):"object"==typeof module&&module.exports?module.exports=t(require("jquery")):t(e.jQuery)}(this,function(e){!function(z){"use strict";var d=["sanitize","whiteList","sanitizeFn"],r=["background","cite","href","itemtype","longdesc","poster","src","xlink:href"],e={"*":["class","dir","id","lang","role","tabindex","style",/^aria-[\w-]*$/i],a:["target","href","title","rel"],area:[],b:[],br:[],col:[],code:[],div:[],em:[],hr:[],h1:[],h2:[],h3:[],h4:[],h5:[],h6:[],i:[],img:["src","alt","title","width","height"],li:[],ol:[],p:[],pre:[],s:[],small:[],span:[],sub:[],sup:[],strong:[],u:[],ul:[]},l=/^(?:(?:https?|mailto|ftp|tel|file):|[^&:/?#]*(?:[/?#]|$))/gi,a=/^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[a-z0-9+/]+=*$/i;function v(e,t){var i=e.nodeName.toLowerCase();if(-1!==z.inArray(i,t))return-1===z.inArray(i,r)||Boolean(e.nodeValue.match(l)||e.nodeValue.match(a));for(var s=z(t).filter(function(e,t){return t instanceof RegExp}),n=0,o=s.length;n<o;n++)if(i.match(s[n]))return!0;return!1}function P(e,t,i){if(i&&"function"==typeof i)return i(e);for(var s=Object.keys(t),n=0,o=e.length;n<o;n++)for(var r=e[n].querySelectorAll("*"),l=0,a=r.length;l<a;l++){var c=r[l],d=c.nodeName.toLowerCase();if(-1!==s.indexOf(d))for(var h=[].slice.call(c.attributes),p=[].concat(t["*"]||[],t[d]||[]),u=0,f=h.length;u<f;u++){var m=h[u];v(m,p)||c.removeAttribute(m.nodeName)}else c.parentNode.removeChild(c)}}"classList"in document.createElement("_")||function(e){if("Element"in e){var t="classList",i="prototype",s=e.Element[i],n=Object,o=function(){var i=z(this);return{add:function(e){return e=Array.prototype.slice.call(arguments).join(" "),i.addClass(e)},remove:function(e){return e=Array.prototype.slice.call(arguments).join(" "),i.removeClass(e)},toggle:function(e,t){return i.toggleClass(e,t)},contains:function(e){return i.hasClass(e)}}};if(n.defineProperty){var r={get:o,enumerable:!0,configurable:!0};try{n.defineProperty(s,t,r)}catch(e){void 0!==e.number&&-2146823252!==e.number||(r.enumerable=!1,n.defineProperty(s,t,r))}}else n[i].__defineGetter__&&s.__defineGetter__(t,o)}}(window);var t,c,i=document.createElement("_");if(i.classList.add("c1","c2"),!i.classList.contains("c2")){var s=DOMTokenList.prototype.add,n=DOMTokenList.prototype.remove;DOMTokenList.prototype.add=function(){Array.prototype.forEach.call(arguments,s.bind(this))},DOMTokenList.prototype.remove=function(){Array.prototype.forEach.call(arguments,n.bind(this))}}if(i.classList.toggle("c3",!1),i.classList.contains("c3")){var o=DOMTokenList.prototype.toggle;DOMTokenList.prototype.toggle=function(e,t){return 1 in arguments&&!this.contains(e)==!t?t:o.call(this,e)}}function h(e){if(null==this)throw new TypeError;var t=String(this);if(e&&"[object RegExp]"==c.call(e))throw new TypeError;var i=t.length,s=String(e),n=s.length,o=1<arguments.length?arguments[1]:void 0,r=o?Number(o):0;r!=r&&(r=0);var l=Math.min(Math.max(r,0),i);if(i<n+l)return!1;for(var a=-1;++a<n;)if(t.charCodeAt(l+a)!=s.charCodeAt(a))return!1;return!0}function O(e,t){var i,s=e.selectedOptions,n=[];if(t){for(var o=0,r=s.length;o<r;o++)(i=s[o]).disabled||"OPTGROUP"===i.parentNode.tagName&&i.parentNode.disabled||n.push(i);return n}return s}function T(e,t){for(var i,s=[],n=t||e.selectedOptions,o=0,r=n.length;o<r;o++)(i=n[o]).disabled||"OPTGROUP"===i.parentNode.tagName&&i.parentNode.disabled||s.push(i.value);return e.multiple?s:s.length?s[0]:null}i=null,String.prototype.startsWith||(t=function(){try{var e={},t=Object.defineProperty,i=t(e,e,e)&&t}catch(e){}return i}(),c={}.toString,t?t(String.prototype,"startsWith",{value:h,configurable:!0,writable:!0}):String.prototype.startsWith=h),Object.keys||(Object.keys=function(e,t,i){for(t in i=[],e)i.hasOwnProperty.call(e,t)&&i.push(t);return i}),HTMLSelectElement&&!HTMLSelectElement.prototype.hasOwnProperty("selectedOptions")&&Object.defineProperty(HTMLSelectElement.prototype,"selectedOptions",{get:function(){return this.querySelectorAll(":checked")}});var p={useDefault:!1,_set:z.valHooks.select.set};z.valHooks.select.set=function(e,t){return t&&!p.useDefault&&z(e).data("selected",!0),p._set.apply(this,arguments)};var A=null,u=function(){try{return new Event("change"),!0}catch(e){return!1}}();function k(e,t,i,s){for(var n=["display","subtext","tokens"],o=!1,r=0;r<n.length;r++){var l=n[r],a=e[l];if(a&&(a=a.toString(),"display"===l&&(a=a.replace(/<[^>]+>/g,"")),s&&(a=w(a)),a=a.toUpperCase(),o="contains"===i?0<=a.indexOf(t):a.startsWith(t)))break}return o}function L(e){return parseInt(e,10)||0}z.fn.triggerNative=function(e){var t,i=this[0];i.dispatchEvent?(u?t=new Event(e,{bubbles:!0}):(t=document.createEvent("Event")).initEvent(e,!0,!1),i.dispatchEvent(t)):i.fireEvent?((t=document.createEventObject()).eventType=e,i.fireEvent("on"+e,t)):this.trigger(e)};var f={"\xc0":"A","\xc1":"A","\xc2":"A","\xc3":"A","\xc4":"A","\xc5":"A","\xe0":"a","\xe1":"a","\xe2":"a","\xe3":"a","\xe4":"a","\xe5":"a","\xc7":"C","\xe7":"c","\xd0":"D","\xf0":"d","\xc8":"E","\xc9":"E","\xca":"E","\xcb":"E","\xe8":"e","\xe9":"e","\xea":"e","\xeb":"e","\xcc":"I","\xcd":"I","\xce":"I","\xcf":"I","\xec":"i","\xed":"i","\xee":"i","\xef":"i","\xd1":"N","\xf1":"n","\xd2":"O","\xd3":"O","\xd4":"O","\xd5":"O","\xd6":"O","\xd8":"O","\xf2":"o","\xf3":"o","\xf4":"o","\xf5":"o","\xf6":"o","\xf8":"o","\xd9":"U","\xda":"U","\xdb":"U","\xdc":"U","\xf9":"u","\xfa":"u","\xfb":"u","\xfc":"u","\xdd":"Y","\xfd":"y","\xff":"y","\xc6":"Ae","\xe6":"ae","\xde":"Th","\xfe":"th","\xdf":"ss","\u0100":"A","\u0102":"A","\u0104":"A","\u0101":"a","\u0103":"a","\u0105":"a","\u0106":"C","\u0108":"C","\u010a":"C","\u010c":"C","\u0107":"c","\u0109":"c","\u010b":"c","\u010d":"c","\u010e":"D","\u0110":"D","\u010f":"d","\u0111":"d","\u0112":"E","\u0114":"E","\u0116":"E","\u0118":"E","\u011a":"E","\u0113":"e","\u0115":"e","\u0117":"e","\u0119":"e","\u011b":"e","\u011c":"G","\u011e":"G","\u0120":"G","\u0122":"G","\u011d":"g","\u011f":"g","\u0121":"g","\u0123":"g","\u0124":"H","\u0126":"H","\u0125":"h","\u0127":"h","\u0128":"I","\u012a":"I","\u012c":"I","\u012e":"I","\u0130":"I","\u0129":"i","\u012b":"i","\u012d":"i","\u012f":"i","\u0131":"i","\u0134":"J","\u0135":"j","\u0136":"K","\u0137":"k","\u0138":"k","\u0139":"L","\u013b":"L","\u013d":"L","\u013f":"L","\u0141":"L","\u013a":"l","\u013c":"l","\u013e":"l","\u0140":"l","\u0142":"l","\u0143":"N","\u0145":"N","\u0147":"N","\u014a":"N","\u0144":"n","\u0146":"n","\u0148":"n","\u014b":"n","\u014c":"O","\u014e":"O","\u0150":"O","\u014d":"o","\u014f":"o","\u0151":"o","\u0154":"R","\u0156":"R","\u0158":"R","\u0155":"r","\u0157":"r","\u0159":"r","\u015a":"S","\u015c":"S","\u015e":"S","\u0160":"S","\u015b":"s","\u015d":"s","\u015f":"s","\u0161":"s","\u0162":"T","\u0164":"T","\u0166":"T","\u0163":"t","\u0165":"t","\u0167":"t","\u0168":"U","\u016a":"U","\u016c":"U","\u016e":"U","\u0170":"U","\u0172":"U","\u0169":"u","\u016b":"u","\u016d":"u","\u016f":"u","\u0171":"u","\u0173":"u","\u0174":"W","\u0175":"w","\u0176":"Y","\u0177":"y","\u0178":"Y","\u0179":"Z","\u017b":"Z","\u017d":"Z","\u017a":"z","\u017c":"z","\u017e":"z","\u0132":"IJ","\u0133":"ij","\u0152":"Oe","\u0153":"oe","\u0149":"'n","\u017f":"s"},m=/[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g,g=RegExp("[\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff\\u1ab0-\\u1aff\\u1dc0-\\u1dff]","g");function b(e){return f[e]}function w(e){return(e=e.toString())&&e.replace(m,b).replace(g,"")}var I,x,y,$,S=(I={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"},x="(?:"+Object.keys(I).join("|")+")",y=RegExp(x),$=RegExp(x,"g"),function(e){return e=null==e?"":""+e,y.test(e)?e.replace($,E):e});function E(e){return I[e]}var C={32:" ",48:"0",49:"1",50:"2",51:"3",52:"4",53:"5",54:"6",55:"7",56:"8",57:"9",59:";",65:"A",66:"B",67:"C",68:"D",69:"E",70:"F",71:"G",72:"H",73:"I",74:"J",75:"K",76:"L",77:"M",78:"N",79:"O",80:"P",81:"Q",82:"R",83:"S",84:"T",85:"U",86:"V",87:"W",88:"X",89:"Y",90:"Z",96:"0",97:"1",98:"2",99:"3",100:"4",101:"5",102:"6",103:"7",104:"8",105:"9"},N=27,D=13,H=32,W=9,B=38,M=40,R={success:!1,major:"3"};try{R.full=(z.fn.dropdown.Constructor.VERSION||"").split(" ")[0].split("."),R.major=R.full[0],R.success=!0}catch(e){}var U=0,j=".bs.select",V={DISABLED:"disabled",DIVIDER:"divider",SHOW:"open",DROPUP:"dropup",MENU:"dropdown-menu",MENURIGHT:"dropdown-menu-right",MENULEFT:"dropdown-menu-left",BUTTONCLASS:"btn-default",POPOVERHEADER:"popover-title",ICONBASE:"glyphicon",TICKICON:"glyphicon-ok"},F={MENU:"."+V.MENU},_={span:document.createElement("span"),i:document.createElement("i"),subtext:document.createElement("small"),a:document.createElement("a"),li:document.createElement("li"),whitespace:document.createTextNode("\xa0"),fragment:document.createDocumentFragment()};_.a.setAttribute("role","option"),"4"===R.major&&(_.a.className="dropdown-item"),_.subtext.className="text-muted",_.text=_.span.cloneNode(!1),_.text.className="text",_.checkMark=_.span.cloneNode(!1);var G=new RegExp(B+"|"+M),q=new RegExp("^"+W+"$|"+N),K={li:function(e,t,i){var s=_.li.cloneNode(!1);return e&&(1===e.nodeType||11===e.nodeType?s.appendChild(e):s.innerHTML=e),void 0!==t&&""!==t&&(s.className=t),null!=i&&s.classList.add("optgroup-"+i),s},a:function(e,t,i){var s=_.a.cloneNode(!0);return e&&(11===e.nodeType?s.appendChild(e):s.insertAdjacentHTML("beforeend",e)),void 0!==t&&""!==t&&s.classList.add.apply(s.classList,t.split(" ")),i&&s.setAttribute("style",i),s},text:function(e,t){var i,s,n=_.text.cloneNode(!1);if(e.content)n.innerHTML=e.content;else{if(n.textContent=e.text,e.icon){var o=_.whitespace.cloneNode(!1);(s=(!0===t?_.i:_.span).cloneNode(!1)).className=this.options.iconBase+" "+e.icon,_.fragment.appendChild(s),_.fragment.appendChild(o)}e.subtext&&((i=_.subtext.cloneNode(!1)).textContent=e.subtext,n.appendChild(i))}if(!0===t)for(;0<n.childNodes.length;)_.fragment.appendChild(n.childNodes[0]);else _.fragment.appendChild(n);return _.fragment},label:function(e){var t,i,s=_.text.cloneNode(!1);if(s.innerHTML=e.display,e.icon){var n=_.whitespace.cloneNode(!1);(i=_.span.cloneNode(!1)).className=this.options.iconBase+" "+e.icon,_.fragment.appendChild(i),_.fragment.appendChild(n)}return e.subtext&&((t=_.subtext.cloneNode(!1)).textContent=e.subtext,s.appendChild(t)),_.fragment.appendChild(s),_.fragment}},Y=function(e,t){var i=this;p.useDefault||(z.valHooks.select.set=p._set,p.useDefault=!0),this.$element=z(e),this.$newElement=null,this.$button=null,this.$menu=null,this.options=t,this.selectpicker={main:{},search:{},current:{},view:{},isSearching:!1,keydown:{keyHistory:"",resetKeyHistory:{start:function(){return setTimeout(function(){i.selectpicker.keydown.keyHistory=""},800)}}}},this.sizeInfo={},null===this.options.title&&(this.options.title=this.$element.attr("title"));var s=this.options.windowPadding;"number"==typeof s&&(this.options.windowPadding=[s,s,s,s]),this.val=Y.prototype.val,this.render=Y.prototype.render,this.refresh=Y.prototype.refresh,this.setStyle=Y.prototype.setStyle,this.selectAll=Y.prototype.selectAll,this.deselectAll=Y.prototype.deselectAll,this.destroy=Y.prototype.destroy,this.remove=Y.prototype.remove,this.show=Y.prototype.show,this.hide=Y.prototype.hide,this.init()};function Z(e){var l,a=arguments,c=e;if([].shift.apply(a),!R.success){try{R.full=(z.fn.dropdown.Constructor.VERSION||"").split(" ")[0].split(".")}catch(e){Y.BootstrapVersion?R.full=Y.BootstrapVersion.split(" ")[0].split("."):(R.full=[R.major,"0","0"],console.warn("There was an issue retrieving Bootstrap's version. Ensure Bootstrap is being loaded before bootstrap-select and there is no namespace collision. If loading Bootstrap asynchronously, the version may need to be manually specified via $.fn.selectpicker.Constructor.BootstrapVersion.",e))}R.major=R.full[0],R.success=!0}if("4"===R.major){var t=[];Y.DEFAULTS.style===V.BUTTONCLASS&&t.push({name:"style",className:"BUTTONCLASS"}),Y.DEFAULTS.iconBase===V.ICONBASE&&t.push({name:"iconBase",className:"ICONBASE"}),Y.DEFAULTS.tickIcon===V.TICKICON&&t.push({name:"tickIcon",className:"TICKICON"}),V.DIVIDER="dropdown-divider",V.SHOW="show",V.BUTTONCLASS="btn-light",V.POPOVERHEADER="popover-header",V.ICONBASE="",V.TICKICON="bs-ok-default";for(var i=0;i<t.length;i++){e=t[i];Y.DEFAULTS[e.name]=V[e.className]}}var s=this.each(function(){var e=z(this);if(e.is("select")){var t=e.data("selectpicker"),i="object"==typeof c&&c;if(t){if(i)for(var s in i)i.hasOwnProperty(s)&&(t.options[s]=i[s])}else{var n=e.data();for(var o in n)n.hasOwnProperty(o)&&-1!==z.inArray(o,d)&&delete n[o];var r=z.extend({},Y.DEFAULTS,z.fn.selectpicker.defaults||{},n,i);r.template=z.extend({},Y.DEFAULTS.template,z.fn.selectpicker.defaults?z.fn.selectpicker.defaults.template:{},n.template,i.template),e.data("selectpicker",t=new Y(this,r))}"string"==typeof c&&(l=t[c]instanceof Function?t[c].apply(t,a):t.options[c])}});return void 0!==l?l:s}Y.VERSION="1.13.14",Y.DEFAULTS={noneSelectedText:"Nothing selected",noneResultsText:"No results matched {0}",countSelectedText:function(e,t){return 1==e?"{0} item selected":"{0} items selected"},maxOptionsText:function(e,t){return[1==e?"Limit reached ({n} item max)":"Limit reached ({n} items max)",1==t?"Group limit reached ({n} item max)":"Group limit reached ({n} items max)"]},selectAllText:"Select All",deselectAllText:"Deselect All",doneButton:!1,doneButtonText:"Close",multipleSeparator:", ",styleBase:"btn",style:V.BUTTONCLASS,size:"auto",title:null,selectedTextFormat:"values",width:!1,container:!1,hideDisabled:!1,showSubtext:!1,showIcon:!0,showContent:!0,dropupAuto:!0,header:!1,liveSearch:!1,liveSearchPlaceholder:null,liveSearchNormalize:!1,liveSearchStyle:"contains",actionsBox:!1,iconBase:V.ICONBASE,tickIcon:V.TICKICON,showTick:!1,template:{caret:'<span class="caret"></span>'},maxOptions:!1,mobile:!1,selectOnTab:!1,dropdownAlignRight:!1,windowPadding:0,virtualScroll:600,display:!1,sanitize:!0,sanitizeFn:null,whiteList:e},Y.prototype={constructor:Y,init:function(){var i=this,e=this.$element.attr("id");U++,this.selectId="bs-select-"+U,this.$element[0].classList.add("bs-select-hidden"),this.multiple=this.$element.prop("multiple"),this.autofocus=this.$element.prop("autofocus"),this.$element[0].classList.contains("show-tick")&&(this.options.showTick=!0),this.$newElement=this.createDropdown(),this.buildData(),this.$element.after(this.$newElement).prependTo(this.$newElement),this.$button=this.$newElement.children("button"),this.$menu=this.$newElement.children(F.MENU),this.$menuInner=this.$menu.children(".inner"),this.$searchbox=this.$menu.find("input"),this.$element[0].classList.remove("bs-select-hidden"),!0===this.options.dropdownAlignRight&&this.$menu[0].classList.add(V.MENURIGHT),void 0!==e&&this.$button.attr("data-id",e),this.checkDisabled(),this.clickListener(),this.options.liveSearch?(this.liveSearchListener(),this.focusedParent=this.$searchbox[0]):this.focusedParent=this.$menuInner[0],this.setStyle(),this.render(),this.setWidth(),this.options.container?this.selectPosition():this.$element.on("hide"+j,function(){if(i.isVirtual()){var e=i.$menuInner[0],t=e.firstChild.cloneNode(!1);e.replaceChild(t,e.firstChild),e.scrollTop=0}}),this.$menu.data("this",this),this.$newElement.data("this",this),this.options.mobile&&this.mobile(),this.$newElement.on({"hide.bs.dropdown":function(e){i.$element.trigger("hide"+j,e)},"hidden.bs.dropdown":function(e){i.$element.trigger("hidden"+j,e)},"show.bs.dropdown":function(e){i.$element.trigger("show"+j,e)},"shown.bs.dropdown":function(e){i.$element.trigger("shown"+j,e)}}),i.$element[0].hasAttribute("required")&&this.$element.on("invalid"+j,function(){i.$button[0].classList.add("bs-invalid"),i.$element.on("shown"+j+".invalid",function(){i.$element.val(i.$element.val()).off("shown"+j+".invalid")}).on("rendered"+j,function(){this.validity.valid&&i.$button[0].classList.remove("bs-invalid"),i.$element.off("rendered"+j)}),i.$button.on("blur"+j,function(){i.$element.trigger("focus").trigger("blur"),i.$button.off("blur"+j)})}),setTimeout(function(){i.buildList(),i.$element.trigger("loaded"+j)})},createDropdown:function(){var e=this.multiple||this.options.showTick?" show-tick":"",t=this.multiple?' aria-multiselectable="true"':"",i="",s=this.autofocus?" autofocus":"";R.major<4&&this.$element.parent().hasClass("input-group")&&(i=" input-group-btn");var n,o="",r="",l="",a="";return this.options.header&&(o='<div class="'+V.POPOVERHEADER+'"><button type="button" class="close" aria-hidden="true">&times;</button>'+this.options.header+"</div>"),this.options.liveSearch&&(r='<div class="bs-searchbox"><input type="search" class="form-control" autocomplete="off"'+(null===this.options.liveSearchPlaceholder?"":' placeholder="'+S(this.options.liveSearchPlaceholder)+'"')+' role="combobox" aria-label="Search" aria-controls="'+this.selectId+'" aria-autocomplete="list"></div>'),this.multiple&&this.options.actionsBox&&(l='<div class="bs-actionsbox"><div class="btn-group btn-group-sm btn-block"><button type="button" class="actions-btn bs-select-all btn '+V.BUTTONCLASS+'">'+this.options.selectAllText+'</button><button type="button" class="actions-btn bs-deselect-all btn '+V.BUTTONCLASS+'">'+this.options.deselectAllText+"</button></div></div>"),this.multiple&&this.options.doneButton&&(a='<div class="bs-donebutton"><div class="btn-group btn-block"><button type="button" class="btn btn-sm '+V.BUTTONCLASS+'">'+this.options.doneButtonText+"</button></div></div>"),n='<div class="dropdown bootstrap-select'+e+i+'"><button type="button" class="'+this.options.styleBase+' dropdown-toggle" '+("static"===this.options.display?'data-display="static"':"")+'data-toggle="dropdown"'+s+' role="combobox" aria-owns="'+this.selectId+'" aria-haspopup="listbox" aria-expanded="false"><div class="filter-option"><div class="filter-option-inner"><div class="filter-option-inner-inner"></div></div> </div>'+("4"===R.major?"":'<span class="bs-caret">'+this.options.template.caret+"</span>")+'</button><div class="'+V.MENU+" "+("4"===R.major?"":V.SHOW)+'">'+o+r+l+'<div class="inner '+V.SHOW+'" role="listbox" id="'+this.selectId+'" tabindex="-1" '+t+'><ul class="'+V.MENU+" inner "+("4"===R.major?V.SHOW:"")+'" role="presentation"></ul></div>'+a+"</div></div>",z(n)},setPositionData:function(){this.selectpicker.view.canHighlight=[];for(var e=this.selectpicker.view.size=0;e<this.selectpicker.current.data.length;e++){var t=this.selectpicker.current.data[e],i=!0;"divider"===t.type?(i=!1,t.height=this.sizeInfo.dividerHeight):"optgroup-label"===t.type?(i=!1,t.height=this.sizeInfo.dropdownHeaderHeight):t.height=this.sizeInfo.liHeight,t.disabled&&(i=!1),this.selectpicker.view.canHighlight.push(i),i&&(this.selectpicker.view.size++,t.posinset=this.selectpicker.view.size),t.position=(0===e?0:this.selectpicker.current.data[e-1].position)+t.height}},isVirtual:function(){return!1!==this.options.virtualScroll&&this.selectpicker.main.elements.length>=this.options.virtualScroll||!0===this.options.virtualScroll},createView:function(A,e,t){var L,N,D=this,i=0,H=[];if(this.selectpicker.isSearching=A,this.selectpicker.current=A?this.selectpicker.search:this.selectpicker.main,this.setPositionData(),e)if(t)i=this.$menuInner[0].scrollTop;else if(!D.multiple){var s=D.$element[0],n=(s.options[s.selectedIndex]||{}).liIndex;if("number"==typeof n&&!1!==D.options.size){var o=D.selectpicker.main.data[n],r=o&&o.position;r&&(i=r-(D.sizeInfo.menuInnerHeight+D.sizeInfo.liHeight)/2)}}function l(e,t){var i,s,n,o,r,l,a,c,d=D.selectpicker.current.elements.length,h=[],p=!0,u=D.isVirtual();D.selectpicker.view.scrollTop=e,i=Math.ceil(D.sizeInfo.menuInnerHeight/D.sizeInfo.liHeight*1.5),s=Math.round(d/i)||1;for(var f=0;f<s;f++){var m=(f+1)*i;if(f===s-1&&(m=d),h[f]=[f*i+(f?1:0),m],!d)break;void 0===r&&e-1<=D.selectpicker.current.data[m-1].position-D.sizeInfo.menuInnerHeight&&(r=f)}if(void 0===r&&(r=0),l=[D.selectpicker.view.position0,D.selectpicker.view.position1],n=Math.max(0,r-1),o=Math.min(s-1,r+1),D.selectpicker.view.position0=!1===u?0:Math.max(0,h[n][0])||0,D.selectpicker.view.position1=!1===u?d:Math.min(d,h[o][1])||0,a=l[0]!==D.selectpicker.view.position0||l[1]!==D.selectpicker.view.position1,void 0!==D.activeIndex&&(N=D.selectpicker.main.elements[D.prevActiveIndex],H=D.selectpicker.main.elements[D.activeIndex],L=D.selectpicker.main.elements[D.selectedIndex],t&&(D.activeIndex!==D.selectedIndex&&D.defocusItem(H),D.activeIndex=void 0),D.activeIndex&&D.activeIndex!==D.selectedIndex&&D.defocusItem(L)),void 0!==D.prevActiveIndex&&D.prevActiveIndex!==D.activeIndex&&D.prevActiveIndex!==D.selectedIndex&&D.defocusItem(N),(t||a)&&(c=D.selectpicker.view.visibleElements?D.selectpicker.view.visibleElements.slice():[],D.selectpicker.view.visibleElements=!1===u?D.selectpicker.current.elements:D.selectpicker.current.elements.slice(D.selectpicker.view.position0,D.selectpicker.view.position1),D.setOptionStatus(),(A||!1===u&&t)&&(p=!function(e,i){return e.length===i.length&&e.every(function(e,t){return e===i[t]})}(c,D.selectpicker.view.visibleElements)),(t||!0===u)&&p)){var v,g,b=D.$menuInner[0],w=document.createDocumentFragment(),I=b.firstChild.cloneNode(!1),x=D.selectpicker.view.visibleElements,k=[];b.replaceChild(I,b.firstChild);f=0;for(var y=x.length;f<y;f++){var $,S,E=x[f];D.options.sanitize&&($=E.lastChild)&&(S=D.selectpicker.current.data[f+D.selectpicker.view.position0])&&S.content&&!S.sanitized&&(k.push($),S.sanitized=!0),w.appendChild(E)}if(D.options.sanitize&&k.length&&P(k,D.options.whiteList,D.options.sanitizeFn),!0===u?(v=0===D.selectpicker.view.position0?0:D.selectpicker.current.data[D.selectpicker.view.position0-1].position,g=D.selectpicker.view.position1>d-1?0:D.selectpicker.current.data[d-1].position-D.selectpicker.current.data[D.selectpicker.view.position1-1].position,b.firstChild.style.marginTop=v+"px",b.firstChild.style.marginBottom=g+"px"):(b.firstChild.style.marginTop=0,b.firstChild.style.marginBottom=0),b.firstChild.appendChild(w),!0===u&&D.sizeInfo.hasScrollBar){var C=b.firstChild.offsetWidth;if(t&&C<D.sizeInfo.menuInnerInnerWidth&&D.sizeInfo.totalMenuWidth>D.sizeInfo.selectWidth)b.firstChild.style.minWidth=D.sizeInfo.menuInnerInnerWidth+"px";else if(C>D.sizeInfo.menuInnerInnerWidth){D.$menu[0].style.minWidth=0;var O=b.firstChild.offsetWidth;O>D.sizeInfo.menuInnerInnerWidth&&(D.sizeInfo.menuInnerInnerWidth=O,b.firstChild.style.minWidth=D.sizeInfo.menuInnerInnerWidth+"px"),D.$menu[0].style.minWidth=""}}}if(D.prevActiveIndex=D.activeIndex,D.options.liveSearch){if(A&&t){var z,T=0;D.selectpicker.view.canHighlight[T]||(T=1+D.selectpicker.view.canHighlight.slice(1).indexOf(!0)),z=D.selectpicker.view.visibleElements[T],D.defocusItem(D.selectpicker.view.currentActive),D.activeIndex=(D.selectpicker.current.data[T]||{}).index,D.focusItem(z)}}else D.$menuInner.trigger("focus")}l(i,!0),this.$menuInner.off("scroll.createView").on("scroll.createView",function(e,t){D.noScroll||l(this.scrollTop,t),D.noScroll=!1}),z(window).off("resize"+j+"."+this.selectId+".createView").on("resize"+j+"."+this.selectId+".createView",function(){D.$newElement.hasClass(V.SHOW)&&l(D.$menuInner[0].scrollTop)})},focusItem:function(e,t,i){if(e){t=t||this.selectpicker.main.data[this.activeIndex];var s=e.firstChild;s&&(s.setAttribute("aria-setsize",this.selectpicker.view.size),s.setAttribute("aria-posinset",t.posinset),!0!==i&&(this.focusedParent.setAttribute("aria-activedescendant",s.id),e.classList.add("active"),s.classList.add("active")))}},defocusItem:function(e){e&&(e.classList.remove("active"),e.firstChild&&e.firstChild.classList.remove("active"))},setPlaceholder:function(){var e=!1;if(this.options.title&&!this.multiple){this.selectpicker.view.titleOption||(this.selectpicker.view.titleOption=document.createElement("option")),e=!0;var t=this.$element[0],i=!1,s=!this.selectpicker.view.titleOption.parentNode;if(s)this.selectpicker.view.titleOption.className="bs-title-option",this.selectpicker.view.titleOption.value="",i=void 0===z(t.options[t.selectedIndex]).attr("selected")&&void 0===this.$element.data("selected");!s&&0===this.selectpicker.view.titleOption.index||t.insertBefore(this.selectpicker.view.titleOption,t.firstChild),i&&(t.selectedIndex=0)}return e},buildData:function(){var p=':not([hidden]):not([data-hidden="true"])',u=[],f=0,e=this.setPlaceholder()?1:0;this.options.hideDisabled&&(p+=":not(:disabled)");var t=this.$element[0].querySelectorAll("select > *"+p);function m(e){var t=u[u.length-1];t&&"divider"===t.type&&(t.optID||e.optID)||((e=e||{}).type="divider",u.push(e))}function v(e,t){if((t=t||{}).divider="true"===e.getAttribute("data-divider"),t.divider)m({optID:t.optID});else{var i=u.length,s=e.style.cssText,n=s?S(s):"",o=(e.className||"")+(t.optgroupClass||"");t.optID&&(o="opt "+o),t.optionClass=o.trim(),t.inlineStyle=n,t.text=e.textContent,t.content=e.getAttribute("data-content"),t.tokens=e.getAttribute("data-tokens"),t.subtext=e.getAttribute("data-subtext"),t.icon=e.getAttribute("data-icon"),e.liIndex=i,t.display=t.content||t.text,t.type="option",t.index=i,t.option=e,t.selected=!!e.selected,t.disabled=t.disabled||!!e.disabled,u.push(t)}}function i(e,t){var i=t[e],s=t[e-1],n=t[e+1],o=i.querySelectorAll("option"+p);if(o.length){var r,l,a={display:S(i.label),subtext:i.getAttribute("data-subtext"),icon:i.getAttribute("data-icon"),type:"optgroup-label",optgroupClass:" "+(i.className||"")};f++,s&&m({optID:f}),a.optID=f,u.push(a);for(var c=0,d=o.length;c<d;c++){var h=o[c];0===c&&(l=(r=u.length-1)+d),v(h,{headerIndex:r,lastIndex:l,optID:a.optID,optgroupClass:a.optgroupClass,disabled:i.disabled})}n&&m({optID:f})}}for(var s=t.length;e<s;e++){var n=t[e];"OPTGROUP"!==n.tagName?v(n,{}):i(e,t)}this.selectpicker.main.data=this.selectpicker.current.data=u},buildList:function(){var s=this,e=this.selectpicker.main.data,n=[],o=0;function t(e){var t,i=0;switch(e.type){case"divider":t=K.li(!1,V.DIVIDER,e.optID?e.optID+"div":void 0);break;case"option":(t=K.li(K.a(K.text.call(s,e),e.optionClass,e.inlineStyle),"",e.optID)).firstChild&&(t.firstChild.id=s.selectId+"-"+e.index);break;case"optgroup-label":t=K.li(K.label.call(s,e),"dropdown-header"+e.optgroupClass,e.optID)}n.push(t),e.display&&(i+=e.display.length),e.subtext&&(i+=e.subtext.length),e.icon&&(i+=1),o<i&&(o=i,s.selectpicker.view.widestOption=n[n.length-1])}!s.options.showTick&&!s.multiple||_.checkMark.parentNode||(_.checkMark.className=this.options.iconBase+" "+s.options.tickIcon+" check-mark",_.a.appendChild(_.checkMark));for(var i=e.length,r=0;r<i;r++){t(e[r])}this.selectpicker.main.elements=this.selectpicker.current.elements=n},findLis:function(){return this.$menuInner.find(".inner > li")},render:function(){var e,t=this,i=this.$element[0],s=this.setPlaceholder()&&0===i.selectedIndex,n=O(i,this.options.hideDisabled),o=n.length,r=this.$button[0],l=r.querySelector(".filter-option-inner-inner"),a=document.createTextNode(this.options.multipleSeparator),c=_.fragment.cloneNode(!1),d=!1;if(r.classList.toggle("bs-placeholder",t.multiple?!o:!T(i,n)),this.tabIndex(),"static"===this.options.selectedTextFormat)c=K.text.call(this,{text:this.options.title},!0);else if(!1===(this.multiple&&-1!==this.options.selectedTextFormat.indexOf("count")&&1<o&&(1<(e=this.options.selectedTextFormat.split(">")).length&&o>e[1]||1===e.length&&2<=o))){if(!s){for(var h=0;h<o&&h<50;h++){var p=n[h],u=this.selectpicker.main.data[p.liIndex],f={};this.multiple&&0<h&&c.appendChild(a.cloneNode(!1)),p.title?f.text=p.title:u&&(u.content&&t.options.showContent?(f.content=u.content.toString(),d=!0):(t.options.showIcon&&(f.icon=u.icon),t.options.showSubtext&&!t.multiple&&u.subtext&&(f.subtext=" "+u.subtext),f.text=p.textContent.trim())),c.appendChild(K.text.call(this,f,!0))}49<o&&c.appendChild(document.createTextNode("..."))}}else{var m=':not([hidden]):not([data-hidden="true"]):not([data-divider="true"])';this.options.hideDisabled&&(m+=":not(:disabled)");var v=this.$element[0].querySelectorAll("select > option"+m+", optgroup"+m+" option"+m).length,g="function"==typeof this.options.countSelectedText?this.options.countSelectedText(o,v):this.options.countSelectedText;c=K.text.call(this,{text:g.replace("{0}",o.toString()).replace("{1}",v.toString())},!0)}if(null==this.options.title&&(this.options.title=this.$element.attr("title")),c.childNodes.length||(c=K.text.call(this,{text:void 0!==this.options.title?this.options.title:this.options.noneSelectedText},!0)),r.title=c.textContent.replace(/<[^>]*>?/g,"").trim(),this.options.sanitize&&d&&P([c],t.options.whiteList,t.options.sanitizeFn),l.innerHTML="",l.appendChild(c),R.major<4&&this.$newElement[0].classList.contains("bs3-has-addon")){var b=r.querySelector(".filter-expand"),w=l.cloneNode(!0);w.className="filter-expand",b?r.replaceChild(w,b):r.appendChild(w)}this.$element.trigger("rendered"+j)},setStyle:function(e,t){var i,s=this.$button[0],n=this.$newElement[0],o=this.options.style.trim();this.$element.attr("class")&&this.$newElement.addClass(this.$element.attr("class").replace(/selectpicker|mobile-device|bs-select-hidden|validate\[.*\]/gi,"")),R.major<4&&(n.classList.add("bs3"),n.parentNode.classList.contains("input-group")&&(n.previousElementSibling||n.nextElementSibling)&&(n.previousElementSibling||n.nextElementSibling).classList.contains("input-group-addon")&&n.classList.add("bs3-has-addon")),i=e?e.trim():o,"add"==t?i&&s.classList.add.apply(s.classList,i.split(" ")):"remove"==t?i&&s.classList.remove.apply(s.classList,i.split(" ")):(o&&s.classList.remove.apply(s.classList,o.split(" ")),i&&s.classList.add.apply(s.classList,i.split(" ")))},liHeight:function(e){if(e||!1!==this.options.size&&!Object.keys(this.sizeInfo).length){var t=document.createElement("div"),i=document.createElement("div"),s=document.createElement("div"),n=document.createElement("ul"),o=document.createElement("li"),r=document.createElement("li"),l=document.createElement("li"),a=document.createElement("a"),c=document.createElement("span"),d=this.options.header&&0<this.$menu.find("."+V.POPOVERHEADER).length?this.$menu.find("."+V.POPOVERHEADER)[0].cloneNode(!0):null,h=this.options.liveSearch?document.createElement("div"):null,p=this.options.actionsBox&&this.multiple&&0<this.$menu.find(".bs-actionsbox").length?this.$menu.find(".bs-actionsbox")[0].cloneNode(!0):null,u=this.options.doneButton&&this.multiple&&0<this.$menu.find(".bs-donebutton").length?this.$menu.find(".bs-donebutton")[0].cloneNode(!0):null,f=this.$element.find("option")[0];if(this.sizeInfo.selectWidth=this.$newElement[0].offsetWidth,c.className="text",a.className="dropdown-item "+(f?f.className:""),t.className=this.$menu[0].parentNode.className+" "+V.SHOW,t.style.width=0,"auto"===this.options.width&&(i.style.minWidth=0),i.className=V.MENU+" "+V.SHOW,s.className="inner "+V.SHOW,n.className=V.MENU+" inner "+("4"===R.major?V.SHOW:""),o.className=V.DIVIDER,r.className="dropdown-header",c.appendChild(document.createTextNode("\u200b")),a.appendChild(c),l.appendChild(a),r.appendChild(c.cloneNode(!0)),this.selectpicker.view.widestOption&&n.appendChild(this.selectpicker.view.widestOption.cloneNode(!0)),n.appendChild(l),n.appendChild(o),n.appendChild(r),d&&i.appendChild(d),h){var m=document.createElement("input");h.className="bs-searchbox",m.className="form-control",h.appendChild(m),i.appendChild(h)}p&&i.appendChild(p),s.appendChild(n),i.appendChild(s),u&&i.appendChild(u),t.appendChild(i),document.body.appendChild(t);var v,g=l.offsetHeight,b=r?r.offsetHeight:0,w=d?d.offsetHeight:0,I=h?h.offsetHeight:0,x=p?p.offsetHeight:0,k=u?u.offsetHeight:0,y=z(o).outerHeight(!0),$=!!window.getComputedStyle&&window.getComputedStyle(i),S=i.offsetWidth,E=$?null:z(i),C={vert:L($?$.paddingTop:E.css("paddingTop"))+L($?$.paddingBottom:E.css("paddingBottom"))+L($?$.borderTopWidth:E.css("borderTopWidth"))+L($?$.borderBottomWidth:E.css("borderBottomWidth")),horiz:L($?$.paddingLeft:E.css("paddingLeft"))+L($?$.paddingRight:E.css("paddingRight"))+L($?$.borderLeftWidth:E.css("borderLeftWidth"))+L($?$.borderRightWidth:E.css("borderRightWidth"))},O={vert:C.vert+L($?$.marginTop:E.css("marginTop"))+L($?$.marginBottom:E.css("marginBottom"))+2,horiz:C.horiz+L($?$.marginLeft:E.css("marginLeft"))+L($?$.marginRight:E.css("marginRight"))+2};s.style.overflowY="scroll",v=i.offsetWidth-S,document.body.removeChild(t),this.sizeInfo.liHeight=g,this.sizeInfo.dropdownHeaderHeight=b,this.sizeInfo.headerHeight=w,this.sizeInfo.searchHeight=I,this.sizeInfo.actionsHeight=x,this.sizeInfo.doneButtonHeight=k,this.sizeInfo.dividerHeight=y,this.sizeInfo.menuPadding=C,this.sizeInfo.menuExtras=O,this.sizeInfo.menuWidth=S,this.sizeInfo.menuInnerInnerWidth=S-C.horiz,this.sizeInfo.totalMenuWidth=this.sizeInfo.menuWidth,this.sizeInfo.scrollBarWidth=v,this.sizeInfo.selectHeight=this.$newElement[0].offsetHeight,this.setPositionData()}},getSelectPosition:function(){var e,t=z(window),i=this.$newElement.offset(),s=z(this.options.container);this.options.container&&s.length&&!s.is("body")?((e=s.offset()).top+=parseInt(s.css("borderTopWidth")),e.left+=parseInt(s.css("borderLeftWidth"))):e={top:0,left:0};var n=this.options.windowPadding;this.sizeInfo.selectOffsetTop=i.top-e.top-t.scrollTop(),this.sizeInfo.selectOffsetBot=t.height()-this.sizeInfo.selectOffsetTop-this.sizeInfo.selectHeight-e.top-n[2],this.sizeInfo.selectOffsetLeft=i.left-e.left-t.scrollLeft(),this.sizeInfo.selectOffsetRight=t.width()-this.sizeInfo.selectOffsetLeft-this.sizeInfo.selectWidth-e.left-n[1],this.sizeInfo.selectOffsetTop-=n[0],this.sizeInfo.selectOffsetLeft-=n[3]},setMenuSize:function(e){this.getSelectPosition();var t,i,s,n,o,r,l,a,c=this.sizeInfo.selectWidth,d=this.sizeInfo.liHeight,h=this.sizeInfo.headerHeight,p=this.sizeInfo.searchHeight,u=this.sizeInfo.actionsHeight,f=this.sizeInfo.doneButtonHeight,m=this.sizeInfo.dividerHeight,v=this.sizeInfo.menuPadding,g=0;if(this.options.dropupAuto&&(l=d*this.selectpicker.current.elements.length+v.vert,a=this.sizeInfo.selectOffsetTop-this.sizeInfo.selectOffsetBot>this.sizeInfo.menuExtras.vert&&l+this.sizeInfo.menuExtras.vert+50>this.sizeInfo.selectOffsetBot,!0===this.selectpicker.isSearching&&(a=this.selectpicker.dropup),this.$newElement.toggleClass(V.DROPUP,a),this.selectpicker.dropup=a),"auto"===this.options.size)n=3<this.selectpicker.current.elements.length?3*this.sizeInfo.liHeight+this.sizeInfo.menuExtras.vert-2:0,i=this.sizeInfo.selectOffsetBot-this.sizeInfo.menuExtras.vert,s=n+h+p+u+f,r=Math.max(n-v.vert,0),this.$newElement.hasClass(V.DROPUP)&&(i=this.sizeInfo.selectOffsetTop-this.sizeInfo.menuExtras.vert),t=(o=i)-h-p-u-f-v.vert;else if(this.options.size&&"auto"!=this.options.size&&this.selectpicker.current.elements.length>this.options.size){for(var b=0;b<this.options.size;b++)"divider"===this.selectpicker.current.data[b].type&&g++;t=(i=d*this.options.size+g*m+v.vert)-v.vert,o=i+h+p+u+f,s=r=""}this.$menu.css({"max-height":o+"px",overflow:"hidden","min-height":s+"px"}),this.$menuInner.css({"max-height":t+"px","overflow-y":"auto","min-height":r+"px"}),this.sizeInfo.menuInnerHeight=Math.max(t,1),this.selectpicker.current.data.length&&this.selectpicker.current.data[this.selectpicker.current.data.length-1].position>this.sizeInfo.menuInnerHeight&&(this.sizeInfo.hasScrollBar=!0,this.sizeInfo.totalMenuWidth=this.sizeInfo.menuWidth+this.sizeInfo.scrollBarWidth),"auto"===this.options.dropdownAlignRight&&this.$menu.toggleClass(V.MENURIGHT,this.sizeInfo.selectOffsetLeft>this.sizeInfo.selectOffsetRight&&this.sizeInfo.selectOffsetRight<this.sizeInfo.totalMenuWidth-c),this.dropdown&&this.dropdown._popper&&this.dropdown._popper.update()},setSize:function(e){if(this.liHeight(e),this.options.header&&this.$menu.css("padding-top",0),!1!==this.options.size){var t=this,i=z(window);this.setMenuSize(),this.options.liveSearch&&this.$searchbox.off("input.setMenuSize propertychange.setMenuSize").on("input.setMenuSize propertychange.setMenuSize",function(){return t.setMenuSize()}),"auto"===this.options.size?i.off("resize"+j+"."+this.selectId+".setMenuSize scroll"+j+"."+this.selectId+".setMenuSize").on("resize"+j+"."+this.selectId+".setMenuSize scroll"+j+"."+this.selectId+".setMenuSize",function(){return t.setMenuSize()}):this.options.size&&"auto"!=this.options.size&&this.selectpicker.current.elements.length>this.options.size&&i.off("resize"+j+"."+this.selectId+".setMenuSize scroll"+j+"."+this.selectId+".setMenuSize")}this.createView(!1,!0,e)},setWidth:function(){var i=this;"auto"===this.options.width?requestAnimationFrame(function(){i.$menu.css("min-width","0"),i.$element.on("loaded"+j,function(){i.liHeight(),i.setMenuSize();var e=i.$newElement.clone().appendTo("body"),t=e.css("width","auto").children("button").outerWidth();e.remove(),i.sizeInfo.selectWidth=Math.max(i.sizeInfo.totalMenuWidth,t),i.$newElement.css("width",i.sizeInfo.selectWidth+"px")})}):"fit"===this.options.width?(this.$menu.css("min-width",""),this.$newElement.css("width","").addClass("fit-width")):this.options.width?(this.$menu.css("min-width",""),this.$newElement.css("width",this.options.width)):(this.$menu.css("min-width",""),this.$newElement.css("width","")),this.$newElement.hasClass("fit-width")&&"fit"!==this.options.width&&this.$newElement[0].classList.remove("fit-width")},selectPosition:function(){this.$bsContainer=z('<div class="bs-container" />');function e(e){var t={},i=r.options.display||!!z.fn.dropdown.Constructor.Default&&z.fn.dropdown.Constructor.Default.display;r.$bsContainer.addClass(e.attr("class").replace(/form-control|fit-width/gi,"")).toggleClass(V.DROPUP,e.hasClass(V.DROPUP)),s=e.offset(),l.is("body")?n={top:0,left:0}:((n=l.offset()).top+=parseInt(l.css("borderTopWidth"))-l.scrollTop(),n.left+=parseInt(l.css("borderLeftWidth"))-l.scrollLeft()),o=e.hasClass(V.DROPUP)?0:e[0].offsetHeight,(R.major<4||"static"===i)&&(t.top=s.top-n.top+o,t.left=s.left-n.left),t.width=e[0].offsetWidth,r.$bsContainer.css(t)}var s,n,o,r=this,l=z(this.options.container);this.$button.on("click.bs.dropdown.data-api",function(){r.isDisabled()||(e(r.$newElement),r.$bsContainer.appendTo(r.options.container).toggleClass(V.SHOW,!r.$button.hasClass(V.SHOW)).append(r.$menu))}),z(window).off("resize"+j+"."+this.selectId+" scroll"+j+"."+this.selectId).on("resize"+j+"."+this.selectId+" scroll"+j+"."+this.selectId,function(){r.$newElement.hasClass(V.SHOW)&&e(r.$newElement)}),this.$element.on("hide"+j,function(){r.$menu.data("height",r.$menu.height()),r.$bsContainer.detach()})},setOptionStatus:function(e){var t=this;if(t.noScroll=!1,t.selectpicker.view.visibleElements&&t.selectpicker.view.visibleElements.length)for(var i=0;i<t.selectpicker.view.visibleElements.length;i++){var s=t.selectpicker.current.data[i+t.selectpicker.view.position0],n=s.option;n&&(!0!==e&&t.setDisabled(s.index,s.disabled),t.setSelected(s.index,n.selected))}},setSelected:function(e,t){var i,s,n=this.selectpicker.main.elements[e],o=this.selectpicker.main.data[e],r=void 0!==this.activeIndex,l=this.activeIndex===e||t&&!this.multiple&&!r;o.selected=t,s=n.firstChild,t&&(this.selectedIndex=e),n.classList.toggle("selected",t),l?(this.focusItem(n,o),this.selectpicker.view.currentActive=n,this.activeIndex=e):this.defocusItem(n),s&&(s.classList.toggle("selected",t),t?s.setAttribute("aria-selected",!0):this.multiple?s.setAttribute("aria-selected",!1):s.removeAttribute("aria-selected")),l||r||!t||void 0===this.prevActiveIndex||(i=this.selectpicker.main.elements[this.prevActiveIndex],this.defocusItem(i))},setDisabled:function(e,t){var i,s=this.selectpicker.main.elements[e];this.selectpicker.main.data[e].disabled=t,i=s.firstChild,s.classList.toggle(V.DISABLED,t),i&&("4"===R.major&&i.classList.toggle(V.DISABLED,t),t?(i.setAttribute("aria-disabled",t),i.setAttribute("tabindex",-1)):(i.removeAttribute("aria-disabled"),i.setAttribute("tabindex",0)))},isDisabled:function(){return this.$element[0].disabled},checkDisabled:function(){this.isDisabled()?(this.$newElement[0].classList.add(V.DISABLED),this.$button.addClass(V.DISABLED).attr("tabindex",-1).attr("aria-disabled",!0)):(this.$button[0].classList.contains(V.DISABLED)&&(this.$newElement[0].classList.remove(V.DISABLED),this.$button.removeClass(V.DISABLED).attr("aria-disabled",!1)),-1!=this.$button.attr("tabindex")||this.$element.data("tabindex")||this.$button.removeAttr("tabindex"))},tabIndex:function(){this.$element.data("tabindex")!==this.$element.attr("tabindex")&&-98!==this.$element.attr("tabindex")&&"-98"!==this.$element.attr("tabindex")&&(this.$element.data("tabindex",this.$element.attr("tabindex")),this.$button.attr("tabindex",this.$element.data("tabindex"))),this.$element.attr("tabindex",-98)},clickListener:function(){var C=this,t=z(document);function e(){C.options.liveSearch?C.$searchbox.trigger("focus"):C.$menuInner.trigger("focus")}function i(){C.dropdown&&C.dropdown._popper&&C.dropdown._popper.state.isCreated?e():requestAnimationFrame(i)}t.data("spaceSelect",!1),this.$button.on("keyup",function(e){/(32)/.test(e.keyCode.toString(10))&&t.data("spaceSelect")&&(e.preventDefault(),t.data("spaceSelect",!1))}),this.$newElement.on("show.bs.dropdown",function(){3<R.major&&!C.dropdown&&(C.dropdown=C.$button.data("bs.dropdown"),C.dropdown._menu=C.$menu[0])}),this.$button.on("click.bs.dropdown.data-api",function(){C.$newElement.hasClass(V.SHOW)||C.setSize()}),this.$element.on("shown"+j,function(){C.$menuInner[0].scrollTop!==C.selectpicker.view.scrollTop&&(C.$menuInner[0].scrollTop=C.selectpicker.view.scrollTop),3<R.major?requestAnimationFrame(i):e()}),this.$menuInner.on("mouseenter","li a",function(e){var t=this.parentElement,i=C.isVirtual()?C.selectpicker.view.position0:0,s=Array.prototype.indexOf.call(t.parentElement.children,t),n=C.selectpicker.current.data[s+i];C.focusItem(t,n,!0)}),this.$menuInner.on("click","li a",function(e,t){var i=z(this),s=C.$element[0],n=C.isVirtual()?C.selectpicker.view.position0:0,o=C.selectpicker.current.data[i.parent().index()+n],r=o.index,l=T(s),a=s.selectedIndex,c=s.options[a],d=!0;if(C.multiple&&1!==C.options.maxOptions&&e.stopPropagation(),e.preventDefault(),!C.isDisabled()&&!i.parent().hasClass(V.DISABLED)){var h=o.option,p=z(h),u=h.selected,f=p.parent("optgroup"),m=f.find("option"),v=C.options.maxOptions,g=f.data("maxOptions")||!1;if(r===C.activeIndex&&(t=!0),t||(C.prevActiveIndex=C.activeIndex,C.activeIndex=void 0),C.multiple){if(h.selected=!u,C.setSelected(r,!u),i.trigger("blur"),!1!==v||!1!==g){var b=v<O(s).length,w=g<f.find("option:selected").length;if(v&&b||g&&w)if(v&&1==v)s.selectedIndex=-1,h.selected=!0,C.setOptionStatus(!0);else if(g&&1==g){for(var I=0;I<m.length;I++){var x=m[I];x.selected=!1,C.setSelected(x.liIndex,!1)}h.selected=!0,C.setSelected(r,!0)}else{var k="string"==typeof C.options.maxOptionsText?[C.options.maxOptionsText,C.options.maxOptionsText]:C.options.maxOptionsText,y="function"==typeof k?k(v,g):k,$=y[0].replace("{n}",v),S=y[1].replace("{n}",g),E=z('<div class="notify"></div>');y[2]&&($=$.replace("{var}",y[2][1<v?0:1]),S=S.replace("{var}",y[2][1<g?0:1])),h.selected=!1,C.$menu.append(E),v&&b&&(E.append(z("<div>"+$+"</div>")),d=!1,C.$element.trigger("maxReached"+j)),g&&w&&(E.append(z("<div>"+S+"</div>")),d=!1,C.$element.trigger("maxReachedGrp"+j)),setTimeout(function(){C.setSelected(r,!1)},10),E[0].classList.add("fadeOut"),setTimeout(function(){E.remove()},1050)}}}else c&&(c.selected=!1),h.selected=!0,C.setSelected(r,!0);!C.multiple||C.multiple&&1===C.options.maxOptions?C.$button.trigger("focus"):C.options.liveSearch&&C.$searchbox.trigger("focus"),d&&(!C.multiple&&a===s.selectedIndex||(A=[h.index,p.prop("selected"),l],C.$element.triggerNative("change")))}}),this.$menu.on("click","li."+V.DISABLED+" a, ."+V.POPOVERHEADER+", ."+V.POPOVERHEADER+" :not(.close)",function(e){e.currentTarget==this&&(e.preventDefault(),e.stopPropagation(),C.options.liveSearch&&!z(e.target).hasClass("close")?C.$searchbox.trigger("focus"):C.$button.trigger("focus"))}),this.$menuInner.on("click",".divider, .dropdown-header",function(e){e.preventDefault(),e.stopPropagation(),C.options.liveSearch?C.$searchbox.trigger("focus"):C.$button.trigger("focus")}),this.$menu.on("click","."+V.POPOVERHEADER+" .close",function(){C.$button.trigger("click")}),this.$searchbox.on("click",function(e){e.stopPropagation()}),this.$menu.on("click",".actions-btn",function(e){C.options.liveSearch?C.$searchbox.trigger("focus"):C.$button.trigger("focus"),e.preventDefault(),e.stopPropagation(),z(this).hasClass("bs-select-all")?C.selectAll():C.deselectAll()}),this.$element.on("change"+j,function(){C.render(),C.$element.trigger("changed"+j,A),A=null}).on("focus"+j,function(){C.options.mobile||C.$button.trigger("focus")})},liveSearchListener:function(){var u=this,f=document.createElement("li");this.$button.on("click.bs.dropdown.data-api",function(){u.$searchbox.val()&&u.$searchbox.val("")}),this.$searchbox.on("click.bs.dropdown.data-api focus.bs.dropdown.data-api touchend.bs.dropdown.data-api",function(e){e.stopPropagation()}),this.$searchbox.on("input propertychange",function(){var e=u.$searchbox.val();if(u.selectpicker.search.elements=[],u.selectpicker.search.data=[],e){var t=[],i=e.toUpperCase(),s={},n=[],o=u._searchStyle(),r=u.options.liveSearchNormalize;r&&(i=w(i));for(var l=0;l<u.selectpicker.main.data.length;l++){var a=u.selectpicker.main.data[l];s[l]||(s[l]=k(a,i,o,r)),s[l]&&void 0!==a.headerIndex&&-1===n.indexOf(a.headerIndex)&&(0<a.headerIndex&&(s[a.headerIndex-1]=!0,n.push(a.headerIndex-1)),s[a.headerIndex]=!0,n.push(a.headerIndex),s[a.lastIndex+1]=!0),s[l]&&"optgroup-label"!==a.type&&n.push(l)}l=0;for(var c=n.length;l<c;l++){var d=n[l],h=n[l-1],p=(a=u.selectpicker.main.data[d],u.selectpicker.main.data[h]);("divider"!==a.type||"divider"===a.type&&p&&"divider"!==p.type&&c-1!==l)&&(u.selectpicker.search.data.push(a),t.push(u.selectpicker.main.elements[d]))}u.activeIndex=void 0,u.noScroll=!0,u.$menuInner.scrollTop(0),u.selectpicker.search.elements=t,u.createView(!0),t.length||(f.className="no-results",f.innerHTML=u.options.noneResultsText.replace("{0}",'"'+S(e)+'"'),u.$menuInner[0].firstChild.appendChild(f))}else u.$menuInner.scrollTop(0),u.createView(!1)})},_searchStyle:function(){return this.options.liveSearchStyle||"contains"},val:function(e){var t=this.$element[0];if(void 0===e)return this.$element.val();var i=T(t);if(A=[null,null,i],this.$element.val(e).trigger("changed"+j,A),this.$newElement.hasClass(V.SHOW))if(this.multiple)this.setOptionStatus(!0);else{var s=(t.options[t.selectedIndex]||{}).liIndex;"number"==typeof s&&(this.setSelected(this.selectedIndex,!1),this.setSelected(s,!0))}return this.render(),A=null,this.$element},changeAll:function(e){if(this.multiple){void 0===e&&(e=!0);var t=this.$element[0],i=0,s=0,n=T(t);t.classList.add("bs-select-hidden");for(var o=0,r=this.selectpicker.current.data,l=r.length;o<l;o++){var a=r[o],c=a.option;c&&!a.disabled&&"divider"!==a.type&&(a.selected&&i++,!0===(c.selected=e)&&s++)}t.classList.remove("bs-select-hidden"),i!==s&&(this.setOptionStatus(),A=[null,null,n],this.$element.triggerNative("change"))}},selectAll:function(){return this.changeAll(!0)},deselectAll:function(){return this.changeAll(!1)},toggle:function(e){(e=e||window.event)&&e.stopPropagation(),this.$button.trigger("click.bs.dropdown.data-api")},keydown:function(e){var t,i,s,n,o,r=z(this),l=r.hasClass("dropdown-toggle"),a=(l?r.closest(".dropdown"):r.closest(F.MENU)).data("this"),c=a.findLis(),d=!1,h=e.which===W&&!l&&!a.options.selectOnTab,p=G.test(e.which)||h,u=a.$menuInner[0].scrollTop,f=!0===a.isVirtual()?a.selectpicker.view.position0:0;if(!(112<=e.which&&e.which<=123))if(!(i=a.$newElement.hasClass(V.SHOW))&&(p||48<=e.which&&e.which<=57||96<=e.which&&e.which<=105||65<=e.which&&e.which<=90)&&(a.$button.trigger("click.bs.dropdown.data-api"),a.options.liveSearch))a.$searchbox.trigger("focus");else{if(e.which===N&&i&&(e.preventDefault(),a.$button.trigger("click.bs.dropdown.data-api").trigger("focus")),p){if(!c.length)return;-1!==(t=(s=a.selectpicker.main.elements[a.activeIndex])?Array.prototype.indexOf.call(s.parentElement.children,s):-1)&&a.defocusItem(s),e.which===B?(-1!==t&&t--,t+f<0&&(t+=c.length),a.selectpicker.view.canHighlight[t+f]||-1===(t=a.selectpicker.view.canHighlight.slice(0,t+f).lastIndexOf(!0)-f)&&(t=c.length-1)):e.which!==M&&!h||(++t+f>=a.selectpicker.view.canHighlight.length&&(t=0),a.selectpicker.view.canHighlight[t+f]||(t=t+1+a.selectpicker.view.canHighlight.slice(t+f+1).indexOf(!0))),e.preventDefault();var m=f+t;e.which===B?0===f&&t===c.length-1?(a.$menuInner[0].scrollTop=a.$menuInner[0].scrollHeight,m=a.selectpicker.current.elements.length-1):d=(o=(n=a.selectpicker.current.data[m]).position-n.height)<u:e.which!==M&&!h||(0===t?m=a.$menuInner[0].scrollTop=0:d=u<(o=(n=a.selectpicker.current.data[m]).position-a.sizeInfo.menuInnerHeight)),s=a.selectpicker.current.elements[m],a.activeIndex=a.selectpicker.current.data[m].index,a.focusItem(s),a.selectpicker.view.currentActive=s,d&&(a.$menuInner[0].scrollTop=o),a.options.liveSearch?a.$searchbox.trigger("focus"):r.trigger("focus")}else if(!r.is("input")&&!q.test(e.which)||e.which===H&&a.selectpicker.keydown.keyHistory){var v,g,b=[];e.preventDefault(),a.selectpicker.keydown.keyHistory+=C[e.which],a.selectpicker.keydown.resetKeyHistory.cancel&&clearTimeout(a.selectpicker.keydown.resetKeyHistory.cancel),a.selectpicker.keydown.resetKeyHistory.cancel=a.selectpicker.keydown.resetKeyHistory.start(),g=a.selectpicker.keydown.keyHistory,/^(.)\1+$/.test(g)&&(g=g.charAt(0));for(var w=0;w<a.selectpicker.current.data.length;w++){var I=a.selectpicker.current.data[w];k(I,g,"startsWith",!0)&&a.selectpicker.view.canHighlight[w]&&b.push(I.index)}if(b.length){var x=0;c.removeClass("active").find("a").removeClass("active"),1===g.length&&(-1===(x=b.indexOf(a.activeIndex))||x===b.length-1?x=0:x++),v=b[x],d=0<u-(n=a.selectpicker.main.data[v]).position?(o=n.position-n.height,!0):(o=n.position-a.sizeInfo.menuInnerHeight,n.position>u+a.sizeInfo.menuInnerHeight),s=a.selectpicker.main.elements[v],a.activeIndex=b[x],a.focusItem(s),s&&s.firstChild.focus(),d&&(a.$menuInner[0].scrollTop=o),r.trigger("focus")}}i&&(e.which===H&&!a.selectpicker.keydown.keyHistory||e.which===D||e.which===W&&a.options.selectOnTab)&&(e.which!==H&&e.preventDefault(),a.options.liveSearch&&e.which===H||(a.$menuInner.find(".active a").trigger("click",!0),r.trigger("focus"),a.options.liveSearch||(e.preventDefault(),z(document).data("spaceSelect",!0))))}},mobile:function(){this.$element[0].classList.add("mobile-device")},refresh:function(){var e=z.extend({},this.options,this.$element.data());this.options=e,this.checkDisabled(),this.setStyle(),this.render(),this.buildData(),this.buildList(),this.setWidth(),this.setSize(!0),this.$element.trigger("refreshed"+j)},hide:function(){this.$newElement.hide()},show:function(){this.$newElement.show()},remove:function(){this.$newElement.remove(),this.$element.remove()},destroy:function(){this.$newElement.before(this.$element).remove(),this.$bsContainer?this.$bsContainer.remove():this.$menu.remove(),this.$element.off(j).removeData("selectpicker").removeClass("bs-select-hidden selectpicker"),z(window).off(j+"."+this.selectId)}};var J=z.fn.selectpicker;z.fn.selectpicker=Z,z.fn.selectpicker.Constructor=Y,z.fn.selectpicker.noConflict=function(){return z.fn.selectpicker=J,this};var Q=z.fn.dropdown.Constructor._dataApiKeydownHandler||z.fn.dropdown.Constructor.prototype.keydown;z(document).off("keydown.bs.dropdown.data-api").on("keydown.bs.dropdown.data-api",':not(.bootstrap-select) > [data-toggle="dropdown"]',Q).on("keydown.bs.dropdown.data-api",":not(.bootstrap-select) > .dropdown-menu",Q).on("keydown"+j,'.bootstrap-select [data-toggle="dropdown"], .bootstrap-select [role="listbox"], .bootstrap-select .bs-searchbox input',Y.prototype.keydown).on("focusin.modal",'.bootstrap-select [data-toggle="dropdown"], .bootstrap-select [role="listbox"], .bootstrap-select .bs-searchbox input',function(e){e.stopPropagation()}),z(window).on("load"+j+".data-api",function(){z(".selectpicker").each(function(){var e=z(this);Z.call(e,e.data())})})}(e)});

(function($) {
    ('use strict');
    jQuery(document).on('ready', function() {
      // Menu JS
      jQuery('.navbar .navbar-nav li a, .main-banner-content .btn-primary').on('click', function(e) {
        var anchor = jQuery(this);
        var offset = jQuery(anchor.attr('href')).offset();
        if(offset && offset.top) {
          jQuery('html, body')
            .stop()
            .animate(
              {
                scrollTop: offset.top,
              },
              1500
            );
        }
        e.preventDefault();
      });
        jQuery(document).on('click', '.navbar-collapse.in', function(e) {
            if (
                jQuery(e.target).is('a') &&
                jQuery(e.target).attr('class') != 'dropdown-toggle'
            ) {
                $(this).collapse('hide');
            }
        });
        jQuery('.navbar .navbar-nav li a').on('click', function() {
            jQuery('.navbar-collapse').collapse('hide');
        });

        $(document).ready(function(){
          let item = $("#zoom-item");

          item.on('click', function(){
            if(item.hasClass("zoom-in")){
              item.removeClass("zoom-in").addClass("zoom-out");
            }
            else
              item.removeClass("zoom-out").addClass("zoom-in");
          });
        });

        // // Header Sticky
        // jQuery(window).on('scroll', function() {
        //     if (jQuery(this).scrollTop() > 170) {
        //         jQuery('.navbar').addClass('is-sticky');
        //     } else {
        //         jQuery('.navbar').removeClass('is-sticky');
        //     }
        // });

        // Services Slides
        $('.services-slides').owlCarousel({
            loop: true,
            autoplay: true,
            nav: true,
            mouseDrag: true,
            autoplayHoverPause: true,
            responsiveClass: true,
            dots: false,
            navText: [
                "<i class='icofont-curved-double-left'></i>",
                "<i class='icofont-curved-double-right'></i>",
            ],
            responsive: {
                0: {
                    items: 1,
                },
                768: {
                    items: 2,
                },
                1024: {
                    items: 3,
                },
                1200: {
                    items: 3,
                },
            },
        });

        // Tabs
        (function($) {
            $('.tab ul.tabs')
                .addClass('active')
                .find('> li:eq(0)')
                .addClass('current');
            $('.tab ul.tabs li a').on('click', function(g) {
                var tab = $(this).closest('.tab'),
                    index = $(this)
                        .closest('li')
                        .index();
                tab.find('ul.tabs > li').removeClass('current');
                $(this)
                    .closest('li')
                    .addClass('current');
                tab.find('.tab_content')
                    .find('div.tabs_item')
                    .not('div.tabs_item:eq(' + index + ')')
                    .slideUp();
                tab.find('.tab_content')
                    .find('div.tabs_item:eq(' + index + ')')
                    .slideDown();
                g.preventDefault();
            });
        })(jQuery);

        // Team Slides
        $('.team-slides').owlCarousel({
            loop: true,
            autoplay: true,
            nav: true,
            mouseDrag: true,
            autoplayHoverPause: true,
            responsiveClass: true,
            dots: false,
            navText: [
                "<i class='icofont-curved-double-left'></i>",
                "<i class='icofont-curved-double-right'></i>",
            ],
            responsive: {
                0: {
                    items: 1,
                },
                768: {
                    items: 2,
                },
                1024: {
                    items: 3,
                },
                1200: {
                    items: 4,
                },
            },
        });

        // Features Slides
        $('.features-slides').owlCarousel({
            loop: true,
            autoplay: true,
            nav: true,
            mouseDrag: true,
            autoplayHoverPause: true,
            responsiveClass: true,
            dots: false,
            navText: [
                "<i class='icofont-curved-double-left'></i>",
                "<i class='icofont-curved-double-right'></i>",
            ],
            responsive: {
                0: {
                    items: 1,
                },
                768: {
                    items: 2,
                },
                1024: {
                    items: 3,
                },
                1200: {
                    items: 4,
                },
            },
        });

        // Testimonials Slides
        $('.testimonials-slides').owlCarousel({
            loop: true,
            autoplay: true,
            nav: true,
            mouseDrag: true,
            autoplayHoverPause: true,
            responsiveClass: true,
            dots: false,
            navText: [
                "<i class='icofont-curved-double-left'></i>",
                "<i class='icofont-curved-double-right'></i>",
            ],
            responsive: {
                0: {
                    items: 1,
                },
                768: {
                    items: 2,
                },
                1024: {
                    items: 2,
                },
                1200: {
                    items: 3,
                },
            },
        });

        // FAQ Accordion
        $(function() {
            $('.accordion')
                .find('.accordion-title')
                .on('click', function() {
                    // Adds Active Class
                    $(this).toggleClass('active');
                    // Expand or Collapse This Panel
                    $(this)
                        .next()
                        .slideToggle('fast');
                    // Hide The Other Panels
                    $('.accordion-content')
                        .not($(this).next())
                        .slideUp('fast');
                    // Removes Active Class From Other Titles
                    $('.accordion-title')
                        .not($(this))
                        .removeClass('active');
                });
        });

        // Partner Slides
        $('.partner-slides').owlCarousel({
            loop: true,
            autoplay: true,
            nav: false,
            mouseDrag: true,
            autoplayHoverPause: true,
            responsiveClass: true,
            dots: false,
            navText: [
                "<i class='icofont-curved-double-left'></i>",
                "<i class='icofont-curved-double-right'></i>",
            ],
            responsive: {
                0: {
                    items: 2,
                },
                768: {
                    items: 4,
                },
                1200: {
                    items: 6,
                },
            },
        });

        // Popup Youtube
        $('.popup-youtube').magnificPopup({
            disableOn: 320,
            type: 'iframe',
            mainClass: 'mfp-fade',
            removalDelay: 160,
            preloader: false,
            fixedContentPos: false,
        });

        // Go to Top
        $(function() {
            //Scroll event
            $(window).on('scroll', function() {
                var scrolled = $(window).scrollTop();
                if (scrolled > 300) $('.go-top').fadeIn('slow');
                if (scrolled < 300) $('.go-top').fadeOut('slow');
            });
            //Click event
            $('.go-top').on('click', function() {
                $('html, body').animate({ scrollTop: '0' }, 500);
            });
        });

    });

    // Preloader JS
    jQuery(window).on('load', function() {
        $('.preloader').fadeOut();
    });
})(jQuery);
$(function(){
  function hideLoader() {
    $('.upload-spinner').hide();
    $('#upload-trigger').show();
    $('.no-drops .spinner').addClass('d-none');
    $('.upload-copy').show();
  }

  function showLoader() {
    let clickedButton = $('.dashboard input#file').attr('data-clicked-button');
    if (clickedButton === 'upload-link') {
      $('.dashboard input#file').attr('data-clicked-button', 'none');
      $('.no-drops .spinner').removeClass('d-none');
      $('.upload-copy').hide();
    }
    else {
      $('.upload-spinner').show();
      $('#upload-trigger').hide();
    }
  }

  $('form#item-upload').submit(function(e) {
    e.preventDefault();
    window.onbeforeunload = function() {
      return "Upload in progress";
    };
    showLoader();
    var file_input = $(this).find("input[type=file]");
    var file = file_input[0].files[0];
    var size = file_input.data("max-file-size");
    var collectionId = $(this)
      .find("input[name=collection_id]")
      .val();
    var onboardingCollectionId = $(this)
      .find("input[name=onboarding_collection_id]")
      .val();

    var params = {
      name: file.name,
      content_type: file.type,
      file_size: file.size,
      action_type: "fu",
      collection_id: collectionId,
    };

    if (file.type.includes("video")) {
      alert(
        "It looks like you are uploading an external video file. This may not be fully supported as we are optimized for recordings created through CloudApp."
      );
    }

    // validate file size
    if (!!size && file.size > size) {
      alert('File size exceeds your plan limits');
      file_input.val('');
      $('.btn-primary').removeAttr('data-disable-with');
    } else {
      var $submit = $(this).find('input[type=submit]');
      $submit.hide();
      $submit.after("<div class='spinner submit-spinner'></div>");
      // var host = !!onboardingCollectionId ? window.location.origin + '/' : '';
      var host = window.location.origin + '/'; // since upload is from collection controller also path was getting added in front of api/v4

      // TODO: get rid of url's that don't come from Rails helpers.
      parts = window.location.pathname.split('/');
      if(parts[1] !== 'dashboard' && parts[1] !== 'collections' && parts[1] !== 'admin') {
        host += parts[1] + "/"; //assume parts[1] == RAILS_RELATIVE_ROOT_URL
      }

      $.ajax({
        method: 'POST',
        url: host + 'api/v4/items',
        data: params,
        dataType: 'json',
      })
        .done(function(item) {
          var fd = new FormData();
          for (var key in item.s3) {
            fd.append(key, item.s3[key]);
          }

          fd.append('file', file);
          $.ajax({
            method: 'POST',
            url: item.url,
            crossDomain: true,
            processData: false,
            contentType: false,
            data: fd,
          })
            .done(function(s3Response) {
              var doc = $(s3Response);
              var collectionPath =
                window.location.origin +
                '/admin/collections/' +
                onboardingCollectionId;
              var url = !!onboardingCollectionId
                ? collectionPath + '/collection_items/' + item.slug
                : host + 'api/v4/items/' + item.slug + '/completed';
              $.ajax({
                method: 'PUT',
                url,
                dataType: 'json',
                data: {
                  key: doc.find('Key').text(),
                  checksum: doc.find('ETag').text(),
                },
              }).done(function() {
                window.onbeforeunload = null;
                window.location.reload();
              });
            })
            .fail(function(data) {
              $submit.show();
              $('.submit-spinner').remove();
            });
        })
        .fail(function(data) {
          $submit.show();
          $('.submit-spinner').remove();
          hideLoader();
          file_input.val('');
          let errors =
            data.responseJSON.message ||
            data.responseJSON.error ||
            data.responseJSON.errors;
          if (Array.isArray(errors)) {
            let errorList = errors.map(error => `<li>${error}</li>`).join('');
            $('.alert-danger').html(errorList);
          } else {
            $('.alert-danger').html(`<li>${errors}</li>`);
          }
          $('.alert-danger').show();
          setTimeout(function(){
            $('.alert-danger').fadeOut('slow');
          }, 2000);
        });
    }
  });
});
$(function() {
  $('form#logo-uploader').on('ajax:error', function(){
    $('#logo-remover').show();
  })

  $('form#logo-uploader').submit(function(e) {

    var file_input = $(this).find('input[type=file]');
    var file = file_input[0].files[0];
    var removeFile = $(this).find('input#empty-logo')[0];
    $('#logo-remover').hide();

    if(file){
      var extension = file.name.split('.').pop();
      if (!["jpg", "png", "jpeg", "gif"].includes(extension)) {
        $(`<li>Invalid file extension. Please use .jpg or .png files</li>`).appendTo('.alert-danger');
        $('#logo-remover').show();
        $('.alert-danger').show();
        e.preventDefault();
        return false;
      }
    }
  });

  $('#logo-remover').on('click',function(e) {
    $(this).after('<input type="hidden" name="logo" value="" id="empty-logo"/>')
    $('#custom-logo-submit').click();
  });
});
jQuery.fn.outerHTML = function () {
  return jQuery('<div />').append(this.eq(0).clone()).html();
};

function updateEmbed(setIframeEmbed) {
  // The embed modal is loaded on literally every page (including account settings etc), but
  // gon only gets loaded on the viewer page (for now). So don't proceed if we don't have gon.
  if (typeof gon === 'undefined' || !gon.item || !gon.item.links.share_url) return;
  $.ajax({
    dataType: "json",
    url: gon.oembed_service,
    data: {
      url: gon.item.links.share_url,
      format: "json"
    },
    success: function (result) {
      let iframe = jQuery.parseHTML(result.html);
      // For whatever reason, by default we don't get branding from oEmbed
      $embedIframe = $(".embed-modal iframe");

      let baseURL = $(iframe).attr('src');
      let newURL = updateURL(baseURL, 'branding', true);
      newURL = updateURL(newURL, 'title', true);

      $embedIframe.attr('data-frame-src', newURL);

      iframe[0].setAttribute("height", "100%");
      iframe[0].setAttribute("width", "100%");
      iframe[0].src = newURL;

      $("#embed-html").val(iframe[0].outerHTML);

      if (setIframeEmbed) {
        if ($embedIframe.attr('src') != $embedIframe.attr('data-frame-src')) {
          $embedIframe.attr('src', $embedIframe.attr('data-frame-src'));
        }
      }

      $('#shareDrop').click(function () {
        if ($embedIframe.attr('src') != $embedIframe.attr('data-frame-src')) {
          $embedIframe.attr('src', $embedIframe.attr('data-frame-src'));
        }
      });

      $('#embedDrop').click(function () {
        if ($embedIframe.attr('src') != $embedIframe.attr('data-frame-src')) {
          $embedIframe.attr('src', $embedIframe.attr('data-frame-src'));
        }
      });
    },
    error: function (error) {
      $("#embed-html").val("").attr("placeholder", `Failed: ${error.status} - ${error.statusText}`);
    }
  });
}

function updateURL(url, param, value) {
  let path = url.split('?')[0];
  let query = url.split('?')[1];
  let params = new URLSearchParams(query);
  if (value) {
    params.append(param, true);
  } else {
    params.delete(param);
  }
  return path + '?' + params.toString();
}

document.addEventListener('update_embed', function (e) {
  updateEmbed(true);
}, false);

(function ($) {
  $(document).ready(function () {
    new ClipboardJS('.btn');
    updateEmbed();
    // We can't bind directly to the element. Probably because it loads later on.
    // Instead, just wait for a bubbling event in a handler on body.
    $("body").on("change", "#hide-title, #hide-branding", function () {
      $embedIframe = $(".embed-modal iframe");
      let newURL = updateURL($embedIframe.attr('src'), this.name, !this.checked);
      $embedIframe.attr('data-frame-src', newURL);
      $embedIframe.attr('src', newURL);
      $("#embed-html").val($embedIframe.outerHTML());
    });
  });
})(jQuery);

jQuery(function() {
  // TODO: This should use copyToClipboard.js vue component instead, it'll need a some adjustments to make it configurable.
  var clipboard = new ClipboardJS('a#copy-to-clipboard');
  clipboard.on('success', function(e) {
    $('.flash.alert-success')
      .text('Share link copied to clipboard')
      .fadeIn(500, function() {
        $(this)
          .delay(1000)
          .fadeOut();
      });
  });
  // remove this once it's ported over to VUE

  $('.mobile-options-toggle').click(function(e) {
    toggleClass(this, '.card', 'mobile-hover');
  });

  $('#add-collection-button').click(function(e) {
    $('input#collection-name').toggle();
    toggleClass(this, 'i', 'fa-plus');
    toggleClass(this, 'i', 'fa-minus');
  });

  $('#toggle-hidden-collections').click(function(e) {
    $('.hidden-collection').toggle();
    toggleClass(this, 'i', 'fa-check');

    fetch('/api/v5/users/toggle_show_hidden_collections', {
      method: 'PATCH',
      headers: {
        "Content-Type": "application/json"
      }
    });
  });

  $('.dashboard select#organization_id').change(function(e) {
    $(this)[0].form.submit();
  });

  $('.no-drops .upload-link').click(function(e) {
    $('.dashboard input#file').click();
    $('.dashboard input#file').attr('data-clicked-button', 'upload-link');
  });

  $('.dashboard input#file').change(function(e) {
    $('form#item-upload').submit();
  });

  $("#checkAll").click(function () {
    $('input:checkbox').not(this).prop('checked', this.checked);
    if (this.checked) {
      $("#heading-name").hide();
      $("#bulk-actions-container").show()
    } else {
      $("#heading-name").show();
      $("#bulk-actions-container").hide();
      $('.hover-checkbox').hide();
    }
  });

  function toggleClass(parent_element, element, klass) {
    $(parent_element)
      .find(element)
      .toggleClass(klass)
  }

  // These 2 functions are being used in `app/views/web/dashboard/team_files.html.erb`
  function setListView() {
    $('.fa-list').addClass("fa-list-active");
    $('.fa-list-active').removeClass("fa-list");
    $('.fa-th-active').addClass("fa-th");
    $('.fa-th').removeClass("fa-th-active");
  };

  function setThView() {
    $('.fa-list-active').addClass("fa-list");
    $('.fa-list').removeClass("fa-list-active");
    $('.fa-th').addClass("fa-th-active");
    $('.fa-th-active').removeClass("fa-th");
  };

  function isListView() {
    return localStorage.getItem('view-preference') === 'list';
  }

  function clickedViewIcon(viewMode, e) {
    return e.target.dataset.testid === viewMode;
  }

  if (isListView()) {
    setListView();
  } else {
    setThView();
  }

  function showHiddenBanner() {
    let freeBanner = $("#free-banner").length;
    if (!freeBanner || gon.show_free_banner) {
      $('.notification-hidden-content').show();
    }
  }

  var dismissBanner = $('#dismiss-notification-banner');
  if(dismissBanner[0]){
    var broadcastShown = localStorage.getItem("broadcast-dismissed-" + dismissBanner.data().broadcastid)
    if(!broadcastShown){
      $('.notification-hidden-content').hide()
      $('.broadcast-notification-banner').css('display', 'flex');
    }else{
      showHiddenBanner();
    }

    dismissBanner.on('click', function(e){
      localStorage.setItem("broadcast-dismissed-" + e.target.dataset.broadcastid, 1)
      $('.broadcast-notification-banner').hide();
      showHiddenBanner();
    })
  }else{
    showHiddenBanner();
  }

  $('.views-button').on('click', function(e) {
    $("#heading-name").fadeIn();
    $("#bulk-actions-container").hide();
    if (clickedViewIcon('list-view', e)) {
      setListView();
      localStorage.setItem("view-preference", "list");
    } else if (clickedViewIcon('grid-view', e)) {
      setThView();
      localStorage.setItem("view-preference", "grid");
    }
  });
});


(function() {
  $(document).on("ready", function() {
    let keepTabState = function() {
      let hash = window.location.hash;
      if (hash) {
        $('.nav a.nav-link[href="' + hash + '"]').show();
      } else {
        $('.nav a.nav-link:first').show();
      }

      $('.nav a.nav-link').click(function (e) {
        $(this).tab('show');
        window.location.hash = this.hash;
      });
    };

    keepTabState();
  });
}).call(this);
function hideTypeformModal() {
  document.getElementById('typeform-container').classList.remove('active');
  document.getElementById('typeform-container').classList.add('inactive');
}

function showTypeformModal() {
  document.getElementById('typeform-container').classList.remove('inactive');
  document.getElementById('typeform-container').classList.add('active');
}


/*
 * The "Update" button reloads the page, and the remote form (API) does not return
 * any information beyond "Update successful" so it becomes impossible to determine
 * after the fact if a downgrade happened.
 * 
 * The first of these functions check if some text is present in the UI at the time
 * of submitting the form ; if so, a localStorage item is set.
 * 
 * The second is triggered on each page load, along with the typeform modal being
 * loaded in a hidden state from the controller. If the localStorage element is
 * present, we open the modal.
 * 
 * It's not a great solution, but it beats changing the API.
 */ 
function preloadTypeform() {
  if (document.getElementById("change_in_cost_text").innerText.includes("credited")) {
    window.localStorage.setItem("typeform_downgraded", true);
  }
}

function openTypeformIfDowngraded() {
  if (window.localStorage.getItem("typeform_downgraded")) {
    window.localStorage.removeItem("typeform_downgraded");

    showTypeformModal();
  }
}
;
function addURLParams(params) {
    utmHistory(params);
    changeModalFormAction(params);
}

function setModalUTM(params) {
    params = prefixWithUTM(params);
    utmHistory(params);
    changeModalFormAction(params);
}

function prefixWithUTM(params) {
    let newParams = {};
    for (const [key, value] of Object.entries(params)) {
        newParams["utm_" + key] = value;
    }
    return newParams;
}

function utmHistory(params) {
    let q = paramsToQuery(params);
    let oldPath = new URL(window.location.protocol + "//" + window.location.host + window.location.pathname);
    let oldParams = new URL(window.location.href).searchParams;

    window.history.pushState({ path: oldPath.toString() }, "", oldPath.toString() + '?' + mergeParams(oldParams, q).toString());
}

function changeModalFormAction(params) {
    let q = paramsToQuery(params);
    let formAction = $("form#modal-signup-form").attr("action");

    if (!formAction.match(/^http/)) {
        let baseURL = location.protocol + '//' + location.host;
        if (!formAction.match(/^\//)) {
            baseURL += location.pathname;
        }
        formAction = baseURL + formAction;
    }

    let oldPath = new URL(formAction);
    let oldFormParams = oldPath.searchParams;
    let oldParams = new URL(window.location.href).searchParams;
    $("form#modal-signup-form").attr("action", oldPath.toString() + '?' + mergeParams(oldParams, mergeParams(oldFormParams, q)).toString());
}

function viewerUtmParams(medium, dropId, source = "viewer") {
    let campaign = null;

    switch (medium) {
        case "nav_button":
            if (gon.web_experiment_autoplay && (gon.item.m3u8 || gon.item.attributes.item_type == "video")) {
                campaign = "auto_play_signup";
            }
            break;
    }

    let params = { source, medium, campaign };

    if (dropId) {
        params.content = `drop:${dropId}`;
    }

    return params;
}

function mergeParams(oldP, newP) {
    for (const [k, v] of newP) {
        oldP.set(k, v);
    }
    return oldP;
}

function paramsToQuery(params) {
    let urlparams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value) {
            urlparams.set(key, value);
        }
    }
    return urlparams;
}
;
function sendTrackEvent(event, params) {
  const http = new XMLHttpRequest();
  const routes = /*
File generated by js-routes 1.4.14
Based on Rails 6.0.4.8 routes of Dropper::Application
 */

(function() {
  var DeprecatedGlobbingBehavior, NodeTypes, ParameterMissing, ReservedOptions, SpecialOptionsKey, UriEncoderSegmentRegex, Utils, error, result,
    hasProp = {}.hasOwnProperty,
    slice = [].slice;

  ParameterMissing = function(message, fileName, lineNumber) {
    var instance;
    instance = new Error(message, fileName, lineNumber);
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    } else {
      instance.__proto__ = this.__proto__;
    }
    if (Error.captureStackTrace) {
      Error.captureStackTrace(instance, ParameterMissing);
    }
    return instance;
  };

  ParameterMissing.prototype = Object.create(Error.prototype, {
    constructor: {
      value: Error,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });

  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(ParameterMissing, Error);
  } else {
    ParameterMissing.__proto__ = Error;
  }

  NodeTypes = {"GROUP":1,"CAT":2,"SYMBOL":3,"OR":4,"STAR":5,"LITERAL":6,"SLASH":7,"DOT":8};

  DeprecatedGlobbingBehavior = false;

  SpecialOptionsKey = "_options";

  UriEncoderSegmentRegex = /[^a-zA-Z0-9\-\._~!\$&'\(\)\*\+,;=:@]/g;

  ReservedOptions = ['anchor', 'trailing_slash', 'subdomain', 'host', 'port', 'protocol'];

  Utils = {
    configuration: {
      prefix: "",
      default_url_options: {},
      special_options_key: "_options",
      serializer: null
    },
    default_serializer: function(object, prefix) {
      var element, i, j, key, len, prop, s;
      if (prefix == null) {
        prefix = null;
      }
      if (object == null) {
        return "";
      }
      if (!prefix && !(this.get_object_type(object) === "object")) {
        throw new Error("Url parameters should be a javascript hash");
      }
      s = [];
      switch (this.get_object_type(object)) {
        case "array":
          for (i = j = 0, len = object.length; j < len; i = ++j) {
            element = object[i];
            s.push(this.default_serializer(element, prefix + "[]"));
          }
          break;
        case "object":
          for (key in object) {
            if (!hasProp.call(object, key)) continue;
            prop = object[key];
            if ((prop == null) && (prefix != null)) {
              prop = "";
            }
            if (prop != null) {
              if (prefix != null) {
                key = prefix + "[" + key + "]";
              }
              s.push(this.default_serializer(prop, key));
            }
          }
          break;
        default:
          if (object != null) {
            s.push((encodeURIComponent(prefix.toString())) + "=" + (encodeURIComponent(object.toString())));
          }
      }
      if (!s.length) {
        return "";
      }
      return s.join("&");
    },
    serialize: function(object) {
      var custom_serializer;
      custom_serializer = this.configuration.serializer;
      if ((custom_serializer != null) && this.get_object_type(custom_serializer) === "function") {
        return custom_serializer(object);
      } else {
        return this.default_serializer(object);
      }
    },
    clean_path: function(path) {
      var last_index;
      path = path.split("://");
      last_index = path.length - 1;
      path[last_index] = path[last_index].replace(/\/+/g, "/");
      return path.join("://");
    },
    extract_options: function(number_of_params, args) {
      var last_el, options;
      last_el = args[args.length - 1];
      if ((args.length > number_of_params && last_el === void 0) || ((last_el != null) && "object" === this.get_object_type(last_el) && !this.looks_like_serialized_model(last_el))) {
        options = args.pop() || {};
        delete options[this.configuration.special_options_key];
        return options;
      } else {
        return {};
      }
    },
    looks_like_serialized_model: function(object) {
      return !object[this.configuration.special_options_key] && ("id" in object || "to_param" in object);
    },
    path_identifier: function(object) {
      var property;
      if (object === 0) {
        return "0";
      }
      if (!object) {
        return "";
      }
      property = object;
      if (this.get_object_type(object) === "object") {
        if ("to_param" in object) {
          if (object.to_param == null) {
            throw new ParameterMissing("Route parameter missing: to_param");
          }
          property = object.to_param;
        } else if ("id" in object) {
          if (object.id == null) {
            throw new ParameterMissing("Route parameter missing: id");
          }
          property = object.id;
        } else {
          property = object;
        }
        if (this.get_object_type(property) === "function") {
          property = property.call(object);
        }
      }
      return property.toString();
    },
    clone: function(obj) {
      var attr, copy, key;
      if ((obj == null) || "object" !== this.get_object_type(obj)) {
        return obj;
      }
      copy = obj.constructor();
      for (key in obj) {
        if (!hasProp.call(obj, key)) continue;
        attr = obj[key];
        copy[key] = attr;
      }
      return copy;
    },
    merge: function() {
      var tap, xs;
      xs = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      tap = function(o, fn) {
        fn(o);
        return o;
      };
      if ((xs != null ? xs.length : void 0) > 0) {
        return tap({}, function(m) {
          var j, k, len, results, v, x;
          results = [];
          for (j = 0, len = xs.length; j < len; j++) {
            x = xs[j];
            results.push((function() {
              var results1;
              results1 = [];
              for (k in x) {
                v = x[k];
                results1.push(m[k] = v);
              }
              return results1;
            })());
          }
          return results;
        });
      }
    },
    normalize_options: function(parts, required_parts, default_options, actual_parameters) {
      var i, j, key, len, options, part, parts_options, result, route_parts, url_parameters, use_all_parts, value;
      options = this.extract_options(parts.length, actual_parameters);
      if (actual_parameters.length > parts.length) {
        throw new Error("Too many parameters provided for path");
      }
      use_all_parts = actual_parameters.length > required_parts.length;
      parts_options = {};
      for (key in options) {
        if (!hasProp.call(options, key)) continue;
        use_all_parts = true;
        if (this.indexOf(parts, key) >= 0) {
          parts_options[key] = value;
        }
      }
      options = this.merge(this.configuration.default_url_options, default_options, options);
      result = {};
      url_parameters = {};
      result['url_parameters'] = url_parameters;
      for (key in options) {
        if (!hasProp.call(options, key)) continue;
        value = options[key];
        if (this.indexOf(ReservedOptions, key) >= 0) {
          result[key] = value;
        } else {
          url_parameters[key] = value;
        }
      }
      route_parts = use_all_parts ? parts : required_parts;
      i = 0;
      for (j = 0, len = route_parts.length; j < len; j++) {
        part = route_parts[j];
        if (i < actual_parameters.length) {
          if (!parts_options.hasOwnProperty(part)) {
            url_parameters[part] = actual_parameters[i];
            ++i;
          }
        }
      }
      return result;
    },
    build_route: function(parts, required_parts, default_options, route, full_url, args) {
      var options, parameters, result, url, url_params;
      args = Array.prototype.slice.call(args);
      options = this.normalize_options(parts, required_parts, default_options, args);
      parameters = options['url_parameters'];
      result = "" + (this.get_prefix()) + (this.visit(route, parameters));
      url = Utils.clean_path(result);
      if (options['trailing_slash'] === true) {
        url = url.replace(/(.*?)[\/]?$/, "$1/");
      }
      if ((url_params = this.serialize(parameters)).length) {
        url += "?" + url_params;
      }
      url += options.anchor ? "#" + options.anchor : "";
      if (full_url) {
        url = this.route_url(options) + url;
      }
      return url;
    },
    visit: function(route, parameters, optional) {
      var left, left_part, right, right_part, type, value;
      if (optional == null) {
        optional = false;
      }
      type = route[0], left = route[1], right = route[2];
      switch (type) {
        case NodeTypes.GROUP:
          return this.visit(left, parameters, true);
        case NodeTypes.STAR:
          return this.visit_globbing(left, parameters, true);
        case NodeTypes.LITERAL:
        case NodeTypes.SLASH:
        case NodeTypes.DOT:
          return left;
        case NodeTypes.CAT:
          left_part = this.visit(left, parameters, optional);
          right_part = this.visit(right, parameters, optional);
          if (optional && ((this.is_optional_node(left[0]) && !left_part) || ((this.is_optional_node(right[0])) && !right_part))) {
            return "";
          }
          return "" + left_part + right_part;
        case NodeTypes.SYMBOL:
          value = parameters[left];
          delete parameters[left];
          if (value != null) {
            return this.encode_segment(this.path_identifier(value));
          }
          if (optional) {
            return "";
          } else {
            throw new ParameterMissing("Route parameter missing: " + left);
          }
          break;
        default:
          throw new Error("Unknown Rails node type");
      }
    },
    encode_segment: function(segment) {
      return segment.replace(UriEncoderSegmentRegex, function(str) {
        return encodeURIComponent(str);
      });
    },
    is_optional_node: function(node) {
      return this.indexOf([NodeTypes.STAR, NodeTypes.SYMBOL, NodeTypes.CAT], node) >= 0;
    },
    build_path_spec: function(route, wildcard) {
      var left, right, type;
      if (wildcard == null) {
        wildcard = false;
      }
      type = route[0], left = route[1], right = route[2];
      switch (type) {
        case NodeTypes.GROUP:
          return "(" + (this.build_path_spec(left)) + ")";
        case NodeTypes.CAT:
          return "" + (this.build_path_spec(left)) + (this.build_path_spec(right));
        case NodeTypes.STAR:
          return this.build_path_spec(left, true);
        case NodeTypes.SYMBOL:
          if (wildcard === true) {
            return "" + (left[0] === '*' ? '' : '*') + left;
          } else {
            return ":" + left;
          }
          break;
        case NodeTypes.SLASH:
        case NodeTypes.DOT:
        case NodeTypes.LITERAL:
          return left;
        default:
          throw new Error("Unknown Rails node type");
      }
    },
    visit_globbing: function(route, parameters, optional) {
      var left, right, type, value;
      type = route[0], left = route[1], right = route[2];
      value = parameters[left];
      delete parameters[left];
      if (value == null) {
        return this.visit(route, parameters, optional);
      }
      value = (function() {
        switch (this.get_object_type(value)) {
          case "array":
            return value.join("/");
          default:
            return value;
        }
      }).call(this);
      if (DeprecatedGlobbingBehavior) {
        return this.path_identifier(value);
      } else {
        return encodeURI(this.path_identifier(value));
      }
    },
    get_prefix: function() {
      var prefix;
      prefix = this.configuration.prefix;
      if (prefix !== "") {
        prefix = (prefix.match("/$") ? prefix : prefix + "/");
      }
      return prefix;
    },
    route: function(parts_table, default_options, route_spec, full_url) {
      var j, len, part, parts, path_fn, ref, required, required_parts;
      required_parts = [];
      parts = [];
      for (j = 0, len = parts_table.length; j < len; j++) {
        ref = parts_table[j], part = ref[0], required = ref[1];
        parts.push(part);
        if (required) {
          required_parts.push(part);
        }
      }
      path_fn = function() {
        return Utils.build_route(parts, required_parts, default_options, route_spec, full_url, arguments);
      };
      path_fn.required_params = required_parts;
      path_fn.toString = function() {
        return Utils.build_path_spec(route_spec);
      };
      return path_fn;
    },
    route_url: function(route_defaults) {
      var hostname, port, protocol, subdomain;
      if (typeof route_defaults === 'string') {
        return route_defaults;
      }
      hostname = route_defaults.host || Utils.current_host();
      if (!hostname) {
        return '';
      }
      subdomain = route_defaults.subdomain ? route_defaults.subdomain + '.' : '';
      protocol = route_defaults.protocol || Utils.current_protocol();
      port = route_defaults.port || (!route_defaults.host ? Utils.current_port() : void 0);
      port = port ? ":" + port : '';
      return protocol + "://" + subdomain + hostname + port;
    },
    has_location: function() {
      return (typeof window !== "undefined" && window !== null ? window.location : void 0) != null;
    },
    current_host: function() {
      if (this.has_location()) {
        return window.location.hostname;
      } else {
        return null;
      }
    },
    current_protocol: function() {
      if (this.has_location() && window.location.protocol !== '') {
        return window.location.protocol.replace(/:$/, '');
      } else {
        return 'http';
      }
    },
    current_port: function() {
      if (this.has_location() && window.location.port !== '') {
        return window.location.port;
      } else {
        return '';
      }
    },
    _classToTypeCache: null,
    _classToType: function() {
      var j, len, name, ref;
      if (this._classToTypeCache != null) {
        return this._classToTypeCache;
      }
      this._classToTypeCache = {};
      ref = "Boolean Number String Function Array Date RegExp Object Error".split(" ");
      for (j = 0, len = ref.length; j < len; j++) {
        name = ref[j];
        this._classToTypeCache["[object " + name + "]"] = name.toLowerCase();
      }
      return this._classToTypeCache;
    },
    get_object_type: function(obj) {
      if (this.jQuery && (this.jQuery.type != null)) {
        return this.jQuery.type(obj);
      }
      if (obj == null) {
        return "" + obj;
      }
      if (typeof obj === "object" || typeof obj === "function") {
        return this._classToType()[Object.prototype.toString.call(obj)] || "object";
      } else {
        return typeof obj;
      }
    },
    indexOf: function(array, element) {
      if (Array.prototype.indexOf) {
        return array.indexOf(element);
      } else {
        return this.indexOfImplementation(array, element);
      }
    },
    indexOfImplementation: function(array, element) {
      var el, i, j, len, result;
      result = -1;
      for (i = j = 0, len = array.length; j < len; i = ++j) {
        el = array[i];
        if (el === element) {
          result = i;
        }
      }
      return result;
    },
    namespace: function(root, namespace, routes) {
      var index, j, len, part, parts;
      parts = namespace ? namespace.split(".") : [];
      if (parts.length === 0) {
        return routes;
      }
      for (index = j = 0, len = parts.length; j < len; index = ++j) {
        part = parts[index];
        if (index < parts.length - 1) {
          root = (root[part] || (root[part] = {}));
        } else {
          return root[part] = routes;
        }
      }
    },
    configure: function(new_config) {
      return this.configuration = this.merge(this.configuration, new_config);
    },
    config: function() {
      return this.clone(this.configuration);
    },
    make: function() {
      var routes;
      routes = {
// achievements_api_v5_users => /api/v5/users/achievements(.:format)
  // function(options)
  achievements_api_v5_users_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"users",false],[2,[7,"/",false],[2,[6,"achievements",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
achievements_api_v5_users_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"users",false],[2,[7,"/",false],[2,[6,"achievements",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// allow_tracking => /track(.:format)
  // function(options)
  allow_tracking_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"track",false],[1,[2,[8,".",false],[3,"format",false]],false]]]),
allow_tracking_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"track",false],[1,[2,[8,".",false],[3,"format",false]],false]]], true),
// api_integrations_github_lightning_release => /api/integrations/github/lightning_release(.:format)
  // function(options)
  api_integrations_github_lightning_release_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"integrations",false],[2,[7,"/",false],[2,[6,"github",false],[2,[7,"/",false],[2,[6,"lightning_release",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
api_integrations_github_lightning_release_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"integrations",false],[2,[7,"/",false],[2,[6,"github",false],[2,[7,"/",false],[2,[6,"lightning_release",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// api_integrations_slack_actions => /api/integrations/slack/actions(.:format)
  // function(options)
  api_integrations_slack_actions_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"integrations",false],[2,[7,"/",false],[2,[6,"slack",false],[2,[7,"/",false],[2,[6,"actions",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
api_integrations_slack_actions_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"integrations",false],[2,[7,"/",false],[2,[6,"slack",false],[2,[7,"/",false],[2,[6,"actions",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// api_integrations_slack_commands => /api/integrations/slack/commands(.:format)
  // function(options)
  api_integrations_slack_commands_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"integrations",false],[2,[7,"/",false],[2,[6,"slack",false],[2,[7,"/",false],[2,[6,"commands",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
api_integrations_slack_commands_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"integrations",false],[2,[7,"/",false],[2,[6,"slack",false],[2,[7,"/",false],[2,[6,"commands",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// api_integrations_slack_events => /api/integrations/slack/events(.:format)
  // function(options)
  api_integrations_slack_events_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"integrations",false],[2,[7,"/",false],[2,[6,"slack",false],[2,[7,"/",false],[2,[6,"events",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
api_integrations_slack_events_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"integrations",false],[2,[7,"/",false],[2,[6,"slack",false],[2,[7,"/",false],[2,[6,"events",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// api_integrations_slack_install => /api/integrations/slack/install(.:format)
  // function(options)
  api_integrations_slack_install_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"integrations",false],[2,[7,"/",false],[2,[6,"slack",false],[2,[7,"/",false],[2,[6,"install",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
api_integrations_slack_install_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"integrations",false],[2,[7,"/",false],[2,[6,"slack",false],[2,[7,"/",false],[2,[6,"install",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// api_integrations_slack_send_message => /api/integrations/slack/send_message(.:format)
  // function(options)
  api_integrations_slack_send_message_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"integrations",false],[2,[7,"/",false],[2,[6,"slack",false],[2,[7,"/",false],[2,[6,"send_message",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
api_integrations_slack_send_message_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"integrations",false],[2,[7,"/",false],[2,[6,"slack",false],[2,[7,"/",false],[2,[6,"send_message",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// api_v4 => /api/v4/clients/:client/current-version(.:format)
  // function(client, options)
  api_v4_path: Utils.route([["client",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"clients",false],[2,[7,"/",false],[2,[3,"client",false],[2,[7,"/",false],[2,[6,"current-version",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
api_v4_url: Utils.route([["client",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"clients",false],[2,[7,"/",false],[2,[3,"client",false],[2,[7,"/",false],[2,[6,"current-version",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// api_v4_account => /api/v4/account/:id(.:format)
  // function(id, options)
  api_v4_account_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"account",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
api_v4_account_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"account",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// api_v4_account_settings => /api/v4/settings(.:format)
  // function(options)
  api_v4_account_settings_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"settings",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
api_v4_account_settings_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"settings",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// api_v4_accounts => /api/v4/account(.:format)
  // function(options)
  api_v4_accounts_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"account",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
api_v4_accounts_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"account",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// api_v4_achievements => /api/v4/achievements(.:format)
  // function(options)
  api_v4_achievements_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"achievements",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
api_v4_achievements_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"achievements",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// api_v4_client_notification => /api/v4/client_notifications/:id(.:format)
  // function(id, options)
  api_v4_client_notification_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"client_notifications",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
api_v4_client_notification_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"client_notifications",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// api_v4_client_notifications => /api/v4/client_notifications(.:format)
  // function(options)
  api_v4_client_notifications_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"client_notifications",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
api_v4_client_notifications_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"client_notifications",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// api_v4_collection => /api/v4/collections/:id(.:format)
  // function(id, options)
  api_v4_collection_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"collections",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
api_v4_collection_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"collections",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// api_v4_collection_items => /api/v4/collection_items(.:format)
  // function(options)
  api_v4_collection_items_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"collection_items",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
api_v4_collection_items_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"collection_items",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// api_v4_collections => /api/v4/collections(.:format)
  // function(options)
  api_v4_collections_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"collections",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
api_v4_collections_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"collections",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// api_v4_invitations => /api/v4/invitations/:slug(.:format)
  // function(slug, options)
  api_v4_invitations_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"invitations",false],[2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
api_v4_invitations_url: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"invitations",false],[2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// api_v4_item => /api/v4/items/:id(.:format)
  // function(id, options)
  api_v4_item_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
api_v4_item_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// api_v4_items => /api/v4/items(.:format)
  // function(options)
  api_v4_items_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"items",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
api_v4_items_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"items",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// api_v4_license_request => /api/v4/license/request/:slug(.:format)
  // function(slug, options)
  api_v4_license_request_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"license",false],[2,[7,"/",false],[2,[6,"request",false],[2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
api_v4_license_request_url: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"license",false],[2,[7,"/",false],[2,[6,"request",false],[2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// api_v4_limits => /api/v4/limits(.:format)
  // function(options)
  api_v4_limits_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"limits",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
api_v4_limits_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"limits",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// api_v4_login => /api/v4/login(.:format)
  // function(options)
  api_v4_login_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"login",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
api_v4_login_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"login",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// api_v4_member => /api/v4/members/:id(.:format)
  // function(id, options)
  api_v4_member_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"members",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
api_v4_member_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"members",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// api_v4_members => /api/v4/members(.:format)
  // function(options)
  api_v4_members_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"members",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
api_v4_members_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"members",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// api_v4_organization => /api/v4/organizations/:id(.:format)
  // function(id, options)
  api_v4_organization_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
api_v4_organization_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// api_v4_organization_autojoin_domain => /api/v4/organizations/:organization_id/autojoin_domains/:id(.:format)
  // function(organization_id, id, options)
  api_v4_organization_autojoin_domain_path: Utils.route([["organization_id",true],["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"autojoin_domains",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]]]),
api_v4_organization_autojoin_domain_url: Utils.route([["organization_id",true],["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"autojoin_domains",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]]], true),
// api_v4_organization_autojoin_domains => /api/v4/organizations/:organization_id/autojoin_domains(.:format)
  // function(organization_id, options)
  api_v4_organization_autojoin_domains_path: Utils.route([["organization_id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"autojoin_domains",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
api_v4_organization_autojoin_domains_url: Utils.route([["organization_id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"autojoin_domains",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// api_v4_organization_custom_domains => /api/v4/organizations/:organization_id/custom_domains(.:format)
  // function(organization_id, options)
  api_v4_organization_custom_domains_path: Utils.route([["organization_id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"custom_domains",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
api_v4_organization_custom_domains_url: Utils.route([["organization_id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"custom_domains",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// api_v4_organization_invitations => /api/v4/organizations/:organization_id/invitations(.:format)
  // function(organization_id, options)
  api_v4_organization_invitations_path: Utils.route([["organization_id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"invitations",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
api_v4_organization_invitations_url: Utils.route([["organization_id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"invitations",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// api_v4_organization_lockdown_domain => /api/v4/organizations/:organization_id/lockdown_domains/:id(.:format)
  // function(organization_id, id, options)
  api_v4_organization_lockdown_domain_path: Utils.route([["organization_id",true],["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"lockdown_domains",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]]]),
api_v4_organization_lockdown_domain_url: Utils.route([["organization_id",true],["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"lockdown_domains",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]]], true),
// api_v4_organization_lockdown_domains => /api/v4/organizations/:organization_id/lockdown_domains(.:format)
  // function(organization_id, options)
  api_v4_organization_lockdown_domains_path: Utils.route([["organization_id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"lockdown_domains",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
api_v4_organization_lockdown_domains_url: Utils.route([["organization_id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"lockdown_domains",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// api_v4_organization_members => /api/v4/organizations/:organization_id/members(.:format)
  // function(organization_id, options)
  api_v4_organization_members_path: Utils.route([["organization_id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"members",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
api_v4_organization_members_url: Utils.route([["organization_id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"members",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// api_v4_organization_update_payment => /api/v4/organizations/:organization_id/payment_methods(.:format)
  // function(organization_id, options)
  api_v4_organization_update_payment_path: Utils.route([["organization_id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"payment_methods",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
api_v4_organization_update_payment_url: Utils.route([["organization_id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"payment_methods",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// api_v4_organizations => /api/v4/organizations(.:format)
  // function(options)
  api_v4_organizations_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"organizations",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
api_v4_organizations_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"organizations",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// api_v4_plan => /api/v4/plans/:code(.:format)
  // function(code, options)
  api_v4_plan_path: Utils.route([["code",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"plans",false],[2,[7,"/",false],[2,[3,"code",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
api_v4_plan_url: Utils.route([["code",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"plans",false],[2,[7,"/",false],[2,[3,"code",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// api_v4_plans => /api/v4/plans(.:format)
  // function(options)
  api_v4_plans_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"plans",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
api_v4_plans_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"plans",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// api_v4_pusher_auth => /api/v4/pusher_auth(.:format)
  // function(options)
  api_v4_pusher_auth_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"pusher_auth",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
api_v4_pusher_auth_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"pusher_auth",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// api_v4_referrals => /api/v4/referrals(.:format)
  // function(options)
  api_v4_referrals_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"referrals",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
api_v4_referrals_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"referrals",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// api_v4_subscription => /api/v4/subscriptions/:id(.:format)
  // function(id, options)
  api_v4_subscription_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"subscriptions",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
api_v4_subscription_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"subscriptions",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// api_v4_subscriptions => /api/v4/subscriptions(.:format)
  // function(options)
  api_v4_subscriptions_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"subscriptions",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
api_v4_subscriptions_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"subscriptions",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// api_v5 => /api/v5/third_party_applications/validate/:api_key(.:format)
  // function(api_key, options)
  api_v5_path: Utils.route([["api_key",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"third_party_applications",false],[2,[7,"/",false],[2,[6,"validate",false],[2,[7,"/",false],[2,[3,"api_key",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
api_v5_url: Utils.route([["api_key",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"third_party_applications",false],[2,[7,"/",false],[2,[6,"validate",false],[2,[7,"/",false],[2,[3,"api_key",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// api_v5_call_to_action => /api/v5/call_to_actions/:id(.:format)
  // function(id, options)
  api_v5_call_to_action_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"call_to_actions",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
api_v5_call_to_action_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"call_to_actions",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// api_v5_call_to_actions => /api/v5/call_to_actions(.:format)
  // function(options)
  api_v5_call_to_actions_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"call_to_actions",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
api_v5_call_to_actions_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"call_to_actions",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// api_v5_campaign_modal => /api/v5/campaign_modals/:id(.:format)
  // function(id, options)
  api_v5_campaign_modal_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"campaign_modals",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
api_v5_campaign_modal_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"campaign_modals",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// api_v5_campaign_modal_destroy_all => /api/v5/campaign_modal/all(.:format)
  // function(options)
  api_v5_campaign_modal_destroy_all_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"campaign_modal",false],[2,[7,"/",false],[2,[6,"all",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
api_v5_campaign_modal_destroy_all_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"campaign_modal",false],[2,[7,"/",false],[2,[6,"all",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// api_v5_campaign_modals => /api/v5/campaign_modals(.:format)
  // function(options)
  api_v5_campaign_modals_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"campaign_modals",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
api_v5_campaign_modals_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"campaign_modals",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// api_v5_client_notification => /api/v5/client_notifications/:id(.:format)
  // function(id, options)
  api_v5_client_notification_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"client_notifications",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
api_v5_client_notification_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"client_notifications",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// api_v5_client_notifications => /api/v5/client_notifications(.:format)
  // function(options)
  api_v5_client_notifications_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"client_notifications",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
api_v5_client_notifications_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"client_notifications",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// api_v5_client_settings => /api/v5/client_settings(.:format)
  // function(options)
  api_v5_client_settings_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"client_settings",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
api_v5_client_settings_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"client_settings",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// api_v5_collection => /api/v5/collections/:id(.:format)
  // function(id, options)
  api_v5_collection_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"collections",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
api_v5_collection_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"collections",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// api_v5_collections => /api/v5/collections(.:format)
  // function(options)
  api_v5_collections_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"collections",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
api_v5_collections_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"collections",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// api_v5_comment => /api/v5/comments/:id(.:format)
  // function(id, options)
  api_v5_comment_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"comments",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
api_v5_comment_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"comments",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// api_v5_comments => /api/v5/comments(.:format)
  // function(options)
  api_v5_comments_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"comments",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
api_v5_comments_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"comments",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// api_v5_dropper_configuration => /api/v5/dropper_configurations/:name(.:format)
  // function(name, options)
  api_v5_dropper_configuration_path: Utils.route([["name",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"dropper_configurations",false],[2,[7,"/",false],[2,[3,"name",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
api_v5_dropper_configuration_url: Utils.route([["name",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"dropper_configurations",false],[2,[7,"/",false],[2,[3,"name",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// api_v5_features => /api/v5/features(.:format)
  // function(options)
  api_v5_features_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"features",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
api_v5_features_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"features",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// api_v5_features_web => /api/v5/features/web(.:format)
  // function(options)
  api_v5_features_web_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"features",false],[2,[7,"/",false],[2,[6,"web",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
api_v5_features_web_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"features",false],[2,[7,"/",false],[2,[6,"web",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// api_v5_guests => /api/v5/guests(.:format)
  // function(options)
  api_v5_guests_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"guests",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
api_v5_guests_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"guests",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// api_v5_invitation => /api/v5/invitations/:slug(.:format)
  // function(slug, options)
  api_v5_invitation_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"invitations",false],[2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
api_v5_invitation_url: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"invitations",false],[2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// api_v5_invitations => /api/v5/invitations(.:format)
  // function(options)
  api_v5_invitations_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"invitations",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
api_v5_invitations_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"invitations",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// api_v5_item => /api/v5/items/:id(.:format)
  // function(id, options)
  api_v5_item_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
api_v5_item_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// api_v5_item_show_viewer => /api/v5/items/:id/show_viewer(.:format)
  // function(id, options)
  api_v5_item_show_viewer_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"show_viewer",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
api_v5_item_show_viewer_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"show_viewer",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// api_v5_items => /api/v5/items(.:format)
  // function(options)
  api_v5_items_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"items",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
api_v5_items_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"items",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// api_v5_magic_links => /api/v5/magic_links(.:format)
  // function(options)
  api_v5_magic_links_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"magic_links",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
api_v5_magic_links_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"magic_links",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// api_v5_member => /api/v5/members/:id(.:format)
  // function(id, options)
  api_v5_member_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"members",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
api_v5_member_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"members",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// api_v5_members => /api/v5/members(.:format)
  // function(options)
  api_v5_members_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"members",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
api_v5_members_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"members",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// api_v5_organization => /api/v5/organizations/:id(.:format)
  // function(id, options)
  api_v5_organization_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
api_v5_organization_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// api_v5_organization_autojoin_domain => /api/v5/organizations/:organization_id/autojoin_domains/:id(.:format)
  // function(organization_id, id, options)
  api_v5_organization_autojoin_domain_path: Utils.route([["organization_id",true],["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"autojoin_domains",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]]]),
api_v5_organization_autojoin_domain_url: Utils.route([["organization_id",true],["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"autojoin_domains",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]]], true),
// api_v5_organization_autojoin_domains => /api/v5/organizations/:organization_id/autojoin_domains(.:format)
  // function(organization_id, options)
  api_v5_organization_autojoin_domains_path: Utils.route([["organization_id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"autojoin_domains",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
api_v5_organization_autojoin_domains_url: Utils.route([["organization_id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"autojoin_domains",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// api_v5_organization_custom_domain => /api/v5/organizations/:organization_id/custom_domains/:id(.:format)
  // function(organization_id, id, options)
  api_v5_organization_custom_domain_path: Utils.route([["organization_id",true],["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"custom_domains",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]]]),
api_v5_organization_custom_domain_url: Utils.route([["organization_id",true],["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"custom_domains",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]]], true),
// api_v5_organization_custom_domains => /api/v5/organizations/:organization_id/custom_domains(.:format)
  // function(organization_id, options)
  api_v5_organization_custom_domains_path: Utils.route([["organization_id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"custom_domains",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
api_v5_organization_custom_domains_url: Utils.route([["organization_id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"custom_domains",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// api_v5_organization_enable_domain_lockdown => /api/v5/organizations/:organization_id/enable_domain_lockdown(.:format)
  // function(organization_id, options)
  api_v5_organization_enable_domain_lockdown_path: Utils.route([["organization_id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"enable_domain_lockdown",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
api_v5_organization_enable_domain_lockdown_url: Utils.route([["organization_id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"enable_domain_lockdown",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// api_v5_organization_invitations => /api/v5/organizations/:organization_id/invitations(.:format)
  // function(organization_id, options)
  api_v5_organization_invitations_path: Utils.route([["organization_id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"invitations",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
api_v5_organization_invitations_url: Utils.route([["organization_id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"invitations",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// api_v5_organization_lockdown_domain => /api/v5/organizations/:organization_id/lockdown_domains/:id(.:format)
  // function(organization_id, id, options)
  api_v5_organization_lockdown_domain_path: Utils.route([["organization_id",true],["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"lockdown_domains",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]]]),
api_v5_organization_lockdown_domain_url: Utils.route([["organization_id",true],["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"lockdown_domains",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]]], true),
// api_v5_organization_lockdown_domains => /api/v5/organizations/:organization_id/lockdown_domains(.:format)
  // function(organization_id, options)
  api_v5_organization_lockdown_domains_path: Utils.route([["organization_id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"lockdown_domains",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
api_v5_organization_lockdown_domains_url: Utils.route([["organization_id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"lockdown_domains",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// api_v5_organization_members => /api/v5/organizations/:organization_id/members(.:format)
  // function(organization_id, options)
  api_v5_organization_members_path: Utils.route([["organization_id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"members",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
api_v5_organization_members_url: Utils.route([["organization_id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"members",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// api_v5_organization_oauth_application => /api/v5/organizations/:organization_id/oauth_applications/:id(.:format)
  // function(organization_id, id, options)
  api_v5_organization_oauth_application_path: Utils.route([["organization_id",true],["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"oauth_applications",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]]]),
api_v5_organization_oauth_application_url: Utils.route([["organization_id",true],["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"oauth_applications",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]]], true),
// api_v5_organization_oauth_applications => /api/v5/organizations/:organization_id/oauth_applications(.:format)
  // function(organization_id, options)
  api_v5_organization_oauth_applications_path: Utils.route([["organization_id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"oauth_applications",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
api_v5_organization_oauth_applications_url: Utils.route([["organization_id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"oauth_applications",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// api_v5_organization_payment_methods => /api/v5/organizations/:organization_id/payment_methods(.:format)
  // function(organization_id, options)
  api_v5_organization_payment_methods_path: Utils.route([["organization_id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"payment_methods",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
api_v5_organization_payment_methods_url: Utils.route([["organization_id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"payment_methods",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// api_v5_organization_referral => /api/v5/organization_referrals/:id(.:format)
  // function(id, options)
  api_v5_organization_referral_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organization_referrals",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
api_v5_organization_referral_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organization_referrals",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// api_v5_organization_referrals => /api/v5/organization_referrals(.:format)
  // function(options)
  api_v5_organization_referrals_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organization_referrals",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
api_v5_organization_referrals_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organization_referrals",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// api_v5_organization_third_party_application => /api/v5/organizations/:organization_id/third_party_applications/:id(.:format)
  // function(organization_id, id, options)
  api_v5_organization_third_party_application_path: Utils.route([["organization_id",true],["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"third_party_applications",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]]]),
api_v5_organization_third_party_application_url: Utils.route([["organization_id",true],["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"third_party_applications",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]]], true),
// api_v5_organization_third_party_applications => /api/v5/organizations/:organization_id/third_party_applications(.:format)
  // function(organization_id, options)
  api_v5_organization_third_party_applications_path: Utils.route([["organization_id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"third_party_applications",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
api_v5_organization_third_party_applications_url: Utils.route([["organization_id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"organization_id",false],[2,[7,"/",false],[2,[6,"third_party_applications",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// api_v5_organizations => /api/v5/organizations(.:format)
  // function(options)
  api_v5_organizations_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organizations",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
api_v5_organizations_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organizations",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// api_v5_plan => /api/v5/plans/:code(.:format)
  // function(code, options)
  api_v5_plan_path: Utils.route([["code",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"plans",false],[2,[7,"/",false],[2,[3,"code",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
api_v5_plan_url: Utils.route([["code",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"plans",false],[2,[7,"/",false],[2,[3,"code",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// api_v5_plans => /api/v5/plans(.:format)
  // function(options)
  api_v5_plans_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"plans",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
api_v5_plans_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"plans",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// api_v5_reaction => /api/v5/reactions/:id(.:format)
  // function(id, options)
  api_v5_reaction_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"reactions",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
api_v5_reaction_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"reactions",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// api_v5_reactions => /api/v5/reactions(.:format)
  // function(options)
  api_v5_reactions_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"reactions",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
api_v5_reactions_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"reactions",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// api_v5_referrals => /api/v5/referrals(.:format)
  // function(options)
  api_v5_referrals_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"referrals",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
api_v5_referrals_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"referrals",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// api_v5_refresh_token => /api/v5/refresh_token(.:format)
  // function(options)
  api_v5_refresh_token_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"refresh_token",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
api_v5_refresh_token_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"refresh_token",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// api_v5_refresh_token_token => /api/v5/refresh_token/token(.:format)
  // function(options)
  api_v5_refresh_token_token_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"refresh_token",false],[2,[7,"/",false],[2,[6,"token",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
api_v5_refresh_token_token_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"refresh_token",false],[2,[7,"/",false],[2,[6,"token",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// api_v5_stats => /api/v5/items/:id/stats(.:format)
  // function(id, options)
  api_v5_stats_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"stats",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
api_v5_stats_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"stats",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// api_v5_subscription => /api/v5/subscriptions/:id(.:format)
  // function(id, options)
  api_v5_subscription_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"subscriptions",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
api_v5_subscription_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"subscriptions",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// api_v5_subscriptions => /api/v5/subscriptions(.:format)
  // function(options)
  api_v5_subscriptions_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"subscriptions",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
api_v5_subscriptions_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"subscriptions",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// api_v5_sync => /api/v5/sync(.:format)
  // function(options)
  api_v5_sync_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"sync",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
api_v5_sync_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"sync",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// api_v5_template => /api/v5/template/:id(.:format)
  // function(id, options)
  api_v5_template_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"template",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
api_v5_template_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"template",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// api_v5_template_default => /api/v5/template/:template_id/default(.:format)
  // function(template_id, options)
  api_v5_template_default_path: Utils.route([["template_id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"template",false],[2,[7,"/",false],[2,[3,"template_id",false],[2,[7,"/",false],[2,[6,"default",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
api_v5_template_default_url: Utils.route([["template_id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"template",false],[2,[7,"/",false],[2,[3,"template_id",false],[2,[7,"/",false],[2,[6,"default",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// api_v5_template_index => /api/v5/template(.:format)
  // function(options)
  api_v5_template_index_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"template",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
api_v5_template_index_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"template",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// api_v5_transcription => /api/v5/transcriptions/:id(.:format)
  // function(id, options)
  api_v5_transcription_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"transcriptions",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
api_v5_transcription_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"transcriptions",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// api_v5_transcriptions => /api/v5/transcriptions(.:format)
  // function(options)
  api_v5_transcriptions_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"transcriptions",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
api_v5_transcriptions_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"transcriptions",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// api_v5_user => /api/v5/users/:id(.:format)
  // function(id, options)
  api_v5_user_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"users",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
api_v5_user_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"users",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// api_v5_users => /api/v5/users(.:format)
  // function(options)
  api_v5_users_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"users",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
api_v5_users_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"users",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// apply_api_v5_template => /api/v5/template/:id/apply(.:format)
  // function(id, options)
  apply_api_v5_template_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"template",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"apply",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
apply_api_v5_template_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"template",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"apply",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// auth => /auth/:provider/callback(.:format)
  // function(provider, options)
  auth_path: Utils.route([["provider",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"auth",false],[2,[7,"/",false],[2,[3,"provider",false],[2,[7,"/",false],[2,[6,"callback",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
auth_url: Utils.route([["provider",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"auth",false],[2,[7,"/",false],[2,[3,"provider",false],[2,[7,"/",false],[2,[6,"callback",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// authentication_settings_organization => /organizations/:id/settings/authentication(.:format)
  // function(id, options)
  authentication_settings_organization_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"settings",false],[2,[7,"/",false],[2,[6,"authentication",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
authentication_settings_organization_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"settings",false],[2,[7,"/",false],[2,[6,"authentication",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// authorization => /authorization(.:format)
  // function(options)
  authorization_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"authorization",false],[1,[2,[8,".",false],[3,"format",false]],false]]]),
authorization_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"authorization",false],[1,[2,[8,".",false],[3,"format",false]],false]]], true),
// autojoin_api_v5_users => /api/v5/users/autojoin(.:format)
  // function(options)
  autojoin_api_v5_users_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"users",false],[2,[7,"/",false],[2,[6,"autojoin",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
autojoin_api_v5_users_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"users",false],[2,[7,"/",false],[2,[6,"autojoin",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// billing_settings_organization => /organizations/:id/settings/billing(.:format)
  // function(id, options)
  billing_settings_organization_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"settings",false],[2,[7,"/",false],[2,[6,"billing",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
billing_settings_organization_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"settings",false],[2,[7,"/",false],[2,[6,"billing",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// bulk_api_v5_collection_items => /api/v5/collections/:collection_id/items/bulk(.:format)
  // function(collection_id, options)
  bulk_api_v5_collection_items_path: Utils.route([["collection_id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"collections",false],[2,[7,"/",false],[2,[3,"collection_id",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[6,"bulk",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]]]),
bulk_api_v5_collection_items_url: Utils.route([["collection_id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"collections",false],[2,[7,"/",false],[2,[3,"collection_id",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[6,"bulk",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]]], true),
// bulk_collections_organization => /organizations/:id/bulk_collections(.:format)
  // function(id, options)
  bulk_collections_organization_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"bulk_collections",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
bulk_collections_organization_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"bulk_collections",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// bulk_create_api_v4_collection_items => /api/v4/collection_items/bulk_create(.:format)
  // function(options)
  bulk_create_api_v4_collection_items_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"collection_items",false],[2,[7,"/",false],[2,[6,"bulk_create",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
bulk_create_api_v4_collection_items_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"collection_items",false],[2,[7,"/",false],[2,[6,"bulk_create",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// bulk_destroy_api_v4_collection_items => /api/v4/collection_items/bulk_destroy(.:format)
  // function(options)
  bulk_destroy_api_v4_collection_items_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"collection_items",false],[2,[7,"/",false],[2,[6,"bulk_destroy",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
bulk_destroy_api_v4_collection_items_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"collection_items",false],[2,[7,"/",false],[2,[6,"bulk_destroy",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// bulk_destroy_api_v4_items => /api/v4/items/bulk_destroy(.:format)
  // function(options)
  bulk_destroy_api_v4_items_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[6,"bulk_destroy",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
bulk_destroy_api_v4_items_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[6,"bulk_destroy",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// bulk_destroy_api_v5_items => /api/v5/items/bulk_destroy(.:format)
  // function(options)
  bulk_destroy_api_v5_items_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[6,"bulk_destroy",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
bulk_destroy_api_v5_items_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[6,"bulk_destroy",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// bulk_favorite_api_v4_items => /api/v4/items/bulk_favorite(.:format)
  // function(options)
  bulk_favorite_api_v4_items_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[6,"bulk_favorite",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
bulk_favorite_api_v4_items_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[6,"bulk_favorite",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// bulk_favorite_api_v5_items => /api/v5/items/bulk_favorite(.:format)
  // function(options)
  bulk_favorite_api_v5_items_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[6,"bulk_favorite",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
bulk_favorite_api_v5_items_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[6,"bulk_favorite",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// change_order_api_v5_collection => /api/v5/collections/:id/change_order(.:format)
  // function(id, options)
  change_order_api_v5_collection_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"collections",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"change_order",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
change_order_api_v5_collection_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"collections",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"change_order",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// click_call_to_action => /call_to_actions/:slug/click(.:format)
  // function(slug, options)
  click_call_to_action_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"call_to_actions",false],[2,[7,"/",false],[2,[3,"slug",false],[2,[7,"/",false],[2,[6,"click",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
click_call_to_action_url: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"call_to_actions",false],[2,[7,"/",false],[2,[3,"slug",false],[2,[7,"/",false],[2,[6,"click",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// client_login => /client_login(.:format)
  // function(options)
  client_login_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"client_login",false],[1,[2,[8,".",false],[3,"format",false]],false]]]),
client_login_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"client_login",false],[1,[2,[8,".",false],[3,"format",false]],false]]], true),
// client_login_landing => /client_login_landing(.:format)
  // function(options)
  client_login_landing_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"client_login_landing",false],[1,[2,[8,".",false],[3,"format",false]],false]]]),
client_login_landing_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"client_login_landing",false],[1,[2,[8,".",false],[3,"format",false]],false]]], true),
// collection => /collections/:id(.:format)
  // function(id, options)
  collection_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"collections",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
collection_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"collections",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]], true),
// collections => /collections(.:format)
  // function(options)
  collections_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"collections",false],[1,[2,[8,".",false],[3,"format",false]],false]]]),
collections_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"collections",false],[1,[2,[8,".",false],[3,"format",false]],false]]], true),
// collections_organization => /organizations/:id/collections(.:format)
  // function(id, options)
  collections_organization_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"collections",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
collections_organization_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"collections",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// completed_api_v4_item => /api/v4/items/:id/completed(.:format)
  // function(id, options)
  completed_api_v4_item_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"completed",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
completed_api_v4_item_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"completed",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// completed_api_v5_item => /api/v5/items/:id/completed(.:format)
  // function(id, options)
  completed_api_v5_item_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"completed",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
completed_api_v5_item_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"completed",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// confirm_account_api_v4_accounts => /api/v4/account/confirm/:confirmation_token(.:format)
  // function(confirmation_token, options)
  confirm_account_api_v4_accounts_path: Utils.route([["confirmation_token",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"account",false],[2,[7,"/",false],[2,[6,"confirm",false],[2,[7,"/",false],[2,[3,"confirmation_token",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
confirm_account_api_v4_accounts_url: Utils.route([["confirmation_token",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"account",false],[2,[7,"/",false],[2,[6,"confirm",false],[2,[7,"/",false],[2,[3,"confirmation_token",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// confirm_api_v5_users => /api/v5/users/confirm(.:format)
  // function(options)
  confirm_api_v5_users_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"users",false],[2,[7,"/",false],[2,[6,"confirm",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
confirm_api_v5_users_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"users",false],[2,[7,"/",false],[2,[6,"confirm",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// copy_item => /items/:id/copy(.:format)
  // function(id, options)
  copy_item_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"copy",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
copy_item_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"copy",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// customize_settings_organization => /organizations/:id/settings/customize(.:format)
  // function(id, options)
  customize_settings_organization_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"settings",false],[2,[7,"/",false],[2,[6,"customize",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
customize_settings_organization_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"settings",false],[2,[7,"/",false],[2,[6,"customize",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// dashboard => /dashboard(.:format)
  // function(options)
  dashboard_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"dashboard",false],[1,[2,[8,".",false],[3,"format",false]],false]]]),
dashboard_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"dashboard",false],[1,[2,[8,".",false],[3,"format",false]],false]]], true),
// dashboard_activity => /dashboard/activity(.:format)
  // function(options)
  dashboard_activity_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"dashboard",false],[2,[7,"/",false],[2,[6,"activity",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
dashboard_activity_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"dashboard",false],[2,[7,"/",false],[2,[6,"activity",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]], true),
// dashboard_empty_trash => /dashboard/empty_trash(.:format)
  // function(options)
  dashboard_empty_trash_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"dashboard",false],[2,[7,"/",false],[2,[6,"empty_trash",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
dashboard_empty_trash_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"dashboard",false],[2,[7,"/",false],[2,[6,"empty_trash",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]], true),
// dashboard_login => /dashboard/login(.:format)
  // function(options)
  dashboard_login_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"dashboard",false],[2,[7,"/",false],[2,[6,"login",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
dashboard_login_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"dashboard",false],[2,[7,"/",false],[2,[6,"login",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]], true),
// dashboard_search => /dashboard/search(.:format)
  // function(options)
  dashboard_search_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"dashboard",false],[2,[7,"/",false],[2,[6,"search",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
dashboard_search_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"dashboard",false],[2,[7,"/",false],[2,[6,"search",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]], true),
// dashboard_trash => /dashboard/trash(.:format)
  // function(options)
  dashboard_trash_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"dashboard",false],[2,[7,"/",false],[2,[6,"trash",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
dashboard_trash_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"dashboard",false],[2,[7,"/",false],[2,[6,"trash",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]], true),
// disallow_tracking => /track(.:format)
  // function(options)
  disallow_tracking_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"track",false],[1,[2,[8,".",false],[3,"format",false]],false]]]),
disallow_tracking_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"track",false],[1,[2,[8,".",false],[3,"format",false]],false]]], true),
// domain_info => /domain/info(.:format)
  // function(options)
  domain_info_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"domain",false],[2,[7,"/",false],[2,[6,"info",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
domain_info_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"domain",false],[2,[7,"/",false],[2,[6,"info",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]], true),
// edit_api_v4_collection_items => /api/v4/collection_items/edit(.:format)
  // function(options)
  edit_api_v4_collection_items_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"collection_items",false],[2,[7,"/",false],[2,[6,"edit",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
edit_api_v4_collection_items_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"collection_items",false],[2,[7,"/",false],[2,[6,"edit",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// edit_api_v5_item => /api/v5/items/:id/edit(.:format)
  // function(id, options)
  edit_api_v5_item_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"edit",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
edit_api_v5_item_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"edit",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// edit_api_v5_organization_referral => /api/v5/organization_referrals/:id/edit(.:format)
  // function(id, options)
  edit_api_v5_organization_referral_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organization_referrals",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"edit",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
edit_api_v5_organization_referral_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organization_referrals",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"edit",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// favorite_api_v4_item => /api/v4/items/:id/favorite(.:format)
  // function(id, options)
  favorite_api_v4_item_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"favorite",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
favorite_api_v4_item_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"favorite",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// favorite_api_v5_item => /api/v5/items/:id/favorite(.:format)
  // function(id, options)
  favorite_api_v5_item_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"favorite",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
favorite_api_v5_item_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"favorite",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// forgot_password_api_v4_accounts => /api/v4/account/forgot_password(.:format)
  // function(options)
  forgot_password_api_v4_accounts_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"account",false],[2,[7,"/",false],[2,[6,"forgot_password",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
forgot_password_api_v4_accounts_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"account",false],[2,[7,"/",false],[2,[6,"forgot_password",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// forgot_password_api_v5_users => /api/v5/users/forgot_password(.:format)
  // function(options)
  forgot_password_api_v5_users_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"users",false],[2,[7,"/",false],[2,[6,"forgot_password",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
forgot_password_api_v5_users_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"users",false],[2,[7,"/",false],[2,[6,"forgot_password",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// forms_api_v4_item => /api/v4/items/:id/forms(.:format)
  // function(id, options)
  forms_api_v4_item_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"forms",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
forms_api_v4_item_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"forms",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// google_sign_in_api_v5_users => /api/v5/users/google_sign_in(.:format)
  // function(options)
  google_sign_in_api_v5_users_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"users",false],[2,[7,"/",false],[2,[6,"google_sign_in",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
google_sign_in_api_v5_users_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"users",false],[2,[7,"/",false],[2,[6,"google_sign_in",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// health_api_integrations_pingdom_index => /api/integrations/pingdom/health(.:format)
  // function(options)
  health_api_integrations_pingdom_index_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"integrations",false],[2,[7,"/",false],[2,[6,"pingdom",false],[2,[7,"/",false],[2,[6,"health",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
health_api_integrations_pingdom_index_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"integrations",false],[2,[7,"/",false],[2,[6,"pingdom",false],[2,[7,"/",false],[2,[6,"health",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// items_api_v5_collection => /api/v5/collections/:id/items(.:format)
  // function(id, options)
  items_api_v5_collection_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"collections",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"items",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
items_api_v5_collection_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"collections",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"items",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// license_request => /license/request(.:format)
  // function(options)
  license_request_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"license",false],[2,[7,"/",false],[2,[6,"request",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
license_request_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"license",false],[2,[7,"/",false],[2,[6,"request",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]], true),
// license_request_api_v5_organization => /api/v5/organizations/:id/license_request(.:format)
  // function(id, options)
  license_request_api_v5_organization_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"license_request",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
license_request_api_v5_organization_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"license_request",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// license_requests_api_v5_organization => /api/v5/organizations/:id/license_requests(.:format)
  // function(id, options)
  license_requests_api_v5_organization_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"license_requests",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
license_requests_api_v5_organization_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"license_requests",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// login => /login(.:format)
  // function(options)
  login_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"login",false],[1,[2,[8,".",false],[3,"format",false]],false]]]),
login_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"login",false],[1,[2,[8,".",false],[3,"format",false]],false]]], true),
// login_accounts => /accounts/login(.:format)
  // function(options)
  login_accounts_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"accounts",false],[2,[7,"/",false],[2,[6,"login",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
login_accounts_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"accounts",false],[2,[7,"/",false],[2,[6,"login",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]], true),
// login_api_v5_users => /api/v5/users/login(.:format)
  // function(options)
  login_api_v5_users_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"users",false],[2,[7,"/",false],[2,[6,"login",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
login_api_v5_users_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"users",false],[2,[7,"/",false],[2,[6,"login",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// me_api_v4_accounts => /api/v4/account(.:format)
  // function(options)
  me_api_v4_accounts_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"account",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
me_api_v4_accounts_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"account",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// microsoft_teams_connect_api_v5_users => /api/v5/users/microsoft_teams_connect(.:format)
  // function(options)
  microsoft_teams_connect_api_v5_users_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"users",false],[2,[7,"/",false],[2,[6,"microsoft_teams_connect",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
microsoft_teams_connect_api_v5_users_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"users",false],[2,[7,"/",false],[2,[6,"microsoft_teams_connect",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// new_api_v4_collection_items => /api/v4/collection_items/new(.:format)
  // function(options)
  new_api_v4_collection_items_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"collection_items",false],[2,[7,"/",false],[2,[6,"new",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
new_api_v4_collection_items_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"collection_items",false],[2,[7,"/",false],[2,[6,"new",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// new_api_v5_item => /api/v5/items/new(.:format)
  // function(options)
  new_api_v5_item_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[6,"new",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
new_api_v5_item_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[6,"new",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// new_api_v5_organization_referral => /api/v5/organization_referrals/new(.:format)
  // function(options)
  new_api_v5_organization_referral_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organization_referrals",false],[2,[7,"/",false],[2,[6,"new",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
new_api_v5_organization_referral_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organization_referrals",false],[2,[7,"/",false],[2,[6,"new",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// oembed_info_api_v4_item => /api/v4/items/:id/oembed_info(.:format)
  // function(id, options)
  oembed_info_api_v4_item_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"oembed_info",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
oembed_info_api_v4_item_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"oembed_info",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// onboarding => /onboarding(/*step)(.:format)
  // function(options)
  onboarding_path: Utils.route([["step",false],["format",false]], {}, [2,[7,"/",false],[2,[6,"onboarding",false],[2,[1,[2,[7,"/",false],[5,[3,"step",false],false]],false],[1,[2,[8,".",false],[3,"format",false]],false]]]]),
onboarding_url: Utils.route([["step",false],["format",false]], {}, [2,[7,"/",false],[2,[6,"onboarding",false],[2,[1,[2,[7,"/",false],[5,[3,"step",false],false]],false],[1,[2,[8,".",false],[3,"format",false]],false]]]], true),
// onboarding_download_url => /onboarding/download(.:format)
  // function(options)
  onboarding_download_url_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"onboarding",false],[2,[7,"/",false],[2,[6,"download",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
onboarding_download_url_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"onboarding",false],[2,[7,"/",false],[2,[6,"download",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]], true),
// organization => /organizations/:id(.:format)
  // function(id, options)
  organization_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
organization_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]], true),
// payment_settings_organization => /organizations/:id/settings/payment(.:format)
  // function(id, options)
  payment_settings_organization_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"settings",false],[2,[7,"/",false],[2,[6,"payment",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
payment_settings_organization_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"organizations",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"settings",false],[2,[7,"/",false],[2,[6,"payment",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// plans => /plans(.:format)
  // function(options)
  plans_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"plans",false],[1,[2,[8,".",false],[3,"format",false]],false]]]),
plans_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"plans",false],[1,[2,[8,".",false],[3,"format",false]],false]]], true),
// preferences_api_v5_users => /api/v5/users/preferences(.:format)
  // function(options)
  preferences_api_v5_users_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"users",false],[2,[7,"/",false],[2,[6,"preferences",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
preferences_api_v5_users_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"users",false],[2,[7,"/",false],[2,[6,"preferences",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// pricing => /pricing(.:format)
  // function(options)
  pricing_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"pricing",false],[1,[2,[8,".",false],[3,"format",false]],false]]]),
pricing_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"pricing",false],[1,[2,[8,".",false],[3,"format",false]],false]]], true),
// purchase => /purchase(.:format)
  // function(options)
  purchase_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"purchase",false],[1,[2,[8,".",false],[3,"format",false]],false]]]),
purchase_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"purchase",false],[1,[2,[8,".",false],[3,"format",false]],false]]], true),
// refresh_token_api_v4_accounts => /api/v4/account/refresh_token(.:format)
  // function(options)
  refresh_token_api_v4_accounts_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"account",false],[2,[7,"/",false],[2,[6,"refresh_token",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
refresh_token_api_v4_accounts_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"account",false],[2,[7,"/",false],[2,[6,"refresh_token",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// reset_password_api_v4_accounts => /api/v4/account/reset_password(.:format)
  // function(options)
  reset_password_api_v4_accounts_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"account",false],[2,[7,"/",false],[2,[6,"reset_password",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
reset_password_api_v4_accounts_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"account",false],[2,[7,"/",false],[2,[6,"reset_password",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// restore_api_v4_item => /api/v4/items/:id/restore(.:format)
  // function(id, options)
  restore_api_v4_item_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"restore",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
restore_api_v4_item_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"restore",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// restore_api_v5_item => /api/v5/items/:id/restore(.:format)
  // function(id, options)
  restore_api_v5_item_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"restore",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
restore_api_v5_item_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"restore",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// retry_api_v5_transcription => /api/v5/transcriptions/:id/retry(.:format)
  // function(id, options)
  retry_api_v5_transcription_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"transcriptions",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"retry",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
retry_api_v5_transcription_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"transcriptions",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"retry",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// search_api_v5_organization_users => /api/v5/organization/users/search(.:format)
  // function(options)
  search_api_v5_organization_users_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organization",false],[2,[7,"/",false],[2,[6,"users",false],[2,[7,"/",false],[2,[6,"search",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
search_api_v5_organization_users_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"organization",false],[2,[7,"/",false],[2,[6,"users",false],[2,[7,"/",false],[2,[6,"search",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// send_confirmation_api_v4_accounts => /api/v4/account/send_confirmation(.:format)
  // function(options)
  send_confirmation_api_v4_accounts_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"account",false],[2,[7,"/",false],[2,[6,"send_confirmation",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
send_confirmation_api_v4_accounts_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"account",false],[2,[7,"/",false],[2,[6,"send_confirmation",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// send_confirmation_api_v5_users => /api/v5/users/send_confirmation(.:format)
  // function(options)
  send_confirmation_api_v5_users_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"users",false],[2,[7,"/",false],[2,[6,"send_confirmation",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
send_confirmation_api_v5_users_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"users",false],[2,[7,"/",false],[2,[6,"send_confirmation",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// share_api_v4_item => /api/v4/items/:id/share(.:format)
  // function(id, options)
  share_api_v4_item_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"share",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
share_api_v4_item_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"share",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// show_tracking => /track(.:format)
  // function(options)
  show_tracking_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"track",false],[1,[2,[8,".",false],[3,"format",false]],false]]]),
show_tracking_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"track",false],[1,[2,[8,".",false],[3,"format",false]],false]]], true),
// slack_connect_api_v5_users => /api/v5/users/slack_connect(.:format)
  // function(options)
  slack_connect_api_v5_users_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"users",false],[2,[7,"/",false],[2,[6,"slack_connect",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
slack_connect_api_v5_users_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"users",false],[2,[7,"/",false],[2,[6,"slack_connect",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// slack_oauth_api_v5_users => /api/v5/users/slack_oauth(.:format)
  // function(options)
  slack_oauth_api_v5_users_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"users",false],[2,[7,"/",false],[2,[6,"slack_oauth",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
slack_oauth_api_v5_users_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"users",false],[2,[7,"/",false],[2,[6,"slack_oauth",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// subscriptions_cancel => /subscriptions/cancel(.:format)
  // function(options)
  subscriptions_cancel_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"subscriptions",false],[2,[7,"/",false],[2,[6,"cancel",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
subscriptions_cancel_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"subscriptions",false],[2,[7,"/",false],[2,[6,"cancel",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]], true),
// subscriptions_create => /subscriptions/create(.:format)
  // function(options)
  subscriptions_create_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"subscriptions",false],[2,[7,"/",false],[2,[6,"create",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
subscriptions_create_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"subscriptions",false],[2,[7,"/",false],[2,[6,"create",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]], true),
// team_trial_upsell_api_v5_subscriptions => /api/v5/subscriptions/team_trial_upsell(.:format)
  // function(options)
  team_trial_upsell_api_v5_subscriptions_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"subscriptions",false],[2,[7,"/",false],[2,[6,"team_trial_upsell",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
team_trial_upsell_api_v5_subscriptions_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"subscriptions",false],[2,[7,"/",false],[2,[6,"team_trial_upsell",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// toggle_disabled_api_v4_item => /api/v4/items/:id/toggle_disabled(.:format)
  // function(id, options)
  toggle_disabled_api_v4_item_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"toggle_disabled",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
toggle_disabled_api_v4_item_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"toggle_disabled",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// toggle_disabled_api_v5_item => /api/v5/items/:id/toggle_disabled(.:format)
  // function(id, options)
  toggle_disabled_api_v5_item_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"toggle_disabled",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
toggle_disabled_api_v5_item_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"toggle_disabled",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// toggle_show_hidden_collections_api_v5_users => /api/v5/users/toggle_show_hidden_collections(.:format)
  // function(options)
  toggle_show_hidden_collections_api_v5_users_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"users",false],[2,[7,"/",false],[2,[6,"toggle_show_hidden_collections",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
toggle_show_hidden_collections_api_v5_users_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"users",false],[2,[7,"/",false],[2,[6,"toggle_show_hidden_collections",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// top_user_dismiss => /dimsiss/team-upgrade(.:format)
  // function(options)
  top_user_dismiss_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"dimsiss",false],[2,[7,"/",false],[2,[6,"team-upgrade",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
top_user_dismiss_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"dimsiss",false],[2,[7,"/",false],[2,[6,"team-upgrade",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]], true),
// top_user_start_trial => /start-team(.:format)
  // function(options)
  top_user_start_trial_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"start-team",false],[1,[2,[8,".",false],[3,"format",false]],false]]]),
top_user_start_trial_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"start-team",false],[1,[2,[8,".",false],[3,"format",false]],false]]], true),
// track_view => /track/view(.:format)
  // function(options)
  track_view_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"track",false],[2,[7,"/",false],[2,[6,"view",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
track_view_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"track",false],[2,[7,"/",false],[2,[6,"view",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]], true),
// tracking => /tracking(.:format)
  // function(options)
  tracking_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"tracking",false],[1,[2,[8,".",false],[3,"format",false]],false]]]),
tracking_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"tracking",false],[1,[2,[8,".",false],[3,"format",false]],false]]], true),
// tracking_error => /tracking/error(.:format)
  // function(options)
  tracking_error_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"tracking",false],[2,[7,"/",false],[2,[6,"error",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
tracking_error_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"tracking",false],[2,[7,"/",false],[2,[6,"error",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]], true),
// transcoded_callback_api_v4_item => /api/v4/items/:id/transcoded_callback(.:format)
  // function(id, options)
  transcoded_callback_api_v4_item_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"transcoded_callback",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
transcoded_callback_api_v4_item_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"transcoded_callback",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// transcoded_callback_api_v5_item => /api/v5/items/:id/transcoded_callback(.:format)
  // function(id, options)
  transcoded_callback_api_v5_item_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"transcoded_callback",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
transcoded_callback_api_v5_item_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"transcoded_callback",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// unhide_api_v4_collection => /api/v4/collections/:id/unhide(.:format)
  // function(id, options)
  unhide_api_v4_collection_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"collections",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"unhide",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
unhide_api_v4_collection_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"collections",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"unhide",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// unhide_api_v5_collection => /api/v5/collections/:id/unhide(.:format)
  // function(id, options)
  unhide_api_v5_collection_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"collections",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"unhide",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
unhide_api_v5_collection_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"collections",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"unhide",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// update_stats_api_v5_item => /api/v5/items/:id/update_stats(.:format)
  // function(id, options)
  update_stats_api_v5_item_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"update_stats",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
update_stats_api_v5_item_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"update_stats",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// update_unviewed_notifications_api_v5_client_notifications => /api/v5/client_notifications/update_unviewed_notifications(.:format)
  // function(options)
  update_unviewed_notifications_api_v5_client_notifications_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"client_notifications",false],[2,[7,"/",false],[2,[6,"update_unviewed_notifications",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
update_unviewed_notifications_api_v5_client_notifications_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"client_notifications",false],[2,[7,"/",false],[2,[6,"update_unviewed_notifications",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// upload_api_v4_item => /api/v4/items/:id/upload(.:format)
  // function(id, options)
  upload_api_v4_item_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"upload",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
upload_api_v4_item_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"upload",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// upload_api_v5_item => /api/v5/items/:id/upload(.:format)
  // function(id, options)
  upload_api_v5_item_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"upload",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
upload_api_v5_item_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"upload",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// user_private_api_v4_accounts => /api/v4/account/:id(.:format)
  // function(id, options)
  user_private_api_v4_accounts_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"account",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
user_private_api_v4_accounts_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"account",false],[2,[7,"/",false],[2,[3,"id",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// verify_email_collection => /collections/:id/verify_email(.:format)
  // function(id, options)
  verify_email_collection_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"collections",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"verify_email",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
verify_email_collection_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"collections",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"verify_email",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// verify_password_collection => /collections/:id/verify_password(.:format)
  // function(id, options)
  verify_password_collection_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"collections",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"verify_password",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
verify_password_collection_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"collections",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"verify_password",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// view_api_v4_client_notification => /api/v4/client_notifications/:id/view(.:format)
  // function(id, options)
  view_api_v4_client_notification_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"client_notifications",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"view",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
view_api_v4_client_notification_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"client_notifications",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"view",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// viewed_api_v4_collection => /api/v4/collections/:id/viewed(.:format)
  // function(id, options)
  viewed_api_v4_collection_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"collections",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"viewed",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
viewed_api_v4_collection_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"collections",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"viewed",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// viewed_api_v4_item => /api/v4/items/:id/viewed(.:format)
  // function(id, options)
  viewed_api_v4_item_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"viewed",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
viewed_api_v4_item_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"viewed",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// viewed_api_v5_collection => /api/v5/collections/:id/viewed(.:format)
  // function(id, options)
  viewed_api_v5_collection_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"collections",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"viewed",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
viewed_api_v5_collection_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"collections",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"viewed",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// viewed_api_v5_item => /api/v5/items/:id/viewed(.:format)
  // function(id, options)
  viewed_api_v5_item_path: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"viewed",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]]),
viewed_api_v5_item_url: Utils.route([["id",true],["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[3,"id",false],[2,[7,"/",false],[2,[6,"viewed",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]]], true),
// viewer_download_item => /:slug/download/*filename(.:format)
  // function(slug, filename, options)
  viewer_download_item_path: Utils.route([["slug",true],["filename",true],["format",false]], {}, [2,[7,"/",false],[2,[3,"slug",false],[2,[7,"/",false],[2,[6,"download",false],[2,[7,"/",false],[2,[5,[3,"filename",false],false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]),
viewer_download_item_url: Utils.route([["slug",true],["filename",true],["format",false]], {}, [2,[7,"/",false],[2,[3,"slug",false],[2,[7,"/",false],[2,[6,"download",false],[2,[7,"/",false],[2,[5,[3,"filename",false],false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]], true),
// viewer_verify_email => /:slug/verify_email(.:format)
  // function(slug, options)
  viewer_verify_email_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[3,"slug",false],[2,[7,"/",false],[2,[6,"verify_email",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
viewer_verify_email_url: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[3,"slug",false],[2,[7,"/",false],[2,[6,"verify_email",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]], true),
// viewer_verify_password => /:slug/verify_password(.:format)
  // function(slug, options)
  viewer_verify_password_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[3,"slug",false],[2,[7,"/",false],[2,[6,"verify_password",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]),
viewer_verify_password_url: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[3,"slug",false],[2,[7,"/",false],[2,[6,"verify_password",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]], true),
// viewer_view_item => /:slug(.:format)
  // function(slug, options)
  viewer_view_item_path: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]]),
viewer_view_item_url: Utils.route([["slug",true],["format",false]], {}, [2,[7,"/",false],[2,[3,"slug",false],[1,[2,[8,".",false],[3,"format",false]],false]]], true),
// zip_drops_api_v4_items => /api/v4/items/zip_drops(.:format)
  // function(options)
  zip_drops_api_v4_items_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[6,"zip_drops",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
zip_drops_api_v4_items_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v4",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[6,"zip_drops",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true),
// zip_drops_api_v5_items => /api/v5/items/zip_drops(.:format)
  // function(options)
  zip_drops_api_v5_items_path: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[6,"zip_drops",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]]),
zip_drops_api_v5_items_url: Utils.route([["format",false]], {}, [2,[7,"/",false],[2,[6,"api",false],[2,[7,"/",false],[2,[6,"v5",false],[2,[7,"/",false],[2,[6,"items",false],[2,[7,"/",false],[2,[6,"zip_drops",false],[1,[2,[8,".",false],[3,"format",false]],false]]]]]]]]], true)}
;
      routes.configure = function(config) {
        return Utils.configure(config);
      };
      routes.config = function() {
        return Utils.config();
      };
      routes.default_serializer = function(object, prefix) {
        return Utils.default_serializer(object, prefix);
      };
      return Object.assign({
        "default": routes
      }, routes);
    }
  };

  result = Utils.make();

  if (typeof define === "function" && define.amd) {
    define([], function() {
      return result;
    });
  } else if (typeof module !== "undefined" && module !== null) {
    try {
      module.exports = result;
    } catch (error1) {
      error = error1;
      if (error.name !== 'TypeError') {
        throw error;
      }
    }
  } else {
    Utils.namespace(this, null, result);
  }

  return result;

}).call(this);
;
  const url = routes.tracking_path();

  http.open("POST", url, true);

  http.setRequestHeader("Content-type", "application/json");

  http.send(JSON.stringify({ event, ...params }));
}

jQuery(function() {
  $('.role-select').change(function(e) {
    let $form = $(this).parents('form')[0];
    Rails.fire($form, 'submit');
  });

  $('.hide-collapse').click(function(e) {
    $('.collapse').collapse('hide');
  });

  $('.system-domain-radio').change(function(e) {
    $('#share-domains input#domain_name').val(e.target.dataset.domain);
  });

  $('.custom-domain-radio').change(function(e) {
    $('#share-domains input#domain_name').val('');
  });

  $('input[name="ssl_type"]').change(function(e) {
    $('input[name="domain_name"]').attr('required', false);
    $('input.custom-certificate-file').attr('required', false);
    $('#custom-domain-submit').show();
    $('#remove-custom-domain').hide();

    switch (e.target.value) {
      case 'default':
        $('#custom-domain-submit').hide();
        $('#remove-custom-domain').show();
        $('.submit-custom-domain').removeAttr('data-confirm');
        break;
      case 'letsencrypt':
        $('input[name="domain_name"]').attr('required', true);
        break;
      case 'custom':
        $('input.custom-certificate-file').attr('required', true);
        break;
    }
  });

  $('#auth_form').submit(function(e) {
    if($('.form-check-input:checked').length === 0) {
      $('#no_auth_selected').removeClass('invisible');

      return false;
    }
  });
  $('#limit_workspaces').change(function(e) {
    if($('#name').attr('required') !== undefined) {
      $('#name').removeAttr('required');
    } else {
      $('#name').attr('required', 'required');
    }
  });

  $('#limit_form').submit(function(e) {
    e.preventDefault();
    $.ajax({
      method: 'put',
      url: $(this).attr('action'),
      data: {
        limit_workspaces: $('#limit_workspaces').is(':checked')
      },
      success: function(e) {
        $('.alert-success')
          .show()
          .text(e.message);
      },
      failure: function(e) {
        $('.alert-danger')
          .show()
          .text(e.message);
      }
    })

  });
});
(function($) {
  $("a#password-login").click(function(e) {
    $("form#login-form").show();
    $("form#link-form").hide();
  });

  $("a#link-login").click(function(e) {
    $("form#login-form").hide();
    $("form#link-form").show();
  });

  // TODO: Toggling requirements for the password causes tests failure; temporarily switched off until tests are fixed.

  // $("input#password.input-signup-password").on("focus", function(e) {
  //   $("#text-password-requirements").show();
  // });

  // $("input#password.input-signup-password").on("blur", function(e) {
  //   $("#text-password-requirements").hide();
  // });

  // $("#text-password-requirements").hide();
})(jQuery);
const FREE_EMAIL_DOMAINS = [
  "comcast.net",
  "googlemail.com",
  "hotmail.fr",
  "mail.ru",
  "ymail.com",
  "qq.com",
  "gmx.de",
  "yahoo.co.uk",
  "web.de",
  "hotmail.it",
  "yahoo.fr",
  "163.com",
  "sbcglobal.net",
  "libero.it",
  "orange.fr",
  "att.net",
  "verizon.net",
  "btinternet.com",
  "yandex.ru",
  "free.fr",
  "naver.com",
  "bluewin.ch",
  "yahoo.it",
  "t-online.de",
  "live.co.uk",
  "alice.it",
  "cox.net",
  "dent.com",
  "mail.com",
  "yahoo.de",
  "yahoo.com.br",
  "live.fr",
  "rocketmail.com",
  "hotmail.de",
  "wanadoo.fr",
  "hanmail.net",
  "aim.com",
  "bellsouth.net",
  "yahoo.es",
  "126.com",
  "gmx.net",
  "yahoo.co.id",
  "sky.com",
  "nate.com",
  "protonmail.com",
  "live.nl",
  "yahoo.co.in",
  "yahoo.co.jp",
  "tiscali.it",
  "live.it",
  "telenet.be",
  "hotmail.es",
  "email.com",
  "gmx.ch",
  "uol.com.br",
  "yahoo.ca",
  "gmx.com",
  "datadoghq.com",
  "charter.net",
  "yahoo.com.tw",
  "bigpond.com",
  "cloud.com",
  "optonline.net",
  "wp.pl",
  "shaw.ca",
  "sfr.fr",
  "squarespace.com",
  "laposte.net",
  "earthlink.net",
  "sina.com",
  "seznam.cz",
  "i.softbank.jp",
  "bk.ru",
  "gmx.at",
  "yahoo.com.au",
  "outreach.io",
  "windowslive.com",
  "yahoo.com.hk",
  "live.de",
  "rogers.com",
  "yahoo.com.mx",
  "virgilio.it",
  "terra.com.br",
  "live.ca",
  "fastwebnet.it",
  "freenet.de",
  "gamil.com",
  "arcor.de",
  "rambler.ru",
  "live.com.au",
  "skynet.be",
  "tin.it",
  "rediffmail.com",
  "ntlworld.com",
  "ezweb.ne.jp",
  "gmail.com",
  "abv.bg",
  "yahoo.com.cn",
];

jQuery.fn.signupFormValidate = function() {
  const f = this;

  $('[data-toggle="popover"]').popover("hide");

  f.on("submit", (e) => {
    const domain = f
      .find("#email")
      .val()
      .split("@")
      .pop();

    // process to normal validation
    if (!domain || domain.length === 0) {
      return;
    }

    // search email domain in domain list
    if (FREE_EMAIL_DOMAINS.indexOf(domain) === -1) {
      return;
    }

    // display message
    e.preventDefault();
    e.stopPropagation();

    $('[data-toggle="popover"]').popover("show");
  });
};
(function($) {
  const appendModalErrors = errors => {
    let errorsArray = Array.isArray(errors) ? errors : [errors];
    for (let error of errorsArray) {
      $(`<li>${error}</li>`).appendTo('.modal.show ul.errors');
    }
  };

  const parsedResponseErrors = function(api_version, errors) {
    if(api_version > 4) {
      return errors.map(function(e){ return e.detail }).join('\n');
    }else{
      return errors.join('\n');
    }
  }


  const toggleFormSpinner = form => {
    form.find('.spinner').remove();
    form.find('input[type=submit]').toggle();
  };

  $('body').on('ajax:before', 'form', function(event) {
    let $submit = $(this).find('input[type=submit]');
    $submit.hide();
    $submit.after('<div class="spinner submit-spinner"></div>');
  });

  $('body').on('ajax:success', 'form, a.remote-link', function(event) {
    let detail = event.originalEvent.detail;
    let body = Array.isArray(detail[0]) ? detail[0][0] : detail[0];
    let xhr = detail[2];
    let isApiRequest =
      xhr.responseURL.indexOf('/api/') != -1 &&
      xhr.responseURL.indexOf('.js') == -1;
    let redirect_to = body.metadata && body.metadata.redirect_to;
    let skip_reload =
      body.skip_reload ||
      (!!body.metadata && body.metadata.skip_reload) ||
      !isApiRequest;
    let metadata_message =
      !!isApiRequest && body.metadata ? body.metadata.message : null;
    let message = (body.message && body.message.message) || body.message || metadata_message

    if(body["reload"] === true) {
      skip_reload = false;
    }

    if (redirect_to) {
      // if user just created an onboarding Org update current-org using localStorage
      if (/\/onboarding[\S]*#invite-members/.test(redirect_to) && !!body.hashid) {
        window.localStorage.setItem('current-org-id', body.hashid);
        window.dispatchEvent(new CustomEvent('current-org-id-localstorage-changed', {
          detail: {
            storage: localStorage.getItem('current-org-id')
          }
        }));
      };
      window.localStorage.setItem('flash', message);
      window.localStorage.setItem('vue-flash', JSON.stringify({ type: "success", message: message }));
      window.location = redirect_to;
      toggleFormSpinner($(this));
      var msgId = "id-" + Math.floor(Math.random() * 11).toString();
      $(`<div id="${msgId}">${message}</div>`).appendTo('#notice');
      $(`#${msgId}`).fadeOut(2000);
    } else if (skip_reload) {
      window.scrollTo(0, 0);
      if (!!message) {
        $('.alert-success')
          .show()
          .html($.parseHTML(message.toString()));
      }
      toggleFormSpinner($(this))
    } else {
      window.localStorage.setItem('flash', message);
      window.localStorage.setItem('vue-flash', JSON.stringify({ type: "success", message: message }));
      window.location.reload();
    }
  });

  $('body').on('ajax:error', 'form, a.remote-link', function(event) {
    window.scrollTo(0, 0);
    let detail = event.originalEvent.detail;
    let body = detail[0];
    let xhr = detail[2];
    let errors = body.message || "";
    let redirect_to = body.metadata && body.metadata.redirect_to;
    let api_version = (body && body.meta && body.meta.version) || 4;

    if ($('.modal.show ul.errors').length > 0) {
      $('.modal.show ul.errors').empty();
      appendModalErrors(errors);
      toggleFormSpinner($(this));
      return;
    }

    if (xhr && xhr.getResponseHeader("X-Flash")) {
      errors += '\n' + xhr.getResponseHeader("X-Flash");
    }

    if (redirect_to) {
      if (body.errors) {
        errors += parsedResponseErrors(api_version, body.errors)
      }
      window.localStorage.setItem(
        'flash',
        JSON.stringify({
          type: 'danger',
          message: errors,
        })
      );
      window.location = redirect_to;
      if (window.location.href.indexOf("#") != -1) {
        window.location.reload();
      }
    } else {
      if (body.errors) {
        errors += parsedResponseErrors(api_version, body.errors)
      }

      $('.modal').modal('hide');

      $('.alert-danger')
        .show()
        .html($.parseHTML(errors.toString()));

      $(this)
        .find('input[type=submit]')
        .show();

      $(this)
        .find("input[type=password]")
        .val("");

      $(this)
        .find('.spinner')
        .remove();
    }
  });
})(jQuery);
/* For admin/configuration and admin/organization
 */

function validJSON(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

/*
 * Set up the editor like this:
 *   <div id="myJson" contenteditable="true"></div>
 * 
 *   <form id="form-myJson">
 *     <input type="hidden" class="value" name="value" value="">
 *     <input id="btn-myJson" type="submit">
 *   </form>
 * 
 * Then attach the listeners with `setupJSONValidation(document.getElementById("form-myJson"))`
 */
function setupJSONValidation(editor) {
  const button = document.getElementById(`btn-${editor.id}`);
  const form = document.getElementById(`form-${editor.id}`);

  editor.addEventListener("input", function () {
    if (validJSON(editor.textContent)) {
      editor.classList.remove("invalid");
      editor.classList.add("valid");
      button.classList.remove("btn-disable");
    } else {
      editor.classList.remove("valid");
      editor.classList.add("invalid");
      button.classList.add("btn-disable");
    }
  }, false);

  form.addEventListener("submit", function (e) {
    form.getElementsByClassName("value")[0].value = JSON.stringify(JSON.parse(editor.textContent));
  });
}
;
(function($) {
  let flash;
  try {
    flash = JSON.parse(window.localStorage.getItem('flash'));
  } catch (e) {
    flash = window.localStorage.getItem('flash');
  }

  if (flash) {
    if (typeof flash === 'string') {
      const alertSuccess = $('.alert-success')[0];
      $(alertSuccess).show().text(flash);
    } else if (typeof flash == 'object') {
      const className = `.alert-${flash['type']}`;
      const alertFlash = $(className)[0];
      $(alertFlash).show().text(flash['message']);
      setTimeout(function() {
        $(className).fadeOut('slow');
      }, 2000);
    }
  }
  setTimeout(function() {
    $('.alert-success').fadeOut('slow');
  }, 2000);
  window.localStorage.removeItem('flash');
})(jQuery);
//! moment.js
//! version : 2.29.1
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com

;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    global.moment = factory()
}(this, (function () { 'use strict';

    var hookCallback;

    function hooks() {
        return hookCallback.apply(null, arguments);
    }

    // This is done to register the method called with moment()
    // without creating circular dependencies.
    function setHookCallback(callback) {
        hookCallback = callback;
    }

    function isArray(input) {
        return (
            input instanceof Array ||
            Object.prototype.toString.call(input) === '[object Array]'
        );
    }

    function isObject(input) {
        // IE8 will treat undefined and null as object if it wasn't for
        // input != null
        return (
            input != null &&
            Object.prototype.toString.call(input) === '[object Object]'
        );
    }

    function hasOwnProp(a, b) {
        return Object.prototype.hasOwnProperty.call(a, b);
    }

    function isObjectEmpty(obj) {
        if (Object.getOwnPropertyNames) {
            return Object.getOwnPropertyNames(obj).length === 0;
        } else {
            var k;
            for (k in obj) {
                if (hasOwnProp(obj, k)) {
                    return false;
                }
            }
            return true;
        }
    }

    function isUndefined(input) {
        return input === void 0;
    }

    function isNumber(input) {
        return (
            typeof input === 'number' ||
            Object.prototype.toString.call(input) === '[object Number]'
        );
    }

    function isDate(input) {
        return (
            input instanceof Date ||
            Object.prototype.toString.call(input) === '[object Date]'
        );
    }

    function map(arr, fn) {
        var res = [],
            i;
        for (i = 0; i < arr.length; ++i) {
            res.push(fn(arr[i], i));
        }
        return res;
    }

    function extend(a, b) {
        for (var i in b) {
            if (hasOwnProp(b, i)) {
                a[i] = b[i];
            }
        }

        if (hasOwnProp(b, 'toString')) {
            a.toString = b.toString;
        }

        if (hasOwnProp(b, 'valueOf')) {
            a.valueOf = b.valueOf;
        }

        return a;
    }

    function createUTC(input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, true).utc();
    }

    function defaultParsingFlags() {
        // We need to deep clone this object.
        return {
            empty: false,
            unusedTokens: [],
            unusedInput: [],
            overflow: -2,
            charsLeftOver: 0,
            nullInput: false,
            invalidEra: null,
            invalidMonth: null,
            invalidFormat: false,
            userInvalidated: false,
            iso: false,
            parsedDateParts: [],
            era: null,
            meridiem: null,
            rfc2822: false,
            weekdayMismatch: false,
        };
    }

    function getParsingFlags(m) {
        if (m._pf == null) {
            m._pf = defaultParsingFlags();
        }
        return m._pf;
    }

    var some;
    if (Array.prototype.some) {
        some = Array.prototype.some;
    } else {
        some = function (fun) {
            var t = Object(this),
                len = t.length >>> 0,
                i;

            for (i = 0; i < len; i++) {
                if (i in t && fun.call(this, t[i], i, t)) {
                    return true;
                }
            }

            return false;
        };
    }

    function isValid(m) {
        if (m._isValid == null) {
            var flags = getParsingFlags(m),
                parsedParts = some.call(flags.parsedDateParts, function (i) {
                    return i != null;
                }),
                isNowValid =
                    !isNaN(m._d.getTime()) &&
                    flags.overflow < 0 &&
                    !flags.empty &&
                    !flags.invalidEra &&
                    !flags.invalidMonth &&
                    !flags.invalidWeekday &&
                    !flags.weekdayMismatch &&
                    !flags.nullInput &&
                    !flags.invalidFormat &&
                    !flags.userInvalidated &&
                    (!flags.meridiem || (flags.meridiem && parsedParts));

            if (m._strict) {
                isNowValid =
                    isNowValid &&
                    flags.charsLeftOver === 0 &&
                    flags.unusedTokens.length === 0 &&
                    flags.bigHour === undefined;
            }

            if (Object.isFrozen == null || !Object.isFrozen(m)) {
                m._isValid = isNowValid;
            } else {
                return isNowValid;
            }
        }
        return m._isValid;
    }

    function createInvalid(flags) {
        var m = createUTC(NaN);
        if (flags != null) {
            extend(getParsingFlags(m), flags);
        } else {
            getParsingFlags(m).userInvalidated = true;
        }

        return m;
    }

    // Plugins that add properties should also add the key here (null value),
    // so we can properly clone ourselves.
    var momentProperties = (hooks.momentProperties = []),
        updateInProgress = false;

    function copyConfig(to, from) {
        var i, prop, val;

        if (!isUndefined(from._isAMomentObject)) {
            to._isAMomentObject = from._isAMomentObject;
        }
        if (!isUndefined(from._i)) {
            to._i = from._i;
        }
        if (!isUndefined(from._f)) {
            to._f = from._f;
        }
        if (!isUndefined(from._l)) {
            to._l = from._l;
        }
        if (!isUndefined(from._strict)) {
            to._strict = from._strict;
        }
        if (!isUndefined(from._tzm)) {
            to._tzm = from._tzm;
        }
        if (!isUndefined(from._isUTC)) {
            to._isUTC = from._isUTC;
        }
        if (!isUndefined(from._offset)) {
            to._offset = from._offset;
        }
        if (!isUndefined(from._pf)) {
            to._pf = getParsingFlags(from);
        }
        if (!isUndefined(from._locale)) {
            to._locale = from._locale;
        }

        if (momentProperties.length > 0) {
            for (i = 0; i < momentProperties.length; i++) {
                prop = momentProperties[i];
                val = from[prop];
                if (!isUndefined(val)) {
                    to[prop] = val;
                }
            }
        }

        return to;
    }

    // Moment prototype object
    function Moment(config) {
        copyConfig(this, config);
        this._d = new Date(config._d != null ? config._d.getTime() : NaN);
        if (!this.isValid()) {
            this._d = new Date(NaN);
        }
        // Prevent infinite loop in case updateOffset creates new moment
        // objects.
        if (updateInProgress === false) {
            updateInProgress = true;
            hooks.updateOffset(this);
            updateInProgress = false;
        }
    }

    function isMoment(obj) {
        return (
            obj instanceof Moment || (obj != null && obj._isAMomentObject != null)
        );
    }

    function warn(msg) {
        if (
            hooks.suppressDeprecationWarnings === false &&
            typeof console !== 'undefined' &&
            console.warn
        ) {
            console.warn('Deprecation warning: ' + msg);
        }
    }

    function deprecate(msg, fn) {
        var firstTime = true;

        return extend(function () {
            if (hooks.deprecationHandler != null) {
                hooks.deprecationHandler(null, msg);
            }
            if (firstTime) {
                var args = [],
                    arg,
                    i,
                    key;
                for (i = 0; i < arguments.length; i++) {
                    arg = '';
                    if (typeof arguments[i] === 'object') {
                        arg += '\n[' + i + '] ';
                        for (key in arguments[0]) {
                            if (hasOwnProp(arguments[0], key)) {
                                arg += key + ': ' + arguments[0][key] + ', ';
                            }
                        }
                        arg = arg.slice(0, -2); // Remove trailing comma and space
                    } else {
                        arg = arguments[i];
                    }
                    args.push(arg);
                }
                warn(
                    msg +
                        '\nArguments: ' +
                        Array.prototype.slice.call(args).join('') +
                        '\n' +
                        new Error().stack
                );
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }

    var deprecations = {};

    function deprecateSimple(name, msg) {
        if (hooks.deprecationHandler != null) {
            hooks.deprecationHandler(name, msg);
        }
        if (!deprecations[name]) {
            warn(msg);
            deprecations[name] = true;
        }
    }

    hooks.suppressDeprecationWarnings = false;
    hooks.deprecationHandler = null;

    function isFunction(input) {
        return (
            (typeof Function !== 'undefined' && input instanceof Function) ||
            Object.prototype.toString.call(input) === '[object Function]'
        );
    }

    function set(config) {
        var prop, i;
        for (i in config) {
            if (hasOwnProp(config, i)) {
                prop = config[i];
                if (isFunction(prop)) {
                    this[i] = prop;
                } else {
                    this['_' + i] = prop;
                }
            }
        }
        this._config = config;
        // Lenient ordinal parsing accepts just a number in addition to
        // number + (possibly) stuff coming from _dayOfMonthOrdinalParse.
        // TODO: Remove "ordinalParse" fallback in next major release.
        this._dayOfMonthOrdinalParseLenient = new RegExp(
            (this._dayOfMonthOrdinalParse.source || this._ordinalParse.source) +
                '|' +
                /\d{1,2}/.source
        );
    }

    function mergeConfigs(parentConfig, childConfig) {
        var res = extend({}, parentConfig),
            prop;
        for (prop in childConfig) {
            if (hasOwnProp(childConfig, prop)) {
                if (isObject(parentConfig[prop]) && isObject(childConfig[prop])) {
                    res[prop] = {};
                    extend(res[prop], parentConfig[prop]);
                    extend(res[prop], childConfig[prop]);
                } else if (childConfig[prop] != null) {
                    res[prop] = childConfig[prop];
                } else {
                    delete res[prop];
                }
            }
        }
        for (prop in parentConfig) {
            if (
                hasOwnProp(parentConfig, prop) &&
                !hasOwnProp(childConfig, prop) &&
                isObject(parentConfig[prop])
            ) {
                // make sure changes to properties don't modify parent config
                res[prop] = extend({}, res[prop]);
            }
        }
        return res;
    }

    function Locale(config) {
        if (config != null) {
            this.set(config);
        }
    }

    var keys;

    if (Object.keys) {
        keys = Object.keys;
    } else {
        keys = function (obj) {
            var i,
                res = [];
            for (i in obj) {
                if (hasOwnProp(obj, i)) {
                    res.push(i);
                }
            }
            return res;
        };
    }

    var defaultCalendar = {
        sameDay: '[Today at] LT',
        nextDay: '[Tomorrow at] LT',
        nextWeek: 'dddd [at] LT',
        lastDay: '[Yesterday at] LT',
        lastWeek: '[Last] dddd [at] LT',
        sameElse: 'L',
    };

    function calendar(key, mom, now) {
        var output = this._calendar[key] || this._calendar['sameElse'];
        return isFunction(output) ? output.call(mom, now) : output;
    }

    function zeroFill(number, targetLength, forceSign) {
        var absNumber = '' + Math.abs(number),
            zerosToFill = targetLength - absNumber.length,
            sign = number >= 0;
        return (
            (sign ? (forceSign ? '+' : '') : '-') +
            Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) +
            absNumber
        );
    }

    var formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|N{1,5}|YYYYYY|YYYYY|YYYY|YY|y{2,4}|yo?|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g,
        localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,
        formatFunctions = {},
        formatTokenFunctions = {};

    // token:    'M'
    // padded:   ['MM', 2]
    // ordinal:  'Mo'
    // callback: function () { this.month() + 1 }
    function addFormatToken(token, padded, ordinal, callback) {
        var func = callback;
        if (typeof callback === 'string') {
            func = function () {
                return this[callback]();
            };
        }
        if (token) {
            formatTokenFunctions[token] = func;
        }
        if (padded) {
            formatTokenFunctions[padded[0]] = function () {
                return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
            };
        }
        if (ordinal) {
            formatTokenFunctions[ordinal] = function () {
                return this.localeData().ordinal(
                    func.apply(this, arguments),
                    token
                );
            };
        }
    }

    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|\]$/g, '');
        }
        return input.replace(/\\/g, '');
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens),
            i,
            length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = '',
                i;
            for (i = 0; i < length; i++) {
                output += isFunction(array[i])
                    ? array[i].call(mom, format)
                    : array[i];
            }
            return output;
        };
    }

    // format date using native date object
    function formatMoment(m, format) {
        if (!m.isValid()) {
            return m.localeData().invalidDate();
        }

        format = expandFormat(format, m.localeData());
        formatFunctions[format] =
            formatFunctions[format] || makeFormatFunction(format);

        return formatFunctions[format](m);
    }

    function expandFormat(format, locale) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return locale.longDateFormat(input) || input;
        }

        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(
                localFormattingTokens,
                replaceLongDateFormatTokens
            );
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }

        return format;
    }

    var defaultLongDateFormat = {
        LTS: 'h:mm:ss A',
        LT: 'h:mm A',
        L: 'MM/DD/YYYY',
        LL: 'MMMM D, YYYY',
        LLL: 'MMMM D, YYYY h:mm A',
        LLLL: 'dddd, MMMM D, YYYY h:mm A',
    };

    function longDateFormat(key) {
        var format = this._longDateFormat[key],
            formatUpper = this._longDateFormat[key.toUpperCase()];

        if (format || !formatUpper) {
            return format;
        }

        this._longDateFormat[key] = formatUpper
            .match(formattingTokens)
            .map(function (tok) {
                if (
                    tok === 'MMMM' ||
                    tok === 'MM' ||
                    tok === 'DD' ||
                    tok === 'dddd'
                ) {
                    return tok.slice(1);
                }
                return tok;
            })
            .join('');

        return this._longDateFormat[key];
    }

    var defaultInvalidDate = 'Invalid date';

    function invalidDate() {
        return this._invalidDate;
    }

    var defaultOrdinal = '%d',
        defaultDayOfMonthOrdinalParse = /\d{1,2}/;

    function ordinal(number) {
        return this._ordinal.replace('%d', number);
    }

    var defaultRelativeTime = {
        future: 'in %s',
        past: '%s ago',
        s: 'a few seconds',
        ss: '%d seconds',
        m: 'a minute',
        mm: '%d minutes',
        h: 'an hour',
        hh: '%d hours',
        d: 'a day',
        dd: '%d days',
        w: 'a week',
        ww: '%d weeks',
        M: 'a month',
        MM: '%d months',
        y: 'a year',
        yy: '%d years',
    };

    function relativeTime(number, withoutSuffix, string, isFuture) {
        var output = this._relativeTime[string];
        return isFunction(output)
            ? output(number, withoutSuffix, string, isFuture)
            : output.replace(/%d/i, number);
    }

    function pastFuture(diff, output) {
        var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
        return isFunction(format) ? format(output) : format.replace(/%s/i, output);
    }

    var aliases = {};

    function addUnitAlias(unit, shorthand) {
        var lowerCase = unit.toLowerCase();
        aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
    }

    function normalizeUnits(units) {
        return typeof units === 'string'
            ? aliases[units] || aliases[units.toLowerCase()]
            : undefined;
    }

    function normalizeObjectUnits(inputObject) {
        var normalizedInput = {},
            normalizedProp,
            prop;

        for (prop in inputObject) {
            if (hasOwnProp(inputObject, prop)) {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp) {
                    normalizedInput[normalizedProp] = inputObject[prop];
                }
            }
        }

        return normalizedInput;
    }

    var priorities = {};

    function addUnitPriority(unit, priority) {
        priorities[unit] = priority;
    }

    function getPrioritizedUnits(unitsObj) {
        var units = [],
            u;
        for (u in unitsObj) {
            if (hasOwnProp(unitsObj, u)) {
                units.push({ unit: u, priority: priorities[u] });
            }
        }
        units.sort(function (a, b) {
            return a.priority - b.priority;
        });
        return units;
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    function absFloor(number) {
        if (number < 0) {
            // -0 -> 0
            return Math.ceil(number) || 0;
        } else {
            return Math.floor(number);
        }
    }

    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion,
            value = 0;

        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            value = absFloor(coercedNumber);
        }

        return value;
    }

    function makeGetSet(unit, keepTime) {
        return function (value) {
            if (value != null) {
                set$1(this, unit, value);
                hooks.updateOffset(this, keepTime);
                return this;
            } else {
                return get(this, unit);
            }
        };
    }

    function get(mom, unit) {
        return mom.isValid()
            ? mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]()
            : NaN;
    }

    function set$1(mom, unit, value) {
        if (mom.isValid() && !isNaN(value)) {
            if (
                unit === 'FullYear' &&
                isLeapYear(mom.year()) &&
                mom.month() === 1 &&
                mom.date() === 29
            ) {
                value = toInt(value);
                mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](
                    value,
                    mom.month(),
                    daysInMonth(value, mom.month())
                );
            } else {
                mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
            }
        }
    }

    // MOMENTS

    function stringGet(units) {
        units = normalizeUnits(units);
        if (isFunction(this[units])) {
            return this[units]();
        }
        return this;
    }

    function stringSet(units, value) {
        if (typeof units === 'object') {
            units = normalizeObjectUnits(units);
            var prioritized = getPrioritizedUnits(units),
                i;
            for (i = 0; i < prioritized.length; i++) {
                this[prioritized[i].unit](units[prioritized[i].unit]);
            }
        } else {
            units = normalizeUnits(units);
            if (isFunction(this[units])) {
                return this[units](value);
            }
        }
        return this;
    }

    var match1 = /\d/, //       0 - 9
        match2 = /\d\d/, //      00 - 99
        match3 = /\d{3}/, //     000 - 999
        match4 = /\d{4}/, //    0000 - 9999
        match6 = /[+-]?\d{6}/, // -999999 - 999999
        match1to2 = /\d\d?/, //       0 - 99
        match3to4 = /\d\d\d\d?/, //     999 - 9999
        match5to6 = /\d\d\d\d\d\d?/, //   99999 - 999999
        match1to3 = /\d{1,3}/, //       0 - 999
        match1to4 = /\d{1,4}/, //       0 - 9999
        match1to6 = /[+-]?\d{1,6}/, // -999999 - 999999
        matchUnsigned = /\d+/, //       0 - inf
        matchSigned = /[+-]?\d+/, //    -inf - inf
        matchOffset = /Z|[+-]\d\d:?\d\d/gi, // +00:00 -00:00 +0000 -0000 or Z
        matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi, // +00 -00 +00:00 -00:00 +0000 -0000 or Z
        matchTimestamp = /[+-]?\d+(\.\d{1,3})?/, // 123456789 123456789.123
        // any word (or two) characters or numbers including two/three word month in arabic.
        // includes scottish gaelic two word and hyphenated months
        matchWord = /[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i,
        regexes;

    regexes = {};

    function addRegexToken(token, regex, strictRegex) {
        regexes[token] = isFunction(regex)
            ? regex
            : function (isStrict, localeData) {
                  return isStrict && strictRegex ? strictRegex : regex;
              };
    }

    function getParseRegexForToken(token, config) {
        if (!hasOwnProp(regexes, token)) {
            return new RegExp(unescapeFormat(token));
        }

        return regexes[token](config._strict, config._locale);
    }

    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    function unescapeFormat(s) {
        return regexEscape(
            s
                .replace('\\', '')
                .replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (
                    matched,
                    p1,
                    p2,
                    p3,
                    p4
                ) {
                    return p1 || p2 || p3 || p4;
                })
        );
    }

    function regexEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    var tokens = {};

    function addParseToken(token, callback) {
        var i,
            func = callback;
        if (typeof token === 'string') {
            token = [token];
        }
        if (isNumber(callback)) {
            func = function (input, array) {
                array[callback] = toInt(input);
            };
        }
        for (i = 0; i < token.length; i++) {
            tokens[token[i]] = func;
        }
    }

    function addWeekParseToken(token, callback) {
        addParseToken(token, function (input, array, config, token) {
            config._w = config._w || {};
            callback(input, config._w, config, token);
        });
    }

    function addTimeToArrayFromToken(token, input, config) {
        if (input != null && hasOwnProp(tokens, token)) {
            tokens[token](input, config._a, config, token);
        }
    }

    var YEAR = 0,
        MONTH = 1,
        DATE = 2,
        HOUR = 3,
        MINUTE = 4,
        SECOND = 5,
        MILLISECOND = 6,
        WEEK = 7,
        WEEKDAY = 8;

    function mod(n, x) {
        return ((n % x) + x) % x;
    }

    var indexOf;

    if (Array.prototype.indexOf) {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function (o) {
            // I know
            var i;
            for (i = 0; i < this.length; ++i) {
                if (this[i] === o) {
                    return i;
                }
            }
            return -1;
        };
    }

    function daysInMonth(year, month) {
        if (isNaN(year) || isNaN(month)) {
            return NaN;
        }
        var modMonth = mod(month, 12);
        year += (month - modMonth) / 12;
        return modMonth === 1
            ? isLeapYear(year)
                ? 29
                : 28
            : 31 - ((modMonth % 7) % 2);
    }

    // FORMATTING

    addFormatToken('M', ['MM', 2], 'Mo', function () {
        return this.month() + 1;
    });

    addFormatToken('MMM', 0, 0, function (format) {
        return this.localeData().monthsShort(this, format);
    });

    addFormatToken('MMMM', 0, 0, function (format) {
        return this.localeData().months(this, format);
    });

    // ALIASES

    addUnitAlias('month', 'M');

    // PRIORITY

    addUnitPriority('month', 8);

    // PARSING

    addRegexToken('M', match1to2);
    addRegexToken('MM', match1to2, match2);
    addRegexToken('MMM', function (isStrict, locale) {
        return locale.monthsShortRegex(isStrict);
    });
    addRegexToken('MMMM', function (isStrict, locale) {
        return locale.monthsRegex(isStrict);
    });

    addParseToken(['M', 'MM'], function (input, array) {
        array[MONTH] = toInt(input) - 1;
    });

    addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
        var month = config._locale.monthsParse(input, token, config._strict);
        // if we didn't find a month name, mark the date as invalid.
        if (month != null) {
            array[MONTH] = month;
        } else {
            getParsingFlags(config).invalidMonth = input;
        }
    });

    // LOCALES

    var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split(
            '_'
        ),
        defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split(
            '_'
        ),
        MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/,
        defaultMonthsShortRegex = matchWord,
        defaultMonthsRegex = matchWord;

    function localeMonths(m, format) {
        if (!m) {
            return isArray(this._months)
                ? this._months
                : this._months['standalone'];
        }
        return isArray(this._months)
            ? this._months[m.month()]
            : this._months[
                  (this._months.isFormat || MONTHS_IN_FORMAT).test(format)
                      ? 'format'
                      : 'standalone'
              ][m.month()];
    }

    function localeMonthsShort(m, format) {
        if (!m) {
            return isArray(this._monthsShort)
                ? this._monthsShort
                : this._monthsShort['standalone'];
        }
        return isArray(this._monthsShort)
            ? this._monthsShort[m.month()]
            : this._monthsShort[
                  MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone'
              ][m.month()];
    }

    function handleStrictParse(monthName, format, strict) {
        var i,
            ii,
            mom,
            llc = monthName.toLocaleLowerCase();
        if (!this._monthsParse) {
            // this is not used
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
            for (i = 0; i < 12; ++i) {
                mom = createUTC([2000, i]);
                this._shortMonthsParse[i] = this.monthsShort(
                    mom,
                    ''
                ).toLocaleLowerCase();
                this._longMonthsParse[i] = this.months(mom, '').toLocaleLowerCase();
            }
        }

        if (strict) {
            if (format === 'MMM') {
                ii = indexOf.call(this._shortMonthsParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._longMonthsParse, llc);
                return ii !== -1 ? ii : null;
            }
        } else {
            if (format === 'MMM') {
                ii = indexOf.call(this._shortMonthsParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._longMonthsParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._longMonthsParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortMonthsParse, llc);
                return ii !== -1 ? ii : null;
            }
        }
    }

    function localeMonthsParse(monthName, format, strict) {
        var i, mom, regex;

        if (this._monthsParseExact) {
            return handleStrictParse.call(this, monthName, format, strict);
        }

        if (!this._monthsParse) {
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
        }

        // TODO: add sorting
        // Sorting makes sure if one month (or abbr) is a prefix of another
        // see sorting in computeMonthsParse
        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = createUTC([2000, i]);
            if (strict && !this._longMonthsParse[i]) {
                this._longMonthsParse[i] = new RegExp(
                    '^' + this.months(mom, '').replace('.', '') + '$',
                    'i'
                );
                this._shortMonthsParse[i] = new RegExp(
                    '^' + this.monthsShort(mom, '').replace('.', '') + '$',
                    'i'
                );
            }
            if (!strict && !this._monthsParse[i]) {
                regex =
                    '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (
                strict &&
                format === 'MMMM' &&
                this._longMonthsParse[i].test(monthName)
            ) {
                return i;
            } else if (
                strict &&
                format === 'MMM' &&
                this._shortMonthsParse[i].test(monthName)
            ) {
                return i;
            } else if (!strict && this._monthsParse[i].test(monthName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function setMonth(mom, value) {
        var dayOfMonth;

        if (!mom.isValid()) {
            // No op
            return mom;
        }

        if (typeof value === 'string') {
            if (/^\d+$/.test(value)) {
                value = toInt(value);
            } else {
                value = mom.localeData().monthsParse(value);
                // TODO: Another silent failure?
                if (!isNumber(value)) {
                    return mom;
                }
            }
        }

        dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
        return mom;
    }

    function getSetMonth(value) {
        if (value != null) {
            setMonth(this, value);
            hooks.updateOffset(this, true);
            return this;
        } else {
            return get(this, 'Month');
        }
    }

    function getDaysInMonth() {
        return daysInMonth(this.year(), this.month());
    }

    function monthsShortRegex(isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsShortStrictRegex;
            } else {
                return this._monthsShortRegex;
            }
        } else {
            if (!hasOwnProp(this, '_monthsShortRegex')) {
                this._monthsShortRegex = defaultMonthsShortRegex;
            }
            return this._monthsShortStrictRegex && isStrict
                ? this._monthsShortStrictRegex
                : this._monthsShortRegex;
        }
    }

    function monthsRegex(isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsStrictRegex;
            } else {
                return this._monthsRegex;
            }
        } else {
            if (!hasOwnProp(this, '_monthsRegex')) {
                this._monthsRegex = defaultMonthsRegex;
            }
            return this._monthsStrictRegex && isStrict
                ? this._monthsStrictRegex
                : this._monthsRegex;
        }
    }

    function computeMonthsParse() {
        function cmpLenRev(a, b) {
            return b.length - a.length;
        }

        var shortPieces = [],
            longPieces = [],
            mixedPieces = [],
            i,
            mom;
        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = createUTC([2000, i]);
            shortPieces.push(this.monthsShort(mom, ''));
            longPieces.push(this.months(mom, ''));
            mixedPieces.push(this.months(mom, ''));
            mixedPieces.push(this.monthsShort(mom, ''));
        }
        // Sorting makes sure if one month (or abbr) is a prefix of another it
        // will match the longer piece.
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);
        for (i = 0; i < 12; i++) {
            shortPieces[i] = regexEscape(shortPieces[i]);
            longPieces[i] = regexEscape(longPieces[i]);
        }
        for (i = 0; i < 24; i++) {
            mixedPieces[i] = regexEscape(mixedPieces[i]);
        }

        this._monthsRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._monthsShortRegex = this._monthsRegex;
        this._monthsStrictRegex = new RegExp(
            '^(' + longPieces.join('|') + ')',
            'i'
        );
        this._monthsShortStrictRegex = new RegExp(
            '^(' + shortPieces.join('|') + ')',
            'i'
        );
    }

    // FORMATTING

    addFormatToken('Y', 0, 0, function () {
        var y = this.year();
        return y <= 9999 ? zeroFill(y, 4) : '+' + y;
    });

    addFormatToken(0, ['YY', 2], 0, function () {
        return this.year() % 100;
    });

    addFormatToken(0, ['YYYY', 4], 0, 'year');
    addFormatToken(0, ['YYYYY', 5], 0, 'year');
    addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');

    // ALIASES

    addUnitAlias('year', 'y');

    // PRIORITIES

    addUnitPriority('year', 1);

    // PARSING

    addRegexToken('Y', matchSigned);
    addRegexToken('YY', match1to2, match2);
    addRegexToken('YYYY', match1to4, match4);
    addRegexToken('YYYYY', match1to6, match6);
    addRegexToken('YYYYYY', match1to6, match6);

    addParseToken(['YYYYY', 'YYYYYY'], YEAR);
    addParseToken('YYYY', function (input, array) {
        array[YEAR] =
            input.length === 2 ? hooks.parseTwoDigitYear(input) : toInt(input);
    });
    addParseToken('YY', function (input, array) {
        array[YEAR] = hooks.parseTwoDigitYear(input);
    });
    addParseToken('Y', function (input, array) {
        array[YEAR] = parseInt(input, 10);
    });

    // HELPERS

    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    // HOOKS

    hooks.parseTwoDigitYear = function (input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };

    // MOMENTS

    var getSetYear = makeGetSet('FullYear', true);

    function getIsLeapYear() {
        return isLeapYear(this.year());
    }

    function createDate(y, m, d, h, M, s, ms) {
        // can't just apply() to create a date:
        // https://stackoverflow.com/q/181348
        var date;
        // the date constructor remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0) {
            // preserve leap years using a full 400 year cycle, then reset
            date = new Date(y + 400, m, d, h, M, s, ms);
            if (isFinite(date.getFullYear())) {
                date.setFullYear(y);
            }
        } else {
            date = new Date(y, m, d, h, M, s, ms);
        }

        return date;
    }

    function createUTCDate(y) {
        var date, args;
        // the Date.UTC function remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0) {
            args = Array.prototype.slice.call(arguments);
            // preserve leap years using a full 400 year cycle, then reset
            args[0] = y + 400;
            date = new Date(Date.UTC.apply(null, args));
            if (isFinite(date.getUTCFullYear())) {
                date.setUTCFullYear(y);
            }
        } else {
            date = new Date(Date.UTC.apply(null, arguments));
        }

        return date;
    }

    // start-of-first-week - start-of-year
    function firstWeekOffset(year, dow, doy) {
        var // first-week day -- which january is always in the first week (4 for iso, 1 for other)
            fwd = 7 + dow - doy,
            // first-week day local weekday -- which local weekday is fwd
            fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7;

        return -fwdlw + fwd - 1;
    }

    // https://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
    function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
        var localWeekday = (7 + weekday - dow) % 7,
            weekOffset = firstWeekOffset(year, dow, doy),
            dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset,
            resYear,
            resDayOfYear;

        if (dayOfYear <= 0) {
            resYear = year - 1;
            resDayOfYear = daysInYear(resYear) + dayOfYear;
        } else if (dayOfYear > daysInYear(year)) {
            resYear = year + 1;
            resDayOfYear = dayOfYear - daysInYear(year);
        } else {
            resYear = year;
            resDayOfYear = dayOfYear;
        }

        return {
            year: resYear,
            dayOfYear: resDayOfYear,
        };
    }

    function weekOfYear(mom, dow, doy) {
        var weekOffset = firstWeekOffset(mom.year(), dow, doy),
            week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1,
            resWeek,
            resYear;

        if (week < 1) {
            resYear = mom.year() - 1;
            resWeek = week + weeksInYear(resYear, dow, doy);
        } else if (week > weeksInYear(mom.year(), dow, doy)) {
            resWeek = week - weeksInYear(mom.year(), dow, doy);
            resYear = mom.year() + 1;
        } else {
            resYear = mom.year();
            resWeek = week;
        }

        return {
            week: resWeek,
            year: resYear,
        };
    }

    function weeksInYear(year, dow, doy) {
        var weekOffset = firstWeekOffset(year, dow, doy),
            weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
        return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
    }

    // FORMATTING

    addFormatToken('w', ['ww', 2], 'wo', 'week');
    addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');

    // ALIASES

    addUnitAlias('week', 'w');
    addUnitAlias('isoWeek', 'W');

    // PRIORITIES

    addUnitPriority('week', 5);
    addUnitPriority('isoWeek', 5);

    // PARSING

    addRegexToken('w', match1to2);
    addRegexToken('ww', match1to2, match2);
    addRegexToken('W', match1to2);
    addRegexToken('WW', match1to2, match2);

    addWeekParseToken(['w', 'ww', 'W', 'WW'], function (
        input,
        week,
        config,
        token
    ) {
        week[token.substr(0, 1)] = toInt(input);
    });

    // HELPERS

    // LOCALES

    function localeWeek(mom) {
        return weekOfYear(mom, this._week.dow, this._week.doy).week;
    }

    var defaultLocaleWeek = {
        dow: 0, // Sunday is the first day of the week.
        doy: 6, // The week that contains Jan 6th is the first week of the year.
    };

    function localeFirstDayOfWeek() {
        return this._week.dow;
    }

    function localeFirstDayOfYear() {
        return this._week.doy;
    }

    // MOMENTS

    function getSetWeek(input) {
        var week = this.localeData().week(this);
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    function getSetISOWeek(input) {
        var week = weekOfYear(this, 1, 4).week;
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    // FORMATTING

    addFormatToken('d', 0, 'do', 'day');

    addFormatToken('dd', 0, 0, function (format) {
        return this.localeData().weekdaysMin(this, format);
    });

    addFormatToken('ddd', 0, 0, function (format) {
        return this.localeData().weekdaysShort(this, format);
    });

    addFormatToken('dddd', 0, 0, function (format) {
        return this.localeData().weekdays(this, format);
    });

    addFormatToken('e', 0, 0, 'weekday');
    addFormatToken('E', 0, 0, 'isoWeekday');

    // ALIASES

    addUnitAlias('day', 'd');
    addUnitAlias('weekday', 'e');
    addUnitAlias('isoWeekday', 'E');

    // PRIORITY
    addUnitPriority('day', 11);
    addUnitPriority('weekday', 11);
    addUnitPriority('isoWeekday', 11);

    // PARSING

    addRegexToken('d', match1to2);
    addRegexToken('e', match1to2);
    addRegexToken('E', match1to2);
    addRegexToken('dd', function (isStrict, locale) {
        return locale.weekdaysMinRegex(isStrict);
    });
    addRegexToken('ddd', function (isStrict, locale) {
        return locale.weekdaysShortRegex(isStrict);
    });
    addRegexToken('dddd', function (isStrict, locale) {
        return locale.weekdaysRegex(isStrict);
    });

    addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config, token) {
        var weekday = config._locale.weekdaysParse(input, token, config._strict);
        // if we didn't get a weekday name, mark the date as invalid
        if (weekday != null) {
            week.d = weekday;
        } else {
            getParsingFlags(config).invalidWeekday = input;
        }
    });

    addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
        week[token] = toInt(input);
    });

    // HELPERS

    function parseWeekday(input, locale) {
        if (typeof input !== 'string') {
            return input;
        }

        if (!isNaN(input)) {
            return parseInt(input, 10);
        }

        input = locale.weekdaysParse(input);
        if (typeof input === 'number') {
            return input;
        }

        return null;
    }

    function parseIsoWeekday(input, locale) {
        if (typeof input === 'string') {
            return locale.weekdaysParse(input) % 7 || 7;
        }
        return isNaN(input) ? null : input;
    }

    // LOCALES
    function shiftWeekdays(ws, n) {
        return ws.slice(n, 7).concat(ws.slice(0, n));
    }

    var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split(
            '_'
        ),
        defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
        defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
        defaultWeekdaysRegex = matchWord,
        defaultWeekdaysShortRegex = matchWord,
        defaultWeekdaysMinRegex = matchWord;

    function localeWeekdays(m, format) {
        var weekdays = isArray(this._weekdays)
            ? this._weekdays
            : this._weekdays[
                  m && m !== true && this._weekdays.isFormat.test(format)
                      ? 'format'
                      : 'standalone'
              ];
        return m === true
            ? shiftWeekdays(weekdays, this._week.dow)
            : m
            ? weekdays[m.day()]
            : weekdays;
    }

    function localeWeekdaysShort(m) {
        return m === true
            ? shiftWeekdays(this._weekdaysShort, this._week.dow)
            : m
            ? this._weekdaysShort[m.day()]
            : this._weekdaysShort;
    }

    function localeWeekdaysMin(m) {
        return m === true
            ? shiftWeekdays(this._weekdaysMin, this._week.dow)
            : m
            ? this._weekdaysMin[m.day()]
            : this._weekdaysMin;
    }

    function handleStrictParse$1(weekdayName, format, strict) {
        var i,
            ii,
            mom,
            llc = weekdayName.toLocaleLowerCase();
        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._minWeekdaysParse = [];

            for (i = 0; i < 7; ++i) {
                mom = createUTC([2000, 1]).day(i);
                this._minWeekdaysParse[i] = this.weekdaysMin(
                    mom,
                    ''
                ).toLocaleLowerCase();
                this._shortWeekdaysParse[i] = this.weekdaysShort(
                    mom,
                    ''
                ).toLocaleLowerCase();
                this._weekdaysParse[i] = this.weekdays(mom, '').toLocaleLowerCase();
            }
        }

        if (strict) {
            if (format === 'dddd') {
                ii = indexOf.call(this._weekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else if (format === 'ddd') {
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            }
        } else {
            if (format === 'dddd') {
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else if (format === 'ddd') {
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._minWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            }
        }
    }

    function localeWeekdaysParse(weekdayName, format, strict) {
        var i, mom, regex;

        if (this._weekdaysParseExact) {
            return handleStrictParse$1.call(this, weekdayName, format, strict);
        }

        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._minWeekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._fullWeekdaysParse = [];
        }

        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already

            mom = createUTC([2000, 1]).day(i);
            if (strict && !this._fullWeekdaysParse[i]) {
                this._fullWeekdaysParse[i] = new RegExp(
                    '^' + this.weekdays(mom, '').replace('.', '\\.?') + '$',
                    'i'
                );
                this._shortWeekdaysParse[i] = new RegExp(
                    '^' + this.weekdaysShort(mom, '').replace('.', '\\.?') + '$',
                    'i'
                );
                this._minWeekdaysParse[i] = new RegExp(
                    '^' + this.weekdaysMin(mom, '').replace('.', '\\.?') + '$',
                    'i'
                );
            }
            if (!this._weekdaysParse[i]) {
                regex =
                    '^' +
                    this.weekdays(mom, '') +
                    '|^' +
                    this.weekdaysShort(mom, '') +
                    '|^' +
                    this.weekdaysMin(mom, '');
                this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (
                strict &&
                format === 'dddd' &&
                this._fullWeekdaysParse[i].test(weekdayName)
            ) {
                return i;
            } else if (
                strict &&
                format === 'ddd' &&
                this._shortWeekdaysParse[i].test(weekdayName)
            ) {
                return i;
            } else if (
                strict &&
                format === 'dd' &&
                this._minWeekdaysParse[i].test(weekdayName)
            ) {
                return i;
            } else if (!strict && this._weekdaysParse[i].test(weekdayName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function getSetDayOfWeek(input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
        if (input != null) {
            input = parseWeekday(input, this.localeData());
            return this.add(input - day, 'd');
        } else {
            return day;
        }
    }

    function getSetLocaleDayOfWeek(input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
        return input == null ? weekday : this.add(input - weekday, 'd');
    }

    function getSetISODayOfWeek(input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }

        // behaves the same as moment#day except
        // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
        // as a setter, sunday should belong to the previous week.

        if (input != null) {
            var weekday = parseIsoWeekday(input, this.localeData());
            return this.day(this.day() % 7 ? weekday : weekday - 7);
        } else {
            return this.day() || 7;
        }
    }

    function weekdaysRegex(isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysStrictRegex;
            } else {
                return this._weekdaysRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                this._weekdaysRegex = defaultWeekdaysRegex;
            }
            return this._weekdaysStrictRegex && isStrict
                ? this._weekdaysStrictRegex
                : this._weekdaysRegex;
        }
    }

    function weekdaysShortRegex(isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysShortStrictRegex;
            } else {
                return this._weekdaysShortRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysShortRegex')) {
                this._weekdaysShortRegex = defaultWeekdaysShortRegex;
            }
            return this._weekdaysShortStrictRegex && isStrict
                ? this._weekdaysShortStrictRegex
                : this._weekdaysShortRegex;
        }
    }

    function weekdaysMinRegex(isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysMinStrictRegex;
            } else {
                return this._weekdaysMinRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysMinRegex')) {
                this._weekdaysMinRegex = defaultWeekdaysMinRegex;
            }
            return this._weekdaysMinStrictRegex && isStrict
                ? this._weekdaysMinStrictRegex
                : this._weekdaysMinRegex;
        }
    }

    function computeWeekdaysParse() {
        function cmpLenRev(a, b) {
            return b.length - a.length;
        }

        var minPieces = [],
            shortPieces = [],
            longPieces = [],
            mixedPieces = [],
            i,
            mom,
            minp,
            shortp,
            longp;
        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already
            mom = createUTC([2000, 1]).day(i);
            minp = regexEscape(this.weekdaysMin(mom, ''));
            shortp = regexEscape(this.weekdaysShort(mom, ''));
            longp = regexEscape(this.weekdays(mom, ''));
            minPieces.push(minp);
            shortPieces.push(shortp);
            longPieces.push(longp);
            mixedPieces.push(minp);
            mixedPieces.push(shortp);
            mixedPieces.push(longp);
        }
        // Sorting makes sure if one weekday (or abbr) is a prefix of another it
        // will match the longer piece.
        minPieces.sort(cmpLenRev);
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);

        this._weekdaysRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._weekdaysShortRegex = this._weekdaysRegex;
        this._weekdaysMinRegex = this._weekdaysRegex;

        this._weekdaysStrictRegex = new RegExp(
            '^(' + longPieces.join('|') + ')',
            'i'
        );
        this._weekdaysShortStrictRegex = new RegExp(
            '^(' + shortPieces.join('|') + ')',
            'i'
        );
        this._weekdaysMinStrictRegex = new RegExp(
            '^(' + minPieces.join('|') + ')',
            'i'
        );
    }

    // FORMATTING

    function hFormat() {
        return this.hours() % 12 || 12;
    }

    function kFormat() {
        return this.hours() || 24;
    }

    addFormatToken('H', ['HH', 2], 0, 'hour');
    addFormatToken('h', ['hh', 2], 0, hFormat);
    addFormatToken('k', ['kk', 2], 0, kFormat);

    addFormatToken('hmm', 0, 0, function () {
        return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2);
    });

    addFormatToken('hmmss', 0, 0, function () {
        return (
            '' +
            hFormat.apply(this) +
            zeroFill(this.minutes(), 2) +
            zeroFill(this.seconds(), 2)
        );
    });

    addFormatToken('Hmm', 0, 0, function () {
        return '' + this.hours() + zeroFill(this.minutes(), 2);
    });

    addFormatToken('Hmmss', 0, 0, function () {
        return (
            '' +
            this.hours() +
            zeroFill(this.minutes(), 2) +
            zeroFill(this.seconds(), 2)
        );
    });

    function meridiem(token, lowercase) {
        addFormatToken(token, 0, 0, function () {
            return this.localeData().meridiem(
                this.hours(),
                this.minutes(),
                lowercase
            );
        });
    }

    meridiem('a', true);
    meridiem('A', false);

    // ALIASES

    addUnitAlias('hour', 'h');

    // PRIORITY
    addUnitPriority('hour', 13);

    // PARSING

    function matchMeridiem(isStrict, locale) {
        return locale._meridiemParse;
    }

    addRegexToken('a', matchMeridiem);
    addRegexToken('A', matchMeridiem);
    addRegexToken('H', match1to2);
    addRegexToken('h', match1to2);
    addRegexToken('k', match1to2);
    addRegexToken('HH', match1to2, match2);
    addRegexToken('hh', match1to2, match2);
    addRegexToken('kk', match1to2, match2);

    addRegexToken('hmm', match3to4);
    addRegexToken('hmmss', match5to6);
    addRegexToken('Hmm', match3to4);
    addRegexToken('Hmmss', match5to6);

    addParseToken(['H', 'HH'], HOUR);
    addParseToken(['k', 'kk'], function (input, array, config) {
        var kInput = toInt(input);
        array[HOUR] = kInput === 24 ? 0 : kInput;
    });
    addParseToken(['a', 'A'], function (input, array, config) {
        config._isPm = config._locale.isPM(input);
        config._meridiem = input;
    });
    addParseToken(['h', 'hh'], function (input, array, config) {
        array[HOUR] = toInt(input);
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmm', function (input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmmss', function (input, array, config) {
        var pos1 = input.length - 4,
            pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('Hmm', function (input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
    });
    addParseToken('Hmmss', function (input, array, config) {
        var pos1 = input.length - 4,
            pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
    });

    // LOCALES

    function localeIsPM(input) {
        // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
        // Using charAt should be more compatible.
        return (input + '').toLowerCase().charAt(0) === 'p';
    }

    var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i,
        // Setting the hour should keep the time, because the user explicitly
        // specified which hour they want. So trying to maintain the same hour (in
        // a new timezone) makes sense. Adding/subtracting hours does not follow
        // this rule.
        getSetHour = makeGetSet('Hours', true);

    function localeMeridiem(hours, minutes, isLower) {
        if (hours > 11) {
            return isLower ? 'pm' : 'PM';
        } else {
            return isLower ? 'am' : 'AM';
        }
    }

    var baseConfig = {
        calendar: defaultCalendar,
        longDateFormat: defaultLongDateFormat,
        invalidDate: defaultInvalidDate,
        ordinal: defaultOrdinal,
        dayOfMonthOrdinalParse: defaultDayOfMonthOrdinalParse,
        relativeTime: defaultRelativeTime,

        months: defaultLocaleMonths,
        monthsShort: defaultLocaleMonthsShort,

        week: defaultLocaleWeek,

        weekdays: defaultLocaleWeekdays,
        weekdaysMin: defaultLocaleWeekdaysMin,
        weekdaysShort: defaultLocaleWeekdaysShort,

        meridiemParse: defaultLocaleMeridiemParse,
    };

    // internal storage for locale config files
    var locales = {},
        localeFamilies = {},
        globalLocale;

    function commonPrefix(arr1, arr2) {
        var i,
            minl = Math.min(arr1.length, arr2.length);
        for (i = 0; i < minl; i += 1) {
            if (arr1[i] !== arr2[i]) {
                return i;
            }
        }
        return minl;
    }

    function normalizeLocale(key) {
        return key ? key.toLowerCase().replace('_', '-') : key;
    }

    // pick the locale from the array
    // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
    // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
    function chooseLocale(names) {
        var i = 0,
            j,
            next,
            locale,
            split;

        while (i < names.length) {
            split = normalizeLocale(names[i]).split('-');
            j = split.length;
            next = normalizeLocale(names[i + 1]);
            next = next ? next.split('-') : null;
            while (j > 0) {
                locale = loadLocale(split.slice(0, j).join('-'));
                if (locale) {
                    return locale;
                }
                if (
                    next &&
                    next.length >= j &&
                    commonPrefix(split, next) >= j - 1
                ) {
                    //the next array item is better than a shallower substring of this one
                    break;
                }
                j--;
            }
            i++;
        }
        return globalLocale;
    }

    function loadLocale(name) {
        var oldLocale = null,
            aliasedRequire;
        // TODO: Find a better way to register and load all the locales in Node
        if (
            locales[name] === undefined &&
            typeof module !== 'undefined' &&
            module &&
            module.exports
        ) {
            try {
                oldLocale = globalLocale._abbr;
                aliasedRequire = require;
                aliasedRequire('./locale/' + name);
                getSetGlobalLocale(oldLocale);
            } catch (e) {
                // mark as not found to avoid repeating expensive file require call causing high CPU
                // when trying to find en-US, en_US, en-us for every format call
                locales[name] = null; // null means not found
            }
        }
        return locales[name];
    }

    // This function will load locale and then set the global locale.  If
    // no arguments are passed in, it will simply return the current global
    // locale key.
    function getSetGlobalLocale(key, values) {
        var data;
        if (key) {
            if (isUndefined(values)) {
                data = getLocale(key);
            } else {
                data = defineLocale(key, values);
            }

            if (data) {
                // moment.duration._locale = moment._locale = data;
                globalLocale = data;
            } else {
                if (typeof console !== 'undefined' && console.warn) {
                    //warn user if arguments are passed but the locale could not be set
                    console.warn(
                        'Locale ' + key + ' not found. Did you forget to load it?'
                    );
                }
            }
        }

        return globalLocale._abbr;
    }

    function defineLocale(name, config) {
        if (config !== null) {
            var locale,
                parentConfig = baseConfig;
            config.abbr = name;
            if (locales[name] != null) {
                deprecateSimple(
                    'defineLocaleOverride',
                    'use moment.updateLocale(localeName, config) to change ' +
                        'an existing locale. moment.defineLocale(localeName, ' +
                        'config) should only be used for creating a new locale ' +
                        'See http://momentjs.com/guides/#/warnings/define-locale/ for more info.'
                );
                parentConfig = locales[name]._config;
            } else if (config.parentLocale != null) {
                if (locales[config.parentLocale] != null) {
                    parentConfig = locales[config.parentLocale]._config;
                } else {
                    locale = loadLocale(config.parentLocale);
                    if (locale != null) {
                        parentConfig = locale._config;
                    } else {
                        if (!localeFamilies[config.parentLocale]) {
                            localeFamilies[config.parentLocale] = [];
                        }
                        localeFamilies[config.parentLocale].push({
                            name: name,
                            config: config,
                        });
                        return null;
                    }
                }
            }
            locales[name] = new Locale(mergeConfigs(parentConfig, config));

            if (localeFamilies[name]) {
                localeFamilies[name].forEach(function (x) {
                    defineLocale(x.name, x.config);
                });
            }

            // backwards compat for now: also set the locale
            // make sure we set the locale AFTER all child locales have been
            // created, so we won't end up with the child locale set.
            getSetGlobalLocale(name);

            return locales[name];
        } else {
            // useful for testing
            delete locales[name];
            return null;
        }
    }

    function updateLocale(name, config) {
        if (config != null) {
            var locale,
                tmpLocale,
                parentConfig = baseConfig;

            if (locales[name] != null && locales[name].parentLocale != null) {
                // Update existing child locale in-place to avoid memory-leaks
                locales[name].set(mergeConfigs(locales[name]._config, config));
            } else {
                // MERGE
                tmpLocale = loadLocale(name);
                if (tmpLocale != null) {
                    parentConfig = tmpLocale._config;
                }
                config = mergeConfigs(parentConfig, config);
                if (tmpLocale == null) {
                    // updateLocale is called for creating a new locale
                    // Set abbr so it will have a name (getters return
                    // undefined otherwise).
                    config.abbr = name;
                }
                locale = new Locale(config);
                locale.parentLocale = locales[name];
                locales[name] = locale;
            }

            // backwards compat for now: also set the locale
            getSetGlobalLocale(name);
        } else {
            // pass null for config to unupdate, useful for tests
            if (locales[name] != null) {
                if (locales[name].parentLocale != null) {
                    locales[name] = locales[name].parentLocale;
                    if (name === getSetGlobalLocale()) {
                        getSetGlobalLocale(name);
                    }
                } else if (locales[name] != null) {
                    delete locales[name];
                }
            }
        }
        return locales[name];
    }

    // returns locale data
    function getLocale(key) {
        var locale;

        if (key && key._locale && key._locale._abbr) {
            key = key._locale._abbr;
        }

        if (!key) {
            return globalLocale;
        }

        if (!isArray(key)) {
            //short-circuit everything else
            locale = loadLocale(key);
            if (locale) {
                return locale;
            }
            key = [key];
        }

        return chooseLocale(key);
    }

    function listLocales() {
        return keys(locales);
    }

    function checkOverflow(m) {
        var overflow,
            a = m._a;

        if (a && getParsingFlags(m).overflow === -2) {
            overflow =
                a[MONTH] < 0 || a[MONTH] > 11
                    ? MONTH
                    : a[DATE] < 1 || a[DATE] > daysInMonth(a[YEAR], a[MONTH])
                    ? DATE
                    : a[HOUR] < 0 ||
                      a[HOUR] > 24 ||
                      (a[HOUR] === 24 &&
                          (a[MINUTE] !== 0 ||
                              a[SECOND] !== 0 ||
                              a[MILLISECOND] !== 0))
                    ? HOUR
                    : a[MINUTE] < 0 || a[MINUTE] > 59
                    ? MINUTE
                    : a[SECOND] < 0 || a[SECOND] > 59
                    ? SECOND
                    : a[MILLISECOND] < 0 || a[MILLISECOND] > 999
                    ? MILLISECOND
                    : -1;

            if (
                getParsingFlags(m)._overflowDayOfYear &&
                (overflow < YEAR || overflow > DATE)
            ) {
                overflow = DATE;
            }
            if (getParsingFlags(m)._overflowWeeks && overflow === -1) {
                overflow = WEEK;
            }
            if (getParsingFlags(m)._overflowWeekday && overflow === -1) {
                overflow = WEEKDAY;
            }

            getParsingFlags(m).overflow = overflow;
        }

        return m;
    }

    // iso 8601 regex
    // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
    var extendedIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
        basicIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d|))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
        tzRegex = /Z|[+-]\d\d(?::?\d\d)?/,
        isoDates = [
            ['YYYYYY-MM-DD', /[+-]\d{6}-\d\d-\d\d/],
            ['YYYY-MM-DD', /\d{4}-\d\d-\d\d/],
            ['GGGG-[W]WW-E', /\d{4}-W\d\d-\d/],
            ['GGGG-[W]WW', /\d{4}-W\d\d/, false],
            ['YYYY-DDD', /\d{4}-\d{3}/],
            ['YYYY-MM', /\d{4}-\d\d/, false],
            ['YYYYYYMMDD', /[+-]\d{10}/],
            ['YYYYMMDD', /\d{8}/],
            ['GGGG[W]WWE', /\d{4}W\d{3}/],
            ['GGGG[W]WW', /\d{4}W\d{2}/, false],
            ['YYYYDDD', /\d{7}/],
            ['YYYYMM', /\d{6}/, false],
            ['YYYY', /\d{4}/, false],
        ],
        // iso time formats and regexes
        isoTimes = [
            ['HH:mm:ss.SSSS', /\d\d:\d\d:\d\d\.\d+/],
            ['HH:mm:ss,SSSS', /\d\d:\d\d:\d\d,\d+/],
            ['HH:mm:ss', /\d\d:\d\d:\d\d/],
            ['HH:mm', /\d\d:\d\d/],
            ['HHmmss.SSSS', /\d\d\d\d\d\d\.\d+/],
            ['HHmmss,SSSS', /\d\d\d\d\d\d,\d+/],
            ['HHmmss', /\d\d\d\d\d\d/],
            ['HHmm', /\d\d\d\d/],
            ['HH', /\d\d/],
        ],
        aspNetJsonRegex = /^\/?Date\((-?\d+)/i,
        // RFC 2822 regex: For details see https://tools.ietf.org/html/rfc2822#section-3.3
        rfc2822 = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/,
        obsOffsets = {
            UT: 0,
            GMT: 0,
            EDT: -4 * 60,
            EST: -5 * 60,
            CDT: -5 * 60,
            CST: -6 * 60,
            MDT: -6 * 60,
            MST: -7 * 60,
            PDT: -7 * 60,
            PST: -8 * 60,
        };

    // date from iso format
    function configFromISO(config) {
        var i,
            l,
            string = config._i,
            match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string),
            allowTime,
            dateFormat,
            timeFormat,
            tzFormat;

        if (match) {
            getParsingFlags(config).iso = true;

            for (i = 0, l = isoDates.length; i < l; i++) {
                if (isoDates[i][1].exec(match[1])) {
                    dateFormat = isoDates[i][0];
                    allowTime = isoDates[i][2] !== false;
                    break;
                }
            }
            if (dateFormat == null) {
                config._isValid = false;
                return;
            }
            if (match[3]) {
                for (i = 0, l = isoTimes.length; i < l; i++) {
                    if (isoTimes[i][1].exec(match[3])) {
                        // match[2] should be 'T' or space
                        timeFormat = (match[2] || ' ') + isoTimes[i][0];
                        break;
                    }
                }
                if (timeFormat == null) {
                    config._isValid = false;
                    return;
                }
            }
            if (!allowTime && timeFormat != null) {
                config._isValid = false;
                return;
            }
            if (match[4]) {
                if (tzRegex.exec(match[4])) {
                    tzFormat = 'Z';
                } else {
                    config._isValid = false;
                    return;
                }
            }
            config._f = dateFormat + (timeFormat || '') + (tzFormat || '');
            configFromStringAndFormat(config);
        } else {
            config._isValid = false;
        }
    }

    function extractFromRFC2822Strings(
        yearStr,
        monthStr,
        dayStr,
        hourStr,
        minuteStr,
        secondStr
    ) {
        var result = [
            untruncateYear(yearStr),
            defaultLocaleMonthsShort.indexOf(monthStr),
            parseInt(dayStr, 10),
            parseInt(hourStr, 10),
            parseInt(minuteStr, 10),
        ];

        if (secondStr) {
            result.push(parseInt(secondStr, 10));
        }

        return result;
    }

    function untruncateYear(yearStr) {
        var year = parseInt(yearStr, 10);
        if (year <= 49) {
            return 2000 + year;
        } else if (year <= 999) {
            return 1900 + year;
        }
        return year;
    }

    function preprocessRFC2822(s) {
        // Remove comments and folding whitespace and replace multiple-spaces with a single space
        return s
            .replace(/\([^)]*\)|[\n\t]/g, ' ')
            .replace(/(\s\s+)/g, ' ')
            .replace(/^\s\s*/, '')
            .replace(/\s\s*$/, '');
    }

    function checkWeekday(weekdayStr, parsedInput, config) {
        if (weekdayStr) {
            // TODO: Replace the vanilla JS Date object with an independent day-of-week check.
            var weekdayProvided = defaultLocaleWeekdaysShort.indexOf(weekdayStr),
                weekdayActual = new Date(
                    parsedInput[0],
                    parsedInput[1],
                    parsedInput[2]
                ).getDay();
            if (weekdayProvided !== weekdayActual) {
                getParsingFlags(config).weekdayMismatch = true;
                config._isValid = false;
                return false;
            }
        }
        return true;
    }

    function calculateOffset(obsOffset, militaryOffset, numOffset) {
        if (obsOffset) {
            return obsOffsets[obsOffset];
        } else if (militaryOffset) {
            // the only allowed military tz is Z
            return 0;
        } else {
            var hm = parseInt(numOffset, 10),
                m = hm % 100,
                h = (hm - m) / 100;
            return h * 60 + m;
        }
    }

    // date and time from ref 2822 format
    function configFromRFC2822(config) {
        var match = rfc2822.exec(preprocessRFC2822(config._i)),
            parsedArray;
        if (match) {
            parsedArray = extractFromRFC2822Strings(
                match[4],
                match[3],
                match[2],
                match[5],
                match[6],
                match[7]
            );
            if (!checkWeekday(match[1], parsedArray, config)) {
                return;
            }

            config._a = parsedArray;
            config._tzm = calculateOffset(match[8], match[9], match[10]);

            config._d = createUTCDate.apply(null, config._a);
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);

            getParsingFlags(config).rfc2822 = true;
        } else {
            config._isValid = false;
        }
    }

    // date from 1) ASP.NET, 2) ISO, 3) RFC 2822 formats, or 4) optional fallback if parsing isn't strict
    function configFromString(config) {
        var matched = aspNetJsonRegex.exec(config._i);
        if (matched !== null) {
            config._d = new Date(+matched[1]);
            return;
        }

        configFromISO(config);
        if (config._isValid === false) {
            delete config._isValid;
        } else {
            return;
        }

        configFromRFC2822(config);
        if (config._isValid === false) {
            delete config._isValid;
        } else {
            return;
        }

        if (config._strict) {
            config._isValid = false;
        } else {
            // Final attempt, use Input Fallback
            hooks.createFromInputFallback(config);
        }
    }

    hooks.createFromInputFallback = deprecate(
        'value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), ' +
            'which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are ' +
            'discouraged. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.',
        function (config) {
            config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
        }
    );

    // Pick the first defined of two or three arguments.
    function defaults(a, b, c) {
        if (a != null) {
            return a;
        }
        if (b != null) {
            return b;
        }
        return c;
    }

    function currentDateArray(config) {
        // hooks is actually the exported moment object
        var nowValue = new Date(hooks.now());
        if (config._useUTC) {
            return [
                nowValue.getUTCFullYear(),
                nowValue.getUTCMonth(),
                nowValue.getUTCDate(),
            ];
        }
        return [nowValue.getFullYear(), nowValue.getMonth(), nowValue.getDate()];
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function configFromArray(config) {
        var i,
            date,
            input = [],
            currentDate,
            expectedWeekday,
            yearToUse;

        if (config._d) {
            return;
        }

        currentDate = currentDateArray(config);

        //compute day of the year from weeks and weekdays
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
            dayOfYearFromWeekInfo(config);
        }

        //if the day of the year is set, figure out what it is
        if (config._dayOfYear != null) {
            yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);

            if (
                config._dayOfYear > daysInYear(yearToUse) ||
                config._dayOfYear === 0
            ) {
                getParsingFlags(config)._overflowDayOfYear = true;
            }

            date = createUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }

        // Default to current date.
        // * if no year, month, day of month are given, default to today
        // * if day of month is given, default month and year
        // * if month is given, default only year
        // * if year is given, don't default anything
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
            config._a[i] = input[i] = currentDate[i];
        }

        // Zero out whatever was not defaulted, including time
        for (; i < 7; i++) {
            config._a[i] = input[i] =
                config._a[i] == null ? (i === 2 ? 1 : 0) : config._a[i];
        }

        // Check for 24:00:00.000
        if (
            config._a[HOUR] === 24 &&
            config._a[MINUTE] === 0 &&
            config._a[SECOND] === 0 &&
            config._a[MILLISECOND] === 0
        ) {
            config._nextDay = true;
            config._a[HOUR] = 0;
        }

        config._d = (config._useUTC ? createUTCDate : createDate).apply(
            null,
            input
        );
        expectedWeekday = config._useUTC
            ? config._d.getUTCDay()
            : config._d.getDay();

        // Apply timezone offset from input. The actual utcOffset can be changed
        // with parseZone.
        if (config._tzm != null) {
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
        }

        if (config._nextDay) {
            config._a[HOUR] = 24;
        }

        // check for mismatching day of week
        if (
            config._w &&
            typeof config._w.d !== 'undefined' &&
            config._w.d !== expectedWeekday
        ) {
            getParsingFlags(config).weekdayMismatch = true;
        }
    }

    function dayOfYearFromWeekInfo(config) {
        var w, weekYear, week, weekday, dow, doy, temp, weekdayOverflow, curWeek;

        w = config._w;
        if (w.GG != null || w.W != null || w.E != null) {
            dow = 1;
            doy = 4;

            // TODO: We need to take the current isoWeekYear, but that depends on
            // how we interpret now (local, utc, fixed offset). So create
            // a now version of current config (take local/utc/offset flags, and
            // create now).
            weekYear = defaults(
                w.GG,
                config._a[YEAR],
                weekOfYear(createLocal(), 1, 4).year
            );
            week = defaults(w.W, 1);
            weekday = defaults(w.E, 1);
            if (weekday < 1 || weekday > 7) {
                weekdayOverflow = true;
            }
        } else {
            dow = config._locale._week.dow;
            doy = config._locale._week.doy;

            curWeek = weekOfYear(createLocal(), dow, doy);

            weekYear = defaults(w.gg, config._a[YEAR], curWeek.year);

            // Default to current week.
            week = defaults(w.w, curWeek.week);

            if (w.d != null) {
                // weekday -- low day numbers are considered next week
                weekday = w.d;
                if (weekday < 0 || weekday > 6) {
                    weekdayOverflow = true;
                }
            } else if (w.e != null) {
                // local weekday -- counting starts from beginning of week
                weekday = w.e + dow;
                if (w.e < 0 || w.e > 6) {
                    weekdayOverflow = true;
                }
            } else {
                // default to beginning of week
                weekday = dow;
            }
        }
        if (week < 1 || week > weeksInYear(weekYear, dow, doy)) {
            getParsingFlags(config)._overflowWeeks = true;
        } else if (weekdayOverflow != null) {
            getParsingFlags(config)._overflowWeekday = true;
        } else {
            temp = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy);
            config._a[YEAR] = temp.year;
            config._dayOfYear = temp.dayOfYear;
        }
    }

    // constant that refers to the ISO standard
    hooks.ISO_8601 = function () {};

    // constant that refers to the RFC 2822 form
    hooks.RFC_2822 = function () {};

    // date from string and format string
    function configFromStringAndFormat(config) {
        // TODO: Move this to another part of the creation flow to prevent circular deps
        if (config._f === hooks.ISO_8601) {
            configFromISO(config);
            return;
        }
        if (config._f === hooks.RFC_2822) {
            configFromRFC2822(config);
            return;
        }
        config._a = [];
        getParsingFlags(config).empty = true;

        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var string = '' + config._i,
            i,
            parsedInput,
            tokens,
            token,
            skipped,
            stringLength = string.length,
            totalParsedInputLength = 0,
            era;

        tokens =
            expandFormat(config._f, config._locale).match(formattingTokens) || [];

        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) ||
                [])[0];
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0) {
                    getParsingFlags(config).unusedInput.push(skipped);
                }
                string = string.slice(
                    string.indexOf(parsedInput) + parsedInput.length
                );
                totalParsedInputLength += parsedInput.length;
            }
            // don't parse if it's not a known token
            if (formatTokenFunctions[token]) {
                if (parsedInput) {
                    getParsingFlags(config).empty = false;
                } else {
                    getParsingFlags(config).unusedTokens.push(token);
                }
                addTimeToArrayFromToken(token, parsedInput, config);
            } else if (config._strict && !parsedInput) {
                getParsingFlags(config).unusedTokens.push(token);
            }
        }

        // add remaining unparsed input length to the string
        getParsingFlags(config).charsLeftOver =
            stringLength - totalParsedInputLength;
        if (string.length > 0) {
            getParsingFlags(config).unusedInput.push(string);
        }

        // clear _12h flag if hour is <= 12
        if (
            config._a[HOUR] <= 12 &&
            getParsingFlags(config).bigHour === true &&
            config._a[HOUR] > 0
        ) {
            getParsingFlags(config).bigHour = undefined;
        }

        getParsingFlags(config).parsedDateParts = config._a.slice(0);
        getParsingFlags(config).meridiem = config._meridiem;
        // handle meridiem
        config._a[HOUR] = meridiemFixWrap(
            config._locale,
            config._a[HOUR],
            config._meridiem
        );

        // handle era
        era = getParsingFlags(config).era;
        if (era !== null) {
            config._a[YEAR] = config._locale.erasConvertYear(era, config._a[YEAR]);
        }

        configFromArray(config);
        checkOverflow(config);
    }

    function meridiemFixWrap(locale, hour, meridiem) {
        var isPm;

        if (meridiem == null) {
            // nothing to do
            return hour;
        }
        if (locale.meridiemHour != null) {
            return locale.meridiemHour(hour, meridiem);
        } else if (locale.isPM != null) {
            // Fallback
            isPm = locale.isPM(meridiem);
            if (isPm && hour < 12) {
                hour += 12;
            }
            if (!isPm && hour === 12) {
                hour = 0;
            }
            return hour;
        } else {
            // this is not supposed to happen
            return hour;
        }
    }

    // date from string and array of format strings
    function configFromStringAndArray(config) {
        var tempConfig,
            bestMoment,
            scoreToBeat,
            i,
            currentScore,
            validFormatFound,
            bestFormatIsValid = false;

        if (config._f.length === 0) {
            getParsingFlags(config).invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }

        for (i = 0; i < config._f.length; i++) {
            currentScore = 0;
            validFormatFound = false;
            tempConfig = copyConfig({}, config);
            if (config._useUTC != null) {
                tempConfig._useUTC = config._useUTC;
            }
            tempConfig._f = config._f[i];
            configFromStringAndFormat(tempConfig);

            if (isValid(tempConfig)) {
                validFormatFound = true;
            }

            // if there is any input that was not parsed add a penalty for that format
            currentScore += getParsingFlags(tempConfig).charsLeftOver;

            //or tokens
            currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;

            getParsingFlags(tempConfig).score = currentScore;

            if (!bestFormatIsValid) {
                if (
                    scoreToBeat == null ||
                    currentScore < scoreToBeat ||
                    validFormatFound
                ) {
                    scoreToBeat = currentScore;
                    bestMoment = tempConfig;
                    if (validFormatFound) {
                        bestFormatIsValid = true;
                    }
                }
            } else {
                if (currentScore < scoreToBeat) {
                    scoreToBeat = currentScore;
                    bestMoment = tempConfig;
                }
            }
        }

        extend(config, bestMoment || tempConfig);
    }

    function configFromObject(config) {
        if (config._d) {
            return;
        }

        var i = normalizeObjectUnits(config._i),
            dayOrDate = i.day === undefined ? i.date : i.day;
        config._a = map(
            [i.year, i.month, dayOrDate, i.hour, i.minute, i.second, i.millisecond],
            function (obj) {
                return obj && parseInt(obj, 10);
            }
        );

        configFromArray(config);
    }

    function createFromConfig(config) {
        var res = new Moment(checkOverflow(prepareConfig(config)));
        if (res._nextDay) {
            // Adding is smart enough around DST
            res.add(1, 'd');
            res._nextDay = undefined;
        }

        return res;
    }

    function prepareConfig(config) {
        var input = config._i,
            format = config._f;

        config._locale = config._locale || getLocale(config._l);

        if (input === null || (format === undefined && input === '')) {
            return createInvalid({ nullInput: true });
        }

        if (typeof input === 'string') {
            config._i = input = config._locale.preparse(input);
        }

        if (isMoment(input)) {
            return new Moment(checkOverflow(input));
        } else if (isDate(input)) {
            config._d = input;
        } else if (isArray(format)) {
            configFromStringAndArray(config);
        } else if (format) {
            configFromStringAndFormat(config);
        } else {
            configFromInput(config);
        }

        if (!isValid(config)) {
            config._d = null;
        }

        return config;
    }

    function configFromInput(config) {
        var input = config._i;
        if (isUndefined(input)) {
            config._d = new Date(hooks.now());
        } else if (isDate(input)) {
            config._d = new Date(input.valueOf());
        } else if (typeof input === 'string') {
            configFromString(config);
        } else if (isArray(input)) {
            config._a = map(input.slice(0), function (obj) {
                return parseInt(obj, 10);
            });
            configFromArray(config);
        } else if (isObject(input)) {
            configFromObject(config);
        } else if (isNumber(input)) {
            // from milliseconds
            config._d = new Date(input);
        } else {
            hooks.createFromInputFallback(config);
        }
    }

    function createLocalOrUTC(input, format, locale, strict, isUTC) {
        var c = {};

        if (format === true || format === false) {
            strict = format;
            format = undefined;
        }

        if (locale === true || locale === false) {
            strict = locale;
            locale = undefined;
        }

        if (
            (isObject(input) && isObjectEmpty(input)) ||
            (isArray(input) && input.length === 0)
        ) {
            input = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c._isAMomentObject = true;
        c._useUTC = c._isUTC = isUTC;
        c._l = locale;
        c._i = input;
        c._f = format;
        c._strict = strict;

        return createFromConfig(c);
    }

    function createLocal(input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, false);
    }

    var prototypeMin = deprecate(
            'moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/',
            function () {
                var other = createLocal.apply(null, arguments);
                if (this.isValid() && other.isValid()) {
                    return other < this ? this : other;
                } else {
                    return createInvalid();
                }
            }
        ),
        prototypeMax = deprecate(
            'moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/',
            function () {
                var other = createLocal.apply(null, arguments);
                if (this.isValid() && other.isValid()) {
                    return other > this ? this : other;
                } else {
                    return createInvalid();
                }
            }
        );

    // Pick a moment m from moments so that m[fn](other) is true for all
    // other. This relies on the function fn to be transitive.
    //
    // moments should either be an array of moment objects or an array, whose
    // first element is an array of moment objects.
    function pickBy(fn, moments) {
        var res, i;
        if (moments.length === 1 && isArray(moments[0])) {
            moments = moments[0];
        }
        if (!moments.length) {
            return createLocal();
        }
        res = moments[0];
        for (i = 1; i < moments.length; ++i) {
            if (!moments[i].isValid() || moments[i][fn](res)) {
                res = moments[i];
            }
        }
        return res;
    }

    // TODO: Use [].sort instead?
    function min() {
        var args = [].slice.call(arguments, 0);

        return pickBy('isBefore', args);
    }

    function max() {
        var args = [].slice.call(arguments, 0);

        return pickBy('isAfter', args);
    }

    var now = function () {
        return Date.now ? Date.now() : +new Date();
    };

    var ordering = [
        'year',
        'quarter',
        'month',
        'week',
        'day',
        'hour',
        'minute',
        'second',
        'millisecond',
    ];

    function isDurationValid(m) {
        var key,
            unitHasDecimal = false,
            i;
        for (key in m) {
            if (
                hasOwnProp(m, key) &&
                !(
                    indexOf.call(ordering, key) !== -1 &&
                    (m[key] == null || !isNaN(m[key]))
                )
            ) {
                return false;
            }
        }

        for (i = 0; i < ordering.length; ++i) {
            if (m[ordering[i]]) {
                if (unitHasDecimal) {
                    return false; // only allow non-integers for smallest unit
                }
                if (parseFloat(m[ordering[i]]) !== toInt(m[ordering[i]])) {
                    unitHasDecimal = true;
                }
            }
        }

        return true;
    }

    function isValid$1() {
        return this._isValid;
    }

    function createInvalid$1() {
        return createDuration(NaN);
    }

    function Duration(duration) {
        var normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            quarters = normalizedInput.quarter || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || normalizedInput.isoWeek || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;

        this._isValid = isDurationValid(normalizedInput);

        // representation for dateAddRemove
        this._milliseconds =
            +milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 1000 * 60 * 60; //using 1000 * 60 * 60 instead of 36e5 to avoid floating point rounding errors https://github.com/moment/moment/issues/2978
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = +days + weeks * 7;
        // It is impossible to translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = +months + quarters * 3 + years * 12;

        this._data = {};

        this._locale = getLocale();

        this._bubble();
    }

    function isDuration(obj) {
        return obj instanceof Duration;
    }

    function absRound(number) {
        if (number < 0) {
            return Math.round(-1 * number) * -1;
        } else {
            return Math.round(number);
        }
    }

    // compare two arrays, return the number of differences
    function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if (
                (dontConvert && array1[i] !== array2[i]) ||
                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))
            ) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    // FORMATTING

    function offset(token, separator) {
        addFormatToken(token, 0, 0, function () {
            var offset = this.utcOffset(),
                sign = '+';
            if (offset < 0) {
                offset = -offset;
                sign = '-';
            }
            return (
                sign +
                zeroFill(~~(offset / 60), 2) +
                separator +
                zeroFill(~~offset % 60, 2)
            );
        });
    }

    offset('Z', ':');
    offset('ZZ', '');

    // PARSING

    addRegexToken('Z', matchShortOffset);
    addRegexToken('ZZ', matchShortOffset);
    addParseToken(['Z', 'ZZ'], function (input, array, config) {
        config._useUTC = true;
        config._tzm = offsetFromString(matchShortOffset, input);
    });

    // HELPERS

    // timezone chunker
    // '+10:00' > ['10',  '00']
    // '-1530'  > ['-15', '30']
    var chunkOffset = /([\+\-]|\d\d)/gi;

    function offsetFromString(matcher, string) {
        var matches = (string || '').match(matcher),
            chunk,
            parts,
            minutes;

        if (matches === null) {
            return null;
        }

        chunk = matches[matches.length - 1] || [];
        parts = (chunk + '').match(chunkOffset) || ['-', 0, 0];
        minutes = +(parts[1] * 60) + toInt(parts[2]);

        return minutes === 0 ? 0 : parts[0] === '+' ? minutes : -minutes;
    }

    // Return a moment from input, that is local/utc/zone equivalent to model.
    function cloneWithOffset(input, model) {
        var res, diff;
        if (model._isUTC) {
            res = model.clone();
            diff =
                (isMoment(input) || isDate(input)
                    ? input.valueOf()
                    : createLocal(input).valueOf()) - res.valueOf();
            // Use low-level api, because this fn is low-level api.
            res._d.setTime(res._d.valueOf() + diff);
            hooks.updateOffset(res, false);
            return res;
        } else {
            return createLocal(input).local();
        }
    }

    function getDateOffset(m) {
        // On Firefox.24 Date#getTimezoneOffset returns a floating point.
        // https://github.com/moment/moment/pull/1871
        return -Math.round(m._d.getTimezoneOffset());
    }

    // HOOKS

    // This function will be called whenever a moment is mutated.
    // It is intended to keep the offset in sync with the timezone.
    hooks.updateOffset = function () {};

    // MOMENTS

    // keepLocalTime = true means only change the timezone, without
    // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
    // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
    // +0200, so we adjust the time as needed, to be valid.
    //
    // Keeping the time actually adds/subtracts (one hour)
    // from the actual represented time. That is why we call updateOffset
    // a second time. In case it wants us to change the offset again
    // _changeInProgress == true case, then we have to adjust, because
    // there is no such time in the given timezone.
    function getSetOffset(input, keepLocalTime, keepMinutes) {
        var offset = this._offset || 0,
            localAdjust;
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        if (input != null) {
            if (typeof input === 'string') {
                input = offsetFromString(matchShortOffset, input);
                if (input === null) {
                    return this;
                }
            } else if (Math.abs(input) < 16 && !keepMinutes) {
                input = input * 60;
            }
            if (!this._isUTC && keepLocalTime) {
                localAdjust = getDateOffset(this);
            }
            this._offset = input;
            this._isUTC = true;
            if (localAdjust != null) {
                this.add(localAdjust, 'm');
            }
            if (offset !== input) {
                if (!keepLocalTime || this._changeInProgress) {
                    addSubtract(
                        this,
                        createDuration(input - offset, 'm'),
                        1,
                        false
                    );
                } else if (!this._changeInProgress) {
                    this._changeInProgress = true;
                    hooks.updateOffset(this, true);
                    this._changeInProgress = null;
                }
            }
            return this;
        } else {
            return this._isUTC ? offset : getDateOffset(this);
        }
    }

    function getSetZone(input, keepLocalTime) {
        if (input != null) {
            if (typeof input !== 'string') {
                input = -input;
            }

            this.utcOffset(input, keepLocalTime);

            return this;
        } else {
            return -this.utcOffset();
        }
    }

    function setOffsetToUTC(keepLocalTime) {
        return this.utcOffset(0, keepLocalTime);
    }

    function setOffsetToLocal(keepLocalTime) {
        if (this._isUTC) {
            this.utcOffset(0, keepLocalTime);
            this._isUTC = false;

            if (keepLocalTime) {
                this.subtract(getDateOffset(this), 'm');
            }
        }
        return this;
    }

    function setOffsetToParsedOffset() {
        if (this._tzm != null) {
            this.utcOffset(this._tzm, false, true);
        } else if (typeof this._i === 'string') {
            var tZone = offsetFromString(matchOffset, this._i);
            if (tZone != null) {
                this.utcOffset(tZone);
            } else {
                this.utcOffset(0, true);
            }
        }
        return this;
    }

    function hasAlignedHourOffset(input) {
        if (!this.isValid()) {
            return false;
        }
        input = input ? createLocal(input).utcOffset() : 0;

        return (this.utcOffset() - input) % 60 === 0;
    }

    function isDaylightSavingTime() {
        return (
            this.utcOffset() > this.clone().month(0).utcOffset() ||
            this.utcOffset() > this.clone().month(5).utcOffset()
        );
    }

    function isDaylightSavingTimeShifted() {
        if (!isUndefined(this._isDSTShifted)) {
            return this._isDSTShifted;
        }

        var c = {},
            other;

        copyConfig(c, this);
        c = prepareConfig(c);

        if (c._a) {
            other = c._isUTC ? createUTC(c._a) : createLocal(c._a);
            this._isDSTShifted =
                this.isValid() && compareArrays(c._a, other.toArray()) > 0;
        } else {
            this._isDSTShifted = false;
        }

        return this._isDSTShifted;
    }

    function isLocal() {
        return this.isValid() ? !this._isUTC : false;
    }

    function isUtcOffset() {
        return this.isValid() ? this._isUTC : false;
    }

    function isUtc() {
        return this.isValid() ? this._isUTC && this._offset === 0 : false;
    }

    // ASP.NET json date format regex
    var aspNetRegex = /^(-|\+)?(?:(\d*)[. ])?(\d+):(\d+)(?::(\d+)(\.\d*)?)?$/,
        // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
        // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
        // and further modified to allow for strings containing both week and day
        isoRegex = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;

    function createDuration(input, key) {
        var duration = input,
            // matching against regexp is expensive, do it on demand
            match = null,
            sign,
            ret,
            diffRes;

        if (isDuration(input)) {
            duration = {
                ms: input._milliseconds,
                d: input._days,
                M: input._months,
            };
        } else if (isNumber(input) || !isNaN(+input)) {
            duration = {};
            if (key) {
                duration[key] = +input;
            } else {
                duration.milliseconds = +input;
            }
        } else if ((match = aspNetRegex.exec(input))) {
            sign = match[1] === '-' ? -1 : 1;
            duration = {
                y: 0,
                d: toInt(match[DATE]) * sign,
                h: toInt(match[HOUR]) * sign,
                m: toInt(match[MINUTE]) * sign,
                s: toInt(match[SECOND]) * sign,
                ms: toInt(absRound(match[MILLISECOND] * 1000)) * sign, // the millisecond decimal point is included in the match
            };
        } else if ((match = isoRegex.exec(input))) {
            sign = match[1] === '-' ? -1 : 1;
            duration = {
                y: parseIso(match[2], sign),
                M: parseIso(match[3], sign),
                w: parseIso(match[4], sign),
                d: parseIso(match[5], sign),
                h: parseIso(match[6], sign),
                m: parseIso(match[7], sign),
                s: parseIso(match[8], sign),
            };
        } else if (duration == null) {
            // checks for null or undefined
            duration = {};
        } else if (
            typeof duration === 'object' &&
            ('from' in duration || 'to' in duration)
        ) {
            diffRes = momentsDifference(
                createLocal(duration.from),
                createLocal(duration.to)
            );

            duration = {};
            duration.ms = diffRes.milliseconds;
            duration.M = diffRes.months;
        }

        ret = new Duration(duration);

        if (isDuration(input) && hasOwnProp(input, '_locale')) {
            ret._locale = input._locale;
        }

        if (isDuration(input) && hasOwnProp(input, '_isValid')) {
            ret._isValid = input._isValid;
        }

        return ret;
    }

    createDuration.fn = Duration.prototype;
    createDuration.invalid = createInvalid$1;

    function parseIso(inp, sign) {
        // We'd normally use ~~inp for this, but unfortunately it also
        // converts floats to ints.
        // inp may be undefined, so careful calling replace on it.
        var res = inp && parseFloat(inp.replace(',', '.'));
        // apply sign while we're at it
        return (isNaN(res) ? 0 : res) * sign;
    }

    function positiveMomentsDifference(base, other) {
        var res = {};

        res.months =
            other.month() - base.month() + (other.year() - base.year()) * 12;
        if (base.clone().add(res.months, 'M').isAfter(other)) {
            --res.months;
        }

        res.milliseconds = +other - +base.clone().add(res.months, 'M');

        return res;
    }

    function momentsDifference(base, other) {
        var res;
        if (!(base.isValid() && other.isValid())) {
            return { milliseconds: 0, months: 0 };
        }

        other = cloneWithOffset(other, base);
        if (base.isBefore(other)) {
            res = positiveMomentsDifference(base, other);
        } else {
            res = positiveMomentsDifference(other, base);
            res.milliseconds = -res.milliseconds;
            res.months = -res.months;
        }

        return res;
    }

    // TODO: remove 'name' arg after deprecation is removed
    function createAdder(direction, name) {
        return function (val, period) {
            var dur, tmp;
            //invert the arguments, but complain about it
            if (period !== null && !isNaN(+period)) {
                deprecateSimple(
                    name,
                    'moment().' +
                        name +
                        '(period, number) is deprecated. Please use moment().' +
                        name +
                        '(number, period). ' +
                        'See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info.'
                );
                tmp = val;
                val = period;
                period = tmp;
            }

            dur = createDuration(val, period);
            addSubtract(this, dur, direction);
            return this;
        };
    }

    function addSubtract(mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds,
            days = absRound(duration._days),
            months = absRound(duration._months);

        if (!mom.isValid()) {
            // No op
            return;
        }

        updateOffset = updateOffset == null ? true : updateOffset;

        if (months) {
            setMonth(mom, get(mom, 'Month') + months * isAdding);
        }
        if (days) {
            set$1(mom, 'Date', get(mom, 'Date') + days * isAdding);
        }
        if (milliseconds) {
            mom._d.setTime(mom._d.valueOf() + milliseconds * isAdding);
        }
        if (updateOffset) {
            hooks.updateOffset(mom, days || months);
        }
    }

    var add = createAdder(1, 'add'),
        subtract = createAdder(-1, 'subtract');

    function isString(input) {
        return typeof input === 'string' || input instanceof String;
    }

    // type MomentInput = Moment | Date | string | number | (number | string)[] | MomentInputObject | void; // null | undefined
    function isMomentInput(input) {
        return (
            isMoment(input) ||
            isDate(input) ||
            isString(input) ||
            isNumber(input) ||
            isNumberOrStringArray(input) ||
            isMomentInputObject(input) ||
            input === null ||
            input === undefined
        );
    }

    function isMomentInputObject(input) {
        var objectTest = isObject(input) && !isObjectEmpty(input),
            propertyTest = false,
            properties = [
                'years',
                'year',
                'y',
                'months',
                'month',
                'M',
                'days',
                'day',
                'd',
                'dates',
                'date',
                'D',
                'hours',
                'hour',
                'h',
                'minutes',
                'minute',
                'm',
                'seconds',
                'second',
                's',
                'milliseconds',
                'millisecond',
                'ms',
            ],
            i,
            property;

        for (i = 0; i < properties.length; i += 1) {
            property = properties[i];
            propertyTest = propertyTest || hasOwnProp(input, property);
        }

        return objectTest && propertyTest;
    }

    function isNumberOrStringArray(input) {
        var arrayTest = isArray(input),
            dataTypeTest = false;
        if (arrayTest) {
            dataTypeTest =
                input.filter(function (item) {
                    return !isNumber(item) && isString(input);
                }).length === 0;
        }
        return arrayTest && dataTypeTest;
    }

    function isCalendarSpec(input) {
        var objectTest = isObject(input) && !isObjectEmpty(input),
            propertyTest = false,
            properties = [
                'sameDay',
                'nextDay',
                'lastDay',
                'nextWeek',
                'lastWeek',
                'sameElse',
            ],
            i,
            property;

        for (i = 0; i < properties.length; i += 1) {
            property = properties[i];
            propertyTest = propertyTest || hasOwnProp(input, property);
        }

        return objectTest && propertyTest;
    }

    function getCalendarFormat(myMoment, now) {
        var diff = myMoment.diff(now, 'days', true);
        return diff < -6
            ? 'sameElse'
            : diff < -1
            ? 'lastWeek'
            : diff < 0
            ? 'lastDay'
            : diff < 1
            ? 'sameDay'
            : diff < 2
            ? 'nextDay'
            : diff < 7
            ? 'nextWeek'
            : 'sameElse';
    }

    function calendar$1(time, formats) {
        // Support for single parameter, formats only overload to the calendar function
        if (arguments.length === 1) {
            if (!arguments[0]) {
                time = undefined;
                formats = undefined;
            } else if (isMomentInput(arguments[0])) {
                time = arguments[0];
                formats = undefined;
            } else if (isCalendarSpec(arguments[0])) {
                formats = arguments[0];
                time = undefined;
            }
        }
        // We want to compare the start of today, vs this.
        // Getting start-of-today depends on whether we're local/utc/offset or not.
        var now = time || createLocal(),
            sod = cloneWithOffset(now, this).startOf('day'),
            format = hooks.calendarFormat(this, sod) || 'sameElse',
            output =
                formats &&
                (isFunction(formats[format])
                    ? formats[format].call(this, now)
                    : formats[format]);

        return this.format(
            output || this.localeData().calendar(format, this, createLocal(now))
        );
    }

    function clone() {
        return new Moment(this);
    }

    function isAfter(input, units) {
        var localInput = isMoment(input) ? input : createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(units) || 'millisecond';
        if (units === 'millisecond') {
            return this.valueOf() > localInput.valueOf();
        } else {
            return localInput.valueOf() < this.clone().startOf(units).valueOf();
        }
    }

    function isBefore(input, units) {
        var localInput = isMoment(input) ? input : createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(units) || 'millisecond';
        if (units === 'millisecond') {
            return this.valueOf() < localInput.valueOf();
        } else {
            return this.clone().endOf(units).valueOf() < localInput.valueOf();
        }
    }

    function isBetween(from, to, units, inclusivity) {
        var localFrom = isMoment(from) ? from : createLocal(from),
            localTo = isMoment(to) ? to : createLocal(to);
        if (!(this.isValid() && localFrom.isValid() && localTo.isValid())) {
            return false;
        }
        inclusivity = inclusivity || '()';
        return (
            (inclusivity[0] === '('
                ? this.isAfter(localFrom, units)
                : !this.isBefore(localFrom, units)) &&
            (inclusivity[1] === ')'
                ? this.isBefore(localTo, units)
                : !this.isAfter(localTo, units))
        );
    }

    function isSame(input, units) {
        var localInput = isMoment(input) ? input : createLocal(input),
            inputMs;
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(units) || 'millisecond';
        if (units === 'millisecond') {
            return this.valueOf() === localInput.valueOf();
        } else {
            inputMs = localInput.valueOf();
            return (
                this.clone().startOf(units).valueOf() <= inputMs &&
                inputMs <= this.clone().endOf(units).valueOf()
            );
        }
    }

    function isSameOrAfter(input, units) {
        return this.isSame(input, units) || this.isAfter(input, units);
    }

    function isSameOrBefore(input, units) {
        return this.isSame(input, units) || this.isBefore(input, units);
    }

    function diff(input, units, asFloat) {
        var that, zoneDelta, output;

        if (!this.isValid()) {
            return NaN;
        }

        that = cloneWithOffset(input, this);

        if (!that.isValid()) {
            return NaN;
        }

        zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4;

        units = normalizeUnits(units);

        switch (units) {
            case 'year':
                output = monthDiff(this, that) / 12;
                break;
            case 'month':
                output = monthDiff(this, that);
                break;
            case 'quarter':
                output = monthDiff(this, that) / 3;
                break;
            case 'second':
                output = (this - that) / 1e3;
                break; // 1000
            case 'minute':
                output = (this - that) / 6e4;
                break; // 1000 * 60
            case 'hour':
                output = (this - that) / 36e5;
                break; // 1000 * 60 * 60
            case 'day':
                output = (this - that - zoneDelta) / 864e5;
                break; // 1000 * 60 * 60 * 24, negate dst
            case 'week':
                output = (this - that - zoneDelta) / 6048e5;
                break; // 1000 * 60 * 60 * 24 * 7, negate dst
            default:
                output = this - that;
        }

        return asFloat ? output : absFloor(output);
    }

    function monthDiff(a, b) {
        if (a.date() < b.date()) {
            // end-of-month calculations work correct when the start month has more
            // days than the end month.
            return -monthDiff(b, a);
        }
        // difference in months
        var wholeMonthDiff = (b.year() - a.year()) * 12 + (b.month() - a.month()),
            // b is in (anchor - 1 month, anchor + 1 month)
            anchor = a.clone().add(wholeMonthDiff, 'months'),
            anchor2,
            adjust;

        if (b - anchor < 0) {
            anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor - anchor2);
        } else {
            anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor2 - anchor);
        }

        //check for negative zero, return zero if negative zero
        return -(wholeMonthDiff + adjust) || 0;
    }

    hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';
    hooks.defaultFormatUtc = 'YYYY-MM-DDTHH:mm:ss[Z]';

    function toString() {
        return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
    }

    function toISOString(keepOffset) {
        if (!this.isValid()) {
            return null;
        }
        var utc = keepOffset !== true,
            m = utc ? this.clone().utc() : this;
        if (m.year() < 0 || m.year() > 9999) {
            return formatMoment(
                m,
                utc
                    ? 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]'
                    : 'YYYYYY-MM-DD[T]HH:mm:ss.SSSZ'
            );
        }
        if (isFunction(Date.prototype.toISOString)) {
            // native implementation is ~50x faster, use it when we can
            if (utc) {
                return this.toDate().toISOString();
            } else {
                return new Date(this.valueOf() + this.utcOffset() * 60 * 1000)
                    .toISOString()
                    .replace('Z', formatMoment(m, 'Z'));
            }
        }
        return formatMoment(
            m,
            utc ? 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]' : 'YYYY-MM-DD[T]HH:mm:ss.SSSZ'
        );
    }

    /**
     * Return a human readable representation of a moment that can
     * also be evaluated to get a new moment which is the same
     *
     * @link https://nodejs.org/dist/latest/docs/api/util.html#util_custom_inspect_function_on_objects
     */
    function inspect() {
        if (!this.isValid()) {
            return 'moment.invalid(/* ' + this._i + ' */)';
        }
        var func = 'moment',
            zone = '',
            prefix,
            year,
            datetime,
            suffix;
        if (!this.isLocal()) {
            func = this.utcOffset() === 0 ? 'moment.utc' : 'moment.parseZone';
            zone = 'Z';
        }
        prefix = '[' + func + '("]';
        year = 0 <= this.year() && this.year() <= 9999 ? 'YYYY' : 'YYYYYY';
        datetime = '-MM-DD[T]HH:mm:ss.SSS';
        suffix = zone + '[")]';

        return this.format(prefix + year + datetime + suffix);
    }

    function format(inputString) {
        if (!inputString) {
            inputString = this.isUtc()
                ? hooks.defaultFormatUtc
                : hooks.defaultFormat;
        }
        var output = formatMoment(this, inputString);
        return this.localeData().postformat(output);
    }

    function from(time, withoutSuffix) {
        if (
            this.isValid() &&
            ((isMoment(time) && time.isValid()) || createLocal(time).isValid())
        ) {
            return createDuration({ to: this, from: time })
                .locale(this.locale())
                .humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function fromNow(withoutSuffix) {
        return this.from(createLocal(), withoutSuffix);
    }

    function to(time, withoutSuffix) {
        if (
            this.isValid() &&
            ((isMoment(time) && time.isValid()) || createLocal(time).isValid())
        ) {
            return createDuration({ from: this, to: time })
                .locale(this.locale())
                .humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function toNow(withoutSuffix) {
        return this.to(createLocal(), withoutSuffix);
    }

    // If passed a locale key, it will set the locale for this
    // instance.  Otherwise, it will return the locale configuration
    // variables for this instance.
    function locale(key) {
        var newLocaleData;

        if (key === undefined) {
            return this._locale._abbr;
        } else {
            newLocaleData = getLocale(key);
            if (newLocaleData != null) {
                this._locale = newLocaleData;
            }
            return this;
        }
    }

    var lang = deprecate(
        'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
        function (key) {
            if (key === undefined) {
                return this.localeData();
            } else {
                return this.locale(key);
            }
        }
    );

    function localeData() {
        return this._locale;
    }

    var MS_PER_SECOND = 1000,
        MS_PER_MINUTE = 60 * MS_PER_SECOND,
        MS_PER_HOUR = 60 * MS_PER_MINUTE,
        MS_PER_400_YEARS = (365 * 400 + 97) * 24 * MS_PER_HOUR;

    // actual modulo - handles negative numbers (for dates before 1970):
    function mod$1(dividend, divisor) {
        return ((dividend % divisor) + divisor) % divisor;
    }

    function localStartOfDate(y, m, d) {
        // the date constructor remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0) {
            // preserve leap years using a full 400 year cycle, then reset
            return new Date(y + 400, m, d) - MS_PER_400_YEARS;
        } else {
            return new Date(y, m, d).valueOf();
        }
    }

    function utcStartOfDate(y, m, d) {
        // Date.UTC remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0) {
            // preserve leap years using a full 400 year cycle, then reset
            return Date.UTC(y + 400, m, d) - MS_PER_400_YEARS;
        } else {
            return Date.UTC(y, m, d);
        }
    }

    function startOf(units) {
        var time, startOfDate;
        units = normalizeUnits(units);
        if (units === undefined || units === 'millisecond' || !this.isValid()) {
            return this;
        }

        startOfDate = this._isUTC ? utcStartOfDate : localStartOfDate;

        switch (units) {
            case 'year':
                time = startOfDate(this.year(), 0, 1);
                break;
            case 'quarter':
                time = startOfDate(
                    this.year(),
                    this.month() - (this.month() % 3),
                    1
                );
                break;
            case 'month':
                time = startOfDate(this.year(), this.month(), 1);
                break;
            case 'week':
                time = startOfDate(
                    this.year(),
                    this.month(),
                    this.date() - this.weekday()
                );
                break;
            case 'isoWeek':
                time = startOfDate(
                    this.year(),
                    this.month(),
                    this.date() - (this.isoWeekday() - 1)
                );
                break;
            case 'day':
            case 'date':
                time = startOfDate(this.year(), this.month(), this.date());
                break;
            case 'hour':
                time = this._d.valueOf();
                time -= mod$1(
                    time + (this._isUTC ? 0 : this.utcOffset() * MS_PER_MINUTE),
                    MS_PER_HOUR
                );
                break;
            case 'minute':
                time = this._d.valueOf();
                time -= mod$1(time, MS_PER_MINUTE);
                break;
            case 'second':
                time = this._d.valueOf();
                time -= mod$1(time, MS_PER_SECOND);
                break;
        }

        this._d.setTime(time);
        hooks.updateOffset(this, true);
        return this;
    }

    function endOf(units) {
        var time, startOfDate;
        units = normalizeUnits(units);
        if (units === undefined || units === 'millisecond' || !this.isValid()) {
            return this;
        }

        startOfDate = this._isUTC ? utcStartOfDate : localStartOfDate;

        switch (units) {
            case 'year':
                time = startOfDate(this.year() + 1, 0, 1) - 1;
                break;
            case 'quarter':
                time =
                    startOfDate(
                        this.year(),
                        this.month() - (this.month() % 3) + 3,
                        1
                    ) - 1;
                break;
            case 'month':
                time = startOfDate(this.year(), this.month() + 1, 1) - 1;
                break;
            case 'week':
                time =
                    startOfDate(
                        this.year(),
                        this.month(),
                        this.date() - this.weekday() + 7
                    ) - 1;
                break;
            case 'isoWeek':
                time =
                    startOfDate(
                        this.year(),
                        this.month(),
                        this.date() - (this.isoWeekday() - 1) + 7
                    ) - 1;
                break;
            case 'day':
            case 'date':
                time = startOfDate(this.year(), this.month(), this.date() + 1) - 1;
                break;
            case 'hour':
                time = this._d.valueOf();
                time +=
                    MS_PER_HOUR -
                    mod$1(
                        time + (this._isUTC ? 0 : this.utcOffset() * MS_PER_MINUTE),
                        MS_PER_HOUR
                    ) -
                    1;
                break;
            case 'minute':
                time = this._d.valueOf();
                time += MS_PER_MINUTE - mod$1(time, MS_PER_MINUTE) - 1;
                break;
            case 'second':
                time = this._d.valueOf();
                time += MS_PER_SECOND - mod$1(time, MS_PER_SECOND) - 1;
                break;
        }

        this._d.setTime(time);
        hooks.updateOffset(this, true);
        return this;
    }

    function valueOf() {
        return this._d.valueOf() - (this._offset || 0) * 60000;
    }

    function unix() {
        return Math.floor(this.valueOf() / 1000);
    }

    function toDate() {
        return new Date(this.valueOf());
    }

    function toArray() {
        var m = this;
        return [
            m.year(),
            m.month(),
            m.date(),
            m.hour(),
            m.minute(),
            m.second(),
            m.millisecond(),
        ];
    }

    function toObject() {
        var m = this;
        return {
            years: m.year(),
            months: m.month(),
            date: m.date(),
            hours: m.hours(),
            minutes: m.minutes(),
            seconds: m.seconds(),
            milliseconds: m.milliseconds(),
        };
    }

    function toJSON() {
        // new Date(NaN).toJSON() === null
        return this.isValid() ? this.toISOString() : null;
    }

    function isValid$2() {
        return isValid(this);
    }

    function parsingFlags() {
        return extend({}, getParsingFlags(this));
    }

    function invalidAt() {
        return getParsingFlags(this).overflow;
    }

    function creationData() {
        return {
            input: this._i,
            format: this._f,
            locale: this._locale,
            isUTC: this._isUTC,
            strict: this._strict,
        };
    }

    addFormatToken('N', 0, 0, 'eraAbbr');
    addFormatToken('NN', 0, 0, 'eraAbbr');
    addFormatToken('NNN', 0, 0, 'eraAbbr');
    addFormatToken('NNNN', 0, 0, 'eraName');
    addFormatToken('NNNNN', 0, 0, 'eraNarrow');

    addFormatToken('y', ['y', 1], 'yo', 'eraYear');
    addFormatToken('y', ['yy', 2], 0, 'eraYear');
    addFormatToken('y', ['yyy', 3], 0, 'eraYear');
    addFormatToken('y', ['yyyy', 4], 0, 'eraYear');

    addRegexToken('N', matchEraAbbr);
    addRegexToken('NN', matchEraAbbr);
    addRegexToken('NNN', matchEraAbbr);
    addRegexToken('NNNN', matchEraName);
    addRegexToken('NNNNN', matchEraNarrow);

    addParseToken(['N', 'NN', 'NNN', 'NNNN', 'NNNNN'], function (
        input,
        array,
        config,
        token
    ) {
        var era = config._locale.erasParse(input, token, config._strict);
        if (era) {
            getParsingFlags(config).era = era;
        } else {
            getParsingFlags(config).invalidEra = input;
        }
    });

    addRegexToken('y', matchUnsigned);
    addRegexToken('yy', matchUnsigned);
    addRegexToken('yyy', matchUnsigned);
    addRegexToken('yyyy', matchUnsigned);
    addRegexToken('yo', matchEraYearOrdinal);

    addParseToken(['y', 'yy', 'yyy', 'yyyy'], YEAR);
    addParseToken(['yo'], function (input, array, config, token) {
        var match;
        if (config._locale._eraYearOrdinalRegex) {
            match = input.match(config._locale._eraYearOrdinalRegex);
        }

        if (config._locale.eraYearOrdinalParse) {
            array[YEAR] = config._locale.eraYearOrdinalParse(input, match);
        } else {
            array[YEAR] = parseInt(input, 10);
        }
    });

    function localeEras(m, format) {
        var i,
            l,
            date,
            eras = this._eras || getLocale('en')._eras;
        for (i = 0, l = eras.length; i < l; ++i) {
            switch (typeof eras[i].since) {
                case 'string':
                    // truncate time
                    date = hooks(eras[i].since).startOf('day');
                    eras[i].since = date.valueOf();
                    break;
            }

            switch (typeof eras[i].until) {
                case 'undefined':
                    eras[i].until = +Infinity;
                    break;
                case 'string':
                    // truncate time
                    date = hooks(eras[i].until).startOf('day').valueOf();
                    eras[i].until = date.valueOf();
                    break;
            }
        }
        return eras;
    }

    function localeErasParse(eraName, format, strict) {
        var i,
            l,
            eras = this.eras(),
            name,
            abbr,
            narrow;
        eraName = eraName.toUpperCase();

        for (i = 0, l = eras.length; i < l; ++i) {
            name = eras[i].name.toUpperCase();
            abbr = eras[i].abbr.toUpperCase();
            narrow = eras[i].narrow.toUpperCase();

            if (strict) {
                switch (format) {
                    case 'N':
                    case 'NN':
                    case 'NNN':
                        if (abbr === eraName) {
                            return eras[i];
                        }
                        break;

                    case 'NNNN':
                        if (name === eraName) {
                            return eras[i];
                        }
                        break;

                    case 'NNNNN':
                        if (narrow === eraName) {
                            return eras[i];
                        }
                        break;
                }
            } else if ([name, abbr, narrow].indexOf(eraName) >= 0) {
                return eras[i];
            }
        }
    }

    function localeErasConvertYear(era, year) {
        var dir = era.since <= era.until ? +1 : -1;
        if (year === undefined) {
            return hooks(era.since).year();
        } else {
            return hooks(era.since).year() + (year - era.offset) * dir;
        }
    }

    function getEraName() {
        var i,
            l,
            val,
            eras = this.localeData().eras();
        for (i = 0, l = eras.length; i < l; ++i) {
            // truncate time
            val = this.clone().startOf('day').valueOf();

            if (eras[i].since <= val && val <= eras[i].until) {
                return eras[i].name;
            }
            if (eras[i].until <= val && val <= eras[i].since) {
                return eras[i].name;
            }
        }

        return '';
    }

    function getEraNarrow() {
        var i,
            l,
            val,
            eras = this.localeData().eras();
        for (i = 0, l = eras.length; i < l; ++i) {
            // truncate time
            val = this.clone().startOf('day').valueOf();

            if (eras[i].since <= val && val <= eras[i].until) {
                return eras[i].narrow;
            }
            if (eras[i].until <= val && val <= eras[i].since) {
                return eras[i].narrow;
            }
        }

        return '';
    }

    function getEraAbbr() {
        var i,
            l,
            val,
            eras = this.localeData().eras();
        for (i = 0, l = eras.length; i < l; ++i) {
            // truncate time
            val = this.clone().startOf('day').valueOf();

            if (eras[i].since <= val && val <= eras[i].until) {
                return eras[i].abbr;
            }
            if (eras[i].until <= val && val <= eras[i].since) {
                return eras[i].abbr;
            }
        }

        return '';
    }

    function getEraYear() {
        var i,
            l,
            dir,
            val,
            eras = this.localeData().eras();
        for (i = 0, l = eras.length; i < l; ++i) {
            dir = eras[i].since <= eras[i].until ? +1 : -1;

            // truncate time
            val = this.clone().startOf('day').valueOf();

            if (
                (eras[i].since <= val && val <= eras[i].until) ||
                (eras[i].until <= val && val <= eras[i].since)
            ) {
                return (
                    (this.year() - hooks(eras[i].since).year()) * dir +
                    eras[i].offset
                );
            }
        }

        return this.year();
    }

    function erasNameRegex(isStrict) {
        if (!hasOwnProp(this, '_erasNameRegex')) {
            computeErasParse.call(this);
        }
        return isStrict ? this._erasNameRegex : this._erasRegex;
    }

    function erasAbbrRegex(isStrict) {
        if (!hasOwnProp(this, '_erasAbbrRegex')) {
            computeErasParse.call(this);
        }
        return isStrict ? this._erasAbbrRegex : this._erasRegex;
    }

    function erasNarrowRegex(isStrict) {
        if (!hasOwnProp(this, '_erasNarrowRegex')) {
            computeErasParse.call(this);
        }
        return isStrict ? this._erasNarrowRegex : this._erasRegex;
    }

    function matchEraAbbr(isStrict, locale) {
        return locale.erasAbbrRegex(isStrict);
    }

    function matchEraName(isStrict, locale) {
        return locale.erasNameRegex(isStrict);
    }

    function matchEraNarrow(isStrict, locale) {
        return locale.erasNarrowRegex(isStrict);
    }

    function matchEraYearOrdinal(isStrict, locale) {
        return locale._eraYearOrdinalRegex || matchUnsigned;
    }

    function computeErasParse() {
        var abbrPieces = [],
            namePieces = [],
            narrowPieces = [],
            mixedPieces = [],
            i,
            l,
            eras = this.eras();

        for (i = 0, l = eras.length; i < l; ++i) {
            namePieces.push(regexEscape(eras[i].name));
            abbrPieces.push(regexEscape(eras[i].abbr));
            narrowPieces.push(regexEscape(eras[i].narrow));

            mixedPieces.push(regexEscape(eras[i].name));
            mixedPieces.push(regexEscape(eras[i].abbr));
            mixedPieces.push(regexEscape(eras[i].narrow));
        }

        this._erasRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._erasNameRegex = new RegExp('^(' + namePieces.join('|') + ')', 'i');
        this._erasAbbrRegex = new RegExp('^(' + abbrPieces.join('|') + ')', 'i');
        this._erasNarrowRegex = new RegExp(
            '^(' + narrowPieces.join('|') + ')',
            'i'
        );
    }

    // FORMATTING

    addFormatToken(0, ['gg', 2], 0, function () {
        return this.weekYear() % 100;
    });

    addFormatToken(0, ['GG', 2], 0, function () {
        return this.isoWeekYear() % 100;
    });

    function addWeekYearFormatToken(token, getter) {
        addFormatToken(0, [token, token.length], 0, getter);
    }

    addWeekYearFormatToken('gggg', 'weekYear');
    addWeekYearFormatToken('ggggg', 'weekYear');
    addWeekYearFormatToken('GGGG', 'isoWeekYear');
    addWeekYearFormatToken('GGGGG', 'isoWeekYear');

    // ALIASES

    addUnitAlias('weekYear', 'gg');
    addUnitAlias('isoWeekYear', 'GG');

    // PRIORITY

    addUnitPriority('weekYear', 1);
    addUnitPriority('isoWeekYear', 1);

    // PARSING

    addRegexToken('G', matchSigned);
    addRegexToken('g', matchSigned);
    addRegexToken('GG', match1to2, match2);
    addRegexToken('gg', match1to2, match2);
    addRegexToken('GGGG', match1to4, match4);
    addRegexToken('gggg', match1to4, match4);
    addRegexToken('GGGGG', match1to6, match6);
    addRegexToken('ggggg', match1to6, match6);

    addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (
        input,
        week,
        config,
        token
    ) {
        week[token.substr(0, 2)] = toInt(input);
    });

    addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
        week[token] = hooks.parseTwoDigitYear(input);
    });

    // MOMENTS

    function getSetWeekYear(input) {
        return getSetWeekYearHelper.call(
            this,
            input,
            this.week(),
            this.weekday(),
            this.localeData()._week.dow,
            this.localeData()._week.doy
        );
    }

    function getSetISOWeekYear(input) {
        return getSetWeekYearHelper.call(
            this,
            input,
            this.isoWeek(),
            this.isoWeekday(),
            1,
            4
        );
    }

    function getISOWeeksInYear() {
        return weeksInYear(this.year(), 1, 4);
    }

    function getISOWeeksInISOWeekYear() {
        return weeksInYear(this.isoWeekYear(), 1, 4);
    }

    function getWeeksInYear() {
        var weekInfo = this.localeData()._week;
        return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
    }

    function getWeeksInWeekYear() {
        var weekInfo = this.localeData()._week;
        return weeksInYear(this.weekYear(), weekInfo.dow, weekInfo.doy);
    }

    function getSetWeekYearHelper(input, week, weekday, dow, doy) {
        var weeksTarget;
        if (input == null) {
            return weekOfYear(this, dow, doy).year;
        } else {
            weeksTarget = weeksInYear(input, dow, doy);
            if (week > weeksTarget) {
                week = weeksTarget;
            }
            return setWeekAll.call(this, input, week, weekday, dow, doy);
        }
    }

    function setWeekAll(weekYear, week, weekday, dow, doy) {
        var dayOfYearData = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy),
            date = createUTCDate(dayOfYearData.year, 0, dayOfYearData.dayOfYear);

        this.year(date.getUTCFullYear());
        this.month(date.getUTCMonth());
        this.date(date.getUTCDate());
        return this;
    }

    // FORMATTING

    addFormatToken('Q', 0, 'Qo', 'quarter');

    // ALIASES

    addUnitAlias('quarter', 'Q');

    // PRIORITY

    addUnitPriority('quarter', 7);

    // PARSING

    addRegexToken('Q', match1);
    addParseToken('Q', function (input, array) {
        array[MONTH] = (toInt(input) - 1) * 3;
    });

    // MOMENTS

    function getSetQuarter(input) {
        return input == null
            ? Math.ceil((this.month() + 1) / 3)
            : this.month((input - 1) * 3 + (this.month() % 3));
    }

    // FORMATTING

    addFormatToken('D', ['DD', 2], 'Do', 'date');

    // ALIASES

    addUnitAlias('date', 'D');

    // PRIORITY
    addUnitPriority('date', 9);

    // PARSING

    addRegexToken('D', match1to2);
    addRegexToken('DD', match1to2, match2);
    addRegexToken('Do', function (isStrict, locale) {
        // TODO: Remove "ordinalParse" fallback in next major release.
        return isStrict
            ? locale._dayOfMonthOrdinalParse || locale._ordinalParse
            : locale._dayOfMonthOrdinalParseLenient;
    });

    addParseToken(['D', 'DD'], DATE);
    addParseToken('Do', function (input, array) {
        array[DATE] = toInt(input.match(match1to2)[0]);
    });

    // MOMENTS

    var getSetDayOfMonth = makeGetSet('Date', true);

    // FORMATTING

    addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');

    // ALIASES

    addUnitAlias('dayOfYear', 'DDD');

    // PRIORITY
    addUnitPriority('dayOfYear', 4);

    // PARSING

    addRegexToken('DDD', match1to3);
    addRegexToken('DDDD', match3);
    addParseToken(['DDD', 'DDDD'], function (input, array, config) {
        config._dayOfYear = toInt(input);
    });

    // HELPERS

    // MOMENTS

    function getSetDayOfYear(input) {
        var dayOfYear =
            Math.round(
                (this.clone().startOf('day') - this.clone().startOf('year')) / 864e5
            ) + 1;
        return input == null ? dayOfYear : this.add(input - dayOfYear, 'd');
    }

    // FORMATTING

    addFormatToken('m', ['mm', 2], 0, 'minute');

    // ALIASES

    addUnitAlias('minute', 'm');

    // PRIORITY

    addUnitPriority('minute', 14);

    // PARSING

    addRegexToken('m', match1to2);
    addRegexToken('mm', match1to2, match2);
    addParseToken(['m', 'mm'], MINUTE);

    // MOMENTS

    var getSetMinute = makeGetSet('Minutes', false);

    // FORMATTING

    addFormatToken('s', ['ss', 2], 0, 'second');

    // ALIASES

    addUnitAlias('second', 's');

    // PRIORITY

    addUnitPriority('second', 15);

    // PARSING

    addRegexToken('s', match1to2);
    addRegexToken('ss', match1to2, match2);
    addParseToken(['s', 'ss'], SECOND);

    // MOMENTS

    var getSetSecond = makeGetSet('Seconds', false);

    // FORMATTING

    addFormatToken('S', 0, 0, function () {
        return ~~(this.millisecond() / 100);
    });

    addFormatToken(0, ['SS', 2], 0, function () {
        return ~~(this.millisecond() / 10);
    });

    addFormatToken(0, ['SSS', 3], 0, 'millisecond');
    addFormatToken(0, ['SSSS', 4], 0, function () {
        return this.millisecond() * 10;
    });
    addFormatToken(0, ['SSSSS', 5], 0, function () {
        return this.millisecond() * 100;
    });
    addFormatToken(0, ['SSSSSS', 6], 0, function () {
        return this.millisecond() * 1000;
    });
    addFormatToken(0, ['SSSSSSS', 7], 0, function () {
        return this.millisecond() * 10000;
    });
    addFormatToken(0, ['SSSSSSSS', 8], 0, function () {
        return this.millisecond() * 100000;
    });
    addFormatToken(0, ['SSSSSSSSS', 9], 0, function () {
        return this.millisecond() * 1000000;
    });

    // ALIASES

    addUnitAlias('millisecond', 'ms');

    // PRIORITY

    addUnitPriority('millisecond', 16);

    // PARSING

    addRegexToken('S', match1to3, match1);
    addRegexToken('SS', match1to3, match2);
    addRegexToken('SSS', match1to3, match3);

    var token, getSetMillisecond;
    for (token = 'SSSS'; token.length <= 9; token += 'S') {
        addRegexToken(token, matchUnsigned);
    }

    function parseMs(input, array) {
        array[MILLISECOND] = toInt(('0.' + input) * 1000);
    }

    for (token = 'S'; token.length <= 9; token += 'S') {
        addParseToken(token, parseMs);
    }

    getSetMillisecond = makeGetSet('Milliseconds', false);

    // FORMATTING

    addFormatToken('z', 0, 0, 'zoneAbbr');
    addFormatToken('zz', 0, 0, 'zoneName');

    // MOMENTS

    function getZoneAbbr() {
        return this._isUTC ? 'UTC' : '';
    }

    function getZoneName() {
        return this._isUTC ? 'Coordinated Universal Time' : '';
    }

    var proto = Moment.prototype;

    proto.add = add;
    proto.calendar = calendar$1;
    proto.clone = clone;
    proto.diff = diff;
    proto.endOf = endOf;
    proto.format = format;
    proto.from = from;
    proto.fromNow = fromNow;
    proto.to = to;
    proto.toNow = toNow;
    proto.get = stringGet;
    proto.invalidAt = invalidAt;
    proto.isAfter = isAfter;
    proto.isBefore = isBefore;
    proto.isBetween = isBetween;
    proto.isSame = isSame;
    proto.isSameOrAfter = isSameOrAfter;
    proto.isSameOrBefore = isSameOrBefore;
    proto.isValid = isValid$2;
    proto.lang = lang;
    proto.locale = locale;
    proto.localeData = localeData;
    proto.max = prototypeMax;
    proto.min = prototypeMin;
    proto.parsingFlags = parsingFlags;
    proto.set = stringSet;
    proto.startOf = startOf;
    proto.subtract = subtract;
    proto.toArray = toArray;
    proto.toObject = toObject;
    proto.toDate = toDate;
    proto.toISOString = toISOString;
    proto.inspect = inspect;
    if (typeof Symbol !== 'undefined' && Symbol.for != null) {
        proto[Symbol.for('nodejs.util.inspect.custom')] = function () {
            return 'Moment<' + this.format() + '>';
        };
    }
    proto.toJSON = toJSON;
    proto.toString = toString;
    proto.unix = unix;
    proto.valueOf = valueOf;
    proto.creationData = creationData;
    proto.eraName = getEraName;
    proto.eraNarrow = getEraNarrow;
    proto.eraAbbr = getEraAbbr;
    proto.eraYear = getEraYear;
    proto.year = getSetYear;
    proto.isLeapYear = getIsLeapYear;
    proto.weekYear = getSetWeekYear;
    proto.isoWeekYear = getSetISOWeekYear;
    proto.quarter = proto.quarters = getSetQuarter;
    proto.month = getSetMonth;
    proto.daysInMonth = getDaysInMonth;
    proto.week = proto.weeks = getSetWeek;
    proto.isoWeek = proto.isoWeeks = getSetISOWeek;
    proto.weeksInYear = getWeeksInYear;
    proto.weeksInWeekYear = getWeeksInWeekYear;
    proto.isoWeeksInYear = getISOWeeksInYear;
    proto.isoWeeksInISOWeekYear = getISOWeeksInISOWeekYear;
    proto.date = getSetDayOfMonth;
    proto.day = proto.days = getSetDayOfWeek;
    proto.weekday = getSetLocaleDayOfWeek;
    proto.isoWeekday = getSetISODayOfWeek;
    proto.dayOfYear = getSetDayOfYear;
    proto.hour = proto.hours = getSetHour;
    proto.minute = proto.minutes = getSetMinute;
    proto.second = proto.seconds = getSetSecond;
    proto.millisecond = proto.milliseconds = getSetMillisecond;
    proto.utcOffset = getSetOffset;
    proto.utc = setOffsetToUTC;
    proto.local = setOffsetToLocal;
    proto.parseZone = setOffsetToParsedOffset;
    proto.hasAlignedHourOffset = hasAlignedHourOffset;
    proto.isDST = isDaylightSavingTime;
    proto.isLocal = isLocal;
    proto.isUtcOffset = isUtcOffset;
    proto.isUtc = isUtc;
    proto.isUTC = isUtc;
    proto.zoneAbbr = getZoneAbbr;
    proto.zoneName = getZoneName;
    proto.dates = deprecate(
        'dates accessor is deprecated. Use date instead.',
        getSetDayOfMonth
    );
    proto.months = deprecate(
        'months accessor is deprecated. Use month instead',
        getSetMonth
    );
    proto.years = deprecate(
        'years accessor is deprecated. Use year instead',
        getSetYear
    );
    proto.zone = deprecate(
        'moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/',
        getSetZone
    );
    proto.isDSTShifted = deprecate(
        'isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information',
        isDaylightSavingTimeShifted
    );

    function createUnix(input) {
        return createLocal(input * 1000);
    }

    function createInZone() {
        return createLocal.apply(null, arguments).parseZone();
    }

    function preParsePostFormat(string) {
        return string;
    }

    var proto$1 = Locale.prototype;

    proto$1.calendar = calendar;
    proto$1.longDateFormat = longDateFormat;
    proto$1.invalidDate = invalidDate;
    proto$1.ordinal = ordinal;
    proto$1.preparse = preParsePostFormat;
    proto$1.postformat = preParsePostFormat;
    proto$1.relativeTime = relativeTime;
    proto$1.pastFuture = pastFuture;
    proto$1.set = set;
    proto$1.eras = localeEras;
    proto$1.erasParse = localeErasParse;
    proto$1.erasConvertYear = localeErasConvertYear;
    proto$1.erasAbbrRegex = erasAbbrRegex;
    proto$1.erasNameRegex = erasNameRegex;
    proto$1.erasNarrowRegex = erasNarrowRegex;

    proto$1.months = localeMonths;
    proto$1.monthsShort = localeMonthsShort;
    proto$1.monthsParse = localeMonthsParse;
    proto$1.monthsRegex = monthsRegex;
    proto$1.monthsShortRegex = monthsShortRegex;
    proto$1.week = localeWeek;
    proto$1.firstDayOfYear = localeFirstDayOfYear;
    proto$1.firstDayOfWeek = localeFirstDayOfWeek;

    proto$1.weekdays = localeWeekdays;
    proto$1.weekdaysMin = localeWeekdaysMin;
    proto$1.weekdaysShort = localeWeekdaysShort;
    proto$1.weekdaysParse = localeWeekdaysParse;

    proto$1.weekdaysRegex = weekdaysRegex;
    proto$1.weekdaysShortRegex = weekdaysShortRegex;
    proto$1.weekdaysMinRegex = weekdaysMinRegex;

    proto$1.isPM = localeIsPM;
    proto$1.meridiem = localeMeridiem;

    function get$1(format, index, field, setter) {
        var locale = getLocale(),
            utc = createUTC().set(setter, index);
        return locale[field](utc, format);
    }

    function listMonthsImpl(format, index, field) {
        if (isNumber(format)) {
            index = format;
            format = undefined;
        }

        format = format || '';

        if (index != null) {
            return get$1(format, index, field, 'month');
        }

        var i,
            out = [];
        for (i = 0; i < 12; i++) {
            out[i] = get$1(format, i, field, 'month');
        }
        return out;
    }

    // ()
    // (5)
    // (fmt, 5)
    // (fmt)
    // (true)
    // (true, 5)
    // (true, fmt, 5)
    // (true, fmt)
    function listWeekdaysImpl(localeSorted, format, index, field) {
        if (typeof localeSorted === 'boolean') {
            if (isNumber(format)) {
                index = format;
                format = undefined;
            }

            format = format || '';
        } else {
            format = localeSorted;
            index = format;
            localeSorted = false;

            if (isNumber(format)) {
                index = format;
                format = undefined;
            }

            format = format || '';
        }

        var locale = getLocale(),
            shift = localeSorted ? locale._week.dow : 0,
            i,
            out = [];

        if (index != null) {
            return get$1(format, (index + shift) % 7, field, 'day');
        }

        for (i = 0; i < 7; i++) {
            out[i] = get$1(format, (i + shift) % 7, field, 'day');
        }
        return out;
    }

    function listMonths(format, index) {
        return listMonthsImpl(format, index, 'months');
    }

    function listMonthsShort(format, index) {
        return listMonthsImpl(format, index, 'monthsShort');
    }

    function listWeekdays(localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdays');
    }

    function listWeekdaysShort(localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdaysShort');
    }

    function listWeekdaysMin(localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdaysMin');
    }

    getSetGlobalLocale('en', {
        eras: [
            {
                since: '0001-01-01',
                until: +Infinity,
                offset: 1,
                name: 'Anno Domini',
                narrow: 'AD',
                abbr: 'AD',
            },
            {
                since: '0000-12-31',
                until: -Infinity,
                offset: 1,
                name: 'Before Christ',
                narrow: 'BC',
                abbr: 'BC',
            },
        ],
        dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/,
        ordinal: function (number) {
            var b = number % 10,
                output =
                    toInt((number % 100) / 10) === 1
                        ? 'th'
                        : b === 1
                        ? 'st'
                        : b === 2
                        ? 'nd'
                        : b === 3
                        ? 'rd'
                        : 'th';
            return number + output;
        },
    });

    // Side effect imports

    hooks.lang = deprecate(
        'moment.lang is deprecated. Use moment.locale instead.',
        getSetGlobalLocale
    );
    hooks.langData = deprecate(
        'moment.langData is deprecated. Use moment.localeData instead.',
        getLocale
    );

    var mathAbs = Math.abs;

    function abs() {
        var data = this._data;

        this._milliseconds = mathAbs(this._milliseconds);
        this._days = mathAbs(this._days);
        this._months = mathAbs(this._months);

        data.milliseconds = mathAbs(data.milliseconds);
        data.seconds = mathAbs(data.seconds);
        data.minutes = mathAbs(data.minutes);
        data.hours = mathAbs(data.hours);
        data.months = mathAbs(data.months);
        data.years = mathAbs(data.years);

        return this;
    }

    function addSubtract$1(duration, input, value, direction) {
        var other = createDuration(input, value);

        duration._milliseconds += direction * other._milliseconds;
        duration._days += direction * other._days;
        duration._months += direction * other._months;

        return duration._bubble();
    }

    // supports only 2.0-style add(1, 's') or add(duration)
    function add$1(input, value) {
        return addSubtract$1(this, input, value, 1);
    }

    // supports only 2.0-style subtract(1, 's') or subtract(duration)
    function subtract$1(input, value) {
        return addSubtract$1(this, input, value, -1);
    }

    function absCeil(number) {
        if (number < 0) {
            return Math.floor(number);
        } else {
            return Math.ceil(number);
        }
    }

    function bubble() {
        var milliseconds = this._milliseconds,
            days = this._days,
            months = this._months,
            data = this._data,
            seconds,
            minutes,
            hours,
            years,
            monthsFromDays;

        // if we have a mix of positive and negative values, bubble down first
        // check: https://github.com/moment/moment/issues/2166
        if (
            !(
                (milliseconds >= 0 && days >= 0 && months >= 0) ||
                (milliseconds <= 0 && days <= 0 && months <= 0)
            )
        ) {
            milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
            days = 0;
            months = 0;
        }

        // The following code bubbles up values, see the tests for
        // examples of what that means.
        data.milliseconds = milliseconds % 1000;

        seconds = absFloor(milliseconds / 1000);
        data.seconds = seconds % 60;

        minutes = absFloor(seconds / 60);
        data.minutes = minutes % 60;

        hours = absFloor(minutes / 60);
        data.hours = hours % 24;

        days += absFloor(hours / 24);

        // convert days to months
        monthsFromDays = absFloor(daysToMonths(days));
        months += monthsFromDays;
        days -= absCeil(monthsToDays(monthsFromDays));

        // 12 months -> 1 year
        years = absFloor(months / 12);
        months %= 12;

        data.days = days;
        data.months = months;
        data.years = years;

        return this;
    }

    function daysToMonths(days) {
        // 400 years have 146097 days (taking into account leap year rules)
        // 400 years have 12 months === 4800
        return (days * 4800) / 146097;
    }

    function monthsToDays(months) {
        // the reverse of daysToMonths
        return (months * 146097) / 4800;
    }

    function as(units) {
        if (!this.isValid()) {
            return NaN;
        }
        var days,
            months,
            milliseconds = this._milliseconds;

        units = normalizeUnits(units);

        if (units === 'month' || units === 'quarter' || units === 'year') {
            days = this._days + milliseconds / 864e5;
            months = this._months + daysToMonths(days);
            switch (units) {
                case 'month':
                    return months;
                case 'quarter':
                    return months / 3;
                case 'year':
                    return months / 12;
            }
        } else {
            // handle milliseconds separately because of floating point math errors (issue #1867)
            days = this._days + Math.round(monthsToDays(this._months));
            switch (units) {
                case 'week':
                    return days / 7 + milliseconds / 6048e5;
                case 'day':
                    return days + milliseconds / 864e5;
                case 'hour':
                    return days * 24 + milliseconds / 36e5;
                case 'minute':
                    return days * 1440 + milliseconds / 6e4;
                case 'second':
                    return days * 86400 + milliseconds / 1000;
                // Math.floor prevents floating point math errors here
                case 'millisecond':
                    return Math.floor(days * 864e5) + milliseconds;
                default:
                    throw new Error('Unknown unit ' + units);
            }
        }
    }

    // TODO: Use this.as('ms')?
    function valueOf$1() {
        if (!this.isValid()) {
            return NaN;
        }
        return (
            this._milliseconds +
            this._days * 864e5 +
            (this._months % 12) * 2592e6 +
            toInt(this._months / 12) * 31536e6
        );
    }

    function makeAs(alias) {
        return function () {
            return this.as(alias);
        };
    }

    var asMilliseconds = makeAs('ms'),
        asSeconds = makeAs('s'),
        asMinutes = makeAs('m'),
        asHours = makeAs('h'),
        asDays = makeAs('d'),
        asWeeks = makeAs('w'),
        asMonths = makeAs('M'),
        asQuarters = makeAs('Q'),
        asYears = makeAs('y');

    function clone$1() {
        return createDuration(this);
    }

    function get$2(units) {
        units = normalizeUnits(units);
        return this.isValid() ? this[units + 's']() : NaN;
    }

    function makeGetter(name) {
        return function () {
            return this.isValid() ? this._data[name] : NaN;
        };
    }

    var milliseconds = makeGetter('milliseconds'),
        seconds = makeGetter('seconds'),
        minutes = makeGetter('minutes'),
        hours = makeGetter('hours'),
        days = makeGetter('days'),
        months = makeGetter('months'),
        years = makeGetter('years');

    function weeks() {
        return absFloor(this.days() / 7);
    }

    var round = Math.round,
        thresholds = {
            ss: 44, // a few seconds to seconds
            s: 45, // seconds to minute
            m: 45, // minutes to hour
            h: 22, // hours to day
            d: 26, // days to month/week
            w: null, // weeks to month
            M: 11, // months to year
        };

    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function relativeTime$1(posNegDuration, withoutSuffix, thresholds, locale) {
        var duration = createDuration(posNegDuration).abs(),
            seconds = round(duration.as('s')),
            minutes = round(duration.as('m')),
            hours = round(duration.as('h')),
            days = round(duration.as('d')),
            months = round(duration.as('M')),
            weeks = round(duration.as('w')),
            years = round(duration.as('y')),
            a =
                (seconds <= thresholds.ss && ['s', seconds]) ||
                (seconds < thresholds.s && ['ss', seconds]) ||
                (minutes <= 1 && ['m']) ||
                (minutes < thresholds.m && ['mm', minutes]) ||
                (hours <= 1 && ['h']) ||
                (hours < thresholds.h && ['hh', hours]) ||
                (days <= 1 && ['d']) ||
                (days < thresholds.d && ['dd', days]);

        if (thresholds.w != null) {
            a =
                a ||
                (weeks <= 1 && ['w']) ||
                (weeks < thresholds.w && ['ww', weeks]);
        }
        a = a ||
            (months <= 1 && ['M']) ||
            (months < thresholds.M && ['MM', months]) ||
            (years <= 1 && ['y']) || ['yy', years];

        a[2] = withoutSuffix;
        a[3] = +posNegDuration > 0;
        a[4] = locale;
        return substituteTimeAgo.apply(null, a);
    }

    // This function allows you to set the rounding function for relative time strings
    function getSetRelativeTimeRounding(roundingFunction) {
        if (roundingFunction === undefined) {
            return round;
        }
        if (typeof roundingFunction === 'function') {
            round = roundingFunction;
            return true;
        }
        return false;
    }

    // This function allows you to set a threshold for relative time strings
    function getSetRelativeTimeThreshold(threshold, limit) {
        if (thresholds[threshold] === undefined) {
            return false;
        }
        if (limit === undefined) {
            return thresholds[threshold];
        }
        thresholds[threshold] = limit;
        if (threshold === 's') {
            thresholds.ss = limit - 1;
        }
        return true;
    }

    function humanize(argWithSuffix, argThresholds) {
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }

        var withSuffix = false,
            th = thresholds,
            locale,
            output;

        if (typeof argWithSuffix === 'object') {
            argThresholds = argWithSuffix;
            argWithSuffix = false;
        }
        if (typeof argWithSuffix === 'boolean') {
            withSuffix = argWithSuffix;
        }
        if (typeof argThresholds === 'object') {
            th = Object.assign({}, thresholds, argThresholds);
            if (argThresholds.s != null && argThresholds.ss == null) {
                th.ss = argThresholds.s - 1;
            }
        }

        locale = this.localeData();
        output = relativeTime$1(this, !withSuffix, th, locale);

        if (withSuffix) {
            output = locale.pastFuture(+this, output);
        }

        return locale.postformat(output);
    }

    var abs$1 = Math.abs;

    function sign(x) {
        return (x > 0) - (x < 0) || +x;
    }

    function toISOString$1() {
        // for ISO strings we do not use the normal bubbling rules:
        //  * milliseconds bubble up until they become hours
        //  * days do not bubble at all
        //  * months bubble up until they become years
        // This is because there is no context-free conversion between hours and days
        // (think of clock changes)
        // and also not between days and months (28-31 days per month)
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }

        var seconds = abs$1(this._milliseconds) / 1000,
            days = abs$1(this._days),
            months = abs$1(this._months),
            minutes,
            hours,
            years,
            s,
            total = this.asSeconds(),
            totalSign,
            ymSign,
            daysSign,
            hmsSign;

        if (!total) {
            // this is the same as C#'s (Noda) and python (isodate)...
            // but not other JS (goog.date)
            return 'P0D';
        }

        // 3600 seconds -> 60 minutes -> 1 hour
        minutes = absFloor(seconds / 60);
        hours = absFloor(minutes / 60);
        seconds %= 60;
        minutes %= 60;

        // 12 months -> 1 year
        years = absFloor(months / 12);
        months %= 12;

        // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
        s = seconds ? seconds.toFixed(3).replace(/\.?0+$/, '') : '';

        totalSign = total < 0 ? '-' : '';
        ymSign = sign(this._months) !== sign(total) ? '-' : '';
        daysSign = sign(this._days) !== sign(total) ? '-' : '';
        hmsSign = sign(this._milliseconds) !== sign(total) ? '-' : '';

        return (
            totalSign +
            'P' +
            (years ? ymSign + years + 'Y' : '') +
            (months ? ymSign + months + 'M' : '') +
            (days ? daysSign + days + 'D' : '') +
            (hours || minutes || seconds ? 'T' : '') +
            (hours ? hmsSign + hours + 'H' : '') +
            (minutes ? hmsSign + minutes + 'M' : '') +
            (seconds ? hmsSign + s + 'S' : '')
        );
    }

    var proto$2 = Duration.prototype;

    proto$2.isValid = isValid$1;
    proto$2.abs = abs;
    proto$2.add = add$1;
    proto$2.subtract = subtract$1;
    proto$2.as = as;
    proto$2.asMilliseconds = asMilliseconds;
    proto$2.asSeconds = asSeconds;
    proto$2.asMinutes = asMinutes;
    proto$2.asHours = asHours;
    proto$2.asDays = asDays;
    proto$2.asWeeks = asWeeks;
    proto$2.asMonths = asMonths;
    proto$2.asQuarters = asQuarters;
    proto$2.asYears = asYears;
    proto$2.valueOf = valueOf$1;
    proto$2._bubble = bubble;
    proto$2.clone = clone$1;
    proto$2.get = get$2;
    proto$2.milliseconds = milliseconds;
    proto$2.seconds = seconds;
    proto$2.minutes = minutes;
    proto$2.hours = hours;
    proto$2.days = days;
    proto$2.weeks = weeks;
    proto$2.months = months;
    proto$2.years = years;
    proto$2.humanize = humanize;
    proto$2.toISOString = toISOString$1;
    proto$2.toString = toISOString$1;
    proto$2.toJSON = toISOString$1;
    proto$2.locale = locale;
    proto$2.localeData = localeData;

    proto$2.toIsoString = deprecate(
        'toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)',
        toISOString$1
    );
    proto$2.lang = lang;

    // FORMATTING

    addFormatToken('X', 0, 0, 'unix');
    addFormatToken('x', 0, 0, 'valueOf');

    // PARSING

    addRegexToken('x', matchSigned);
    addRegexToken('X', matchTimestamp);
    addParseToken('X', function (input, array, config) {
        config._d = new Date(parseFloat(input) * 1000);
    });
    addParseToken('x', function (input, array, config) {
        config._d = new Date(toInt(input));
    });

    //! moment.js

    hooks.version = '2.29.1';

    setHookCallback(createLocal);

    hooks.fn = proto;
    hooks.min = min;
    hooks.max = max;
    hooks.now = now;
    hooks.utc = createUTC;
    hooks.unix = createUnix;
    hooks.months = listMonths;
    hooks.isDate = isDate;
    hooks.locale = getSetGlobalLocale;
    hooks.invalid = createInvalid;
    hooks.duration = createDuration;
    hooks.isMoment = isMoment;
    hooks.weekdays = listWeekdays;
    hooks.parseZone = createInZone;
    hooks.localeData = getLocale;
    hooks.isDuration = isDuration;
    hooks.monthsShort = listMonthsShort;
    hooks.weekdaysMin = listWeekdaysMin;
    hooks.defineLocale = defineLocale;
    hooks.updateLocale = updateLocale;
    hooks.locales = listLocales;
    hooks.weekdaysShort = listWeekdaysShort;
    hooks.normalizeUnits = normalizeUnits;
    hooks.relativeTimeRounding = getSetRelativeTimeRounding;
    hooks.relativeTimeThreshold = getSetRelativeTimeThreshold;
    hooks.calendarFormat = getCalendarFormat;
    hooks.prototype = proto;

    // currently HTML5 input type only supports 24-hour formats
    hooks.HTML5_FMT = {
        DATETIME_LOCAL: 'YYYY-MM-DDTHH:mm', // <input type="datetime-local" />
        DATETIME_LOCAL_SECONDS: 'YYYY-MM-DDTHH:mm:ss', // <input type="datetime-local" step="1" />
        DATETIME_LOCAL_MS: 'YYYY-MM-DDTHH:mm:ss.SSS', // <input type="datetime-local" step="0.001" />
        DATE: 'YYYY-MM-DD', // <input type="date" />
        TIME: 'HH:mm', // <input type="time" />
        TIME_SECONDS: 'HH:mm:ss', // <input type="time" step="1" />
        TIME_MS: 'HH:mm:ss.SSS', // <input type="time" step="0.001" />
        WEEK: 'GGGG-[W]WW', // <input type="week" />
        MONTH: 'YYYY-MM', // <input type="month" />
    };

    return hooks;

})));
/**
* @version: 3.0.3
* @author: Dan Grossman http://www.dangrossman.info/
* @copyright: Copyright (c) 2012-2018 Dan Grossman. All rights reserved.
* @license: Licensed under the MIT license. See http://www.opensource.org/licenses/mit-license.php
* @website: http://www.daterangepicker.com/
*/
// Following the UMD template https://github.com/umdjs/umd/blob/master/templates/returnExportsGlobal.js
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Make globaly available as well
        define(['moment', 'jquery'], function (moment, jquery) {
            if (!jquery.fn) jquery.fn = {}; // webpack server rendering
            return factory(moment, jquery);
        });
    } else if (typeof module === 'object' && module.exports) {
        // Node / Browserify
        //isomorphic issue
        var jQuery = (typeof window != 'undefined') ? window.jQuery : undefined;
        if (!jQuery) {
            jQuery = require('jquery');
            if (!jQuery.fn) jQuery.fn = {};
        }
        var moment = (typeof window != 'undefined' && typeof window.moment != 'undefined') ? window.moment : require('moment');
        module.exports = factory(moment, jQuery);
    } else {
        // Browser globals
        root.daterangepicker = factory(root.moment, root.jQuery);
    }
}(this, function(moment, $) {
    var DateRangePicker = function(element, options, cb) {

        //default settings for options
        this.parentEl = 'body';
        this.element = $(element);
        this.startDate = moment().startOf('day');
        this.endDate = moment().endOf('day');
        this.minDate = false;
        this.maxDate = false;
        this.maxSpan = false;
        this.autoApply = false;
        this.singleDatePicker = false;
        this.showDropdowns = false;
        this.minYear = moment().subtract(100, 'year').format('YYYY');
        this.maxYear = moment().add(100, 'year').format('YYYY');
        this.showWeekNumbers = false;
        this.showISOWeekNumbers = false;
        this.showCustomRangeLabel = true;
        this.timePicker = false;
        this.timePicker24Hour = false;
        this.timePickerIncrement = 1;
        this.timePickerSeconds = false;
        this.linkedCalendars = true;
        this.autoUpdateInput = true;
        this.alwaysShowCalendars = false;
        this.ranges = {};

        this.opens = 'right';
        if (this.element.hasClass('pull-right'))
            this.opens = 'left';

        this.drops = 'down';
        if (this.element.hasClass('dropup'))
            this.drops = 'up';

        this.buttonClasses = 'btn btn-sm';
        this.applyButtonClasses = 'btn-primary';
        this.cancelButtonClasses = 'btn-default';

        this.locale = {
            direction: 'ltr',
            format: moment.localeData().longDateFormat('L'),
            separator: ' - ',
            applyLabel: 'Apply',
            cancelLabel: 'Cancel',
            weekLabel: 'W',
            customRangeLabel: 'Custom Range',
            daysOfWeek: moment.weekdaysMin(),
            monthNames: moment.monthsShort(),
            firstDay: moment.localeData().firstDayOfWeek()
        };

        this.callback = function() { };

        //some state information
        this.isShowing = false;
        this.leftCalendar = {};
        this.rightCalendar = {};

        //custom options from user
        if (typeof options !== 'object' || options === null)
            options = {};

        //allow setting options with data attributes
        //data-api options will be overwritten with custom javascript options
        options = $.extend(this.element.data(), options);

        //html template for the picker UI
        if (typeof options.template !== 'string' && !(options.template instanceof $))
            options.template =
            '<div class="daterangepicker">' +
                '<div class="ranges"></div>' +
                '<div class="drp-calendar left">' +
                    '<div class="calendar-table"></div>' +
                    '<div class="calendar-time"></div>' +
                '</div>' +
                '<div class="drp-calendar right">' +
                    '<div class="calendar-table"></div>' +
                    '<div class="calendar-time"></div>' +
                '</div>' +
                '<div class="drp-buttons">' +
                    '<span class="drp-selected"></span>' +
                    '<button class="cancelBtn" type="button"></button>' +
                    '<button class="applyBtn" disabled="disabled" type="button"></button> ' +
                '</div>' +
            '</div>';

        this.parentEl = (options.parentEl && $(options.parentEl).length) ? $(options.parentEl) : $(this.parentEl);
        this.container = $(options.template).appendTo(this.parentEl);

        //
        // handle all the possible options overriding defaults
        //

        if (typeof options.locale === 'object') {

            if (typeof options.locale.direction === 'string')
                this.locale.direction = options.locale.direction;

            if (typeof options.locale.format === 'string')
                this.locale.format = options.locale.format;

            if (typeof options.locale.separator === 'string')
                this.locale.separator = options.locale.separator;

            if (typeof options.locale.daysOfWeek === 'object')
                this.locale.daysOfWeek = options.locale.daysOfWeek.slice();

            if (typeof options.locale.monthNames === 'object')
              this.locale.monthNames = options.locale.monthNames.slice();

            if (typeof options.locale.firstDay === 'number')
              this.locale.firstDay = options.locale.firstDay;

            if (typeof options.locale.applyLabel === 'string')
              this.locale.applyLabel = options.locale.applyLabel;

            if (typeof options.locale.cancelLabel === 'string')
              this.locale.cancelLabel = options.locale.cancelLabel;

            if (typeof options.locale.weekLabel === 'string')
              this.locale.weekLabel = options.locale.weekLabel;

            if (typeof options.locale.customRangeLabel === 'string'){
                //Support unicode chars in the custom range name.
                var elem = document.createElement('textarea');
                elem.innerHTML = options.locale.customRangeLabel;
                var rangeHtml = elem.value;
                this.locale.customRangeLabel = rangeHtml;
            }
        }
        this.container.addClass(this.locale.direction);

        if (typeof options.startDate === 'string')
            this.startDate = moment(options.startDate, this.locale.format);

        if (typeof options.endDate === 'string')
            this.endDate = moment(options.endDate, this.locale.format);

        if (typeof options.minDate === 'string')
            this.minDate = moment(options.minDate, this.locale.format);

        if (typeof options.maxDate === 'string')
            this.maxDate = moment(options.maxDate, this.locale.format);

        if (typeof options.startDate === 'object')
            this.startDate = moment(options.startDate);

        if (typeof options.endDate === 'object')
            this.endDate = moment(options.endDate);

        if (typeof options.minDate === 'object')
            this.minDate = moment(options.minDate);

        if (typeof options.maxDate === 'object')
            this.maxDate = moment(options.maxDate);

        // sanity check for bad options
        if (this.minDate && this.startDate.isBefore(this.minDate))
            this.startDate = this.minDate.clone();

        // sanity check for bad options
        if (this.maxDate && this.endDate.isAfter(this.maxDate))
            this.endDate = this.maxDate.clone();

        if (typeof options.applyButtonClasses === 'string')
            this.applyButtonClasses = options.applyButtonClasses;

        if (typeof options.applyClass === 'string') //backwards compat
            this.applyButtonClasses = options.applyClass;

        if (typeof options.cancelButtonClasses === 'string')
            this.cancelButtonClasses = options.cancelButtonClasses;

        if (typeof options.cancelClass === 'string') //backwards compat
            this.cancelButtonClasses = options.cancelClass;

        if (typeof options.maxSpan === 'object')
            this.maxSpan = options.maxSpan;

        if (typeof options.dateLimit === 'object') //backwards compat
            this.maxSpan = options.dateLimit;

        if (typeof options.opens === 'string')
            this.opens = options.opens;

        if (typeof options.drops === 'string')
            this.drops = options.drops;

        if (typeof options.showWeekNumbers === 'boolean')
            this.showWeekNumbers = options.showWeekNumbers;

        if (typeof options.showISOWeekNumbers === 'boolean')
            this.showISOWeekNumbers = options.showISOWeekNumbers;

        if (typeof options.buttonClasses === 'string')
            this.buttonClasses = options.buttonClasses;

        if (typeof options.buttonClasses === 'object')
            this.buttonClasses = options.buttonClasses.join(' ');

        if (typeof options.showDropdowns === 'boolean')
            this.showDropdowns = options.showDropdowns;

        if (typeof options.minYear === 'number')
            this.minYear = options.minYear;

        if (typeof options.maxYear === 'number')
            this.maxYear = options.maxYear;

        if (typeof options.showCustomRangeLabel === 'boolean')
            this.showCustomRangeLabel = options.showCustomRangeLabel;

        if (typeof options.singleDatePicker === 'boolean') {
            this.singleDatePicker = options.singleDatePicker;
            if (this.singleDatePicker)
                this.endDate = this.startDate.clone();
        }

        if (typeof options.timePicker === 'boolean')
            this.timePicker = options.timePicker;

        if (typeof options.timePickerSeconds === 'boolean')
            this.timePickerSeconds = options.timePickerSeconds;

        if (typeof options.timePickerIncrement === 'number')
            this.timePickerIncrement = options.timePickerIncrement;

        if (typeof options.timePicker24Hour === 'boolean')
            this.timePicker24Hour = options.timePicker24Hour;

        if (typeof options.autoApply === 'boolean')
            this.autoApply = options.autoApply;

        if (typeof options.autoUpdateInput === 'boolean')
            this.autoUpdateInput = options.autoUpdateInput;

        if (typeof options.linkedCalendars === 'boolean')
            this.linkedCalendars = options.linkedCalendars;

        if (typeof options.isInvalidDate === 'function')
            this.isInvalidDate = options.isInvalidDate;

        if (typeof options.isCustomDate === 'function')
            this.isCustomDate = options.isCustomDate;

        if (typeof options.alwaysShowCalendars === 'boolean')
            this.alwaysShowCalendars = options.alwaysShowCalendars;

        // update day names order to firstDay
        if (this.locale.firstDay != 0) {
            var iterator = this.locale.firstDay;
            while (iterator > 0) {
                this.locale.daysOfWeek.push(this.locale.daysOfWeek.shift());
                iterator--;
            }
        }

        var start, end, range;

        //if no start/end dates set, check if an input element contains initial values
        if (typeof options.startDate === 'undefined' && typeof options.endDate === 'undefined') {
            if ($(this.element).is(':text')) {
                var val = $(this.element).val(),
                    split = val.split(this.locale.separator);

                start = end = null;

                if (split.length == 2) {
                    start = moment(split[0], this.locale.format);
                    end = moment(split[1], this.locale.format);
                } else if (this.singleDatePicker && val !== "") {
                    start = moment(val, this.locale.format);
                    end = moment(val, this.locale.format);
                }
                if (start !== null && end !== null) {
                    this.setStartDate(start);
                    this.setEndDate(end);
                }
            }
        }

        if (typeof options.ranges === 'object') {
            for (range in options.ranges) {

                if (typeof options.ranges[range][0] === 'string')
                    start = moment(options.ranges[range][0], this.locale.format);
                else
                    start = moment(options.ranges[range][0]);

                if (typeof options.ranges[range][1] === 'string')
                    end = moment(options.ranges[range][1], this.locale.format);
                else
                    end = moment(options.ranges[range][1]);

                // If the start or end date exceed those allowed by the minDate or maxSpan
                // options, shorten the range to the allowable period.
                if (this.minDate && start.isBefore(this.minDate))
                    start = this.minDate.clone();

                var maxDate = this.maxDate;
                if (this.maxSpan && maxDate && start.clone().add(this.maxSpan).isAfter(maxDate))
                    maxDate = start.clone().add(this.maxSpan);
                if (maxDate && end.isAfter(maxDate))
                    end = maxDate.clone();

                // If the end of the range is before the minimum or the start of the range is
                // after the maximum, don't display this range option at all.
                if ((this.minDate && end.isBefore(this.minDate, this.timepicker ? 'minute' : 'day'))
                  || (maxDate && start.isAfter(maxDate, this.timepicker ? 'minute' : 'day')))
                    continue;

                //Support unicode chars in the range names.
                var elem = document.createElement('textarea');
                elem.innerHTML = range;
                var rangeHtml = elem.value;

                this.ranges[rangeHtml] = [start, end];
            }

            var list = '<ul>';
            for (range in this.ranges) {
                list += '<li data-range-key="' + range + '">' + range + '</li>';
            }
            if (this.showCustomRangeLabel) {
                list += '<li data-range-key="' + this.locale.customRangeLabel + '">' + this.locale.customRangeLabel + '</li>';
            }
            list += '</ul>';
            this.container.find('.ranges').prepend(list);
        }

        if (typeof cb === 'function') {
            this.callback = cb;
        }

        if (!this.timePicker) {
            this.startDate = this.startDate.startOf('day');
            this.endDate = this.endDate.endOf('day');
            this.container.find('.calendar-time').hide();
        }

        //can't be used together for now
        if (this.timePicker && this.autoApply)
            this.autoApply = false;

        if (this.autoApply) {
            this.container.addClass('auto-apply');
        }

        if (typeof options.ranges === 'object')
            this.container.addClass('show-ranges');

        if (this.singleDatePicker) {
            this.container.addClass('single');
            this.container.find('.drp-calendar.left').addClass('single');
            this.container.find('.drp-calendar.left').show();
            this.container.find('.drp-calendar.right').hide();
            if (!this.timePicker) {
                this.container.addClass('auto-apply');
            }
        }

        if ((typeof options.ranges === 'undefined' && !this.singleDatePicker) || this.alwaysShowCalendars) {
            this.container.addClass('show-calendar');
        }

        this.container.addClass('opens' + this.opens);

        //apply CSS classes and labels to buttons
        this.container.find('.applyBtn, .cancelBtn').addClass(this.buttonClasses);
        if (this.applyButtonClasses.length)
            this.container.find('.applyBtn').addClass(this.applyButtonClasses);
        if (this.cancelButtonClasses.length)
            this.container.find('.cancelBtn').addClass(this.cancelButtonClasses);
        this.container.find('.applyBtn').html(this.locale.applyLabel);
        this.container.find('.cancelBtn').html(this.locale.cancelLabel);

        //
        // event listeners
        //

        this.container.find('.drp-calendar')
            .on('click.daterangepicker', '.prev', $.proxy(this.clickPrev, this))
            .on('click.daterangepicker', '.next', $.proxy(this.clickNext, this))
            .on('mousedown.daterangepicker', 'td.available', $.proxy(this.clickDate, this))
            .on('mouseenter.daterangepicker', 'td.available', $.proxy(this.hoverDate, this))
            .on('change.daterangepicker', 'select.yearselect', $.proxy(this.monthOrYearChanged, this))
            .on('change.daterangepicker', 'select.monthselect', $.proxy(this.monthOrYearChanged, this))
            .on('change.daterangepicker', 'select.hourselect,select.minuteselect,select.secondselect,select.ampmselect', $.proxy(this.timeChanged, this))

        this.container.find('.ranges')
            .on('click.daterangepicker', 'li', $.proxy(this.clickRange, this))

        this.container.find('.drp-buttons')
            .on('click.daterangepicker', 'button.applyBtn', $.proxy(this.clickApply, this))
            .on('click.daterangepicker', 'button.cancelBtn', $.proxy(this.clickCancel, this))

        if (this.element.is('input') || this.element.is('button')) {
            this.element.on({
                'click.daterangepicker': $.proxy(this.show, this),
                'focus.daterangepicker': $.proxy(this.show, this),
                'keyup.daterangepicker': $.proxy(this.elementChanged, this),
                'keydown.daterangepicker': $.proxy(this.keydown, this) //IE 11 compatibility
            });
        } else {
            this.element.on('click.daterangepicker', $.proxy(this.toggle, this));
            this.element.on('keydown.daterangepicker', $.proxy(this.toggle, this));
        }

        //
        // if attached to a text input, set the initial value
        //

        this.updateElement();

    };

    DateRangePicker.prototype = {

        constructor: DateRangePicker,

        setStartDate: function(startDate) {
            if (typeof startDate === 'string')
                this.startDate = moment(startDate, this.locale.format);

            if (typeof startDate === 'object')
                this.startDate = moment(startDate);

            if (!this.timePicker)
                this.startDate = this.startDate.startOf('day');

            if (this.timePicker && this.timePickerIncrement)
                this.startDate.minute(Math.round(this.startDate.minute() / this.timePickerIncrement) * this.timePickerIncrement);

            if (this.minDate && this.startDate.isBefore(this.minDate)) {
                this.startDate = this.minDate.clone();
                if (this.timePicker && this.timePickerIncrement)
                    this.startDate.minute(Math.round(this.startDate.minute() / this.timePickerIncrement) * this.timePickerIncrement);
            }

            if (this.maxDate && this.startDate.isAfter(this.maxDate)) {
                this.startDate = this.maxDate.clone();
                if (this.timePicker && this.timePickerIncrement)
                    this.startDate.minute(Math.floor(this.startDate.minute() / this.timePickerIncrement) * this.timePickerIncrement);
            }

            if (!this.isShowing)
                this.updateElement();

            this.updateMonthsInView();
        },

        setEndDate: function(endDate) {
            if (typeof endDate === 'string')
                this.endDate = moment(endDate, this.locale.format);

            if (typeof endDate === 'object')
                this.endDate = moment(endDate);

            if (!this.timePicker)
                this.endDate = this.endDate.add(1,'d').startOf('day').subtract(1,'second');

            if (this.timePicker && this.timePickerIncrement)
                this.endDate.minute(Math.round(this.endDate.minute() / this.timePickerIncrement) * this.timePickerIncrement);

            if (this.endDate.isBefore(this.startDate))
                this.endDate = this.startDate.clone();

            if (this.maxDate && this.endDate.isAfter(this.maxDate))
                this.endDate = this.maxDate.clone();

            if (this.maxSpan && this.startDate.clone().add(this.maxSpan).isBefore(this.endDate))
                this.endDate = this.startDate.clone().add(this.maxSpan);

            this.previousRightTime = this.endDate.clone();

            this.container.find('.drp-selected').html(this.startDate.format(this.locale.format) + this.locale.separator + this.endDate.format(this.locale.format));

            if (!this.isShowing)
                this.updateElement();

            this.updateMonthsInView();
        },

        isInvalidDate: function() {
            return false;
        },

        isCustomDate: function() {
            return false;
        },

        updateView: function() {
            if (this.timePicker) {
                this.renderTimePicker('left');
                this.renderTimePicker('right');
                if (!this.endDate) {
                    this.container.find('.right .calendar-time select').attr('disabled', 'disabled').addClass('disabled');
                } else {
                    this.container.find('.right .calendar-time select').removeAttr('disabled').removeClass('disabled');
                }
            }
            if (this.endDate)
                this.container.find('.drp-selected').html(this.startDate.format(this.locale.format) + this.locale.separator + this.endDate.format(this.locale.format));
            this.updateMonthsInView();
            this.updateCalendars();
            this.updateFormInputs();
        },

        updateMonthsInView: function() {
            if (this.endDate) {

                //if both dates are visible already, do nothing
                if (!this.singleDatePicker && this.leftCalendar.month && this.rightCalendar.month &&
                    (this.startDate.format('YYYY-MM') == this.leftCalendar.month.format('YYYY-MM') || this.startDate.format('YYYY-MM') == this.rightCalendar.month.format('YYYY-MM'))
                    &&
                    (this.endDate.format('YYYY-MM') == this.leftCalendar.month.format('YYYY-MM') || this.endDate.format('YYYY-MM') == this.rightCalendar.month.format('YYYY-MM'))
                    ) {
                    return;
                }

                this.leftCalendar.month = this.startDate.clone().date(2);
                if (!this.linkedCalendars && (this.endDate.month() != this.startDate.month() || this.endDate.year() != this.startDate.year())) {
                    this.rightCalendar.month = this.endDate.clone().date(2);
                } else {
                    this.rightCalendar.month = this.startDate.clone().date(2).add(1, 'month');
                }

            } else {
                if (this.leftCalendar.month.format('YYYY-MM') != this.startDate.format('YYYY-MM') && this.rightCalendar.month.format('YYYY-MM') != this.startDate.format('YYYY-MM')) {
                    this.leftCalendar.month = this.startDate.clone().date(2);
                    this.rightCalendar.month = this.startDate.clone().date(2).add(1, 'month');
                }
            }
            if (this.maxDate && this.linkedCalendars && !this.singleDatePicker && this.rightCalendar.month > this.maxDate) {
              this.rightCalendar.month = this.maxDate.clone().date(2);
              this.leftCalendar.month = this.maxDate.clone().date(2).subtract(1, 'month');
            }
        },

        updateCalendars: function() {

            if (this.timePicker) {
                var hour, minute, second;
                if (this.endDate) {
                    hour = parseInt(this.container.find('.left .hourselect').val(), 10);
                    minute = parseInt(this.container.find('.left .minuteselect').val(), 10);
                    second = this.timePickerSeconds ? parseInt(this.container.find('.left .secondselect').val(), 10) : 0;
                    if (!this.timePicker24Hour) {
                        var ampm = this.container.find('.left .ampmselect').val();
                        if (ampm === 'PM' && hour < 12)
                            hour += 12;
                        if (ampm === 'AM' && hour === 12)
                            hour = 0;
                    }
                } else {
                    hour = parseInt(this.container.find('.right .hourselect').val(), 10);
                    minute = parseInt(this.container.find('.right .minuteselect').val(), 10);
                    second = this.timePickerSeconds ? parseInt(this.container.find('.right .secondselect').val(), 10) : 0;
                    if (!this.timePicker24Hour) {
                        var ampm = this.container.find('.right .ampmselect').val();
                        if (ampm === 'PM' && hour < 12)
                            hour += 12;
                        if (ampm === 'AM' && hour === 12)
                            hour = 0;
                    }
                }
                this.leftCalendar.month.hour(hour).minute(minute).second(second);
                this.rightCalendar.month.hour(hour).minute(minute).second(second);
            }

            this.renderCalendar('left');
            this.renderCalendar('right');

            //highlight any predefined range matching the current start and end dates
            this.container.find('.ranges li').removeClass('active');
            if (this.endDate == null) return;

            this.calculateChosenLabel();
        },

        renderCalendar: function(side) {

            //
            // Build the matrix of dates that will populate the calendar
            //

            var calendar = side == 'left' ? this.leftCalendar : this.rightCalendar;
            var month = calendar.month.month();
            var year = calendar.month.year();
            var hour = calendar.month.hour();
            var minute = calendar.month.minute();
            var second = calendar.month.second();
            var daysInMonth = moment([year, month]).daysInMonth();
            var firstDay = moment([year, month, 1]);
            var lastDay = moment([year, month, daysInMonth]);
            var lastMonth = moment(firstDay).subtract(1, 'month').month();
            var lastYear = moment(firstDay).subtract(1, 'month').year();
            var daysInLastMonth = moment([lastYear, lastMonth]).daysInMonth();
            var dayOfWeek = firstDay.day();

            //initialize a 6 rows x 7 columns array for the calendar
            var calendar = [];
            calendar.firstDay = firstDay;
            calendar.lastDay = lastDay;

            for (var i = 0; i < 6; i++) {
                calendar[i] = [];
            }

            //populate the calendar with date objects
            var startDay = daysInLastMonth - dayOfWeek + this.locale.firstDay + 1;
            if (startDay > daysInLastMonth)
                startDay -= 7;

            if (dayOfWeek == this.locale.firstDay)
                startDay = daysInLastMonth - 6;

            var curDate = moment([lastYear, lastMonth, startDay, 12, minute, second]);

            var col, row;
            for (var i = 0, col = 0, row = 0; i < 42; i++, col++, curDate = moment(curDate).add(24, 'hour')) {
                if (i > 0 && col % 7 === 0) {
                    col = 0;
                    row++;
                }
                calendar[row][col] = curDate.clone().hour(hour).minute(minute).second(second);
                curDate.hour(12);

                if (this.minDate && calendar[row][col].format('YYYY-MM-DD') == this.minDate.format('YYYY-MM-DD') && calendar[row][col].isBefore(this.minDate) && side == 'left') {
                    calendar[row][col] = this.minDate.clone();
                }

                if (this.maxDate && calendar[row][col].format('YYYY-MM-DD') == this.maxDate.format('YYYY-MM-DD') && calendar[row][col].isAfter(this.maxDate) && side == 'right') {
                    calendar[row][col] = this.maxDate.clone();
                }

            }

            //make the calendar object available to hoverDate/clickDate
            if (side == 'left') {
                this.leftCalendar.calendar = calendar;
            } else {
                this.rightCalendar.calendar = calendar;
            }

            //
            // Display the calendar
            //

            var minDate = side == 'left' ? this.minDate : this.startDate;
            var maxDate = this.maxDate;
            var selected = side == 'left' ? this.startDate : this.endDate;
            var arrow = this.locale.direction == 'ltr' ? {left: 'chevron-left', right: 'chevron-right'} : {left: 'chevron-right', right: 'chevron-left'};

            var html = '<table class="table-condensed">';
            html += '<thead>';
            html += '<tr>';

            // add empty cell for week number
            if (this.showWeekNumbers || this.showISOWeekNumbers)
                html += '<th></th>';

            if ((!minDate || minDate.isBefore(calendar.firstDay)) && (!this.linkedCalendars || side == 'left')) {
                html += '<th class="prev available"><span></span></th>';
            } else {
                html += '<th></th>';
            }

            var dateHtml = this.locale.monthNames[calendar[1][1].month()] + calendar[1][1].format(" YYYY");

            if (this.showDropdowns) {
                var currentMonth = calendar[1][1].month();
                var currentYear = calendar[1][1].year();
                var maxYear = (maxDate && maxDate.year()) || (this.maxYear);
                var minYear = (minDate && minDate.year()) || (this.minYear);
                var inMinYear = currentYear == minYear;
                var inMaxYear = currentYear == maxYear;

                var monthHtml = '<select class="monthselect">';
                for (var m = 0; m < 12; m++) {
                    if ((!inMinYear || m >= minDate.month()) && (!inMaxYear || m <= maxDate.month())) {
                        monthHtml += "<option value='" + m + "'" +
                            (m === currentMonth ? " selected='selected'" : "") +
                            ">" + this.locale.monthNames[m] + "</option>";
                    } else {
                        monthHtml += "<option value='" + m + "'" +
                            (m === currentMonth ? " selected='selected'" : "") +
                            " disabled='disabled'>" + this.locale.monthNames[m] + "</option>";
                    }
                }
                monthHtml += "</select>";

                var yearHtml = '<select class="yearselect">';
                for (var y = minYear; y <= maxYear; y++) {
                    yearHtml += '<option value="' + y + '"' +
                        (y === currentYear ? ' selected="selected"' : '') +
                        '>' + y + '</option>';
                }
                yearHtml += '</select>';

                dateHtml = monthHtml + yearHtml;
            }

            html += '<th colspan="5" class="month">' + dateHtml + '</th>';
            if ((!maxDate || maxDate.isAfter(calendar.lastDay)) && (!this.linkedCalendars || side == 'right' || this.singleDatePicker)) {
                html += '<th class="next available"><span></span></th>';
            } else {
                html += '<th></th>';
            }

            html += '</tr>';
            html += '<tr>';

            // add week number label
            if (this.showWeekNumbers || this.showISOWeekNumbers)
                html += '<th class="week">' + this.locale.weekLabel + '</th>';

            $.each(this.locale.daysOfWeek, function(index, dayOfWeek) {
                html += '<th>' + dayOfWeek + '</th>';
            });

            html += '</tr>';
            html += '</thead>';
            html += '<tbody>';

            //adjust maxDate to reflect the maxSpan setting in order to
            //grey out end dates beyond the maxSpan
            if (this.endDate == null && this.maxSpan) {
                var maxLimit = this.startDate.clone().add(this.maxSpan).endOf('day');
                if (!maxDate || maxLimit.isBefore(maxDate)) {
                    maxDate = maxLimit;
                }
            }

            for (var row = 0; row < 6; row++) {
                html += '<tr>';

                // add week number
                if (this.showWeekNumbers)
                    html += '<td class="week">' + calendar[row][0].week() + '</td>';
                else if (this.showISOWeekNumbers)
                    html += '<td class="week">' + calendar[row][0].isoWeek() + '</td>';

                for (var col = 0; col < 7; col++) {

                    var classes = [];

                    //highlight today's date
                    if (calendar[row][col].isSame(new Date(), "day"))
                        classes.push('today');

                    //highlight weekends
                    if (calendar[row][col].isoWeekday() > 5)
                        classes.push('weekend');

                    //grey out the dates in other months displayed at beginning and end of this calendar
                    if (calendar[row][col].month() != calendar[1][1].month())
                        classes.push('off');

                    //don't allow selection of dates before the minimum date
                    if (this.minDate && calendar[row][col].isBefore(this.minDate, 'day'))
                        classes.push('off', 'disabled');

                    //don't allow selection of dates after the maximum date
                    if (maxDate && calendar[row][col].isAfter(maxDate, 'day'))
                        classes.push('off', 'disabled');

                    //don't allow selection of date if a custom function decides it's invalid
                    if (this.isInvalidDate(calendar[row][col]))
                        classes.push('off', 'disabled');

                    //highlight the currently selected start date
                    if (calendar[row][col].format('YYYY-MM-DD') == this.startDate.format('YYYY-MM-DD'))
                        classes.push('active', 'start-date');

                    //highlight the currently selected end date
                    if (this.endDate != null && calendar[row][col].format('YYYY-MM-DD') == this.endDate.format('YYYY-MM-DD'))
                        classes.push('active', 'end-date');

                    //highlight dates in-between the selected dates
                    if (this.endDate != null && calendar[row][col] > this.startDate && calendar[row][col] < this.endDate)
                        classes.push('in-range');

                    //apply custom classes for this date
                    var isCustom = this.isCustomDate(calendar[row][col]);
                    if (isCustom !== false) {
                        if (typeof isCustom === 'string')
                            classes.push(isCustom);
                        else
                            Array.prototype.push.apply(classes, isCustom);
                    }

                    var cname = '', disabled = false;
                    for (var i = 0; i < classes.length; i++) {
                        cname += classes[i] + ' ';
                        if (classes[i] == 'disabled')
                            disabled = true;
                    }
                    if (!disabled)
                        cname += 'available';

                    html += '<td class="' + cname.replace(/^\s+|\s+$/g, '') + '" data-title="' + 'r' + row + 'c' + col + '">' + calendar[row][col].date() + '</td>';

                }
                html += '</tr>';
            }

            html += '</tbody>';
            html += '</table>';

            this.container.find('.drp-calendar.' + side + ' .calendar-table').html(html);

        },

        renderTimePicker: function(side) {

            // Don't bother updating the time picker if it's currently disabled
            // because an end date hasn't been clicked yet
            if (side == 'right' && !this.endDate) return;

            var html, selected, minDate, maxDate = this.maxDate;

            if (this.maxSpan && (!this.maxDate || this.startDate.clone().add(this.maxSpan).isAfter(this.maxDate)))
                maxDate = this.startDate.clone().add(this.maxSpan);

            if (side == 'left') {
                selected = this.startDate.clone();
                minDate = this.minDate;
            } else if (side == 'right') {
                selected = this.endDate.clone();
                minDate = this.startDate;

                //Preserve the time already selected
                var timeSelector = this.container.find('.drp-calendar.right .calendar-time');
                if (timeSelector.html() != '') {

                    selected.hour(selected.hour() || timeSelector.find('.hourselect option:selected').val());
                    selected.minute(selected.minute() || timeSelector.find('.minuteselect option:selected').val());
                    selected.second(selected.second() || timeSelector.find('.secondselect option:selected').val());

                    if (!this.timePicker24Hour) {
                        var ampm = timeSelector.find('.ampmselect option:selected').val();
                        if (ampm === 'PM' && selected.hour() < 12)
                            selected.hour(selected.hour() + 12);
                        if (ampm === 'AM' && selected.hour() === 12)
                            selected.hour(0);
                    }

                }

                if (selected.isBefore(this.startDate))
                    selected = this.startDate.clone();

                if (maxDate && selected.isAfter(maxDate))
                    selected = maxDate.clone();

            }

            //
            // hours
            //

            html = '<select class="hourselect">';

            var start = this.timePicker24Hour ? 0 : 1;
            var end = this.timePicker24Hour ? 23 : 12;

            for (var i = start; i <= end; i++) {
                var i_in_24 = i;
                if (!this.timePicker24Hour)
                    i_in_24 = selected.hour() >= 12 ? (i == 12 ? 12 : i + 12) : (i == 12 ? 0 : i);

                var time = selected.clone().hour(i_in_24);
                var disabled = false;
                if (minDate && time.minute(59).isBefore(minDate))
                    disabled = true;
                if (maxDate && time.minute(0).isAfter(maxDate))
                    disabled = true;

                if (i_in_24 == selected.hour() && !disabled) {
                    html += '<option value="' + i + '" selected="selected">' + i + '</option>';
                } else if (disabled) {
                    html += '<option value="' + i + '" disabled="disabled" class="disabled">' + i + '</option>';
                } else {
                    html += '<option value="' + i + '">' + i + '</option>';
                }
            }

            html += '</select> ';

            //
            // minutes
            //

            html += ': <select class="minuteselect">';

            for (var i = 0; i < 60; i += this.timePickerIncrement) {
                var padded = i < 10 ? '0' + i : i;
                var time = selected.clone().minute(i);

                var disabled = false;
                if (minDate && time.second(59).isBefore(minDate))
                    disabled = true;
                if (maxDate && time.second(0).isAfter(maxDate))
                    disabled = true;

                if (selected.minute() == i && !disabled) {
                    html += '<option value="' + i + '" selected="selected">' + padded + '</option>';
                } else if (disabled) {
                    html += '<option value="' + i + '" disabled="disabled" class="disabled">' + padded + '</option>';
                } else {
                    html += '<option value="' + i + '">' + padded + '</option>';
                }
            }

            html += '</select> ';

            //
            // seconds
            //

            if (this.timePickerSeconds) {
                html += ': <select class="secondselect">';

                for (var i = 0; i < 60; i++) {
                    var padded = i < 10 ? '0' + i : i;
                    var time = selected.clone().second(i);

                    var disabled = false;
                    if (minDate && time.isBefore(minDate))
                        disabled = true;
                    if (maxDate && time.isAfter(maxDate))
                        disabled = true;

                    if (selected.second() == i && !disabled) {
                        html += '<option value="' + i + '" selected="selected">' + padded + '</option>';
                    } else if (disabled) {
                        html += '<option value="' + i + '" disabled="disabled" class="disabled">' + padded + '</option>';
                    } else {
                        html += '<option value="' + i + '">' + padded + '</option>';
                    }
                }

                html += '</select> ';
            }

            //
            // AM/PM
            //

            if (!this.timePicker24Hour) {
                html += '<select class="ampmselect">';

                var am_html = '';
                var pm_html = '';

                if (minDate && selected.clone().hour(12).minute(0).second(0).isBefore(minDate))
                    am_html = ' disabled="disabled" class="disabled"';

                if (maxDate && selected.clone().hour(0).minute(0).second(0).isAfter(maxDate))
                    pm_html = ' disabled="disabled" class="disabled"';

                if (selected.hour() >= 12) {
                    html += '<option value="AM"' + am_html + '>AM</option><option value="PM" selected="selected"' + pm_html + '>PM</option>';
                } else {
                    html += '<option value="AM" selected="selected"' + am_html + '>AM</option><option value="PM"' + pm_html + '>PM</option>';
                }

                html += '</select>';
            }

            this.container.find('.drp-calendar.' + side + ' .calendar-time').html(html);

        },

        updateFormInputs: function() {

            if (this.singleDatePicker || (this.endDate && (this.startDate.isBefore(this.endDate) || this.startDate.isSame(this.endDate)))) {
                this.container.find('button.applyBtn').removeAttr('disabled');
            } else {
                this.container.find('button.applyBtn').attr('disabled', 'disabled');
            }

        },

        move: function() {
            var parentOffset = { top: 0, left: 0 },
                containerTop;
            var parentRightEdge = $(window).width();
            if (!this.parentEl.is('body')) {
                parentOffset = {
                    top: this.parentEl.offset().top - this.parentEl.scrollTop(),
                    left: this.parentEl.offset().left - this.parentEl.scrollLeft()
                };
                parentRightEdge = this.parentEl[0].clientWidth + this.parentEl.offset().left;
            }

            if (this.drops == 'up')
                containerTop = this.element.offset().top - this.container.outerHeight() - parentOffset.top;
            else
                containerTop = this.element.offset().top + this.element.outerHeight() - parentOffset.top;
            this.container[this.drops == 'up' ? 'addClass' : 'removeClass']('drop-up');

            if (this.opens == 'left') {
                this.container.css({
                    top: containerTop,
                    right: parentRightEdge - this.element.offset().left - this.element.outerWidth(),
                    left: 'auto'
                });
                if (this.container.offset().left < 0) {
                    this.container.css({
                        right: 'auto',
                        left: 9
                    });
                }
            } else if (this.opens == 'center') {
                this.container.css({
                    top: containerTop,
                    left: this.element.offset().left - parentOffset.left + this.element.outerWidth() / 2
                            - this.container.outerWidth() / 2,
                    right: 'auto'
                });
                if (this.container.offset().left < 0) {
                    this.container.css({
                        right: 'auto',
                        left: 9
                    });
                }
            } else {
                this.container.css({
                    top: containerTop,
                    left: this.element.offset().left - parentOffset.left,
                    right: 'auto'
                });
                if (this.container.offset().left + this.container.outerWidth() > $(window).width()) {
                    this.container.css({
                        left: 'auto',
                        right: 0
                    });
                }
            }
        },

        show: function(e) {
            if (this.isShowing) return;

            // Create a click proxy that is private to this instance of datepicker, for unbinding
            this._outsideClickProxy = $.proxy(function(e) { this.outsideClick(e); }, this);

            // Bind global datepicker mousedown for hiding and
            $(document)
              .on('mousedown.daterangepicker', this._outsideClickProxy)
              // also support mobile devices
              .on('touchend.daterangepicker', this._outsideClickProxy)
              // also explicitly play nice with Bootstrap dropdowns, which stopPropagation when clicking them
              .on('click.daterangepicker', '[data-toggle=dropdown]', this._outsideClickProxy)
              // and also close when focus changes to outside the picker (eg. tabbing between controls)
              .on('focusin.daterangepicker', this._outsideClickProxy);

            // Reposition the picker if the window is resized while it's open
            $(window).on('resize.daterangepicker', $.proxy(function(e) { this.move(e); }, this));

            this.oldStartDate = this.startDate.clone();
            this.oldEndDate = this.endDate.clone();
            this.previousRightTime = this.endDate.clone();

            this.updateView();
            this.container.show();
            this.move();
            this.element.trigger('show.daterangepicker', this);
            this.isShowing = true;
        },

        hide: function(e) {
            if (!this.isShowing) return;

            //incomplete date selection, revert to last values
            if (!this.endDate) {
                this.startDate = this.oldStartDate.clone();
                this.endDate = this.oldEndDate.clone();
            }

            //if a new date range was selected, invoke the user callback function
            if (!this.startDate.isSame(this.oldStartDate) || !this.endDate.isSame(this.oldEndDate))
                this.callback(this.startDate.clone(), this.endDate.clone(), this.chosenLabel);

            //if picker is attached to a text input, update it
            this.updateElement();

            $(document).off('.daterangepicker');
            $(window).off('.daterangepicker');
            this.container.hide();
            this.element.trigger('hide.daterangepicker', this);
            this.isShowing = false;
        },

        toggle: function(e) {
            if (this.isShowing) {
                this.hide();
            } else {
                this.show();
            }
        },

        outsideClick: function(e) {
            var target = $(e.target);
            // if the page is clicked anywhere except within the daterangerpicker/button
            // itself then call this.hide()
            if (
                // ie modal dialog fix
                e.type == "focusin" ||
                target.closest(this.element).length ||
                target.closest(this.container).length ||
                target.closest('.calendar-table').length
                ) return;
            this.hide();
            this.element.trigger('outsideClick.daterangepicker', this);
        },

        showCalendars: function() {
            this.container.addClass('show-calendar');
            this.move();
            this.element.trigger('showCalendar.daterangepicker', this);
        },

        hideCalendars: function() {
            this.container.removeClass('show-calendar');
            this.element.trigger('hideCalendar.daterangepicker', this);
        },

        clickRange: function(e) {
            var label = e.target.getAttribute('data-range-key');
            this.chosenLabel = label;
            if (label == this.locale.customRangeLabel) {
                this.showCalendars();
            } else {
                var dates = this.ranges[label];
                this.startDate = dates[0];
                this.endDate = dates[1];

                if (!this.timePicker) {
                    this.startDate.startOf('day');
                    this.endDate.endOf('day');
                }

                if (!this.alwaysShowCalendars)
                    this.hideCalendars();
                this.clickApply();
            }
        },

        clickPrev: function(e) {
            var cal = $(e.target).parents('.drp-calendar');
            if (cal.hasClass('left')) {
                this.leftCalendar.month.subtract(1, 'month');
                if (this.linkedCalendars)
                    this.rightCalendar.month.subtract(1, 'month');
            } else {
                this.rightCalendar.month.subtract(1, 'month');
            }
            this.updateCalendars();
        },

        clickNext: function(e) {
            var cal = $(e.target).parents('.drp-calendar');
            if (cal.hasClass('left')) {
                this.leftCalendar.month.add(1, 'month');
            } else {
                this.rightCalendar.month.add(1, 'month');
                if (this.linkedCalendars)
                    this.leftCalendar.month.add(1, 'month');
            }
            this.updateCalendars();
        },

        hoverDate: function(e) {

            //ignore dates that can't be selected
            if (!$(e.target).hasClass('available')) return;

            var title = $(e.target).attr('data-title');
            var row = title.substr(1, 1);
            var col = title.substr(3, 1);
            var cal = $(e.target).parents('.drp-calendar');
            var date = cal.hasClass('left') ? this.leftCalendar.calendar[row][col] : this.rightCalendar.calendar[row][col];

            //highlight the dates between the start date and the date being hovered as a potential end date
            var leftCalendar = this.leftCalendar;
            var rightCalendar = this.rightCalendar;
            var startDate = this.startDate;
            if (!this.endDate) {
                this.container.find('.drp-calendar tbody td').each(function(index, el) {

                    //skip week numbers, only look at dates
                    if ($(el).hasClass('week')) return;

                    var title = $(el).attr('data-title');
                    var row = title.substr(1, 1);
                    var col = title.substr(3, 1);
                    var cal = $(el).parents('.drp-calendar');
                    var dt = cal.hasClass('left') ? leftCalendar.calendar[row][col] : rightCalendar.calendar[row][col];

                    if ((dt.isAfter(startDate) && dt.isBefore(date)) || dt.isSame(date, 'day')) {
                        $(el).addClass('in-range');
                    } else {
                        $(el).removeClass('in-range');
                    }

                });
            }

        },

        clickDate: function(e) {

            if (!$(e.target).hasClass('available')) return;

            var title = $(e.target).attr('data-title');
            var row = title.substr(1, 1);
            var col = title.substr(3, 1);
            var cal = $(e.target).parents('.drp-calendar');
            var date = cal.hasClass('left') ? this.leftCalendar.calendar[row][col] : this.rightCalendar.calendar[row][col];

            //
            // this function needs to do a few things:
            // * alternate between selecting a start and end date for the range,
            // * if the time picker is enabled, apply the hour/minute/second from the select boxes to the clicked date
            // * if autoapply is enabled, and an end date was chosen, apply the selection
            // * if single date picker mode, and time picker isn't enabled, apply the selection immediately
            // * if one of the inputs above the calendars was focused, cancel that manual input
            //

            if (this.endDate || date.isBefore(this.startDate, 'day')) { //picking start
                if (this.timePicker) {
                    var hour = parseInt(this.container.find('.left .hourselect').val(), 10);
                    if (!this.timePicker24Hour) {
                        var ampm = this.container.find('.left .ampmselect').val();
                        if (ampm === 'PM' && hour < 12)
                            hour += 12;
                        if (ampm === 'AM' && hour === 12)
                            hour = 0;
                    }
                    var minute = parseInt(this.container.find('.left .minuteselect').val(), 10);
                    var second = this.timePickerSeconds ? parseInt(this.container.find('.left .secondselect').val(), 10) : 0;
                    date = date.clone().hour(hour).minute(minute).second(second);
                }
                this.endDate = null;
                this.setStartDate(date.clone());
            } else if (!this.endDate && date.isBefore(this.startDate)) {
                //special case: clicking the same date for start/end,
                //but the time of the end date is before the start date
                this.setEndDate(this.startDate.clone());
            } else { // picking end
                if (this.timePicker) {
                    var hour = parseInt(this.container.find('.right .hourselect').val(), 10);
                    if (!this.timePicker24Hour) {
                        var ampm = this.container.find('.right .ampmselect').val();
                        if (ampm === 'PM' && hour < 12)
                            hour += 12;
                        if (ampm === 'AM' && hour === 12)
                            hour = 0;
                    }
                    var minute = parseInt(this.container.find('.right .minuteselect').val(), 10);
                    var second = this.timePickerSeconds ? parseInt(this.container.find('.right .secondselect').val(), 10) : 0;
                    date = date.clone().hour(hour).minute(minute).second(second);
                }
                this.setEndDate(date.clone());
                if (this.autoApply) {
                  this.calculateChosenLabel();
                  this.clickApply();
                }
            }

            if (this.singleDatePicker) {
                this.setEndDate(this.startDate);
                if (!this.timePicker)
                    this.clickApply();
            }

            this.updateView();

            //This is to cancel the blur event handler if the mouse was in one of the inputs
            e.stopPropagation();

        },

        calculateChosenLabel: function () {
            var customRange = true;
            var i = 0;
            for (var range in this.ranges) {
              if (this.timePicker) {
                    var format = this.timePickerSeconds ? "YYYY-MM-DD hh:mm:ss" : "YYYY-MM-DD hh:mm";
                    //ignore times when comparing dates if time picker seconds is not enabled
                    if (this.startDate.format(format) == this.ranges[range][0].format(format) && this.endDate.format(format) == this.ranges[range][1].format(format)) {
                        customRange = false;
                        this.chosenLabel = this.container.find('.ranges li:eq(' + i + ')').addClass('active').attr('data-range-key');
                        break;
                    }
                } else {
                    //ignore times when comparing dates if time picker is not enabled
                    if (this.startDate.format('YYYY-MM-DD') == this.ranges[range][0].format('YYYY-MM-DD') && this.endDate.format('YYYY-MM-DD') == this.ranges[range][1].format('YYYY-MM-DD')) {
                        customRange = false;
                        this.chosenLabel = this.container.find('.ranges li:eq(' + i + ')').addClass('active').attr('data-range-key');
                        break;
                    }
                }
                i++;
            }
            if (customRange) {
                if (this.showCustomRangeLabel) {
                    this.chosenLabel = this.container.find('.ranges li:last').addClass('active').attr('data-range-key');
                } else {
                    this.chosenLabel = null;
                }
                this.showCalendars();
            }
        },

        clickApply: function(e) {
            this.hide();
            this.element.trigger('apply.daterangepicker', this);
        },

        clickCancel: function(e) {
            this.startDate = this.oldStartDate;
            this.endDate = this.oldEndDate;
            this.hide();
            this.element.trigger('cancel.daterangepicker', this);
        },

        monthOrYearChanged: function(e) {
            var isLeft = $(e.target).closest('.drp-calendar').hasClass('left'),
                leftOrRight = isLeft ? 'left' : 'right',
                cal = this.container.find('.drp-calendar.'+leftOrRight);

            // Month must be Number for new moment versions
            var month = parseInt(cal.find('.monthselect').val(), 10);
            var year = cal.find('.yearselect').val();

            if (!isLeft) {
                if (year < this.startDate.year() || (year == this.startDate.year() && month < this.startDate.month())) {
                    month = this.startDate.month();
                    year = this.startDate.year();
                }
            }

            if (this.minDate) {
                if (year < this.minDate.year() || (year == this.minDate.year() && month < this.minDate.month())) {
                    month = this.minDate.month();
                    year = this.minDate.year();
                }
            }

            if (this.maxDate) {
                if (year > this.maxDate.year() || (year == this.maxDate.year() && month > this.maxDate.month())) {
                    month = this.maxDate.month();
                    year = this.maxDate.year();
                }
            }

            if (isLeft) {
                this.leftCalendar.month.month(month).year(year);
                if (this.linkedCalendars)
                    this.rightCalendar.month = this.leftCalendar.month.clone().add(1, 'month');
            } else {
                this.rightCalendar.month.month(month).year(year);
                if (this.linkedCalendars)
                    this.leftCalendar.month = this.rightCalendar.month.clone().subtract(1, 'month');
            }
            this.updateCalendars();
        },

        timeChanged: function(e) {

            var cal = $(e.target).closest('.drp-calendar'),
                isLeft = cal.hasClass('left');

            var hour = parseInt(cal.find('.hourselect').val(), 10);
            var minute = parseInt(cal.find('.minuteselect').val(), 10);
            var second = this.timePickerSeconds ? parseInt(cal.find('.secondselect').val(), 10) : 0;

            if (!this.timePicker24Hour) {
                var ampm = cal.find('.ampmselect').val();
                if (ampm === 'PM' && hour < 12)
                    hour += 12;
                if (ampm === 'AM' && hour === 12)
                    hour = 0;
            }

            if (isLeft) {
                var start = this.startDate.clone();
                start.hour(hour);
                start.minute(minute);
                start.second(second);
                this.setStartDate(start);
                if (this.singleDatePicker) {
                    this.endDate = this.startDate.clone();
                } else if (this.endDate && this.endDate.format('YYYY-MM-DD') == start.format('YYYY-MM-DD') && this.endDate.isBefore(start)) {
                    this.setEndDate(start.clone());
                }
            } else if (this.endDate) {
                var end = this.endDate.clone();
                end.hour(hour);
                end.minute(minute);
                end.second(second);
                this.setEndDate(end);
            }

            //update the calendars so all clickable dates reflect the new time component
            this.updateCalendars();

            //update the form inputs above the calendars with the new time
            this.updateFormInputs();

            //re-render the time pickers because changing one selection can affect what's enabled in another
            this.renderTimePicker('left');
            this.renderTimePicker('right');

        },

        elementChanged: function() {
            if (!this.element.is('input')) return;
            if (!this.element.val().length) return;

            var dateString = this.element.val().split(this.locale.separator),
                start = null,
                end = null;

            if (dateString.length === 2) {
                start = moment(dateString[0], this.locale.format);
                end = moment(dateString[1], this.locale.format);
            }

            if (this.singleDatePicker || start === null || end === null) {
                start = moment(this.element.val(), this.locale.format);
                end = start;
            }

            if (!start.isValid() || !end.isValid()) return;

            this.setStartDate(start);
            this.setEndDate(end);
            this.updateView();
        },

        keydown: function(e) {
            //hide on tab or enter
            if ((e.keyCode === 9) || (e.keyCode === 13)) {
                this.hide();
            }

            //hide on esc and prevent propagation
            if (e.keyCode === 27) {
                e.preventDefault();
                e.stopPropagation();

                this.hide();
            }
        },

        updateElement: function() {
            if (this.element.is('input') && this.autoUpdateInput) {
                var newValue = this.startDate.format(this.locale.format);
                if (!this.singleDatePicker) {
                    newValue += this.locale.separator + this.endDate.format(this.locale.format);
                }
                if (newValue !== this.element.val()) {
                    this.element.val(newValue).trigger('change');
                }
            }
        },

        remove: function() {
            this.container.remove();
            this.element.off('.daterangepicker');
            this.element.removeData();
        }

    };

    $.fn.daterangepicker = function(options, callback) {
        var implementOptions = $.extend(true, {}, $.fn.daterangepicker.defaultOptions, options);
        this.each(function() {
            var el = $(this);
            if (el.data('daterangepicker'))
                el.data('daterangepicker').remove();
            el.data('daterangepicker', new DateRangePicker(el, implementOptions, callback));
        });
        return this;
    };

    return DateRangePicker;

}));
// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, or any plugin's
// vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//

















;
