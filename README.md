microAnimate
=============
microAnimate is a tiny(~2.5kb) JavaScript Library with a CSS-like animation syntax. This library calculates the Animation when its initialized, not when executed, giving a huge performance boost! microAnimate also uses CSS based animating - which means it uses hardware acceleration.

[Demo](http://f-rilling.com/projects/microAnimate/demo/demo.html)

Usage:
------------
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
      ["color", "#fff"],
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

Methods:
-----------
```javascript
//Start the Animation
myAnimation.start();


//Stops the Animation & resets it to the initial state
myAnimation.stop();


//Pauses the Animation
myAnimation.pause();

//Unpauses the Animation
myAnimation.unpause();
```

Options:
-----------
- duration:

  the duration of the whole animation in ms


- ease:

  If the animation should be eased. Accepts either "true" or a custom CSS-easing.

  default: false.

- retainEndState:

  If the animation should stay the way it finished or if it should be reseted to the initial state

  default: true.

- loop:

  If the should loop. either false, true(infinite times) or integer(n times).

  default: false.
