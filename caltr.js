function createDateObjects(trains){
  console.time('createDateObjects');
  $.each(trains, function(i, train){
    $.each(train.stops, function(j, stop){
      stop.dateObj = new Date(stop.time);
    });
  });
  console.timeEnd('createDateObjects');       
}

function getActiveTrains(trains, time){
  return trains.filter(function(train){
   var first = train.stops[0].dateObj;
   var last = train.stops[train.stops.length-1].dateObj;
   return time.between(first, last);
  });
}

function ActiveTrain(timeTableTrain){
  this.number = timeTableTrain.number;
  this.stops = timeTableTrain.stops;
  this.lastStopIndex = this.getLastStopIndex(); 
  this.timeBetweenStops = this.getTimeBetweenStops();
}

ActiveTrain.prototype.getLastStopIndex = function(){
  for(var i = 0; i < this.stops.length-1; i++){
    var now = Utils.fakeNow(); //TODO 
    if(now.between(this.stops[i].dateObj, this.stops[i+1].dateObj)){
      return i;
    }
  }
  console.error('Not an active train!');
  return -1; 
}

ActiveTrain.prototype.getTimeBetweenStops = function(){
    var last = this.stops[this.lastStopIndex].dateObj;
    var next = this.stops[this.lastStopIndex+1].dateObj;//TODO try if last
    return Utils.dateDiff(next, last, 'seconds', true);
}

ActiveTrain.prototype.getTimeToNext = function(){
    try {
      var next = this.stops[this.lastStopIndex+1].dateObj;
    } catch (error) {
        console.error(error);
        return 0;
    }
    var now = Utils.fakeNow(); //TODO 
    //console.log(now);
    return Utils.dateDiff(next, now, 'seconds', true);
}

ActiveTrain.prototype.run = function(){
    var that = this;
    this.runner = setInterval(function(){that.tic();}, Config.updateRate);
}

ActiveTrain.prototype.tic = function(){
    var timeToNext = this.getTimeToNext();
    //console.log('timeToNext', timeToNext);
    //var fractionTravelled = 1 - (timeToNext / this.timeBetweenStops);
    var frac = (timeToNext / this.timeBetweenStops);
    var fractionTravelled = 1 - frac;
    //console.log(Utils.fakeNow(), timeToNext,fractionTravelled, frac);
    if(fractionTravelled >= 1.0){
        this.atStop();
    } else {
        var lastStop = this.stops[this.lastStopIndex].name;
        var nextStop = this.stops[this.lastStopIndex+1].name;
       // console.log(lastStop, nextStop, this.timeBetweenStops);
        // pos = getPos()
        this.setMarkerPos(lastStop, nextStop, fractionTravelled); 
    }
}
ActiveTrain.prototype.setMarkerPos = function(lastStop, nextStop, frac){
    var wps = getWpsBetweenStops(lastStop, nextStop);
    var pos = getPoint(wps, frac);
    if(!this.hasOwnProperty('marker')){
        this.marker = new google.maps.Marker({
          map: map,
          title: 'Train ' + this.number + ', next: ' + nextStop
        });
    }
    this.marker.setPosition(pos);
}
ActiveTrain.prototype.atStop = function(){
    console.log('atStop', this);
    clearInterval(this.runner);
    this.lastStopIndex++;
    if(this.lastStopIndex+1 >= this.stops.length){
        this.marker.setVisible(false);
        activeTrains.splice(activeTrains.indexOf(this), 1); //remove obj from list
        return
    }
    //set pos, data, etc.    
    var nextStop = this.stops[this.lastStopIndex+1].name;
    this.marker.setTitle('Train ' + this.number + ', next: ' + nextStop);
    this.timeBetweenStops = this.getTimeBetweenStops();
    var that = this;
    setTimeout(function(){that.run()}, Config.stoptime);
}

var Utils = {
    dateDiff: function(date1, date2, measurement, floatResult){
      var result = moment(date1).diff(moment(date2), measurement, floatResult);
      //return Math.abs(result)
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

var Config = {
    stoptime: 3000, //in ms
    updateRate: 1000
}
