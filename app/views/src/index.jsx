import React from 'react';
import ReactDOM from 'react-dom';

import {CONST} from "./const";

import ButtonRGL from "./button_rgl";
import ViewRGL from './view_rgl';

import GoogleMapsView from "./googleMapsView";
import RosView from "./rosView";

import Map2DView from './map_2d_view';
import RadarView from './radar_view';
import Map3DView from './map_3d_view';
import CameraView from './camera_view';
import MqttWrapper from './mqtt';

class Index extends React.Component {
    constructor() {
        super();
        const rosView = new RosView();
        // console.log(CONST);
        this.mqttClient = new MqttWrapper();
        this.state = {
            buttonRGL: {
                nodeWidth: 4,
                nodeHeight: 3,
                cols: 21,
                rowHeight: 7,
                nodes: [
                    {
                        id: 1, x: 0, y: 0, w: 4, h: 3,
                        enabled: false, on: false, isLoading: false, isKilling: false,
                        required: {
                            forOn: {},
                            forOff: {},
                            forEnable: {on: [], off: [11], enable: [], disable: []},
                            forDisable: {}
                        },
                        domain: CONST.BUTTON.INITIALIZATION.DOMAIN,
                        label: CONST.BUTTON.INITIALIZATION.LABEL,
                        display: "Initialization",
                        span: (<span>Initialization</span>)
                    },
                    {
                        id: 2, x: 4, y: 0, w: 4, h: 3,
                        enabled: false, on: false, isLoading: false, isKilling: false,
                        required: {
                            forOn: {},
                            forOff: {},
                            forEnable: {on: [1], off: [11], enable: [1], disable: []},
                            forDisable: {}
                        },
                        domain: CONST.BUTTON.MAP.DOMAIN,
                        label: CONST.BUTTON.MAP.LABEL,
                        display: "Map", span: (<span>Map</span>)
                    },
                    {
                        id: 3,
                        x: 8,
                        y: 0,
                        w: 4,
                        h: 3,
                        enabled: false,
                        on: false,
                        isLoading: false,
                        isKilling: false,
                        required: {
                            forOn: {},
                            forOff: {},
                            forEnable: {on: [2, 6], off: [11], enable: [2, 6], disable: []},
                            forDisable: {}
                        },
                        domain: CONST.BUTTON.LOCALIZATION.DOMAIN,
                        label: CONST.BUTTON.LOCALIZATION.LABEL,
                        display: "Localization",
                        span: (<span>Localization</span>)
                    },
                    {
                        id: 4,
                        x: 12,
                        y: 0,
                        w: 4,
                        h: 3,
                        enabled: false,
                        on: false,
                        isLoading: false,
                        isKilling: false,
                        required: {
                            forOn: {},
                            forOff: {},
                            forEnable: {on: [3], off: [11], enable: [3], disable: []},
                            forDisable: {}
                        },
                        domain: CONST.BUTTON.MISSION.DOMAIN,
                        label: CONST.BUTTON.MISSION.DOMAIN,
                        display: "Mission",
                        span: (<span>Mission</span>)
                    },
                    {
                        id: 5, x: 16, y: 0, w: 4, h: 3,
                        enabled: false, on: false, isLoading: false, isKilling: false,
                        required: {
                            forOn: {},
                            forOff: {},
                            forEnable: {on: [4], off: [11], enable: [4], disable: []},
                            forDisable: {}
                        },
                        domain: "motion", label: 'motion', display: "Motion", span: (<span>Motion</span>)
                    },
                    {
                        id: 6, x: 4, y: 3, w: 4, h: 3,
                        enabled: false, on: false, isLoading: false, isKilling: false,
                        required: {
                            forOn: {},
                            forOff: {},
                            forEnable: {on: [1], off: [11], enable: [1], disable: []},
                            forDisable: {}
                        },
                        domain: "sensing", label: 'sensing', display: "Sensing", span: (<span>Sensing</span>)
                    },
                    {
                        id: 7, x: 12, y: 3, w: 4, h: 3,
                        enabled: false, on: false, isLoading: false, isKilling: false,
                        required: {
                            forOn: {},
                            forOff: {},
                            forEnable: {on: [], off: [1], enable: [], disable: [1]},
                            forDisable: {}
                        },
                        domain: "detection", label: 'detection', display: "Detection", span: (<span>Detection</span>)
                    },
                    {
                        id: 8, x: 0, y: 3, w: 2, h: 3,
                        enabled: false, on: false, isLoading: false, isKilling: false,
                        required: {
                            forOn: {},
                            forOff: {},
                            forEnable: {on: [1], off: [11], enable: [1], disable: []},
                            forDisable: {}
                        },
                        domain: "rosbag", label: 'rosbag', display: "ROSBAG", span: (<span>ROSBAG</span>)
                    },
                    {
                        id: 9, x: 2, y: 3, w: 2, h: 3,
                        enabled: false, on: false, isLoading: false, isKilling: false,
                        required: {
                            forOn: {},
                            forOff: {},
                            forEnable: {on: [8], off: [11], enable: [8], disable: []},
                            forDisable: {}
                        },
                        domain: "rosbag", label: 'play', display: "Play", span: (<span>play</span>)
                    },
                    {
                        id: 10, x: 16, y: 3, w: 2, h: 3,
                        enabled: false, on: false, isLoading: false, isKilling: false,
                        required: {
                            forOn: {},
                            forOff: {},
                            forEnable: {on: [5], off: [11], enable: [5], disable: []},
                            forDisable: {}
                        },
                        domain: "gateway", label: 'gateway', display: "Gateway", span: (<span>Gateway</span>)
                    },
                    {
                        id: 11, x: 18, y: 3, w: 2, h: 3,
                        enabled: false, on: false, isLoading: false, isKilling: false,
                        required: {
                            forOn: {},
                            forOff: {},
                            forEnable: {on: [1, 2, 3, 4, 5, 6, 10], off: [], enable: [], disable: []},
                            forDisable: {}
                        },
                        domain: "gateway", label: 'on', display: "On", span: (<span>On</span>)
                    },
                    {
                        id: 12, x: 0, y: 6, w: 4, h: 3,
                        enabled: false, on: false, isLoading: false, isKilling: false,
                        required: {
                            forOn: {},
                            forOff: {},
                            forEnable: {on: [1], off: [11], enable: [1], disable: []},
                            forDisable: {}
                        },
                        domain: CONST.BUTTON.RVIZ.DOMAIN,
                        label: CONST.BUTTON.RVIZ.LABEL,
                        display: "Rviz",
                        span: (<span>Rviz</span>)
                    },
                    {
                        id: 13, x: 4, y: 6, w: 4, h: 3,
                        enabled: false, on: false, isLoading: false, isKilling: false,
                        required: {
                            forOn: {},
                            forOff: {},
                            forEnable: {on: [1], off: [11], enable: [1], disable: []},
                            forDisable: {}
                        },
                        domain: CONST.BUTTON.SETTING.DOMAIN,
                        label: CONST.BUTTON.SETTING.LABEL,
                        display: "Setting",
                        span: (<span>Setting</span>)
                    },
                ],
            },
            viewRGL: {
                cols: 25,
                rowHeight: 25,
                rosView: rosView,
                onButtonIDs: [],
                contents: {
                    "2d": {
                        triggerButtonIDs: {
                            open: 2,
                            close: null,
                        },
                        layout: {
                            i: "2d",
                            x: 0, y: 0, w: 10, h: 12,
                            isDraggable: false,
                            isResizable: false,
                        },
                        component: Map2DView,
                        viewInstance: new GoogleMapsView(),
                        visualizationObjects: {
                            "GoogleMaps": {
                                buttonID: 2,
                                data: null,
                            },
                            "vehicle": {
                                buttonID: 3,
                                topics: {
                                    vehiclePose: {
                                        ros: null,
                                        name: "/ndt_pose",
                                        messageType: 'geometry_msgs/PoseStamped',
                                    },
                                }
                            }
                        },
                        visibleObjectIDs: [],
                    },
                    [CONST.VIEW_CONTENT.MAP3D]: {
                        triggerButtonIDs: {
                            open: 2,
                            close: null,
                        },
                        layout: {
                            i: CONST.VIEW_CONTENT.MAP3D,
                            x: 10, y: 0, w: 14, h: 25,
                            isDraggable: false,
                            isResizable: false
                        },
                        component: Map3DView,
                        viewInstance: new RosView(),
                        visualizationObjects: {
                            "PointsMap": {
                                buttonID: 2,
                                topics: {},
                            },
                            "VectorMap": {
                                buttonID: 2,
                                topics: {
                                    vectorMap: {
                                        name: "/vector_map",
                                        messageType: 'visualization_msgs/MarkerArray',
                                    }
                                },
                            },
                            "PointsRaw": {
                                buttonID: 3,
                                topics: {
                                    pointsRaw: {
                                        name: "/downsampled_points_raw",
                                        messageType: "sensor_msgs/PointCloud2"
                                    }
                                },
                            },
                            "Vehicle": {
                                buttonID: 3,
                                topics: {
                                    tf: {
                                        name: "/tf",
                                        messageType: "tf2_msgs/TFMessage"
                                    },
                                    vehiclePose: {
                                        name: "/ndt_pose",
                                        messageType: 'geometry_msgs/PoseStamped',
                                    },
                                },
                            },
                            "Waypoints": {
                                buttonID: 4,
                                topics: {
                                    waypoints: {
                                        name: "/lane_waypoints_array",
                                        messageType: 'autoware_msgs/LaneArray'
                                    }
                                }
                            },
                            [CONST.VISUALIZATION_OBJECT.TARGETS]: {
                                buttonID: 5,
                                topics: {
                                    nextTarget: {
                                        name: "/downsampled_next_target_mark",
                                        messageType: 'visualization_msgs/Marker'
                                    },
                                    trajectoryCircle: {
                                        name: "/downsampled_trajectory_circle_mark",
                                        messageType: 'visualization_msgs/Marker'
                                    }
                                }
                            }
                        },
                        visibleObjectIDs: [],
                    },
                    [CONST.VIEW_CONTENT.CAMERA]: {
                        triggerButtonIDs: {
                            open: 6,
                            close: null,
                        },
                        layout: {
                            i: CONST.VIEW_CONTENT.CAMERA,
                            x: 0, y: 12, w: 10, h: 13,
                            isDraggable: false,
                            isResizable: false,
                        },
                        component: CameraView,
                        viewInstance: null,
                        visualizationObjects: {
                            [CONST.VISUALIZATION_OBJECT.IMAGE_RAW]: {
                                buttonID: 6,
                                topics: {
                                    [CONST.TOPIC.IMAGE_RAW.NAME]: {
                                        name: CONST.TOPIC.IMAGE_RAW.NAME,
                                        messageType: CONST.TOPIC.IMAGE_RAW.MESSAGE_TYPE
                                    }
                                },
                            },
                        },
                        visibleObjectIDs: [],
                    },
                    [CONST.VIEW_CONTENT.RADAR]: {
                        triggerButtonIDs: {
                            open: 6,
                            close: 3,
                        },
                        layout: {
                            i: CONST.VIEW_CONTENT.RADAR,
                            x: 10, y: 0, w: 14, h: 25,
                            isDraggable: false,
                            isResizable: false,
                        },
                        component: RadarView,
                        viewInstance: new RosView(),
                        visualizationObjects: {
                            [CONST.VISUALIZATION_OBJECT.POINTS_RAW]: {
                                buttonID: 6,
                                topics: {
                                    [CONST.TOPIC.POINTS_RAW.NAME]: {
                                        name: CONST.TOPIC.POINTS_RAW.NAME,
                                        messageType: CONST.TOPIC.POINTS_RAW.MESSAGE_TYPE,
                                    }
                                },
                            },
                            "Vehicle": {
                                buttonID: 6,
                                topics: {
                                    tf: {
                                        name: "/tf",
                                        messageType: "tf2_msgs/TFMessage"
                                    },
                                },
                            },
                        },
                        visibleObjectIDs: [],
                    },
                },
            },
            settingParams: {
                TFBaseToVelodyne: {
                    tf_x: 0,
                    tf_y: 0,
                    tf_z: 0,
                    tf_yaw: 0,
                    tf_pitch: 0,
                    tf_roll: 0,
                    flag: false
                },
                vehicleModel: {
                    data: "",
                    flag: false
                },
                map: {
                    location: "",
                    flag: false
                },
                rosbag: {
                    rosbag_name: "",
                    start_time: 0,
                    rate: 1,
                    repeat: false,
                    flag: false
                },
                waypoints: {
                    waypoints_name: "",
                    flag: false
                },
                rviz: {
                    rviz_setting_file: {},
                    flag: false
                },
                display_data: {
                    location: {
                        location_list: {}
                    },
                    rosbag: {
                        rosbag_list: {}
                    },
                    waypoints: {
                        waypoints_list: {}
                    },
                    setting: {
                        save_file_list: []
                    },
                    flag: false
                }
            }
        };

        this.state.viewRGL.contents[CONST.VIEW_CONTENT.RADAR].viewInstance.setMqttClient(this.mqttClient);
        this.state.viewRGL.contents[CONST.VIEW_CONTENT.MAP3D].viewInstance.setMqttClient(this.mqttClient);
        this.state.viewRGL.contents["2d"].viewInstance.setMqttClient(this.mqttClient);
    }

