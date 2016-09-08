## Optimized implementation of the [Marching Squares](http://users.polytech.unice.fr/~lingrand/MarchingCubes/algo.html) algorithm in Javascript

![canvas](https://cloud.githubusercontent.com/assets/8630763/18348811/e2d33b10-75cd-11e6-8131-9d57140d5508.png)

Computation times for 20 iterations:

|            | old  | new | optimized |
|------------|------|-----|-----|
| time in ms | 3876 | 443 | 20  |
| time in %  | 873  | 100 | **4**   |

The optimized version is approximately 217 times faster than the "old version" and **24 times faster** than the "new version" implemented by [sakri](https://github.com/sakri).

[ES2015](http://www.ecma-international.org/ecma-262/6.0/) [features](https://kangax.github.io/compat-table/es6/) like TypedArrays, const and local scoping are used to gain this speed up.

Test it yourself with this online [benchmark / demo](http://htmlpreview.github.io/?https://github.com/mamrehn/MarchingSquaresJS/blob/master/marchingSquaresTest.html).

## Original README

Marching squares outlines blobs of non-transparent pixels inside a bitmap.

This is a straight forward port from this excellent implementation by Phill Spiess:

http://devblog.phillipspiess.com/2010/02/23/better-know-an-algorithm-1-marching-squares/

This is a Javascript implementation designed to be used with Html5 Canvas.

Check out the code in marchingSquaresTest.html for usage example.

http://htmlpreview.github.io/?https://github.com/sakri/MarchingSquaresJS/blob/master/marchingSquaresTest.html


Here's a few codepen demos using it:

A visualization of the algo as it executes
http://codepen.io/sakri/full/aIirl

Text Edge Flare
http://codepen.io/sakri/full/vIKJp

Ghost text
http://codepen.io/sakri/full/zbqti

He-Man effect
http://codepen.io/sakri/full/wsiLC


Here's a demo that tackles "blobs with holes" as in getting the outline for characters such as "O" "8" "&" etc.
http://codepen.io/sakri/pen/LCrDe

If there is interest, I can include the required code in this repo (floodFill, basic threshold etc.)



Have a good day!
