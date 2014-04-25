/**
 * Created by @sakri on 25-3-14.
 *
 * Javascript port of :
 * http://devblog.phillipspiess.com/2010/02/23/better-know-an-algorithm-1-marching-squares/
 * returns an Array of x and y positions defining the perimeter of a blob of non-transparent pixels on a canvas
 *
 */
(function (window){

    var MarchingSquares = {};

    MarchingSquares.NONE = 0;
    MarchingSquares.UP = 1;
    MarchingSquares.LEFT = 2;
    MarchingSquares.DOWN = 3;
    MarchingSquares.RIGHT = 4;

    // Takes a canvas and returns a list of pixels that
    // define the perimeter of the upper-left most
    // object in that texture, using pixel alpha>0 to define
    // the boundary.
    MarchingSquares.getBlobOutlinePoints = function(sourceCanvas){

        //Add a padding of 1 pixel to handle points which touch edges
        MarchingSquares.sourceCanvas = document.createElement("canvas");
        MarchingSquares.sourceCanvas.width = sourceCanvas.width + 2;
        MarchingSquares.sourceCanvas.height = sourceCanvas.height + 2;
        MarchingSquares.sourceContext = MarchingSquares.sourceCanvas.getContext("2d");
        MarchingSquares.sourceContext.drawImage(sourceCanvas,1,1);

        // Find the starting point
        var startingPoint = MarchingSquares.getFirstNonTransparentPixelTopDown(MarchingSquares.sourceCanvas);

        // Return list of x and y positions
        return MarchingSquares.walkPerimeter(startingPoint.x, startingPoint.y);
    };

    MarchingSquares.getFirstNonTransparentPixelTopDown = function(canvas){
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

    MarchingSquares.walkPerimeter = function(startX, startY){
        // Do some sanity checking, so we aren't
        // walking outside the image
        // technically this should never happen
        if (startX < 0){
            startX = 0;
        }
        if (startX > MarchingSquares.sourceCanvas.width){
            startX = MarchingSquares.sourceCanvas.width;
        }
        if (startY < 0){
            startY = 0;
        }
        if (startY > MarchingSquares.sourceCanvas.height){
            startY = MarchingSquares.sourceCanvas.height;
        }

        // Set up our return list
        var pointList =[];

        // Our current x and y positions, initialized
        // to the init values passed in
        var x = startX;
        var y = startY;

        var imageData = MarchingSquares.sourceContext.getImageData(0,0, MarchingSquares.sourceCanvas.width, MarchingSquares.sourceCanvas.height);
        var index, width4 = imageData.width * 4;

        // The main while loop, continues stepping until
        // we return to our initial points
        do{
            // Evaluate our state, and set up our next direction
            //index = (y-1) * width4 + (x-1) * 4;
            index = (y-1) * width4 + (x-1) * 4;
            MarchingSquares.step(index, imageData.data, width4);

            // If our current point is within our image
            // add it to the list of points
            if (x >= 0 &&
                x < MarchingSquares.sourceCanvas.width &&
                y >= 0 &&
                y < MarchingSquares.sourceCanvas.height){
                pointList.push(x - 2, y - 1);//offset of 1 due to the 1 pixel padding added to sourceCanvas
            }

            switch (MarchingSquares.nextStep){
                case MarchingSquares.UP:    y--; break;
                case MarchingSquares.LEFT:  x--; break;
                case MarchingSquares.DOWN:  y++; break;
                case MarchingSquares.RIGHT: x++; break;
                default:
                    break;
            }

        } while (x != startX || y != startY);

        pointList.push(x - 1, y - 1);

        return pointList;
    };

    // Determines and sets the state of the 4 pixels that
    // represent our current state, and sets our current and
    // previous directions

    MarchingSquares.step = function(index, data, width4){
        //console.log("Sakri.MarchingSquares.step()");
        // Scan our 4 pixel area
        //Sakri.imageData = Sakri.MarchingSquares.sourceContext.getImageData(x-1, y-1, 2, 2).data;

        MarchingSquares.upLeft = data[index + 3] > 0;
        MarchingSquares.upRight = data[index + 7] > 0;
        MarchingSquares.downLeft = data[index + width4 + 3] > 0;
        MarchingSquares.downRight = data[index + width4 + 7] > 0;

        // Store our previous step
        MarchingSquares.previousStep = MarchingSquares.nextStep;

        // Determine which state we are in
        MarchingSquares.state = 0;

        if (MarchingSquares.upLeft){
            MarchingSquares.state |= 1;
        }
        if (MarchingSquares.upRight){
            MarchingSquares.state |= 2;
        }
        if (MarchingSquares.downLeft){
            MarchingSquares.state |= 4;
        }
        if (MarchingSquares.downRight){
            MarchingSquares.state |= 8;
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
        switch (MarchingSquares.state ){
            case 1: MarchingSquares.nextStep = MarchingSquares.UP; break;
            case 2: MarchingSquares.nextStep = MarchingSquares.RIGHT; break;
            case 3: MarchingSquares.nextStep = MarchingSquares.RIGHT; break;
            case 4: MarchingSquares.nextStep = MarchingSquares.LEFT; break;
            case 5: MarchingSquares.nextStep = MarchingSquares.UP; break;
            case 6:
                if (MarchingSquares.previousStep == MarchingSquares.UP){
                    MarchingSquares.nextStep = MarchingSquares.LEFT;
                }else{
                    MarchingSquares.nextStep = MarchingSquares.RIGHT;
                }
                break;
            case 7: MarchingSquares.nextStep = MarchingSquares.RIGHT; break;
            case 8: MarchingSquares.nextStep = MarchingSquares.DOWN; break;
            case 9:
                if (MarchingSquares.previousStep == MarchingSquares.RIGHT){
                    MarchingSquares.nextStep = MarchingSquares.UP;
                }else{
                    MarchingSquares.nextStep = MarchingSquares.DOWN;
                }
                break;
            case 10: MarchingSquares.nextStep = MarchingSquares.DOWN; break;
            case 11: MarchingSquares.nextStep = MarchingSquares.DOWN; break;
            case 12: MarchingSquares.nextStep = MarchingSquares.LEFT; break;
            case 13: MarchingSquares.nextStep = MarchingSquares.UP; break;
            case 14: MarchingSquares.nextStep = MarchingSquares.LEFT; break;
            default:
                MarchingSquares.nextStep = MarchingSquares.NONE;//this should never happen
                break;
        }
    };

    window.MarchingSquares = MarchingSquares;

}(window));