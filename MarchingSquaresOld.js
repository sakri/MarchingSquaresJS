/**
 * Created by @sakri on 25-3-14.
 *
 * Javascript port of :
 * http://devblog.phillipspiess.com/2010/02/23/better-know-an-algorithm-1-marching-squares/
 * returns an Array of x and y positions defining the perimeter of a blob of non-transparent pixels on a canvas
 *
 */
(function (window){

    var MarchingSquaresOld = {};

    MarchingSquaresOld.NONE = 0;
    MarchingSquaresOld.UP = 1;
    MarchingSquaresOld.LEFT = 2;
    MarchingSquaresOld.DOWN = 3;
    MarchingSquaresOld.RIGHT = 4;

    // Takes a canvas and returns a list of pixels that
    // define the perimeter of the upper-left most
    // object in that texture, using pixel alpha>0 to define
    // the boundary.
    MarchingSquaresOld.getBlobOutlinePoints = function(sourceCanvas){

        //Add a padding of 1 pixel to handle points which touch edges
        MarchingSquaresOld.sourceCanvas = document.createElement("canvas");
        MarchingSquaresOld.sourceCanvas.width = sourceCanvas.width + 2;
        MarchingSquaresOld.sourceCanvas.height = sourceCanvas.height + 2;
        MarchingSquaresOld.sourceContext = MarchingSquaresOld.sourceCanvas.getContext("2d");
        MarchingSquaresOld.sourceContext.drawImage(sourceCanvas,1,1);

        // Find the starting point
        var startingPoint = MarchingSquaresOld.getFirstNonTransparentPixelTopDown(MarchingSquaresOld.sourceCanvas);

        // Return list of x and y positions
        return MarchingSquaresOld.walkPerimeter(startingPoint.x, startingPoint.y);
    };

    MarchingSquaresOld.getFirstNonTransparentPixelTopDown = function(canvas){
        var context = canvas.getContext("2d");
        var y, i, rowData;
        for(y = 0; y < canvas.height; y++){
            rowData = context.getImageData(0, y, canvas.width, 1).data;
            for(i=0; i<rowData.length; i+=4){
                if(rowData[i+3] > 0){
                    return {x : i/4, y : y};
                }
            }
        }
        return null;
    };

    MarchingSquaresOld.walkPerimeter = function(startX, startY){
        // Do some sanity checking, so we aren't
        // walking outside the image
        // technically this should never happen
        if (startX< 0){
            startX = 0;
        }
        if (startX> MarchingSquaresOld.sourceCanvas.width){
            startX= MarchingSquaresOld.sourceCanvas.width;
        }
        if (startY< 0){
            startY= 0;
        }
        if (startY> MarchingSquaresOld.sourceCanvas.height){
            startY= MarchingSquaresOld.sourceCanvas.height;
        }

        // Set up our return list
        var pointList =[];

        // Our current x and y positions, initialized
        // to the init values passed in
        var x = startX;
        var y = startY;

        // The main while loop, continues stepping until
        // we return to our initial points
        do{
            // Evaluate our state, and set up our next direction
            MarchingSquaresOld.step(x, y);

            // If our current point is within our image
            // add it to the list of points
            if (x >= 0 &&
                x < MarchingSquaresOld.sourceCanvas.width &&
                y >= 0 &&
                y < MarchingSquaresOld.sourceCanvas.height){
                pointList.push(x - 1, y - 1);//offset of 1 due to the 1 pixel padding added to sourceCanvas
            }

            switch (MarchingSquaresOld.nextStep){
                case MarchingSquaresOld.UP:    y--; break;
                case MarchingSquaresOld.LEFT:  x--; break;
                case MarchingSquaresOld.DOWN:  y++; break;
                case MarchingSquaresOld.RIGHT: x++; break;
                default:
                    break;
            }

        } while (x != startX || y != startY);

        return pointList;
    };

    // Determines and sets the state of the 4 pixels that
    // represent our current state, and sets our current and
    // previous directions

    MarchingSquaresOld.step = function(x, y){
        //console.log("MarchingSquaresOld.step()");
        // Scan our 4 pixel area
        MarchingSquaresOld.sampleData = MarchingSquaresOld.sourceContext.getImageData(x-1, y-1, 2, 2).data;

        MarchingSquaresOld.upLeft = MarchingSquaresOld.sampleData[3] > 0;
        MarchingSquaresOld.upRight = MarchingSquaresOld.sampleData[7] > 0;
        MarchingSquaresOld.downLeft = MarchingSquaresOld.sampleData[11] > 0;
        MarchingSquaresOld.downRight = MarchingSquaresOld.sampleData[15] > 0;

        // Store our previous step
        MarchingSquaresOld.previousStep = MarchingSquaresOld.nextStep;

        // Determine which state we are in
        MarchingSquaresOld.state = 0;

        if (MarchingSquaresOld.upLeft){
            MarchingSquaresOld.state |= 1;
        }
        if (MarchingSquaresOld.upRight){
            MarchingSquaresOld.state |= 2;
        }
        if (MarchingSquaresOld.downLeft){
            MarchingSquaresOld.state |= 4;
        }
        if (MarchingSquaresOld.downRight){
            MarchingSquaresOld.state |= 8;
        }

        // State now contains a number between 0 and 15
        // representing our state.
        // In binary, it looks like 0000-1111 (in binary)

        // An example. Let's say the top two pixels are filled,
        // and the bottom two are empty.
        // Stepping through the if statements above with a state
        // of 0b0000 initially produces:
        // Upper Left == true ==>  0b0001
        // Upper Right == true ==> 0b0011
        // The others are false, so 0b0011 is our state
        // (That's 3 in decimal.)

        // Looking at the chart above, we see that state
        // corresponds to a move right, so in our switch statement
        // below, we add a case for 3, and assign Right as the
        // direction of the next step. We repeat this process
        // for all 16 states.

        // So we can use a switch statement to determine our
        // next direction based on
        switch (MarchingSquaresOld.state ){
            case 1: MarchingSquaresOld.nextStep = MarchingSquaresOld.UP; break;
            case 2: MarchingSquaresOld.nextStep = MarchingSquaresOld.RIGHT; break;
            case 3: MarchingSquaresOld.nextStep = MarchingSquaresOld.RIGHT; break;
            case 4: MarchingSquaresOld.nextStep = MarchingSquaresOld.LEFT; break;
            case 5: MarchingSquaresOld.nextStep = MarchingSquaresOld.UP; break;
            case 6:
                if (MarchingSquaresOld.previousStep == MarchingSquaresOld.UP){
                    MarchingSquaresOld.nextStep = MarchingSquaresOld.LEFT;
                }else{
                    MarchingSquaresOld.nextStep = MarchingSquaresOld.RIGHT;
                }
                break;
            case 7: MarchingSquaresOld.nextStep = MarchingSquaresOld.RIGHT; break;
            case 8: MarchingSquaresOld.nextStep = MarchingSquaresOld.DOWN; break;
            case 9:
                if (MarchingSquaresOld.previousStep == MarchingSquaresOld.RIGHT){
                    MarchingSquaresOld.nextStep = MarchingSquaresOld.UP;
                }else{
                    MarchingSquaresOld.nextStep = MarchingSquaresOld.DOWN;
                }
                break;
            case 10: MarchingSquaresOld.nextStep = MarchingSquaresOld.DOWN; break;
            case 11: MarchingSquaresOld.nextStep = MarchingSquaresOld.DOWN; break;
            case 12: MarchingSquaresOld.nextStep = MarchingSquaresOld.LEFT; break;
            case 13: MarchingSquaresOld.nextStep = MarchingSquaresOld.UP; break;
            case 14: MarchingSquaresOld.nextStep = MarchingSquaresOld.LEFT; break;
            default:
                MarchingSquaresOld.nextStep = MarchingSquaresOld.NONE;//this should never happen
                break;
        }
    };

    window.MarchingSquaresOld = MarchingSquaresOld;

}(window));