# microAnimate
microAnimate is a tiny(~2.5kb) JavaScript Library with a CSS-like animation syntax. This library calculates the Animation when its initialized, not when executed, giving a huge performance boost! microAnimate also uses CSS based animating - which means it uses hardware acceleration.

_Options:_
- duration:

  the duration of the whole animation in ms

- tickrate:

  How long each tick of the animation should be(in ms), lower values are smoother.

  default: 30, recommened range is 10 to 50.

  _Values too high or too low might break the animation!_

- ease:

  If the animation should be eased. Accepts either "true" or a custom CSS-easing.

  default: false.

- retainEndState:

  If the animation should stay the way it finished or if it should be reseted to the initial state

  default: true.

- loop:

  If the should loop. either false, true(infinite times) or integer(n times).

  default: false.

## Usage:

```javascript
//Basic Syntax
var myAnimation = new Anim(element, {animation}, {options});


//Full Example
var myAdvancedAnimation = new Anim(
  document.getElementById("square"), {
    "0%": [
      ["width", "200px"],
      ["color", "transparent"]
    ],
    "20%": [
      ["width", "100px"],
      ["width", "#fff"],
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
  }, {
    duration: 2000,
    ticklength: 30,
    ease: true,
    retainEndState: true,
    loop: false
  }
);
```
