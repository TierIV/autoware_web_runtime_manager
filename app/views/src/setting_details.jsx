import React from 'react';
import * as jsyaml from "js-yaml";

export default class SettingDetails extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
            setting:{
                saveFileName: "",
                loadFileName: ""
            },
            TFBaseToVelodyne: {
                checked: false
            },
            vehicleModel: {
                checked: false
            },
            map: {
                checked: false
            },
            rosbag:{
                checked: false
            },
            waypoints:{
                checked: false
            },
            rviz:{
                checked: false
            }
        }
    }

    getSaveFileList() {
        let settingParams = this.props.settingParams;
        console.log(settingParams);
        let save_file_list = settingParams.display_data.setting.save_file_list;
        let res_list = [];

        for (const [key, save_file] of save_file_list.entries()) {
            res_list.push(
                (<option key={key} value={save_file}>{save_file}</option>)
            );
        }
        console.log(res_list);
        return res_list
    }

    getLocationList() {
        let settingParams = this.props.settingParams;
        let location_list = settingParams.display_data.location.location_list;
        let res_list = [];

        for (const [key, location] of location_list.entries()) {
            res_list.push(
                (<option key={key} value={location}>{location}</option>)
            );
        }
        return res_list
    }


    getRosbagList() {
        let settingParams = this.props.settingParams;
        let location = settingParams.map.location;
        if (location === "") location = "toyota";
        let rosbag_list = settingParams.display_data.rosbag.rosbag_list[location];
        let res_list = [];

        for (const [key, rosbag] of rosbag_list.entries()) {
            res_list.push(
                (<option key={key} value={rosbag}>{rosbag}</option>)
            );
        }
        return res_list
    }

    getWaypointsList() {
        let settingParams = this.props.settingParams;
        let location = settingParams.map.location;
        if (location === "") location = "toyota";
        let waypoints_list = settingParams.display_data.waypoints.waypoints_list[location];
        let res_list = [];

        for (const [key, waypoints] of waypoints_list.entries()) {
            res_list.push(
                (<option key={key} value={waypoints}>{waypoints}</option>)
            );
        }
        return res_list;
    }


    setChangeFlag(e) {
        let settingParams = this.props.settingParams;
        settingParams[e.target.name].flag = e.target.checked;
        this.props.updateSettingParamsStructure(settingParams);
        let this_state = this.state[e.target.name];
        this_state.disabled = !e.target.checked;
        this_state.checked = e.target.checked;
        this.setState(this_state);
    }

    setSaveFileName(e) {
        const file_name = {
            setting: {
                saveFileName: e.target.value
            }
        };
        this.setState(file_name);
    }

    onSaveSubmit(){
        let settingParams = this.props.settingParams;
        let file_name = this.state.setting.saveFileName;
        let overwrite_flag = true;
        if (settingParams["display_data"]["setting"]["save_file_list"].indexOf(file_name)){
            overwrite_flag = confirm("There is a file with same name.OverWrite?");
        }

        if (overwrite_flag) {
            this.props.onSaveSetting(file_name);
        }
    }

    setLoadFileName(e){
        const file_name = {
            setting: {
                loadFileName: e.target.value
            }
        };
        this.setState(file_name);
    }

    onLoadSubmit(){
        let file_name = this.state.setting.loadFileName;
        this.props.onLoadSetting(file_name);
    }


    setTFBaseToVelodyne(e) {
        let settingParams = this.props.settingParams;
        settingParams.TFBaseToVelodyne[e.target.name] = parseFloat(e.target.value);
        this.props.updateSettingParamsStructure(settingParams)
    }

    setTFBaseToVelodyneFile(e) {
        let settingParams = this.props.settingParams;
        let files = e.target.files;
        let reader = new FileReader();

        reader.onload = function (theFile) {
            let text = theFile.target.result;
            let json = JSON.parse(text);
            settingParams.TFBaseToVelodyne = json.TFBaseToVelodyne;
        };
        reader.readAsText(files[0], "utf-8");
        this.props.updateSettingParamsStructure(settingParams)
    }

    setVehicleModel(e) {
        let settingParams = this.props.settingParams;
        settingParams.vehicleModel.data = e.target.value;
        this.props.updateSettingParamsStructure(settingParams)
    }

    setLocation(e) {
        let settingParams = this.props.settingParams;
        settingParams.map.location = e.target.value;
        this.props.updateSettingParamsStructure(settingParams)
    }

    setRosbagName(e) {
        let settingParams = this.props.settingParams;
        settingParams.rosbag[e.target.name] = e.target.value;
        this.props.updateSettingParamsStructure(settingParams)
    }

    setRosbagStartTime(e) {
        let settingParams = this.props.settingParams;
        settingParams.rosbag[e.target.name] = parseInt(e.target.value);

        this.props.updateSettingParamsStructure(settingParams)
    }

    setRosbagRate(e) {
        let settingParams = this.props.settingParams;
        settingParams.rosbag[e.target.name] = parseFloat(e.target.value);
        this.props.updateSettingParamsStructure(settingParams)
    }

    setRosbagRepeat(e) {
        let settingParams = this.props.settingParams;
        settingParams.rosbag[e.target.name] = e.target.value === "true";
        this.props.updateSettingParamsStructure(settingParams)
    }

    setWaypointsName(e) {
        let settingParams = this.props.settingParams;
        settingParams.waypoints[e.target.name] = e.target.value;
        this.props.updateSettingParamsStructure(settingParams)
    }

    setRvizSettingFile(e) {
        let file = e.target.files[0];

        if(!file.name.match('.rviz$')) {
            alert('Cannot set except rviz file.');
            return;
        }

        let reader = new FileReader();
        reader.onload = function() {
            let settingParams = this.props.settingParams;
            settingParams.rviz.rviz_setting_file = jsyaml.load(reader.result);
            this.props.updateSettingParamsStructure(settingParams);
        }.bind(this);
        reader.readAsText(file);
    }

    componentWillMount(){
        const settingParams = this.props.settingParams;
        let init_state = {
            TFBaseToVelodyne: {
                checked: settingParams.TFBaseToVelodyne.flag
            },
            vehicleModel: {
                checked: settingParams.vehicleModel.flag
            },
            map: {
                checked: settingParams.map.flag
            },
            rosbag: {
                checked: settingParams.rosbag.flag
            },
            waypoints: {
                checked: settingParams.waypoints.flag
            },
            rviz: {
                checked: settingParams.rviz.flag
            }
        };
        this.setState(init_state);
    }

    componentWillReceiveProps(nextProps){
        const settingParams = nextProps.settingParams;
        let init_state = {
            TFBaseToVelodyne: {
                checked: settingParams.TFBaseToVelodyne.flag
            },
            vehicleModel: {
                checked: settingParams.vehicleModel.flag
            },
            map: {
                checked: settingParams.map.flag
            },
            rosbag:{
                checked: settingParams.rosbag.flag
            },
            waypoints:{
                checked: settingParams.waypoints.flag
            },
            rviz: {
                checked: settingParams.rviz.flag
            }
        };
        this.setState(init_state);
    }


    render() {
        return (
            <div>
                <h2>Save/Load:</h2>
                <h3>Save</h3>
                <form id="save">
                    <label htmlFor="select_save">Input Save File Name</label><br/>
                    <textarea name="save_name" value={this.state.setting.saveFileName}
                              cols="30" rows="1" maxLength="20"
                              onChange={this.setSaveFileName.bind(this)}>max 20 characters</textarea>
                    <br/>
                    <a className="square_btn"
                       onClick={this.onSaveSubmit.bind(this)}>Save</a>
                </form>

                <h3>Load</h3>
                <form id="load">
                    <label htmlFor="select_load">Select Load File</label>
                    <select id="load" name="load" className="form-control"
                            onChange={this.setLoadFileName.bind(this)}>
                        <option value={this.state.setting.loadFileName}>{this.state.setting.loadFileName}</option>
                        {this.getSaveFileList()}
                    </select>
                    <br/>
                    <a className="square_btn"
                       onClick={this.onLoadSubmit.bind(this)}>Load</a>
                </form>

                <h2 ref={subtitle => this.subtitle = subtitle}>Set up:</h2>
                <h3>TF baselink to velodyne</h3>
                <form id="TFBaseToVelodyne">
                    <input type="checkbox" name="TFBaseToVelodyne" value="TFBaseToVelodyne"
                           onChange={this.setChangeFlag.bind(this)} checked={this.state.TFBaseToVelodyne.checked} />
                    <label htmlFor="baseToVelodyne">Select To Change</label> <br/><br/>

                    <label htmlFor="set_tf_x">x&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
                    <input type="number" ref="set_tf_x" name="tf_x"
                           value={this.props.settingParams.TFBaseToVelodyne.tf_x}
                           step="0.1" min="-10000" max="10000" onChange={this.setTFBaseToVelodyne.bind(this)}
                           disabled={!this.state.TFBaseToVelodyne.checked}/><br/>
                    <label htmlFor="set_tf_y">y&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
                    <input type="number" ref="set_tf_y" name="tf_y"
                           value={this.props.settingParams.TFBaseToVelodyne.tf_y}
                           step="0.1" min="-10000" max="10000" onChange={this.setTFBaseToVelodyne.bind(this)}
                           disabled={!this.state.TFBaseToVelodyne.checked}/><br/>
                    <label htmlFor="set_tf_z">z&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
                    <input type="number" ref="set_tf_z" name="tf_z"
                           value={this.props.settingParams.TFBaseToVelodyne.tf_z}
                           step="0.1" min="-1000" max="1000" onChange={this.setTFBaseToVelodyne.bind(this)}
                           disabled={!this.state.TFBaseToVelodyne.checked}/><br/>
                    <label htmlFor="set_tf_yaw">yaw&nbsp;&nbsp;&nbsp;&nbsp;</label>
                    <input type="number" ref="set_tf_yaw" name="tf_yaw"
                           value={this.props.settingParams.TFBaseToVelodyne.tf_yaw}
                           step="0.1" min="-50" max="50" onChange={this.setTFBaseToVelodyne.bind(this)}
                           disabled={!this.state.TFBaseToVelodyne.checked}/><br/>
                    <label htmlFor="set_tf_pitch">pitch&nbsp;&nbsp;</label>
                    <input type="number" ref="set_tf_pitch" name="tf_pitch"
                           value={this.props.settingParams.TFBaseToVelodyne.tf_pitch}
                           step="0.1" min="-50" max="50" onChange={this.setTFBaseToVelodyne.bind(this)}
                           disabled={!this.state.TFBaseToVelodyne.checked}/><br/>
                    <label htmlFor="set_tf_roll">roll&nbsp;&nbsp;&nbsp;&nbsp;</label>
                    <input type="number" ref="set_tf_roll" name="tf_roll"
                           value={this.props.settingParams.TFBaseToVelodyne.tf_roll}
                           step="0.1" min="-50" max="50" onChange={this.setTFBaseToVelodyne.bind(this)}
                           disabled={!this.state.TFBaseToVelodyne.checked}/><br/>
                </form>

                <h3>Vehicle Model</h3>
                <form id="vehicleModel">
                    <input type="checkbox" name="vehicleModel" value="vehicleModel"
                           onChange={this.setChangeFlag.bind(this)} checked={this.state.vehicleModel.checked}/>
                    <label htmlFor="vehicleModel">Select To Change</label> <br/><br/>

                    <label htmlFor="vehicleModel">Select vehicle model</label>
                    <select id="vehicleModel" name="vehicleModel" className="form-control"
                            onChange={this.setVehicleModel.bind(this)}
                            disabled={!this.state.vehicleModel.checked}>
                        <option
                            value={this.props.settingParams.vehicleModel.data}>{this.props.settingParams.vehicleModel.data}</option>
                        <option value="milee">milee</option>
                        <option value="prius">prius</option>
                        <option value="estime">estime</option>
                    </select>
                    <br/>
                </form>

                <h2>MAP:</h2>
                <form id="map">
                    <input type="checkbox" name="map" value="map" onChange={this.setChangeFlag.bind(this)}
                           checked={this.state.map.checked}/>
                    <label htmlFor="map">Select To Change</label> <br/><br/>

                    <label htmlFor="select_location">Select Location</label>
                    <select id="map" name="map" className="form-control"
                            onChange={this.setLocation.bind(this)} disabled={!this.state.map.checked}>
                        <option
                            value={this.props.settingParams.map.location}>{this.props.settingParams.map.location}</option>
                        {this.getLocationList()}
                    </select>
                    <br/>
                </form>

                <h2>COMPUTING:</h2>
                <h3>WAYPOINTS</h3>
                <form id="waypoints">
                    <input type="checkbox" name="waypoints" value="waypoints" onChange={this.setChangeFlag.bind(this)}
                           checked={this.state.waypoints.checked}/>
                    <label htmlFor="waypoints">Select To Change</label> <br/><br/>

                    <label htmlFor="select_waypoints">Select Waypoints</label>
                    <select id="waypoints_name" name="waypoints_name" className="form-control"
                            onChange={this.setWaypointsName.bind(this)}
                            disabled={!this.state.waypoints.checked}>
                        <option
                            value={this.props.settingParams.waypoints.waypoints}>{this.props.settingParams.waypoints.waypoints}</option>
                        {this.getWaypointsList()}
                    </select>
                    <br/>
                </form>

                <h2>ROSBAG:</h2>
                <form id="rosbag">
                    <input type="checkbox" name="rosbag" value="rosbag" onChange={this.setChangeFlag.bind(this)}
                           checked={this.state.rosbag.checked}/>
                    <label htmlFor="rosbag">Select To Change</label> <br/><br/>

                    <label htmlFor="select_rosbag">Select Rosbag</label>
                    <select id="rosbag_name" name="rosbag_name" className="form-control"
                            onChange={this.setRosbagName.bind(this)}
                            disabled={!this.state.rosbag.checked}>
                        <option
                            value={this.props.settingParams.rosbag.rosbag_name}>{this.props.settingParams.rosbag.rosbag_name}</option>
                        {this.getRosbagList()}
                    </select>
                    <br/><br/>
                    <label htmlFor="start_time">Start Time&nbsp;&nbsp;&nbsp;</label>
                    <input type="number" ref="start_time" name="start_time"
                           value={this.props.settingParams.rosbag.start_time}
                           step="1" min="0" max="10000" onChange={this.setRosbagStartTime.bind(this)}
                           disabled={!this.state.rosbag.checked}/><br/>
                    <label
                        htmlFor="rate">Rate&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</label>
                    <input type="number" ref="rate" name="rate" value={this.props.settingParams.rosbag.rate}
                           step="0.1" min="0.1" max="100" onChange={this.setRosbagRate.bind(this)}
                           disabled={!this.state.rosbag.checked}/><br/>
                    <input type="checkbox" name="repeat" value="repeat" onChange={this.setRosbagRepeat.bind(this)}
                           disabled={!this.state.rosbag.checked}/>
                    <label htmlFor="map">Repeat Rosbag</label> <br/><br/>
                </form>


                <h2>Rviz:</h2>
                <h3>Select Rviz Setting File</h3>
                <form id="rviz">
                   <input type="checkbox" name="rviz" value="rviz" onChange={this.setChangeFlag.bind(this)}
                           checked={this.state.rviz.checked}/>
                    <label htmlFor="rviz">Select To Change</label> <br/><br/>
                    <br/>
                    <input type="file" id="rviz_setting_file" name="rviz_setting_file"
                           onChange={this.setRvizSettingFile.bind(this)} disabled={!this.state.rviz.checked}/>
                </form>


                <br/><br/>
                <button onClick={this.props.onSubmit}>submit</button>
                <button onClick={this.props.onClose}>close</button>
            </div>



        )
    }
}