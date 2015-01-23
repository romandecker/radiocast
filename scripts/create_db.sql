-- adapt this script to your needs

CREATE DATABASE radiocast_development;
CREATE DATABASE radiocast_test;
CREATE DATABASE radiocast_production;
CREATE USER "radiocast"@"localhost" IDENTIFIED BY "radiocast";
GRANT ALL PRIVILEGES ON radiocast_development.* TO "radiocast"@"localhost";
GRANT ALL PRIVILEGES ON radiocast_test.* TO "radiocast"@"localhost";
GRANT ALL PRIVILEGES ON radiocast_production.* TO "radiocast"@"localhost";

