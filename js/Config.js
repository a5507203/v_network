var Config = {
    coordinateMean : 0,
    coordinateRange : 2000,
    newNodeCount : 0,
    newNodeColor : 0x2bdb89,
    newEdgeCount : 0,
    roadTypes:{},
    unitCost: 100,
    maxCapacity : 0,
    lineColor : new THREE.Color(0x0000ff),
    budget: 0,
    totalLeft: 0,
    host:'http://13.237.82.173'
    // host:'http://localhost:3000'
};

 function clearConfig(params) {

    Config.coordinateMean = 0;
    Config.coordinateRange = 2000;
    Config.newNodeCount = 0;
    Config.newNodeColor = 0x2bdb89;
    Config.newEdgeCount = 0;
    Config.roadTypes={};
    Config.unitCost= 100;
    Config.maxCapacity = 0;
    Config.budget= 0;
    Config.newGameList.setValue();
   
}