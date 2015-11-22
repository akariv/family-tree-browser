/**
 * Family tree layout engine
 */
;FTreeOptions = (function(){
	var C = function(){ return constructor.apply(this,arguments); }
	var p = C.prototype;

	//list the attributes
	p.width;
    p.height;
    p.options;

	//construct
    //valid options:
    // - individualSize: (w,h)
    // - parentSize: (w,h)
    // - childSize: (w,h)
    // - partnerSize: (w,h)
    // - siblingSize: (w,h)
    // - parentMargin: (horizontal,bottom)
    // - childMargins: (horizontal,vertical,top)
    // - partnerMargin: (horizontal,vertical,left)
    // - SiblingMargin: (horizontal,vertical,right)
	function constructor(width, height, options){
		this.width = width;
        this.height = height;
        this.options = options;
	}

	//unleash your class
	return C;
})();
