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
    return Utils.dateDiff(last, next, 'seconds', true);
}

ActiveTrain.prototype.getTimeToNext = function(){
    var next = this.stops[this.lastStopIndex+1].dateObj;//TODO try if last
    var now = Utils.fakeNow(); //TODO 
    return Utils.dateDiff(now, next, 'seconds', true);
}

ActiveTrain.prototype.tic = function(){
    var timeToNext = this.getTimeToNext();
    var fractionTravelled = 1 - timeToNext / this.timeBetweenStops;
    console.log(timeToNext,this.timeBetweenStops,fractionTravelled);
    if(fractionTravelled >= 1){
        this.atStop();
    } else {
        var lastStop = this.stops[this.lastStopIndex].name;
        var nextStop = this.stops[this.lastStopIndex+1].name;
        console.log(lastStop, nextStop, fractionTravelled);
        // pos = getPos()
    }
}

ActiveTrain.prototype.atStop = function(){
    this.lastStopIndex++;
    if(this.lastStopIndex >= this.stops.length){
        activeTrains.splice(activeTrains.indexOf(this), 1); //remove this
        return
    }
    //sleep(stopDuration)
    this.timeBetweenStops = this.getTimeBetweenStops();
}

var Utils = {
    dateDiff: function(date1, date2, measurement, floatResult){
      var result = moment(date1).diff(moment(date2), measurement, floatResult);
      return Math.abs(result)
    },
    startDate :  moment(Date.now()),
    realTime : moment(),
    fakeNow : function(){
      var diff = moment().diff(this.realTime);
      return this.startDate.add('ms', diff).toDate(); 
    }

}
