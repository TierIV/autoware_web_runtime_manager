/*import React from 'react';
  import ReactDOM from 'react-dom';
  import Responsive, { WidthProvider } from 'react-grid-layout';
  const ResponsiveReactGridLayout = WidthProvider(Responsive);
  import Button from "./button";
  import ROSLaunchRequest from "./roslaunch_request";
*/
import {WEB_UI_URL, MQTT_HOST_NAME, MQTT_PORT} from "./dotenv";
import {CONST} from "./const";

export default class MqttWrapper {

    constructor() {

        this.host = MQTT_HOST_NAME;
        this.port = parseInt(MQTT_PORT);

        //label is unique.
        //fixeddata : header and footer
        //topicdata :
        this.topics = {
            "fixeddata": {
                "userid": "",
                "carid": "",
                "toAutoware": "",
                "fromAutoware": ""
            },
            "topicdata": {
                "buttonInit": {
                    "domain": CONST.BUTTON_INIT.DOMAIN,
                    "label": CONST.BUTTON_INIT.LABEL,
                    "type": "buttonInit",
                    "topic": "",
                    "erroePublishMessage": "buttonInit topic can not publish.",
                    "callback": function () {
                    }
                },
                "settingSave": {
                    "domain": CONST.SETTING_SAVE.DOMAIN,
                    "label": CONST.SETTING_SAVE.LABEL,
                    "type": "settingSaveLoad",
                    "topic": "",
                    "erroePublishMessage": "settingSaveLoad topic can not publish.",
                    "callback": function () {
                    }
                },
                "settingLoad": {
                    "domain": CONST.SETTING_LOAD.DOMAIN,
                    "label": CONST.SETTING_LOAD.LABEL,
                    "type": "settingSaveLoad",
                    "topic": "",
                    "erroePublishMessage": "settingSaveLoad topic can not publish.",
                    "callback": function () {
                    }
                },
                "initialization": {
                    "domain": CONST.BUTTON.INITIALIZATION.DOMAIN,
                    "label": CONST.BUTTON.INITIALIZATION.LABEL,
                    "type": "button",
                    "topic": "",
                    "erroePublishMessage": "initialization topic can not publish.",
                    "callback": function () {
                    }
                },
                "map": {
                    "domain": CONST.BUTTON.MAP.DOMAIN,
                    "label": CONST.BUTTON.MAP.LABEL,
                    "type": "button",
                    "topic": "",
                    "erroePublishMessage": "map topic can not publish.",
                    "callback": function () {
                    }
                },
                "localization": {
                    "domain": CONST.BUTTON.LOCALIZATION.DOMAIN,
                    "label": CONST.BUTTON.LOCALIZATION.LABEL,
                    "type": "button",
                    "topic": "",
                    "erroePublishMessage": "localization topic can not publish.",
                    "callback": function () {
                    }
                },
                "mission": {
                    "domain": CONST.BUTTON.MISSION.DOMAIN,
                    "label": CONST.BUTTON.MISSION.LABEL,
                    "type": "button",
                    "topic": "",
                    "erroePublishMessage": "mission topic can not publish.",
                    "callback": function () {
                    }
                },
                "motion": {
                    "domain": CONST.BUTTON.MOTION.DOMAIN,
                    "label": CONST.BUTTON.MOTION.LABEL,
                    "type": "button",
                    "topic": "",
                    "erroePublishMessage": "motion topic can not publish.",
                    "callback": function () {
                    },
                },
                "sensing": {
                    "domain": CONST.BUTTON.SENSING.DOMAIN,
                    "label": CONST.BUTTON.SENSING.LABEL,
                    "type": "button",
                    "topic": "",
                    "erroePublishMessage": "sensing topic can not publish.",
                    "callback": function () {
                    }
                },
                "detection": {
                    "domain": CONST.BUTTON.DETECTION.DOMAIN,
                    "label": CONST.BUTTON.DETECTION.LABEL,
                    "type": "button",
                    "topic": "",
                    "erroePublishMessage": "detection topic can not publish.",
                    "callback": function () {
                    }
                },
                "rosbag": {
                    "domain": CONST.BUTTON.ROSBAG.DOMAIN,
                    "label": CONST.BUTTON.ROSBAG.LABEL,
                    "type": "button",
                    "topic": "",
                    "erroePublishMessage": "rosbag topic can not publish.",
                    "callback": function () {
                    }
                },
                "play": {
                    "domain": CONST.BUTTON.ROSBAG.DOMAIN,
                    "label": CONST.BUTTON.ROSBAG_PLAY.LABEL,
                    "type": "button",
                    "topic": "",
                    "erroePublishMessage": "rosbag_play topic can not publish.",
                    "callback": function () {
                    }
                },
                "gateway": {
                    "domain": CONST.BUTTON.GATEWAY.DOMAIN,
                    "label": CONST.BUTTON.GATEWAY.LABEL,
                    "type": "button",
                    "topic": "",
                    "erroePublishMessage": "gateway topic can not publish.",
                    "callback": function () {
                    }
                },
                "on": {
                    "domain": CONST.BUTTON.GATEWAY.DOMAIN,
                    "label": CONST.BUTTON.GATEWAY_ON.LABEL,
                    "type": "button",
                    "topic": "",
                    "erroePublishMessage": "gateway_on topic can not publish.",
                    "callback": function () {
                    }
                },
                "rviz": {
                    "domain": CONST.BUTTON.RVIZ.DOMAIN,
                    "label": CONST.BUTTON.RVIZ.LABEL,
                    "type": "button",
                    "topic": "",
                    "erroePublishMessage": "rviz topic can not publish.",
                    "callback": function () {
                    }
                },
                "setting": {
                    "domain": CONST.BUTTON.SETTING.DOMAIN,
                    "label": CONST.BUTTON.SETTING.LABEL,
                    "type": "button",
                    "topic": "",
                    "erroePublishMessage": "setting topic can not publish.",
                    "callback": function () {
                    }
                },
                "ImageRaw": {
                    "domain": CONST.VISUALIZATION_OBJECT.IMAGE_RAW,
                    "label": CONST.VISUALIZATION_OBJECT.IMAGE_RAW,
                    "type": "image",
                    "topic": "",
                    "callback": function () {
                    }
                },
                "points_raw": {
                    "topic": "",
                    "callback": function () {
                    }
                },
                "ndt_pose": {
                    "topic": "",
                    "callback": function () {
                    }
                },
                "tf": {
                    "topic": "",
                    "callback": function () {
                    }
                },
                "vector_map": {
                    "topic": "",
                    "callback": function () {
                    }
                },
                "lane_waypoints_array": {
                    "topic": "",
                    "callback": function () {
                    }
                },
                "downsampled_next_target_mark": {
                    "topic": "",
                    "callback": function () {
                    }
                },
                "downsampled_trajectory_circle_mark": {
                    "topic": "",
                    "callback": function () {
                    }
                },
                "map_pose": {
                    "topic": "",
                    "callback": function () {
                    }
                },
                "get_param": {
                    "topic": "",
                    "callback": function () {
                    }
                },
                "clock": {
                    "topic": "",
                    "callback": function () {
                    }
                },
                "initialpose": {
                    "topic": "",
                    "callback": function () {
                    }
                }
            }
        };

        let time = new Date();
        let clientId = "wrmClient" + String(time.getTime());
        this.mqttClient = new Paho.MQTT.Client(this.host, this.port, clientId);

        this.mqttClient.onConnectionLost = onConnectionLost;
        this.mqttClient.onMessageArrived = onMessageArrived.bind(this);

        function onConnect() {
            //console.log("mqtt onConnect");
            // Once a connection has been made, make a subscription.
            for (const key of Object.keys(this.topics["topicdata"])) {
                this.onSubscribeTopic(key);
            }
            //get button status that the autoware has.
            this.onPublish("buttonInit", "GET");
        }

        function onMessageArrived(message) {

            const topic_factor = message.destinationName.split("/");
            const message_factor = topic_factor[2].split(".");
            const index = message_factor[2];
            this.topics["topicdata"][index].callback(message);
        }

        // called when the client loses its connection
        function onConnectionLost(responseObject) {
            if (responseObject.errorCode !== 0) {
                console.log("onConnectionLost:" + responseObject.errorMessage);

                alert("disconnect mqtt");
            }
        }

        const url = WEB_UI_URL + "/topicData";
        let data = new FormData();
        data.append("name", "test");
        fetch(url,
            {
                method: "POST",
                body: data
            })
            .then((response) => {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
            .then((json) => {
                this.topics["fixeddata"]["userid"] = json["fixeddata"]["userid"];
                this.topics["fixeddata"]["carid"] = json["fixeddata"]["carid"];
                this.topics["fixeddata"]["toAutoware"] = json["fixeddata"]["toAutoware"];
                this.topics["fixeddata"]["fromAutoware"] = json["fixeddata"]["fromAutoware"];
                for (const key in this.topics["topicdata"]) {
                    //console.log(key);
                    this.topics["topicdata"][key]["topic"] = json["topicdata"][key]["topic"];
                }

                // connect the client
                this.mqttClient.connect({onSuccess: onConnect.bind(this)});
            })
            .catch((e) => {
                console.error(e);
            });
    }

    //arg label:set key of this.topics.topicdata
    onPublish(label, msg){
        // console.log(label,msg);
        try {
            var message = new Paho.MQTT.Message(msg);
            message.destinationName = this.getPublishTopicName(label);
            this.mqttClient.send(message);

            // console.log("pub topic name:" + message.destinationName);
            // console.log("pub message:" + message.payloadString);
        } catch (error) {
            console.log("error:" + error);
            if ("errorPublishMessage" in this.topics["topicdata"][label]) {
                alert(this.topics["topicdata"][label]["errorPublishMessage"]);
            }
        }
    }

    //label:set key of topicdata of this.topics
    onSubscribeTopic(label) {
        const topic_name = this.getSubscribeTopicName(label);
        if (topic_name !== "") {
            this.mqttClient.subscribe(topic_name);
        }
        //console.log("topic subscribe:" + topic_name);
    }



    //label:set key of topicdata of this.topics
    onSubscribeTopicWithMethod(label, method) {
        const topic_name = this.getSubscribeTopicName(label);
        if (topic_name !== "") {
            this.mqttClient.subscribe(topic_name, {onSuccess: method});
        }
        //console.log("topic subscribe:" + topic_name);
    }

    //arg label:set key of this.topics.topicdata
    unSubscribeTopic(label) {
        const topic_name = this.getSubscribeTopicName(label);
        this.mqttClient.unsubscribe(topic_name);
        //console.log("topic unsubscribe:" + topic_name);
    }

    //arg label:set key of this.topics.topicdata
    setCallback(label, callback) {
        //console.log(label + " callback set");
        //console.log(callback);
        try {
            this.topics["topicdata"][label]["callback"] = callback;
        } catch (error) {
            console.log(label + " serror:" + error);
        }
    }

    //header and direction is fixed.These are subscribed from web server
    //body is topic of this.topics.topicdata
    getPublishTopicName(label) {
        try {
            const head = this.topics["fixeddata"]
            const header = "/" + head["userid"] + "." + head["carid"];
            const direction = "/" + head["toAutoware"];
            const body = "/" + this.topics["topicdata"][label]["topic"];
            return header + body + direction;
        } catch (error) {
            return "";
        }
    }

    //header and direction is fixed.These are subscribed from web server
    //body is topic of this.topics.topicdata
    getSubscribeTopicName(label) {
        try {
            const head = this.topics["fixeddata"]
            const header = "/" + head["userid"] + "." + head["carid"];
            const direction = "/" + head["fromAutoware"];
            const body = "/" + this.topics["topicdata"][label]["topic"];
            return header + body + direction;
        } catch (error) {
            return "";
        }
    }

    disConnect() {
        console.log("disconnect");
        this.mqttClient.disonnet();
    }
}
