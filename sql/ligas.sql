ALTER TABLE equipos
    MODIFY abreviatura VARCHAR(8) NOT NULL,
    MODIFY conferencia VARCHAR(16) NOT NULL,
    MODIFY estado VARCHAR(8) NOT NULL,
    MODIFY division VARCHAR(24) NOT NULL,
    MODIFY nombre VARCHAR(60) NOT NULL;

ALTER TABLE equipos
    ADD COLUMN IF NOT EXISTS liga VARCHAR(8) NOT NULL DEFAULT 'NBA',
    ADD COLUMN IF NOT EXISTS minima INT NOT NULL DEFAULT 80;

UPDATE equipos SET liga = 'NBA';

UPDATE equipos SET minima = CASE abreviatura
    WHEN 'BOS' THEN 96 WHEN 'OKC' THEN 95 WHEN 'DEN' THEN 94 WHEN 'NYK' THEN 93
    WHEN 'GSW' THEN 93 WHEN 'LAL' THEN 92 WHEN 'MIL' THEN 92 WHEN 'CLE' THEN 91
    WHEN 'MIN' THEN 91 WHEN 'SAS' THEN 90 WHEN 'MIA' THEN 90 WHEN 'DAL' THEN 89
    WHEN 'HOU' THEN 89 WHEN 'LAC' THEN 88 WHEN 'PHI' THEN 87 WHEN 'IND' THEN 87
    WHEN 'PHX' THEN 86 WHEN 'MEM' THEN 85 WHEN 'ORL' THEN 84 WHEN 'SAC' THEN 84
    WHEN 'TOR' THEN 84 WHEN 'CHI' THEN 83 WHEN 'ATL' THEN 83 WHEN 'DET' THEN 82
    WHEN 'BKN' THEN 82 WHEN 'NOP' THEN 82 WHEN 'UTA' THEN 81 WHEN 'POR' THEN 80
    WHEN 'CHA' THEN 78 WHEN 'WAS' THEN 78
    ELSE minima END;

DELETE FROM equipos WHERE liga IN ('LNB', 'NCAA');

INSERT INTO equipos
    (nombre, abreviatura, ciudad, estado, conferencia, division, arena, fundado, color_primario, color_secundario, liga, minima)
VALUES
('Boca Juniors', 'BOC', 'Buenos Aires', 'CABA', 'LNB', 'Nacional', 'Microestadio Luis Conde', 1905, '#0033A0', '#F4C400', 'LNB', 72),
('San Lorenzo', 'SLO', 'Buenos Aires', 'CABA', 'LNB', 'Nacional', 'Polideportivo Roberto Pando', 1908, '#E30613', '#0033A0', 'LNB', 71),
('Quimsa', 'QUI', 'Santiago del Estero', 'SDE', 'LNB', 'Nacional', 'Estadio Ciudad', 1989, '#111111', '#F5C518', 'LNB', 70),
('Gimnasia (Comodoro)', 'GCR', 'Comodoro Rivadavia', 'CHU', 'LNB', 'Nacional', 'Socios Fundadores', 1917, '#007A33', '#FFFFFF', 'LNB', 70),
('Instituto', 'INS', 'Córdoba', 'CBA', 'LNB', 'Nacional', 'Gimnasio Ángel Sandrín', 1918, '#C8102E', '#FFFFFF', 'LNB', 68),
('Ferro', 'FER', 'Buenos Aires', 'CABA', 'LNB', 'Nacional', 'Estadio Héctor Etchart', 1904, '#006633', '#FFFFFF', 'LNB', 66),
('Regatas Corrientes', 'REG', 'Corrientes', 'COR', 'LNB', 'Nacional', 'Sede del club', 1923, '#003366', '#FFFFFF', 'LNB', 66),
('Peñarol (Mar del Plata)', 'PEN', 'Mar del Plata', 'BA', 'LNB', 'Nacional', 'Polideportivo Islas Malvinas', 1922, '#111111', '#F4C400', 'LNB', 65),
('Oberá Tenis Club', 'OTC', 'Oberá', 'MIS', 'LNB', 'Nacional', 'Sede del club', 1940, '#1B4F9C', '#FFFFFF', 'LNB', 64),
('Atenas', 'ATE', 'Córdoba', 'CBA', 'LNB', 'Nacional', 'Polideportivo Carlos Cerutti', 1938, '#007A33', '#FFFFFF', 'LNB', 64),
('San Martín (Corrientes)', 'SMC', 'Corrientes', 'COR', 'LNB', 'Nacional', 'Sede del club', 1932, '#C8102E', '#111111', 'LNB', 63),
('Olímpico (La Banda)', 'OLI', 'La Banda', 'SDE', 'LNB', 'Nacional', 'Sede del club', 1940, '#F5C518', '#111111', 'LNB', 62),
('Platense', 'PLA', 'Buenos Aires', 'CABA', 'LNB', 'Nacional', 'Microestadio Platense', 1905, '#6B2C3E', '#FFFFFF', 'LNB', 61),
('La Unión (Formosa)', 'LUF', 'Formosa', 'FOR', 'LNB', 'Nacional', 'Sede del club', 2000, '#C8102E', '#FFFFFF', 'LNB', 60),
('Argentino (Junín)', 'AJU', 'Junín', 'BA', 'LNB', 'Nacional', 'El Fortín de las Morochas', 1925, '#7BAFD4', '#FFFFFF', 'LNB', 60),
('Independiente (Oliva)', 'IDO', 'Oliva', 'CBA', 'LNB', 'Nacional', 'Sede del club', 1920, '#C8102E', '#FFFFFF', 'LNB', 58),
('Racing (Chivilcoy)', 'RCH', 'Chivilcoy', 'BA', 'LNB', 'Nacional', 'Sede del club', 1923, '#7BA7D4', '#FFFFFF', 'LNB', 56),
('Lanús', 'LAN', 'Lanús', 'BA', 'LNB', 'Nacional', 'Microestadio Antonio Rotili', 1915, '#6B0F1A', '#FFFFFF', 'LNB', 54),

