// page init
jQuery(function() {
    jcf.customForms.replaceAll();
    initBackgroundResize();
    initSameHeight();
    jQuery('input, textarea').placeholder();
    initAjaxTabs();
    initValidation();
    initOpenClose();
});

// form validation function
function initValidation() {
    var errorClass = 'error';
    var successClass = 'success';
    var regEmail = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    var regPhone = /^[0-9]+$/;

    jQuery('form.validate-form').each(function() {
        var form = jQuery(this).attr('novalidate', 'novalidate');
        var successFlag = true;
        var inputs = form.find('input, textarea, select');

        // form validation function
        function validateForm(e) {
            successFlag = true;

            inputs.each(checkField);

            if (!successFlag) {
                e.preventDefault();
            }
        }

        // check field
        function checkField(i, obj) {
            var currentObject = jQuery(obj);
            var currentParent = currentObject.closest('.form-group');

            // not empty fields
            if (currentObject.hasClass('required')) {
                setState(currentParent, currentObject, !currentObject.val().length || currentObject.val() === currentObject.prop('defaultValue'));
            }
            // correct email fields
            if (currentObject.hasClass('required-email')) {
                setState(currentParent, currentObject, !regEmail.test(currentObject.val()));
            }
            // correct number fields
            if (currentObject.hasClass('required-number')) {
                setState(currentParent, currentObject, !regPhone.test(currentObject.val()));
            }
            // something selected
            if (currentObject.hasClass('required-select')) {
                setState(currentParent, currentObject, currentObject.get(0).selectedIndex === 0);
            }
        }

        // set state
        function setState(hold, field, error) {
            hold.removeClass(errorClass).removeClass(successClass);
            if (error) {
                hold.addClass(errorClass);
                field.one('focus', function() {
                    hold.removeClass(errorClass).removeClass(successClass);
                });
                successFlag = false;
            } else {
                hold.addClass(successClass);
            }
        }

        // form event handlers
        form.submit(validateForm);
    });
}

// open-close init
function initOpenClose() {
    jQuery('div.video-btn').openClose({
        activeClass: 'active',
        opener: '.btn-play',
        slider: '.slide',
        animSpeed: 400,
        effect: 'slide',
        onChange: function(self){
            var video = self.slider.find('iframe');
			if(self.openState){
				if(video.length && video.data('url')){
					video.attr('src', video.data('url'));
				}
			}
			else{
				setTimeout(function(){
					video.attr('src','');
				},self.options.animSpeed);
			}
        }
    });
}


function initAjaxTabs() {
    jQuery('.js-ajax-tabs').ajaxTabs({
        loadingClass: 'ajax-loading',
        activeClass: 'active',
        addToParent: false,
        tabLinks: 'li',
        tabHolder: '.ajax-hold',
        attrib: 'data-href',
        animSpeed: 400,
        effect: 'slide',
        onTabLoad: function(tab) {
            jcf.customForms.replaceAll(tab.get(0));
        }
    });
}

// stretch background to fill blocks
function initBackgroundResize() {
    jQuery('.bg-stretch').each(function() {
        ImageStretcher.add({
            container: this,
            image: 'img'
        });
    });
}

// align blocks height
function initSameHeight() {
    jQuery('.features').sameHeight({
        elements: 'article',
        flexible: true,
        multiLine: true
    });
    jQuery('.threecolumn').sameHeight({
        elements: '.text',
        flexible: true,
        multiLine: true
    });
}

/*
 * jQuery Ajax Tabs plugin
 */
;
(function($) {
    function AjaxTabs(options) {
        this.options = $.extend({
            loadingClass: 'ajax-loading',
            activeClass: 'active',
            addToParent: true,
            tabLinks: 'a.tab',
            tabHolder: '.ajax-hold',
            tabClass: null,
            hiddenClass: 'js-hidden',
            collapsible: false,
            animSpeed: 400,
            attrib: 'href',
            effect: 'fade',
            event: 'click'
        }, options);
        this.init();
    }
    AjaxTabs.prototype = {
        init: function() {
            this.findElements();
            this.attachEvents();
            this.makeCallback('onInit', this);
        },
        findElements: function() {
            var self = this,
                link,
                src;
            this.tabset = $(this.options.tabset);
            this.tabLinks = this.tabset.find(this.options.tabLinks);
            this.parents = this.tabLinks.parent();
            this.tabHolder = $(this.options.tabHolder);
            if (this.options.addToParent) {
                link = this.parents.filter('.' + this.options.activeClass).find(this.options.tabLinks);
                classOwner = link.parent();
            } else {
                link = this.tabLinks.filter('.' + this.options.activeClass);
                classOwner = link;
            }

            src = link.attr(this.options.attrib);
            if (src) {
                this.loadTab(src, function(tab) {
                    self.openTab(tab, true);
                    self.refreshState(classOwner);
                });
            }
        },
        attachEvents: function() {
            var self = this;

            this.eventHandler = function(e) {
                e.preventDefault();
                var link = $(this),
                    classOwner = self.options.addToParent ? link.parent() : link;

                if (classOwner.hasClass(self.options.activeClass)) {
                    if (self.options.collapsible) {
                        self.closeTab();
                        self.refreshState();
                    }
                } else {
                    self.loadTab(link.attr(self.options.attrib), function(tab) {
                        self.openTab(tab);
                        self.refreshState(classOwner);
                    });
                }
            }
            this.tabLinks.on(this.options.event, this.eventHandler);
        },
        loadTab: function(src, callback) {
            var self = this;
            this.tabHolder.addClass(this.options.loadingClass);
            jQuery.ajax({
                url: src,
                type: 'get',
                data: 'ajax=1',
                dataType: 'html',
                success: function(data) {
                    var tab;
                    if (self.options.tabClass) {
                        tab = jQuery(data).find('.' + self.options.tabClass);
                    } else {
                        tab = $('<div>', {
                            'class': self.options.tabClass,
                            html: data
                        });
                    }

                    self.tabHolder.removeClass(self.options.loadingClass);

                    self.closeTab(function() {
                        tab.appendTo(self.tabHolder).addClass();

                        var tabWidth = tab.width();
                        tab.css({
                            width: tabWidth
                        });
                        tab.addClass(self.options.hiddenClass);

                        self.makeCallback('onTabLoad', tab, data);
                        if (typeof callback === 'function') {
                            callback(tab);
                        }
                    });
                },
                error: function() {
                    if (window.console) {
                        console.log('ajax error!');
                    }
                }
            });
        },
        openTab: function(tab, initial) {
            var self = this;

            if (tab.length) {
                self.makeCallback('animStart', true);
                tab.css({
                    width: ''
                }).removeClass(self.options.hiddenClass);
                self.tabsEffect[self.options.effect].switchState({
                    state: true,
                    tab: tab,
                    initial: initial,
                    complete: function() {
                        self.makeCallback('animEnd', true);
                    }
                });
            }
        },
        closeTab: function(callback) {
            var self = this,
                tab = this.tabHolder.children();

            self.makeCallback('animStart', false);
            if (tab.length) {
                this.tabsEffect[this.options.effect].switchState({
                    state: false,
                    tab: tab,
                    complete: function() {
                        self.tabHolder.empty();
                        self.makeCallback('animEnd', false);
                        if (typeof callback === 'function') {
                            callback();
                        }
                    }
                });
            } else {
                if (typeof callback === 'function') {
                    callback();
                }
            }
        },
        refreshState: function(classOwner) {
            (this.options.addToParent ? this.parents : this.tabLinks).removeClass(this.options.activeClass);
            classOwner.addClass(this.options.activeClass);
        },
        makeCallback: function(name) {
            if (typeof this.options[name] === 'function') {
                var args = Array.prototype.slice.call(arguments, 1);
                this.options[name].apply(this, args);
            }
        },
        destroy: function() {
            this.tabLinks.off(this.options.event, this.eventHandler);
            this.tabHolder.removeClass(this.options.loadingClass);
            (this.options.addToParent ? this.parents : this.tabLinks).removeClass(this.options.activeClass);
            this.tabHolder.empty();
            this.tabset.removeData('ContentTabs');
        },
        tabsEffect: {
            none: {
                switchState: function(options) {
                    if (typeof options.complete === 'function') {
                        options.complete.call(options.tab);
                    }
                }
            },
            fade: {
                switchState: function(options) {
                    if (options.initial) options.animSpeed = 0;
                    options.tab.css({
                        opacity: (options.state) ? 0 : 1
                    });
                    options.tab.stop(true, true).animate({
                        opacity: (options.state) ? 1 : 0
                    }, {
                        duration: options.animSpeed,
                        complete: function() {
                            if (typeof options.complete === 'function') {
                                options.complete.call(this);
                            }
                        }
                    });
                }
            },
            slide: {
                switchState: function(options) {
                    if (options.initial) options.animSpeed = 0;
                    var tabHeight = options.tab.height();
                    options.tab.css({
                        height: (options.state) ? 0 : tabHeight
                    });
                    options.tab.stop(true, true).animate({
                        height: (options.state) ? tabHeight : 0
                    }, {
                        duration: options.animSpeed,
                        complete: function() {
                            options.tab.css({
                                height: ''
                            });
                            if (typeof options.complete === 'function') {
                                options.complete.call(this);
                            }
                        }
                    });
                }
            }
        }
    }
    $.fn.ajaxTabs = function(options) {
        return this.each(function() {
            $(this).data('AjaxTabs', new AjaxTabs($.extend({
                tabset: this
            }, options)));
        });
    }
})(jQuery);

