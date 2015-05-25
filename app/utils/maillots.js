app.service('Maillots', function() {
  
  this.get = function (club) {
    var configClub = config[club];
    configClub.id = 'maillot-' + club;
    return configClub;
  };
  
  var config = {
    "AJAX AMSTERDAM": {template: 16, color1: "FFFFFF", color2: "EC1346", color3: "EC1346"},
    "ARLES-AVIGNON": {template: 5, color1: "FFDD02", color2: "045395", color3: "045395"},
    "ARSENAL": {template: 2, color1: "EE0007", color2: "FFFFFF", color3: "FFFFFF"},
    "ATLETICO MADRID": {template: 3, color1: "FFFFFF", color2: "FF2900", color3: "0A127C"},
    "AUXERRE": {template: 10, color1: "FFFFFF", color2: "233686", color3: "233686"},
    "BASTIA": {template: 30, color1: "005BAB", color2: "FFFFFF", color3: "FFFFFF"},
    "BENFICA": {template: 25, color1: "EE2E24", color2: "FFFFFF", color3: "FFFFFF"},
    "BORDEAUX": {template: 29, color1: "001C50", color2: "FFFFFF", color3: "FFFFFF"},
    "BOULOGNE": {template: 11, color1: "ED1C24", color2: "231F20", color3: "231F20"},
    "CAEN": {template: 3, color1: "00529C", color2: "ED1C24", color3: "00529C"},
    "CHAKTHIAR DONETSK": {template: 25, color1: "F07328", color2: "000000", color3: "000000"},
    "COPENHAGUE": {template: 1, color1: "FFFFFF", color2: "3C1B7F", color3: "3C1B7F"},
    "ÉVIAN-THONON-GAILLARD": {template: 19, color1: "F7A8D8", color2: "FFFFFF", color3: "5B79CD"},
    "GRENOBLE": {template: 5, color1: "FFFFFF", color2: "005DA3", color3: "005DA3"},
    "GUINGAMP": {template: 34, color1: "EC1C23", color2: "020202", color3: "FFFFFF"},
    "LE HAVRE": {template: 5, color1: "78BDE8", color2: "004990", color3: "004990"},
    "LE MANS": {template: 10, color1: "E41F26", color2: "FDB714", color3: "FDB714"},
    "LENS": {template: 13, color1: "ED1C24", color2: "FFF200", color3: "FFF200"},
    "LILLE": {template: 1, color1: "DA2032", color2: "FFFFFF", color3: "FFFFFF"},
    "LIVERPOOL": {template: 1, color1: "DA0229", color2: "FFFFFF", color3: "FFFFFF"},
    "LORIENT": {template: 21, color1: "F68B1F", color2: "FFFFFF", color3: "000000"},
    "LYON": {template: 22, color1: "FFFFFF", color2: "023F88", color3: "E11B22"},
    "METZ": {template: 1, color1: "B0063A", color2: "FFFFFF", color3: "FFFFFF"},
    "MILAN AC": {template: 3, color1: "ED1C24", color2: "231F20", color3: "231F20"},
    "MONACO": {template: 43, color1: "FFFFFF", color2: "ED1C24", color3: "ED1C24"},
    "MONTPELLIER": {template: 15, color1: "005BA6", color2: "F37021", color3: "FFFFFF"},
    "NANCY": {template: 17, color1: "FFFFFF", color2: "EE3224", color3: "EE3224"},
    "NANTES": {template: 3, color1: "FFDD00", color2: "006736", color3: "006736"},
    "NICE": {template: 3, color1: "CD1E25", color2: "231F20", color3: "231F20"},
    "PARIS SG": {template: 16, color1: "002561", color2: "ED1C24", color3: "FFFFFF"},
    "PSV EINDHOVEN": {template: 11, color1: "ED1C24", color2: "FFFFFF", color3: "000000"},
    "REAL MADRID": {template: 1, color1: "FFFFFF", color2: "004799", color3: "004799"},
    "REIMS": {template: 2, color1: "D2232A", color2: "FFFFFF", color3: "FFFFFF"},
    "RENNES": {template: 2, color1: "E03127", color2: "000000", color3: "000000"},
    "SOCHAUX": {template: 2, color1: "FFCC32", color2: "003F7A", color3: "003F7A"},
    "ST-ÉTIENNE": {template: 1, color1: "00A351", color2: "FFFFFF", color3: "FFFFFF"},
    "SPARTAK MOSCOU": {template: 15, color1: "FF0D00", color2: "FFFFFF", color3: "FFFFFF"},
    "STRASBOURG": {template: 25, color1: "00AEEF", color2: "FFFFFF", color3: "FFFFFF"},
    "TOULOUSE": {template: 12, color1: "7D71B4", color2: "FFFFFF", color3: "FFFFFF"},
    "TRÉLISSAC": {template: 1, color1: "41A5C0", color2: "000000", color3: "000000"},
    "TWENTE": {template: 1, color1: "F6002F", color2: "FFFFFF", color3: "FFFFFF"},
    "VALENCIENNES": {template: 29, color1: "EA1D2A", color2: "FFFFFF", color3: "FFFFFF"},
    "ZURICH": {template: 12, color1: "FFFFFF", color2: "004799", color3: "004799"}
  };
});