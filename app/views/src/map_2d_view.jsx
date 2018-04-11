import React from 'react';
import ReactResizeDetector from 'react-resize-detector';
import { WEB_UI_URL } from "./dotenv";
import GoogleMapsView from "./googleMapsView";


export default class Map2DView extends React.Component {
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
    componentDidMount() {
        console.log("Map2DView.componentDidMount", this.props, this.state);
        const viewInstance = this.props.viewInstance;
        viewInstance.elementID = this.props.parentId;
        const location = this.props.settingParams.map.location;
        viewInstance.setLocation(location);
        viewInstance.run();

        this.setState({viewInstance: viewInstance});
    }
    onDetectParentResize(w, h) {
         console.log("Map2DView.onDetectParentResize", w, h);
        if(typeof this.state.viewInstance === 'undefined'){
//            this.setState({viewInstance: this.rosViewer(this.props.parentId, w, h)});
        }
        else{
//            this.state.viewInstance.resize(w, h);
        }
    }
}