    render() {
        return (
            <div>
                <ButtonRGL
                    structure={this.state.buttonRGL}
                    mqttClient={this.mqttClient}
                    updateStructure={this.updateButtonRGLStructure.bind(this)}
                    updateSettingParamsStructure={this.updateSettingParamsStructure.bind(this)}
                    settingParams={this.state.settingParams}

                />
                <ViewRGL
                    structure={this.state.viewRGL}
                    mqttClient={this.mqttClient}
                    updateStructure={this.updateViewRGLStructure.bind(this)}
                    settingParams={this.state.settingParams}
                />
            </div>
        );
    }

    updateButtonRGLStructure(nextStructure) {
        this.setState({buttonRGL: nextStructure});
        this.updateViewRGLVisibility();
    }

    updateViewRGLStructure(nextStructure) {
        this.setState({viewRGL: nextStructure});
    }

    updateSettingParamsStructure(nextStructure) {
        this.setState({settingParams: nextStructure});
    }

    updateViewRGLVisibility() {
        console.log("index.updateViewRGLVisibility");
        const viewRGL = this.state.viewRGL;
        const buttonRGL = this.state.buttonRGL;

        console.log("ViewRGL1");

        viewRGL.onButtonIDs = [];
        for (const button of buttonRGL.nodes) {
            if (button.on) {
                viewRGL.onButtonIDs.push(button.id);
            }
        }

        for (const contentID in viewRGL.contents) {
            viewRGL.contents[contentID].visibleObjectIDs = [];
            for (const objectID in viewRGL.contents[contentID].visualizationObjects) {
                if (viewRGL.onButtonIDs.includes(viewRGL.contents[contentID].visualizationObjects[objectID].buttonID)) {
                    viewRGL.contents[contentID].visibleObjectIDs.push(objectID);
                }
            }
        }

        this.setState({viewRGL: viewRGL});
    }

    componentWillUnmount() {
        this.mqttClient.disConnect();
        delete(this.mqttClient);
    }

}

ReactDOM.render(
    <Index/>,
    document.getElementById('content')
);

