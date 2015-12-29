(function(window) {
  /*
  * Usage:

  var myAnimation = new Anim(element,{
      "0%": [
        ["width", "200px"],
        ["color", "transparent"],
        function() {
          console.log("callback 1");
        }
      ],
      "20%": [
        ["width", "100px"],
        ["color", "white"],
        function() {
          console.log("callback 2");
        }
      ],
      "100%": [
        ["width", "60px"],
        ["color", "red"],
        function() {
          console.log("callback 3");
        }
      ]
    },
    options = {
      duration: 2000,
      ticklength: 30,
      smoothing: true,
      callbackTolerance: 2.5
    });

  *
  */

  function microAnimate(
    element = document.body,
    animation = {},
    options = {
      duration: 2000,
      ticklength: 30,
      smoothing: true,
      ease: false
    }
  ) {


    return new Anim(element, animation, options);

  }

  var Anim = function(element, animation, options) {
    //Clone Arguments to Anim
    this.element = element,
      this.options = options,
      this.options.totalTicks = options.duration / options.ticklength,
      this.animation = processAnimation(prepareObject(animation), this.options),
      this.interval = null;

    if (this.options.totalTicks % 10 !== 0) {
      console.info("The ticklength you provided(" + options.ticklength + ") doesn't fit into the duration " + options.duration);
      console.info("This might cause issues, but you should be fine");
      console.info("To avoid this make sure the duration is a multiple of the ticklength");
    }


    /*The Animation get calculated before it gets executed for better performance
    * Result looks like this:

    {
      0: {
        styles: [
          ["width", "100px"],
          ["color", "red"]
        ]
        transition: ["width 2s", "color 2s"]
        callback: callback1()
      },
      20: {
        styles: [
          ["width", "20px"],
          ["color", "blue"]
        ]
        transition: ["width 6s", "color 6s"]
        callback: callback2()
      },
      100: {
        styles: [
          ["width", "400px"],
          ["color", "gree"]
        ]
        transition: []
        callback: callback3()
      }
    }

    *
    */


    //Generate Style, Transition and Callbacks from the animation property
    function processAnimation(animation, options) {
      var result = {},
        animKeys = Object.keys(animation);

      //Go over each percentage given
      animKeys.forEach(function(key, index) {
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

      function mapAnimation(animation) {
        var result = [];
        animation.forEach(function(style) {
          if (typeof style === "object") {
            result.push(style);
          }
        });
        return result;
      }


      function mapCallback(animation) {
        var result;
        animation.forEach(function(fn) {
          if (typeof fn === "function") {
            result = fn;
          }
        });
        return result;
      }

      function mapTransition(animation, index, allKeys, options) {
        //Only try to create a transition if the Animation isnt finished yet
        if (allKeys[index] !== "100") {


          var result = [],
            //The next key of the Animation
            nextAnim = animation[allKeys[index + 1]],
            //Time between the current and the next key
            timeDifference = options.totalTicks / (allKeys[index + 1] - allKeys[index]) + "s",
            //Additional transition values, "ease" for example
            add = "";


          //Ease if easing is enabled (either default or given easing)
          if (options.ease === true || typeof options.ease === "string") {
            if (typeof options.ease === "string") {
              add = options.ease;
            } else {
              add = "ease";
            }
          }


          animation[allKeys[index]].forEach(function(style, i) {
            if (typeof style === "object") {
              var trans;

              if (typeof nextAnim !== "undefined") {
                //Transition String
                trans = nextAnim[i][0] + " " + timeDifference + " " + add;
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
          result = Math.round(
            Math.round((key / 100) * options.totalTicks) *
            (100 / options.totalTicks)
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
      keys.forEach(function(keyName) {
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
      optimizedKeys.forEach(function(keyName, index) {
        optimizedKeys[index] = parseInt(keyName.replace("%", ""));
      });
      optimizedKeys.sort();

      //Sort Object
      optimizedKeys.forEach(function(keyName) {
        result[keyName] = object[keyName + "%"];
      });

      return result;
    }

  };


  /*
   * Animation methods
   */

  Anim.prototype.start = function() {

    console.log(this);
    var ticker = 0,
      relativePercentage = 0,
      //Cache variables that wouldnt be available to the loop otherwise
      self = this,
      //All executed callbacks are index to make sure callbacks dont execute twice
      finishedCallbacks = [];


    //Set to first frame before starting to avoid glitching
    animate(self.element, self.animation[0].styles);
    transition(self.element, self.animation[0].transition);


    //Main Animation Loop
    self.interval = window.setInterval(function() {
      relativePercentage = Math.round((100 / self.options.totalTicks) * ticker);
      //Roof at 100
      if (relativePercentage > 100) {
        relativePercentage = 100;
      }
      console.log("Animation Progress: " + relativePercentage + "%");


      //Animate if there is data for the current percentage
      if (typeof self.animation[relativePercentage] !== "undefined") {
        animate(
          self.element,
          self.animation[relativePercentage].styles
        );
        transition(
          self.element,
          self.animation[relativePercentage].transition
        );
        callback(
          self.animation[relativePercentage].callback,
          self
        );
      }

      //Remove the interval if over 100% else Animate
      if (ticker > self.options.totalTicks) {
        killAnim();
      }


      ticker++;
    }, self.options.ticklength);



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
        element.style.transition = transitions.join(",");
      }
    }

    //Check if any callbacks need to be run
    function callback(callbacks, target) {
      if (typeof callbacks === "function" && finishedCallbacks.indexOf(callbacks) === -1) {
        callbacks(target);
        finishedCallbacks.push(callbacks);
      }
    }


    function killAnim() {
      window.clearInterval(self.interval);
    }
  };

  Anim.prototype.pause = function() {
    window.setInterval(this, Infinity);
  };

  Anim.prototype.stop = function() {
    window.clearInterval(this.interval);
  };



  //Export microAnimate to global scope
  window.microAnimate = microAnimate;
  //Exports shorter
  window.Anim = microAnimate;

})(window);
