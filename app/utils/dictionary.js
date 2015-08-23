app.service('Dictionary', function ($http) {
  
  var dictionary = {};
  
  this.init = $http.get('services/dictionary.php')
  .success(function (data, status, headers, config) {
    dictionary = data;

    dictionary.nationalites = dictionary.nationalites.map(function (nationalite) {
      return {key: nationalite.key, label: this.getNationalite(nationalite.key)};
    }.bind(this));
  }.bind(this));

  this.postes = function () {
    return [
      {key: 'GA', label: 'Gardien'},
      {key: 'DE', label: 'Défenseur'},
      {key: 'MI', label: 'Milieu'},
      {key: 'AV', label: 'Attaquant'}
    ];
  };
  
  this.nationalites = function () {
    return dictionary.nationalites;
  };
  
  this.saisons = function () {
    return dictionary.saisons;
  };
  
  this.adversaires = function () {
    return dictionary.adversaires;
  };
  
  this.fonctions = function () {
    return dictionary.fonctions;
  };
  
  this.joueurs = function () {
    return dictionary.joueurs;
  };
  
  this.dirigeants = function () {
    return dictionary.dirigeants;
  };
  
  this.matches = function () {
    return dictionary.matches;
  };

  this.getNationalite = function (key) {
    var nationalite = this.allNationalites().find(function (nationalite) {
      return nationalite.key === key;
    });
    if (!nationalite) {
      console.error('Label not found for nationalité ' + key);
      return '';
    }
    return nationalite.label;
  };

  this.allNationalites = function () {
    return [
      {key: 'AFG', label: 'Afghanistan'},
      {key: 'RSA', label: 'Afrique du Sud'},
      {key: 'ALB', label: 'Albanie'},
      {key: 'ALG', label: 'Algérie'},
      {key: 'GER', label: 'Allemagne'},
      {key: 'AND', label: 'Andorre'},
      {key: 'ENG', label: 'Angleterre'},
      {key: 'ANG', label: 'Angola'},
      {key: 'ANT', label: 'Antigua-et-Barbuda'},
      {key: 'KSA', label: 'Arabie saoudite'},
      {key: 'ARG', label: 'Argentine'},
      {key: 'ARM', label: 'Arménie'},
      {key: 'AUS', label: 'Australie'},
      {key: 'AUT', label: 'Autriche'},
      {key: 'AZE', label: 'Azerbaïdjan'},
      {key: 'BAH', label: 'Bahamas'},
      {key: 'BHR', label: 'Bahreïn'},
      {key: 'BAN', label: 'Bangladesh'},
      {key: 'BRB', label: 'Barbade'},
      {key: 'BEL', label: 'Belgique'},
      {key: 'BLZ', label: 'Belize'},
      {key: 'BEN', label: 'Bénin'},
      {key: 'BHU', label: 'Bhoutan'},
      {key: 'BHR', label: 'Biélorussie'},
      {key: 'BOL', label: 'Bolivie'},
      {key: 'BIH', label: 'Bosnie-Herzégovine'},
      {key: 'BOT', label: 'Botswana'},
      {key: 'BRA', label: 'Brésil'},
      {key: 'BRU', label: 'Brunei'},
      {key: 'BUL', label: 'Bulgarie'},
      {key: 'BFA', label: 'Burkina'},
      {key: 'BDI', label: 'Burundi'},
      {key: 'CAM', label: 'Cambodge'},
      {key: 'CMR', label: 'Cameroun'},
      {key: 'CAN', label: 'Canada'},
      {key: 'CPV', label: 'Cap-Vert'},
      {key: 'CTA', label: 'Centrafrique'},
      {key: 'CHI', label: 'Chili'},
      {key: 'CHN', label: 'Chine'},
      {key: 'CYP', label: 'Chypre'},
      {key: 'COL', label: 'Colombie'},
      {key: 'COM', label: 'Comores'},
      {key: 'CGO', label: 'Congo'},
      {key: 'COK', label: 'Cook'},
      {key: 'PRK', label: 'Corée du Nord'},
      {key: 'KOR', label: 'Corée du Sud'},
      {key: 'CRC', label: 'Costa Rica'},
      {key: 'CIV', label: 'Côte d\'Ivoire'},
      {key: 'CRO', label: 'Croatie'},
      {key: 'CUB', label: 'Cuba'},
      {key: 'DEN', label: 'Danemark'},
      {key: 'DJI', label: 'Djibouti'},
      {key: 'SCO', label: 'Écosse'},
      {key: 'EGY', label: 'Égypte'},
      {key: 'UAE', label: 'Émirats Arabes Unis'},
      {key: 'ECU', label: 'Équateur'},
      {key: 'ERI', label: 'Érythrée'},
      {key: 'ESP', label: 'Espagne'},
      {key: 'EST', label: 'Estonie'},
      {key: 'USA', label: 'États-Unis'},
      {key: 'ETH', label: 'Éthiopie'},
      {key: 'FIJ', label: 'Fidji'},
      {key: 'FIN', label: 'Finlande'},
      {key: 'FRA', label: 'France'},
      {key: 'GAB', label: 'Gabon'},
      {key: 'GAM', label: 'Gambie'},
      {key: 'GEO', label: 'Géorgie'},
      {key: 'GHA', label: 'Ghana'},
      {key: 'GRE', label: 'Grèce'},
      {key: 'GRN', label: 'Grenade'},
      {key: 'GUA', label: 'Guatemala'},
      {key: 'GUI', label: 'Guinée'},
      {key: 'GNB', label: 'Guinée-Bissau'},
      {key: 'EQG', label: 'Guinée Équatoriale'},
      {key: 'GUY', label: 'Guyana'},
      {key: 'HAI', label: 'Haïti'},
      {key: 'HKG', label: 'Hong Kong'},
      {key: 'HON', label: 'Honduras'},
      {key: 'HUN', label: 'Hongrie'},
      {key: 'IND', label: 'Inde'},
      {key: 'IDN', label: 'Indonésie'},
      {key: 'IRN', label: 'Iran'},
      {key: 'IRQ', label: 'Iraq'},
      {key: 'IRL', label: 'Irlande'},
      {key: 'NIR', label: 'Irlande du Nord'},
      {key: 'ISL', label: 'Islande'},
      {key: 'ISR', label: 'Israël'},
      {key: 'ITA', label: 'Italie'},
      {key: 'FRO', label: 'Îles Féroé'},
      {key: 'JAM', label: 'Jamaïque'},
      {key: 'JPN', label: 'Japon'},
      {key: 'JOR', label: 'Jordanie'},
      {key: 'KAZ', label: 'Kazakhstan'},
      {key: 'KEN', label: 'Kenya'},
      {key: 'KGZ', label: 'Kirghizistan'},
      {key: 'KUW', label: 'Koweït'},
      {key: 'LAO', label: 'Laos'},
      {key: 'LES', label: 'Lesotho'},
      {key: 'LVA', label: 'Lettonie'},
      {key: 'LIB', label: 'Liban'},
      {key: 'LBR', label: 'Liberia'},
      {key: 'LBY', label: 'Libye'},
      {key: 'LIE', label: 'Liechtenstein'},
      {key: 'LTU', label: 'Lituanie'},
      {key: 'LUX', label: 'Luxembourg'},
      {key: 'MAC', label: 'Macao'},
      {key: 'MKD', label: 'Macédoine'},
      {key: 'MAD', label: 'Madagascar'},
      {key: 'MAS', label: 'Malaisie'},
      {key: 'MWI', label: 'Malawi'},
      {key: 'MDV', label: 'Maldives'},
      {key: 'MLI', label: 'Mali'},
      {key: 'MLT', label: 'Malte'},
      {key: 'MAR', label: 'Maroc'},
      {key: 'MRI', label: 'Maurice'},
      {key: 'MTN', label: 'Mauritanie'},
      {key: 'MEX', label: 'Mexique'},
      {key: 'MDA', label: 'Moldavie'},
      {key: 'MON', label: 'Monaco'},
      {key: 'MGL', label: 'Mongolie'},
      {key: 'MGO', label: 'Monténégro'},
      {key: 'MOZ', label: 'Mozambique'},
      {key: 'MYA', label: 'Myanmar'},
      {key: 'NAM', label: 'Namibie'},
      {key: 'NEP', label: 'Népal'},
      {key: 'NCA', label: 'Nicaragua'},
      {key: 'NIG', label: 'Niger'},
      {key: 'NGA', label: 'Nigeria'},
      {key: 'NOR', label: 'Norvège'},
      {key: 'NZL', label: 'Nouvelle-Zélande'},
      {key: 'OMA', label: 'Oman'},
      {key: 'UGA', label: 'Ouganda'},
      {key: 'UZB', label: 'Ouzbékistan'},
      {key: 'PAK', label: 'Pakistan'},
      {key: 'PAL', label: 'Palestine'},
      {key: 'PAN', label: 'Panama'},
      {key: 'PNG', label: 'Papouasie Nouvelle Guinée'},
      {key: 'PAR', label: 'Paraguay'},
      {key: 'NED', label: 'Pays-Bas'},
      {key: 'WAL', label: 'Pays de Galles'},
      {key: 'PER', label: 'Pérou'},
      {key: 'PHI', label: 'Philippines'},
      {key: 'POL', label: 'Pologne'},
      {key: 'POR', label: 'Portugal'},
      {key: 'PUR', label: 'Porto Rico'},
      {key: 'QAT', label: 'Qatar'},
      {key: 'DOM', label: 'République Dominicaine'},
      {key: 'CZE', label: 'République Tchèque'},
      {key: 'RFA', label: 'RFA'},
      {key: 'ROM', label: 'Roumanie'},
      {key: 'RUS', label: 'Russie'},
      {key: 'RWA', label: 'Rwanda'},
      {key: 'SKN', label: 'Saint-Christophe-et-Niévès'},
      {key: 'LCA', label: 'Sainte-Lucie'},
      {key: 'SMR', label: 'Saint-Marin'},
      {key: 'VIN', label: 'Saint-Vincent-et-les Grenadines'},
      {key: 'SOL', label: 'Salomon'},
      {key: 'SLV', label: 'Salvador'},
      {key: 'SAM', label: 'Samoa Occidentales'},
      {key: 'STP', label: 'Sao Tomé-et-Principe'},
      {key: 'SEN', label: 'Sénégal'},
      {key: 'SER', label: 'Serbie'},
      {key: 'SEY', label: 'Seychelles'},
      {key: 'SLE', label: 'Sierra Leone'},
      {key: 'SIN', label: 'Singapour'},
      {key: 'SVK', label: 'Slovaquie'},
      {key: 'SVN', label: 'Slovénie'},
      {key: 'SOM', label: 'Somalie'},
      {key: 'SUD', label: 'Soudan'},
      {key: 'SRI', label: 'Sri Lanka'},
      {key: 'SWE', label: 'Suède'},
      {key: 'SUI', label: 'Suisse'},
      {key: 'SUR', label: 'Suriname'},
      {key: 'SWZ', label: 'Swaziland'},
      {key: 'SYR', label: 'Syrie'},
      {key: 'TJK', label: 'Tadjikistan'},
      {key: 'TAH', label: 'Tahiti'},
      {key: 'TAN', label: 'Tanzanie'},
      {key: 'CHA', label: 'Tchad'},
      {key: 'TCH', label: 'Tchécoslovaquie'},
      {key: 'THA', label: 'Thaïlande'},
      {key: 'TOG', label: 'Togo'},
      {key: 'TGA', label: 'Tonga'},
      {key: 'TRI', label: 'Trinité-et-Tobago'},
      {key: 'TUN', label: 'Tunisie'},
      {key: 'TKM', label: 'Turkménistan'},
      {key: 'TUR', label: 'Turquie'},
      {key: 'TUV', label: 'Tuvalu'},
      {key: 'UKR', label: 'Ukraine'},
      {key: 'URU', label: 'Uruguay'},
      {key: 'URS', label: 'URSS'},
      {key: 'VAN', label: 'Vanuatu'},
      {key: 'VEN', label: 'Venezuela'},
      {key: 'VIE', label: 'Viêt Nam'},
      {key: 'YEM', label: 'Yémen'},
      {key: 'YUG', label: 'Yougoslavie'},
      {key: 'ZAI', label: 'Zaïre'},
      {key: 'ZAM', label: 'Zambie'},
      {key: 'ZIM', label: 'Zimbabwe'}
     ];
  };

});