/*
 * jQuery SameHeight plugin
 */
;
(function($) {
    $.fn.sameHeight = function(opt) {
        var options = $.extend({
            skipClass: 'same-height-ignore',
            leftEdgeClass: 'same-height-left',
            rightEdgeClass: 'same-height-right',
            elements: '>*',
            flexible: false,
            multiLine: false,
            useMinHeight: false,
            biggestHeight: false
        }, opt);
        return this.each(function() {
            var holder = $(this),
                postResizeTimer, ignoreResize;
            var elements = holder.find(options.elements).not('.' + options.skipClass);
            if (!elements.length) return;

            // resize handler
            function doResize() {
                elements.css(options.useMinHeight && supportMinHeight ? 'minHeight' : 'height', '');
                if (options.multiLine) {
                    // resize elements row by row
                    resizeElementsByRows(elements, options);
                } else {
                    // resize elements by holder
                    resizeElements(elements, holder, options);
                }
            }
            doResize();

            // handle flexible layout / font resize
            var delayedResizeHandler = function() {
                if (!ignoreResize) {
                    ignoreResize = true;
                    doResize();
                    clearTimeout(postResizeTimer);
                    postResizeTimer = setTimeout(function() {
                        doResize();
                        setTimeout(function() {
                            ignoreResize = false;
                        }, 10);
                    }, 100);
                }
            };

            // handle flexible/responsive layout
            if (options.flexible) {
                $(window).bind('resize orientationchange fontresize', delayedResizeHandler);
            }

            // handle complete page load including images and fonts
            $(window).bind('load', delayedResizeHandler);
        });
    };

    // detect css min-height support
    var supportMinHeight = typeof document.documentElement.style.maxHeight !== 'undefined';

    // get elements by rows
    function resizeElementsByRows(boxes, options) {
        var currentRow = $(),
            maxHeight, maxCalcHeight = 0,
            firstOffset = boxes.eq(0).offset().top;
        boxes.each(function(ind) {
            var curItem = $(this);
            if (curItem.offset().top === firstOffset) {
                currentRow = currentRow.add(this);
            } else {
                maxHeight = getMaxHeight(currentRow);
                maxCalcHeight = Math.max(maxCalcHeight, resizeElements(currentRow, maxHeight, options));
                currentRow = curItem;
                firstOffset = curItem.offset().top;
            }
        });
        if (currentRow.length) {
            maxHeight = getMaxHeight(currentRow);
            maxCalcHeight = Math.max(maxCalcHeight, resizeElements(currentRow, maxHeight, options));
        }
        if (options.biggestHeight) {
            boxes.css(options.useMinHeight && supportMinHeight ? 'minHeight' : 'height', maxCalcHeight);
        }
    }

    // calculate max element height
    function getMaxHeight(boxes) {
        var maxHeight = 0;
        boxes.each(function() {
            maxHeight = Math.max(maxHeight, $(this).outerHeight());
        });
        return maxHeight;
    }

    // resize helper function
    function resizeElements(boxes, parent, options) {
        var calcHeight;
        var parentHeight = typeof parent === 'number' ? parent : parent.height();
        boxes.removeClass(options.leftEdgeClass).removeClass(options.rightEdgeClass).each(function(i) {
            var element = $(this);
            var depthDiffHeight = 0;
            var isBorderBox = element.css('boxSizing') === 'border-box' || element.css('-moz-box-sizing') === 'border-box' || '-webkit-box-sizing' === 'border-box';

            if (typeof parent !== 'number') {
                element.parents().each(function() {
                    var tmpParent = $(this);
                    if (parent.is(this)) {
                        return false;
                    } else {
                        depthDiffHeight += tmpParent.outerHeight() - tmpParent.height();
                    }
                });
            }
            calcHeight = parentHeight - depthDiffHeight;
            calcHeight -= isBorderBox ? 0 : element.outerHeight() - element.height();

            if (calcHeight > 0) {
                element.css(options.useMinHeight && supportMinHeight ? 'minHeight' : 'height', calcHeight);
            }
        });
        boxes.filter(':first').addClass(options.leftEdgeClass);
        boxes.filter(':last').addClass(options.rightEdgeClass);
        return calcHeight;
    }
}(jQuery));

/*
 * jQuery FontResize Event
 */
jQuery.onFontResize = (function($) {
    $(function() {
        var randomID = 'font-resize-frame-' + Math.floor(Math.random() * 1000);
        var resizeFrame = $('<iframe>').attr('id', randomID).addClass('font-resize-helper');

        // required styles
        resizeFrame.css({
            width: '100em',
            height: '10px',
            position: 'absolute',
            borderWidth: 0,
            top: '-9999px',
            left: '-9999px'
        }).appendTo('body');

        // use native IE resize event if possible
        if (window.attachEvent && !window.addEventListener) {
            resizeFrame.bind('resize', function() {
                $.onFontResize.trigger(resizeFrame[0].offsetWidth / 100);
            });
        }
        // use script inside the iframe to detect resize for other browsers
        else {
            var doc = resizeFrame[0].contentWindow.document;
            doc.open();
            doc.write('<scri' + 'pt>window.onload = function(){var em = parent.jQuery("#' + randomID + '")[0];window.onresize = function(){if(parent.jQuery.onFontResize){parent.jQuery.onFontResize.trigger(em.offsetWidth / 100);}}};</scri' + 'pt>');
            doc.close();
        }
        jQuery.onFontResize.initialSize = resizeFrame[0].offsetWidth / 100;
    });
    return {
        // public method, so it can be called from within the iframe
        trigger: function(em) {
            $(window).trigger("fontresize", [em]);
        }
    };
}(jQuery));

