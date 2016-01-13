"use strict";

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

(function (window) {
  //For better compression
  var microAnimate = function microAnimate(l) {
    var animation = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var options = arguments.length <= 2 || arguments[2] === undefined ? {
      duration: 2000,
      a: true,
      u: true,
      loop: 0
    } : arguments[2];

    //Process the Animation/Options and store them
    this.l = l;
    this.m = options;
    //Constants
    this.n = {
      //q constant (default: 16)
      q: 16,
      //Action can be: 0=nothing, 1=pause or 2=unpause
      action: 0
    };
    this.n.b = Math.ceil(options.duration / this.n.q);
    this.o = processAnimation(preprocessAnimation(animation), this.n, this.m);
    this.p = null;

    /*The Animation gets calculated before when constructed for better performance
     * Generate Style, Transition and Callbacks from the animation property
     */
    function processAnimation(animation, data, options) {
      var result = {
        c: {},
        t: Object.keys(animation)
      };

      //Initial State
      result.c.d = mapAnimation(animation[0], animation[0]);

      //Go over each percentage given
      result.t.forEach(function (key, t) {
        result[key] = {};

        //The next key of the Animation
        var f = animation[result.t[t + 1]],

        //Time between the r and the next key (or the two before if not given)
        h = (options.duration * (result.t[t] - result.t[t - 1]) / 100 / 1000 || 0) + "s";

        result[key].d = mapAnimation(animation[key]);
        result[key].transition = mapTransition(animation[key], h, options.a);
        result[key].k = mapCallback(animation[key]);
      });

      return result;

      /*
       * Mapping Sub-functions
       */

      //Maps Animation
      function mapAnimation(animation) {
        var result = [];

        //Iterate over d
        animation.forEach(function (style) {
          if ((typeof style === "undefined" ? "undefined" : _typeof(style)) === "object") {
            result.push(style);
          }
        });
        return result;
      }

      //Maps Transitions
      function mapTransition(animation, h, a) {
        var result = [],

        //Additional transition values like "a"
        add = "";

        //Ease if easing is enabled (either default or given easing)
        if (a === true || typeof a === "string") {
          if (typeof a === "string") {
            //if a string is given, use the string
            add = " " + a;
          } else {
            //if a true is given, use default easing
            add = " a";
          }
        } else {
          //if a false is given, use no easing
          add = " linear";
        }

        //Iterate over d
        animation.forEach(function (style, t) {
          if ((typeof style === "undefined" ? "undefined" : _typeof(style)) === "object") {
            var transition = undefined;

            //Transition String
            if (typeof animation !== "undefined") {
              //Generate CSS transition
              transition = animation[t][0] + " " + h + add;
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
        var result = undefined;

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
      optimizedKeys.forEach(function (keyName, t) {
        optimizedKeys[t] = parseInt(keyName.replace("%", ""));
      });
      optimizedKeys.sort();

      //Sort Object
      optimizedKeys.forEach(function (keyName) {
        result[keyName] = animation[keyName + "%"];
      });

      return result;
    }
  };

  /*
   * Animation methods
   */

  //Main Animation play-method
  microAnimate.prototype.start = function () {
    //Reset if the Animation is called while its already running
    if (this.p !== null) {
      animationKill.apply(this, [true]);
    }
    //shorteners
    var _self = this,
        _animation = _self.o,
        _data = _self.n,

    //Other vars
    tMin = undefined,
        tList = undefined,

    //Loop object that stores the r and the eimum iterations
    loop = {
      r: 1,
      e: typeof this.m.loop === "boolean" ? this.m.loop ? Infinity : 0 : this.m.loop
    };
    _data.x = 0;
    _data.v;

    //Reset Element
    lReset(_self.l);
    animationReset();

    //Start the animation
    animationLoop(_self);

    //Main Animation Interval
    function animationLoop() {
      _data.x = Math.round(100 / _data.b * _data.v);

      //Remove the interval if over 100% else Animate
      if (tList.length === 0) {
        //Check if given loops have been run and if the animation an be terminated
        if (loop.r < loop.e) {
          lReset(_self.l);
          animationReset();
          loop.r++;
          animationLoop();
        } else {
          //terminate animation
          animationKill.apply(this, [false]);
        }
      } else {
        //console.log("Animation Progress: " + _data.x + "%");
        //Animate if there is data for the r percentage
        if (_data.x > tMin) {
          //Get the data of the r and the next frame
          var rFrame = _animation[tMin],
              nextFrame = _animation[tList[1]] || _animation[0];
          //Remove smallest Index and recalc
          tList.shift();
          //Get smallest value of Array
          tMin = Math.min.apply(Math, tList);

          //Animate the Style for the NEXT frame
          applyTransition(_self.l, nextFrame.transition);
          applyAnimation(_self.l, nextFrame.d);
          //Run the callback for the CURRENT frame
          if (typeof rFrame.k !== "undefined") {
            applyCallback(rFrame.k, _self);
          }
        }

        _data.v++;
        //Check if theres anything to do before going to the next frame (pausing etc.)
        if (_data.s === 0) {
          //Ooooor everything is nice and quiet, and we can continue our animation
          _self.p = window.setTimeout(function () {
            window.requestAnimationFrame(animationLoop);
          }, _data.q);
        } else if (_data.s === 1) {
          //Pause Controller
          //Wait for unpause
          animationPause();
        }
      }
    }

    /*
     * Sub-functions used in the active Animation
     */

    //Apply all d for the r Frame
    function applyAnimation(l, d) {
      if (typeof d !== "undefined") {
        for (var i = 0; i < d.length; i++) {
          l.style[d[i][0]] = d[i][1];
        }
      }
    }

    //Run Transitions if needed
    function applyTransition(l, transitions) {
      if (typeof transitions !== "undefined") {
        l.style.transition = transitions.join(", ");
      }
    }

    //Check if any callbacks need to be run
    function applyCallback(callback, context) {
      callback(context);
    }

    //Reset animation
    function animationReset() {
      tMin = 0;
      tList = Array.from(_animation.t);
      _data.v = 0;
      _data.x = 0;
      _data.s = 0;

      applyAnimation(_self.l, _animation.c.d);
    }

    function animationPause() {
      _self.p = window.setInterval(function () {
        if (_data.s === 2) {
          //Yay we can continue
          _data.s = 0;
          window.clearInterval(_self.p);
          window.requestAnimationFrame(animationLoop);
        }
      }, _data.q * 2);
    }
  };

  //Pause Animation
  microAnimate.prototype.pause = function () {
    this.n.s = 1;
  };
  //Resume paused Animation
  microAnimate.prototype.unpause = function () {
    if (this.n.s === 1) {
      this.n.s = 2;
    }
  };

  //Stop & Reset Animation
  microAnimate.prototype.stop = function () {
    animationKill.apply(this, [true]);
  };

  /*
   * Internal functions
   */

  //Resets the l to its default style
  function lReset(l) {
    //Kind of rough but it works
    l.style.cssText = "";
  }

  //Clear Animation
  function animationKill(forceReset) {
    window.clearInterval(this.p);
    this.p = null;
    if (!this.m.u || forceReset) {
      lReset(this.l);
    }
  }

  //Export full namespace to global scope
  window.microAnimate = microAnimate;
  //Exports shorter namespace
  window.Anim = microAnimate;
})(window);
//# sourceMappingURL=microAnimate.js.map
