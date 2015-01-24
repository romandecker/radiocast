#!/bin/bash

# ./record.sh stream output seconds
# jjj stream:  http://abc.stream.hostworks.com.au:8000/

streamripper $1 -a $2.aac -l $3
rm $2.cue
