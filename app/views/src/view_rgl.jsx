import React from 'react';
import ReactDOM from 'react-dom';
import Responsive, { WidthProvider } from 'react-grid-layout';
import ReactResizeDetector from 'react-resize-detector';
const ResponsiveReactGridLayout = WidthProvider(Responsive);


var hyphenOrRoundup = function(value) {
    return value=="-" ? value: Math.round(value*10.0)/10.0;
}

class Wrapper extends React.Component {
    render() {
        const that = this;
        const newChildren = React.Children.map(
            this.props.children,
            function(child) {
                return React.cloneElement(
                    child,
                    {
                        width: that.props.style.width,
                        height: that.props.style.height
                    }
                );
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

export default class ViewRGL extends React.Component {
    render() {
        console.log("ViewRGL.render", this.props.structure.onButtonIDs);

        const dndStyle = {
            position: 'absolute',
            left: '5px',
            top: 0,
            color: "white",
            cursor: 'pointer'
        };

        const layout = [];
        const viewComponents = [];

        for(const contentID in this.props.structure.contents) {
            const onButtonIDs = this.props.structure.onButtonIDs;
            const content = this.props.structure.contents[contentID];
            const triggerButtonIDs = content.triggerButtonIDs;
            if( onButtonIDs.includes(triggerButtonIDs.open) ) {
                if( !onButtonIDs.includes(triggerButtonIDs.close) ) {
                    const visualizationObjects = {};
                    for(const visibleObjectID of content.visibleObjectIDs) {
                        visualizationObjects[visibleObjectID] = content.visualizationObjects[visibleObjectID];
                    }
                    layout.push(content.layout);
                    viewComponents.push((
                        <Wrapper
                            key={content.layout.i}
                            id={content.layout.i}
                            style={{backgroundColor: "lightslategray"}}
                        >
                          <content.component
                             parentId={content.layout.i}
                             width={this.props.width}
                             height={this.props.height}
                             viewInstance={content.viewInstance}
                             mqttClient={this.props.mqttClient}
                             visualizationObjects={visualizationObjects}
                             stop={false}
                             settingParams={this.props.settingParams}
                             />
                        </Wrapper>
                    ));
                }
            }
        }

        //console.log("viewComponents", viewComponents);
        return (
            <div>
                <ResponsiveReactGridLayout
                    className="layout"
                    breakpoints={{lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0}}
                    cols={this.props.structure.cols}
                    layout={layout}
                    rowHeight={this.props.structure.rowHeight}
                    ref="gridLayout"
                    onLayoutChange={this.onLayoutChange.bind(this)}
                >
                    {viewComponents}
                </ResponsiveReactGridLayout>
            </div>
        );
    }
    onLayoutChange(layout) {
    }
    onClick(e) {
    }
}
