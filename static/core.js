var caltr = caltr || {};

caltr.core = {
  init: function(options) {
    var o = caltr.config.mapOptions;
    if(typeof options !== 'undefined'){
      o = options;
    }
    caltr.map = new google.maps.Map(caltr.mapCanvas, o);
  },

  runNewTrains: function(trains){
      trains.forEach(function(train){
        var t = new caltr.ActiveTrain(train);
        t.run();
        train.runningTrain = t; //this sucks but need for remove?
        caltr.activeTrains.push(train);
      });
  },
      
  createDateObjects: function(trains){
    //console.time('createDateObjects');
    trains.forEach( function(train){
      train.stops.forEach(function(stop){
        stop.dateObj = new Date(stop.time);
      });
    });
    //console.timeEnd('createDateObjects');       
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

  getNewTrains: function(allTrains, oldTrains, time){
    //var res = [];
    //allTrains.forEach(function(train){
      return allTrains.filter(function(train){
        if(oldTrains.indexOf(train) != -1){
          return false;
        }
        var first = train.stops[0].dateObj;
        var last = train.stops[train.stops.length-1].dateObj;
        return time.between(first, last);
      });
     //   res = res.concat(r);
   // });
    //return res;
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
      var startDist = this.getDistOfWpsList(wps.slice(0,i+1));//incl. elem. i
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
};
