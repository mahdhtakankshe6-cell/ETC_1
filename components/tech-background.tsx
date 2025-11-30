"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
}

export function TechBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // 初始化粒子 - 中间多，周围少
    const particleCount = Math.min(85, Math.floor(window.innerWidth / 16))
    particlesRef.current = []

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    for (let i = 0; i < particleCount; i++) {
      // 70%的粒子集中在中间区域，30%分布在周围
      let x, y
      if (Math.random() < 0.7) {
        // 中间区域（中心50%范围）
        x = centerX + (Math.random() - 0.5) * canvas.width * 0.5
        y = centerY + (Math.random() - 0.5) * canvas.height * 0.5
      } else {
        // 周围区域（全屏）
        x = Math.random() * canvas.width
        y = Math.random() * canvas.height
      }

      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2.5 + 1,
        opacity: Math.random() * 0.6 + 0.3,
      })
    }

    const primaryColor = { r: 77, g: 173, b: 140 }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const particles = particlesRef.current

      // 更新和绘制粒子
      particles.forEach((particle, i) => {
        // 更新位置
        particle.x += particle.vx
        particle.y += particle.vy

        // 边界检测 - 碰到边缘反弹
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        // 绘制粒子
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, ${particle.opacity})`
        ctx.fill()

        // 绘制连线
        particles.forEach((other, j) => {
          if (i >= j) return
          const dx = particle.x - other.x
          const dy = particle.y - other.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 150) {
            const opacity = (1 - distance / 150) * 0.35
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(other.x, other.y)
            ctx.strokeStyle = `rgba(${primaryColor.r}, ${primaryColor.g}, ${primaryColor.b}, ${opacity})`
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        })
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <>
      {/* 粒子Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ opacity: 0.8 }}
      />

      {/* 旋转光环 - 外圈 */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
        <div
          className="w-[600px] h-[600px] md:w-[800px] md:h-[800px] rounded-full animate-rotate-slow"
          style={{
            border: "1px solid rgba(77, 173, 140, 0.1)",
            boxShadow: "0 0 60px rgba(77, 173, 140, 0.05)",
          }}
        />
      </div>

      {/* 旋转光环 - 中圈 */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
        <div
          className="w-[400px] h-[400px] md:w-[550px] md:h-[550px] rounded-full animate-rotate-reverse"
          style={{
            border: "1px dashed rgba(77, 173, 140, 0.15)",
          }}
        />
      </div>

      {/* 旋转光环 - 内圈 */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
        <div
          className="w-[200px] h-[200px] md:w-[300px] md:h-[300px] rounded-full animate-rotate-slow"
          style={{
            border: "2px solid rgba(77, 173, 140, 0.08)",
            boxShadow: "inset 0 0 40px rgba(77, 173, 140, 0.05)",
          }}
        />
      </div>

      {/* 中间区域光点 - 多 */}
      <div className="fixed top-[30%] left-[25%] w-2.5 h-2.5 rounded-full animate-pulse-slow pointer-events-none z-0"
           style={{ backgroundColor: "rgba(77, 173, 140, 0.7)", boxShadow: "0 0 8px rgba(77, 173, 140, 0.5)" }} />
      <div className="fixed top-[35%] right-[20%] w-2 h-2 rounded-full animate-pulse-slow pointer-events-none z-0"
           style={{ backgroundColor: "rgba(77, 173, 140, 0.65)", boxShadow: "0 0 7px rgba(77, 173, 140, 0.45)", animationDelay: "0.7s" }} />
      <div className="fixed top-[45%] left-[18%] w-2 h-2 rounded-full animate-pulse-slow pointer-events-none z-0"
           style={{ backgroundColor: "rgba(77, 173, 140, 0.6)", boxShadow: "0 0 6px rgba(77, 173, 140, 0.4)", animationDelay: "1.2s" }} />
      <div className="fixed top-[40%] right-[25%] w-1.5 h-1.5 rounded-full animate-pulse-slow pointer-events-none z-0"
           style={{ backgroundColor: "rgba(77, 173, 140, 0.7)", boxShadow: "0 0 6px rgba(77, 173, 140, 0.5)", animationDelay: "1.8s" }} />
      <div className="fixed bottom-[40%] left-[22%] w-2.5 h-2.5 rounded-full animate-pulse-slow pointer-events-none z-0"
           style={{ backgroundColor: "rgba(77, 173, 140, 0.65)", boxShadow: "0 0 8px rgba(77, 173, 140, 0.45)", animationDelay: "0.3s" }} />
      <div className="fixed bottom-[35%] right-[18%] w-2 h-2 rounded-full animate-pulse-slow pointer-events-none z-0"
           style={{ backgroundColor: "rgba(77, 173, 140, 0.6)", boxShadow: "0 0 6px rgba(77, 173, 140, 0.4)", animationDelay: "2.2s" }} />
      <div className="fixed bottom-[30%] left-[30%] w-1.5 h-1.5 rounded-full animate-pulse-slow pointer-events-none z-0"
           style={{ backgroundColor: "rgba(77, 173, 140, 0.7)", boxShadow: "0 0 5px rgba(77, 173, 140, 0.5)", animationDelay: "1.5s" }} />
      <div className="fixed top-[50%] right-[30%] w-2 h-2 rounded-full animate-pulse-slow pointer-events-none z-0"
           style={{ backgroundColor: "rgba(77, 173, 140, 0.55)", boxShadow: "0 0 6px rgba(77, 173, 140, 0.35)", animationDelay: "2.5s" }} />
      {/* 周围光点 - 少 */}
      <div className="fixed top-20 left-4 w-1.5 h-1.5 rounded-full animate-pulse-slow pointer-events-none z-0"
           style={{ backgroundColor: "rgba(77, 173, 140, 0.5)", boxShadow: "0 0 5px rgba(77, 173, 140, 0.3)", animationDelay: "1s" }} />
      <div className="fixed top-24 right-5 w-1.5 h-1.5 rounded-full animate-pulse-slow pointer-events-none z-0"
           style={{ backgroundColor: "rgba(77, 173, 140, 0.45)", boxShadow: "0 0 4px rgba(77, 173, 140, 0.25)", animationDelay: "2s" }} />
      <div className="fixed bottom-24 left-5 w-1.5 h-1.5 rounded-full animate-pulse-slow pointer-events-none z-0"
           style={{ backgroundColor: "rgba(77, 173, 140, 0.5)", boxShadow: "0 0 5px rgba(77, 173, 140, 0.3)", animationDelay: "0.5s" }} />
      <div className="fixed bottom-20 right-4 w-1.5 h-1.5 rounded-full animate-pulse-slow pointer-events-none z-0"
           style={{ backgroundColor: "rgba(77, 173, 140, 0.45)", boxShadow: "0 0 4px rgba(77, 173, 140, 0.25)", animationDelay: "1.7s" }} />
    </>
  )
}
