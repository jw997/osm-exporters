#!/bin/bash

file=$1
id=$2
jq . $file | grep -20 $id
