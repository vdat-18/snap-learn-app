import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedNumberProps {
    value: number;
    className?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, className }) => {
    const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
    const display = useTransform(spring, (current) => Math.round(current));
    const [displayValue, setDisplayValue] = useState(value);

    useEffect(() => {
        spring.set(value);
    }, [spring, value]);

    useEffect(() => {
        return display.onChange((v) => setDisplayValue(v));
    }, [display]);

    return <motion.span className={className}>{displayValue}</motion.span>;
};
