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
    //Process the Animation/Options and store them
    this.element = element;
    this.options = options;
    //Constants
    this.data = {
      //Ticklength constant (default: 16)
      ticklength: 16,
      //Action can be: 0=nothing, 1=pause or 2=unpause
      action: 0
    };
    this.data.ticks = Math.ceil(options.duration / this.data.ticklength);
    this.animation = processAnimation(
      preprocessAnimation(animation),
      this.data,
      this.options
    );
    this.interval = null;



    /*The Animation gets calculated before when constructed for better performance
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
        result[key] = {};

        //The next key of the Animation
        const animationNext = animation[result.index[index + 1]],
          //Time between the current and the next key (or the two before if not given)
          timeDifference =
          (((options.duration * (result.index[index] - result.index[index - 1]) / 100) / 1000) ||
            0) + "s";

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

        //Iterate over styles
        animation.forEach(style => {
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
            //if a string is given, use the string
            add = " " + ease;
          } else {
              //if a true is given, use default easing
            add = " ease";
          }
        }else{
          //if a false is given, use no easing
          add = " linear";
        }

        //Iterate over styles
        animation.forEach((style, index) => {
          if (typeof style === "object") {
            let transition;

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
        let result;

        //Iterate over callbacks
        animation.forEach(fn => {
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
      let optimizedKeys = [],
        result = {};

      //Go over keys and replace "from" and "to"
      Object.keys(animation).forEach(keyName => {
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
      optimizedKeys.forEach((keyName, index) => {
        optimizedKeys[index] = parseInt(keyName.replace("%", ""));
      });
      optimizedKeys.sort();

      //Sort Object
      optimizedKeys.forEach(keyName => {
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
    //Reset if the Animation is called while its already running
    if(this.interval!==null){
      animationKill.apply(this,[true]);
    }

    let _self = this,
      animationBuffer = _self.animation,
      tick,
      relativePercentage,
      indexMin,
      indexList,
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
      if (indexList.length === 0) {
        //Check if given loops have been run and if the animation an be terminated
        if (loop.current < loop.max) {
          elementReset(_self.element);
          animationReset();
          loop.current++;
          animationLoop();
        } else {
          //terminate animation
          animationKill.apply(this,[false]);
        }
      } else {
        //console.log("Animation Progress: " + relativePercentage + "%");
        //Animate if there is data for the current percentage
        if (relativePercentage > indexMin) {
          //Get the data of this and the next frame
          let currentFrame = animationBuffer[indexMin],
            nextFrame = animationBuffer[indexList[1]] || animationBuffer[0];
          //Remove smallest Index and recalc
          indexList.shift();
          //Get smallest value of Array
          indexMin = Math.min.apply(Math, indexList);


          applyTransition(
            _self.element,
            nextFrame.transition
          );
          applyAnimation(
            _self.element,
            nextFrame.styles
          );
          if (typeof currentFrame.callback !== "undefined") {
            applyCallback(
              currentFrame.callback,
              _self
            );
          }
        }

        tick++;
        //Check if theres anything to do before going to the next frame (pausing etc.)
        if (_self.data.action === 0) {
          //Ooooor everything is nice and quiet, and we can continue our animation
          _self.interval = window.setTimeout(() => {
            window.requestAnimationFrame(animationLoop);
          }, _self.data.ticklength);
        } else if (_self.data.action === 1) {
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
    function applyCallback(callback, context) {
      callback(context);
    }

    //Reset animation
    function animationReset() {
      tick = 0;
      relativePercentage = 0;
      indexMin = 0;
      indexList = Array.from(animationBuffer.index);
      _self.data.action = 0;

      applyAnimation(
        _self.element,
        animationBuffer.initial.styles
      );
    }


    function animationPause() {
      _self.interval = window.setInterval(() => {
        if (_self.data.action === 2) {
          //Yay we can continue
          _self.data.action = 0;
          window.clearInterval(_self.interval);
          window.requestAnimationFrame(animationLoop);
        }
      }, _self.data.ticklength * 2);
    }

  };

  //Pause Animation
  microAnimate.prototype.pause = function() {
    this.data.action = 1;
  };
  //Resume paused Animation
  microAnimate.prototype.unpause = function() {
    if (this.data.action === 1) {
      this.data.action = 2;
    }
  };

  //Stop & Reset Animation
  microAnimate.prototype.stop = function() {
    animationKill.apply(this,[true]);
  };


  /*
   * Internal functions
   */

  //Resets the element to its default style
  function elementReset(element) {
    //Kind of rough but it works
    element.style.cssText = "";
  }

  //Clear Animation
  function animationKill(forceReset) {
    console.log(this);
    window.clearInterval(this.interval);
    this.interval=null;
    if (!this.options.retainEndState || forceReset) {
      elementReset(this.element);
    }
  }


  //Export full namespace to global scope
  window.microAnimate = microAnimate;
  //Exports shorter namespace
  window.Anim = microAnimate;

})(window);
