/*
	Piece object: 5^n x 5^n ImageData wrapper
*/

function Piece(p5) {
	this.p5 = p5;
	
	this.pieceSide = Math.pow(5, p5);
	
	// compute padding
	this.padding = 1; 	// extra pixel for outline
	for (var i=0; i<p5; ++i) {
		this.padding += Math.pow(5, i);
	}
	this.wholeSide = this.pieceSide + this.padding * 2;	// padding on both sides 

	this.imageData = new ImageData(this.wholeSide, this.wholeSide);
}

Piece.prototype = {
	constructor: Piece,
	xorRect: xorRect,
	makePiece: makePiece,
	makeTopPiece: makeTopPiece,
	hor: hor,
	ver: ver,
	outline: outline,
	inoutline: inoutline,
	plot: plot,
	get: get,
	hitTest: hitTest,
	toImg: toImg,
	draw: draw
};

function draw(ctx) {
	ctx.save();
	ctx.translate(this.levelData.cx, this.levelData.cy);
//	ctx.rotate(0.2);;;
	ctx.drawImage(this.img, -this.wholeSide/2, -this.wholeSide/2);
	ctx.restore();
}

function xorRect(x, y, w, h, r, g, b, a) {
	var data = this.imageData.data;
	var p = (y * this.wholeSide + x) * 4;
	var q = (this.wholeSide - w) * 4;
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

function makePiece(u, v, du, dv) {
// (u, v) is upper left corner of piece.
// (u+du, v+dv) is lower right corner.
	var s = this.pieceSide;
	this.alpha = 255;
	this.xorRect(this.padding, this.padding, s, s, 0, 0, 0, this.alpha);
	this.hor(this.padding,   this.padding,   s, u,    v,    du, dv);
	this.hor(this.padding,   this.padding+s, s, u,    v+dv, du, dv);
	this.ver(this.padding,   this.padding,   s, u,    v,    du, dv);
	this.ver(this.padding+s, this.padding,   s, u+du, v,    du, dv);
}

function makeTopPiece(u, v, du5, dv5) {
// (u, v) is upper left corner of central 5x5 sub-piece.
// The top piece is 7x7, so we have to adjust outward.
	var du1 = du5 / 5;
	var dv1 = dv5 / 5;
	u -= du1;
	v -= dv1;
	
	var s5 = this.pieceSide;
	var s1 = s5 / 5;
	
	this.alpha = 255;
	this.xorRect(this.padding-s1, this.padding-s1, s5+2*s1, s5+2*s1, 0, 0, 0, this.alpha);

	for (var i=0; i<7; ++i) {
		this.hor(this.padding+(i-1)*s1, this.padding-s1, s1, u+i*du1, v, du1, dv1);
		this.hor(this.padding+(i-1)*s1, this.padding+s5+s1, s1, u+i*du1, v+7*dv1, du1, dv1);
		this.ver(this.padding-s1, this.padding+(i-1)*s1, s1, u, v+i*dv1, du1, dv1);
		this.ver(this.padding+s5+s1, this.padding+(i-1)*s1, s1, u+7*du1, v+i*dv1, du1, dv1);
	}
}

function hor(x, y, d, u, v, du, dv) {
	if (d > 1) {
		d /= 5;
		du /= 5;
		dv /= 5;

		this.hor(x, y, d, u, v, du, dv);
		x += d;
		u += du;

		this.hor(x, y, d, u, v, du, dv);
		x += d;
		u += du;

		if (flip(u*v+(u+du))) {
			this.xorRect(x, y, d, d, 0, 0, 0, this.alpha);
			this.ver(x, y, d, u, v, du, dv);
			y += d;
			v += dv;

			this.hor(x, y, d, u, v, du, dv);
			x += d;
			u += du;

			y -= d;
			v -= dv;
			this.ver(x, y, d, u, v, du, dv);
		} else {
			y -= d;
			this.xorRect(x, y, d, d, 0, 0, 0, this.alpha);
			v -= dv;
			this.ver(x, y, d, u, v, du, dv);

			this.hor(x, y, d, u, v, du, dv);
			x += d;
			u += du;

			this.ver(x, y, d, u, v, du, dv);
			y += d;
			v += dv;
		
		}
		
		this.hor(x, y, d, u, v, du, dv);
		x += d;
		u += du;

		this.hor(x, y, d, u, v, du, dv);
	}
}

function ver(x, y, d, u, v, du, dv) {
	if (d > 1) {
		d /= 5;
		du /= 5;
		dv /= 5;

		this.ver(x, y, d, u, v, du, dv);
		y += d;
		v += dv;

		this.ver(x, y, d, u, v, du, dv);
		y += d;
		v += dv;

		if (flip(u*v+(v+dv))) {
			this.xorRect(x, y, d, d, 0, 0, 0, this.alpha);
			this.hor(x, y, d, u, v, du, dv);
			x += d;
			u += du;

			this.ver(x, y, d, u, v, du, dv);
			y += d;
			v += dv;

			x -= d;
			u -= du;
			this.hor(x, y, d, u, v, du, dv);
		} else {
			x -= d;
			this.xorRect(x, y, d, d, 0, 0, 0, this.alpha);
			u -= du;
			this.hor(x, y, d, u, v, du, dv);

			this.ver(x, y, d, u, v, du, dv);
			y += d;
			v += dv;

			this.hor(x, y, d, u, v, du, dv);
			x += d;
			u += du;
		}
		
		this.ver(x, y, d, u, v, du, dv);
		y += d;
		v += dv;

		this.ver(x, y, d, u, v, du, dv);
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

var dxs = [0, 1, 1, 1, 0, -1, -1, -1];
var dys = [-1, -1, 0, 1, 1, 1, 0, -1];

function outline() {
	return;;;
	var x0 = this.padding;
	var y0 = this.padding - 1;
	var x = x0;
	var y = y0;
	var d = 2;
	do {
		this.plot(x, y, 0, 0, 0, 255);
		if (!blocked.call(this, x, y, d)) {
			x += dxs[(d)&7];
			y += dys[(d)&7];
			d += 2;
		} else {
			d -= 2;
		}
	} while (x != x0 || y != y0);
	
	function blocked(x, y, d) {
		x += dxs[d&7];
		y += dys[d&7];
		var p = (y * this.wholeSide + x) * 4;
		var r = this.imageData.data[p++];
		var g = this.imageData.data[p++];
		var b = this.imageData.data[p++];
		var a = this.imageData.data[p++];
		return (a && (r || g || b));
	}
}

function inoutline() {
	var x0 = this.padding+1;
	var y0 = this.padding;
	var x = x0;
	var y = y0;
	var d = 6;
	do {
		this.plot(x, y, 0, 0, 0, 255);
		if (!!blocked.call(this, x, y, d)) {
			x += dxs[(d)&7];
			y += dys[(d)&7];
			d += 2;
		} else {
			d -= 2;
		}
	} while (x != x0 || y != y0);

	function blocked(x, y, d) {
		x += dxs[d&7];
		y += dys[d&7];
		var p = (y * this.wholeSide + x) * 4;
		var r = this.imageData.data[p++];
		var g = this.imageData.data[p++];
		var b = this.imageData.data[p++];
		var a = this.imageData.data[p++];
		return (a);
	}
}

function plot(x, y, r, g, b, a) {
	var p = (y * this.wholeSide + x) * 4;
	this.imageData.data[p++] = r;
	this.imageData.data[p++] = g;
	this.imageData.data[p++] = b;
	this.imageData.data[p++] = a;
}

function get(x, y) {
	var p = (y * this.wholeSide + x) * 4;
	var r = this.imageData.data[p++];
	var g = this.imageData.data[p++];
	var b = this.imageData.data[p++];
	var a = this.imageData.data[p++];
	return {r: r, g: g, b: b, a: a};
}

function hitTest(x, y) {
// return null if miss, offset x/y if hit.
	var ix = Math.round(x - this.levelData.cx + this.wholeSide / 2);
	var iy = Math.round(y - this.levelData.cy + this.wholeSide / 2);
	if (ix < 0 || ix >= this.wholeSide || iy < 0 || iy >= this.wholeSide) {
		return null;
	}
	if (this.get(ix, iy).a != 0) {
		return {x: this.levelData.cx - x, y: this.levelData.cy - y};
	} else {
		return null;
	}
}

function toImg() {
	var canvas = document.createElement('canvas');
	canvas.width = canvas.height = this.wholeSide;

	var ctx = canvas.getContext('2d');

	ctx.putImageData(this.imageData, 0, 0);
	var img = new Image();
	img.src = canvas.toDataURL();
	this.img = img;
}