import {WEB_UI_URL} from "./dotenv";
import Detector from "../lib/threejs/Detector";
import Stats from "../lib/threejs/stats.min";
import {CONST} from "./const";

export default class RosView {
    constructor() {
        if (!Detector.webgl) Detector.addGetWebGLMessage();

        this.manager = new THREE.LoadingManager();
        this.fontLoader = new THREE.FontLoader();
        this.colladaLoader = new THREE.ColladaLoader(this.manager);

        this.container = null;
        this.camera = null;
        this.scene = new THREE.Scene();
        this.renderer = null;
        this.controls = null;
        this.stats = null;

        //this.ros = null;
        this.topics = {};
        this.sceneData = {};

        this.pcdFileNames = null;
        this.tfBaseLinkToVelodyne = null;
        this.pointsMapViewPosition = null;
        this.vehiclePose = null;  // {position: {x: 0, y: 0, z: 0}, orientation: {x: 0, y: 0, z:0, w: 0}};

        this.initialCameraPosition = {x: 0, y: 0, z: 300};

        this.mqttClient = {};
        this.location = "";

    }

    setUpTopics() {
        this.topics = {};
        for (const visualizationObjectID in this.visualizationObjects) {
            for (const topicID in this.visualizationObjects[visualizationObjectID].topics) {
                if (!Object.keys(this.topics).includes(topicID)) {
                    this.topics[topicID] = this.visualizationObjects[visualizationObjectID].topics[topicID];
                    //this.topics[topicID].ros = this.ros;
                    //this.topics[topicID].instance = new ROSLIB.Topic(this.topics[topicID]);
                }
            }
        }
//        console.log(this.topics);
    }

    setMqttClient(client) {
        this.mqttClient = client;
    }

    setLocation(loc){
        this.location = loc
    }

    reset() {
//        console.log("rosView.reset");
        delete this.stats;
        delete this.camera;
        delete this.renderer;
        delete this.controls;
        delete this.scene;
        delete this.sceneData;

        this.container = null;
        this.camera = null;
        this.scene = new THREE.Scene();
        this.renderer = null;
        this.controls = null;
        this.stats = null;
        this.sceneData = {};
    }

    prepare() {
        /*
            if(this.ros === null) {
                this.ros = getROSConnection();
            }
        */

        this.visualizationObjectIDs = Object.keys(this.visualizationObjects);
        this.setUpTopics();

//        console.log("prepare", this.visualizationObjectIDs, Object.keys(this.topics), Object.keys(this.sceneData));

        this.prepareScene();

        this.updateCameraPosition();
    }

    resize(width, height) {
        this.height = height;
        this.width = width;

        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
//        this.controls.handleResize();
    }

    animate() {
        if (this.camera !== null && this.controls !== null) {
            requestAnimationFrame(this.animate.bind(this));
            this.render();
            this.stats.update();
            this.controls.update();
        }
    }

    updateCameraPosition() {
        if (this.vehiclePose !== null) {
            console.log("updateCameraPosition <- vehiclePose");
            this.camera.position.x = this.vehiclePose.position.x + this.initialCameraPosition.x;
            this.camera.position.y = this.vehiclePose.position.y + this.initialCameraPosition.y;
            this.camera.position.z = this.vehiclePose.position.z + this.initialCameraPosition.z;
        }
        else {
            if (this.pointsMapViewPosition !== null) {
                console.log("updateCameraPosition <- pointsMapViewPosition");
                this.camera.position.x = this.pointsMapViewPosition.x;
                this.camera.position.y = this.pointsMapViewPosition.y;
                this.camera.position.z = this.pointsMapViewPosition.z + 2000;
                this.controls.target.set(
                    this.pointsMapViewPosition.x,
                    this.pointsMapViewPosition.y,
                    this.pointsMapViewPosition.z);
            }
            else {
                console.log("updateCameraPosition <- initialCameraPosition");
                this.camera.position.x = this.initialCameraPosition.x;
                this.camera.position.y = this.initialCameraPosition.y;
                this.camera.position.z = this.initialCameraPosition.z;
            }
        }
        console.log("cameraPosition", this.camera.position);
    }

