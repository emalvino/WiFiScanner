# WiFiScanner
Sample application for probe request tracking.

## Requirements

* Node.js
* MongoDB
* Bower (for the client)
* Grunt (for the client)

This is intended for running on a Linux installation with a WiFi adapter capable of running in `Monitor mode`. More details here: (https://wiki.wireshark.org/CaptureSetup/WLAN#Turning_on_monitor_mode)

## Components

It's composed of 2 parts:
* A Node.js backend doing the scanning, storing the data (on MongoDB), and providing REST services to access the data.
* An AngularJS client to present the data in a user friendly manner.

## Server

### Running

1. Start MongoDB (/etc/init.d/mongodb start on most distributions)
2. Switch the adapter to Monitor mode. In this example using wlan0: 
`ifconfig wlan0 stop
iwconfig wlan0 mode Monitor
ifconfig wlan0 start`
3. On the server directory: `node server.js [your_adapter]`. For example: `node server.js wlan0`

