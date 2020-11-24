#!/bin/bash
docker-compose build
LOGIN=$1 PASSWORD=$2 docker-compose up