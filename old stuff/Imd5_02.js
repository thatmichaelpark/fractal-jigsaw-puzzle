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
this.nnn = 5;
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

function makePiece(z0, z1) {
// z0 is upper left corner in complex plane.
// z1 is lower right corner in complex plane.
	var s = Math.pow(5, this.p5);
	this.alpha = 48;
	this.xorRect(this.padding, this.padding, s, s, 0, 0, 0, this.alpha);

	this.hor(this.padding, this.padding, s, z0, z1);
	this.hor(this.padding, this.padding+s, s, z0, zinterp(z0, z1, 10, 0));
	this.ver(this.padding, this.padding, s, z0, z1);
	this.ver(this.padding+s, this.padding, s, z1, zinterp(z0, z1, 0, 10));
}

function hor(x, y, dxy, z0, z1) {
if(dxy == 125){
	console.log(x, y, z0, z1);;;
}
	if (dxy > 1) {
		dxy /= 5;
		
		this.hor(x, y, dxy, zinterp(z0, z1, 0, 0), zinterp(z0, z1, 1, 1));
		x += dxy;

		this.hor(x, y, dxy, zinterp(z0, z1, 0, 1), zinterp(z0, z1, 1, 2));
		x += dxy;

		if (flip(z0.re*z0.im*z1.re*z1.im)) {
			this.xorRect(x, y, dxy, dxy, 0, 0, 0, this.alpha);
			this.ver(x, y, dxy, zinterp(z0, z1, 0, 2), zinterp(z0, z1, 1, 3));
			y += dxy;

			this.hor(x, y, dxy, zinterp(z0, z1, 1, 2), zinterp(z0, z1, 2, 3));
			x += dxy;

			y -= dxy;
			this.ver(x, y, dxy, zinterp(z0, z1, 0, 3), zinterp(z0, z1, 1, 4));
		} else {
			y -= dxy;
			this.xorRect(x, y, dxy, dxy, 0, 0, 0, this.alpha);
			this.ver(x, y, dxy, zinterp(z0, z1, -1, 2), zinterp(z0, z1, 0, 3));

			this.hor(x, y, dxy, zinterp(z0, z1, -1, 2), zinterp(z0, z1, 0, 3));
			x += dxy;

			this.ver(x, y, dxy, zinterp(z0, z1, -1, 3), zinterp(z0, z1, 0, 4));
			y += dxy;
		}
		
		this.hor(x, y, dxy, zinterp(z0, z1, 0, 3), zinterp(z0, z1, 1, 4));
		x += dxy;

		this.hor(x, y, dxy, zinterp(z0, z1, 0, 4), zinterp(z0, z1, 1, 5));
	}
}

function ver(x, y, dxy, z0, z1) {
	if (dxy > 1) {
		dxy /= 5;

		this.ver(x, y, dxy, zinterp(z0, z1, 0, 0), zinterp(z0, z1, 1, 1));
		y += dxy;

		this.ver(x, y, dxy, zinterp(z0, z1, 1, 0), zinterp(z0, z1, 2, 1));
		y += dxy;

		if (flip(z0.re*z0.im*z1.re*z1.im)) {
			this.xorRect(x, y, dxy, dxy, 0, 0, 0, this.alpha);

			this.hor(x, y, dxy, zinterp(z0, z1, 2, 0), zinterp(z0, z1, 3, 1));
			x += dxy;

			this.ver(x, y, dxy, zinterp(z0, z1, 2, 1), zinterp(z0, z1, 3, 2));
			y += dxy;

			x -= dxy;
			this.hor(x, y, dxy, zinterp(z0, z1, 3, 0), zinterp(z0, z1, 4, 1));
		} else {
			x -= dxy;
			this.xorRect(x, y, dxy, dxy, 0, 0, 0, this.alpha);
			this.hor(x, y, dxy, zinterp(z0, z1, 2, -1), zinterp(z0, z1, 3, 0));

			this.ver(x, y, dxy, zinterp(z0, z1, 2, -1), zinterp(z0, z1, 3, 0));
			y += dxy;

			this.hor(x, y, dxy, zinterp(z0, z1, 3, -1), zinterp(z0, z1, 4, 0));
			x += dxy;
		}
		
		this.ver(x, y, dxy, zinterp(z0, z1, 3, 0), zinterp(z0, z1, 4, 1));
		y += dxy;

		this.ver(x, y, dxy, zinterp(z0, z1, 4, 0), zinterp(z0, z1, 5, 1));
	}
}

function zinterp(z0, z1, i, j) {
	return {
		re: z0.re + (z1.re - z0.re) * j / 5,
		im: z0.im + (z1.im - z0.im) * i / 5
	}
}

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