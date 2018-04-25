#!/usr/bin/env python
# coding: utf-8
import sys
import rospy
import cv2
from std_msgs.msg import String
from sensor_msgs.msg import Image
from cv_bridge import CvBridge, CvBridgeError
import paho.mqtt.client as mqtt
import base64
import signal
import json


# from __future__ import print_function

class ImageMqttPublisher:

    def __init__(self):
        rospy.init_node('wrm_image_publisher', anonymous=True)

        topic_params_string = rospy.get_param("~topic_params", {})
        topic_params = json.loads(topic_params_string)

        self.__host = topic_params["host"]
        self.__port = topic_params["port"]
        self.mqttPubTopic = topic_params["topic_send"]
        self.mqttSubTopic = topic_params["topic_receive"]

        self.bridge = CvBridge()

        self.client = mqtt.Client(protocol=mqtt.MQTTv311)

    def onStartMqtt(self):
        self.client.on_connect = self.__onConnect
        self.client.on_message = self.__onMessage
        self.client.on_disconnect = self.__onDisconnect
        self.client.connect(self.__host, int(self.__port))
        self.client.loop_start()

        # mqtt function

    def onMqttPublish(self, message):
        self.client.publish(self.mqttPubTopic, message, 0)

    def disConnect(self):
        print("切断します")
        self.client.loop_stop()
        self.client.disconnect()

    # mqtt callback function
    def __onConnect(self, client, userdata, flags, respons_code):
        print('status {0}'.format(respons_code))
        print("mqtt connect.")

        self.client.subscribe(self.mqttSubTopic)

    def __onMessage(self, cliet, usedata, msg):
        # print(msg.topic + "  " + str(msg.payload));
        self.message_name, w, h, self.quality = msg.payload.split(".")
        self.width = int(w)
        self.height = int(h)
        self.rosImageSub = rospy.Subscriber(self.message_name, Image, self.rosSubCallback)

    def __onDisconnect(self, client, userdata, rc):
        print("DisConnected result code " + str(rc))

    # ros callback function
    def convertImageToBase64(self, image):
        encoded = base64.b64encode(image)
        return encoded

    def rosSubCallback(self, data):
        try:
            cv_image = self.bridge.imgmsg_to_cv2(data, "bgr8")
        except CvBridgeError as e:
            print(e)

        resize_image = cv2.resize(cv_image, (self.width, self.height))

        encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 20]
        res, img = cv2.imencode('.jpg', resize_image, encode_param)
        dimg = self.convertImageToBase64(img)
        self.onMqttPublish(dimg)


ip = ImageMqttPublisher()


def main():
    print("WRM_mqtt_publisher run.")
    ip.onStartMqtt()
    try:
        rospy.spin()
    except KeyboardInterrupt:
        print("Shutting down")


def handler(signal, frame):
    ip.disConnect();
    sys.exit(0)


if __name__ == '__main__':
    signal.signal(signal.SIGINT, handler)
    main()
