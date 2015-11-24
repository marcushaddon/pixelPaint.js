var vCanvas = {
  width : 50,
  height : 50,
  mode : "paint",
  pixels : [],
  author : "Marcus",
  drafts: [],
  history : [],
  future : [],
  
  //creates virtual representation of canvas in memory
  loadPix : function() {
    for (var x = 0; x <= this.width; x++) {
      this.pixels[x] = [];
      for (var y = 0; y <= this.height; y++) {
          this.pixels[x][y] = [255, 255, 255];
      }
    }
  },

  //creates 'physical' canvas in html document by drawing table
  stretchCanvas : function() {
    
  var grid = "<table id='grid' onmousedown='brush.press()' onmouseup='brush.lift()'>";

  for (var y = this.height; y >= 0; y--) {

    grid += "<tr>";
    for (var x = 0; x <= this.width; x++) {
      var coordinate = [x, y];
      grid += "<td style='background:#FFFFFF' id=" + coordinate + " class='pixel' ontouchenter='console.log('entered')' ontouchmove='brush.doMode(this.id)' onmouseover='brush.doMode(this.id)'>" + "</td>";
      }
    grid += "</tr>";
    }
    
    grid += "</table>";
    
    document.getElementById("canvas").innerHTML = grid;
    
    //disable scrolling on canvas for mobile
    document.getElementById("canvas").addEventListener('touchmove', function(e) {
          e.preventDefault();
        }, false);
    
    //set up brush lift and press events for mobile
    document.getElementById("canvas").addEventListener('touchstart', brush.press(), false);
    document.getElementById("canvas").addEventListener('touchend', brush.lift(), false);
    
    this.history = [];
    vCanvas.checkHistory();
    
    
    
  
  
  },
  
  //save JSON string of current virtual canvas to the drafts array
  save : function() {
    saveFile = this.pixels;
    this.drafts.push(JSON.stringify(saveFile));
    //this should be rewritten
    record = "<h3 id='" + this.drafts.length + "' onclick='vCanvas.load(vCanvas.drafts[parseInt(this.id - 1)])'>Draft #" + (this.drafts.length) + "</h3>";
    document.getElementById("saveQ").innerHTML += record;
    
  },
  
  //load a saved draft from the drafts array into the current virtual canvas and onto the html canvas
  load : function(file) {
    this.pixels = JSON.parse(file);
    for (var x = 0; x <=50; x++) {
      for (var y = 0; y <= 50; y++) {
        document.getElementById(x + "," + y).style.backgroundColor = chromaString(this.pixels[x][y]);
      }
    }
  },
  
  //restore the most recent set of altered pixels from the history array to their original values
  undo : function() {
    if (this.history.length > 0) {
      var last = this.history[this.history.length - 1];
      last.reverse();
      
      for (var i = 0, length = last.length; i < length; i++) {
        //restore virtual pixel
        this.pixels[last[i][0][0], last[i][0][1]] = last[i][1];
        //restore html pixel
        document.getElementById(last[i][0].toString()).style.backgroundColor = chromaString(last[i][1]);  
      }
      
      //put this history record into the 'redo' queue
      var next = this.history.pop();
      this.future.push(next);
      
      //set the undo/redo controls
      this.checkHistory();
      
    } else {
      console.log("Nothing to undo!");
    }
  },
  
  //restore the most recent set of 'undone' pixels to their most recent values
  redo : function() {
    if (this.future.length > 0) {
      var next = this.future[this.future.length - 1];
      next.reverse();
      for (var i = 0, length = next.length; i < length; i++) {
        this.pixels[next[i][0][0], next[i][0][1]] = next[i][2];
        document.getElementById(next[i][0].toString()).style.backgroundColor = chromaString(next[i][2]);
      }
      var last = this.future.pop();
      this.history.push(last);
      
      this.checkHistory();
    } else {
      console.log("Nothing to redo!");
    }
    
  },
  
  //check contents of 'history' and 'future' and set colors of undo/redo controls
  checkHistory : function() {
  if (vCanvas.history.length > 0) {
    document.getElementById("undo").style.color = "black";
  } else {
    document.getElementById("undo").style.color = "grey";
  }
  
  if (vCanvas.future.length > 0) {
    document.getElementById("redo").style.color = "black";
  } else {
    document.getElementById("redo").style.color = "grey";
  }
}
  
  
  

}

