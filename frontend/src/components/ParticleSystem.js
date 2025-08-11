import React, { useRef, useEffect } from 'react';

// Particle effects component
export const ParticleEffect = ({ mood, trigger }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!trigger || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = mood?.intensity * 20 || 50;
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 1.0,
        decay: Math.random() * 0.02 + 0.01,
        size: Math.random() * 4 + 2
      });
    }
    
    const getParticleColor = () => {
      switch (mood?.particles) {
        case 'gold': return '#FFD700';
        case 'yellow': return '#FFEB3B';
        case 'orange': return '#FF9800';
        case 'purple': return '#9C27B0';
        case 'green': return '#4CAF50';
        case 'blue': return '#2196F3';
        case 'red': return '#F44336';
        case 'pink': return '#E91E63';
        case 'indigo': return '#3F51B5';
        default: return '#FFF';
      }
    };
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= particle.decay;
        
        if (particle.life <= 0) {
          particles.splice(index, 1);
          return;
        }
        
        ctx.save();
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = getParticleColor();
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = getParticleColor();
        ctx.fill();
        
        ctx.restore();
      });
      
      if (particles.length > 0) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }, [trigger, mood]);
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

// Confetti celebration component
export const ConfettiCelebration = ({ show, onComplete }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!show || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const confetti = [];
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    
    // Create confetti pieces
    for (let i = 0; i < 150; i++) {
      confetti.push({
        x: Math.random() * canvas.width,
        y: -10,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 3 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 15,
        size: Math.random() * 6 + 3
      });
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      confetti.forEach((piece, index) => {
        piece.x += piece.vx;
        piece.y += piece.vy;
        piece.rotation += piece.rotationSpeed;
        piece.vy += 0.1; // gravity
        
        if (piece.y > canvas.height + 10) {
          confetti.splice(index, 1);
          return;
        }
        
        ctx.save();
        ctx.translate(piece.x, piece.y);
        ctx.rotate(piece.rotation * Math.PI / 180);
        ctx.fillStyle = piece.color;
        ctx.fillRect(-piece.size/2, -1, piece.size, 2);
        
        // Add some sparkle
        ctx.shadowBlur = 5;
        ctx.shadowColor = piece.color;
        ctx.fillRect(-piece.size/2, -1, piece.size, 2);
        
        ctx.restore();
      });
      
      if (confetti.length > 0) {
        requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };
    
    animate();
  }, [show, onComplete]);
  
  return show ? (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  ) : null;
};

// Floating hearts animation for positive moods
export const FloatingHearts = ({ show, onComplete }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    if (!show || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const hearts = [];
    const heartColors = ['#FF69B4', '#FFB6C1', '#FFC0CB', '#FF1493', '#DC143C'];
    
    // Create floating hearts
    for (let i = 0; i < 30; i++) {
      hearts.push({
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * 100,
        vx: (Math.random() - 0.5) * 2,
        vy: -(Math.random() * 2 + 1),
        color: heartColors[Math.floor(Math.random() * heartColors.length)],
        size: Math.random() * 20 + 10,
        opacity: 1,
        decay: 0.01
      });
    }
    
    const drawHeart = (ctx, x, y, size, color, opacity) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x, y + size/4);
      ctx.bezierCurveTo(x, y, x - size/2, y, x - size/2, y + size/4);
      ctx.bezierCurveTo(x - size/2, y + size/2, x, y + size*0.75, x, y + size);
      ctx.bezierCurveTo(x, y + size*0.75, x + size/2, y + size/2, x + size/2, y + size/4);
      ctx.bezierCurveTo(x + size/2, y, x, y, x, y + size/4);
      ctx.fill();
      ctx.restore();
    };
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      hearts.forEach((heart, index) => {
        heart.x += heart.vx;
        heart.y += heart.vy;
        heart.opacity -= heart.decay;
        
        if (heart.opacity <= 0 || heart.y < -50) {
          hearts.splice(index, 1);
          return;
        }
        
        drawHeart(ctx, heart.x, heart.y, heart.size, heart.color, heart.opacity);
      });
      
      if (hearts.length > 0) {
        requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };
    
    animate();
  }, [show, onComplete]);
  
  return show ? (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-40"
    />
  ) : null;
};