('Duke', 'DUKE', 'Durham', 'NC', 'ACC', 'NCAA', 'Cameron Indoor', 1905, '#003087', '#FFFFFF', 'NCAA', 84),
('UConn', 'UCON', 'Storrs', 'CT', 'BE', 'NCAA', 'Gampel Pavilion', 1881, '#000E2F', '#F4F4F4', 'NCAA', 84),
('Kansas', 'KANS', 'Lawrence', 'KS', 'B12', 'NCAA', 'Allen Fieldhouse', 1865, '#0051BA', '#E8000D', 'NCAA', 83),
('Kentucky', 'UK', 'Lexington', 'KY', 'SEC', 'NCAA', 'Rupp Arena', 1865, '#0033A0', '#FFFFFF', 'NCAA', 83),
('North Carolina', 'UNC', 'Chapel Hill', 'NC', 'ACC', 'NCAA', 'Dean Smith Center', 1789, '#7BAFD4', '#13294B', 'NCAA', 82),
('UCLA', 'UCLA', 'Los Angeles', 'CA', 'B10', 'NCAA', 'Pauley Pavilion', 1919, '#2D68C4', '#FFD100', 'NCAA', 81),
('Gonzaga', 'ZAGA', 'Spokane', 'WA', 'WCC', 'NCAA', 'McCarthey Athletic Center', 1887, '#002967', '#C8102E', 'NCAA', 80),
('Houston', 'COUG', 'Houston', 'TX', 'B12', 'NCAA', 'Fertitta Center', 1927, '#C8102E', '#FFFFFF', 'NCAA', 80),
('Arizona', 'ARIZ', 'Tucson', 'AZ', 'B12', 'NCAA', 'McKale Center', 1885, '#CC0033', '#003366', 'NCAA', 79),
('Purdue', 'PUR', 'West Lafayette', 'IN', 'B10', 'NCAA', 'Mackey Arena', 1869, '#CEB888', '#000000', 'NCAA', 78),
('Auburn', 'AUB', 'Auburn', 'AL', 'SEC', 'NCAA', 'Neville Arena', 1856, '#0C2340', '#E87722', 'NCAA', 78),
('Tennessee', 'TENN', 'Knoxville', 'TN', 'SEC', 'NCAA', 'Food City Center', 1794, '#FF8200', '#FFFFFF', 'NCAA', 77),
('Alabama', 'BAMA', 'Tuscaloosa', 'AL', 'SEC', 'NCAA', 'Coleman Coliseum', 1831, '#9E1B32', '#FFFFFF', 'NCAA', 77),
('Florida', 'FLA', 'Gainesville', 'FL', 'SEC', 'NCAA', 'Exactech Arena', 1853, '#0021A5', '#FA4616', 'NCAA', 76),
('Marquette', 'MARQ', 'Milwaukee', 'WI', 'BE', 'NCAA', 'Fiserv Forum', 1881, '#003366', '#FFCC00', 'NCAA', 76),
('Michigan State', 'MSU', 'East Lansing', 'MI', 'B10', 'NCAA', 'Breslin Center', 1855, '#18453B', '#FFFFFF', 'NCAA', 76),
('Creighton', 'CREI', 'Omaha', 'NE', 'BE', 'NCAA', 'CHI Health Center', 1878, '#005CA9', '#FFFFFF', 'NCAA', 75),
('Illinois', 'ILL', 'Champaign', 'IL', 'B10', 'NCAA', 'State Farm Center', 1867, '#E84A27', '#13294B', 'NCAA', 75),
('St. John''s', 'SJU', 'Queens', 'NY', 'BE', 'NCAA', 'Madison Square Garden', 1870, '#C8102E', '#FFFFFF', 'NCAA', 74),
('Indiana', 'IU', 'Bloomington', 'IN', 'B10', 'NCAA', 'Assembly Hall', 1820, '#990000', '#EEEDEB', 'NCAA', 74),
('Villanova', 'VILL', 'Villanova', 'PA', 'BE', 'NCAA', 'Finneran Pavilion', 1842, '#00205B', '#13B5EA', 'NCAA', 74),
('Michigan', 'MICH', 'Ann Arbor', 'MI', 'B10', 'NCAA', 'Crisler Center', 1817, '#00274C', '#FFCB05', 'NCAA', 74),
('Texas', 'TEX', 'Austin', 'TX', 'SEC', 'NCAA', 'Moody Center', 1883, '#BF5700', '#FFFFFF', 'NCAA', 74),
('Baylor', 'BAY', 'Waco', 'TX', 'B12', 'NCAA', 'Foster Pavilion', 1845, '#154734', '#FFB81C', 'NCAA', 74),
('Louisville', 'LOU', 'Louisville', 'KY', 'ACC', 'NCAA', 'KFC Yum! Center', 1798, '#AD0000', '#000000', 'NCAA', 73),
('Iowa State', 'ISU', 'Ames', 'IA', 'B12', 'NCAA', 'Hilton Coliseum', 1858, '#C8102E', '#F1BE48', 'NCAA', 73),
('Arkansas', 'ARK', 'Fayetteville', 'AR', 'SEC', 'NCAA', 'Bud Walton Arena', 1871, '#9D2235', '#FFFFFF', 'NCAA', 73),
('Syracuse', 'CUSE', 'Syracuse', 'NY', 'ACC', 'NCAA', 'JMA Wireless Dome', 1870, '#D44500', '#002244', 'NCAA', 72),
('Saint Mary''s', 'SMC', 'Moraga', 'CA', 'WCC', 'NCAA', 'University Credit Union Pavilion', 1863, '#003366', '#A5ACAF', 'NCAA', 71),
('San Diego State', 'SDSU', 'San Diego', 'CA', 'MWC', 'NCAA', 'Viejas Arena', 1897, '#A6192E', '#000000', 'NCAA', 70),
('Memphis', 'TIGR', 'Memphis', 'TN', 'AAC', 'NCAA', 'FedExForum', 1912, '#003087', '#898D8D', 'NCAA', 70),
('Xavier', 'XAV', 'Cincinnati', 'OH', 'BE', 'NCAA', 'Cintas Center', 1831, '#0C2340', '#9EA2A2', 'NCAA', 70),
('Georgetown', 'GU', 'Washington', 'DC', 'BE', 'NCAA', 'Capital One Arena', 1789, '#041E42', '#8D817B', 'NCAA', 68),
('Dayton', 'DAY', 'Dayton', 'OH', 'A10', 'NCAA', 'UD Arena', 1850, '#CE1141', '#004B8D', 'NCAA', 66),
('Wichita State', 'WSU', 'Wichita', 'KS', 'AAC', 'NCAA', 'Charles Koch Arena', 1895, '#000000', '#FFCD00', 'NCAA', 66),
('VCU', 'VCU', 'Richmond', 'VA', 'A10', 'NCAA', 'Siegel Center', 1838, '#000000', '#F8B800', 'NCAA', 64),
('Loyola Chicago', 'LUC', 'Chicago', 'IL', 'A10', 'NCAA', 'Gentile Arena', 1870, '#922247', '#FFC72C', 'NCAA', 62);