/*! http://mths.be/placeholder v2.0.7 by @mathias */
;
(function(window, document, $) {

    // Opera Mini v7 doesn’t support placeholder although its DOM seems to indicate so
    var isOperaMini = Object.prototype.toString.call(window.operamini) == '[object OperaMini]';
    var isInputSupported = 'placeholder' in document.createElement('input') && !isOperaMini;
    var isTextareaSupported = 'placeholder' in document.createElement('textarea') && !isOperaMini;
    var prototype = $.fn;
    var valHooks = $.valHooks;
    var propHooks = $.propHooks;
    var hooks;
    var placeholder;

    if (isInputSupported && isTextareaSupported) {

        placeholder = prototype.placeholder = function() {
            return this;
        };

        placeholder.input = placeholder.textarea = true;

    } else {

        placeholder = prototype.placeholder = function() {
            var $this = this;
            $this
                .filter((isInputSupported ? 'textarea' : ':input') + '[placeholder]')
                .not('.placeholder')
                .bind({
                    'focus.placeholder': clearPlaceholder,
                    'blur.placeholder': setPlaceholder
                })
                .data('placeholder-enabled', true)
                .trigger('blur.placeholder');
            return $this;
        };

        placeholder.input = isInputSupported;
        placeholder.textarea = isTextareaSupported;

        hooks = {
            'get': function(element) {
                var $element = $(element);

                var $passwordInput = $element.data('placeholder-password');
                if ($passwordInput) {
                    return $passwordInput[0].value;
                }

                return $element.data('placeholder-enabled') && $element.hasClass('placeholder') ? '' : element.value;
            },
            'set': function(element, value) {
                var $element = $(element);

                var $passwordInput = $element.data('placeholder-password');
                if ($passwordInput) {
                    return $passwordInput[0].value = value;
                }

                if (!$element.data('placeholder-enabled')) {
                    return element.value = value;
                }
                if (value == '') {
                    element.value = value;
                    // Issue #56: Setting the placeholder causes problems if the element continues to have focus.
                    if (element != safeActiveElement()) {
                        // We can't use `triggerHandler` here because of dummy text/password inputs :(
                        setPlaceholder.call(element);
                    }
                } else if ($element.hasClass('placeholder')) {
                    clearPlaceholder.call(element, true, value) || (element.value = value);
                } else {
                    element.value = value;
                }
                // `set` can not return `undefined`; see http://jsapi.info/jquery/1.7.1/val#L2363
                return $element;
            }
        };

        if (!isInputSupported) {
            valHooks.input = hooks;
            propHooks.value = hooks;
        }
        if (!isTextareaSupported) {
            valHooks.textarea = hooks;
            propHooks.value = hooks;
        }

        $(function() {
            // Look for forms
            $(document).delegate('form', 'submit.placeholder', function() {
                // Clear the placeholder values so they don't get submitted
                var $inputs = $('.placeholder', this).each(clearPlaceholder);
                setTimeout(function() {
                    $inputs.each(setPlaceholder);
                }, 10);
            });
        });

        // Clear placeholder values upon page reload
        $(window).bind('beforeunload.placeholder', function() {
            $('.placeholder').each(function() {
                this.value = '';
            });
        });

    }

    function args(elem) {
        // Return an object of element attributes
        var newAttrs = {};
        var rinlinejQuery = /^jQuery\d+$/;
        $.each(elem.attributes, function(i, attr) {
            if (attr.specified && !rinlinejQuery.test(attr.name)) {
                newAttrs[attr.name] = attr.value;
            }
        });
        return newAttrs;
    }

    function clearPlaceholder(event, value) {
        var input = this;
        var $input = $(input);
        if (input.value == $input.attr('placeholder') && $input.hasClass('placeholder')) {
            if ($input.data('placeholder-password')) {
                $input = $input.hide().next().show().attr('id', $input.removeAttr('id').data('placeholder-id'));
                // If `clearPlaceholder` was called from `$.valHooks.input.set`
                if (event === true) {
                    return $input[0].value = value;
                }
                $input.focus();
            } else {
                input.value = '';
                $input.removeClass('placeholder');
                input == safeActiveElement() && input.select();
            }
        }
    }

    function setPlaceholder() {
        var $replacement;
        var input = this;
        var $input = $(input);
        var id = this.id;
        if (input.value == '') {
            if (input.type == 'password') {
                if (!$input.data('placeholder-textinput')) {
                    try {
                        $replacement = $input.clone().attr({
                            'type': 'text'
                        });
                    } catch (e) {
                        $replacement = $('<input>').attr($.extend(args(this), {
                            'type': 'text'
                        }));
                    }
                    $replacement
                        .removeAttr('name')
                        .data({
                            'placeholder-password': $input,
                            'placeholder-id': id
                        })
                        .bind('focus.placeholder', clearPlaceholder);
                    $input
                        .data({
                            'placeholder-textinput': $replacement,
                            'placeholder-id': id
                        })
                        .before($replacement);
                }
                $input = $input.removeAttr('id').hide().prev().attr('id', id).show();
                // Note: `$input[0] != input` now!
            }
            $input.addClass('placeholder');
            $input[0].value = $input.attr('placeholder');
        } else {
            $input.removeClass('placeholder');
        }
    }

    function safeActiveElement() {
        // Avoid IE9 `document.activeElement` of death
        // https://github.com/mathiasbynens/jquery-placeholder/pull/99
        try {
            return document.activeElement;
        } catch (err) {}
    }

}(this, document, jQuery));

/*
 * JavaScript Custom Forms Module
 */
