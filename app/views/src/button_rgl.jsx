import React from 'react';

import Responsive, {WidthProvider} from 'react-grid-layout';
import Button from "./button";
import {CONST} from "./const";
import SettingModal from "./setting_modal";


const ResponsiveReactGridLayout = WidthProvider(Responsive);


class GridSizeWrapper extends React.Component {
    render() {
        const that = this;
        const newChildren = React.Children.map(
            this.props.children,
            function (child) {
                return React.cloneElement(
                    child,
                    {
                        width: that.props.style.width,
                        height: that.props.style.height
                    }
                )
            }
        );
        return (
            <div
                {...this.props}
            >
                {newChildren}
            </div>
        );
    }
}


export default class ButtonRGL extends React.Component {
    constructor(props) {
        super(props);
        this.state = {modalIsOpen: false};

    }

    openModal() {
        this.setState({modalIsOpen: true});
    }

    saveSettingModal(file_name) {
        this.props.mqttClient.onPublish(CONST.SETTING_SAVE.LABEL, file_name);
    }

    loadSettingModal(file_name) {
        this.props.mqttClient.onPublish(CONST.SETTING_LOAD.LABEL, file_name);
    }

    submitModal() {

        const structure = this.props.structure;

        this.setState({modalIsOpen: false});

        const index = structure.nodes.findIndex(node => node.label === CONST.BUTTON.SETTING.LABEL);
        const message = JSON.stringify(this.props.settingParams);
        this.props.mqttClient.onPublish(CONST.BUTTON.SETTING.LABEL, message);
        structure.nodes = this.getUpdatedNodes(
            structure.nodes[index].id,
            !structure.nodes[index].on,
            structure.nodes);
        // structure.nodes[index].span = (<span>{"setting..."}</span>);

        this.props.updateStructure(structure);
    }

    closeModal() {

        const structure = this.props.structure;

        this.setState({modalIsOpen: false});

        const index = structure.nodes.findIndex(node => node.label === CONST.BUTTON.SETTING.LABEL);

        structure.nodes = this.getUpdatedNodes(
            structure.nodes[index].id,
            !structure.nodes[index].on,
            structure.nodes);
        this.props.updateStructure(structure);
    }

    getLayout() {
        const layout = [];
        for (const node of this.props.structure.nodes) {
            layout.push(
                {
                    i: node.id + "",
                    x: node.x,
                    y: node.y,
                    w: node.w,
                    h: node.h,
                    static: true
                }
            );
        }
        return layout;
    }

    getButtons() {
        const buttons = [];
        for (const node of this.props.structure.nodes) {
            let buttonState = null;
            if (node.on) {
                buttonState = "on";
            }
            else {
                buttonState = "off";
            }
            if (node.isLoading) {
                buttonState = "disabled";
            }
            if (node.isKilling) {
                buttonState = "disabled";
            }
            if (!node.enabled) {
                buttonState = "disabled";
            }
            buttons.push((
                <GridSizeWrapper key={node.id}>
                    <Button
                        span={node.span}
                        buttonState={buttonState}
                        onClick={this.onClickButton.bind(this, node.id)}
                    />
                </GridSizeWrapper>
            ));
        }
        return buttons;
    }

    componentWillMount() {
        this.initializeButtonRGLState();
        this.setSaveLoadCallback();

        //mqtt callback method creating
        const mqttClient = this.props.mqttClient;

        let buttonMethod = function (message) {
            //console.log(message.payloadString);
            const topic_factor = message.destinationName.split("/");
            const message_factor = topic_factor[2].split(".");
            const index = this.props.structure.nodes.findIndex(node => node.label === message_factor[2]);
            //console.log(index);

            if (message.payloadString === "ok") {
                this.props.structure.nodes[index].span = (<span>{this.props.structure.nodes[index].display}</span>);
            } else {
                this.props.structure.nodes[index].span = (<span>error</span>);
            }
            this.props.updateStructure(this.props.structure);
        };

        for (const node of this.props.structure.nodes) {
            mqttClient.setCallback(node.label, buttonMethod.bind(this));
        }


    }

    render() {
        return (
            <div>
                <SettingModal
                    isActive={this.state.modalIsOpen}
                    onClose={this.closeModal.bind(this)}
                    onSubmit={this.submitModal.bind(this)}
                    onSaveSetting={this.saveSettingModal.bind(this)}
                    onLoadSetting={this.loadSettingModal.bind(this)}
                    updateSettingParamsStructure={this.props.updateSettingParamsStructure}
                    settingParams={this.props.settingParams}
                />

                <ResponsiveReactGridLayout
                    className="layout"
                    layout={this.getLayout()}
                    cols={this.props.structure.cols}
                    rowHeight={this.props.structure.rowHeight}
                >
                    {this.getButtons()}
                </ResponsiveReactGridLayout>
            </div>
        );
    }

