/**
 * Family tree layout engine
 */
;FTreeLayouter = (function(){
	var C = function(){ return constructor.apply(this,arguments); }
	var p = C.prototype;

	//list the attributes
	p.width = 600;
    p.height = 600;

	//construct
    //valid options:
    // - individual width
    // - individual height
    // - parent width
    // - parent height
    // - parent width
    // - parent height
	function constructor(width, height, options){
		this.width = width;
        this.height = height;
	}

	//define methods
	p.layoutNode = function(node){
		canter =
	}

	//unleash your class
	return C;
})();