jcf = {
    // global options
    modules: {},
    plugins: {},
    baseOptions: {
        unselectableClass: 'jcf-unselectable',
        labelActiveClass: 'jcf-label-active',
        labelDisabledClass: 'jcf-label-disabled',
        classPrefix: 'jcf-class-',
        hiddenClass: 'jcf-hidden',
        focusClass: 'jcf-focus',
        wrapperTag: 'div'
    },
    // replacer function
    customForms: {
        setOptions: function(obj) {
            for (var p in obj) {
                if (obj.hasOwnProperty(p) && typeof obj[p] === 'object') {
                    jcf.lib.extend(jcf.modules[p].prototype.defaultOptions, obj[p]);
                }
            }
        },
        replaceAll: function(context) {
            for (var k in jcf.modules) {
                var els = jcf.lib.queryBySelector(jcf.modules[k].prototype.selector, context);
                for (var i = 0; i < els.length; i++) {
                    if (els[i].jcf) {
                        // refresh form element state
                        els[i].jcf.refreshState();
                    } else {
                        // replace form element
                        if (!jcf.lib.hasClass(els[i], 'default') && jcf.modules[k].prototype.checkElement(els[i])) {
                            new jcf.modules[k]({
                                replaces: els[i]
                            });
                        }
                    }
                }
            }
        },
        refreshAll: function(context) {
            for (var k in jcf.modules) {
                var els = jcf.lib.queryBySelector(jcf.modules[k].prototype.selector, context);
                for (var i = 0; i < els.length; i++) {
                    if (els[i].jcf) {
                        // refresh form element state
                        els[i].jcf.refreshState();
                    }
                }
            }
        },
        refreshElement: function(obj) {
            if (obj && obj.jcf) {
                obj.jcf.refreshState();
            }
        },
        destroyAll: function() {
            for (var k in jcf.modules) {
                var els = jcf.lib.queryBySelector(jcf.modules[k].prototype.selector);
                for (var i = 0; i < els.length; i++) {
                    if (els[i].jcf) {
                        els[i].jcf.destroy();
                    }
                }
            }
        }
    },
    // detect device type
    isTouchDevice: ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
    isWinPhoneDevice: navigator.msPointerEnabled && /MSIE 10.*Touch/.test(navigator.userAgent),
    // define base module
    setBaseModule: function(obj) {
        jcf.customControl = function(opt) {
            this.options = jcf.lib.extend({}, jcf.baseOptions, this.defaultOptions, opt);
            this.init();
        };
        for (var p in obj) {
            jcf.customControl.prototype[p] = obj[p];
        }
    },
    // add module to jcf.modules
    addModule: function(obj) {
        if (obj.name) {
            // create new module proto class
            jcf.modules[obj.name] = function() {
                jcf.modules[obj.name].superclass.constructor.apply(this, arguments);
            }
            jcf.lib.inherit(jcf.modules[obj.name], jcf.customControl);
            for (var p in obj) {
                jcf.modules[obj.name].prototype[p] = obj[p]
            }
            // on create module
            jcf.modules[obj.name].prototype.onCreateModule();
            // make callback for exciting modules
            for (var mod in jcf.modules) {
                if (jcf.modules[mod] != jcf.modules[obj.name]) {
                    jcf.modules[mod].prototype.onModuleAdded(jcf.modules[obj.name]);
                }
            }
        }
    },
    // add plugin to jcf.plugins
    addPlugin: function(obj) {
        if (obj && obj.name) {
            jcf.plugins[obj.name] = function() {
                this.init.apply(this, arguments);
            }
            for (var p in obj) {
                jcf.plugins[obj.name].prototype[p] = obj[p];
            }
        }
    },
    // miscellaneous init
    init: function() {
        if (navigator.pointerEnabled || navigator.msPointerEnabled) {
            // use pointer events instead of mouse events
            this.eventPress = navigator.pointerEnabled ? 'pointerdown' : 'MSPointerDown';
            this.eventMove = navigator.pointerEnabled ? 'pointermove' : 'MSPointerMove';
            this.eventRelease = navigator.pointerEnabled ? 'pointerup' : 'MSPointerUp';
        } else {
            // handle default desktop mouse events
            this.eventPress = 'mousedown';
            this.eventMove = 'mousemove';
            this.eventRelease = 'mouseup';
        }
        if (this.isTouchDevice) {
            // handle touch events also
            this.eventPress += ' touchstart';
            this.eventMove += ' touchmove';
            this.eventRelease += ' touchend';
        }

        setTimeout(function() {
            jcf.lib.domReady(function() {
                jcf.initStyles();
            });
        }, 1);
        return this;
    },
    initStyles: function() {
        // create <style> element and rules
        var head = document.getElementsByTagName('head')[0],
            style = document.createElement('style'),
            rules = document.createTextNode('.' + jcf.baseOptions.unselectableClass + '{' +
                '-moz-user-select:none;' +
                '-webkit-tap-highlight-color:rgba(255,255,255,0);' +
                '-webkit-user-select:none;' +
                'user-select:none;' +
                '}');

        // append style element
        style.type = 'text/css';
        if (style.styleSheet) {
            style.styleSheet.cssText = rules.nodeValue;
        } else {
            style.appendChild(rules);
        }
        head.appendChild(style);
    }
}.init();

/*
 * Custom Form Control prototype
 */
jcf.setBaseModule({
    init: function() {
        if (this.options.replaces) {
            this.realElement = this.options.replaces;
            this.realElement.jcf = this;
            this.replaceObject();
        }
    },
    defaultOptions: {
        // default module options (will be merged with base options)
    },
    checkElement: function(el) {
        return true; // additional check for correct form element
    },
    replaceObject: function() {
        this.createWrapper();
        this.attachEvents();
        this.fixStyles();
        this.setupWrapper();
    },
    createWrapper: function() {
        this.fakeElement = jcf.lib.createElement(this.options.wrapperTag);
        this.labelFor = jcf.lib.getLabelFor(this.realElement);
        jcf.lib.disableTextSelection(this.fakeElement);
        jcf.lib.addClass(this.fakeElement, jcf.lib.getAllClasses(this.realElement.className, this.options.classPrefix));
        jcf.lib.addClass(this.realElement, jcf.baseOptions.hiddenClass);
    },
    attachEvents: function() {
        jcf.lib.event.add(this.realElement, 'focus', this.onFocusHandler, this);
        jcf.lib.event.add(this.realElement, 'blur', this.onBlurHandler, this);
        jcf.lib.event.add(this.fakeElement, 'click', this.onFakeClick, this);
        jcf.lib.event.add(this.fakeElement, jcf.eventPress, this.onFakePressed, this);
        jcf.lib.event.add(this.fakeElement, jcf.eventRelease, this.onFakeReleased, this);

        if (this.labelFor) {
            this.labelFor.jcf = this;
            jcf.lib.event.add(this.labelFor, 'click', this.onFakeClick, this);
            jcf.lib.event.add(this.labelFor, jcf.eventPress, this.onFakePressed, this);
            jcf.lib.event.add(this.labelFor, jcf.eventRelease, this.onFakeReleased, this);
        }
    },
    fixStyles: function() {
        // hide mobile webkit tap effect
        if (jcf.isTouchDevice) {
            var tapStyle = 'rgba(255,255,255,0)';
            this.realElement.style.webkitTapHighlightColor = tapStyle;
            this.fakeElement.style.webkitTapHighlightColor = tapStyle;
            if (this.labelFor) {
                this.labelFor.style.webkitTapHighlightColor = tapStyle;
            }
        }
    },
    setupWrapper: function() {
        // implement in subclass
    },
    refreshState: function() {
        // implement in subclass
    },
    destroy: function() {
        if (this.fakeElement && this.fakeElement.parentNode) {
            this.fakeElement.parentNode.insertBefore(this.realElement, this.fakeElement);
            this.fakeElement.parentNode.removeChild(this.fakeElement);
        }
        jcf.lib.removeClass(this.realElement, jcf.baseOptions.hiddenClass);
        this.realElement.jcf = null;
    },
    onFocus: function() {
        // emulated focus event
        jcf.lib.addClass(this.fakeElement, this.options.focusClass);
    },
    onBlur: function(cb) {
        // emulated blur event
        jcf.lib.removeClass(this.fakeElement, this.options.focusClass);
    },
    onFocusHandler: function() {
        // handle focus loses
        if (this.focused) return;
        this.focused = true;

        // handle touch devices also
        if (jcf.isTouchDevice) {
            if (jcf.focusedInstance && jcf.focusedInstance.realElement != this.realElement) {
                jcf.focusedInstance.onBlur();
                jcf.focusedInstance.realElement.blur();
            }
            jcf.focusedInstance = this;
        }
        this.onFocus.apply(this, arguments);
    },
    onBlurHandler: function() {
        // handle focus loses
        if (!this.pressedFlag) {
            this.focused = false;
            this.onBlur.apply(this, arguments);
        }
    },
    onFakeClick: function() {
        if (jcf.isTouchDevice) {
            this.onFocus();
        } else if (!this.realElement.disabled) {
            this.realElement.focus();
        }
    },
    onFakePressed: function(e) {
        this.pressedFlag = true;
    },
    onFakeReleased: function() {
        this.pressedFlag = false;
    },
    onCreateModule: function() {
        // implement in subclass
    },
    onModuleAdded: function(module) {
        // implement in subclass
    },
    onControlReady: function() {
        // implement in subclass
    }
});

