"use strict";

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

(function (window) {

  var microAnimate = function microAnimate(element) {
    var animation = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var options = arguments.length <= 2 || arguments[2] === undefined ? {
      duration: 2000,
      ticklength: 50,
      smoothing: true,
      ease: false,
      retainEndState: true
    } : arguments[2];

    //Process the Animation/Options and store them in "this"
    this.element = element;
    this.options = options;
    this.options.totalTicks = options.duration / options.ticklength;
    this.animation = processAnimation(prepareObject(animation), this.options);
    this.interval = null;

    //Chache "this"
    self = this;

    //Waring when the user gives strange options
    if (this.options.totalTicks % 10 !== 0) {
      console.info("The ticklength you provided(" + options.ticklength + ") doesn't fit into the duration " + options.duration);
      console.info("This might cause issues, but you should be fine");
      console.info("To avoid this make sure the duration is a multiple of the ticklength");
    }

    //The Animation get calculated before it gets executed for better performance
    //Generate Style, Transition and Callbacks from the animation property
    function processAnimation(animation, options) {
      var result = {},
          animKeys = Object.keys(animation);

      //Go over each percentage given
      animKeys.forEach(function (key, index) {
        //Generates a new key to fit certain intervals
        var newKey = dynamicKey(key, options);
        result[newKey] = {};

        result[newKey].styles = mapAnimation(animation[key]);
        result[newKey].callback = mapCallback(animation[key]);

        if (options.smoothing) {
          result[newKey].transition = mapTransition(animation, index, animKeys, options);
        }
      });

      return result;

      /*
       * Mapping Sub-functions
       */

      //Maps Animation
      function mapAnimation(animation) {
        var result = [];
        animation.forEach(function (style) {
          if ((typeof style === "undefined" ? "undefined" : _typeof(style)) === "object") {
            result.push(style);
          }
        });
        return result;
      }

      //Maps Callbacks
      function mapCallback(animation) {
        var result;
        animation.forEach(function (fn) {
          if (typeof fn === "function") {
            result = fn;
          }
        });
        return result;
      }

      //Maps Transitions
      function mapTransition(animation, index, allKeys, options) {
        //Only try to create a transition if the Animation isnt finished yet
        if (allKeys[index] !== "100") {

          var result = [],

          //The next key of the Animation
          nextAnim = animation[allKeys[index + 1]],

          //Time between the current and the next key
          timeDifference = options.duration / 100 / (allKeys[index + 1] - allKeys[index]) + "s",

          //Additional transition values, "ease" for example
          add = "";

          //Ease if easing is enabled (either default or given easing)
          if (options.ease === true || typeof options.ease === "string") {
            if (typeof options.ease === "string") {
              add = " " + options.ease;
            } else {
              add = " ease";
            }
          }

          animation[allKeys[index]].forEach(function (style, i) {
            if ((typeof style === "undefined" ? "undefined" : _typeof(style)) === "object") {
              var trans;

              if (typeof nextAnim !== "undefined") {
                //Transition String
                trans = nextAnim[i][0] + " " + timeDifference + add;
              } else {
                trans = "";
              }

              result.push(trans);
            }
          });

          return result;
        }
      }

      //Change keys to fit strange intervals
      function dynamicKey(key, options) {
        var result;
        //if Key is Zero, dont change!
        if (key !== 0) {
          //Smooth key to fit current interval
          result = Math.round(Math.round(key / 100 * options.totalTicks) * (100 / options.totalTicks));
          if (result > 100) {
            result = 100;
          }
        }
        return result;
      }
    }

    /*Sort and format Animation object
     *
     * + Converts "from" to "0" and "to" to "100"
     * + converts "100" to 100
     * + fixes unreachable percentages
     *
     */

    function prepareObject(object) {
      var keys = Object.keys(object),
          optimizedKeys = [],
          result = {};

      //Go over keys and replace "from" and "to"
      keys.forEach(function (keyName) {
        if (keyName === "from") {
          object["0%"] = object[keyName];
          delete object[keyName];
        } else if (keyName === "to") {
          object["100%"] = object[keyName];
          delete object[keyName];
        }
      });

      //Sort Keys in a new Array (we need to ".keys() " again because we modiefied the keys before)
      optimizedKeys = Object.keys(object);
      optimizedKeys.forEach(function (keyName, index) {
        optimizedKeys[index] = parseInt(keyName.replace("%", ""));
      });
      optimizedKeys.sort();

      //Sort Object
      optimizedKeys.forEach(function (keyName) {
        result[keyName] = object[keyName + "%"];
      });

      return result;
    }
  };

  /*
   * Animation methods
   */

  //Main Animation play-method
  microAnimate.prototype.start = function () {
    var ticker = 0,
        relativePercentage = 0,

    //All executed callbacks are index to make sure callbacks dont execute twice
    finishedCallbacks = [];

    //Set to first frame before starting to avoid glitching
    resetAnimation(self.element);

    //Main Animation Loop
    this.interval = window.setInterval(function () {
      //Remove the interval if over 100% else Animate
      if (ticker > self.options.totalTicks) {
        killAnim();
      }

      relativePercentage = Math.round(100 / self.options.totalTicks * ticker);
      //Roof at 100
      if (relativePercentage > 100) {
        relativePercentage = 100;
      }
      console.log("Animation Progress: " + relativePercentage + "%");

      //Animate if there is data for the current percentage
      if (typeof self.animation[relativePercentage] !== "undefined") {
        animate(self.element, self.animation[relativePercentage].styles);
        transition(self.element, self.animation[relativePercentage].transition);
        callback(self.animation[relativePercentage].callback, self);
      }

      ticker++;
    }, self.options.ticklength);

    /*
     * Sub-functions used in the active Animation
     */

    //Apply all styles for the current Frame
    function animate(element, styles) {
      //forEach has sucky performance, we shouldnt use it in the loop
      /*styles.forEach(function(val, index) {
        element.style[val[0]] = val[1];
      });*/
      for (var i = 0; i < styles.length; i++) {
        element.style[styles[i][0]] = styles[i][1];
      }
    }

    //Run Transitions if needed
    function transition(element, transitions) {
      if (self.options.smoothing && typeof transitions !== "undefined") {
        element.style.transition = transitions.join(", ");
      }
    }

    //Check if any callbacks need to be run
    function callback(callbacks, target) {
      if (typeof callbacks === "function" && finishedCallbacks.indexOf(callbacks) === -1) {
        callbacks(target);
        finishedCallbacks.push(callbacks);
      }
    }

    //Resets the element to its default style
    function resetAnimation(element) {
      element.style.transition = "none";
      //Reset EVERY Inline CSS before starting!
      /*Object.keys(element.style).forEach(function(key) {
        element.style[key] = "";
      });*/
    }

    //Clear Animation
    function killAnim() {
      window.clearInterval(self.interval);
    }
  };

  //Pause Animation
  microAnimate.prototype.pause = function () {
    window.clearInterval(self.interval);
  };
  //Resume paused Animation
  microAnimate.prototype.unpause = function () {
    window.clearInterval(self.interval);
  };

  //Stop & Reset Animation
  microAnimate.prototype.stop = function () {
    window.clearInterval(self.interval);
  };

  //Export microAnimate to global scope
  window.microAnimate = microAnimate;
  //Exports shorter
  window.Anim = microAnimate;
})(window);
//# sourceMappingURL=microAnimate.js.map
