import React from 'react'
import styled from 'styled-components';

const StyledTime = styled.span`
    color: #b9b9b9;
    font-weight: bold;
`;

const TimeWidget = ({ time }: any) => {
    return <StyledTime>{time}</StyledTime>
}

export default TimeWidget;