/*
 * JCF Utility Library
 */
jcf.lib = {
    bind: function(func, scope) {
        return function() {
            return func.apply(scope, arguments);
        };
    },
    browser: (function() {
        var ua = navigator.userAgent.toLowerCase(),
            res = {},
            match = /(webkit)[ \/]([\w.]+)/.exec(ua) || /(opera)(?:.*version)?[ \/]([\w.]+)/.exec(ua) ||
            /(msie) ([\w.]+)/.exec(ua) || ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+))?/.exec(ua) || [];
        res[match[1]] = true;
        res.version = match[2] || "0";
        res.safariMac = ua.indexOf('mac') != -1 && ua.indexOf('safari') != -1;
        return res;
    })(),
    getOffset: function(obj) {
        if (obj.getBoundingClientRect && !jcf.isWinPhoneDevice) {
            var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft;
            var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
            var clientLeft = document.documentElement.clientLeft || document.body.clientLeft || 0;
            var clientTop = document.documentElement.clientTop || document.body.clientTop || 0;
            return {
                top: Math.round(obj.getBoundingClientRect().top + scrollTop - clientTop),
                left: Math.round(obj.getBoundingClientRect().left + scrollLeft - clientLeft)
            };
        } else {
            var posLeft = 0,
                posTop = 0;
            while (obj.offsetParent) {
                posLeft += obj.offsetLeft;
                posTop += obj.offsetTop;
                obj = obj.offsetParent;
            }
            return {
                top: posTop,
                left: posLeft
            };
        }
    },
    getScrollTop: function() {
        return window.pageYOffset || document.documentElement.scrollTop;
    },
    getScrollLeft: function() {
        return window.pageXOffset || document.documentElement.scrollLeft;
    },
    getWindowWidth: function() {
        return document.compatMode == 'CSS1Compat' ? document.documentElement.clientWidth : document.body.clientWidth;
    },
    getWindowHeight: function() {
        return document.compatMode == 'CSS1Compat' ? document.documentElement.clientHeight : document.body.clientHeight;
    },
    getStyle: function(el, prop) {
        if (document.defaultView && document.defaultView.getComputedStyle) {
            return document.defaultView.getComputedStyle(el, null)[prop];
        } else if (el.currentStyle) {
            return el.currentStyle[prop];
        } else {
            return el.style[prop];
        }
    },
    getParent: function(obj, selector) {
        while (obj.parentNode && obj.parentNode != document.body) {
            if (obj.parentNode.tagName.toLowerCase() == selector.toLowerCase()) {
                return obj.parentNode;
            }
            obj = obj.parentNode;
        }
        return false;
    },
    isParent: function(parent, child) {
        while (child.parentNode) {
            if (child.parentNode === parent) {
                return true;
            }
            child = child.parentNode;
        }
        return false;
    },
    getLabelFor: function(object) {
        var parentLabel = jcf.lib.getParent(object, 'label');
        if (parentLabel) {
            return parentLabel;
        } else if (object.id) {
            return jcf.lib.queryBySelector('label[for="' + object.id + '"]')[0];
        }
    },
    disableTextSelection: function(el) {
        if (typeof el.onselectstart !== 'undefined') {
            el.onselectstart = function() {
                return false;
            };
        } else if (window.opera) {
            el.setAttribute('unselectable', 'on');
        } else {
            jcf.lib.addClass(el, jcf.baseOptions.unselectableClass);
        }
    },
    enableTextSelection: function(el) {
        if (typeof el.onselectstart !== 'undefined') {
            el.onselectstart = null;
        } else if (window.opera) {
            el.removeAttribute('unselectable');
        } else {
            jcf.lib.removeClass(el, jcf.baseOptions.unselectableClass);
        }
    },
    queryBySelector: function(selector, scope) {
        if (typeof scope === 'string') {
            var result = [];
            var holders = this.getElementsBySelector(scope);
            for (var i = 0, contextNodes; i < holders.length; i++) {
                contextNodes = Array.prototype.slice.call(this.getElementsBySelector(selector, holders[i]));
                result = result.concat(contextNodes);
            }
            return result;
        } else {
            return this.getElementsBySelector(selector, scope);
        }
    },
    prevSibling: function(node) {
        while (node = node.previousSibling)
            if (node.nodeType == 1) break;
        return node;
    },
    nextSibling: function(node) {
        while (node = node.nextSibling)
            if (node.nodeType == 1) break;
        return node;
    },
    fireEvent: function(element, event) {
        if (element.dispatchEvent) {
            var evt = document.createEvent('HTMLEvents');
            evt.initEvent(event, true, true);
            return !element.dispatchEvent(evt);
        } else if (document.createEventObject) {
            var evt = document.createEventObject();
            return element.fireEvent('on' + event, evt);
        }
    },
    inherit: function(Child, Parent) {
        var F = function() {}
        F.prototype = Parent.prototype
        Child.prototype = new F()
        Child.prototype.constructor = Child
        Child.superclass = Parent.prototype
    },
    extend: function(obj) {
        for (var i = 1; i < arguments.length; i++) {
            for (var p in arguments[i]) {
                if (arguments[i].hasOwnProperty(p)) {
                    obj[p] = arguments[i][p];
                }
            }
        }
        return obj;
    },
    hasClass: function(obj, cname) {
        return (obj.className ? obj.className.match(new RegExp('(\\s|^)' + cname + '(\\s|$)')) : false);
    },
    addClass: function(obj, cname) {
        if (!this.hasClass(obj, cname)) obj.className += (!obj.className.length || obj.className.charAt(obj.className.length - 1) === ' ' ? '' : ' ') + cname;
    },
    removeClass: function(obj, cname) {
        if (this.hasClass(obj, cname)) obj.className = obj.className.replace(new RegExp('(\\s|^)' + cname + '(\\s|$)'), ' ').replace(/\s+$/, '');
    },
    toggleClass: function(obj, cname, condition) {
        if (condition) this.addClass(obj, cname);
        else this.removeClass(obj, cname);
    },
    createElement: function(tagName, options) {
        var el = document.createElement(tagName);
        for (var p in options) {
            if (options.hasOwnProperty(p)) {
                switch (p) {
                    case 'class':
                        el.className = options[p];
                        break;
                    case 'html':
                        el.innerHTML = options[p];
                        break;
                    case 'style':
                        this.setStyles(el, options[p]);
                        break;
                    default:
                        el.setAttribute(p, options[p]);
                }
            }
        }
        return el;
    },
    setStyles: function(el, styles) {
        for (var p in styles) {
            if (styles.hasOwnProperty(p)) {
                switch (p) {
                    case 'float':
                        el.style.cssFloat = styles[p];
                        break;
                    case 'opacity':
                        el.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(opacity=' + styles[p] * 100 + ')';
                        el.style.opacity = styles[p];
                        break;
                    default:
                        el.style[p] = (typeof styles[p] === 'undefined' ? 0 : styles[p]) + (typeof styles[p] === 'number' ? 'px' : '');
                }
            }
        }
        return el;
    },
    getInnerWidth: function(el) {
        return el.offsetWidth - (parseInt(this.getStyle(el, 'paddingLeft')) || 0) - (parseInt(this.getStyle(el, 'paddingRight')) || 0);
    },
    getInnerHeight: function(el) {
        return el.offsetHeight - (parseInt(this.getStyle(el, 'paddingTop')) || 0) - (parseInt(this.getStyle(el, 'paddingBottom')) || 0);
    },
    getAllClasses: function(cname, prefix, skip) {
        if (!skip) skip = '';
        if (!prefix) prefix = '';
        return cname ? cname.replace(new RegExp('(\\s|^)' + skip + '(\\s|$)'), ' ').replace(/[\s]*([\S]+)+[\s]*/gi, prefix + "$1 ") : '';
    },
    getElementsBySelector: function(selector, scope) {
        if (typeof document.querySelectorAll === 'function') {
            return (scope || document).querySelectorAll(selector);
        }
        var selectors = selector.split(',');
        var resultList = [];
        for (var s = 0; s < selectors.length; s++) {
            var currentContext = [scope || document];
            var tokens = selectors[s].replace(/^\s+/, '').replace(/\s+$/, '').split(' ');
            for (var i = 0; i < tokens.length; i++) {
                token = tokens[i].replace(/^\s+/, '').replace(/\s+$/, '');
                if (token.indexOf('#') > -1) {
                    var bits = token.split('#'),
                        tagName = bits[0],
                        id = bits[1];
                    var element = document.getElementById(id);
                    if (tagName && element.nodeName.toLowerCase() != tagName) {
                        return [];
                    }
                    currentContext = [element];
                    continue;
                }
                if (token.indexOf('.') > -1) {
                    var bits = token.split('.'),
                        tagName = bits[0] || '*',
                        className = bits[1],
                        found = [],
                        foundCount = 0;
                    for (var h = 0; h < currentContext.length; h++) {
                        var elements;
                        if (tagName == '*') {
                            elements = currentContext[h].getElementsByTagName('*');
                        } else {
                            elements = currentContext[h].getElementsByTagName(tagName);
                        }
                        for (var j = 0; j < elements.length; j++) {
                            found[foundCount++] = elements[j];
                        }
                    }
                    currentContext = [];
                    var currentContextIndex = 0;
                    for (var k = 0; k < found.length; k++) {
                        if (found[k].className && found[k].className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))) {
                            currentContext[currentContextIndex++] = found[k];
                        }
                    }
                    continue;
                }
                if (token.match(/^(\w*)\[(\w+)([=~\|\^\$\*]?)=?"?([^"]*)"?\]$/)) {
                    var tagName = RegExp.$1 || '*',
                        attrName = RegExp.$2,
                        attrOperator = RegExp.$3,
                        attrValue = RegExp.$4;
                    if (attrName.toLowerCase() == 'for' && this.browser.msie && this.browser.version < 8) {
                        attrName = 'htmlFor';
                    }
                    var found = [],
                        foundCount = 0;
                    for (var h = 0; h < currentContext.length; h++) {
                        var elements;
                        if (tagName == '*') {
                            elements = currentContext[h].getElementsByTagName('*');
                        } else {
                            elements = currentContext[h].getElementsByTagName(tagName);
                        }
                        for (var j = 0; elements[j]; j++) {
                            found[foundCount++] = elements[j];
                        }
                    }
                    currentContext = [];
                    var currentContextIndex = 0,
                        checkFunction;
                    switch (attrOperator) {
                        case '=':
                            checkFunction = function(e) {
                                return (e.getAttribute(attrName) == attrValue)
                            };
                            break;
                        case '~':
                            checkFunction = function(e) {
                                return (e.getAttribute(attrName).match(new RegExp('(\\s|^)' + attrValue + '(\\s|$)')))
                            };
                            break;
                        case '|':
                            checkFunction = function(e) {
                                return (e.getAttribute(attrName).match(new RegExp('^' + attrValue + '-?')))
                            };
                            break;
                        case '^':
                            checkFunction = function(e) {
                                return (e.getAttribute(attrName).indexOf(attrValue) == 0)
                            };
                            break;
                        case '$':
                            checkFunction = function(e) {
                                return (e.getAttribute(attrName).lastIndexOf(attrValue) == e.getAttribute(attrName).length - attrValue.length)
                            };
                            break;
                        case '*':
                            checkFunction = function(e) {
                                return (e.getAttribute(attrName).indexOf(attrValue) > -1)
                            };
                            break;
                        default:
                            checkFunction = function(e) {
                                return e.getAttribute(attrName)
                            };
                    }
                    currentContext = [];
                    var currentContextIndex = 0;
                    for (var k = 0; k < found.length; k++) {
                        if (checkFunction(found[k])) {
                            currentContext[currentContextIndex++] = found[k];
                        }
                    }
                    continue;
                }
                tagName = token;
                var found = [],
                    foundCount = 0;
                for (var h = 0; h < currentContext.length; h++) {
                    var elements = currentContext[h].getElementsByTagName(tagName);
                    for (var j = 0; j < elements.length; j++) {
                        found[foundCount++] = elements[j];
                    }
                }
                currentContext = found;
            }
            resultList = [].concat(resultList, currentContext);
        }
        return resultList;
    },
    scrollSize: (function() {
        var content, hold, sizeBefore, sizeAfter;

        function buildSizer() {
            if (hold) removeSizer();
            content = document.createElement('div');
            hold = document.createElement('div');
            hold.style.cssText = 'position:absolute;overflow:hidden;width:100px;height:100px';
            hold.appendChild(content);
            document.body.appendChild(hold);
        }

        function removeSizer() {
            document.body.removeChild(hold);
            hold = null;
        }

        function calcSize(vertical) {
            buildSizer();
            content.style.cssText = 'height:' + (vertical ? '100%' : '200px');
            sizeBefore = (vertical ? content.offsetHeight : content.offsetWidth);
            hold.style.overflow = 'scroll';
            content.innerHTML = 1;
            sizeAfter = (vertical ? content.offsetHeight : content.offsetWidth);
            if (vertical && hold.clientHeight) sizeAfter = hold.clientHeight;
            removeSizer();
            return sizeBefore - sizeAfter;
        }
        return {
            getWidth: function() {
                return calcSize(false);
            },
            getHeight: function() {
                return calcSize(true)
            }
        }
    }()),
    domReady: function(handler) {
        var called = false

        function ready() {
            if (called) return;
            called = true;
            handler();
        }
        if (document.addEventListener) {
            document.addEventListener("DOMContentLoaded", ready, false);
        } else if (document.attachEvent) {
            if (document.documentElement.doScroll && window == window.top) {
                function tryScroll() {
                    if (called) return
                    if (!document.body) return
                    try {
                        document.documentElement.doScroll("left")
                        ready()
                    } catch (e) {
                        setTimeout(tryScroll, 0)
                    }
                }
                tryScroll()
            }
            document.attachEvent("onreadystatechange", function() {
                if (document.readyState === "complete") {
                    ready()
                }
            })
        }
        if (window.addEventListener) window.addEventListener('load', ready, false)
        else if (window.attachEvent) window.attachEvent('onload', ready)
    },
    event: (function() {
        var guid = 0;

        function fixEvent(e) {
            e = e || window.event;
            if (e.isFixed) {
                return e;
            }
            e.isFixed = true;
            e.preventDefault = e.preventDefault || function() {
                this.returnValue = false
            }
            e.stopPropagation = e.stopPropagation || function() {
                this.cancelBubble = true
            }
            if (!e.target) {
                e.target = e.srcElement
            }
            if (!e.relatedTarget && e.fromElement) {
                e.relatedTarget = e.fromElement == e.target ? e.toElement : e.fromElement;
            }
            if (e.pageX == null && e.clientX != null) {
                var html = document.documentElement,
                    body = document.body;
                e.pageX = e.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || 0);
                e.pageY = e.clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || 0);
            }
            if (!e.which && e.button) {
                e.which = e.button & 1 ? 1 : (e.button & 2 ? 3 : (e.button & 4 ? 2 : 0));
            }
            if (e.type === "DOMMouseScroll" || e.type === 'mousewheel') {
                e.mWheelDelta = 0;
                if (e.wheelDelta) {
                    e.mWheelDelta = e.wheelDelta / 120;
                } else if (e.detail) {
                    e.mWheelDelta = -e.detail / 3;
                }
            }
            return e;
        }

        function commonHandle(event, customScope) {
            event = fixEvent(event);
            var handlers = this.events[event.type];
            for (var g in handlers) {
                var handler = handlers[g];
                var ret = handler.call(customScope || this, event);
                if (ret === false) {
                    event.preventDefault()
                    event.stopPropagation()
                }
            }
        }
        var publicAPI = {
            add: function(elem, type, handler, forcedScope) {
                // handle multiple events
                if (type.indexOf(' ') > -1) {
                    var eventList = type.split(' ');
                    for (var i = 0; i < eventList.length; i++) {
                        publicAPI.add(elem, eventList[i], handler, forcedScope);
                    }
                    return;
                }

                if (elem.setInterval && (elem != window && !elem.frameElement)) {
                    elem = window;
                }
                if (!handler.guid) {
                    handler.guid = ++guid;
                }
                if (!elem.events) {
                    elem.events = {};
                    elem.handle = function(event) {
                        return commonHandle.call(elem, event);
                    }
                }
                if (!elem.events[type]) {
                    elem.events[type] = {};
                    if (elem.addEventListener) elem.addEventListener(type, elem.handle, false);
                    else if (elem.attachEvent) elem.attachEvent("on" + type, elem.handle);
                    if (type === 'mousewheel') {
                        publicAPI.add(elem, 'DOMMouseScroll', handler, forcedScope);
                    }
                }
                var fakeHandler = jcf.lib.bind(handler, forcedScope);
                fakeHandler.guid = handler.guid;
                elem.events[type][handler.guid] = forcedScope ? fakeHandler : handler;
            },
            remove: function(elem, type, handler) {
                // handle multiple events
                if (type.indexOf(' ') > -1) {
                    var eventList = type.split(' ');
                    for (var i = 0; i < eventList.length; i++) {
                        publicAPI.remove(elem, eventList[i], handler);
                    }
                    return;
                }

                var handlers = elem.events && elem.events[type];
                if (!handlers) return;
                delete handlers[handler.guid];
                for (var any in handlers) return;
                if (elem.removeEventListener) elem.removeEventListener(type, elem.handle, false);
                else if (elem.detachEvent) elem.detachEvent("on" + type, elem.handle);
                delete elem.events[type];
                for (var any in elem.events) return;
                try {
                    delete elem.handle;
                    delete elem.events;
                } catch (e) {
                    if (elem.removeAttribute) {
                        elem.removeAttribute("handle");
                        elem.removeAttribute("events");
                    }
                }
                if (type === 'mousewheel') {
                    publicAPI.remove(elem, 'DOMMouseScroll', handler);
                }
            }
        }
        return publicAPI;
    }())
}

