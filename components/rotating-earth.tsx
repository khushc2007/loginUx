"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import * as d3 from "d3"

interface RotatingEarthProps {
  width?: number
  height?: number
  className?: string
}

export default function RotatingEarth({ width = 800, height = 600, className = "" }: RotatingEarthProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    if (!context) return

    const setupCanvas = () => {
      const parent = canvas.parentElement
      const parentWidth = parent ? parent.clientWidth : Math.min(width, window.innerWidth - 32)
      const containerWidth = Math.min(width, parentWidth)
      const containerHeight = Math.round(containerWidth * (height / width))
      const radius = Math.min(containerWidth, containerHeight) / 2.5

      const dpr = window.devicePixelRatio || 1
      canvas.width = containerWidth * dpr
      canvas.height = containerHeight * dpr
      canvas.style.width = `${containerWidth}px`
      canvas.style.height = `${containerHeight}px`
      context.scale(dpr, dpr)

      return { containerWidth, containerHeight, radius }
    }

    let { containerWidth, containerHeight, radius } = setupCanvas()

    // Create projection and path generator for Canvas
    const projection = d3
      .geoOrthographic()
      .scale(radius)
      .translate([containerWidth / 2, containerHeight / 2])
      .clipAngle(90)

    const path = d3.geoPath().projection(projection).context(context)

    const pointInPolygon = (point: [number, number], polygon: number[][]): boolean => {
      const [x, y] = point
      let inside = false

      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i]
        const [xj, yj] = polygon[j]

        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
          inside = !inside
        }
      }

      return inside
    }

    const pointInFeature = (point: [number, number], feature: any): boolean => {
      const geometry = feature.geometry

      if (geometry.type === "Polygon") {
        const coordinates = geometry.coordinates
        if (!pointInPolygon(point, coordinates[0])) {
          return false
        }
        for (let i = 1; i < coordinates.length; i++) {
          if (pointInPolygon(point, coordinates[i])) {
            return false
          }
        }
        return true
      } else if (geometry.type === "MultiPolygon") {
        for (const polygon of geometry.coordinates) {
          if (pointInPolygon(point, polygon[0])) {
            let inHole = false
            for (let i = 1; i < polygon.length; i++) {
              if (pointInPolygon(point, polygon[i])) {
                inHole = true
                break
              }
            }
            if (!inHole) {
              return true
            }
          }
        }
        return false
      }

      return false
    }

    const generateDotsInPolygon = (feature: any, dotSpacing = 16) => {
      const dots: [number, number][] = []
      const bounds = d3.geoBounds(feature)
      const [[minLng, minLat], [maxLng, maxLat]] = bounds

      const stepSize = dotSpacing * 0.08

      for (let lng = minLng; lng <= maxLng; lng += stepSize) {
        for (let lat = minLat; lat <= maxLat; lat += stepSize) {
          const point: [number, number] = [lng, lat]
          if (pointInFeature(point, feature)) {
            dots.push(point)
          }
        }
      }

      return dots
    }

    interface DotData {
      lng: number
      lat: number
      visible: boolean
    }

    const allDots: DotData[] = []
    let landFeatures: any

    const render = () => {
      context.clearRect(0, 0, containerWidth, containerHeight)

      const currentScale = projection.scale()
      const scaleFactor = currentScale / radius

      // Draw globe background with subtle glow
      const gradient = context.createRadialGradient(
        containerWidth / 2, containerHeight / 2, 0,
        containerWidth / 2, containerHeight / 2, currentScale * 1.2
      )
      gradient.addColorStop(0, "rgba(6, 182, 212, 0.05)")
      gradient.addColorStop(0.7, "rgba(6, 182, 212, 0.02)")
      gradient.addColorStop(1, "transparent")
      context.fillStyle = gradient
      context.fillRect(0, 0, containerWidth, containerHeight)

      // Draw ocean
      context.beginPath()
      context.arc(containerWidth / 2, containerHeight / 2, currentScale, 0, 2 * Math.PI)
      context.fillStyle = "rgba(0, 0, 0, 0.8)"
      context.fill()
      context.strokeStyle = "rgba(6, 182, 212, 0.3)"
      context.lineWidth = 1.5 * scaleFactor
      context.stroke()

      if (landFeatures) {
        // Draw graticule
        const graticule = d3.geoGraticule()
        context.beginPath()
        path(graticule())
        context.strokeStyle = "rgba(6, 182, 212, 0.15)"
        context.lineWidth = 0.5 * scaleFactor
        context.stroke()

        // Draw land outlines
        context.beginPath()
        landFeatures.features.forEach((feature: any) => {
          path(feature)
        })
        context.strokeStyle = "rgba(6, 182, 212, 0.4)"
        context.lineWidth = 1 * scaleFactor
        context.stroke()

        // Draw halftone dots
        allDots.forEach((dot) => {
          const projected = projection([dot.lng, dot.lat])
          if (
            projected &&
            projected[0] >= 0 &&
            projected[0] <= containerWidth &&
            projected[1] >= 0 &&
            projected[1] <= containerHeight
          ) {
            context.beginPath()
            context.arc(projected[0], projected[1], 1.2 * scaleFactor, 0, 2 * Math.PI)
            context.fillStyle = "rgba(6, 182, 212, 0.6)"
            context.fill()
          }
        })
      }
    }

    const loadWorldData = async () => {
      try {
        setIsLoading(true)

        const response = await fetch(
          "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json",
        )
        if (!response.ok) throw new Error("Failed to load land data")

        landFeatures = await response.json()

        landFeatures.features.forEach((feature: any) => {
          const dots = generateDotsInPolygon(feature, 16)
          dots.forEach(([lng, lat]) => {
            allDots.push({ lng, lat, visible: true })
          })
        })

        render()
        setIsLoading(false)
      } catch (err) {
        setError("Failed to load land map data")
        setIsLoading(false)
      }
    }

    // Physics-based rotation state
    const rotation: [number, number] = [0, 0]
    const velocity: [number, number] = [0.3, 0] // Initial idle velocity
    const idleSpeed = 1.55
    const friction = 0.95
    const minVelocity = 0.01
    let isDragging = false
    let lastMousePos: [number, number] | null = null
    let lastTime = performance.now()

    const animate = () => {
      const now = performance.now()
      const delta = Math.min((now - lastTime) / 16.67, 2) // Normalize to ~60fps, cap at 2x
      lastTime = now

      if (!isDragging) {
        // Apply friction
        velocity[0] *= Math.pow(friction, delta)
        velocity[1] *= Math.pow(friction, delta)

        // Settle back to idle rotation
        const targetVelocityX = idleSpeed
        const settleRate = 0.02 * delta
        velocity[0] += (targetVelocityX - velocity[0]) * settleRate

        // Clamp very small velocities
        if (Math.abs(velocity[1]) < minVelocity) velocity[1] = 0
      }

      // Apply velocity to rotation
      rotation[0] += velocity[0] * delta
      rotation[1] += velocity[1] * delta

      // Clamp vertical rotation
      rotation[1] = Math.max(-90, Math.min(90, rotation[1]))

      projection.rotate(rotation)
      render()

      requestAnimationFrame(animate)
    }

    const handleMouseDown = (event: MouseEvent) => {
      isDragging = true
      lastMousePos = [event.clientX, event.clientY]
      velocity[0] = 0
      velocity[1] = 0
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging || !lastMousePos) return

      const sensitivity = 0.4
      const dx = event.clientX - lastMousePos[0]
      const dy = event.clientY - lastMousePos[1]

      // Update velocity based on mouse movement
      velocity[0] = dx * sensitivity
      velocity[1] = -dy * sensitivity

      // Apply rotation immediately for responsive feel
      rotation[0] += velocity[0]
      rotation[1] += velocity[1]
      rotation[1] = Math.max(-90, Math.min(90, rotation[1]))

      lastMousePos = [event.clientX, event.clientY]
    }

    const handleMouseUp = () => {
      isDragging = false
      lastMousePos = null
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      const scaleFactor = event.deltaY > 0 ? 0.95 : 1.05
      const newRadius = Math.max(radius * 0.5, Math.min(radius * 2, projection.scale() * scaleFactor))
      projection.scale(newRadius)
    }

    // Touch support
    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        isDragging = true
        lastMousePos = [event.touches[0].clientX, event.touches[0].clientY]
        velocity[0] = 0
        velocity[1] = 0
      }
    }

    const handleTouchMove = (event: TouchEvent) => {
      if (!isDragging || !lastMousePos || event.touches.length !== 1) return
      event.preventDefault()

      const sensitivity = 0.4
      const dx = event.touches[0].clientX - lastMousePos[0]
      const dy = event.touches[0].clientY - lastMousePos[1]

      velocity[0] = dx * sensitivity
      velocity[1] = -dy * sensitivity

      rotation[0] += velocity[0]
      rotation[1] += velocity[1]
      rotation[1] = Math.max(-90, Math.min(90, rotation[1]))

      lastMousePos = [event.touches[0].clientX, event.touches[0].clientY]
    }

    const handleTouchEnd = () => {
      isDragging = false
      lastMousePos = null
    }

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      const newDims = setupCanvas()
      containerWidth = newDims.containerWidth
      containerHeight = newDims.containerHeight
      radius = newDims.radius
      const dpr = window.devicePixelRatio || 1
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      projection.scale(radius).translate([containerWidth / 2, containerHeight / 2])
    })
    if (canvas.parentElement) resizeObserver.observe(canvas.parentElement)

    canvas.addEventListener("mousedown", handleMouseDown)
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    canvas.addEventListener("wheel", handleWheel, { passive: false })
    canvas.addEventListener("touchstart", handleTouchStart, { passive: true })
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false })
    canvas.addEventListener("touchend", handleTouchEnd)

    loadWorldData()
    const animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
      resizeObserver.disconnect()
      canvas.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      canvas.removeEventListener("wheel", handleWheel)
      canvas.removeEventListener("touchstart", handleTouchStart)
      canvas.removeEventListener("touchmove", handleTouchMove)
      canvas.removeEventListener("touchend", handleTouchEnd)
    }
  }, [width, height])

  if (error) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <p className="text-red-400 font-semibold mb-2">Error loading Earth visualization</p>
          <p className="text-white/60 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-auto cursor-grab active:cursor-grabbing"
        style={{ maxWidth: "100%", height: "auto" }}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/60 text-sm">Loading globe...</div>
        </div>
      )}
    </div>
  )
}
