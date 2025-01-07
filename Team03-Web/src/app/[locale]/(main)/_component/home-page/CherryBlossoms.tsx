import React from 'react';
import '../../../../../../public/css/styles.css';

const CherryBlossoms = () => {
    const blossoms = [
        { size: '30px' },
        { size: '25px' },
        { size: '40px' },
        { size: '35px' },
        { size: '30px' },
        { size: '22px' },
        { size: '50px' },
        { size: '20px' },
        { size: '70px' },
        { size: '20px' },
    ];

    return (
        <div className="cherry-blossoms" aria-hidden="true">
            {blossoms.map((blossom, index) => (
                <div
                    key={index}
                    className="cherry-blossom"
                    style={{ fontSize: blossom.size }}
                >
                    🌸
                </div>
            ))}
        </div>
    );
};

export default CherryBlossoms;
