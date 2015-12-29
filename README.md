microAnimate
=============
microAnimate is a tiny(~2.5kb) JavaScript Library with a CSS-like animation syntax.
This library calculates the Animation when its initialized, not when executed, giving a huge performance boost!
microAnimate also uses CSS based animating - which means it uses hardware acceleration.


*Options:*

 - duration:
  the duration of the whole animation in ms

 - tickrate:
  How long each tick of the animation should be(in ms), lower values are smoother.
  default: 30, recommened range is 10 to 50.
  _Values too high or too low might break the animation!_

 - smoothing:
  if the steps of the animation should be smoothed.
  default: true.

 - ease:
  if the animation should be eased.
  accepts either "true" or a custom easing.
  default: false.


Usage:
----------
```javascript
    //Basic Syntax
    var myAnimation = new Anim(element, {animation}, {options});


    //Full Example
    var myAdvancedAnimation = new Anim(
      document.getElementById("square"),
      {
        "0%": [
          ["width", "200px"],
          ["color", "transparent"]
        ],
        "20%": [
          ["width", "100px"],
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
      {
        duration: 2000,
        ticklength: 30,
        smoothing: true,
        ease: false
      }
    );
```
