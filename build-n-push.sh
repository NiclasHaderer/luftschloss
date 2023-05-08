
nx container url-shortener
nx container authentication

docker tag luftschloss/url-shortener:main andfaxle/url-shortener:latest
docker tag luftschloss/authentication:main andfaxle/authentication:latest

docker push andfaxle/url-shortener:latest
docker push andfaxle/authentication:latest
