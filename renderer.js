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
	function constructor(selector, layoutEngine) {
		this.selector = selector;
		this.layoutEngine = layoutEngine;
		this.nodes = {};
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
		ret.collapseto = node.collapseto;
		ret.class = cls;
		return ret;
	}

	p.getVertex = function(node1,node2,cls) {
		var ret;
		var id = node1.id + node1.name + "->" + node2.id + node2.name;
		if ( !this.vertices[id] ) {
			this.vertices[id] = {
				id: id
			}
		}
		ret = this.vertices[id];
		if ( cls == 'spouse' ) {
			ret.start = new Tuple(node2.pos.x+node2.size.x/2,node1.spouse_ep.y);
		} else {
			ret.start = node2.pos.plus(node2.size.mult(0.5));
		}
		ret.end = node1[cls+'_ep'];
		if ( !ret.end ) {
			console.log('missing '+cls+'_ep for ',node1);
		}
		ret.collapseto = node1.collapseto;
		if ( node1.spouse_ofs && cls=='child' ) {
			ret.ofs = node1.spouse_ofs;
		} else {
			ret.ofs = 0;
		}
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
				if ( child.parent ) {
					vdata.push( this.getVertex(child.parent,child,'child') );
				} else {
					vdata.push( this.getVertex(cn,child,'child') );
				}
				if ( child.children ) {
					for ( var _grandchild in child.children ) {
						var grandchild = child.children[_grandchild];
						data.push( this.getElement(grandchild,'grandchild') );
						vdata.push( this.getVertex(child,grandchild,'child') );
					}
				}
			}
		}
		if ( cn.parents ) {
			for ( var _parent in cn.parents ) {
				var parent = cn.parents[_parent];
				data.push( this.getElement(parent,'parent') );
				if ( _parent == 0 ) {
					vdata.push( this.getVertex(parent,cn,'child') );
				} else {
					vdata.push( this.getVertex(cn.parents[0],parent,'spouse') );
				}
				if ( parent.parents ) {
					for ( var _grandparent in parent.parents ) {
						var grandparent = parent.parents[_grandparent];
						data.push( this.getElement(grandparent,'grandparent') );
						if ( _grandparent == 0 ) {
							vdata.push( this.getVertex(grandparent,parent,'child') );
						} else {
							vdata.push( this.getVertex(parent.parents[0],grandparent,'spouse') );
						}
					}
				}
			}
		}
		if ( cn.partners ) {
			for ( var _partner in cn.partners ) {
				var partner = cn.partners[_partner];
				data.push( this.getElement(partner,'partner') );
				vdata.push( this.getVertex(partner,cn,'spouse') );
			}
		}
		if ( cn.siblings ) {
			for ( var _sibling in cn.siblings ) {
				var sibling = cn.siblings[_sibling];
				data.push( this.getElement(sibling,'sibling') );
			}
		}

		var that = this;

		// NODES
		var els = d3.select(this.selector+" .nodes").selectAll(".node").data(data, function(d) { return d.id; });
		els.attr('class','node old');
		var new_els = els.enter();
		var old_els = els.exit();
		new_divs = new_els.append('div');
		new_divs.attr('class','node new')
					   .style('opacity',0)
					   .on("click", function(d) { window.location.hash = "#" + d.id; })
					   .style('top',function(d) { return d.collapseto.y; })
		   			   .style('left',function(d) { return d.collapseto.x; })
					   .attr('data-sex', function(d) { return d.sex; })
					   ;
		new_divs.append('span')
			.text(function(d) { return d.name; } )

		var position_nodes = function(sel) {
			sel
				.style('left',function(d) { return d.pos.x; })
				.style('top',function(d) { return d.pos.y; })
				.style('width',function(d) { return d.size.x; })
				.style('height',function(d) { return d.size.y; })
				.style('font-size',function(d) { return d.size.y/2.5; })
				.style('opacity',1)
				.attr('data-role',function(d) { return d.class; })
				;
		}

		position_nodes( els.filter('.node.old')
			.transition('reposition').duration(0).delay(old_els.size() > 0 ? 500 : 0) );
		position_nodes( els.filter('.node.new')
			.transition('new_els').duration(0).delay(old_els.size() > 0 ? 1000 : 500) );

		old_els
			.style('top',function(d) { return d.collapseto.y; })
			.style('left',function(d) { return d.collapseto.x; })
			.style('opacity',0)
			.transition('exit').duration(500)
			.remove()
			;


		els.selectAll("span")
			.style('width',function(d) { return d.size.x; })
			.style('height',function(d) { return d.size.y; })

		// VERTICES
		var vertices = d3.select(this.selector+" .vertices").selectAll(".vertex").data(vdata, function(d) { return d.id; });
		vertices.attr('class','vertex old');
		var new_vxs = vertices.enter();
		var old_vxs = vertices.exit();
		var new_lines = new_vxs.append('path');

		var lineFunction = function(p) {
			var midpoint = (p.start.y + p.end.y) / 2;
			for ( var _m in layoutEngine.midpoints ) {
				var m = layoutEngine.midpoints[_m];
				if ( m > p.start.y && m < p.end.y || m < p.start.y && m > p.end.y) {
					midpoint = m;
					break;
				}
			}
			midpoint += p.ofs;
			return d3.svg.line()
                 		.x(function(d) { return d[0]; })
                 		.y(function(d) { return d[1]; })
                 		.interpolate("linear")
						([ [p.start.x, p.start.y], [p.start.x, midpoint], [p.end.x,midpoint], [p.end.x, p.end.y]]);
		}
		var tl = function(d) { // total length of a path
			if ( isNaN(Math.abs(d.start.x-d.end.x) + Math.abs(d.start.y-d.end.y)) ) {
				console.log('XXX',d);
			}
			return Math.abs(d.start.x-d.end.x) + Math.abs(d.start.y-d.end.y);
		}

		new_lines.attr('class','vertex new')
					   .style('opacity',0)
					   .style('stroke','black')
					   .style('stroke-width',1)
					   .style('fill','none')
					//    .attr('d', function(d) { return lineFunction({start:d.collapseto,end:d.collapseto}); })
					   .attr('d', function(d) { return lineFunction(d); })
					   .attr("stroke-dasharray",  function(d) { return tl(d) + " " + tl(d); })
					   .attr("stroke-dashoffset",  function(d) { return tl(d); })

					//    .attr('x1',function(d) { return d.start.x; })
					   //    .attr('y1',function(d) { return d.start.y; })
					   //    .attr('x2',function(d) { return d.end.x; })
					   //    .attr('y2',function(d) { return d.end.y; });

		old_vxs
			.transition('remove-vertices').duration(500).ease('linear')
			.style('opacity',0)
			.attr("stroke-dashoffset",  function(d) { return tl(d); })
			.remove();

		var position_nodes = function(sel) {
			return sel.style('opacity',1)
			          .attr('d', function(d) { return lineFunction(d); })
					  .attr("stroke-dasharray",  function(d) { return tl(d) + " " + tl(d); })
					  .attr("stroke-dashoffset",  0);

		}

		position_nodes(
			vertices.filter('.vertex.old').transition('reposition-vertices')
					.delay(500)
					.duration(500).ease('linear')
		);

		position_nodes(
			vertices.filter('.vertex.new').transition('reposition-vertices')
					.delay(old_els.size() ? 1000 : 500)
					.duration(500).ease('linear')
		);
	};

	//unleash your class
	return C;
})();
