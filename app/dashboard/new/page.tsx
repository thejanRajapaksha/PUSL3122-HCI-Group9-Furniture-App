"use client"

import React, { useState, useRef, useEffect } from "react"
import { Canvas, useThree, useFrame } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera, Environment, Grid, Html } from "@react-three/drei"
import * as THREE from "three"

// Chair component
export const Chair = ({ rotation = [0, 0, 0], color = "#8B4513" }) => (
  <group rotation={rotation}>
    <mesh position={[0, 0.25, 0]}>
      <boxGeometry args={[0.5, 0.05, 0.5]} />
      <meshStandardMaterial color={color} />
    </mesh>
    <mesh position={[0, 0.55, -0.225]}>
      <boxGeometry args={[0.5, 0.6, 0.05]} />
      <meshStandardMaterial color={color} />
    </mesh>
    {[
      [0.2, 0.125, 0.2],
      [-0.2, 0.125, 0.2],
      [0.2, 0.125, -0.2],
      [-0.2, 0.125, -0.2],
    ].map((pos, i) => (
      <mesh key={i} position={pos}>
        <boxGeometry args={[0.05, 0.25, 0.05]} />
        <meshStandardMaterial color={color} />
      </mesh>
    ))}
  </group>
)

// Table component
export const Table = ({ rotation = [0, 0, 0], color = "#8B4513", size = [1, 0.05, 1] }) => (
  <group rotation={rotation}>
    <mesh position={[0, 0.5, 0]}>
      <boxGeometry args={[size[0], size[1], size[2]]} />
      <meshStandardMaterial color={color} />
    </mesh>
    {[
      [size[0] / 2 - 0.05, 0.25, size[2] / 2 - 0.05],
      [-size[0] / 2 + 0.05, 0.25, size[2] / 2 - 0.05],
      [size[0] / 2 - 0.05, 0.25, -size[2] / 2 + 0.05],
      [-size[0] / 2 + 0.05, 0.25, -size[2] / 2 + 0.05],
    ].map((pos, i) => (
      <mesh key={i} position={pos}>
        <boxGeometry args={[0.1, 0.5, 0.1]} />
        <meshStandardMaterial color={color} />
      </mesh>
    ))}
  </group>
)

// Room component
export const Room = ({ size = [5, 3, 5], wallColor = "#f5f5f5", floorColor = "#e0e0e0" }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[size[0], size[2]]} />
      <meshStandardMaterial color={floorColor} />
    </mesh>
    {[
      [0, size[1] / 2, -size[2] / 2, 0],
      [-size[0] / 2, size[1] / 2, 0, Math.PI / 2],
      [size[0] / 2, size[1] / 2, 0, -Math.PI / 2],
    ].map(([x, y, z, rotY], i) => (
      <mesh key={i} position={[x, y, z]} rotation={[0, rotY, 0]}>
        <planeGeometry args={[rotY ? size[2] : size[0], size[1]]} />
        <meshStandardMaterial color={wallColor} side={2} />
      </mesh>
    ))}
  </group>
)

// Draggable wrapper for 3D objects
export const DraggableFurniture = ({ children, id, position, onPositionChange, isSelected, onSelect, view }) => {
  const [dragging, setDragging] = useState(false)
  const [pos, setPos] = useState(position)
  const { camera, raycaster, mouse, scene, gl } = useThree()
  const meshRef = useRef()
  const planeRef = useRef()
  const dragStartPos = useRef({ x: 0, z: 0 })

  useEffect(() => {
    setPos(position)
  }, [position])

  useFrame(() => {
    if (dragging && meshRef.current && planeRef.current) {
      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObject(planeRef.current)
      if (intersects.length > 0) {
        const { x, z } = intersects[0].point
        const newPos = [x, position[1], z]
        setPos(newPos)
        onPositionChange(id, newPos)
      }
    }
  })

  const handlePointerDown = (e) => {
    e.stopPropagation()
    setDragging(true)
    onSelect(id)
    dragStartPos.current = { x: pos[0], z: pos[2] }

    if (!planeRef.current) {
      const geometry = new THREE.PlaneGeometry(1000, 1000)
      const material = new THREE.MeshBasicMaterial({ visible: false })
      planeRef.current = new THREE.Mesh(geometry, material)
      planeRef.current.rotation.x = -Math.PI / 2
      scene.add(planeRef.current)
    }

    gl.domElement.style.cursor = "grabbing"
  }

  const handlePointerUp = () => {
    setDragging(false)
    gl.domElement.style.cursor = "grab"
  }

  useEffect(() => {
    if (meshRef.current) {
      document.addEventListener("pointerup", handlePointerUp)
      document.addEventListener("pointercancel", handlePointerUp)
    }

    return () => {
      document.removeEventListener("pointerup", handlePointerUp)
      document.removeEventListener("pointercancel", handlePointerUp)
      if (planeRef.current) {
        scene.remove(planeRef.current)
        planeRef.current = null
      }
    }
  }, [])

  return (
    <group
      ref={meshRef}
      position={pos}
      onPointerDown={handlePointerDown}
      onPointerOver={() => (gl.domElement.style.cursor = "grab")}
      onPointerOut={() => (gl.domElement.style.cursor = "auto")}
    >
      {children}
      {isSelected && view === "3d" && (
        <Html>
          <div className="bg-primary text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
            {dragging ? "Dragging..." : "Click and drag to move"}
          </div>
        </Html>
      )}
    </group>
  )
}
