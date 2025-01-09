import useScrollHandling from './useScrollHandling';
import { useEffect } from 'react';
import { useState } from 'react';

const useTranslateXImage = () => {
    const { scrollPosition, scrollDriction } = useScrollHandling();
    const [translateXPosition, setTranslateXPosition] = useState(60);

    const handleTranslateX = () => {
        if (scrollDriction === 'down' && scrollPosition >= 1600) {
            setTranslateXPosition(translateXPosition <= 0 ? 0 : translateXPosition - 8);
        } else if (scrollDriction === 'up') {
            setTranslateXPosition(translateXPosition >= 60 ? 60 : translateXPosition + 8);
        }
    };

    useEffect(() => {
        handleTranslateX();
    }, [scrollPosition]);

    return {
        translateXPosition
    };
};

export default useTranslateXImage;
