# kurento-react

## Media server start
```
docker run --rm -p 8888:8888/tcp -p 5000-5050:5000-5050/udp -e KMS_MIN_PORT=5000 -e KMS_MAX_PORT=5050 kurento/kurento-media-server:latest
```

## signaling server start
```
cd kurento-react && node server.js
```

## app start
```
npm start
```