// custom radio module
jcf.addModule({
    name: 'radio',
    selector: 'input[type="radio"]',
    defaultOptions: {
        wrapperClass: 'rad-area',
        focusClass: 'rad-focus',
        checkedClass: 'rad-checked',
        uncheckedClass: 'rad-unchecked',
        disabledClass: 'rad-disabled',
        radStructure: '<span></span>'
    },
    getRadioGroup: function(item) {
        var name = item.getAttribute('name');
        if (name) {
            return jcf.lib.queryBySelector('input[name="' + name + '"]', jcf.lib.getParent('form'));
        } else {
            return [item];
        }
    },
    setupWrapper: function() {
        jcf.lib.addClass(this.fakeElement, this.options.wrapperClass);
        this.fakeElement.innerHTML = this.options.radStructure;
        this.realElement.parentNode.insertBefore(this.fakeElement, this.realElement);
        this.refreshState();
        this.addEvents();
    },
    addEvents: function() {
        jcf.lib.event.add(this.fakeElement, 'click', this.toggleRadio, this);
        if (this.labelFor) {
            jcf.lib.event.add(this.labelFor, 'click', this.toggleRadio, this);
        }
    },
    onFocus: function(e) {
        jcf.modules[this.name].superclass.onFocus.apply(this, arguments);
        setTimeout(jcf.lib.bind(function() {
            this.refreshState();
        }, this), 10);
    },
    toggleRadio: function() {
        if (!this.realElement.disabled && !this.realElement.checked) {
            this.realElement.checked = true;
            jcf.lib.fireEvent(this.realElement, 'change');
        }
        this.refreshState();
    },
    refreshState: function() {
        var els = this.getRadioGroup(this.realElement);
        for (var i = 0; i < els.length; i++) {
            var curEl = els[i].jcf;
            if (curEl) {
                if (curEl.realElement.checked) {
                    jcf.lib.addClass(curEl.fakeElement, curEl.options.checkedClass);
                    jcf.lib.removeClass(curEl.fakeElement, curEl.options.uncheckedClass);
                    if (curEl.labelFor) {
                        jcf.lib.addClass(curEl.labelFor, curEl.options.labelActiveClass);
                    }
                } else {
                    jcf.lib.removeClass(curEl.fakeElement, curEl.options.checkedClass);
                    jcf.lib.addClass(curEl.fakeElement, curEl.options.uncheckedClass);
                    if (curEl.labelFor) {
                        jcf.lib.removeClass(curEl.labelFor, curEl.options.labelActiveClass);
                    }
                }
                if (curEl.realElement.disabled) {
                    jcf.lib.addClass(curEl.fakeElement, curEl.options.disabledClass);
                    if (curEl.labelFor) {
                        jcf.lib.addClass(curEl.labelFor, curEl.options.labelDisabledClass);
                    }
                } else {
                    jcf.lib.removeClass(curEl.fakeElement, curEl.options.disabledClass);
                    if (curEl.labelFor) {
                        jcf.lib.removeClass(curEl.labelFor, curEl.options.labelDisabledClass);
                    }
                }
            }
        }
    }
});


