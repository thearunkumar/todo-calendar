import React, { useEffect, useState } from 'react'
import styled from 'styled-components';
import { getCurrentTimeInHourAndMin } from '../../utils/utils';

export interface IDay {
    day: string;
    date: string;
    month: string;
    active?: boolean;
}

const StyledCurrentTime = styled.div`
    position: absolute;
    width: 100%;
    border: 1px dashed red;
    border-bottom: 0;
    border-left: 0;
    border-right: 0;
    left: 0;
    ${(props: any) => props && props['data-position'] && `
        top: ${props['data-position']}px;
    `}
    z-index: 9999;
`;

const CurrentTimeWidget = () => {
    const [position, setPosition] = useState<number>(getCurrentTimeInHourAndMin().min);
    useEffect(() => {
        let timeout: any = null;
        const handleTimeout = () => {
            setTimeout(() => {
                timeout = setPosition(getCurrentTimeInHourAndMin().min);
                handleTimeout();
            }, 30000);
        }
        handleTimeout();
        return () => {
            if (timeout) {
                clearTimeout(timeout);
            }
        }
    }, []);
    return <StyledCurrentTime data-position={position * 2.5}></StyledCurrentTime>
}

export default CurrentTimeWidget;