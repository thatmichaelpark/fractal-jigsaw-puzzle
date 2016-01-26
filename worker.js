
onmessage = function(event) {
	var data = event.data.data;
	var re = event.data.re;
	var im = event.data.im;
	var dre = event.data.dre;
	var dim = event.data.dim;
	var w = event.data.w;
	var h = event.data.h;
	set(re, im, dre, dim, data, w, h);
	postMessage({progress: 100, data: data});
};

var limit = 1023;
	var paletteSize = 1400;
	var palette = [];
	MakePalette(palette);
	
	function MakePalette(palette) {
		for (var i=0; i<paletteSize; ++i) {
			palette.push(blah(i));
		}
	
		function blah(i) {
			var s = paletteSize / 7;
			var f = (i % s) / s;
			var k = Math.floor(i / s) + 1;
			var c = Math.floor(f * 255);
			var r = k & 1 ? c : 0;
			var g = k & 2 ? c : 0;
			var b = k & 4 ? c : 0;
			return {r:r, g:g, b:b};
		}
	}

	function set(re0, im0, dre, dim, data, w, h) {
		dre /= w;
		dim /= h;
		var k = 0;
		var im = im0;
		for (var i=0; i<h; ++i) {
			if (i % 10 == 0) {
//				postMessage({progress:i/h*100});
			}
			var re = re0;
			for (var j=0; j<w; ++j) {
				if (data[k+3]) {
					var n = bbm(re, im);
					var p = palette[n % paletteSize];
					data[k++] = p.r;
					data[k++] = p.g;
					data[k++] = p.b;
					data[k++] = 255;
				} else {
					k += 4;
				}
				re += dre;
			}
			im += dim;
		}
	}
	
	function bbm(x, y) {
	
		function add(a, b) {
			return {re: a.re + b.re, im: a.im + b.im};
		}
		function mul(a, b) {
			return {re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re};
		}
		
		var c = { re: x, im: y };
		var z = { re: 0, im: 0 };
		var n = 0;
		do {
			++n;
			z = add(mul(z, z), c);
		} while (n < limit && z.re * z.re + z.im * z.im <= 4);
		return n;// < $scope.limit ? n : 0;
	}
	