    prepareScene() {
        if (this.container === null) {
            this.container = document.getElementById(this.elementID);

            this.stats = new Stats();
            this.container.appendChild(this.stats.dom);
        }

        if (this.camera === null) {
            this.camera = new THREE.PerspectiveCamera(27, this.width / this.height, 1, 10000);
            this.camera.up.x = 0;
            this.camera.up.y = 0;
            this.camera.up.z = 1;
            console.log("scene.add camera");
            this.scene.add(this.camera);
        }

        if (this.renderer === null) {
            this.renderer = new THREE.WebGLRenderer({antialias: false});
            this.renderer.setSize(this.width, this.height);
            this.renderer.gammaInput = true;
            this.renderer.gammaOutput = true;
            this.renderer.setClearColor(0x333333, 1.0);

            this.container.appendChild(this.renderer.domElement);
        }

        if (this.controls === null) {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.addEventListener('change', this.render.bind(this));
            this.controls.target.set(0, 0, 0);

            this.animate();
        }
    }

    updateScene() {
        const topicIDs = Object.keys(this.topics);
        const sceneDataIDs = Object.keys(this.sceneData);
        if (sceneDataIDs.includes("pointsMap")) {
            if (!this.sceneData.pointsMap.isAdded && this.pcdFileNames !== null) {
                for (const pcdFileName in this.sceneData.pointsMap.threeJSObjects) {
                    if (!this.sceneData.pointsMap.threeJSObjects[pcdFileName].isAdded) {
//                        console.log("scene.add pointsMap", pcdFileName);
                        this.scene.add(this.sceneData.pointsMap.threeJSObjects[pcdFileName].threeJSObject)
                        this.sceneData.pointsMap.threeJSObjects[pcdFileName].isAdded = true;
                    }
                }
                if (Object.keys(this.sceneData.pointsMap.threeJSObjects).length == this.pcdFileNames.length) {
                    this.sceneData.pointsMap.isAdded = true;
                }
            }
        }
        if (sceneDataIDs.includes("vectorMap")) {
            for (const markerID in this.sceneData.vectorMap.threeJSObjects) {
                if (!this.sceneData.vectorMap.threeJSObjects[markerID].isAdded) {
//                    console.log("scene.add vectorMap", markerID);
                    this.scene.add(this.sceneData.vectorMap.threeJSObjects[markerID].threeJSObject)
                    this.sceneData.vectorMap.threeJSObjects[markerID].isAdded = true;
                }
            }
        }
        if (sceneDataIDs.includes("pointsRaw")) {
            if (this.sceneData.pointsRaw !== CONST.OBJECT_IS_LOADING) {
                if (!this.sceneData.pointsRaw.isAdded) {
                    this.scene.remove(this.scene.getObjectByName("pointsRaw"));
//                    console.log("scene.add pointsRaw");
                    this.scene.add(this.sceneData.pointsRaw.threeJSObject)
                    this.sceneData.pointsRaw.isAdded = true;
                }
            }
        }
        if (sceneDataIDs.includes("vehicleCollada")) {
            if (this.sceneData.vehicleCollada !== CONST.OBJECT_IS_LOADING) {
                if (!this.sceneData.vehicleCollada.isAdded) {
//                    console.log("scene.add vehicleCollada");
                    this.scene.add(this.sceneData.vehicleCollada.threeJSObject);
                    this.updateCameraPosition()
                    this.sceneData.vehicleCollada.isAdded = true;
                }
            }
        }
        if (sceneDataIDs.includes("waypoints")) {
            if (topicIDs.includes("waypoints")) {
                for (const meshName in this.sceneData.waypoints.arrow) {
                    if (!this.sceneData.waypoints.arrow[meshName].isAdded) {
//                        console.log("scene.add waypoints arrow", meshName);
                        this.scene.add(this.sceneData.waypoints.arrow[meshName].threeJSObject)
                        this.sceneData.waypoints.arrow[meshName].isAdded = true;
                    }
                }
                for (const meshName in this.sceneData.waypoints.text) {
                    if (!this.sceneData.waypoints.text[meshName].isAdded) {
//                        console.log("scene.add waypoints text", meshName);
                        this.scene.add(this.sceneData.waypoints.text[meshName].threeJSObject)
                        this.sceneData.waypoints.text[meshName].isAdded = true;
                    }
                    this.sceneData.waypoints.text[meshName].threeJSObject.lookAt(this.camera.position);
                    this.sceneData.waypoints.text[meshName].threeJSObject.setRotationFromQuaternion(this.camera.quaternion);
                }
            }
            else {
                for (const dataType in this.sceneData.waypoints) {
                    for (const meshName in this.sceneData.waypoints[dataType]) {
//                        console.log("scene.remove waypoints", meshName);
                        const threeJSObject = this.scene.getObjectByName(meshName);
                        if (typeof threeJSObject !== "undefined") {
                            this.scene.remove(threeJSObject);
                        }
                        delete this.sceneData.waypoints[dataType][meshName].threeJSObject;
                    }
                }
                delete this.sceneData.waypoints;
            }
        }


        if (this.visualizationObjectIDs.includes(CONST.VISUALIZATION_OBJECT.TARGETS)) {
            if (sceneDataIDs.includes("nextTarget")) {
                if (this.sceneData.nextTarget !== CONST.OBJECT_IS_LOADING) {
                    if (!this.sceneData.nextTarget.isAdded) {
                        this.scene.remove(this.scene.getObjectByName("nextTarget"));
                        //                    console.log("scene.add nextTarget");
                        this.scene.add(this.sceneData.nextTarget.threeJSObject)
                        this.sceneData.nextTarget.isAdded = true;
                    }
                }
            }
            if (sceneDataIDs.includes("trajectoryCircle")) {
                if (this.sceneData.trajectoryCircle !== CONST.OBJECT_IS_LOADING) {
                    if (!this.sceneData.trajectoryCircle.isAdded) {
                        this.scene.remove(this.scene.getObjectByName("trajectoryCircle"));
                        //                    console.log("scene.add trajectoryCircle");
                        this.scene.add(this.sceneData.trajectoryCircle.threeJSObject)
                        this.sceneData.trajectoryCircle.isAdded = true;
                    }
                }
            }
        }
        else {
            const nextTarget = this.scene.getObjectByName("nextTarget");
            if (typeof nextTarget !== "undefined") {
                this.scene.remove(nextTarget);
            }
            if (sceneDataIDs.includes("nextTarget")) {
                delete this.sceneData.nextTarget;
            }

            const trajectoryCircle = this.scene.getObjectByName("trajectoryCircle");
            if (typeof trajectoryCircle !== "undefined") {
                this.scene.remove(trajectoryCircle);
            }
            if (sceneDataIDs.includes("trajectoryCircle")) {
                delete this.sceneData.trajectoryCircle;
            }
        }
    }