    initializeButtonRGLState() {
        //const date = new Date();
        //const url = WEB_UI_URL+"/getRTMStatus?date="+date.getTime().toString();

        let initMethod = function (message) {
            //console.log(message.payloadString);
            const json = JSON.parse(message.payloadString);
            console.log("initializeButtonRGLState", json);
            const structure = this.props.structure;

            let rtm_stateus = json["rtm_status"];
            let parameter_info = json["parameter_info"];

            for (const topic_name of Object.keys(rtm_stateus)) {
                //console.log("topic:" + json[topic_name]);
                const index = this.props.structure.nodes.findIndex(function (x) {
                    return x.label === topic_name;
                });
                if (index !== -1) {
                    structure.nodes[index].enabled = rtm_stateus[topic_name]["enable"];
                }
            }

            for (const topic_name of Object.keys(rtm_stateus)) {
                //console.log("topic:" + json[topic_name]);
                const index = this.props.structure.nodes.findIndex(function (x) {
                    return x.label === topic_name;
                });
                if (index !== -1) {
                    if (rtm_stateus[topic_name]["mode"] === "on" && index !== -1) {
                        structure.nodes = this.getUpdatedNodes(
                            this.props.structure.nodes[index].id,
                            !this.props.structure.nodes[index].on,
                            this.props.structure.nodes);
                    }
                }
            }


            let settingParams = parameter_info["settingParams"];

            this.props.updateSettingParamsStructure(settingParams);
            this.props.updateStructure(structure);
        };
        this.props.mqttClient.setCallback("buttonInit", initMethod.bind(this));
    }

    setSaveLoadCallback(){
        let saveMethod = function (message) {
            //console.log(message.payloadString);
            const save_file_list = JSON.parse(message.payloadString);
            console.log("save file list", save_file_list);
            if (save_file_list["settingParams"] !== "error"){
                this.props.updateSettingParamsStructure(save_file_list["settingParams"]);
            }else{
                alert("Fail to save.");
            }
        };
        this.props.mqttClient.setCallback("settingSave", saveMethod.bind(this));

        let loadMethod = function (message) {
            //console.log(message.payloadString);
            const settingParams = JSON.parse(message.payloadString);

            if (settingParams["settingParams"] !== "error") {
                this.props.updateSettingParamsStructure(settingParams["settingParams"]);
            }else{
                alert("Fail to load.");
            }
        };
        this.props.mqttClient.setCallback("settingLoad", loadMethod.bind(this));

    }

    onClickButton(nodeID) {
        const index = this.props.structure.nodes.findIndex(node => node.id === nodeID);
        if (this.props.structure.nodes[index].enabled) {
            const structure = this.props.structure;
            structure.nodes = this.getUpdatedNodes(
                nodeID,
                !this.props.structure.nodes[index].on,
                this.props.structure.nodes);
            if (structure.nodes[index].label !== CONST.BUTTON.SETTING.LABEL) {
                // set callback handlers
                const label = structure.nodes[index].label;
                const message = structure.nodes[index].on ? "on" : "off";
                this.props.mqttClient.onPublish(label, message);
                structure.nodes[index].span = (<span>{(structure.nodes[index].on ? "loading.." : "killing..")}</span>);
            } else {
                if (structure.nodes[index].on) {
                    this.openModal();
                }
            }
            this.props.updateStructure(structure);
        }
    }

    getUpdatedNodes(nodeID, on, nodes) {
        const index = nodes.findIndex(node => node.id === nodeID);
        nodes[index].on = on;
        let changeFlag = true;
        while (changeFlag) {
            changeFlag = false;
            for (const nodeIndex in nodes) {
                const node = nodes[nodeIndex];
                let enabled = true;
                for (const requiredNodeID of node.required.forEnable.off) {
                    if (nodes[nodes.findIndex(node => node.id === requiredNodeID)].on) {
                        enabled = false;
                        break;
                    }
                }
                if (enabled) {
                    for (const requiredNodeID of node.required.forEnable.disable) {
                        if (nodes[nodes.findIndex(node => node.id === requiredNodeID)].enabled) {
                            enabled = false;
                            break;
                        }
                    }
                    if (enabled) {
                        for (const requiredNodeID of node.required.forEnable.enable) {
                            if (!nodes[nodes.findIndex(node => node.id === requiredNodeID)].enabled) {
                                enabled = false;
                                break;
                            }
                        }
                        if (enabled) {
                            for (const requiredNodeID of node.required.forEnable.on) {
                                if (!nodes[nodes.findIndex(node => node.id === requiredNodeID)].on) {
                                    enabled = false;
                                    break;
                                }
                            }
                        }
                    }
                }
                if (node.enabled != enabled) {
                    nodes[nodeIndex].enabled = enabled;
                    changeFlag = true;
                    break;
                }
            }
        }
        return nodes;
    }
}
