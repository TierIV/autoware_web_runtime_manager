#!/usr/bin/env python
# coding: utf-8
from copy import deepcopy
from os import listdir
from os.path import realpath, abspath, dirname
from config.env import env
from controllers.ros_controller import ROSController
import traceback
import paho.mqtt.client as mqtt
import signal
import sys
import json
import urllib
import urllib2


class MqttRosLauncher:
    __initial_rtm_status = {
        # get ros launch status for button on/off of web page
        "buttonInit": {
            "topic": "",
            "subscribe": True
        },
        # setting save/load
        "settingSave": {
            "topic": "",
            "subscribe": True
        },
        "settingLoad": {
            "topic": "",
            "subscribe": True
        },
        # button launch signal and status,response
        "initialization": {
            "enable": True,
            "mode": "off",
            "topic": "",
            "subscribe": True
        },
        "map": {
            "enable": False,
            "mode": "off",
            "topic": "",
            "subscribe": True
        },
        "localization": {
            "enable": False,
            "mode": "off",
            "topic": "",
            "subscribe": True
        },
        "mission": {
            "enable": False,
            "mode": "off",
            "topic": "",
            "subscribe": True
        },
        "motion": {
            "enable": False,
            "mode": "off",
            "topic": "",
            "subscribe": True
        },
        "sensing": {
            "enable": False,
            "mode": "off",
            "topic": "",
            "subscribe": True
        },
        "detection": {
            "enable": False,
            "mode": "off",
            "topic": "",
            "subscribe": True
        },
        "rosbag": {
            "enable": False,
            "mode": "off",
            "topic": "",
            "subscribe": True
        },
        "play": {
            "enable": False,
            "mode": "off",
            "topic": "",
            "subscribe": True
        },
        "gateway": {
            "enable": False,
            "mode": "off",
            "topic": "",
            "subscribe": True
        },
        "on": {
            "enable": False,
            "mode": "off",
            "topic": "",
            "subscribe": True
        },
        "rviz": {
            "enable": False,
            "mode": "off",
            "topic": "",
            "subscribe": True
        },
        "setting": {
            "enable": False,
            "mode": "off",
            "topic": "",
            "subscribe": True
        },
        # get rosparam
        "get_param": {
            "topic": "",
            "subscribe": True
        },
        "ImageRaw": {
            "topic": "",
            "subscribe": False,
            "mqttparam": True
        },
        "points_raw": {
            "topic": "",
            "subscribe": False,
            "mqttparam": True
        },
        "ndt_pose": {
            "topic": "",
            "subscribe": False,
            "mqttparam": True
        },
        "tf": {
            "topic": "",
            "subscribe": False,
            "mqttparam": True
        },
        "vector_map": {
            "topic": "",
            "subscribe": False,
            "mqttparam": True
        },
        "lane_waypoints_array": {
            "topic": "",
            "subscribe": False,
            "mqttparam": True
        },
        "downsampled_next_target_mark": {
            "topic": "",
            "subscribe": False,
            "mqttparam": True
        },
        "downsampled_trajectory_circle_mark": {
            "topic": "",
            "subscribe": False,
            "mqttparam": True
        },
        "map_pose": {
            "topic": "",
            "subscribe": False,
            "mqttparam": True
        },
        "clock": {
            "topic": "",
            "subscribe": False,
            "mqttparam": True
        },
        "initialpose": {
            "topic": "",
            "subscribe": False,
            "mqttparam": True
        }
    }

    def __init__(self):
        self.rosController = ROSController(env)
        self.client = mqtt.Client(protocol=mqtt.MQTTv311)

    def TopicGet(self):
        url = "http://" + env["AUTOWARE_WEB_UI_HOST"] + ":" + env["AUTOWARE_WEB_UI_PORT"] + "/topicData"
        # url = "http://localhost:5000/topicData"
        try:
            params = urllib.urlencode({'name': "test"})
            req = urllib2.Request(url, params)
            res = urllib2.urlopen(req)
            json_data = json.loads(res.read())
            # set fixed data to variable and ros param.
            self.__userid = json_data["fixeddata"]["userid"]
            self.__carid = json_data["fixeddata"]["carid"]
            self.__toAutoware = json_data["fixeddata"]["toAutoware"]
            self.__fromAutoware = json_data["fixeddata"]["fromAutoware"]
            for key, value in json_data["topicdata"].items():
                if key in self.__initial_rtm_status:
                    self.__initial_rtm_status[key]["topic"] = value["topic"]
                    print(value["topic"])

            sf = open('./mqtt_setting/config.json', 'w')
            json.dump(json_data, sf)

            self.rtm_status = deepcopy(self.__initial_rtm_status)
            print(self.rtm_status)
            return True
        except urllib2.HTTPError, e:
            print e.code, e.reason
            return False

    def mqttStart(self):
        # mqtt setting
        self.client.on_connect = self.__on_connect
        self.client.on_message = self.__on_message
        self.client.on_disconnect = self.__on_disconnect
        self.client.connect(env["MQTT_HOST"], int(env["MQTT_PYTHON_PORT"]))

        self.client.loop_forever()

    def disConnect(self):
        print("disconnect")
        self.client.loop_stop()
        self.client.disconnect()

    def __exitRTM(self):
        print("exitRTM")
        self.rosController.killall()
        del self.rosController
        self.rosController = ROSController(env)
        return "ok"

    def __initializeRtmStatus(self):
        self.rtm_status = deepcopy(self.__initial_rtm_status)

    def __getRTMStatus(self):
        print("getRTMStatus")
        res = {
            "rtm_status": self.rtm_status,
            "parameter_info": self.rosController.get_params()
        }
        return json.dumps(res)

    def __settingSaveLoad(self, label, message):
        if label == "settingSave":
            return self.rosController.settingSave(message)
        elif label == "settingLoad":
            return self.rosController.settingLoad(message)
        else:
            return "error"

    def __roslaunch(self, domain, label, message):
        self.rtm_status[label]["mode"] = message
        try:
            if (domain, label) == ("rosbag", "play"):
                if message == "on":
                    self.rosController.play_rosbag()
                else:
                    self.rosController.pause_rosbag()
                return "ok"
            elif (domain, label) == ("gateway", "on"):
                if message == "on":
                    self.rosController.gateway_on()
                else:
                    self.rosController.gateway_off()
                return "ok"
            else:
                if (domain, label, message) == ("initialization", "initialization", "off"):
                    self.__exitRTM()
                    self.__initializeRtmStatus()
                self.rosController.launch(domain, label, message)
                return "ok"
        except:
            traceback.print_exc()
            return "error"

    def __settingParams(self, message):
        params = json.loads(message)
        if self.rosController.set_param(params):
            return "ok"
        else:
            return "error"

    def __execution(self, msg):
        space, header, body, direction = msg.topic.split("/")
        topic_type, domain, label = body.split(".")

        if topic_type == "buttonInit":
            return self.__getRTMStatus()
        elif topic_type == "settingSaveLoad":
            return self.__settingSaveLoad(label, msg.payload)
        elif topic_type == "button":
            return self.__roslaunch(domain, label, msg.payload)
        elif topic_type == "settingParams":
            return self.__settingParams(msg.payload)

    def __on_connect(self, client, userdata, flags, respons_code):
        print('status {0}'.format(respons_code))

        # topic name making and subscriber start
        header = "/" + self.__userid + "." + self.__carid
        direction = "/" + self.__toAutoware

        for key, value in self.rtm_status.items():
            if value["subscribe"]:
                body = "/" + value["topic"]
                topic = header + body + direction
                print(topic)
                self.client.subscribe(topic)

    def __on_message(self, client, userdata, msg):
        print(msg.topic + ' ' + str(msg.payload))
        res = self.__execution(msg)

        space, header, body, direction = msg.topic.split("/")
        topic = "/" + header + "/" + body + "/" + self.__fromAutoware
        self.client.publish(topic, str(res))

    def __on_disconnect(self, client, userdata, rc):
        sys.stderr.write("DisConnected result code " + str(rc))
        # logging.debug("DisConnected result code " + str(rc))
        # self.client.loop_stop()


mqtt_roslauncher = MqttRosLauncher()


def handler(signal, frame):
    mqtt_roslauncher.disConnect();
    sys.exit(0)


if __name__ == '__main__':
    signal.signal(signal.SIGINT, handler)

    if mqtt_roslauncher.TopicGet():
        mqtt_roslauncher.mqttStart()
