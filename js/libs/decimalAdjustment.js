
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

var p1=[43.61274,-96.77042];
var p2=[43.60570,-96.71140];
var p3=[43.572613,-96.775087];
var p4=[43.564367,-96.761219];
var p5=[43.563514,-96.747139];
var p6=[43.576630,-96.710723];
var p7=[43.563707,-96.693487];
var p8=[43.562157,-96.711497];
var p9=[43.551217,-96.731318];
var p10=[43.544696,-96.731331];
var p11=[43.543917,-96.761203];
var p12=[43.543918,-96.780258];
var p13=[43.514842,-96.780500];
var p14=[43.529434,-96.761242];
var p15=[43.529515,-96.731255];
var p16=[43.546666,-96.711385];
var p17=[43.537568,-96.711274];
var p18=[43.546696,-96.694122];
var p19=[43.529361,-96.711280];
var p20=[43.515169,-96.711653];
var p21=[43.514855,-96.731241];
var p22=[43.522145,-96.731274];
var p23=[43.522154,-96.761141];
var p24=[43.514909,-96.761180];



// console.log('1-2',Math.greatCircleDistance(p1,p2));
// console.log('1-3',Math.greatCircleDistance(p1,p3));

// console.log('2-6',Math.greatCircleDistance(p2,p6));

// console.log('3-4',Math.greatCircleDistance(p3,p4));
// console.log('3-12',Math.greatCircleDistance(p3,p12));


// console.log('4-5',Math.greatCircleDistance(p4,p5));
// console.log('4-11',Math.greatCircleDistance(p4,p11));

// console.log('5-6',Math.greatCircleDistance(p5,p6));
// console.log('5-9',Math.greatCircleDistance(p5,p9));

// console.log('6-8',Math.greatCircleDistance(p6,p8));

// console.log('7-8',Math.greatCircleDistance(p7,p8));
// console.log('7-18',Math.greatCircleDistance(p7,p18));

// console.log('8-9',Math.greatCircleDistance(p8,p9));
// console.log('8-16',Math.greatCircleDistance(p8,p16));

// console.log('9-10',Math.greatCircleDistance(p9,p10));

// console.log('10-11',Math.greatCircleDistance(p10,p11));
// console.log('10-15',Math.greatCircleDistance(p10,p15));
// console.log('10-16',Math.greatCircleDistance(p10,p16));
// console.log('10-17',Math.greatCircleDistance(p10,p17));

// console.log('11-12',Math.greatCircleDistance(p11,p12));
// console.log('11-14',Math.greatCircleDistance(p11,p14));

// console.log('12-13',Math.greatCircleDistance(p12,p13));

// console.log('13-24',Math.greatCircleDistance(p13,p24));

// console.log('14-15',Math.greatCircleDistance(p14,p15));
// console.log('14-23',Math.greatCircleDistance(p14,p23));

// console.log('15-19',Math.greatCircleDistance(p15,p19));
// console.log('15-22',Math.greatCircleDistance(p15,p22));

// console.log('16-17',Math.greatCircleDistance(p16,p17));
// console.log('16-18',Math.greatCircleDistance(p16,p18));

// console.log('17-19',Math.greatCircleDistance(p17,p19));

// console.log('18-20',Math.greatCircleDistance(p18,p20));

// console.log('19-20',Math.greatCircleDistance(p19,p20));

// console.log('20-21',Math.greatCircleDistance(p20,p21));
// console.log('20-22',Math.greatCircleDistance(p20,p22));

// console.log('21-22',Math.greatCircleDistance(p21,p22));
// console.log('21-24',Math.greatCircleDistance(p21,p24));

// console.log('22-23',Math.greatCircleDistance(p22,p23));

// console.log('23-24',Math.greatCircleDistance(p23,p24));


