const CONST = {
    BUTTON: {
        INITIALIZATION: {
            DOMAIN: "initialization",
            LABEL: "initialization",
            DISPLAY: "Initialization",
        },
        MAP: {
            DOMAIN: "map",
            LABEL: "map",
            DISPLAY: "Map"
        },
        LOCALIZATION: {
            DOMAIN: "localization",
            LABEL: "localization",
            DISPLAY: "Localization",
        },
        MISSION: {
            DOMAIN: "mission",
            LABEL: "mission",
            DISPLAY: "Mission",
        },
        MOTION: {
            DOMAIN: "motion",
            LABEL: "motion",
            DISPLAY: "Motion",
        },
        SENSING: {
            DOMAIN: "sensing",
            LABEL: "sensing",
            DISPLAY: "Sensing",
        },
        DETECTION: {
            DOMAIN: "detection",
            LABEL: "detection",
            DISPLAY: "Detection",
        },
        ROSBAG: {
            DOMAIN: "rosbag",
            LABEL: "rosbag",
            DISPLAY: "ROSBAG",
        },
        ROSBAG_PLAY: {
            DOMAIN: "rosbag",
            LABEL: "play",
            DISPLAY: "Play",
        },
        ROSBAG_PAUSE: {
            DOMAIN: "rosbag",
            LABEL: "rosbagPause",
            DISPLAY: "Pause",
        },
        GATEWAY: {
            DOMAIN: "gateway",
            LABEL: "gateway",
            DISPLAY: "Vehicle Gateway",
        },
        GATEWAY_ON: {
            DOMAIN: "gateway",
            LABEL: "on",
            DISPLAY: "On"
        },
        GATEWAY_OFF: {
            DOMAIN: "gateway",
            LABEL: "gatewayOff",
            DISPLAY: "Off"
        },
        RVIZ: {
            DOMAIN: "rviz",
            LABEL: "rviz",
            DISPLAY: "Rviz"
        },
        SETTING: {
            DOMAIN: "setting",
            LABEL: "setting",
            DISPLAY: "Setting"
        }
    },
    BUTTON_INIT: {
        DOMAIN: "buttonInit",
        LABEL: "buttonInit",
    },
    SETTING_SAVE: {
        DOMAIN: "settingSave",
        LABEL: "settingSave",
    },
    SETTING_LOAD: {
        DOMAIN: "settingLoad",
        LABEL: "settingLoad",
    },
    VIEW_CONTENT: {
        MAP2D: "2d",
        MAP3D: "3d",
        CAMERA: "camera",
        RADAR: "radar",
    },
    VISUALIZATION_OBJECT: {
        GOOGLE_MAPS: "GoogleMaps",
        POINTS_MAP: "PointsMap",
        VECTOR_MAP: "VectorMap",
        POINTS_RAW: "PointsRaw",
        IMAGE_RAW: "ImageRaw",
        VEHICLE: "Vehicle",
        WAYPOINTS: "Waypoints",
        TARGETS: "Targets"
    },
    TOPIC: {
        VECTOR_MAP: "/vector_map",
        POINTS_RAW: {
            NAME: "/downsampled_points_raw",
//            NAME: "/vlp16_1/velodyne_points",
            MESSAGE_TYPE: "sensor_msgs/PointCloud2",
        },
        IMAGE_RAW: {
            NAME: "/image_raw",
//            NAME: "/camera0/image_raw",
            MESSAGE_TYPE: "sensor_msgs/Image",
        },
        TF: "/tf",
        VEHICLE_POSE: "/ndt_pose",
        WAYPOINTS: "/lane_waypoints_array",
        NEXT_TARGET: "/downsampled_next_target_mark",
        TRAJECTORY_CIRCLE: "/downsampled_trajectory_circle_mark"
    },
    MESSAGE_TYPE: {
        GEOMETRY_POSE_STAMPED: "geometry_msgs/PoseStamped",
        VISUALIZATION_MARKER: "visualization_msgs/Marker",
        VISUALIZATION_MARKER_ARRAY: "visualization_msgs/MarkerArray",
        SENSOR_POINT_CLOUD2: "sensor_msgs/PointCloud2",
        TF2_TF_MESSAGE: "tf2_msgs/TFMessage",
        AUTOWARE_LANE_ARRAY: "autoware_msgs/LaneArray",
    },
    BASE64: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',

    OBJECT_IS_LOADING: "isLoading",
}

export{ CONST };
