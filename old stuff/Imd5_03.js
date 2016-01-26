/*
	Imd5 object: 5^n x 5^n ImageData wrapper
*/

function Imd5(p5) {
	this.p5 = p5;
	
	// compute padding
	this.padding = 1; 	// extra pixel for outline
	for (var i=0; i<p5; ++i) {
		this.padding += Math.pow(5, i);
	}
	this.side = Math.pow(5, p5) + this.padding * 2;	// padding on both sides 

	this.imageData = new ImageData(this.side, this.side);
}

Imd5.prototype = {
	constructor: Imd5,
	xorRect: xorRect,
	makePiece: makePiece,
	hor, hor,
	ver, ver,
	toImg: toImg
};

function xorRect(x, y, w, h, r, g, b, a) {
	if (w < 0) {
		w = -w;
		x -= w;
	}
	if (h < 0) {
		h = -h;
		y -= h;
	}
	var data = this.imageData.data;
	var p = (y * this.side + x) * 4;
	var q = (this.side - w) * 4;
	for (var i=0; i<h; ++i) {
		for (var j=0; j<w; ++j) {
			data[p++] ^= r;
			data[p++] ^= g;
			data[p++] ^= b;
			data[p++] ^= a;
		}
		p += q;
	}
}

function makePiece(z0, z1, zouter0, zouter1) {
// (all z- arguments are complex)
// z0 is top left corner of piece
// z1 is bottom right corner piece
// zouter0 is top left corner of 3x3 pieces centered on current piece
// zouter1 is bottom right corner

	var s = Math.pow(5, this.p5);
	this.alpha = 48;
	this.xorRect(this.padding, this.padding, s, s, 0, 0, 0, this.alpha);
	
	this.hor(this.padding,   this.padding,   s, z0, z1, {re:z0.re, im:zouter0.im});
	this.hor(this.padding,   this.padding+s, s, {re:z0.re, im:z1.im}, {re:z1.re, im:zouter1.im}, z0);
	this.ver(this.padding,   this.padding,   s, z0, z1, {re:zouter0.re, im:z0.im});
	this.ver(this.padding+s, this.padding,   s, {re:z1.re, im:z0.im}, {re:zouter1.re, im:z1.im}, z0);
}

function hor(x, y, dxy, z0, z1, z2) {
// horizontal line starting at (x, y), length dxy.
// z0 and z1 are the corners of the square under the line.
// z2 is the upper left corner of the square above the line.

	if (dxy <= 1) {
		return;
	}

	var zz = new Zinterpolator(z0, z1, z2);
	
	dxy /= 5;
	
	this.hor(x, y, dxy, zz.interp(0, 0), zz.interp(1, 1));
	x += dxy;

	this.hor(x, y, dxy, zz.interp(0, 1), zz.interp(1, 2));
	x += dxy;

	if (flip(z0.re*z0.im*z1.re*z1.im)) {
		this.xorRect(x, y, dxy, dxy, 0, 0, 0, this.alpha);
		this.ver(x, y, dxy, zz.interp(0, 2), zz.interp(1, 3));
		y += dxy;

		this.hor(x, y, dxy, zz.interp(1, 2), zz.interp(2, 3));
		x += dxy;

		y -= dxy;
		this.ver(x, y, dxy, zz.interp(0, 3), zz.interp(1, 4));
	} else {
		y -= dxy;
		this.xorRect(x, y, dxy, dxy, 0, 0, 0, this.alpha);
		this.ver(x, y, dxy, zz.interp(-1, 2), zz.interp(0, 3));

		this.hor(x, y, dxy, zz.interp(-1, 2), zz.interp(0, 3));
		x += dxy;

		this.ver(x, y, dxy, zz.interp(-1, 3), zz.interp(0, 4));
		y += dxy;
	}
	
	this.hor(x, y, dxy, zz.interp(0, 3), zz.interp(1, 4));
	x += dxy;

	this.hor(x, y, dxy, zz.interp(0, 4), zz.interp(1, 5));
}

function ver(x, y, dxy, z0, z1) {
// vertical line starting at (x, y), length dxy.
// z0 and z1 are the corners of the square right the line.
// z2 is the upper left corner of the square left of the line.

	if (dxy <= 1) {
		return;
	}
	
	dxy /= 5;

	this.ver(x, y, dxy, zz.interp(0, 0), zz.interp(1, 1), zz.interp(0, -1), zz.interp(, ));
	y += dxy;

	this.ver(x, y, dxy, zz.interp(1, 0), zz.interp(2, 1), zz.interp(1, -1));
	y += dxy;

	if (flip(z0.re*z0.im*z1.re*z1.im)) {
		this.xorRect(x, y, dxy, dxy, 0, 0, 0, this.alpha);

		this.hor(x, y, dxy, zz.interp(2, 0), zz.interp(3, 1), zz.interp(1, 0));
		x += dxy;

		this.ver(x, y, dxy, zz.interp(2, 1), zz.interp(3, 2), zz.interp(2, 0));
		y += dxy;

		x -= dxy;
		this.hor(x, y, dxy, zz.interp(3, 0), zz.interp(4, 1), zz.interp(2, 0));
	} else {
		x -= dxy;
		this.xorRect(x, y, dxy, dxy, 0, 0, 0, this.alpha);
		this.hor(x, y, dxy, zz.interp(2, -1), zz.interp(3, 0), zz.interp(1, -1));

		this.ver(x, y, dxy, zz.interp(2, -1), zz.interp(3, 0), zz.interp(2, -2));
		y += dxy;

		this.hor(x, y, dxy, zz.interp(3, -1), zz.interp(4, 0), zz.interp(2, -1));
		x += dxy;
	}
	
	this.ver(x, y, dxy, zz.interp(3, 0), zz.interp(4, 1), zz.interp(3, -1));
	y += dxy;

	this.ver(x, y, dxy, zz.interp(4, 0), zz.interp(5, 1), zz.interp(4, -1));
}

function Zinterpolator(z0, z1, z2) {
	this.z0 = z0;
	this.z1 = z1;
	this.z2 = z2;
	console.log(z0, z1, z2);;;
}

Zinterpolator.prototype = {
	constructor: Zinterpolator,
	interp: function(i, j) {
		var im;
		if (i < 0) {
			im = (this.z0.im - this.z2.im) * (5+i) / 5;
		} else {
			im = (this.z1.im - this.z0.im) * i / 5;
		}
		var re;
		if (j < 0) {
			re = (this.z0.re - this.z2.re) * (5+j) / 5;
		} else {
			re = (this.z1.re - this.z0.re) * j / 5;
		}
		return {re: re, im: im};
	}
};

function flip(a) {
	var s = a + '';
	var b = false;
	for (var i=0; i<s.length; ++i) {
		var d = s.charAt(i);
		if (d == '1' || d == '3' || d == '5' || d == '7' || d == '9') {
			b = !b;
		}
	}
	return b;
}
	
function toImg() {
	var canvas = document.createElement('canvas');
	canvas.width = canvas.height = this.side;

	var ctx = canvas.getContext('2d');

	ctx.putImageData(this.imageData, 0, 0);
	var img = new Image();
	img.src = canvas.toDataURL();
	return img;
}