/*
 * Image Stretch module
 */
var ImageStretcher = {
    getDimensions: function(data) {
        // calculate element coords to fit in mask
        var ratio = data.imageRatio || (data.imageWidth / data.imageHeight),
            slideWidth = data.maskWidth,
            slideHeight = slideWidth / ratio;

        if (slideHeight < data.maskHeight) {
            slideHeight = data.maskHeight;
            slideWidth = slideHeight * ratio;
        }
        return {
            width: slideWidth,
            height: slideHeight,
            top: (data.maskHeight - slideHeight) / 2,
            left: (data.maskWidth - slideWidth) / 2
        };
    },
    getRatio: function(image) {
        if (image.prop('naturalWidth')) {
            return image.prop('naturalWidth') / image.prop('naturalHeight');
        } else {
            var img = new Image();
            img.src = image.prop('src');
            return img.width / img.height;
        }
    },
    imageLoaded: function(image, callback) {
        var self = this;
        var loadHandler = function() {
            callback.call(self);
        };
        if (image.prop('complete')) {
            loadHandler();
        } else {
            image.one('load', loadHandler);
        }
    },
    resizeHandler: function() {
        var self = this;
        jQuery.each(this.imgList, function(index, item) {
            if (item.image.prop('complete')) {
                self.resizeImage(item.image, item.container);
            }
        });
    },
    resizeImage: function(image, container) {
        this.imageLoaded(image, function() {
            var styles = this.getDimensions({
                imageRatio: this.getRatio(image),
                maskWidth: container.width(),
                maskHeight: container.height()
            });
            image.css({
                width: styles.width,
                height: styles.height,
                marginTop: styles.top,
                marginLeft: styles.left
            });
        });
    },
    add: function(options) {
        var container = jQuery(options.container ? options.container : window),
            image = typeof options.image === 'string' ? container.find(options.image) : jQuery(options.image);

        // resize image
        this.resizeImage(image, container);

        // add resize handler once if needed
        if (!this.win) {
            this.resizeHandler = jQuery.proxy(this.resizeHandler, this);
            this.imgList = [];
            this.win = jQuery(window);
            this.win.on('resize orientationchange', this.resizeHandler);
        }

        // store item in collection
        this.imgList.push({
            container: container,
            image: image
        });
    }
};