    render() {
        this.updateScene();
//        console.log("cameraPosition", this.camera.position);
        this.renderer.render(this.scene, this.camera);
        this.camera.lookAt(this.controls.target);

    }

    onGetPointsMap() {
//        console.log("onGetPointsMap");

        let sceneDataIDs = Object.keys(this.sceneData);
        if (!sceneDataIDs.includes("pointsMap") && this.visualizationObjectIDs.includes("PointsMap")) {
//            console.log("getPointsMap");

            let that = this;
            let updateCameraPositionFlag = true;
            const callback = (args) => {
                if (updateCameraPositionFlag) {
                    const x = args.geometry.attributes.position.array[0];
                    const y = args.geometry.attributes.position.array[1];
                    const z = args.geometry.attributes.position.array[2];
                    that.pointsMapViewPosition = {
                        x: x + that.initialCameraPosition.x,
                        y: y + that.initialCameraPosition.y,
                        z: z + that.initialCameraPosition.z,
                    }
                    that.updateCameraPosition()
                    updateCameraPositionFlag = false;
                }
            };
            this.getPointsMap(0.1, callback.bind(this));
        }

        const topicIDs = Object.keys(this.topics);
        if (!sceneDataIDs.includes("vectorMap") && topicIDs.includes("vectorMap")) {
            this.getVectorMap(this.topics.vectorMap.instance);
        }
    }

