CREATE TABLE equipos (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    nombre            VARCHAR(50) NOT NULL,
    abreviatura       VARCHAR(3)  NOT NULL,
    ciudad            VARCHAR(50) NOT NULL,
    estado            VARCHAR(5)  NOT NULL,
    conferencia       VARCHAR(5)  NOT NULL,
    division          VARCHAR(20) NOT NULL,
    arena             VARCHAR(60) NOT NULL,
    fundado           INT         NOT NULL,
    color_primario    VARCHAR(7)  NOT NULL,
    color_secundario  VARCHAR(7)  NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO equipos (id, nombre, abreviatura, ciudad, estado, conferencia, division, arena, fundado, color_primario, color_secundario) VALUES
(1,  'Boston Celtics',          'BOS', 'Boston',         'MA', 'Este',  'Atlantic',  'TD Garden',                  1946, '#007A33', '#BA9653'),
(2,  'Brooklyn Nets',           'BKN', 'Brooklyn',       'NY', 'Este',  'Atlantic',  'Barclays Center',            1967, '#000000', '#FFFFFF'),
(3,  'New York Knicks',         'NYK', 'New York',       'NY', 'Este',  'Atlantic',  'Madison Square Garden',      1946, '#006BB6', '#F58426'),
(4,  'Philadelphia 76ers',      'PHI', 'Philadelphia',   'PA', 'Este',  'Atlantic',  'Wells Fargo Center',         1946, '#006BB6', '#ED174C'),
(5,  'Toronto Raptors',         'TOR', 'Toronto',        'ON', 'Este',  'Atlantic',  'Scotiabank Arena',           1995, '#CE1141', '#000000'),

(6,  'Chicago Bulls',           'CHI', 'Chicago',        'IL', 'Este',  'Central',   'United Center',              1966, '#CE1141', '#000000'),
(7,  'Cleveland Cavaliers',     'CLE', 'Cleveland',      'OH', 'Este',  'Central',   'Rocket Mortgage FieldHouse', 1970, '#860038', '#FDBB30'),
(8,  'Detroit Pistons',         'DET', 'Detroit',        'MI', 'Este',  'Central',   'Little Caesars Arena',       1941, '#C8102E', '#1D42BA'),
(9,  'Indiana Pacers',          'IND', 'Indianapolis',   'IN', 'Este',  'Central',   'Gainbridge Fieldhouse',      1967, '#002D62', '#FDBB30'),
(10, 'Milwaukee Bucks',         'MIL', 'Milwaukee',      'WI', 'Este',  'Central',   'Fiserv Forum',               1968, '#00471B', '#EEE1C6'),

(11, 'Atlanta Hawks',           'ATL', 'Atlanta',        'GA', 'Este',  'Southeast', 'State Farm Arena',           1946, '#E03A3E', '#C1D32F'),
(12, 'Charlotte Hornets',       'CHA', 'Charlotte',      'NC', 'Este',  'Southeast', 'Spectrum Center',            1988, '#1D1160', '#00788C'),
(13, 'Miami Heat',              'MIA', 'Miami',          'FL', 'Este',  'Southeast', 'Kaseya Center',              1988, '#98002E', '#F9A01B'),
(14, 'Orlando Magic',           'ORL', 'Orlando',        'FL', 'Este',  'Southeast', 'Kia Center',                 1989, '#0077C0', '#C4CED4'),
(15, 'Washington Wizards',      'WAS', 'Washington',     'DC', 'Este',  'Southeast', 'Capital One Arena',          1961, '#002B5C', '#E31837'),

(16, 'Denver Nuggets',          'DEN', 'Denver',         'CO', 'Oeste', 'Northwest', 'Ball Arena',                 1967, '#0E2240', '#FEC524'),
(17, 'Minnesota Timberwolves',  'MIN', 'Minneapolis',    'MN', 'Oeste', 'Northwest', 'Target Center',              1989, '#0C2340', '#236192'),
(18, 'Oklahoma City Thunder',   'OKC', 'Oklahoma City',  'OK', 'Oeste', 'Northwest', 'Paycom Center',              1967, '#007AC1', '#EF3B24'),
(19, 'Portland Trail Blazers',  'POR', 'Portland',       'OR', 'Oeste', 'Northwest', 'Moda Center',                1970, '#E03A3E', '#000000'),
(20, 'Utah Jazz',               'UTA', 'Salt Lake City', 'UT', 'Oeste', 'Northwest', 'Delta Center',               1974, '#002B5C', '#F9A01B'),

(21, 'Golden State Warriors',   'GSW', 'San Francisco',  'CA', 'Oeste', 'Pacific',   'Chase Center',               1946, '#1D428A', '#FFC72C'),
(22, 'LA Clippers',             'LAC', 'Inglewood',      'CA', 'Oeste', 'Pacific',   'Intuit Dome',                1970, '#C8102E', '#1D428A'),
(23, 'Los Angeles Lakers',      'LAL', 'Los Angeles',    'CA', 'Oeste', 'Pacific',   'Crypto.com Arena',           1947, '#552583', '#FDB927'),
(24, 'Phoenix Suns',            'PHX', 'Phoenix',        'AZ', 'Oeste', 'Pacific',   'Footprint Center',           1968, '#1D1160', '#E56020'),
(25, 'Sacramento Kings',        'SAC', 'Sacramento',     'CA', 'Oeste', 'Pacific',   'Golden 1 Center',            1945, '#5A2D81', '#63727A'),

(26, 'Dallas Mavericks',        'DAL', 'Dallas',         'TX', 'Oeste', 'Southwest', 'American Airlines Center',   1980, '#00538C', '#002B5E'),
(27, 'Houston Rockets',         'HOU', 'Houston',        'TX', 'Oeste', 'Southwest', 'Toyota Center',              1967, '#CE1141', '#000000'),
(28, 'Memphis Grizzlies',       'MEM', 'Memphis',        'TN', 'Oeste', 'Southwest', 'FedExForum',                 1995, '#5D76A9', '#12173F'),
(29, 'New Orleans Pelicans',    'NOP', 'New Orleans',    'LA', 'Oeste', 'Southwest', 'Smoothie King Center',       1988, '#0C2340', '#C8102E'),
(30, 'San Antonio Spurs',       'SAS', 'San Antonio',    'TX', 'Oeste', 'Southwest', 'Frost Bank Center',          1967, '#C4CED4', '#000000');