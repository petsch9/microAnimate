(function(window) {

  var microAnimate = function(
    element,
    animation = {},
    options = {
      duration: 2000,
      ease: true,
      retainEndState: true,
      loop: 0
    }
  ) {
    //Process the Animation/Options and store them in "this"
    this.element = element;
    this.options = options;
    //Constants
    this.data = {
      ticklength: 30,
      nextFrameAction:"nothing"
    };
    this.data.totalTicks= Math.ceil(options.duration / this.data.ticklength);
    this.animation = processAnimation(prepareObject(animation), this.data, this.options);
    this.interval = null;



    //The Animation get calculated before it gets executed for better performance
    //Generate Style, Transition and Callbacks from the animation property
    function processAnimation(animation, data, options) {
      var result = {
          initial: {}
        },
        animKeys = Object.keys(animation);


      //Initial State
      result.initial.styles = mapAnimation(animation[0], animation[0]);

      //Go over each percentage given
      animKeys.forEach((key, index) => {
        //Generates a new key to fit certain intervals
        var newKey = dynamicKey(key, data);
        result[newKey] = {};

        //Only try to create a transition if the Animation isnt finished yet
        if (animKeys[index] !== "100") {
          //The next key of the Animation
          nextAnim = animation[animKeys[index + 1]];
          //Time between the current and the next key
          timeDifference = (
            (options.duration * (animKeys[index + 1] - animKeys[index]) / 100) / 1000
          ) + "s";


          result[newKey].styles = mapAnimation(animation[key], nextAnim);
          result[newKey].transition = mapTransition(animation[key], nextAnim, timeDifference, options);
        }
        result[newKey].callback = mapCallback(animation[key]);
      });


      return result;


      /*
       * Mapping Sub-functions
       */

      //Maps Animation
      function mapAnimation(animation, nextAnim) {
        var result = [];
        nextAnim.forEach((style) => {
          if (typeof style === "object") {
            result.push(style);
          }
        });
        return result;
      }

      //Maps Callbacks
      function mapCallback(animation) {
        var result;
        animation.forEach((fn) => {
          if (typeof fn === "function") {
            result = fn;
          }
        });
        return result;
      }


      //Maps Transitions
      function mapTransition(animation, nextAnim, timeDifference, options) {
        var result = [],
          //Additional transition values like "ease"
          add = "";

        //Ease if easing is enabled (either default or given easing)
        if (options.ease === true || typeof options.ease === "string") {
          if (typeof options.ease === "string") {
            add = " " + options.ease;
          } else {
            add = " ease";
          }
        }


        animation.forEach((style, i) => {
          if (typeof style === "object") {
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

      //Change keys to fit strange intervals
      function dynamicKey(key, data) {
        var result;
        //if Key is Zero, dont change!
        if (key !== 0) {
          //Smooth key to fit current interval
          result = Math.round(
            Math.round((key / 100) * data.totalTicks) *
            (100 / data.totalTicks)
          );
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
      keys.forEach((keyName) => {
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
      optimizedKeys.forEach((keyName, index) => {
        optimizedKeys[index] = parseInt(keyName.replace("%", ""));
      });
      optimizedKeys.sort();

      //Sort Object
      optimizedKeys.forEach((keyName) => {
        result[keyName] = object[keyName + "%"];
      });

      return result;
    }

  };


  /*
   * Animation methods
   */

  //Main Animation play-method
  microAnimate.prototype.start = function() {
    console.log(this);
    var _self = this,
      ticker = 0,
      relativePercentage = 0,
      //All executed callbacks are index to make sure callbacks dont execute twice
      finishedCallbacks = [],
      loop = {
        current: 1,
        max: (typeof this.options.loop === "boolean" ? (this.options.loop ? Infinity : 0) : this.options.loop)
      };

    //Reset Element
    resetElement(_self.element);
    animate(
      _self.element,
      _self.animation.initial.styles
    );


    //  ;
    //Start the animLoop
    animLoop(_self);



    //Main Animation Interval
    function animLoop() {
      //_self.interval = window.setInterval(() => {
      relativePercentage = Math.round((100 / _self.data.totalTicks) * ticker);


      //Remove the interval if over 100% else Animate
      if (relativePercentage > 100) {
        //Check if given loops have been run and if the animation an be terminated
        if (loop.current < loop.max) {
          //Reset animation
          animate(
            _self.element,
            _self.animation.initial.styles
          );
          ticker = 0;
          finishedCallbacks = [];
          loop.current++;
          animLoop();
        } else {
          //terminate animation
          killAnim();
        }
      } else {

        console.log("Animation Progress: " + relativePercentage + "%");

        //Animate if there is data for the current percentage
        if (typeof _self.animation[relativePercentage] !== "undefined") {
          transition(
            _self.element,
            _self.animation[relativePercentage].transition
          );
          animate(
            _self.element,
            _self.animation[relativePercentage].styles
          );
          callback(
            _self.animation[relativePercentage].callback,
            _self
          );
        }


        ticker++;
        _self.interval=window.setTimeout(
          if()
          window.requestAnimationFrame(animLoop),
          _self.data.ticklength
        );
      }
    }


    /*
     * Sub-functions used in the active Animation
     */

    //Apply all styles for the current Frame
    function animate(element, styles) {
      if (typeof styles !== "undefined") {
        //forEach has sucky performance, we shouldnt use it in the loop
        /*styles.forEach(function(val, index) {
          element.style[val[0]] = val[1];
        });*/
        for (var i = 0; i < styles.length; i++) {
          element.style[styles[i][0]] = styles[i][1];
        }
      }
    }

    //Run Transitions if needed
    function transition(element, transitions) {
      if (typeof transitions !== "undefined") {
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
    function resetElement(element) {
      //Kind of rough but it works
      element.style = "";
    }

    //Clear Animation
    function killAnim() {
      //window.clearInterval(_self.interval);
      if (!_self.options.retainEndState) {
        resetElement(_self.element);
      }
    }
  };

  //Pause Animation
  microAnimate.prototype.pause = function() {

  };
  //Resume paused Animation
  microAnimate.prototype.unpause = function() {

  };

  //Stop & Reset Animation
  microAnimate.prototype.stop = function() {
    //window.clearInterval(this.interval);
    this.element.style = "";
  };



  /*
   * Internal Polyfills
   */


  //rAF is supported in pretty much every current browser, but for older ones there is this polyfill:

  // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
  // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
  // requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
  // MIT license

  //Edited to ES6
  /*(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||
        window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
      window.requestAnimationFrame = function(callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(() => {
            callback(currTime + timeToCall);
          },
          timeToCall);
        lastTime = currTime + timeToCall;
        return id;
      };

    if (!window.cancelAnimationFrame)
      window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
      };
  }());*/


  //Export microAnimate to global scope
  window.microAnimate = microAnimate;
  //Exports shorter
  window.Anim = microAnimate;

})(window);