    onGetPointsRaw() {
//        console.log("onGetPointsRaw");

        this.vehiclePose = {position: {x: 0, y: 0, z: 0}, orientation: {x: 0, y: 0, z: 0, w: 1}};

        const sceneDataIDs = Object.keys(this.sceneData);
        const topicIDs = Object.keys(this.topics);
        if (this.tfBaseLinkToVelodyne == null && topicIDs.includes("tf")) {
            this.getTFBaseLinkToVelodyne(this.topics.tf.instance);
        }

        if (!sceneDataIDs.includes("vehicleCollada")) {
            this.sceneData.vehicleCollada = CONST.OBJECT_IS_LOADING;
            this.getVehicleCollada();
        }

        if (!sceneDataIDs.includes("pointsRaw") && this.visualizationObjectIDs.includes(CONST.VISUALIZATION_OBJECT.POINTS_RAW)) {
//            console.log("getPointsRaw", this.topics);

            let that = this;
            const callback = (args) => {
            }

            this.getPointsRaw(this.topics[CONST.TOPIC.POINTS_RAW.NAME].instance, 0.4, callback.bind(this))
        }
    }

    onGetVehiclePose() {
//        console.log("onGetVehiclePose");

        const topicIDs = Object.keys(this.topics);
        let sceneDataIDs = Object.keys(this.sceneData);
        if (!sceneDataIDs.includes("pointsMap") && this.visualizationObjectIDs.includes(CONST.VISUALIZATION_OBJECT.POINTS_MAP)) {
            this.getPointsMap();
        }

        if (!sceneDataIDs.includes("vectorMap") && topicIDs.includes("vectorMap")) {
            this.getVectorMap(this.topics.vectorMap.instance);
        }

        if (!sceneDataIDs.includes("waypoints") && topicIDs.includes("waypoints")) {
            this.getWaypoints(this.topics.waypoints.instance);
        }

        if (this.tfBaseLinkToVelodyne == null && topicIDs.includes("tf")) {
            this.getTFBaseLinkToVelodyne(this.topics.tf.instance);
        }

        let that = this;
        const callback = () => {
            //todo:first aid.If button off , do nothing
            if (that.controls == null) {
                return
            }
            const topicIDs = Object.keys(that.topics);
            const sceneDataIDs = Object.keys(that.sceneData);
            if (topicIDs.includes("pointsRaw") && !sceneDataIDs.includes("pointsRaw")) {
                that.sceneData.pointsRaw = CONST.OBJECT_IS_LOADING;
                that.getPointsRaw(that.topics.pointsRaw.instance);
            }
            if (!sceneDataIDs.includes("nextTarget") && that.visualizationObjectIDs.includes(CONST.VISUALIZATION_OBJECT.TARGETS)) {
                console.log("nextTarget call");
                that.sceneData.nextTarget = CONST.OBJECT_IS_LOADING;
                that.getNextTarget(that.topics.nextTarget.instance);
            }
            if (!sceneDataIDs.includes("trajectoryCircle") && that.visualizationObjectIDs.includes(CONST.VISUALIZATION_OBJECT.TARGETS)) {
                console.log("trajectoryCircle call");
                that.sceneData.trajectoryCircle = CONST.OBJECT_IS_LOADING;
                that.getTrajectoryCircle(that.topics.trajectoryCircle.instance);
            }

            that.controls.target.set(that.vehiclePose.position.x, that.vehiclePose.position.y, that.vehiclePose.position.z);

            if (!sceneDataIDs.includes("vehicleCollada")) {
                that.sceneData.vehicleCollada = CONST.OBJECT_IS_LOADING;
                that.getVehicleCollada();
            }
            else {
                if (that.sceneData.vehicleCollada !== CONST.OBJECT_IS_LOADING) {
                    that.sceneData.vehicleCollada.threeJSObject.position.x = that.vehiclePose.position.x;
                    that.sceneData.vehicleCollada.threeJSObject.position.y = that.vehiclePose.position.y;
                    that.sceneData.vehicleCollada.threeJSObject.position.z = that.vehiclePose.position.z;
                    that.sceneData.vehicleCollada.threeJSObject.setRotationFromQuaternion(that.vehiclePose.orientation);
                }
            }
        };

        this.getVehiclePose(this.topics.vehiclePose.instance, callback.bind(this));
    }

