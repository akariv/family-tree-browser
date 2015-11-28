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
		this.vertices = {};
	}

	p.getElement = function(node,cls) {
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
		ret.class = cls;
		return ret;
	}

	p.getVertex = function(node1,node2,cls) {
		var ret;
		var id = node1.id + "->" + node2.id;
		if ( !this.vertices[id] ) {
			this.vertices[id] = {
				id: id
			}
		}
		ret = this.vertices[id];
		ret.start = node1.pos.plus(node1.size.mult(0.5));
		ret.end = node2.pos.plus(node2.size.mult(0.5));
		ret.class = cls;
		return ret;
	}

	p.render = function(idx) {
		var cn = this.nodes[idx];
		if ( !cn.pos ) {
			this.layoutEngine.layoutNode(cn);
		}
		data = [];
		vdata = [];
		data.push( this.getElement(cn, 'individual') );
		if ( cn.children ) {
			for ( var _child in cn.children ) {
				var child = cn.children[_child];
				data.push( this.getElement(child,'child') );
				vdata.push( this.getVertex(child,cn,'child') );
				if ( child.children ) {
					for ( var _grandchild in child.children ) {
						var grandchild = child.children[_grandchild];
						data.push( this.getElement(grandchild,'grandchild') );
						vdata.push( this.getVertex(grandchild,child,'child') );
					}
				}
			}
		}
		if ( cn.parents ) {
			for ( var _parent in cn.parents ) {
				var parent = cn.parents[_parent];
				data.push( this.getElement(parent,'parent') );
				vdata.push( this.getVertex(cn,parent,'child') );
				if ( parent.parents ) {
					for ( var _grandparent in parent.parents ) {
						var grandparent = parent.parents[_grandparent];
						data.push( this.getElement(grandparent,'grandparent') );
						vdata.push( this.getVertex(parent,grandparent,'child') );
					}
				}
			}
		}
		if ( cn.partners ) {
			for ( var _partner in cn.partners ) {
				var partner = cn.partners[_partner];
				data.push( this.getElement(partner,'partner') );
				vdata.push( this.getVertex(cn,partner,'spouse') );
			}
		}
		if ( cn.siblings ) {
			for ( var _sibling in cn.siblings ) {
				var sibling = cn.siblings[_sibling];
				data.push( this.getElement(sibling,'sibling') );
			}
		}

		var that = this;

		var els = d3.select(this.selector+" .nodes").selectAll(".node").data(data, function(d) { return d.id; });
		var new_els = els.enter();
		var old_els = els.exit();
		new_divs = new_els.append('div');
		new_divs.attr('class','node')
					   .style('opacity',0)
					   .on("click", function(d) { that.render(d.id); })
					   .transition().duration(1000)
					   .style('opacity',1)
					   .attr('data-sex', function(d) { return d.sex; })
					   ;
		new_divs.append('span')
			.text(function(d) { return d.name; } )


  	    old_els
			.transition().duration(1000)
			.style('opacity',0)
			.remove();

		els.style('left',function(d) { console.log(d); return d.pos.x; })
			.style('top',function(d) { return d.pos.y; })
			.style('width',function(d) { return d.size.x; })
			.style('height',function(d) { return d.size.y; })
			.style('font-size',function(d) { return d.size.y/2.5; })
			.attr('data-role',function(d) { return d.class; })
			;

		els.selectAll("span")
			.style('width',function(d) { return d.size.x; })
			.style('height',function(d) { return d.size.y; })

		var vertices = d3.select(this.selector+" .vertices").selectAll(".vertex").data(vdata, function(d) { return d.id; });
		var new_vxs = vertices.enter();
		var old_vxs = vertices.exit();
		var new_lines = new_vxs.append('line');
		new_lines.attr('class','vertex')
					   .style('opacity',0)
					   .style('stroke','black')
		   			   .style('stroke-width',1)
					   .attr('x1',function(d) { return d.start.x; })
		   			   .attr('y1',function(d) { return d.start.y; })
		   			   .attr('x2',function(d) { return d.end.x; })
		   			   .attr('y2',function(d) { return d.end.y; });

		old_vxs
			.transition().duration(500)
			.style('opacity',0)
			.remove();

		vertices.transition().duration(500)
			.style('opacity',1)
			.attr('x1',function(d) { return d.start.x; })
			.attr('y1',function(d) { return d.start.y; })
			.attr('x2',function(d) { return d.end.x; })
			.attr('y2',function(d) { return d.end.y; })
			;
	};

	//unleash your class
	return C;
})();
