#!/bin/bash
ifconfig wlp4s0 down
iwconfig wlp4s0 mode Monitor
ifconfig wlp4s0 up

