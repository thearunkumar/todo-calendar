import React from 'react'
import styled from 'styled-components';
import { getFormattedTime } from '../../utils/utils';
import TaskIcon from './task-icon.webp';

export enum TaskStatus {
    Open = 'Open',
    Complete = 'Complete'
};

export enum TaskEventType {
    Click,
    Update,
    Delete
}

export interface ITaskStyle {
    bgColor: string;
}

export interface ITask {
    identifier: string;
    title: string;
    description: string;
    when: Date;
    onEvent?: (type: TaskEventType, value?: any) => void;
    showDescription?: boolean;
    status?: TaskStatus;
    style?: ITaskStyle;
}

const StyledTask = styled.div`
    position: absolute;
    display: flex;
    flex-direction: row;
    background: blue;
    align-items: center;
    justify-content: space-evenly;
    width: 100%;
    height: 37.5px;

    .title {
        max-width: 90%;
        font-size: 14px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .time {
        font-size: 12px;
    }


    ${(props: any) => props && props['data-position'] && `
        top: ${props['data-position']};
    `}

    ${(props: any) => props && props['data-style'] && `
        background-color: ${props['data-style'].bgColor || 'unset'};
    `}

    color: #fff;

    img {
        width: 15px;
    }

    ${(props: any) => props && props['data-complete'] && `
        text-decoration: line-through;
    `}

    padding: 0 10px;
    box-sizing: border-box;


`;

const TaskWidget = ({ identifier, title, description, status, when, showDescription = false, onEvent, style = {
    bgColor: '#2eab62'
} }: ITask) => {
    const formattedTime = getFormattedTime(when);
    const position = Number(formattedTime.split(':')[1]) * 2.5 + 'px';
    return <StyledTask data-style={style} id={identifier} key={`${when.toString()}${identifier}`} data-complete={status === 'Complete'} data-position={position} onClick={() => {
        onEvent?.(TaskEventType.Click, {
            id: identifier,
            date: when
        })
    }}>
        <span><img src={TaskIcon} /></span>
        <span className="title">{title}</span>
        <span className="time">{formattedTime}</span>
    </StyledTask >
}

export default TaskWidget;