#!/usr/bin/env python
# coding: utf-8

import rospy
import roslaunch

import json
import yaml
import sys
import codecs

from copy import deepcopy
from glob import glob
from subprocess import call, Popen
from os import listdir
from os.path import abspath, dirname, join, isdir
from time import sleep

from .rosbag_controller import ROSBAGController
from ros_param_const import CONST


class ROSController(object):

    __initial_parameter_info = {
        "settingParams": {
            "TFBaseToVelodyne": {
                "tf_x": 0,
                "tf_y": 0,
                "tf_z": 0,
                "tf_yaw": 0,
                "tf_pitch": 0,
                "tf_roll": 0,
                "flag": False
            },
            "vehicleModel": {
                "data": "",
                "flag": False
            },
            "map": {
                "location": "",
                "flag": False
            },
            "rosbag": {
                "rosbag_name": "",
                "start_time": 0,
                "rate": 1,
                "repeat": "",
                "flag": False
            },
            "waypoints": {
                "waypoints_name": "",
                "flag": False
            },
            "rviz": {
                "rviz_setting_file": "",
                "flag": False
            },
            "display_data": {
                "location": {
                    "location_list": []
                },
                "rosbag": {
                    "rosbag_list": {}
                },
                "waypoints": {
                    "waypoints_list": {}
                },
                "setting": {
                    "save_file_list": []
                },
                "flag": False
            }
        }
    }

    def __init__(self, env):
        self.__pids = []
        self.__env = env
        self.__devnull = open("/dev/null", 'w')
        self.__results = {}
        self.__popens = {}
        self.__rosbag = ROSBAGController()

        self.__path = abspath(dirname(__file__))

        self.__launches = {}
        self.__launchers = {}
        self.__uuid = roslaunch.rlutil.get_or_generate_uuid(None, False)
        roslaunch.configure_logging(self.__uuid)

        # parameter
        self.__location = ""
        self.__pointsmap_paths = ""
        self.__vectormap_paths = ""
        self.__tf = ""
        self.__rosbag_path = ""
        self.__rosbag_start_time = ""
        self.__rosbag_rate = ""
        self.__rosbag_repeat = ""
        self.__waypoints_path = ""
        self.__rviz_setting_path = ""

        self.__parameter_info = deepcopy(self.__initial_parameter_info)

        # set parameter info
        files = listdir(self.__path + CONST["MAPPATH"]["BASEPATH"])
        self.__parameter_info["settingParams"]["display_data"]["location"]["location_list"] = \
            [f for f in files if isdir(join(self.__path + CONST["MAPPATH"]["BASEPATH"], f))]
        for loc in self.__parameter_info["settingParams"]["display_data"]["location"]["location_list"]:
            self.__parameter_info["settingParams"]["display_data"]["rosbag"]["rosbag_list"][loc] = \
                listdir(self.__path + CONST["ROSBAG"]["BASEPATH"] + "/" + loc + "/")

        for loc in self.__parameter_info["settingParams"]["display_data"]["location"]["location_list"]:
            self.__parameter_info["settingParams"]["display_data"]["waypoints"]["waypoints_list"][loc] = \
                listdir(self.__path + CONST["WAYPOINTSPATH"]["BASEPATH"] + "/" + loc + "/")
        self.__parameter_info["settingParams"]["display_data"]["setting"]["save_file_list"] = \
            listdir(self.__path + CONST["SETTING"]["PATH"])

        self.set_init_parameter()

    def __del__(self):
        self.__devnull.close()

    def set_roslaunch_argument(self, domain, launch_list):
        res_list = launch_list
        if domain == "map":
            if self.__pointsmap_paths != "":
                res_list.append(self.__pointsmap_paths)
            if self.__vectormap_paths != "":
                res_list.append(self.__vectormap_paths)
            if self.__tf != "":
                res_list.append(self.__tf)
        elif domain == "rviz":
            if self.__rviz_setting_path != "":
                res_list.append("rviz_setting_path:=" + self.__rviz_setting_path)
        elif domain == "rosbag":
            if self.__rosbag_path != "":
                res_list.append(self.__rosbag_path)
            if self.__rosbag_start_time != "":
                res_list.append(self.__rosbag_start_time)
            if self.__rosbag_rate != "":
                res_list.append(self.__rosbag_rate)
            if self.__rosbag_repeat != "":
                res_list.append(self.__rosbag_repeat)
        elif domain == "mission":
            if self.__waypoints_path != "":
                res_list.append(self.__waypoints_path)
        else:
            pass
        return res_list

    def launch(self, domain="map", target="map", mode="on"):
        launch_id = "/".join([domain, target])
        if mode == "on":
            launch_list = ["roslaunch", self.__path + "/res/{}/{}.launch".format(domain, target)]
            launch_list = self.set_roslaunch_argument(domain, launch_list)
            self.__launchers[launch_id] = Popen(launch_list)
            """
            self.__launches[launch_id] = roslaunch.parent.ROSLaunchParent(
            self.__uuid, [self.__path + "/res/{}/{}.launch".format(domain, target)])
            self.__launches[launch_id].start()
            """
        else:
            if launch_id in self.__launches or launch_id in self.__launchers:
                self.__launchers[launch_id].terminate()

        return True

    def killall(self):
        for launch in self.__launches.values():
            launch.shutdown()
        call(["pkill", "-f", "ros"])
        call(["pkill", "-f", "rosbag"])
        return True

    def get_rosbag_state(self):
        current_prev, duration = self.__rosbag.get_progress()
        if duration is None:
            return "stop"
        else:
            current, duration = self.__rosbag.get_progress()
            if current == current_prev:
                return "pause"
            else:
                return "play"

    def load_rosbag(self):
        self.__rosbag.load(self.__env["PATH_ROSBAG_FILE"])
        sleep(1)
        self.__rosbag.play()
        sleep(1)
        self.__rosbag.pause()
        return True

    def play_rosbag(self):
        self.__rosbag.play()

    def pause_rosbag(self):
        self.__rosbag.pause()

    def stop_rosbag(self):
        self.__rosbag.stop()

    def gateway_on(self):
        self.launch(domain="gateway", target="on")

    def gateway_off(self):
        self.launch(domain="gateway", target="off")

    def settingSave(self, message):
        filename = self.__path + CONST["SETTING"]["PATH"] + message
        try:
            fw = open(filename, "w")
            json.dump(self.__parameter_info, fw)
            self.__parameter_info["settingParams"]["display_data"]["setting"]["save_file_list"] = \
                listdir(self.__path + CONST["SETTING"]["PATH"])
            return json.dumps(self.__parameter_info)
        except IOError:
            sys.stderr.write("Error:Fail to save setting file!")
            return {"settingParams": "error"}

    def settingLoad(self, message):
        filename = self.__path + CONST["SETTING"]["PATH"] + message

        try:
            fr = open(filename, "r")
            load_setting = json.loads(fr.read())
            load_setting["settingParams"]["display_data"] = self.__parameter_info["settingParams"]["display_data"]

            return json.dumps(load_setting)
        except IOError:
            sys.stderr.write("Error:Fail to load setting file!")
            return {"settingParams": "error"}

    def get_params(self):
        for loc in self.__parameter_info["settingParams"]["display_data"]["location"]["location_list"]:
            self.__parameter_info["settingParams"]["display_data"]["rosbag"]["rosbag_list"][loc] = \
                listdir(self.__path + CONST["ROSBAG"]["BASEPATH"] + "/" + loc + "/")

        for loc in self.__parameter_info["settingParams"]["display_data"]["location"]["location_list"]:
            self.__parameter_info["settingParams"]["display_data"]["waypoints"]["waypoints_list"][loc] = \
                listdir(self.__path + CONST["WAYPOINTSPATH"]["BASEPATH"] + "/" + loc + "/")
        self.__parameter_info["settingParams"]["display_data"]["setting"]["save_file_list"] = listdir(self.__path + CONST["SETTING"]["PATH"])

        return self.__parameter_info

    # Set toyota
    def set_init_parameter(self):
        init_param = self.__parameter_info["settingParams"]

        init_param["map"]["location"] = "toyota"
        init_param["map"]["flag"] = True

        init_param["rosbag"]["rosbag_name"] = init_param["display_data"]["rosbag"]["rosbag_list"]["toyota"][0]
        init_param["rosbag"]["flag"] = True

        init_param["waypoints"]["waypoints_name"] = init_param["display_data"]["waypoints"]["waypoints_list"]["toyota"][0]
        init_param["waypoints"]["flag"] = True

        self.set_param(init_param)

    def launch_parameter(self, domain, name, args):
        launch_list = list()
        launch_list.append("roslaunch")
        launch_list.append(self.__path + "/res/{}/{}.launch".format(domain, name))
        for key, value in args.items():
            arg = key + ":=" + str(value)
            launch_list.append(arg)
        launch_id = "/".join([domain, name])

        if launch_id in self.__launchers:
            self.__launchers[launch_id].terminate()

        self.__launchers[launch_id] = Popen(launch_list)

    def memory_param(self, params):
        for key, value in params.items():
            if value["flag"]:
                self.__parameter_info["settingParams"][key] = value
        return True

    def set_base_to_velodyne(self, tf_param):
        if not tf_param["flag"]:
            return True
        self.launch_parameter("parameter", "TFBaseToVelodyne", tf_param)
        return True

    def set_vehicle_model(self, model_param):
        if model_param["data"] == "" or not model_param["flag"]:
            return True
        model_path = CONST["VEHICLEMODELPATH"][model_param["data"]]
        self.launch_parameter("parameter", "vehicleModel", {"model_path": model_path})
        return True

    def set_map(self, map_param):
        if not map_param["flag"]:
            return True
        location = map_param["location"]
        self.__location = location if location != "" else "toyota"
        self.__pointsmap_paths = ""
        self.__vectormap_paths = ""
        points_base_path = self.__path + CONST["MAPPATH"]["BASEPATH"] + "/" + location + "/" + CONST["MAPPATH"]["POINTSMAP"] + "*"
        for path in glob(points_base_path):
            self.__pointsmap_paths += path + " "
        vector_base_path = self.__path + CONST["MAPPATH"]["BASEPATH"] + "/" + location + "/" + CONST["MAPPATH"]["VECTORMAP"] + "*"
        for path in glob(vector_base_path):
            self.__vectormap_paths += path + " "
        self.__pointsmap_paths = "pointsmap_path:=" + self.__pointsmap_paths
        self.__vectormap_paths = "vectormap_path:=" + self.__vectormap_paths
        self.__tf = "tf_path:=" + self.__path + CONST["MAPPATH"]["BASEPATH"] + "/" + location + "/" + CONST["MAPPATH"]["TF"]

        return True

    def set_rosbag(self, rosbag_param):
        if not rosbag_param["flag"]:
            return True

        self.__rosbag_path = "rosbag_path:=" + self.__path + \
                             CONST["ROSBAG"]["BASEPATH"] + "/" + self.__location + "/" + rosbag_param["rosbag_name"]

        self.__rosbag_start_time = "start_time:=" + str(rosbag_param["start_time"])
        self.__rosbag_rate = "rate:=" + str(rosbag_param["rate"])
        if rosbag_param["repeat"]:
            self.__rosbag_repeat = "repeat:=" + CONST["ROSBAG"]["REPEAT"]
        return True

    def set_waypoints(self, waypoints_param):
        if not waypoints_param["flag"]:
            return True

        self.__waypoints_path = "waypoints_path:=" + self.__path + \
                                CONST["WAYPOINTSPATH"]["BASEPATH"] + "/" + self.__location + "/" + waypoints_param["waypoints_name"]
        return True

    def set_rviz(self, rviz_param):
        if not rviz_param["flag"]:
            return True
        try:
            # print(yaml.dump(rviz_param["rviz_setting_file"]))
            file_path = self.__path + CONST["RVIZSETTING"]["PATH"] + CONST["RVIZSETTING"]["NAME"]
            rviz_setting = rviz_param["rviz_setting_file"]
            with codecs.open(file_path, "w", "utf-8") as f:
                yaml.safe_dump(rviz_setting, f, encoding='utf-8', allow_unicode=True)

            self.__rviz_setting_path = file_path
            return True
        except IOError:
            sys.stderr.write("Error:Fail to save rviz setting file!")
            return False

    def set_param(self, params):
        res = True
        res = res and self.memory_param(params)
        res = res and self.set_base_to_velodyne(params["TFBaseToVelodyne"])
        res = res and self.set_vehicle_model(params["vehicleModel"])
        res = res and self.set_map(params["map"])
        res = res and self.set_rosbag(params["rosbag"])
        res = res and self.set_waypoints(params["waypoints"])
        res = res and self.set_rviz(params["rviz"])
        return res
