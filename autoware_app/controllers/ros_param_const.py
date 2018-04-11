#!/usr/bin/env python
# coding: utf-8


CONST = {
    "VEHICLE": {
        "milee": "milee",
        "estime": "estima",
        "prius": "prius",
        "default": "default"
    },
    "VEHICLEMODELPATH": {
        "milee": "Autoware/ros/src/.config/model/milee.urdf",
        "estime": "Autoware/ros/src/.config/model/estima_white.urdf",
        "prius": "Autoware/ros/src/.config/model/prius.urdf",
        "default": "Autoware/ros/src/.config/model/default.urdf"
    },
    "MAPPATH": {
        "BASEPATH":"/res/map/",
        "POINTSMAP": "/points/",
        "VECTORMAP": "/vectors/",
        "TF": "/tf/tf.launch"
    },
    "RVIZSETTING": {
        "PATH": "/res/rviz/rviz_setting/",
        "NAME": "rviz_setting.rviz"
    },
    "ROSBAG": {
        "BASEPATH": "/res/rosbag/bagfile/",
        "test_path": {
            "toyota": "/res/rosbag/bagfile/toyota/",
            "ohji": "/res/rosbag/bagfile/ohji/",
            "kasugai": "/res/rosbag/bagfile/kasugai/",
            "kameria": "/res/rosbag/bagfile/kameria/",
        },
        "REPEAT": "--loop"
    },
    "WAYPOINTSPATH": {
        "BASEPATH": "/res/mission/waypoints/",
        "toyota": "/res/mission/waypoints/toyota/",
        "ohji": "/res/mission/waypoints/ohji/",
        "kasugai": "/res/mission/waypoints/kasugai/",
        "kameria": "/res/mission/waypoints/kameria/"
    },
    "SETTING": {
        "PATH": "/res/parameter/save/"
    }
}
