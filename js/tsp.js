/**
 * Created by Chenguang He (readman@iastate.edu)on 3/20/16.
 *
 */

//---------------------------------------------------------------Class Part---------------------------------------------------------------//

/**
 * build city class
 * @param x x-coordinate
 * @param y y-coordinate
 * @param update update times
 * @param visit visit times
 */
var City = function (x, y, update, visit) {
    this.x = x;
    this.y = y;
    this.update = update;
    this.visit = visit;
}
/**
 * build Neuron class
 * @param s_x the start  of x (this is a constant and 'final')
 * @param s_y  the start  of y (this is a constant and 'final')
 * @param w_x the weighted x
 * @param w_y the weighted y
 * @param update update times
 * @param visit visit times
 * @constructor
 */
var Neuron = function (s_x, s_y, w_x, w_y, update, visit) {
    this.s_x = s_x;
    this.s_y = s_y;
    this.w_x = w_x;
    this.w_y = w_y;
    this.update = update;
    this.visit = visit;
}
Neuron.prototype.distanceTo = function (c) {
    var d_x = this.s_x - c.s_x;
    var d_y = this.s_y - c.s_y;
    return Math.sqrt(d_x * d_x, d_y * d_y);
}
//---------------------------------------------------------------Graph Part---------------------------------------------------------------//

var s,
    g = {
        nodes: [],
        edges: []
    };

//---------------------------------------------------------------Algorithm Part---------------------------------------------------------------//
var s;
var numOfCity;
var numOfNeuron;
var theta;
var phi;
var momentum;
var citys;
var decay;
var groupNeuron;

function kohonenInit() {
    //---------------------------------------------------------------Init Parameters---------------------------------------------------------------//
    numOfCity = parseInt($('#city').val());
    numOfNeuron = numOfCity * 2
    theta = parseFloat($('#theta').val());
    phi = parseFloat($('#phi').val());
    momentum = parseFloat($('#momentum').val());
    citys = new Array();
    decay = (function (decay) {
        while (decay.push([]) < numOfNeuron);
        return decay
    })([]);
    groupNeuron = new Array();
    for (i = 0; i < numOfCity; i++) {
        citys[i] = new City(Math.random(), Math.random(), 0, 0);
    }
    var angle = 0.0;
    for (i = 0; i < numOfNeuron; i++) {
        groupNeuron[i] = new Neuron(0.5 + 0.5 * Math.cos(angle), 0.5 + 0.5 * Math.sin(angle), Math.random(), Math.random());
        angle += Math.PI * 2.0 / numOfNeuron;
    }
    calculateDecay(theta);
//---------------------------------------------------------------Init Draw Part---------------------------------------------------------------//
    g.edges =[];
    g.nodes =[];
    // draw citys
    for (i = 0; i < numOfCity; i++) {
        g.nodes.push({
            id: 'c' + i,
            label: 'city ' + i,
            x: citys[i].x,
            y: citys[i].y,
            size: 3,
            color: '#FF0000'
        });
    }
    //draw neuron
    for (i = 0; i < numOfNeuron; i++) {
        g.nodes.push({
            id: 'n' + i,
            label: 'neuron ' + i,
            x: groupNeuron[i].w_x,
            y: groupNeuron[i].w_y,
            size: 1.5,
            color: '#0080ff'
        });
    }
    //draw edge
    var r = [];
    for(i = 0 ; i < g.nodes.length; i++){
        if(g.nodes[i].id.indexOf('c') == -1)
            r.push(g.nodes[i]);
    }
    var modifedNode =modifedNodes(r);
    for (i = 0; i < modifedNode.length; i++) {
        g.edges.push({
            id: 'e' + i,
            source: modifedNode[i].id,
            target: modifedNode[(i + 1) % numOfNeuron].id
        });
    }
    // Instantiate sigma:
    if (!s) {
        s = new sigma({
            graph: g,
            container: 'graph-container',

        });
        s.settings({
            autoRescale: true,
            mouseEnabled: true,
            enableEdgeHovering: false,
            labelThreshold: 0,
            edgeColor: 'default',
            rescaleIgnoreSize: true,
            animationsTime: 1000
        });
        s.refresh();
    }else {
        s.kill();
        s = null;
        s = new sigma({
            graph: g,
            container: 'graph-container',

        });
        s.settings({
            autoRescale: true,
            mouseEnabled: true,
            enableEdgeHovering: false,
            labelThreshold: 0,
            edgeColor: 'default',
            rescaleIgnoreSize: true,
            animationsTime: 1000
        });
        s.resetZoom()
        s.refresh();
    }
}
function calculateDecay(theta) {
    for (i = 0; i < numOfNeuron; i++) {
        decay[i][i] = 1.0;
        for (j = i + 1; j < numOfNeuron; j++) {
            decay[i][j] = Math.exp(-1.0 * (groupNeuron[i].distanceTo(groupNeuron[j]) * groupNeuron[i].distanceTo(groupNeuron[j])) / (2.0 * theta * theta));
            decay[j][i] = decay[i][j];
        }
    }
}

