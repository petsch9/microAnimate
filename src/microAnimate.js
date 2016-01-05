(function(window) {
  //For better compression
  let microAnimate = function(
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
      ticklength: 16,
      //Action, can be: 0=nothing, 1=pause or 2=unpause
      action: 0
    };
    this.data.ticks = Math.ceil(options.duration / this.data.ticklength);
    this.animation = processAnimation(
      preprocessAnimation(animation),
      this.data,
      this.options
    );
    this.interval = null;



    /*The Animation get calculated before it gets executed for better performance
     * Generate Style, Transition and Callbacks from the animation property
     */
    function processAnimation(animation, data, options) {
      let result = {
          initial: {},
          index: Object.keys(animation)
        };


      //Initial State
      result.initial.styles = mapAnimation(animation[0], animation[0]);

      //Go over each percentage given
      result.index.forEach((key, index) => {
        result.index.push(key);
        result[key] = {};

        //The next key of the Animation
        const animationNext = animation[result.index[index + 1]],
          //Time between the current and the next key
          timeDifference = ((
            (options.duration * (result.index[index + 1] - result.index[index]) / 100) / 1000
          ) || 0) + "s";

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
        let result = [];

        animation.forEach((style) => {
          if (typeof style === "object") {
            result.push(style);
          }
        });
        return result;
      }



      //Maps Transitions
      function mapTransition(animation, timeDifference, ease) {
        let result = [],
          //Additional transition values like "ease"
          add = "";

        //Ease if easing is enabled (either default or given easing)
        if (ease === true || typeof ease === "string") {
          if (typeof ease === "string") {
            add = " " + ease;
          } else {
            add = " ease";
          }
        }


        animation.forEach((style, index) => {
          if (typeof style === "object") {
            let transition;

            //Transition String
            if (typeof animation !== "undefined") {

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
        let result;

        animation.forEach((fn) => {
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
     * + converts "100" to 100
     * + fixes unreachable percentages
     *
     */
    function preprocessAnimation(animation) {
      let optimizedKeys = [],
        result = {};

      //Go over keys and replace "from" and "to"
      Object.keys(animation).forEach((keyName) => {
        if (keyName === "from") {
          animation["0%"] = animation[keyName];
          delete animation[keyName];
        } else if (keyName === "to") {
          animation["100%"] = animation[keyName];
          delete animation[keyName];
        }
      });


      //Sort Keys in a new Array (we need to ".keys() " again because we modiefied the keys before)
      optimizedKeys = Object.keys(animation);
      optimizedKeys.forEach((keyName, index) => {
        optimizedKeys[index] = parseInt(keyName.replace("%", ""));
      });
      optimizedKeys.sort();

      //Sort Object
      optimizedKeys.forEach((keyName) => {
        result[keyName] = animation[keyName + "%"];
      });

      return result;
    }

  };


  /*
   * Animation methods
   */

  //Main Animation play-method
  microAnimate.prototype.start = function() {
    let _self = this,
    animationBuffer=_self.animation,
      tick = 0,
      relativePercentage = 0,
      //All executed callbacks are indexed to make sure callbacks dont execute twice
      finishedCallbacks = [],
      //Loop object that stores the current and the maximum iterations
      loop = {
        current: 1,
        max: (typeof this.options.loop === "boolean" ? (
          this.options.loop ? Infinity : 0
        ) : this.options.loop)
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
          elementReset(_self.element);
          animationReset();
          loop.current++;
          animationLoop();
        } else {
          //terminate animation
          animationKill();
        }
      } else {
        console.log("Animation Progress: " + relativePercentage + "%");
        //Animate if there is data for the current percentage
        //console.log(animationBuffer.index);
        if(animationBuffer.index.indexOf((relativePercentage).toString())>-1){
          let anim=animationBuffer.index.shift();

          //console.log(relativePercentage);
          //console.log(animationBuffer.index.shift());
        //if (typeof animationBuffer[relativePercentage] !== "undefined") {
          if (relativePercentage < 100) {
            //Check how the next frame should look like
            let nextFrame = animationBuffer.index[animationBuffer.index.indexOf(
              (relativePercentage).toString()
            ) + 1];
            console.log(animationBuffer[nextFrame]);
            applyTransition(
              _self.element,
              animationBuffer[nextFrame].transition
            );
            applyAnimation(
              _self.element,
              animationBuffer[nextFrame].styles
            );
          }
          console.log(animationBuffer);
          console.log(relativePercentage);
          if(typeof animationBuffer[relativePercentage].callback !== "undefined"){
          applyCallback(
            animationBuffer[relativePercentage].callback,
            _self
          );
        }
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
        for (let i = 0; i < styles.length; i++) {
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
        animationBuffer.initial.styles
      );
      tick = 0;
      finishedCallbacks = [];
      _self.data.action = 0;
    }

    //Clear Animation
    function animationKill() {
      if (!_self.options.retainEndState) {
        elementReset(_self.element);
      }
    }

  };

  //Pause Animation
  microAnimate.prototype.pause = function() {
    this.data.action = 1;
  };
  //Resume paused Animation
  //TODO Breaks if not paused
  microAnimate.prototype.unpause = function() {
    this.data.action = 2;
  };

  //Stop & Reset Animation
  microAnimate.prototype.stop = function() {
    window.clearInterval(this.interval);
    elementReset(this.element);
  };


  /*
   * Internal functions
   */

  //Resets the element to its default style
  function elementReset(element) {
    //Kind of rough but it works
    //console.log(element);
    //  console.log(element.style);
    //  console.log(element.style.cssText);
    element.style.cssText = "";
  }


  //Export full namespace to global scope
  window.microAnimate = microAnimate;
  //Exports shorter namespace
  window.Anim = microAnimate;

})(window);
