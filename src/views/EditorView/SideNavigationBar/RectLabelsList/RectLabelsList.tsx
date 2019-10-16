import React, {useState} from 'react';
import {ISize} from "../../../../interfaces/ISize";
import Scrollbars from 'react-custom-scrollbars';
import {ImageData, LabelName, LabelRect} from "../../../../store/labels/types";
import './RectLabelsList.scss';
import {
    updateActiveLabelId,
    updateActiveLabelNameId,
    updateImageDataById
} from "../../../../store/labels/actionCreators";
import {AppState} from "../../../../store";
import {connect} from "react-redux";
import LabelInputField from "../LabelInputField/LabelInputField";
import EmptyLabelList from "../EmptyLabelList/EmptyLabelList";
import {LabelActions} from "../../../../logic/actions/LabelActions";
import {LabelStatus} from "../../../../data/enums/LabelStatus";
import {findLast} from "lodash";
import {LabelUtil} from "../../../../utils/LabelUtil";
import {LabelsSelector} from "../../../../store/selectors/LabelsSelector";
import {updateLabelNames} from "../../../../store/labels/actionCreators";

interface IProps {
    size: ISize;
    imageData: ImageData;
    updateImageDataById: (id: string, newImageData: ImageData) => any;
    activeLabelId: string;
    highlightedLabelId: string;
    updateActiveLabelNameId: (activeLabelId: string) => any;
    labelNames: LabelName[];
    updateActiveLabelId: (activeLabelId: string) => any;
    updateLabelNames: (labels: LabelName[]) => any;
}

const RectLabelsList: React.FC<IProps> = ({size, imageData, updateImageDataById, labelNames, updateActiveLabelNameId, activeLabelId, highlightedLabelId, updateActiveLabelId, updateLabelNames}) => {

    const initialLabels = LabelUtil.convertLabelNamesListToMap(LabelsSelector.getLabelNames());
    const [currentLabelNames, setLabelNames] = useState(initialLabels);


    const labelInputFieldHeight = 40;
    const listStyle: React.CSSProperties = {
        width: size.width,
        height: size.height
    };
    const listStyleContent: React.CSSProperties = {
        width: size.width,
        height: imageData.labelRects.length * labelInputFieldHeight
    };

    const deleteRectLabelById = (labelRectId: string) => {
        LabelActions.deleteRectLabelById(imageData.id, labelRectId);
    };

    const updateRectLabel = (labelRectId: string, labelNameId: string) => {

        const newLabelNames = {...currentLabelNames, [labelNameId]: labelNameId};
        setLabelNames(newLabelNames);
        updateLabelNames(LabelUtil.convertMapToLabelNamesList(newLabelNames));
        const newImageData = {
            ...imageData,
            labelRects: imageData.labelRects
                .map((labelRect: LabelRect) => {
                    if (labelRect.id === labelRectId) {
                        return {
                            ...labelRect,
                            labelId: labelNameId,
                            status: LabelStatus.ACCEPTED
                        }
                    } else {
                        return labelRect
                    }
                })
        };
        updateImageDataById(imageData.id, newImageData);
        updateActiveLabelNameId(labelNameId);
    };

    const onClickHandler = () => {
        updateActiveLabelId(null);
    };

    const getChildren = () => {
        return imageData.labelRects
            .filter((labelRect: LabelRect) => labelRect.status === LabelStatus.ACCEPTED)
            .map((labelRect: LabelRect) => {
                return <LabelInputField
                    size={{
                        width: size.width,
                        height: labelInputFieldHeight
                    }}
                    isActive={labelRect.id === activeLabelId}
                    isHighlighted={labelRect.id === highlightedLabelId}
                    id={labelRect.id}
                    key={labelRect.id}
                    onDelete={deleteRectLabelById}
                    value={labelRect.labelId !== null ? findLast(labelNames, {id: labelRect.labelId}) : null}
                    options={labelNames}
                    onSelectLabel={updateRectLabel}
                />
            });
    };

    return (
        <div
            className="RectLabelsList"
            style={listStyle}
            onClickCapture={onClickHandler}
        >
            {imageData.labelRects.filter((labelRect: LabelRect) => labelRect.status === LabelStatus.ACCEPTED).length === 0 ?
                <EmptyLabelList
                    labelBefore={"Draw the first rect"}
                    labelAfter={"No labels created for this image"}
                /> :
                <Scrollbars>
                    <div
                        className="RectLabelsListContent"
                        style={listStyleContent}
                    >
                        {getChildren()}
                    </div>
                </Scrollbars>
            }
        </div>
    );
};

const mapDispatchToProps = {
    updateImageDataById,
    updateActiveLabelNameId,
    updateActiveLabelId,
    updateLabelNames
};

const mapStateToProps = (state: AppState) => ({
    activeLabelId: state.labels.activeLabelId,
    highlightedLabelId: state.labels.highlightedLabelId,
    labelNames: state.labels.labels
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(RectLabelsList);