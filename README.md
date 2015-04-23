# WiFiScanner
Sample application for probe request tracking.

Only tracks probe request for a specific SSID, ignoring the others.

## Requirements

* Linux or *BSD
* Node.js
* MongoDB
* Bower (for the client)
* Grunt (for the client)

This is intended for running on a Linux installation with a WiFi adapter capable of running in [Monitor mode](https://wiki.wireshark.org/CaptureSetup/WLAN#Turning_on_monitor_mode)

## Components

It's composed of 2 parts:
* A Node.js backend doing the scanning, storing the data (on MongoDB), and providing REST services to access the data.
* An AngularJS client to present the data in a user friendly manner.

## Model

The model uses the following objects:

* MAC address
* SSID
* Session

## Server

### Running

1. Start MongoDB (/etc/init.d/mongodb start on most distributions)
2. Switch the adapter to Monitor mode. In this example using wlan0: 
```ifconfig wlan0 stop
iwconfig wlan0 mode Monitor
ifconfig wlan0 start```
3. On the server directory: `node server.js [your_adapter]`. For example: `node server.js wlan0`

### Services

#### Scan start/stop

Start scanning for SSIDs: `GET http://localhost:3000/scan/ssid`
Stop scanning: `GET http://localhost:3000/scan/stop`
Get scanning status: `GET http://localhost:3000/scan`

#### SSIDs

Get all captured SSIDs: `GET http://localhost:3000/ssid`
Find MAC addresses probing for an SSID: `GET http://localhost:3000/ssid/[ssid_name]`

#### MAC addresses

Get all captured MAC addresses: `GET http://localhost:3000/from`
Get MAC address details (including vendor resolution): `GET http://localhost:3000/details/[from_mac_address]`
Update MAC address details: `POST http://localhost:3000/details/[from_mac_address]`

#### Sessions

Get all sessions: `GET http://localhost:3000/session`
Get a specific session: `GET http://localhost:3000/session/[session_number]`
Save a session: `POST http://localhost:3000/session/[session_number]`
