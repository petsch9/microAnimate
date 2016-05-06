"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (window) {

    var microAnimate = function () {
        function microAnimate(element) {
            var animation = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
            var options = arguments.length <= 2 || arguments[2] === undefined ? {
                duration: 2000,
                ease: true,
                retainEndState: true,
                loop: 0
            } : arguments[2];

            _classCallCheck(this, microAnimate);

            //Process the Animation/Options and store them
            this.element = element;
            this.options = options;
            //Constants
            this.data = {
                //tickLength constant (default: 16)
                tickLength: 16,
                //Action can be: 0=nothing, 1=pause or 2=unpause
                action: 0
            };
            this.data.tickTotal = Math.ceil(options.duration / this.data.tickLength);
            this.animation = processAnimation(preprocessAnimation(animation), this.data, this.options);
            this.interval = null;

            /*The Animation gets calculated before when constructed for better performance
             * Generate Style, Transition and Callbacks from the animation property
             */
            function processAnimation(animation, data, options) {
                var result = {
                    initial: {},
                    index: Object.keys(animation)
                };

                //Initial State
                result.initial.styles = mapAnimation(animation[0], animation[0]);

                //Go over each percentage given
                result.index.forEach(function (key, index) {
                    result[key] = {};

                    //The next key of the Animation
                    var animationNext = animation[result.index[index + 1]],

                    //Time between the current and the next key (or the two before if not given)
                    timeDifference = (options.duration * (result.index[index] - result.index[index - 1]) / 100 / 1000 || 0) + "s";

                    result[key].styles = mapAnimation(animation[key]);
                    result[key].transition = mapTransition(animation[key], timeDifference, options.ease);
                    result[key].callback = mapCallback(animation[key]);
                });

                return result;

                /*
                 * Mapping Sub-functions
                 */

                //Maps Animation
                function mapAnimation(animation) {
                    var result = [];

                    //Iterate over styles
                    animation.forEach(function (style) {
                        if ((typeof style === "undefined" ? "undefined" : _typeof(style)) === "object") {
                            result.push(style);
                        }
                    });
                    return result;
                }

                //Maps Transitions
                function mapTransition(animation, timeDifference, ease) {
                    var result = [],

                    //Additional transition values like "ease"
                    add = "";

                    //Ease if easing is enabled (either default or given easing)
                    if (ease === true || typeof ease === "string") {
                        if (typeof ease === "string") {
                            //if a string is given, use the string
                            add = " " + ease;
                        } else {
                            //if a true is given, use default easing
                            add = " ease";
                        }
                    } else {
                        //if a false is given, use no easing
                        add = " linear";
                    }

                    //Iterate over styles
                    animation.forEach(function (style, index) {
                        if ((typeof style === "undefined" ? "undefined" : _typeof(style)) === "object") {
                            var transition = void 0;

                            //Transition String
                            if (typeof animation !== "undefined") {
                                //Generate CSS transition
                                transition = animation[index][0] + " " + timeDifference + add;
                            } else {
                                transition = "";
                            }
                            result.push(transition);
                        }
                    });

                    return result;
                }

                //Maps Callbacks
                function mapCallback(animation) {
                    var result = void 0;

                    //Iterate over callbacks
                    animation.forEach(function (fn) {
                        if (typeof fn === "function") {
                            result = fn;
                        }
                    });
                    return result;
                }
            }

            /* Sort and format Animation object
             *
             * + Converts "from" to "0" and "to" to "100"
             * + converts "100" to 100 etc.
             *
             */
            function preprocessAnimation(animation) {
                var optimizedKeys = [],
                    result = {};

                //Go over keys and replace "from" and "to"
                Object.keys(animation).forEach(function (keyName) {
                    if (keyName === "from") {
                        animation["0%"] = animation[keyName];
                        delete animation[keyName];
                    } else if (keyName === "to") {
                        animation["100%"] = animation[keyName];
                        delete animation[keyName];
                    }
                });

                //Sort Keys in a new Array (we need to ".keys() " again because we modified the keys before)
                optimizedKeys = Object.keys(animation);
                optimizedKeys.forEach(function (keyName, index) {
                    optimizedKeys[index] = parseInt(keyName.replace("%", ""));
                });
                optimizedKeys.sort();

                //Sort Object
                optimizedKeys.forEach(function (keyName) {
                    result[keyName] = animation[keyName + "%"];
                });

                return result;
            }
        }

        /*
         * Internal functions
         */

        //Resets the element to its default style


        _createClass(microAnimate, [{
            key: "reset",
            value: function reset(element) {
                //Kind of rough but it works
                element.style.cssText = "";
            }

            //Clear Animation

        }, {
            key: "kill",
            value: function kill(forceReset) {
                window.clearInterval(this.interval);
                this.interval = null;
                if (!this.options.retainEndState || forceReset) {
                    this.reset(this.element);
                }
            }

            /*
             * Animation methods
             */

            //Main Animation play-method

        }, {
            key: "start",
            value: function start() {
                //Reset if the Animation is called while its already running
                if (this.interval !== null) {
                    this.kill.apply(this, [true]);
                }
                //shorteners
                var _self = this,
                    _animation = _self.animation,
                    _data = _self.data,

                //Other vars
                indexMin = void 0,
                    indexList = void 0,

                //Loop object that stores the current and the maximum iterations
                loop = {
                    current: 1,
                    max: typeof this.options.loop === "boolean" ? this.options.loop ? Infinity : 0 : this.options.loop
                };
                _data.relativePercentage = 0;
                _data.tickCurrent = 0;

                //Reset Element
                this.reset(_self.element);
                animationReset();

                //Start the animation
                animationLoop(_self);

                //Main Animation Interval
                function animationLoop() {
                    _data.relativePercentage = Math.round(100 / _data.tickTotal * _data.tickCurrent);

                    //Remove the interval if over 100% else Animate
                    if (indexList.length === 0) {
                        //Check if given loops have been run and if the animation an be terminated
                        if (loop.current < loop.max) {

                            _self.reset(_self.element);
                            animationReset();
                            loop.current++;
                            animationLoop();
                        } else {
                            //terminate animation
                            this.kill.apply(this, [false]);
                        }
                    } else {
                        //console.log("Animation Progress: " + _data.relativePercentage + "%");
                        //Animate if there is data for the current percentage
                        if (_data.relativePercentage > indexMin) {
                            //Get the data of the current and the next frame
                            var currentFrame = _animation[indexMin],
                                nextFrame = _animation[indexList[1]] || _animation[0];
                            //Remove smallest Index and recalc
                            indexList.shift();
                            //Get smallest value of Array
                            indexMin = Math.min.apply(Math, indexList);

                            //Animate the Style for the NEXT frame
                            applyTransition(_self.element, nextFrame.transition);
                            applyAnimation(_self.element, nextFrame.styles);
                            //Run the callback for the CURRENT frame
                            if (typeof currentFrame.callback !== "undefined") {
                                applyCallback(currentFrame.callback, _self);
                            }
                        }

                        _data.tickCurrent++;
                        //Check if theres anything to do before going to the next frame (pausing etc.)
                        if (_data.action === 0) {
                            //Ooooor everything is nice and quiet, and we can continue our animation
                            _self.interval = window.setTimeout(function () {
                                window.requestAnimationFrame(animationLoop);
                            }, _data.tickLength);
                        } else if (_data.action === 1) {
                            //Pause Controller
                            //Wait for unpause
                            animationPause();
                        }
                    }
                }

                /*
                 * Sub-functions used in the active Animation
                 */

                //Apply all styles for the current Frame
                function applyAnimation(element, styles) {
                    if (typeof styles !== "undefined") {
                        for (var i = 0; i < styles.length; i++) {
                            element.style[styles[i][0]] = styles[i][1];
                        }
                    }
                }

                //Run Transitions if needed
                function applyTransition(element, transitions) {
                    if (typeof transitions !== "undefined") {
                        element.style.transition = transitions.join(", ");
                    }
                }

                //Check if any callbacks need to be run
                function applyCallback(callback, context) {
                    callback(context);
                }

                //Reset animation
                function animationReset() {
                    indexMin = 0;
                    indexList = Array.from(_animation.index);
                    _data.tickCurrent = 0;
                    _data.relativePercentage = 0;
                    _data.action = 0;

                    applyAnimation(_self.element, _animation.initial.styles);
                }

                function animationPause() {
                    _self.interval = window.setInterval(function () {
                        if (_data.action === 2) {
                            //Yay we can continue
                            _data.action = 0;
                            window.clearInterval(_self.interval);
                            window.requestAnimationFrame(animationLoop);
                        }
                    }, _data.tickLength * 2);
                }
            }

            //Pause Animation

        }, {
            key: "pause",
            value: function pause() {
                this.data.action = 1;
            }

            //Resume paused Animation

        }, {
            key: "unpause",
            value: function unpause() {
                if (this.data.action === 1) {
                    this.data.action = 2;
                }
            }

            //Stop & Reset Animation

        }, {
            key: "stop",
            value: function stop() {
                this.kill.apply(this, [true]);
            }
        }]);

        return microAnimate;
    }();

    //Export full namespace to global scope
    window.microAnimate = microAnimate;
    //Exports shorter namespace
    window.Anim = microAnimate;
})(window);
//# sourceMappingURL=esAnimate-es5.js.map
