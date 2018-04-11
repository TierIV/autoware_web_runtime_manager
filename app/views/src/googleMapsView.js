import {WEB_UI_URL} from "./dotenv";
//import {getROSConnection} from "./ros_interface";

export default class GoogleMapsView {
    constructor() {
        this.map = null;
        this.elementID = null;
        this.viewData = null;
        //this.ros = null;
        this.vehicle = null;
        this.updatedTime = Math.round(Date.now() * 0.001);
        this.location = "";
        this.mqttClient = {};
    }

    run(location) {
        /*
            if(this.ros === null){
                this.ros = getROSConnection();
            }
            this.vehiclePoseTopic = new ROSLIB.Topic({
                ros: this.ros,
                name : "/ndt_pose",
                messageType : 'geometry_msgs/PoseStamped',
            });
        */


        let that = this;
        const xhttpSpots = new XMLHttpRequest();
        xhttpSpots.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                that.viewData = JSON.parse(this.responseText);
                that.initMap();
            }
        };
        xhttpSpots.open("GET", WEB_UI_URL + "/getVectorMapViewData?location=" + this.location, true);
        xhttpSpots.send();
    }

    setLocation(loc){
        this.location = loc
    }

    setMqttClient(client) {
        this.mqttClient = client;
    }

    initMap() {
        console.log("initMap", this.viewData);

        this.map = new google.maps.Map(document.getElementById(this.elementID), {
            zoom: 16,
            center: {
                lat: parseFloat(this.viewData["viewPoint"]["lat"]),
                lng: parseFloat(this.viewData["viewPoint"]["lng"])
            },
            mapTypeId: 'terrain'
        });

        this.drawDTLanes();
        this.drawVehicle();
    };

    drawVehicle() {
        let that = this;
        var getMapPoseMethod = function (msg) {
            var message = JSON.parse(msg.payloadString)
            //this.vehiclePoseTopic.subscribe(function(message) {
            const currentTime = Math.round(Date.now() * 0.001);
            if (that.updatedTime < currentTime) {
                that.updatedTime = currentTime;

                let distance_min = null;
                let lat, lng, dir;
                for (const dtlane of Object.values(that.viewData.dtlanes)) {
                    const pid = dtlane.PID;
                    const bx = that.viewData.points[pid].Bx;
                    const ly = that.viewData.points[pid].Ly;
                    const distance = Math.hypot(bx - message.pose.position.y, ly - message.pose.position.x);
                    if (distance_min === null) {
                        distance_min = distance;
                        lat = that.viewData.points[pid].lat;
                        lng = that.viewData.points[pid].lng;
                        dir = parseFloat(dtlane.Dir);
                    }
                    else {
                        if (distance < distance_min) {
                            distance_min = distance;
                            lat = that.viewData.points[pid].lat;
                            lng = that.viewData.points[pid].lng;
                            dir = parseFloat(dtlane.Dir);
                        }
                    }
                }

                const rotation = -(dir / Math.PI) * 180.0 + 90.0;
                if (distance_min < 1.5) {
                    if (that.vehicle === null) {
                        that.vehicle = new google.maps.Marker({
                            position: {lat: lat, lng: lng},
                            map: that.map,
                            draggable: false,
                            icon: {
                                path: "M29.395,0H17.636c-3.117,0-5.643,3.467-5.643,6.584v34.804c0,3.116,2.526,5.644,5.643,5.644h11.759 c3.116,0,5.644-2.527,5.644-5.644V6.584C35.037,3.467,32.511,0,29.395,0z M34.05,14.188v11.665l-2.729,0.351v-4.806L34.05,14.188z M32.618,10.773c-1.016,3.9-2.219,8.51-2.219,8.51H16.631l-2.222-8.51C14.41,10.773,23.293,7.755,32.618,10.773z M15.741,21.713 v4.492l-2.73-0.349V14.502L15.741,21.713z M13.011,37.938V27.579l2.73,0.343v8.196L13.011,37.938z M14.568,40.882l2.218-3.336 h13.771l2.219,3.336H14.568z M31.321,35.805v-7.872l2.729-0.355v10.048L31.321,35.805z",
                                fillColor: "#00a3e0",
                                fillOpacity: .6,
                                anchor: new google.maps.Point(24, 25),
                                strokeWeight: 0,
                                rotation: rotation,
                                scale: 1
                            }
                        });
                        that.map.setCenter(new google.maps.LatLng(lat, lng));
                    }
                    else {
                        that.vehicle.setPosition(new google.maps.LatLng(lat, lng));
                        that.vehicle.setIcon({
                            path: "M29.395,0H17.636c-3.117,0-5.643,3.467-5.643,6.584v34.804c0,3.116,2.526,5.644,5.643,5.644h11.759 c3.116,0,5.644-2.527,5.644-5.644V6.584C35.037,3.467,32.511,0,29.395,0z M34.05,14.188v11.665l-2.729,0.351v-4.806L34.05,14.188z M32.618,10.773c-1.016,3.9-2.219,8.51-2.219,8.51H16.631l-2.222-8.51C14.41,10.773,23.293,7.755,32.618,10.773z M15.741,21.713 v4.492l-2.73-0.349V14.502L15.741,21.713z M13.011,37.938V27.579l2.73,0.343v8.196L13.011,37.938z M14.568,40.882l2.218-3.336 h13.771l2.219,3.336H14.568z M31.321,35.805v-7.872l2.729-0.355v10.048L31.321,35.805z",
                            fillColor: "#00a3e0",
                            fillOpacity: .6,
                            anchor: new google.maps.Point(24, 25),
                            strokeWeight: 0,
                            rotation: rotation,
                            scale: 1
                        });
                        that.map.setCenter(new google.maps.LatLng(lat, lng));
                    }
                }
                else {
                    const lat = that.viewData.viewPoint.lat;
                    const lng = that.viewData.viewPoint.lng;
                    const rotation = 0;
                    const color = "#A9A9A9";
                    if (that.vehicle === null) {
                        that.vehicle = new google.maps.Marker({
                            position: {lat: lat, lng: lng},
                            map: that.map,
                            draggable: false,
                            icon: {
                                path: "M29.395,0H17.636c-3.117,0-5.643,3.467-5.643,6.584v34.804c0,3.116,2.526,5.644,5.643,5.644h11.759 c3.116,0,5.644-2.527,5.644-5.644V6.584C35.037,3.467,32.511,0,29.395,0z M34.05,14.188v11.665l-2.729,0.351v-4.806L34.05,14.188z M32.618,10.773c-1.016,3.9-2.219,8.51-2.219,8.51H16.631l-2.222-8.51C14.41,10.773,23.293,7.755,32.618,10.773z M15.741,21.713 v4.492l-2.73-0.349V14.502L15.741,21.713z M13.011,37.938V27.579l2.73,0.343v8.196L13.011,37.938z M14.568,40.882l2.218-3.336 h13.771l2.219,3.336H14.568z M31.321,35.805v-7.872l2.729-0.355v10.048L31.321,35.805z",
                                fillColor: color,
                                fillOpacity: .6,
                                anchor: new google.maps.Point(24, 25),
                                strokeWeight: 0,
                                rotation: rotation,
                                scale: 1
                            }
                        });
                        that.map.setCenter(new google.maps.LatLng(lat, lng));
                    }
                    else {
                        that.vehicle.setPosition(new google.maps.LatLng(lat, lng));
                        that.vehicle.setIcon({
                            path: "M29.395,0H17.636c-3.117,0-5.643,3.467-5.643,6.584v34.804c0,3.116,2.526,5.644,5.643,5.644h11.759 c3.116,0,5.644-2.527,5.644-5.644V6.584C35.037,3.467,32.511,0,29.395,0z M34.05,14.188v11.665l-2.729,0.351v-4.806L34.05,14.188z M32.618,10.773c-1.016,3.9-2.219,8.51-2.219,8.51H16.631l-2.222-8.51C14.41,10.773,23.293,7.755,32.618,10.773z M15.741,21.713 v4.492l-2.73-0.349V14.502L15.741,21.713z M13.011,37.938V27.579l2.73,0.343v8.196L13.011,37.938z M14.568,40.882l2.218-3.336 h13.771l2.219,3.336H14.568z M31.321,35.805v-7.872l2.729-0.355v10.048L31.321,35.805z",
                            fillColor: color,
                            fillOpacity: .6,
                            anchor: new google.maps.Point(24, 25),
                            strokeWeight: 0,
                            rotation: rotation,
                            scale: 1
                        });
                        that.map.setCenter(new google.maps.LatLng(lat, lng));
                    }
                }
            }
        };
        this.mqttClient.setCallback("map_pose", getMapPoseMethod);
    }

    publishInitialPose(args) {

        let that = this
        var getParamMethod = function (msg) {
            var useSimTime = msg.payloadString

            console.log("use_sim_time:", useSimTime);
            if (useSimTime === "true") {

                var getClockMethod = function (msg) {
                    var message = JSON.parse(msg.payloadStrig);
                    console.log(message);

                    const quaternion = new THREE.Quaternion();
                    quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), args.dtlane.Dir);
                    const initialPoseMessage = JSON.stringify({
                        header: {
                            seq: 0,
                            stamp: {
                                secs: message.clock.secs,
                                nsecs: message.clock.nsecs,
                            },
                            frame_id: '/map',
                        },
                        pose: {
                            pose: {
                                position: {x: args.point.Ly, y: args.point.Bx, z: args.point.H},
                                orientation: {x: -quaternion.x, y: -quaternion.y, z: -quaternion.z, w: -quaternion.w}
                            },
                            covariance: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
                                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
                                0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
                        }
                    });

                    that.mqttClient.onPublish("initialpose", initialPoseMessage);
                    that.mqttClient.unSubscribeTopic("get_param");
                    that.mqttClient.unSubscribeTopic("clock");

                };

                that.mqttClient.setCallback("clock", getClockMethod);
                that.mqttClient.onSubscribeTopic("clock");

            }
            else {

                const quaternion = new THREE.Quaternion();
                quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), args.dtlane.Dir);
                const initialPoseMessage = JSON.stringify({
                    header: {
                        seq: 0,
                        stamp: {
                            secs: Date.now() * 0.001,
                            nsecs: 0,
                        },
                        frame_id: '/map',
                    },
                    pose: {
                        pose: {
                            position: {x: args.point.Ly, y: args.point.Bx, z: args.point.H},
                            orientation: {x: -quaternion.x, y: -quaternion.y, z: -quaternion.z, w: -quaternion.w}
                        },
                        covariance: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
                            0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
                            0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
                    }
                });

                console.log(initialPoseMessage, args.dtlane.Dir);

                that.mqttClient.onPublish("initialpose", initialPoseMessage);
                that.mqttClient.unSubscribeTopic("get_param");
            }
        };

        var getParamSuccessMethod = function () {
            console.log("use_sim_time");
            const param_name = "use_sim_time";
            that.mqttClient.onPublish("get_param", param_name);
        };

        this.mqttClient.setCallback("get_param", getParamMethod);
        this.mqttClient.onSubscribeTopicWithMethod("get_param", getParamSuccessMethod);
    }

    drawDTLanes() {
        let that = this;
        for (const did in this.viewData.dtlanes) {
            const pid = this.viewData.dtlanes[did].PID;
            const lat = this.viewData.points[pid].lat;
            const lng = this.viewData.points[pid].lng;

            let rgb = "#00a3e0";
            let fillOpacity = 0.0;
            if (this.viewData.dtlanes[did].Dist == "0") {
                rgb = "#FF0000";
                fillOpacity = 1.0;
            }

            const circle = new google.maps.Circle({
                label: {point: this.viewData.points[pid], dtlane: this.viewData.dtlanes[did]},
                strokeColor: rgb,
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: rgb,
                fillOpacity: fillOpacity,
                map: this.map,
                center: {lat: lat, lng: lng},
                radius: 0.2
            });
            circle.addListener('click', function () {
//              console.log(this.label);
                that.publishInitialPose(this.label);
            });
        }
    }
}
