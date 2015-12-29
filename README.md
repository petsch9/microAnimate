microAnimate
=============
microAnimate is a tiny JavaScript Library with a CSS-like animation syntax.
This library calculates the Animation when its initialized, not when executed, giving a huge performance boost!
microAnimate also uses CSS based animating - which means it uses hardware acceleration.


Usage
----------

    //Basic Syntax
    var myAnimation = new Anim(element, {animation}, {options});


    //Full Example
    var myAdvancedAnimation = new Anim(
      document.getElementById("square"),
      {
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
      {
        duration: 2000,
        ticklength: 30,
        smoothing: true,
        ease: false
      });
