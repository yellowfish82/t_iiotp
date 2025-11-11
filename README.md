## t_iiotp
this is a web server play a role like IIoT platform 

## How to start a MQTT Server on mac
1. install
```
brew install mosquitto
```

2. launch mqtt server
- intel mac
```
/usr/local/sbin/mosquitto -c /usr/local/etc/mosquitto/mosquitto.conf
```
- m3 mac
```
/opt/homebrew/opt/mosquitto/sbin/mosquitto -c /opt/homebrew/etc/mosquitto/mosquitto.conf
```

3. sub data from mqtt server through topic: 'test/topic' 
```
mosquitto_sub -h localhost -t 'test/topic' -v
```

4. pub data through mqtt client through topic: 'test/topic' 10 times
```
mosquitto_pub -h localhost -t 'test/topic' --repeat 10 -m 'aaa'
```

## Chat with Ollama
1. run ollama in local
```
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
```

