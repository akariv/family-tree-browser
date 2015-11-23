/**
 * Family tree layout engine
 */
;FTreeRenderer = (function(){
	var C = function(){ return constructor.apply(this,arguments); }
	var p = C.prototype;

	//list the attributes
	p.nodes;
	p.layoutEngine;

	//construct
	function constructor(selector, nodes, layoutEngine) {
		this.selector = selector;
		this.nodes = nodes;
		this.layoutEngine = layoutEngine;

		this.elements = {};
	}

	p.getElement = function(node) {
		var ret;
		var id = node.id;
		if ( !this.elements[id] ) {
			this.elements[id] = {
				id: id,
				sex: node.sex,
				name: node.name
			}
		}
		ret = this.elements[id];
		ret.size = node.size;
		ret.pos = node.pos;
		return ret;
	}

	p.render = function(idx) {
		var cn = this.nodes[idx];
		if ( !cn.pos ) {
			this.layoutEngine.layoutNode(cn);
		}
		data = [];
		data.push( this.getElement(cn) );
		if ( cn.children ) {
			for ( var _child in cn.children ) {
				var child = cn.children[_child];
				data.push( this.getElement(child) );
			}
		}
		if ( cn.parents ) {
			for ( var _parent in cn.parents ) {
				var parent = cn.parents[_parent];
				data.push( this.getElement(parent) );
			}
		}
		if ( cn.partners ) {
			for ( var _partner in cn.partners ) {
				var partner = cn.partners[_partner];
				data.push( this.getElement(partner) );
			}
		}
		if ( cn.siblings ) {
			for ( var _sibling in cn.siblings ) {
				var sibling = cn.siblings[_sibling];
				data.push( this.getElement(sibling) );
			}
		}

		var els = d3.select(this.selector).selectAll(".node").data(data, function(d) { return d.id; });
		var new_els = els.enter();
		var old_els = els.exit();
		var that = this;
		new_els = new_els.append('div')
					   .attr('class','node')
					   .text(function(d) { return d.name; } )
					   .style('opacity',0)
					   .on("click", function(d) { that.render(d.id); })
					   .transition().duration(1000)
					   .style('opacity',1)

  	    old_els
			.transition().duration(1000)
			.style('opacity',0)
			.remove();

		els.style('left',function(d) { console.log(d); return d.pos.x; })
			.style('top',function(d) { return d.pos.y; })
			.style('width',function(d) { return d.size.x; })
			.style('height',function(d) { return d.size.y; })
			.style('font-size',function(d) { return d.size.y/2; })
			;

	};


	//unleash your class
	return C;
})();