var brush = {
  opacity : 1,
  color : [0, 0, 0],
  pressed : false,
  mode : "paint",
  size : 8,
  recentColors : [[255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [0, 0, 0]],
  
  //set brush to active
  press : function() {
    //check to see if the current color is in the recent colors pallete
    var newColor = true;
    var checkColor = this.color.toString();
    for (i = 0; i < this.recentColors.length; i++) {
        if (this.recentColors[i].toString() === checkColor) {
          newColor = false;
          break;
        }
    }
    
    //if not, push this color to recentColors and update the pallete
    if (newColor) {
      this.recentColors.shift();
      //should I use a closure to add the value of this.color, instead of a reference to it?
      this.recentColors.push(this.color.slice());
      
      recent = document.getElementsByClassName("pallete");
      
      for (i = 0; i < 6; i++) {
          recent[i].style.backgroundColor = chromaString(this.recentColors[5-i]);
          //figure out table spacing first
          //recent[i].innerHTML = hexVal(this.recentColors[5-i]);
        }
        
      
      }
      
      //create a new 'undo' entry
      vCanvas.history.push([]);
      //reset 'redo' qeue
      vCanvas.future = [];
      
      
    this.pressed = true;
    
    
    
  },
  
  //de-activate brush
  lift : function() {
    this.pressed = false;
    vCanvas.checkHistory();
  },
  
  setColor : function(prime, value) {
    this.color[prime] = parseInt(value);
    var hexVal = "";
    for (var i = 0; i <3; i++) {
      hexVal += this.color[i].toString(16);
    }
    
    //need to adjust table spacing for this
    //document.getElementById('colorDisplay').innerHTML = "Current Color:<br>#" + hexVal;
    document.getElementById('colorDisplay').style.color = chromaString(this.color);
  },
  
  //need to make this update the hex color code without repeating a bunch of code
  presetColor : function(preset) {
    this.color = chromaVal(preset);
    document.getElementById("colorDisplay").style.color = preset;
  },

  setOpacity : function(value) {
    this.opacity = value/100;
    document.getElementById('opacityDisplay').style.opacity = brush.opacity;
  },
  
  setSize : function(value) {
    if (parseInt(value) === 2) {
      this.mode = "paint";
    } else {
      this.mode = "paintBrush";
    }
    
    this.size = parseInt(value) - 2;
    console.log(this.size);
  },

  paint : function(coordinate, opac) {
    if (this.pressed) {
      opac = opac || this.opacity;
      
      //change the pixel in the html
      var active = document.getElementById(coordinate).style.backgroundColor;
      active = chromaVal(active);
      var result = blend(active, this.color, opac);
      var newCol = result.slice(); //for redo array
      result = chromaString(result);
      document.getElementById(coordinate).style.backgroundColor = result;
      
      
      

      //update the pixel in the brush.pixels array
      var record = coordinate.split(',');
      record = record.map(parseFloat);
      vCanvas.pixels[record[0]][record[1]] = active;
      
      
      
      //track changes and push to undo
      var latestAction = vCanvas.history[vCanvas.history.length - 1];
      latestAction.push([record, active, newCol]);
          
      }
    },
  
  
  //uses paint method within loop to create a larger brush with soft edges
  paintBrush : function(coordinate) {
      
      var inner = coordinate.split(',');
      inner = inner.map(parseFloat);
      var lSize = 0 - this.size / 2;
      var hSize = this.size / 2;
      var maxDistance = Math.sqrt(Math.pow((lSize - inner[0]), 2) + Math.pow((lSize - inner[1]), 2));
      
      for (var x = lSize; x <= hSize; x++) {
        for (var y = lSize; y <= hSize; y++) {
          var outer = [inner[0] + x, inner[1] + y];
          var distance = Math.sqrt(Math.pow((outer[0] - inner[0]), 2) + Math.pow((outer[1] - inner[1]), 2));
          distance = distance.toFixed(2);
          if (distance == 0) {
            var opc = this.opacity;
            } else {
              var opc = this.opacity - (distance -1) / ((this.size + 1)/ 2) * this.opacity; 
            }
            
            if (outer[0] < 0 || outer[1] < 0 || outer[0] > 50 || outer[1] > 50) {
              continue;
            } else {
              outer = outer.join(',');
              this.paint(outer, opc);
            }
          
         
        }
      }
      
  },
  
  doMode : function(input) {
    if (this.mode === "paintBrush") {
      return this.paintBrush(input);
    } else {
      return this.paint(input);
    }
    
  }
}


//general purpose function for determining the result of mixing two colors
function blend(oColorArray, brushArray, opcty) {
  var nColorArray = [];
  for (i=0; i < 3; i++) {
    difference = brushArray[i] - oColorArray[i];
    nColorArray[i] = oColorArray[i] + Math.round(difference * opcty);
  }
  
  return nColorArray;
}



//a general purpose function that takes an html color attribute value and returns a three number array
var chromaVal = function(string) {
  col = string.replace(/[rgb()]/g,"");
  colArr = col.split(", ");
  colArr = colArr.map(parseFloat);
  return colArr;
  
}

//a general purpose function that takes an array of three numbers and returns a string that can be assinged as a value of a color attribute on an html element
var chromaString = function(array) {
  colString = "rgb(" + array.join(", ") + ")";
  return colString;
}

//general purpose function for converting color value arrays into hex value string. need to figure out how to maintain doube 00 for 0s
function hexVal(array) {
  var hexString = "#";
  for (var i = 0, length = array.length; i < length; i++) {
    hexString += array[i].toString(16);
  }
  return hexString;
}

//function for seeing if an array is found in a multidimensional array
function isIn(little, big) {
  for (var i = 0, length = big.length; i < length; i ++) {
    if (little.toString() == big[i].toString()) {
      return true;
    }
  }
  return false;
}






















