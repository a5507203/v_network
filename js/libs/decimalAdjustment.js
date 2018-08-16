
// Closure
(function(){

    /**
     * Decimal adjustment of a number.
     *
     * @param {String}  type  The type of adjustment.
     * @param {Number}  value The number.
     * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
     * @returns {Number}      The adjusted value.
     */
    function decimalAdjust(type, value, exp) {
      // If the exp is undefined or zero...
      if (typeof exp === 'undefined' || +exp === 0) {
        return Math[type](value);
      }
      value = +value;
      exp = +exp;
      // If the value is not a number or the exp is not an integer...
      if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
        return NaN;
      }
      // Shift
      value = value.toString().split('e');
      value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
      // Shift back
      value = value.toString().split('e');
      return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
    }
  
    // Decimal round
    if (!Math.round10) {
      Math.round10 = function(value, exp) {
        return decimalAdjust('round', value, exp);
      };
    }
    // Decimal floor
    if (!Math.floor10) {
      Math.floor10 = function(value, exp) {
        return decimalAdjust('floor', value, exp);
      };
    }
    // Decimal ceil
    if (!Math.ceil10) {
      Math.ceil10 = function(value, exp) {
        return decimalAdjust('ceil', value, exp);
      };
    }
  
  })();
// Closure
(function(){

  Math.greatCircleDistance = function (p1,p2) {
    var lat1 = p1[0];
    var lon1 = p1[1];
    var lat2 = p2[0];
    var lon2 = p2[1];
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
  };

  function deg2rad(deg) {
    return deg * (Math.PI/180);
  }
})();

// Math.fromLatLngToVertex = function (latLng) {
//   var projection = this.map.getProjection(),
//     point = projection.fromLatLngToPoint(latLng),
//     vertex = new THREE.Vector3();

//   vertex.x = point.x;
//   vertex.y = 255 - point.y;
//   vertex.z = 0;

//   return vertex;
// };

// var p1 = [43.61274,-96.77042];
// var p2 = [43.60570,-96.71140];
// var p3 = [43.572613,-96.775087];
// var p4 = [43.564367,-96.761219];
// var p5 = [43.563514,-96.747139];
// var p6 = [43.576630,-96.710723];

// //1-2
// console.log(Math.greatCircleDistance(p1,p2));
// var lat1 = p1[0];
// var lon1 = p1[1];
// var lat2 = p2[0];
// var lon2 = p2[1];
// console.log(Math.greatCircleDistance(p1,p2)/Math.sqrt( Math.pow((lat1-lat2), 2) + Math.pow((lon1-lon2), 2) ));

// console.log(Math.fromLatLngToVertex((43.61274,-96.77042)));

//1-3
// Math.greatCircleDistance(43.61274,-96.77042,43.572613,-96.775087);

// //
// Math.greatCircleDistance();