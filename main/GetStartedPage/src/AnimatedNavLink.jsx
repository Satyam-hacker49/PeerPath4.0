import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

const AnimatedNavLink = ({ to, children, isActive = false, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { damping: 15, stiffness: 150 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);
  
  const rotateX = useTransform(springY, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);
  
  const brightness = useTransform(springX, [-1, 0, 1], [0.8, 1, 0.8]);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    
    x.set(distanceX / 10);
    y.set(distanceY / 10);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
      whileHover={{ 
        scale: 1.05,
        y: -2,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.95 }}
      style={{
        perspective: 1000,
        transformStyle: "preserve-3d"
      }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          filter: `brightness(${brightness})`,
        }}
      >
        <Link 
          to={to} 
          className={`nav-link-animated ${isActive ? 'active' : ''}`}
          onClick={onClick}
        >
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{
              background: "linear-gradient(90deg, #00ff88, #00cc6a)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              transition: { duration: 0.3 }
            }}
          >
            {children}
          </motion.span>
          
          {/* Particle effect on hover - green for all links */}
          {isHovered && (
            <motion.div
              className="hover-particles"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="particle"
                  style={{ background: 'linear-gradient(90deg, #00ff88, #00cc6a)' }}
                  initial={{ 
                    scale: 0, 
                    x: 0, 
                    y: 0,
                    opacity: 1 
                  }}
                  animate={{ 
                    scale: [0, 1, 0],
                    x: Math.cos(i * 60 * Math.PI / 180) * 30,
                    y: Math.sin(i * 60 * Math.PI / 180) * 30,
                    opacity: [1, 1, 0]
                  }}
                  transition={{ 
                    duration: 0.8,
                    delay: i * 0.1,
                    ease: "easeOut"
                  }}
                />
              ))}
            </motion.div>
          )}
          
          {isActive && (
            <motion.div
              className="active-indicator"
              layoutId="activeIndicator"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default AnimatedNavLink; 