    getPointsMap(pointSize = 0.1, callback = (args) => {
        return null
    }) {
//        console.log("getPointsMap");
        let that = this;
        const xhttpPCDs = new XMLHttpRequest();
        xhttpPCDs.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                if (that.pcdFileNames === null) {
                    that.pcdFileNames = JSON.parse(this.responseText).fileNames;
                    let loader = new THREE.PCDLoader();

                    for (const pcdFileName of that.pcdFileNames) {
                        if (!Object.keys(that.sceneData.pointsMap.threeJSObjects).includes(pcdFileName)) {
                            loader.load(
                                WEB_UI_URL + "/getPCDFile/" + pcdFileName + "?location=" + that.location,
                                function (mesh) {
                                    mesh.name = "pointsMap/" + pcdFileName;
                                    mesh.material.size = pointSize;
                                    that.sceneData.pointsMap.threeJSObjects[pcdFileName] = {
                                        threeJSObject: mesh,
                                        isAdded: false,
                                    }
                                    callback(mesh);
                                },
                                // called when loading is in progresses
                                function (xhr) {
                                    //console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
                                },
                                // called when loading has errors
                                function (error) {
                                    console.log('An error happened');
                                }
                            );
                        }
                    }
                }
            }
        };


        this.sceneData.pointsMap = {
            threeJSObjects: {},
            isAdded: false,
        };


        console.log(this.location);
        xhttpPCDs.open("GET", WEB_UI_URL + "/getPCDFileNames?location=" + this.location, true);
        xhttpPCDs.send();
    }


    getVectorMap(topic) {
//        console.log("getVectorMap");

        let that = this;
        const ARROW = 0;
        const CUBE = 1;
        const SPHERE = 2;
        const CYLINDER = 3;
        const LINE_STRIP = 4;
        const LINE_LIST = 5;
        const CUBE_LIST = 6;
        const SPHERE_LIST = 7;
        const POINTS = 8;
        const TEXT_VIEW_FACING = 9;
        const MESH_RESOURCE = 10;
        const TRIANGLE_LIST = 11;

        that.sceneData.vectorMap = {
            threeJSObjects: {},
        };

        var getVectorMapMethod = function (msg) {
            var message = JSON.parse(msg.payloadString)
            //console.log("ndt pose:");
            //console.log(message);

            for (const marker of message.markers) {
                if (marker.type == ARROW) {
                    const color = new THREE.Color(marker.color.r, marker.color.g, marker.color.b);
                    const mesh = that.drawLine(color, marker.points);
                    mesh.name = "arrow_" + mesh.uuid;
                    that.sceneData.vectorMap.threeJSObjects[mesh.name] = {
                        threeJSObject: mesh,
                        isAdded: false,
                    }
                    // vectorMapMarkers.push(drawArrowHead( color, marker.points.slice(0, 2) ));
                }
                else if (marker.type == CYLINDER) {
                    const color = new THREE.Color(marker.color.r, marker.color.g, marker.color.b);
                    const mesh = that.drawCylinder(color, marker.pose, marker.scale);
                    mesh.name = "cylinder_" + mesh.uuid;
                    that.sceneData.vectorMap.threeJSObjects[mesh.name] = {
                        threeJSObject: mesh,
                        isAdded: false,
                    }
                }
                else if (marker.type == LINE_STRIP) {
                    const color = new THREE.Color(marker.color.r, marker.color.g, marker.color.b);
                    const mesh = that.drawLine(color, marker.points);
                    mesh.name = "lineStrip_" + mesh.uuid;
                    that.sceneData.vectorMap.threeJSObjects[mesh.name] = {
                        threeJSObject: mesh,
                        isAdded: false,
                    }
                }
                else {
                    console.log("Unknown Marker Type: " + marker.type.toString());
                }
            }
            that.mqttClient.unSubscribeTopic("vector_map");


        };

        this.mqttClient.setCallback("vector_map", getVectorMapMethod);
        this.mqttClient.onSubscribeTopic("vector_map");

    }

    getVehiclePose(topic, callback = (args) => {
    }) {

        let that = this;
        var getVehiclePoseMethod = function (msg) {
            var message = JSON.parse(msg.payloadString)
            that.vehiclePose = message.pose;
            callback();

        };
        //set callback executing when mqtt arrived
        this.mqttClient.setCallback("ndt_pose", getVehiclePoseMethod);
    }

    getTFBaseLinkToVelodyne(topic) {
        let that = this;
        var getTFMethod = function (msg) {
            var message = JSON.parse(msg.payloadString)

            for (const transform of message.transforms) {
                if (transform.header.frame_id == "/base_link" && transform.child_frame_id == "/velodyne") {
                    console.log("base_link:");
                    console.log(transform.transform);
                    that.tfBaseLinkToVelodyne = transform.transform;
                    //console.log("tf value:");
                    //console.log(message);
                    that.mqttClient.unSubscribeTopic("tf");
                }
            }
        };

        this.mqttClient.setCallback("tf", getTFMethod);
        this.mqttClient.onSubscribeTopic("tf");

    }

    getVehicleCollada() {
        this.colladaLoader.options.convertUpAxis = true;
        let that = this;
        this.colladaLoader.load(WEB_UI_URL + '/res/static/default.dae', function (collada) {
            that.sceneData.vehicleCollada = {
                threeJSObject: collada.scene,
                isAdded: false,
            }
            that.sceneData.vehicleCollada.threeJSObject.name = "vehicleCollada";
            that.sceneData.vehicleCollada.threeJSObject.position.x = that.vehiclePose.position.x;
            that.sceneData.vehicleCollada.threeJSObject.position.y = that.vehiclePose.position.y;
            that.sceneData.vehicleCollada.threeJSObject.position.z = that.vehiclePose.position.z;
            that.sceneData.vehicleCollada.threeJSObject.setRotationFromQuaternion(that.vehiclePose.orientation);
        });
    }

    getPointsRaw(topic, pointSize = 0.4, callback = (args) => {
    }) {
        //        console.log("getPointsRaw", topic);
        let that = this;
        var getPointsRawMethod = function (msg) {
            var message = JSON.parse(msg.payloadString)
            //console.log("mqtt:");
            //console.log(message);
            let positions = [];
            let colors = [];
            let n = message.height * message.width;
            let buffer;
            if (message.data.buffer) {
                buffer = message.data.buffer;
            }
            else {
                buffer = that.decode64(message.data);
            }
            for (let i = 0; i < n; i++) {
                let pt = that.readPoint(message, i, buffer);
                positions.push(pt['x'], pt['y'], pt['z']);
                if ("rgb" in Object.keys(pt)) {
                    colors.push(new THREE.Color(pt['rgb']));
                }
                else {
                    colors.push(1, 0, 0);
                }
            }

            let geometry = new THREE.BufferGeometry();
            geometry.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            geometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
            geometry.computeBoundingSphere();
            let material = new THREE.PointsMaterial({size: pointSize, vertexColors: THREE.VertexColors});
            const threeJSObject = new THREE.Points(geometry, material);
            threeJSObject.name = "pointsRaw";
            that.sceneData.pointsRaw = {
                threeJSObject: threeJSObject,
                isAdded: false,
            };

            that.sceneData.pointsRaw.threeJSObject.position.x = that.vehiclePose.position.x;
            that.sceneData.pointsRaw.threeJSObject.position.y = that.vehiclePose.position.y;
            that.sceneData.pointsRaw.threeJSObject.position.z = that.vehiclePose.position.z;
            that.sceneData.pointsRaw.threeJSObject.setRotationFromQuaternion(that.vehiclePose.orientation)
            if (that.tfBaseLinkToVelodyne !== null) {
                that.sceneData.pointsRaw.threeJSObject.position.x = that.vehiclePose.position.x + that.tfBaseLinkToVelodyne.translation.x;
                that.sceneData.pointsRaw.threeJSObject.position.y = that.vehiclePose.position.y + that.tfBaseLinkToVelodyne.translation.y;
                that.sceneData.pointsRaw.threeJSObject.position.z = that.vehiclePose.position.z + that.tfBaseLinkToVelodyne.translation.z;

                let base_quaternion = new THREE.Quaternion(
                    that.vehiclePose.orientation.x,
                    that.vehiclePose.orientation.y,
                    that.vehiclePose.orientation.z,
                    that.vehiclePose.orientation.w
                );
                let vel_quaternion = new THREE.Quaternion(
                    that.tfBaseLinkToVelodyne.rotation.x,
                    that.tfBaseLinkToVelodyne.rotation.y,
                    that.tfBaseLinkToVelodyne.rotation.z,
                    that.tfBaseLinkToVelodyne.rotation.w
                );
                that.sceneData.pointsRaw.threeJSObject.setRotationFromQuaternion(base_quaternion.multiply(vel_quaternion));
            }

        };

        this.mqttClient.setCallback("points_raw", getPointsRawMethod);
    }

    getWaypoints(topic) {
//        console.log("getWaypoints");

        let that = this;
        that.sceneData.waypoints = {
            arrow: {},
            text: {},
        };

        var getWayPointMethod = function (msg) {
            let message = JSON.parse(msg.payloadString);

            console.log("waypoint sub");
            console.log(message);
            // arrow
            for (let i = 1; i < message.lanes[0].waypoints.length; i++) {
                const pos_1 = message.lanes[0].waypoints[i - 1].pose.pose.position;
                const pos = message.lanes[0].waypoints[i].pose.pose.position;
                var from = new THREE.Vector3(pos_1.x, pos_1.y, pos_1.z);
                var to = new THREE.Vector3(pos.x, pos.y, pos.z);
                const mesh = that.drawArrowHead(0xFF0000, [from, to]);
                mesh.name = "arrow_" + mesh.uuid;
                that.sceneData.waypoints.arrow[mesh.name] = {
                    threeJSObject: mesh,
                    isAdded: false,
                }
            }

            // text
            that.fontLoader.load(WEB_UI_URL + '/res/static/helvetiker_regular.typeface.json', function (font) {
                const textMaterial = new THREE.MeshBasicMaterial({color: 0xFFFFFF, overdraw: 0.2});
                for (const waypoint of message.lanes[0].waypoints) {
                    const position = waypoint.pose.pose.position;
//                    console.log(waypoint);
                    const velocity = (Math.round(waypoint.twist.twist.linear.x * 10) / 10).toFixed(1).toString();
                    const textGeometry = new THREE.TextGeometry(velocity, {
                        font: font,
                        size: 0.2,
                        height: 0,
                        curveSegments: 1,
                    });
                    const mesh = new THREE.Mesh(textGeometry, textMaterial);
                    mesh.name = "text_" + mesh.uuid;
                    mesh.position.x = position.x;
                    mesh.position.y = position.y;
                    mesh.position.z = position.z;
                    mesh.lookAt(that.camera.position);
                    that.sceneData.waypoints.text[mesh.name] = {
                        threeJSObject: mesh,
                        isAdded: false,
                    }
                }
            });
            that.mqttClient.unSubscribeTopic("lane_waypoints_array");
        };

        this.mqttClient.setCallback("lane_waypoints_array", getWayPointMethod);
        //this.mqttClient.onSubscribeTopic("lane_waypoints_array");

    }

    getNextTarget(topic) {

        let that = this;
        var getNextTargetMethod = function (msg) {
            var message = JSON.parse(msg.payloadString)

            const mesh = that.drawSphere(0x00FF00, message.pose.position);
            mesh.name = "nextTarget"
            that.sceneData.nextTarget = {
                threeJSObject: mesh,
                isAdded: false,
            }
        };
        this.mqttClient.setCallback("downsampled_next_target_mark", getNextTargetMethod);


    }

    getTrajectoryCircle(topic) {
//        console.log("getTrajectoryCircle");

        let that = this;
        var getTrajectoryCircleMethod = function (msg) {
            var message = JSON.parse(msg.payloadString)

            const mesh = that.drawLine(0x00FF00, message.points);
            mesh.name = "trajectoryCircle"
            that.sceneData.trajectoryCircle = {
                threeJSObject: mesh,
                isAdded: false,
            }
        };

        this.mqttClient.setCallback("downsampled_trajectory_circle_mark", getTrajectoryCircleMethod);

    }

    drawLine(color, points) {
        let material = new THREE.LineBasicMaterial({color: color});
        let geometry = new THREE.Geometry();
        for (const point of points) {
            geometry.vertices.push(new THREE.Vector3(point.x, point.y, point.z));
        }
        geometry.computeBoundingSphere();
        const line = new THREE.Line(geometry, material);
        return line;
    }

    drawArrowHead(color, points) {
        let from = new THREE.Vector3(points[0].x, points[0].y, points[0].z);
        let to = new THREE.Vector3(points[1].x, points[1].y, points[1].z);
        let direction = to.clone().sub(from);
        let length = direction.length();
        let arrowHead = new THREE.ArrowHelper(direction.normalize(), from, length, color, 0.5 * length, 0.2 * length);
        return arrowHead;
    }

    drawSphere(color, position) {
        let geometry = new THREE.SphereGeometry(0.5);
        let material = new THREE.MeshBasicMaterial({color: color});
        let mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = position.x
        mesh.position.y = position.y
        mesh.position.z = position.z
        return mesh;
    }

    drawCylinder(color, pose, scale) {
        let geometry = new THREE.CylinderGeometry(0.5 * scale.x, 0.5 * scale.y, scale.z, 16, 1, false);
        let material = new THREE.MeshBasicMaterial({color: color});
        let mesh = new THREE.Mesh(geometry, material);
//        console.log(mesh);
        mesh.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI * 0.5);
        mesh.position.x = pose.position.x
        mesh.position.y = pose.position.y
        mesh.position.z = pose.position.z
        return mesh
    }

    drawEllipseCurve() {
        /*
        var curve = new THREE.EllipseCurve(
            0, 0,             // ax, aY
            7, 15,            // xRadius, yRadius
            0, 3/2 * Math.PI, // aStartAngle, aEndAngle
            false             // aClockwise
        );

        var points = curve.getSpacedPoints( 20 );

        var path = new THREE.Path();
        var geometry = path.createGeometry( points );

        var material = new THREE.LineBasicMaterial( { color : 0xff0000 } );

        var trajectoryCircle = new THREE.Line( geometry, material );
        */
    }

    readPoint(msg, index, buffer) {
        let pt = [];
        let base = msg.point_step * index;
        let n = 4;
        let ar = new Uint8Array(n);
        for (let fi = 0; fi < msg.fields.length; fi++) {
            let si = base + msg.fields[fi].offset;
            for (let i = 0; i < n; i++) {
                ar[i] = buffer[si + i];
            }

            let dv = new DataView(ar.buffer);

            if (msg.fields[fi].name === 'rgb') {
                pt['rgb'] = dv.getInt32(0, 1);
            } else {
                pt[msg.fields[fi].name] = dv.getFloat32(0, 1);
            }
        }
        return pt;
    }

    decode64(x) {
        let a = [], z = 0, bits = 0;

        for (let i = 0, len = x.length; i < len; i++) {
            z += CONST.BASE64.indexOf(x[i]);
            bits += 6;
            if (bits >= 8) {
                bits -= 8;
                a.push(z >> bits);
                z = z & (Math.pow(2, bits) - 1);
            }
            z = z << 6;
        }
        return a;
    }

}
