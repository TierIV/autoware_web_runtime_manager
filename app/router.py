#!/usr/bin/env python
# coding: utf-8
from copy import deepcopy
from flask import Flask, request, send_from_directory, current_app, render_template, Response, jsonify
from flask_cors import CORS
from os import listdir
from os.path import realpath, abspath, dirname
from config.env import env
from controllers.vector_map_loader import VectorMap
import traceback
#from pprint import PrettyPrinter
import json

flask = Flask(__name__)
CORS(flask)

def api_response(code=200, message={}):
    response = jsonify(message)
    response.status_code = code
    return response

@flask.route('/', methods=["GET"])
def root():
    print("root")
    return send_from_directory(
        directory="./views/", filename="index.html")

@flask.route("/topicData", methods=["POST"])
def topicGetter():
    print("came to topicGetter")
    if request.method == "POST":
        name = request.form["name"]
        f = open('./topic.json', 'r')
        topic_init = json.load(f)
        topic_init["fixeddata"]["userid"]="test"
        topic_init["fixeddata"]["carid"]="test"        
        #print('json_dict:{}'.format(topic_init))
        return api_response(200, topic_init)
    else:
        return api_response(500, "")

@flask.route("/.config/model/<path:path>", methods=["GET"])
def getVehicleModel(path):
    print("getVehicleModel", path)
    return send_from_directory(
        directory=env["PATH_AUTOWARE_DIR"] + "/ros/src/.config/model/", filename=path, as_attachment=True)

@flask.route("/res/<type>/<path:path>", methods=["GET"])
def getResources(type, path):
    print("getResources", type, path)
    if type in ["lib", "node_modules", "build", "static"]:
        return send_from_directory(
            directory='./views/'+type+"/", filename=path, as_attachment=True)
    else:
        return api_response(500, {"type": type, "path": path})


@flask.route("/getVectorMapViewData")
def getVectorMapViewData():
    pathDir = realpath("./controllers/res/map/vectors/")+"/"
    vectorMap = VectorMap()
    vectorMap.load(pathDir)
    return api_response(code=200, message=vectorMap.getViewData())

@flask.route('/getPCDFileNames')
def getPCDFileNames():
    pathDir = realpath("./controllers/res/map/points/")
    file_names = list(filter(lambda x: ".pcd" in x, listdir(pathDir)))
    response = api_response(code=200, message={"fileNames": file_names})
    return response

#@flask.route('/getPCDFileNames')
#def getPCDFileNames():
#    pathDir = realpath("./controllers/res/map/points/")
#    return api_response(code=200, message=listdir(pathDir))


@flask.route('/getPCDFile/<filename>')
def getPCDFile(filename):
    pathDir = realpath("./controllers/res/map/points")
    return send_from_directory(
        directory=pathDir, filename=filename, as_attachment=True)

if __name__ == '__main__':
    print("flask run")
    flask.run(host=env["AUTOWARE_WEB_UI_HOST"], port=int(env["AUTOWARE_WEB_UI_PORT"]))#, processes=1, threaded=True)
    # flask.run(debug=True)
