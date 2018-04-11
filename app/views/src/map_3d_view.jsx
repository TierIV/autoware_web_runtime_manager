import React from 'react';
import ReactResizeDetector from 'react-resize-detector';
import { WEB_UI_URL } from "./dotenv";
import RosView from "./rosView";
import { CONST } from "./const";


export default class Map3DView extends React.Component {
    constructor() {
        super();
        this.state = {};
    }
    render() {
        // console.log("Map3DView.render()", this.props);
        return (
            <ReactResizeDetector handleWidth handleHeight onResize={(w, h)=>this.onDetectParentResize(w, h)} />
        );
    }
    runViewInstance(props) {
        const viewInstance = props.viewInstance;
        const visualizationObjectIDs = Object.keys(props.visualizationObjects);
        viewInstance.elementID = props.parentId;
        viewInstance.width = parseInt(props.width);
        viewInstance.height = parseInt(props.height);
        viewInstance.visualizationObjects = props.visualizationObjects;
        viewInstance.prepare();
        if(visualizationObjectIDs.includes(CONST.VISUALIZATION_OBJECT.VEHICLE)) {
            viewInstance.onGetVehiclePose();
        }
        else {
            if(visualizationObjectIDs.includes(CONST.VISUALIZATION_OBJECT.POINTS_MAP)) {
                viewInstance.setLocation(this.props.settingParams.map.location);
                viewInstance.onGetPointsMap();
            }
        }
        this.setState({viewInstance: viewInstance});
    }
    componentDidMount() {
        console.log("Map3DView.componentDidMount", this.props);
        this.runViewInstance(this.props);
    }
    componentWillReceiveProps(nextProps) {
        console.log("Map3DView.componentWillReceiveProps", nextProps);
        this.runViewInstance(nextProps);
    }
    onDetectParentResize(w, h) {
        console.log("Map3DView.onDetectParentResize", w, h);

        if(typeof this.state.viewInstance !== 'undefined'){
            this.state.viewInstance.resize(w, h);
        }
    }
    componentWillUnmount(){
        console.log("Map3DView.componentWillUnmount");
        this.props.viewInstance.reset();
    }
}
