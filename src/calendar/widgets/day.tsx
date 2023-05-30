import React from 'react'
import styled from 'styled-components';

export interface IDay {
    day: string;
    date: string;
    month: string;
    active?: boolean;
}

const StyledDay = styled.div`
    display: flex;
    flex-direction: column;
    color: #313131;
    font-weight: bold;
    flex: 1;
    height: 50%;
    align-items: center;
    justify-content: space-evenly;
    .date-month {
        color: #b9b9b9;
    }
    ${(props: any) => props && props['data-active'] && `
        color: blue;
        .date-month {
            color: blue;
        }
    `}
`;

const DayWidget = ({ day, date, month, active = false }: IDay) => {
    return <StyledDay data-active={active}>
        <span className="day">{day}</span>
        <span className="date-month">{date + '.' + month}</span>
    </StyledDay>
}

export default DayWidget;