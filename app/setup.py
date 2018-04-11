#!/usr/bin/env python
# coding: utf-8

from subprocess import call
from os import getcwd, chdir
from argparse import ArgumentParser

parser = ArgumentParser(description='This script is ...')
parser.add_argument("-F", "--force", type=str, default="force", help="force")
args = parser.parse_args()

rootpath = getcwd()
print rootpath

# pip
#call(["pip", "install", "--upgrade", "pip"])
call(["sudo", "pip", "install", "-r", "requirements.txt"])
call(["sudo", "pip", "install", "git+https://github.com/strawlab/python-pcl"])

# ROSBridge
call(["sudo", "apt-get", "update"])
call(["sudo", "apt-get", "install", "curl"])

# npm, node
call(["sudo", "apt-get", "install", "-y", "nodejs", "npm"])
call(["sudo", "npm", "cache", "clean"])
call(["sudo", "npm", "install", "n", "-g"])
call(["sudo", "n", "stable"])
call(["sudo", "ln", "-sf", "/usr/local/bin/node", "/usr/bin/node"])

chdir("{}/views".format(rootpath))
call(["npm", "install"])
call(["sudo", "npm", "install", "--save", "-g", "gulp-cli"])

# res
#chdir("{}/controllers/res/detection".format(rootpath))
#call(["wget", "https://autoware.blob.core.windows.net/web-ui-resouces/calibration_camera_lidar_3d_prius_nic-150407.yml"])

if args.force == "force":
    chdir("{}/controllers/res".format(rootpath))
    call(["rm", "-f", "map"])
    call(["rm", "-f", "map.zip"])
    call(["wget", "https://autoware.blob.core.windows.net/web-ui-resouces/map.zip"])
    call(["unzip", "map.zip", "-d", "map"])
    call(["rm", "-f", "map.zip"])        
else:
    chdir("{}/controllers/res".format(rootpath))
    file_names = listdir("./")
    if "map" not in file_names:
        call(["rm", "-f", "map.zip"])
        call(["wget", "https://autoware.blob.core.windows.net/web-ui-resouces/map.zip"])
        call(["unzip", "map.zip", "-d", "map"])
        call(["rm", "-f", "map.zip"])
    

    
# env
chdir("{}/config".format(rootpath))
call(["ln", "-s", "sample.env", ".env"])
chdir("{}/views".format(rootpath))
call(["ln", "-s", "../config/.env", ".env"])
chdir("{}/controllers".format(rootpath))
call(["ln", "-s", "../config", "config"])

# gulp browserify
chdir("{}/views".format(rootpath))
call(["gulp", "browserify"])

