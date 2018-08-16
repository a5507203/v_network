/* jshint node: true */
'use strict';

var fs = require('fs');
var Q = require('q');
var async = require('async');
var exec = require('child_process').execFile;
const uuidv1 = require('uuid/v1');
var executablePath = ".\\UE_FW.exe";

var inputFilePath = './data/';
var outputPath = './data/';


var exec = require('child_process').execFile;

function convertLinks(links){

    var content = '~ \tInit node \tTerm node \tCapacity \tLength \tFree Flow Time \tB\tPower\tSpeed limit \tToll \tType\t;\n';
    var rows = links.split('\n');
    var nodes = new Set();
    var firstNode  = '';
    var numberOfLinks = 0;
    for ( ; numberOfLinks < rows.length-2 ; numberOfLinks += 1) {
        var row = rows[numberOfLinks+1];
        var column = row.split(',');
        if ( numberOfLinks == 0) firstNode = column[0];
        nodes.add(column[0]);
        nodes.add(column[1]);
        //row = '\t'+row.replace(/,/g,'\t').replace(/\r/g,'\t;\n');
        row = '\t'+row.replace(/,/g,'\t')+'\t;\n';
        content += row;
    }
 
    var metaData = '<NUMBER OF ZONES> '+nodes.size+'\t\t\t\t\t\t\t\t\t\t\t\n<NUMBER OF NODES> '+nodes.size+'\t\t\t\t\t\t\t\t\t\t\t\n<FIRST THRU NODE> '+firstNode+'\t\t\t\t\t\t\t\t\t\t\t\n<NUMBER OF LINKS> '+ numberOfLinks +'\t\t\t\t\t\t\t\t\t\t\t\n<END OF METADATA>\t\t\t\t\t\t\t\t\t\t\t\n\n\n';
    content = metaData + content;
    
    return content;

}

function convertNodes(nodes){

    var content = nodes.replace(/,/g,'\t').replace(/\n/g,'\t;\r\n');

    return content;

}

function convertTrips(trips){
    console.log(trips);
    var index = 0;
    var rows = trips.split('\n');
    var endNode = rows[index].split(',');
    index += 1;
    var content = '';
    var flows = 0;

    for( ; index < rows.length-1 ; index += 1 ){

        var column = rows[index].split(',');
        content += 'Origin\t'+ column[0] +'\r\n';
        var totalflow = 0;
        var counter = 0;

        for( var j = 1 ; j < column.length ; j += 1 ) {
            var number = Math.round( parseFloat(column[j]) * 10 ) / 10;
            flows += number;
            content += endNode[j] + ':' + number+';';
            counter += 1;
            if(counter == 5) { 
                content += '\r\n';
                counter = 0;
            }
        }

        content += '\r\n\r\n';
    }
  
    var metaData = '<NUMBER OF ZONES> ' + (endNode.length - 1) +'\r\n<TOTAL OD FLOW> ' + flows + '\r\n<END OF METADATA>\r\n\r\n\r\n';
    content = metaData + content;

    return content;
    
}


function execEXE(fileNames, callback) {

        exec(executablePath, [inputFilePath+fileNames.tuiFileName], function(err,data) {           
            fs.readFile(outputPath+fileNames.flowFileName, 'utf8', function (err, data) {
                var rows = data.split('\n');
                var score = 0;
                for (let i = 6 ; i < rows.length;  i += 1 ) {
                    var columns = rows[i].split('\t');
               
                    if(columns[5] != undefined){
                             var cost = parseFloat(columns[5].trim());        
                             score += cost;
                    } 
                }
                for( let fileName of Object.values(fileNames)) {
                    fs.unlink(inputFilePath+fileName, function(err){
                            if(err) return console.log(err);
                            console.log('file deleted successfully');
                    });  
                }
                callback(data,score);
            });
    });
};

// var getFlowsByRunningEXE = function( networkInfo ) {

