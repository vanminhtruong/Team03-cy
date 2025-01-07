import React from 'react';
import '../../../../../../public/css/styles.css';

const FallingLeaves = () => {
    const leaves = [
        { size: '30px', type: 'leaf' },
        { size: '25px', type: 'leaf' },
        { size: '40px', type: 'leaf' },
        { size: '35px', type: 'leaf' },
        { size: '30px', type: 'leaf' },
        { size: '22px', type: 'leaf' },
        { size: '45px', type: 'leaf' },
        { size: '20px', type: 'leaf' },
        { size: '50px', type: 'leaf' },
        { size: '28px', type: 'leaf' }
    ];

    const renderLeaves = () => {
        return leaves.map((leaf, index) => (
            <div
                key={index}
                className="leaf"
                style={{ fontSize: leaf.size }}
            >
                🍁
            </div>
        ));
    };

    return (
        <div className="falling-leaves" aria-hidden="true">
            {renderLeaves()}
        </div>
    );
};

export default FallingLeaves;
