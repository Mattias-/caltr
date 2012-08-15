var caltr = caltr || {};
caltr.core = {

init: function() {
    var mapOptions = {
      zoom: 12,
      center: new google.maps.LatLng(37.7761, -122.406),
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    //maybe not in caltr.config
   caltr.config.map = new google.maps.Map(caltr.config.mapCanvas, mapOptions);
},
createDateObjects: function(trains){
  console.time('createDateObjects');
  $.each(trains, function(i, train){
    $.each(train.stops, function(j, stop){
      stop.dateObj = new Date(stop.time);
    });
  });
  console.timeEnd('createDateObjects');       
},

createWpObjects: function(wps){
    var that = this;
    $.each(wps, function(i, wp){
      wp.latLng = new google.maps.LatLng(wp.lat, wp.lng);
      if(i == 0){
        wp.distToPrev = 0;
      } else {
        wp.distToPrev = that.getDistBetweenWps(wps[i-1], wp);
      } 
    });
},

getNewTrains: function(trainTuples, oldTrains, time){
    var res = [];
    trainTuples.forEach(function(tup){
    var r = tup.trainTimes.filter(function(train){
     if(oldTrains.indexOf(train) != -1){
        return false;
     }
     var first = train.stops[0].dateObj;
     var last = train.stops[train.stops.length-1].dateObj;
     return time.between(first, last);
   });
    res = res.concat(r);
   });
   return res;
},

getWpsBetweenStops: function(wps, wpsStopMap, from, to){
var slice = wps.slice(wpsStopMap[from], wpsStopMap[to]+1);
if(slice.length == 0){
    console.error(wps, slice, from, to);
}
return slice;
},

getDistBetweenWps: function(wp1, wp2){
var p1 = wp1.latLng;
var p2 = wp2.latLng;
return google.maps.geometry.spherical.computeDistanceBetween(p1, p2); 
},

getDistOfWpsList: function (wps){
var totLen = 0;
for (var i = 1, len = wps.length; i < len; i++) {
  totLen += wps[i].distToPrev;
}
return totLen;
},

getPoint: function (wps, frac){
var totDist = this.getDistOfWpsList(wps);
for (var i = 1, len = wps.length; i < len; i++) {
  var startDist = this.getDistOfWpsList(wps.slice(0,i+1));// +1 to incl. elem. i
  if(frac < startDist/totDist){
    var fracDist = frac * totDist;
    //var subDist = getDistOfWpsList(wps.slice(0,i));
    var subDist = startDist - wps[i].distToPrev; //reuse of startDist
    var newDist = fracDist - subDist;
    var thisDist = wps[i].distToPrev;
    var newFrac = newDist / thisDist;
    var p1 = wps[i-1].latLng;
    var p2 = wps[i].latLng;
    return google.maps.geometry.spherical.interpolate(p1, p2, newFrac);
  }
}
console.error('could not find point with frac', wps, startDist/totDist);
}

};

caltr.ActiveTrain = function(data){
  this.stops = data.trainTimes.stops;
  this.number = data.trainTimes.number;
  this.waypoints = data.waypoints.waypoints;
  this.wpsStopMap = data.waypoints.stopIndex; 
  this.lastStopIndex = this.getLastStopIndex(); 
  this.timeBetweenStops = this.getTimeBetweenStops();
  this.lastStopName = this.stops[this.lastStopIndex].name;
  this.nextStopName = this.stops[this.lastStopIndex+1].name;
  this.marker = new google.maps.Marker({map: caltr.config.map});
  this.infowindow = new google.maps.InfoWindow();
  var that = this;
  google.maps.event.addListener(this.marker, 'click', function() {
      that.infowindow.open(caltr.config.map, that.marker);
  });
}

caltr.ActiveTrain.prototype.getLastStopIndex = function(){
  for(var i = 0; i < this.stops.length-1; i++){
    var now = caltr.utils.fakeNow(); //TODO 
    if(now.between(this.stops[i].dateObj, this.stops[i+1].dateObj)){
      return i;
    }
  }
  console.error('Not an active train!');
  return -1; 
}

caltr.ActiveTrain.prototype.getTimeBetweenStops = function(){
    var last = this.stops[this.lastStopIndex].dateObj;
    var next = this.stops[this.lastStopIndex+1].dateObj;//TODO try if last
    return caltr.utils.dateDiff(next, last, 'seconds', true);
}

caltr.ActiveTrain.prototype.getTimeToNext = function(){
    try {
      var next = this.stops[this.lastStopIndex+1].dateObj;
    } catch (error) {
        console.error(error);
        return 0;
    }
    var now = caltr.utils.fakeNow(); //TODO 
    return caltr.utils.dateDiff(next, now, 'seconds', true);
}

caltr.ActiveTrain.prototype.run = function(){
    var that = this;
    this.runner = setInterval(function(){that.tic();}, caltr.config.updateRate);
}

caltr.ActiveTrain.prototype.tic = function(){
    var timeToNext = this.getTimeToNext();
    var frac = timeToNext / this.timeBetweenStops;
    var fracTravelled = 1 - frac;
    if(fracTravelled >= 1.0){
        this.atStop();
    } else {
      var wps = caltr.core.getWpsBetweenStops(this.waypoints, this.wpsStopMap,
                                            this.lastStopName, this.nextStopName);
      var pos = caltr.core.getPoint(wps, frac);
      this.marker.setPosition(pos);
    }
}
caltr.ActiveTrain.prototype.atStop = function(){
    var now = caltr.utils.fakeNow(); //TODO 
    console.log(this, 'at stop', this.nextStopName, now);
    clearInterval(this.runner);
    this.lastStopIndex++;
    if(this.lastStopIndex+1 >= this.stops.length){
        this.marker.setVisible(false);
        this.infowindow.close()
        //activeTrains.splice(activeTrains.indexOf(this), 1); //remove obj from list
        //might be on to something here..
        delete this;
        return
    }
    //set pos, data, etc.    
    this.lastStopName = this.nextStopName;
    this.nextStopName = this.stops[this.lastStopIndex+1].name;
    
    this.content = 'Train ' + this.number + ', next: ' + this.nextStopName;
    this.marker.setTitle(this.content);
    this.infowindow.setContent('<p>' + this.content + '</p>');
    
    this.timeBetweenStops = this.getTimeBetweenStops();
    var that = this;
    setTimeout(function(){that.run()}, caltr.config.stoptime);
}

caltr.utils = {
    dateDiff: function(date1, date2, measurement, floatResult){
      var result = moment(date1).diff(moment(date2), measurement, floatResult);
      return result
    },
    startDate : moment(Date.now()),
    realTime : moment(),
    fakeNow : function(){
      var d = moment().diff(this.realTime, 'milliseconds', false);
      var res = this.startDate.clone().add('milliseconds', d);
      return res.toDate();
    }

}

caltr.config = {
    stoptime: 3 * 1000, //in ms
    updateRate: 1000
}
