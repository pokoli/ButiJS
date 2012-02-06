/**
 * KineticJS Image Plugin v1.0.1
 * http://www.html5canvastutorials.com/
 * Copyright 2012, Eric Rowell
 * Licensed under the MIT or GPL Version 2 licenses.
 * Date: Jan 22 2012
 *
 * Copyright (C) 2012 by Eric Rowell
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
/** 
 * Image constructor
 */
Kinetic.Image = function(config){
    this.image = config.image;
    this.border = config.border;
    this._showBorder = !!config.border;
    
    var x = config.x ? config.x : 0;
    var y = config.y ? config.y : 0;
    var width = config.width ? config.width : config.image.width;
    var height = config.height ? config.height : config.image.height;
    
    var draw = function(){
        var context = this.getContext();
        
        // draw border
        if (this.border && this._showBorder) {
            // half border width
            var bw = this.border.width / 2;
            context.fillStyle = this.border.color;
            context.fillRect(x - bw, y - bw, width + bw * 2, height + bw * 2);
        }
        
        context.drawImage(this.image, x, y, width, height);
        context.beginPath();
        context.rect(x, y, width, height);
        context.closePath();
    };
    
    // call super constructor
    Kinetic.Shape.apply(this, [draw, config.name]);
};
// Extend KineticJS Shape
Kinetic.Image.prototype = new Kinetic.Shape();

/*
 * set Image image
 */
Kinetic.Image.prototype.setImage = function(img){
    this.image = img;
};

/*
 * show border
 */
Kinetic.Image.prototype.showBorder = function(){
    this._showBorder = true;
};

/*
 * hide border
 */
Kinetic.Image.prototype.hideBorder = function(){
    this._showBorder = false;
};
/*
 * set border color
 */
Kinetic.Image.prototype.setBorderColor = function(color){
    this.border.color = color;
};
/*
 * set border width
 */
Kinetic.Image.prototype.setBorderWidth = function(width){
    this.border.width = width;
};

