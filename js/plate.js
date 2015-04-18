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
 * PlateVis object for HW3 of CS171
 * @param _parentElement -- the HTML or SVG element (D3 node) to which to attach the vis
 * @param _data -- the data array
 * @param _metaData -- the meta-data / data description object
 * @param _eventHandler -- the Eventhandling Object to emit data to (see Task 4)
 * @constructor
 */
PlateVis = function(_parentElement, _data, _channel, _eventHandler){
    this.parentElement = _parentElement;
    this.data = _data;
    this.channel = _channel;
    this.eventHandler = _eventHandler;
    this.displayData = [];
    this.alphabetic = "A B C D E F G H I J K L M N O P Q R S T U V W X Y Z".split(" ");
    

    // TODO: define all "constants" here
    this.margin = {top: 20, right: 20, bottom: 20, left: 20},
    this.width = 800 - this.margin.left - this.margin.right,
    this.height = 500 - this.margin.top - this.margin.bottom;

    this.initVis();
}


/**
 * Method that sets up the SVG and the variables
 */
PlateVis.prototype.initVis = function(){

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
        .range([0, this.width]);

    this.y = d3.scale.linear()
        .range([this.height, 0]);

    //set the heatmap range based on category 20c
    this.readout = d3.scale.quantile()
        .range("#3182bd #6baed6 #9ecae1 #c6dbef #fdd0a2 #fdae6b #fd8d3c #e6550d".split(" "));


    //TODO: implement the slider -- see example at http://bl.ocks.org/mbostock/6452972
    //this.addSlider(this.svg)


    // filter, aggregate, modify data
    this.wrangleData();

    // call the update method
    this.updateVis();
}


/**
 * Method to wrangle the data. In this case it takes an options object
  */
PlateVis.prototype.wrangleData= function(){

    // displayData should hold the data which is visualized
    // pretty simple in this case -- no modifications needed
    that = this;

    var data = this.data.map(function(d) {
        return  {"platewell": d.platewell,
                "well":d.well,
                "readout":d[that.channel]};
    });


    //set domain for scales
    var columns = data.map(function(d){ return that.get_column(d.well); });
    
    var wells = data.map(function(d){ return that.get_row(d.well); });

    this.x.domain(d3.extent(columns));

    this.y.domain(d3.extent(wells));

    this.readout.domain(d3.extent(data.map(function(d){ return d.readout; })));

    this.displayData = data;

}



/**
 * the drawing function - should use the D3 selection, enter, exit
 * @param _options -- only needed if different kinds of updates are needed
 */
PlateVis.prototype.updateVis = function(){

    // TODO: implement update graphs (D3: update, enter, exit)

    // updates axis

    //updates graph
    this.well = this.svg.selectAll(".well")
        .data(this.displayData)
        .enter()
        .append("g")
        .attr("class","well")
        .attr("transform",function(d) {
            return "translate ("+ that.x(that.get_column(d.well)) + "," + that.y(that.get_row(d.well)) + ")";
        });

    this.well.append("circle")
        .attr("r", this.height / 40)
        .attr("fill",function(d) {return that.readout(d.readout)});

    this.well.append("text")
        .attr("font-size", this.height/50)
        .attr("x",0)
        .attr("y",4)
        .attr("text-anchor","middle")
        .text(function(d){ return d.readout});

    //this.dots.exit().remove();

}

/**
 * Gets called by event handler and should create new aggregated data
 * aggregation is done by the function "aggregate(filter)". Filter has to
 * be defined here.
 * @param selection
 */
PlateVis.prototype.onSelectionChange= function (selectionStart, selectionEnd){

    // TODO: call wrangle function

    // do nothing -- no update when brushing

}


/*
 *
 * ==================================
 * From here on only HELPER functions
 * ==================================
 *
 * */



//well will be like this A01 A02 A03 A04 ... B01 B02 B03 B04
PlateVis.prototype.get_row = function(well) {



    return  this.alphabetic.indexOf(well.substr(0,1)) + 1;

}

PlateVis.prototype.get_column = function(well) {

    return parseInt(well.substr(1));

}
    


/**
 * creates the y axis slider
 * @param svg -- the svg element
 */
PlateVis.prototype.addSlider = function(svg){
    var that = this;

    // TODO: Think of what is domain and what is range for the y axis slider !!
    var sliderScale = d3.scale.linear().domain([0.1,1]).range([0,this.height])

    var sliderDragged = function(){
        var value = Math.max(0, Math.min(200,d3.event.y));

        var sliderValue = sliderScale.invert(value);

        // TODO: do something here to deform the y scale
        //console.log("Y Axis Slider value: ", sliderValue);
        that.y.exponent(sliderValue);

        d3.select(this)
            .attr("y", function () {
                return sliderScale(sliderValue);
            })

        that.updateVis({});
    }
    var sliderDragBehaviour = d3.behavior.drag()
        .on("drag", sliderDragged)

    var sliderGroup = svg.append("g").attr({
        class:"sliderGroup",
        "transform":"translate(-70,30)"
    })

    sliderGroup.append("rect").attr({
        class:"sliderBg",
        x:5,
        width:10,
        height:200
    }).style({
        fill:"lightgray"
    })

    sliderGroup.append("rect").attr({
        "class":"sliderHandle",
        y:200,
        width:20,
        height:10,
        rx:2,
        ry:2
    }).style({
        fill:"#333333"
    }).call(sliderDragBehaviour)


}






