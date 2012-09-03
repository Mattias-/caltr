var caltr = caltr || {};

caltr.ActiveTrain = function(data){
  this.stops = data.stops;
  this.number = data.number;
  this.waypoints = data.waypoints.waypoints;
  this.wpsStopMap = data.waypoints.stopIndex; 
  this.lastStopIndex = this.getLastStopIndex(); 
  this.timeBetweenStops = this.getTimeBetweenStops();
  this.lastStopName = this.stops[this.lastStopIndex].name;
  this.nextStopName = this.stops[this.lastStopIndex+1].name;
  this.marker = new google.maps.Marker({
    map: caltr.map,
    icon: caltr.config.icon
  });
  //console.log('created train object');
  this.infowindow = new google.maps.InfoWindow();
  this.content = 'Train ' + this.number + ', next: ' + this.nextStopName;

  this.marker.setTitle(this.content);
  this.infowindow.setContent('<p>' + this.content + '</p>');

  var that = this;
  google.maps.event.addListener(this.marker, 'click', function() {
    that.infowindow.open(caltr.map, that.marker);
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
  var frac = 1 - timeToNext / this.timeBetweenStops;
  if(frac >= 1.0){
    this.atStop();
  } else {
    var wps = caltr.core.getWpsBetweenStops(this.waypoints, this.wpsStopMap,
                                            this.lastStopName,
                                            this.nextStopName);
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
