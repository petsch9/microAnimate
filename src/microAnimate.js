(function(window) {
  //For better compression
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
      //Ticklength constant (default: 30)
      ticklength: 30,
      //Action, can be: 0=nothing, 1=pause or 2=unpause
      action: 0
    };
    this.data.ticks = Math.ceil(options.duration / this.data.ticklength);
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
            Math.round((key / 100) * data.ticks) *
            (100 / data.ticks)
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
    var _self = this,
      tick = 0,
      relativePercentage = 0,
      //All executed callbacks are index to make sure callbacks dont execute twice
      finishedCallbacks = [],
      //Loop object that stores the current an the maximum iterations
      loop = {
        current: 1,
        max: (typeof this.options.loop === "boolean" ? (this.options.loop ? Infinity : 0) : this.options.loop)
      };


    //Reset Element
    elementReset(_self.element);
    animationReset();

    //Start the animation
    animationLoop(_self);



    //Main Animation Interval
    function animationLoop() {
      relativePercentage = Math.round((100 / _self.data.ticks) * tick);


      //Remove the interval if over 100% else Animate
      if (relativePercentage > 100) {
        //Check if given loops have been run and if the animation an be terminated
        if (loop.current < loop.max) {
          animationReset();
          loop.current++;
          animationLoop();
        } else {
          //terminate animation
          animationKill();
        }
      } else {

        //console.log("Animation Progress: " + relativePercentage + "%");

        //Animate if there is data for the current percentage
        if (typeof _self.animation[relativePercentage] !== "undefined") {
          applyTransition(
            _self.element,
            _self.animation[relativePercentage].transition
          );
          applyAnimation(
            _self.element,
            _self.animation[relativePercentage].styles
          );
          applyCallback(
            _self.animation[relativePercentage].callback,
            _self
          );
        }


        tick++;
        //Check if theres anything to do before going to the next frame (pausing etc.)

        if (_self.data.action !== 0) {
          //Pause Controller
          if (_self.data.action === 1) {
            //Wait for unpause
            _self.interval = window.setInterval(() => {
              if (_self.data.action === 2) {
                //Yay we can continue
                _self.data.action = 0;
                window.clearInterval(_self.interval);
                window.requestAnimationFrame(animationLoop);
              }
            }, _self.data.ticklength * 2);
          }
        } else {
          //Ooooor everything is nice and quiet, and we can continue our animation
          _self.interval = window.setTimeout(() => {
            window.requestAnimationFrame(animationLoop);
          }, _self.data.ticklength);
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
    function applyCallback(callbacks, target) {
      if (typeof callbacks === "function" && finishedCallbacks.indexOf(callbacks) === -1) {
        callbacks(target);
        finishedCallbacks.push(callbacks);
      }
    }


    //Reset animation
    function animationReset() {
      applyAnimation(
        _self.element,
        _self.animation.initial.styles
      );
      tick = 0;
      finishedCallbacks = [];
      _self.data.action = 0;
    }

    //Clear Animation
    function animationKill() {
      if (!_self.options.retainEndState) {
        resetElement(_self.element);
      }
    }

  };

  //Pause Animation
  microAnimate.prototype.pause = function() {
    this.data.action = 1;
  };
  //Resume paused Animation
  microAnimate.prototype.unpause = function() {
    this.data.action = 2;
  };

  //Stop & Reset Animation
  microAnimate.prototype.stop = function() {
    this.data.action = "stop";
    window.clearInterval(this.interval);
    elementReset(this.element);
  };



  //Resets the element to its default style
  function elementReset(element) {
    //Kind of rough but it works
    element.style = "";
  }


  //Export microAnimate to global scope
  window.microAnimate = microAnimate;
  //Exports shorter
  window.Anim = microAnimate;

})(window);
