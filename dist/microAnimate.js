"use strict";

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

(function (window) {
  /*
  *
  Usage:
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

  function microAnimate() {
    var element = arguments.length <= 0 || arguments[0] === undefined ? document.body : arguments[0];
    var animation = arguments.length <= 1 || arguments[1] === undefined ? {
      "0%": [["width", "200px"], ["color", "transparent"], function () {
        console.log("callback 1");
      }],
      "20%": [["width", "100px"], ["color", "white"], function () {
        console.log("callback 2");
      }],
      "100%": [["width", "60px"], ["color", "red"], function () {
        console.log("callback 3");
      }]
    } : arguments[1];
    var options = arguments.length <= 2 || arguments[2] === undefined ? {
      duration: 2000,
      ticklength: 30,
      smoothing: true,
      callbackTolerance: 2.5
    } : arguments[2];

    return new Anim(element, animation, options);
  }

  var Anim = function Anim(element, animation, options) {
    //Clone Arguments to Anim
    this.element = element, this.animation = prepareObject(animation), this.opt = options, this.opt.totalTicks = options.duration / options.ticklength, this.interval = window.setInterval(function () {}, 1000), this.animMap = mapAnimation(this.animation, this.opt.totalTicks), this.callbacks = mapCallbacks(this.animation, this.opt.totalTicks);

    if (this.opt.smoothing) {
      this.transition = generateSmoothing(this.animMap);
    }

    //The Animation get calculated before it gets executed for better performance
    //Creates Array with the styles
    /*Output example:
     animMap = [
      ["width", ["0px", "1px", "2px"]],
      ["color", ["#ffffff", "#eeeeee", "#dddddd"]],
    ]
     */
    function mapAnimation(animation) {
      //Prepare Animation given
      var obj = animation,
          mappedProperties = [],
          mappedValuesPre = rawAnimData(obj, mappedProperties),
          mappedValues = processAnim(mappedValuesPre, mappedValuesPre),
          animMap = [mappedProperties, mappedValues];

      //console.log(animMap);
      //return animMap;

      //Maps animation from human-readable format to machine format
      function rawAnimData(animation, mappedProperties) {
        var values = [];
        //Go from 0% to 100%
        Object.keys(animation).forEach(function (percentage) {
          //Go over each property
          animation[percentage].forEach(function (property) {
            //console.log(obj[value][index_2]);

            //Check if were not accidently the callback
            if ((typeof property === "undefined" ? "undefined" : _typeof(property)) === "object") {
              if (mappedProperties.indexOf(property[0]) === -1) {
                //Map for checking future properties
                mappedProperties.push(property[0]);
                //console.log("new Mapping");
                //Create subarray for the properties
                values[mappedProperties.indexOf(property[0])] = [];
              }

              //push values to prop array for the current property
              values[mappedProperties.indexOf(property[0])].push([percentage, property[1]]);

              //console.log(property[0] + ": " + percentage + " " + property[1]);
            }
          });
        });

        return values;
      }

      //Create values for the Animation
      function processAnim(prop, val) {
        var result = [];

        prop.forEach(function (currentProp, index) {
          //console.log(val[index]);
          ease(val[index], getType(currentProp));
        });

        function ease(val, type) {
          if (type === "number") {
            console.log(val);
          } else {
            console.log("Not a numbeeeeeeeeeeeeeee");
          }
        }

        //Check if the property is a number, color or something else
        function getType(val) {
          var type = "",
              testForNumbers = new RegExp("[0-9.]+", "g");

          if (testForNumbers.test(val)) {
            type = "number";
          } else {
            type = "unkown";
          }
          return type;
        }
      }

      /*function insertMap(value, index, frame) {
        //Make sure the callbacks dont get mapped
        if (typeof value !== "function") {
           //Check if there already is a mapping for this property
          if (mappedProperties.indexOf(value[0]) === -1) {
            //Map for checking future properties
            mappedProperties.push(value[0]);
            //init the property in the animMap Array
            animMap.push([value[0],
              [value[1]]
            ]);
           }
          //Else push the value
          else {
            var style = calculateFrame(value[0], value[1], frame);
            //Acess the animMap by looking up the index in the mappedProperties Array and hoping its the same
            animMap[mappedProperties.indexOf(value[0])][1].push(style);
          }
        }
         //Get the css value of the current frame
        function calculateFrame(property, value, nextValue, frame) {
          if (containsNumbers(value)) {
            console.log("Number!");
          } else {
            console.log("Word!");
          }
            //Check if the property is animatable
          function containsNumbers(property) {
            var testForNumbers = new RegExp("[0-9.]+", "g");
             if (testForNumbers.test(property)) {
              return true;
            } else {
              return false;
            }
          }
        }
      }*/
    }

    //Push Callbacks into Array
    function mapCallbacks(animation) {
      var result = [];
      console.log(animation);

      Object.keys(animation).forEach(function (val) {
        animation[val].forEach(function (val2) {
          if (typeof val2 == "function") {
            result[val] = val2;
          }
        });
      });

      return result;
    }

    //Sort and format Animation object
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

    //Generate CSS transition from map
    function generateSmoothing(map) {
      var val = [];

      //console.log(val.join(", "));
      return val.join(", ");
    }
  };

  Anim.prototype.start = function () {

    console.log(this);
    var ticker = 0,
        relativePercentage = 0,

    //Cache variables that wouldnt be available to the loop otherwise
    self = this,
        callbackList = [];

    //Set to first frame before smoothing
    animate(self.element, self.animMap, 0);
    //Enable CSS Based Animation Smoothing
    if (self.opt.smoothing) {
      self.element.style.transition = self.transition;
    }

    //Main Animation Loop
    self.interval = window.setInterval(function () {

      ticker++;
      relativePercentage = Math.round(100 / self.opt.totalTicks * ticker);
      //Roof at 100
      relativePercentage = relativePercentage < 100 | 100;

      //Animate
      animate(self.element, self.animMap, relativePercentage);

      //Remove the interval if over 100% else Animate
      if (ticker > self.opt.totalTicks) {
        killAnim();
      }

      //Callback and return list with the ones which were executed
      callbackList = checkCallbacks(self.callbacks, callbackList, relativePercentage, self.opt.callbackTolerance, self.opt.totalTicks);
    }, self.opt.ticklength);

    //Apply all styles for the current Frame
    function animate(element, map, percentage) {
      map.forEach(function (val, index) {
        if (typeof val[1][percentage] !== "undefined") {
          console.log(percentage + ": " + val[0] + "=" + val[1][percentage]);
          element.style[val[0]] = val[1][percentage];
        }
      });
    }

    //Check if any callbacks need to be run
    function checkCallbacks(callbacks, previousCallbacks, percentage, tolerance, totalTicks) {
      var relativeTolerance = Math.round(tolerance * 100 / totalTicks),
          result = previousCallbacks;

      //Test if a callback exist from percentage - tolererance to percentage + tolererance
      for (var i = percentage - relativeTolerance, max = percentage + relativeTolerance; i <= max; i++) {
        //Only execute if it exists and it hasnt been executed before
        if (callbacks[i] && previousCallbacks.indexOf(callbacks[i]) === -1) {
          callbacks[i](self);
          result.push(callbacks[i]);
        }
      }

      return result;
    }

    function killAnim() {
      window.clearInterval(self.interval);
    }
  };

  Anim.prototype.pause = function () {
    window.setInterval(this, Infinity);
  };
  Anim.prototype.stop = function () {
    window.clearInterval(self.interval);
  };

  //Export microAnimate to global scope
  window.microAnimate = microAnimate;
  //Exports shorter
  window.Anim = microAnimate;
})(window);
//# sourceMappingURL=microAnimate.js.map
