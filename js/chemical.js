/**
 * Created by Hendrik Strobelt (hendrik.strobelt.com) on 1/28/15.
 */


/*
 *
 * ======================================================
 * We follow the vis template of init - wrangle - update
 * ======================================================
 *
 * */

/**
 * ChemicalVis object for final project of CS171
 * @param _parentElement -- the HTML or SVG element (D3 node) to which to attach the vis
 * @param _data -- the data array
 * @param _metaData -- the meta-data / data description object
 * @param _eventHandler -- the Eventhandling Object to emit data to (see Task 4)
 * @constructor
 */

ChemicalVis = function(_parentElement, _data, _eventHandler){
    this.parentElement = _parentElement;
    this.data = _data;
    this.selection = [];
    this.eventHandler = _eventHandler;
    this.displayData = [];

    this.box = {width:125,height:200};

    // TODO: define all "constants" here
    this.margin = {top: 20, right: 20, bottom: 20, left: 20},
    this.width = 800 - this.margin.left - this.margin.right,
    this.height = 500 - this.margin.top - this.margin.bottom;


    this.initVis();
}


/**
 * Method that sets up the SVG and the variables
 */
ChemicalVis.prototype.initVis = function(){

    var that = this; // read about the this

    //TODO: implement here all things that don't change
    //TODO: implement here all things that need an initial status
    // Examples are:
    // - construct SVG layout
    // - create axis
    // -  implement brushing !!
    // --- ONLY FOR BONUS ---  implement zooming

    // TODO: modify this to append an svg element, not modify the current placeholder SVG element
    this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");


    // creates axis and scales
    this.x = d3.scale.linear()
        .domain([0, 5])
        .range([0, this.width]);

    this.y = d3.scale.linear()
        .domain([0, 2])
        .range([0, this.height]);

    // filter, aggregate, modify data
    this.wrangleData();

    // call the update method
    this.updateVis();
}


/**
 * Method to wrangle the data. In this case it takes an options object
  */
ChemicalVis.prototype.wrangleData= function(){

    // displayData should hold the data which is visualized
    // pretty simple in this case -- no modifications needed
    // A certain propety will be used here. As an example we use fpA
    that = this;

    //select molecules in selection
    var filtered = this.data.filter(function(d) {return d.svg && (that.selection.indexOf(d.platewell) > -1) ;});

    this.displayData = filtered;

}



/**
 * the drawing function - should use the D3 selection, enter, exit
 * @param _options -- only needed if different kinds of updates are needed
 */
ChemicalVis.prototype.updateVis = function(){

    // TODO: implement update graphs (D3: update, enter, exit)

    //add symbols (svg reference)
    this.symbol = this.svg
        .append("g")
        .attr("class", "symbol")
        .html(this.displayData.map(function(d) {return d.svg;}).join());

    this.svg.selectAll(".chemical").remove();

    this.chemical = this.svg.selectAll(".chemical")
        .data(this.displayData)
        .enter()
        .append("g")
        .attr("class", "chemical")
        .attr("transform",function(d, i){ 
            return "translate("+ that.x(i % 5) +","+  that.y(Math.floor(i/5))  +")";
        })
        .on("click",function(d){
            $(that.eventHandler).trigger("select",d.platewell);
        });
    
    this.chemical.append("rect")
        .attr("x",5)
        .attr("y",5)
        .attr("width",this.box.width)
        .attr("height",this.box.height)
        .attr("style","fill:grey");


    this.chemical.append("rect")
        .attr("width",this.box.width)
        .attr("height",this.box.height*0.75)
        .attr("style","fill:white;stroke:black;");

    this.chemical.append("use")
      .attr("xlink:href", function(d) {return "#sym"+d.platewell; })
      .attr("width", this.box.width)
      .attr("height", this.box.height*0.75);



    this.chemical.append("rect")
        .attr("width",this.box.width)
        .attr("height",this.box.height*0.25)
        .attr("y",this.box.height*0.75)
        .attr("style","fill:white;stroke:black;")

    this.chemical.append("text")
        .attr("y",this.box.height*0.75+20)
        .attr("x",10)
        .attr("anchor","left")
        .text(function(d) {return "logP: "+d.logp;})
}

/**
 * Gets called by event handler and should create new aggregated data
 * aggregation is done by the function "aggregate(filter)". Filter has to
 * be defined here.
 * @param selection
 */
ChemicalVis.prototype.onChemSelectionChange= function (_selection){

    // TODO: call wrangle function
    this.selection=_selection;

    this.wrangleData();

    this.updateVis();

    // do nothing -- no update when brushing

}

ChemicalVis.prototype.onPlateChange= function (d){


    // TODO: call wrangle function
    this.data = d;

    this.wrangleData();

    this.updateVis();
    // do nothing -- no update when brushing
}

/*
 *
 * ==================================
 * From here on only HELPER functions
 * ==================================
 *
 * */

ChemicalVis.prototype.collide =  function(node) {
  var r = node.radius + 16,
      nx1 = node.x - r,
      nx2 = node.x + r,
      ny1 = node.y - r,
      ny2 = node.y + r;
  return function(quad, x1, y1, x2, y2) {
    if (quad.point && (quad.point !== node)) {
      var x = node.x - quad.point.x,
          y = node.y - quad.point.y,
          l = Math.sqrt(x * x + y * y),
          r = node.radius + quad.point.radius;
      if (l < r) {
        l = (l - r) / l * .5;
        node.x -= x *= l;
        node.y -= y *= l;
        quad.point.x += x;
        quad.point.y += y;
      }
    }
    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
  };
}