//     // var arr = [{'filename':inputFilePath+'SiouxFalls_net.txt', 'content':networkInfo.edges},
//     // {'filename':inputFilePath+'SiouxFalls_node.txt', 'content':networkInfo.nodes},
//     // {'filename':inputFilePath+'SiouxFalls_trips.txt', 'content':networkInfo.trips}];
//     // need to write input file first
//     var nodes = convertNodes(networkInfo.nodes);
//     var links = convertLinks(networkInfo.links);
//     var trips = convertTrips(networkInfo.trips);
//     function writefile(obj,callback) {
//         var deferred = Q.defer();
//         fs.writeFile(obj.filename, obj.content,function(err){
//             if(err) deferred.reject(err);
//         });
//         return deferred.promise.nodeify(callback);
//     }
//     Q.all([
//         writefile({'filename':inputFilePath+'SiouxFalls_net.txt', 'content':'asdfads'}),
//         // writefile({'filename':inputFilePath+'SiouxFalls_node.txt', 'content':nodes}),
//         // writefile({'filename':inputFilePath+'SiouxFalls_trips.txt', 'content':trips})
//     ]).then(function(){
//         console.log('success');
//         // execEXE();
//     },function(err){
//         console.log(err);
//     });

// };

function getFlowsByRunningEXE( networkInfo, callback) {

    // var arr = [{'filename':inputFilePath+'SiouxFalls_net.txt', 'content':networkInfo.edges},
    // {'filename':inputFilePath+'SiouxFalls_node.txt', 'content':networkInfo.nodes},
    // {'filename':inputFilePath+'SiouxFalls_trips.txt', 'content':networkInfo.trips}];
    // need to write input file first
    // var nodes = convertNodes(networkInfo.nodes);
    var fileNames = {
        linkFileName: uuidv1()+'.txt',
        tripFileName: uuidv1()+'.txt',
        tuiFileName: uuidv1()+'.tui',
        tableFileName : uuidv1()+'.txt',
        flowFileName : uuidv1()+'.txt',
        logFileName : uuidv1()+'.txt'
    };
    console.log(fileNames);
    var links = convertLinks(networkInfo.links);
    var trips = convertTrips(networkInfo.trips);
   
    var complete = function(count){
        if ( count == 3 ) {
            execEXE(fileNames,callback);
        }
    }; 
    var i = 0;

    // fs.writeFile(inputFilePath+'SiouxFalls_node.txt', nodes,function(err){
    //     if(err) return;
    //     i++;
    //     complete(i);

    // });

    fs.writeFile(inputFilePath+fileNames.linkFileName, links,function(err){
        if(err) return;
        i++;
        complete(i);
    });

    fs.writeFile(inputFilePath+fileNames.tripFileName, trips,function(err){
        if(err) return;
        i++;
        complete(i);
    
    });  


    var tuiContent = 'Input directory \t\t.\\data\\\nOutput directory\t\t.\\data\\\nLink file name            '+ fileNames.linkFileName +' \nOD flow file name         '+ fileNames.tripFileName+'\nOD flow factor               1 \n\nAuto cost coeficient for in vehicle travel time [gcu/min] {ACCIVTT}\t1 \nAuto cost coeficient for out of vehicle travel time [gcu/min] {ACCOVTT}\t0\nAuto cost coeficient for monetary cost [gcu/cent] {ACCMON}  \t\t0\nAuto cost coeficient for distance [gcu/mile]  {ACCDIST}\t\t\t0\n\nReport scaled objective function divided by 1e+05 \n\nLog file name\t\t\t\t\t'+ fileNames.logFileName +'\n\nFW table output file name\t'+ fileNames.tableFileName +'\nLink flows output file name\t\t\t'+ fileNames.flowFileName +'\n\nAssignment iterations {ASITE}                   50\nAssignment accuracy {ASACC}                  1.0e-20\nRelative gap target {RGT}\t\t\t1e-20\n\n\n\n';

    fs.writeFile(inputFilePath+fileNames.tuiFileName, tuiContent,function(err){
        if(err) return;
        i++;
        complete(i);
    
    });  
};

exports.getFlows = function( networkInfo, callback ) {
    getFlowsByRunningEXE(networkInfo, callback);

};
