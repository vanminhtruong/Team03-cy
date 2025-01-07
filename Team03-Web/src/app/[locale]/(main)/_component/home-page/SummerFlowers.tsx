import React from 'react';
import '../../../../../../public/css/styles.css';

const SummerFlowers = () => {
    const flowers = [
        { size: '30px', type: 'summer-flower' },
        { size: '25px', type: 'summer-flower' },
        { size: '35px', type: 'summer-flower' },
        { size: '40px', type: 'summer-flower' },
        { size: '30px', type: 'summer-flower' },
        { size: '22px', type: 'summer-flower' },
        { size: '45px', type: 'summer-flower' },
        { size: '20px', type: 'summer-flower' },
        { size: '50px', type: 'summer-flower' },
        { size: '28px', type: 'summer-flower' }
    ];

    const renderFlowers = () => {
        return flowers.map((flower, index) => (
            <div
                key={index}
                className="summer-flower"
                style={{ fontSize: flower.size }}
            >
                ☀️
            </div>
        ));
    };

    return (
        <div className="summer-flowers" aria-hidden="true">
            {renderFlowers()}
        </div>
    );
};

export default SummerFlowers;