/*
 * jQuery Open/Close plugin
 */
;
(function($) {
    function OpenClose(options) {
        this.options = $.extend({
            addClassBeforeAnimation: true,
            hideOnClickOutside: false,
            activeClass: 'active',
            opener: '.opener',
            slider: '.slide',
            animSpeed: 400,
            effect: 'fade',
            event: 'click'
        }, options);
        this.init();
    }
    OpenClose.prototype = {
        init: function() {
            if (this.options.holder) {
                this.findElements();
                this.attachEvents();
                this.makeCallback('onInit', this);
            }
        },
        findElements: function() {
            this.holder = $(this.options.holder);
            this.opener = this.holder.find(this.options.opener);
            this.slider = this.holder.find(this.options.slider);
			this.openState = false;
        },
        attachEvents: function() {
            // add handler
            var self = this;
            this.eventHandler = function(e) {
                e.preventDefault();
                if (self.slider.hasClass(slideHiddenClass)) {
                    self.showSlide();
                } else {
                    self.hideSlide();
                }
                self.makeCallback('onChange', self);
            };
            self.opener.bind(self.options.event, this.eventHandler);

            // hover mode handler
            if (self.options.event === 'over') {
                self.opener.bind('mouseenter', function() {
                    self.showSlide();
                });
                self.holder.bind('mouseleave', function() {
                    self.hideSlide();
                });
            }

            // outside click handler
            self.outsideClickHandler = function(e) {
                if (self.options.hideOnClickOutside) {
                    var target = $(e.target);
                    if (!target.is(self.holder) && !target.closest(self.holder).length) {
                        self.hideSlide();
                    }
                }
            };

            // set initial styles
            if (this.holder.hasClass(this.options.activeClass)) {
                $(document).bind('click touchstart', self.outsideClickHandler);
            } else {
                this.slider.addClass(slideHiddenClass);
            }
        },
        showSlide: function() {
            var self = this;
			this.openState = true;
            if (self.options.addClassBeforeAnimation) {
                self.holder.addClass(self.options.activeClass);
            }
            self.slider.removeClass(slideHiddenClass);
            $(document).bind('click touchstart', self.outsideClickHandler);

            self.makeCallback('animStart', true);
            toggleEffects[self.options.effect].show({
                box: self.slider,
                speed: self.options.animSpeed,
                complete: function() {
                    if (!self.options.addClassBeforeAnimation) {
                        self.holder.addClass(self.options.activeClass);
                    }
                    self.makeCallback('animEnd', true);
                }
            });
        },
        hideSlide: function() {
            var self = this;
			this.openState = false;
            if (self.options.addClassBeforeAnimation) {
                self.holder.removeClass(self.options.activeClass);
            }
            $(document).unbind('click touchstart', self.outsideClickHandler);

            self.makeCallback('animStart', false);
            toggleEffects[self.options.effect].hide({
                box: self.slider,
                speed: self.options.animSpeed,
                complete: function() {
                    if (!self.options.addClassBeforeAnimation) {
                        self.holder.removeClass(self.options.activeClass);
                    }
                    self.slider.addClass(slideHiddenClass);
                    self.makeCallback('animEnd', false);
                }
            });
        },
        destroy: function() {
            this.slider.removeClass(slideHiddenClass).css({
                display: ''
            });
            this.opener.unbind(this.options.event, this.eventHandler);
            this.holder.removeClass(this.options.activeClass).removeData('OpenClose');
            $(document).unbind('click touchstart', this.outsideClickHandler);
        },
        makeCallback: function(name) {
            if (typeof this.options[name] === 'function') {
                var args = Array.prototype.slice.call(arguments);
                args.shift();
                this.options[name].apply(this, args);
            }
        }
    };

    // add stylesheet for slide on DOMReady
    var slideHiddenClass = 'js-slide-hidden';
    $(function() {
        var tabStyleSheet = $('<style type="text/css">')[0];
        var tabStyleRule = '.' + slideHiddenClass;
        tabStyleRule += '{position:absolute !important;left:-9999px !important;top:-9999px !important;display:block !important}';
        if (tabStyleSheet.styleSheet) {
            tabStyleSheet.styleSheet.cssText = tabStyleRule;
        } else {
            tabStyleSheet.appendChild(document.createTextNode(tabStyleRule));
        }
        $('head').append(tabStyleSheet);
    });

    // animation effects
    var toggleEffects = {
        slide: {
            show: function(o) {
                o.box.stop(true).hide().slideDown(o.speed, o.complete);
            },
            hide: function(o) {
                o.box.stop(true).slideUp(o.speed, o.complete);
            }
        },
        fade: {
            show: function(o) {
                o.box.stop(true).hide().fadeIn(o.speed, o.complete);
            },
            hide: function(o) {
                o.box.stop(true).fadeOut(o.speed, o.complete);
            }
        },
        none: {
            show: function(o) {
                o.box.hide().show(0, o.complete);
            },
            hide: function(o) {
                o.box.hide(0, o.complete);
            }
        }
    };

    // jQuery plugin interface
    $.fn.openClose = function(opt) {
        return this.each(function() {
            jQuery(this).data('OpenClose', new OpenClose($.extend(opt, {
                holder: this
            })));
        });
    };
}(jQuery));