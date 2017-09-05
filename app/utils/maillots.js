app.service('Maillots', function() {
  
  this.get = function (idClub, nomClub) {
    if (nomClub === 'OM') {
      return {template: 'OM'};
    }
    var cfg = config[nomClub] || config[idClub] || defaultConfig;
    cfg.canvasId = 'maillot-' + idClub;
    return cfg;
  };
  
  var config = {
    1: {template: 48, color1: "F9D614", color2: "000000", color3: "000000"}, // AEK ATHÈNES
    5: {template: 2, color1: "BA0100", color2: "281D72", color3: "F7B001"}, // AJACCIO GFC
    9: {template: 1, color1: "ffffff", color2: "DEDEDD", color3: "000000"}, // AMIENS
    14: {template: 15, color1: "3D347E", color2: "ffffff", color3: "ffffff"}, // AUSTRIA VIENNE
    19: {template: 7, color1: "E30512", color2: "ffffff", color3: "ffffff"}, // BEAUVAIS
    23: {template: 48, color1: "000000", color2: "ffffff", color3: "000000"}, // BESIKTAS ISTANBUL
    27: {template: 54, color1: "172983", color2: "E22219", color3: "172983"}, // BOLOGNE
    28: {template: 10, color1: "ffffff", color2: "EE3F34", color3: "003876"}, // BOLTON
    34: {template: 18, color1: "ffffff", color2: "ED1C24", color3: "ED1C24"}, // BREST
    37: {template: 2, color1: "FFF200", color2: "004B85", color3: "004B85"}, // BRÖNDBY
    43: {template: 42, color1: "FFF200", color2: "005BAB", color3: "005BAB"}, // CARL ZEISS IENA
    45: {template: 1, color1: "C1DDF3", color2: "ffffff", color3: "ffffff"}, // CELTA VIGO
    47: {template: 48, color1: "ffffff", color2: "0000FF", color3: "0000FF"}, // CHARLEVILLE
    49: {template: 37, color1: "005BAB", color2: "ED1847", color3: "ffffff"}, // CHÂTEAUROUX
    50: {template: 1, color1: "034694", color2: "ffffff", color3: "ffffff"}, // CHELSEA
    51: {template: 36, color1: "1B3B8E", color2: "ffffff", color3: "ffffff"}, // CHERBOURG
    52: {template: 33, color1: "C60C46", color2: "002C69", color3: "002C69"}, // CLERMONT
    57: {template: 19, color1: "ED1C23", color2: "ffffff", color3: "ffffff"}, // COLOGNE
    60: {template: 33, color1: "2E5E9F", color2: "D2293D", color3: "007861"}, // CRÉTEIL
    61: {template: 11, color1: "D91521", color2: "293383", color3: "F1C600"}, // CSKA MOSCOU
    63: {template: 1, color1: "C11929", color2: "FFFFFF", color3: "ffffff"}, // DIJON
    72: {template: 37, color1: "CE000C", color2: "ffffff", color3: "CE000C"}, // ETOILE ROUGE BELGRADE
    99: {template: 36, color1: "F5822A", color2: "000000", color3: "000000"}, // LAVAL
    105: {template: 1, color1: "0E447B", color2: "FFFFFF", color3: "FFFFFF"}, // LECH POZNAN
    117: {template: 2, color1: "FCDC4F", color2: "E32219", color3: "E32219"}, // LOUHANS-CUISEAUX
    123: {template: 1, color1: "E20E0E", color2: "FFFFFF", color3: "FFFFFF"}, // MANCHESTER UTD
    125: {template: 37, color1: "FDE531", color2: "DE0021", color3: "000000"}, // MARTIGUES
    126: {template: 51, color1: "8DAABB", color2: "FFFFFF", color3: "FFFFFF"}, // MATRA RACING
    129: {template: 1, color1: "ffffff", color2: "009EE0", color3: "009EE0"}, // MLADA BOLESLAV
    132: {template: 1, color1: "F8E520", color2: "ffffff", color3: "0652BD"}, // MONTAUBAN
    184: {template: 5, color1: "F92400", color2: "FFFFFF", color3: "ffffff"}, // SION,
    200: {template: 10, color1: "ffffff", color2: "0097DB", color3: "0097DB"}, // ST-PÉTERSBOURG
    219: {template: 36, color1: "ffffff", color2: "ff8000", color3: "000000"}, // VALENCE CF
    224: {template: 2, color1: "1D9053", color2: "ffffff", color3: "ff8000"}, // WERDER BRÊME
    225: {template: 12, color1: "F3C62C", color2: "0C0904", color3: "0C0904"}, // YOUNG BOYS BERNE
    226: {template: 1, color1: "1854C0", color2: "1854C0", color3: "ffffff"}, // ZAGREB CROATIA
    227: {template: 1, color1: "009157", color2: "FFFFFF", color3: "ffffff"}, // CARQUEFOU
    228: {template: 10, color1: "FF1A0F", color2: "FFFFFF", color3: "ffffff"}, // BERGEN
    230: {template: 37, color1: "ED1C24", color2: "FFFFFF", color3: "000000"}, // PSV EINDHOVEN
    235: {template: 1, color1: "F7E704", color2: "000000", color3: "000000"}, // QUEVILLY
    247: {template: 1, color1: "FEE200", color2: "009537", color3: "009537"}, // ZILINA
    250: {template: 2, color1: "FFFF00", color2: "000000", color3: "000000"}, // BORUSSIA DORTMUND
    252: {template: 1, color1: "0363AB", color2: "FFFFFF", color3: "ffffff"}, // BOURG-PÉRONNAS
    259: {template: 2, color1: "ED1248", color2: "2E6ABD", color3: "ffffff"}, // BAYERN MUNICH
    266: {template: 37, color1: "D23A4D", color2: "3D3B3E", color3: "3D3B3E"}, // ESKISEHIRSPOR
    267: {template: 25, color1: "FDDC03", color2: "000000", color3: "000000"}, // SHERIFF TIRASPOL
    268: {template: 3, color1: "FBEE00", color2: "004482", color3: "004482"}, // FENERBAHCE
    269: {template: 36, color1: "FFDC00", color2: "024A8B", color3: "024A8B"}, // LIMASSOL
    270: {template: 49, color1: "33898B", color2: "FFFFFF", color3: "000000"}, // MÖNCHENGLADBACH
    274: {template: 1, color1: "6BBEE9", color2: "FFFFFF", color3: "ffffff"}, // NAPLES
    279: {template: 33, color1: "FFFFFF", color2: "008A57", color3: "008A57"}, // GRONINGUE
    280: {template: 1, color1: "0075D4", color2: "FFFFFF", color3: "ffffff"}, // LIBEREC,
    281: {template: 2, color1: "E80300", color2: "FFFFFF", color3: "FFFFFF"}, // BRAGA
    282: {template: 3, color1: "E31818", color2: "FFFFFF", color3: "1A171B"}, // BILBAO ATHLETIC
    283: {template: 1, color1: "ffffff", color2: "ffffff", color3: "00AFE3"}, // GRANVILLE
    284: {template: 10, color1: "E40714", color2: "439F3A", color3: "FEDF00"}, // OSTENDE
    285: {template: 10, color1: "FFE500", color2: "11006F", color3: "11006F"}, // DOMZALE
    286: {template: 37, color1: "24946D", color2: "ffffff", color3: "24946D"}, // KONYASPOR
    287: {template: 1, color1: "ffffff", color2: "E41349", color3: "E41349"}, // SALZBOURG
    288: {template: 1, color1: "ffffff", color2: "000000", color3: "000000"}, // GUIMARAES
    "ALÈS": {template: 36, color1: "034EA2", color2: "FFFFFF", color3: "FFFFFF"},
    "AJACCIO": {template: 48, color1: "FFFFFF", color2: "ED1C24", color3: "ED1C24"},
    "AJAX AMSTERDAM": {template: 55, color1: "FFFFFF", color2: "EC1346", color3: "EC1346"},
    "ANGERS": {template: 2, color1: "FFFFFF", color2: "231F20", color3: "231F20"},
    "ARLES-AVIGNON": {template: 5, color1: "FFDD02", color2: "045395", color3: "045395"},
    "ARSENAL": {template: 2, color1: "EE0007", color2: "FFFFFF", color3: "FFFFFF"},
    "ATLETICO MADRID": {template: 3, color1: "FFFFFF", color2: "FF2900", color3: "0A127C"},
    "AUXERRE": {template: 10, color1: "FFFFFF", color2: "233686", color3: "233686"},
    "BASTIA": {template: 30, color1: "005BAB", color2: "FFFFFF", color3: "FFFFFF"},
    "BENFICA": {template: 25, color1: "EE2E24", color2: "FFFFFF", color3: "FFFFFF"},
    "BORDEAUX": {template: 29, color1: "001C50", color2: "FFFFFF", color3: "FFFFFF"},
    "BOULOGNE": {template: 11, color1: "ED1C24", color2: "231F20", color3: "231F20"},
    "CAEN": {template: 3, color1: "00529C", color2: "ED1C24", color3: "00529C"},
    "CANNES": {template: 3, color1: "FFFFFF", color2: "E1001B", color3: "FFFFFF"},
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
    "NÎMES": {template: 1, color1: "ED1C24", color2: "FFFFFF", color3: "FFFFFF"},
    "PARIS SG": {template: 56, color1: "002561", color2: "ED1C24", color3: "FFFFFF"},
    "RACING CLUB PARIS": {template: 4, color1: "FFFFFF", color2: "82B1D8", color3: "FFFFFF"},
    "REAL MADRID": {template: 1, color1: "FFFFFF", color2: "004799", color3: "004799"},
    "RED STAR": {template: 25, color1: "0C6646", color2: "FFFFFF", color3: "FFFFFF"},
    "REIMS": {template: 2, color1: "D2232A", color2: "FFFFFF", color3: "FFFFFF"},
    "RENNES": {template: 2, color1: "E03127", color2: "000000", color3: "000000"},
    "ROUEN": {template: 29, color1: "CA2B28", color2: "FFFFFF", color3: "FFFFFF"},
    "SEDAN": {template: 10, color1: "009A67", color2: "E03B2B", color3: "FFFFFF"},
    "SÈTE": {template: 4, color1: "FFFFFF", color2: "009C31", color3: "FFFFFF"},
    "SOCHAUX": {template: 2, color1: "FFCC32", color2: "003F7A", color3: "003F7A"},
    "ST-ÉTIENNE": {template: 1, color1: "00A351", color2: "FFFFFF", color3: "FFFFFF"},
    "SPARTAK MOSCOU": {template: 15, color1: "FF0D00", color2: "FFFFFF", color3: "FFFFFF"},
    "STRASBOURG": {template: 25, color1: "00AEEF", color2: "FFFFFF", color3: "FFFFFF"},
    "TOULON": {template: 50, color1: "FBF00C", color2: "1E59C1", color3: "1E59C1"},
    "TOULOUSE": {template: 12, color1: "7D71B4", color2: "FFFFFF", color3: "FFFFFF"},
    "TRÉLISSAC": {template: 1, color1: "41A5C0", color2: "000000", color3: "000000"},
    "TROYES": {template: 14, color1: "0053B6", color2: "FFFFFF", color3: "FFFFFF"},
    "TWENTE": {template: 1, color1: "F6002F", color2: "FFFFFF", color3: "FFFFFF"},
    "VALENCIENNES": {template: 29, color1: "EA1D2A", color2: "FFFFFF", color3: "FFFFFF"},
    "ZURICH": {template: 12, color1: "FFFFFF", color2: "004799", color3: "004799"}
  };
  
  var defaultConfig = {template: 1, color1: "CCCCCC", color2: "CCCCCC", color3: "CCCCCC"};
});