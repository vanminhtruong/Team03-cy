import React from 'react';
import '../../../../../../public/css/styles.css';
const Snowflakes = () => {
    return (
        <div className="snowflakes" aria-hidden="true">
            <div className="snowflake" style={{ fontSize: '30px' }}>❅</div>
            <div className="snowflake">❅</div>
            <div className="snowflake" style={{ fontSize: '40px' }}>❆</div>
            <div className="snowflake">❅</div>
            <div className="snowflake" style={{ fontSize: '30px' }}>❆</div>
            <div className="snowflake" style={{ fontSize: '22px' }}>❅</div>
            <div className="snowflake" style={{ fontSize: '50px' }}>❆</div>
            <div className="snowflake" style={{ fontSize: '20px' }}>❅</div>
            <div className="snowflake" style={{ fontSize: '70px' }}>❆</div>
            <div className="snowflake" style={{ fontSize: '20px' }}>❆</div>
        </div>
    );
};

export default Snowflakes;