function kohonenNet() {

    //reset color

    //update node
    for (i = 0; i < numOfCity + numOfNeuron; i++) {
        if (g.nodes[i].id.indexOf('n') != -1) {
            // update active neuron
            g.nodes[i].color = '#0080ff';
        }

        //update active city
        if (g.nodes[i].id.indexOf('c') != -1) {
            // update active neuron
            g.nodes[i].color = '#FF0000';
        }
    }
    // update edge
    var cur_nodes = s.graph.nodes();//store current nodes
    var r = [];
    s.graph.clear();
    for(i = 0 ; i < cur_nodes.length; i++){
        if(cur_nodes[i].id.indexOf('c') == -1)
            r.push(g.nodes[i]);
        s.graph.addNode(cur_nodes[i]);
    }
    var modifedNode =modifedNodes(r);
    for (i = 0; i < modifedNode.length; i++) {
        s.graph.addEdge({
            id: 'e' + i,
            source: modifedNode[i].id,
            target: modifedNode[(i + 1) % numOfNeuron].id
        });
    }
    var error = 0.01 // target city should have an distance error to get accept faster
    var city_index, j = -1, min, city_x, city_y;
    city_index = (Math.random() * numOfCity) | 0;
    city_x = citys[city_index].x + (Math.random() * error) - (error / 2.0);
    city_y = citys[city_index].y + (Math.random() * error) - (error / 2.0);
    citys[city_index].visit++;

    min = Number.MAX_SAFE_INTEGER;
    for (i = 0; i < numOfNeuron; i++) {
        var d = (city_x - groupNeuron[i].w_x) * (city_x - groupNeuron[i].w_x) + (city_y - groupNeuron[i].w_y) * (city_y - groupNeuron[i].w_y);
        if (d < min) {
            min = d;
            j = i;
        }
    }

    groupNeuron[j].update++;
    for (i = 0; i < numOfNeuron; i++) {
        groupNeuron[i].w_x += (phi * decay[i][j] * (city_x - groupNeuron[i].w_x));
        groupNeuron[i].w_y += (phi * decay[i][j] * (city_y - groupNeuron[i].w_y));
    }
    phi *= momentum;
    theta *= momentum;
    calculateDecay(theta)
//---------------------------------------------------------------Draw Part---------------------------------------------------------------//

    //update node
    for (i = 0; i < numOfCity + numOfNeuron; i++) {
        if (g.nodes[i].id.indexOf('n') != -1) {
            // update active neuron
            if (parseInt(g.nodes[i].id.substring(1)) == j) {
                g.nodes[i].color = '#800080';
            }

            g.nodes[i].x = groupNeuron[g.nodes[i].id.substring(1)].w_x;
            g.nodes[i].y = groupNeuron[g.nodes[i].id.substring(1)].w_y;
        }

        //update active city
        if (g.nodes[i].id.indexOf('c') != -1) {
            // update active neuron
            if (parseInt(g.nodes[i].id.substring(1)) == city_index) {
                g.nodes[i].color = '#800080';
            }
        }
    }
    s.refresh();
}
var process;
var start = function () {
    kohonenInit();
    var freshRate = parseInt($('#rate').val());
    process=setInterval(kohonenNet, freshRate);
}

var reset = function () {
    clearInterval(process);
    s.graph.clear();
    s.refresh();
    $('#rate').val('100');
    $('#city').val('5');
    $('#momentum').val('0.995');
    $('#phi').val('0.5');
    $('#theta').val('0.5');
}

$( "#start" ).click(function() {
    start();
});
$( "#step" ).click(function() {
    clearInterval(process);
    kohonenNet();
});
$( "#stop" ).click(function() {
    clearInterval(process);
});
$( "#reset" ).click(function() {
    reset();
});
sigma.prototype.resetZoom = function(camera){
    if(typeof camera == "undefined"){
        camera = this.cameras[0];
    }
    camera.ratio = 1;
    camera.x = 0;
    camera.y = 0;
    this.refresh();
}

// below method find in stackoverflow
var modifedNodes = function(points) {
    var upper = upperLeft(points);

    function upperLeft(points) {
        var top = points[0];
        for (var i = 1; i < points.length; i++) {
            var temp = points[i];
            if (temp.y > top.y || (temp.y == top.y && temp.x < top.x)) {
                top = temp;
            }
        }
        return top;
    }
    var slope=function(p1,p2) {
        var dX = p1.x - p2.x;
        var dY = p1.y - p2.y;
        return dY / dX;
    }
    var distance=function(that) {
        var dX = that.x - this.x;
        var dY = that.y - this.y;
        return Math.sqrt((dX*dX) + (dY*dY));
    }
    function pointSort(p1, p2) {
        // Exclude the 'upper' point from the sort (which should come first).
        if (p1 == upper) return -1;
        if (p2 == upper) return 1;

        // Find the slopes of 'p1' and 'p2' when a line is
        // drawn from those points through the 'upper' point.
        var m1 = slope(upper,p1);
        var m2 = slope(upper,p2);

        // 'p1' and 'p2' are on the same line towards 'upper'.
        if (m1 == m2) {
            // The point closest to 'upper' will come first.
            return distance(p1,upper) < distance(p2,upper) ? -1 : 1;
        }

        // If 'p1' is to the right of 'upper' and 'p2' is the the left.
        if (m1 <= 0 && m2 > 0) return -1;

        // If 'p1' is to the left of 'upper' and 'p2' is the the right.
        if (m1 > 0 && m2 <= 0) return 1;

        // It seems that both slopes are either positive, or negative.
        return m1 > m2 ? -1 : 1;
    }
    return points.sort(pointSort);
}


