-- adapt this script to your needs

CREATE DATABASE yourapp_development;
CREATE DATABASE yourapp_test;
CREATE DATABASE yourapp_production;
CREATE USER "yourapp"@"localhost" IDENTIFIED BY "yourpassword";
GRANT ALL PRIVILEGES ON yourapp_development.* TO "yourapp"@"localhost";
GRANT ALL PRIVILEGES ON yourapp_test.* TO "yourapp"@"localhost";
GRANT ALL PRIVILEGES ON yourapp_production.* TO "yourapp"@"localhost";

