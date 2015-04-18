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
 * DistVis object for HW3 of CS171
 * @param _parentElement -- the HTML or SVG element (D3 node) to which to attach the vis
 * @param _data -- the data array
 * @param _metaData -- the meta-data / data description object
 * @param _eventHandler -- the Eventhandling Object to emit data to (see Task 4)
 * @constructor
 */
DistVis = function(_parentElement, _data, _channel, _eventHandler){
    this.parentElement = _parentElement;
    this.data = _data;
    this.channel = _channel;
    this.eventHandler = _eventHandler;
    this.displayData = [];
    this.bins = 100;
    

    // TODO: define all "constants" here
    this.margin = {top: 20, right: 0, bottom: 100, left: 80},
    this.width = 1000 - this.margin.left - this.margin.right,
    this.height = 200 - this.margin.top - this.margin.bottom;



    this.initVis();
}


/**
 * Method that sets up the SVG and the variables
 */
DistVis.prototype.initVis = function(){

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

    this.y = d3.scale.pow()
        .range([this.height, 0]);

    this.xAxis = d3.svg.axis()
        .scale(this.x)
        .orient("bottom");

    this.yAxis = d3.svg.axis()
        .scale(this.y)
        .orient("left");

    this.area = d3.svg.area()
        .interpolate("monotone")
        .x(function(d) { return that.x(d.x); })
        .y0(this.height)
        .y1(function(d) { return that.y(d.y); });


    this.brush = d3.svg.brush()
        .on("brush", function(){
        // Trigger selectionChanged event. You'd need to account for filtering by time AND type
        e = that.brush.extent();
        $(that.eventHandler).trigger("selectionChanged",e);
        
        });
    
    this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + this.height + ")")

    this.svg.append("g")
        .attr("class", "y axis")
      .append("text")
        .attr("transform", "translate(-10,-10) rotate(0)")
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Counts ("+this.channel+")");

    this.svg.append("g")
        .attr("class","brush");

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
DistVis.prototype.wrangleData= function(){

    // displayData should hold the data which is visualized
    // pretty simple in this case -- no modifications needed
    that = this;

    var data = this.data.map(function(d) {
        return  d[that.channel];
    });

    //set domain for scales

    this.x.domain(d3.extent(data))

    var histogram = d3.layout.histogram()
        .bins(this.x.ticks(that.bins))
        (data);

    this.y.domain(d3.extent(histogram.map(function(d) {return d.y;})));

    this.displayData = histogram;

}



/**
 * the drawing function - should use the D3 selection, enter, exit
 * @param _options -- only needed if different kinds of updates are needed
 */
DistVis.prototype.updateVis = function(){

    // TODO: implement update graphs (D3: update, enter, exit)

    // updates axis
    this.svg.select(".x.axis")
        .call(this.xAxis)
        .selectAll("text")  
        .style("text-anchor", "end")
        .attr("dy", ".35em")
        .attr("transform", "translate(-5,5) rotate(-60)");


    this.svg.select(".y.axis")
        .call(this.yAxis)

    // updates graph
    var path = this.svg.selectAll(".area")
      .data([this.displayData])

    path.enter()
      .append("path")
      .attr("class", "area");

    path
      .transition()
      .attr("d", this.area);

    path.exit()
      .remove();

    this.brush.x(this.x);

    this.svg.select(".brush")
        .call(this.brush)
        .selectAll("rect")
        .attr("height", this.height);

}

/**
 * Gets called by event handler and should create new aggregated data
 * aggregation is done by the function "aggregate(filter)". Filter has to
 * be defined here.
 * @param selection
 */
DistVis.prototype.onSelectionChange= function (selectionStart, selectionEnd){

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





/**
 * creates the y axis slider
 * @param svg -- the svg element
 */
DistVis.prototype.addSlider = function(svg){
    var that = this;

    // TODO: Think of what is domain and what is range for the y axis slider !!
    var sliderScale = d3.scale.linear().domain([0.1,1]).range([0,this.height])

    var sliderDragged = function(){
        var value = Math.max(0, Math.min(200,d3.event.y));

        var sliderValue = sliderScale.invert(value);

        // TODO: do something here to deform the y scale
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





