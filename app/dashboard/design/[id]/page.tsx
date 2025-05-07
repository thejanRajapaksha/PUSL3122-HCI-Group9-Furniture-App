"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Canvas, useThree, useFrame } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera, Environment, Grid, Html } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Save, ZoomIn, ZoomOut, Move, Sun, RotateCcw } from "lucide-react"
import { HexColorPicker } from "react-colorful"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import * as THREE from "three"

// Furniture components
const Chair = ({ rotation = [0, 0, 0], color = "#8B4513" }) => {
  return (
    <group rotation={rotation}>
      {/* Seat */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[0.5, 0.05, 0.5]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Back */}
      <mesh position={[0, 0.55, -0.225]}>
        <boxGeometry args={[0.5, 0.6, 0.05]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Legs */}
      <mesh position={[0.2, 0.125, 0.2]}>
        <boxGeometry args={[0.05, 0.25, 0.05]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-0.2, 0.125, 0.2]}>
        <boxGeometry args={[0.05, 0.25, 0.05]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.2, 0.125, -0.2]}>
        <boxGeometry args={[0.05, 0.25, 0.05]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-0.2, 0.125, -0.2]}>
        <boxGeometry args={[0.05, 0.25, 0.05]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  )
}

const Table = ({ rotation = [0, 0, 0], color = "#8B4513", size = [1, 0.05, 1] }) => {
  return (
    <group rotation={rotation}>
      {/* Table top */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[size[0], size[1], size[2]]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Legs */}
      <mesh position={[size[0] / 2 - 0.05, 0.25, size[2] / 2 - 0.05]}>
        <boxGeometry args={[0.1, 0.5, 0.1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-size[0] / 2 + 0.05, 0.25, size[2] / 2 - 0.05]}>
        <boxGeometry args={[0.1, 0.5, 0.1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[size[0] / 2 - 0.05, 0.25, -size[2] / 2 + 0.05]}>
        <boxGeometry args={[0.1, 0.5, 0.1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-size[0] / 2 + 0.05, 0.25, -size[2] / 2 + 0.05]}>
        <boxGeometry args={[0.1, 0.5, 0.1]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  )
}

const Room = ({ size = [5, 3, 5], wallColor = "#f5f5f5", floorColor = "#e0e0e0" }) => {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[size[0], size[2]]} />
        <meshStandardMaterial color={floorColor} />
      </mesh>

      {/* Walls */}
      <mesh position={[0, size[1] / 2, -size[2] / 2]}>
        <planeGeometry args={[size[0], size[1]]} />
        <meshStandardMaterial color={wallColor} side={2} />
      </mesh>

      <mesh position={[-size[0] / 2, size[1] / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[size[2], size[1]]} />
        <meshStandardMaterial color={wallColor} side={2} />
      </mesh>

      <mesh position={[size[0] / 2, size[1] / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[size[2], size[1]]} />
        <meshStandardMaterial color={wallColor} side={2} />
      </mesh>
    </group>
  )
}

// Draggable furniture wrapper
const DraggableFurniture = ({ children, id, position, onPositionChange, isSelected, onSelect, view }) => {
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

    // Create an invisible plane for dragging
    if (!planeRef.current) {
      const geometry = new THREE.PlaneGeometry(1000, 1000)
      const material = new THREE.MeshBasicMaterial({ visible: false })
      planeRef.current = new THREE.Mesh(geometry, material)
      planeRef.current.rotation.x = -Math.PI / 2 // Make it horizontal
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
      onPointerOver={() => {
        gl.domElement.style.cursor = "grab"
      }}
      onPointerOut={() => {
        gl.domElement.style.cursor = "auto"
      }}
    >
      {children}
      {isSelected && view === "3d" && (
        <Html>
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
            {dragging ? "Dragging..." : "Click and drag to move"}
          </div>
        </Html>
      )}
    </group>
  )
}

// 2D View Component
const TwoDView = ({ roomSize, furniture, selectedFurniture, onSelectFurniture, onUpdatePosition }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const scale = 50 // pixels per meter

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set canvas dimensions based on room size
    canvas.width = roomSize[0] * scale
    canvas.height = roomSize[2] * scale

    // Draw room
    ctx.fillStyle = "#f5f5f5"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = "#e0e0e0"
    ctx.lineWidth = 1

    // Draw vertical grid lines
    for (let x = 0; x <= roomSize[0]; x++) {
      ctx.beginPath()
      ctx.moveTo(x * scale, 0)
      ctx.lineTo(x * scale, canvas.height)
      ctx.stroke()
    }

    // Draw horizontal grid lines
    for (let y = 0; y <= roomSize[2]; y++) {
      ctx.beginPath()
      ctx.moveTo(0, y * scale)
      ctx.lineTo(canvas.width, y * scale)
      ctx.stroke()
    }

    // Draw furniture
    furniture.forEach((item) => {
      const x = (item.position[0] + roomSize[0] / 2) * scale
      const y = (item.position[2] + roomSize[2] / 2) * scale

      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(item.rotation[1])

      // Set color and stroke
      ctx.fillStyle = item.color
      ctx.strokeStyle = item.id === selectedFurniture ? "#4f46e5" : "#666"
      ctx.lineWidth = item.id === selectedFurniture ? 2 : 1

      if (item.type === "chair") {
        // Draw chair
        ctx.fillRect(-12.5, -12.5, 25, 25)
        ctx.strokeRect(-12.5, -12.5, 25, 25)

        // Draw chair back
        ctx.fillRect(-12.5, -20, 25, 7.5)
        ctx.strokeRect(-12.5, -20, 25, 7.5)
      } else if (item.type === "table") {
        // Draw table
        const width = (item.size[0] * scale) / 2
        const depth = (item.size[2] * scale) / 2
        ctx.fillRect(-width, -depth, width * 2, depth * 2)
        ctx.strokeRect(-width, -depth, width * 2, depth * 2)
      }

      ctx.restore()
    })

    // Add click handler for furniture selection
    const handleCanvasClick = (e) => {
      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left) / scale - roomSize[0] / 2
      const y = (e.clientY - rect.top) / scale - roomSize[2] / 2

      // Check if click is on furniture
      for (let i = furniture.length - 1; i >= 0; i--) {
        const item = furniture[i]
        const itemX = item.position[0]
        const itemZ = item.position[2]

        let width, depth
        if (item.type === "chair") {
          width = 0.5
          depth = 0.5
        } else if (item.type === "table") {
          width = item.size[0]
          depth = item.size[2]
        }

        // Simple bounding box check
        if (x >= itemX - width / 2 && x <= itemX + width / 2 && y >= itemZ - depth / 2 && y <= itemZ + depth / 2) {
          onSelectFurniture(item.id)
          return
        }
      }

      // If no furniture was clicked, deselect
      onSelectFurniture(null)
    }

    canvas.onclick = handleCanvasClick

    // Add drag handler for furniture movement
    let isDragging = false
    let draggedItemId = null

    canvas.onmousedown = (e) => {
      if (selectedFurniture === null) return

      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left) / scale - roomSize[0] / 2
      const y = (e.clientY - rect.top) / scale - roomSize[2] / 2

      // Check if mousedown is on selected furniture
      const selectedItem = furniture.find((item) => item.id === selectedFurniture)
      if (!selectedItem) return

      const itemX = selectedItem.position[0]
      const itemZ = selectedItem.position[2]

      let width, depth
      if (selectedItem.type === "chair") {
        width = 0.5
        depth = 0.5
      } else if (selectedItem.type === "table") {
        width = selectedItem.size[0]
        depth = selectedItem.size[2]
      }

      if (x >= itemX - width / 2 && x <= itemX + width / 2 && y >= itemZ - depth / 2 && y <= itemZ + depth / 2) {
        isDragging = true
        draggedItemId = selectedItem.id
      }
    }

    canvas.onmousemove = (e) => {
      if (!isDragging || draggedItemId === null) return

      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left) / scale - roomSize[0] / 2
      const y = (e.clientY - rect.top) / scale - roomSize[2] / 2

      const selectedItem = furniture.find((item) => item.id === draggedItemId)
      if (!selectedItem) return

      // Update position
      const newPosition = [...selectedItem.position]
      newPosition[0] = x
      newPosition[2] = y

      // Constrain to room boundaries
      newPosition[0] = Math.max(-roomSize[0] / 2 + 0.25, Math.min(roomSize[0] / 2 - 0.25, newPosition[0]))
      newPosition[2] = Math.max(-roomSize[2] / 2 + 0.25, Math.min(roomSize[2] / 2 - 0.25, newPosition[2]))

      onUpdatePosition(draggedItemId, newPosition)
    }

    canvas.onmouseup = () => {
      isDragging = false
      draggedItemId = null
    }

    canvas.onmouseleave = () => {
      isDragging = false
      draggedItemId = null
    }

    return () => {
      canvas.onclick = null
      canvas.onmousedown = null
      canvas.onmousemove = null
      canvas.onmouseup = null
      canvas.onmouseleave = null
    }
  }, [roomSize, furniture, selectedFurniture])

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative border shadow-md bg-white">
        <canvas ref={canvasRef} />
        <div className="absolute top-2 left-2 text-xs text-gray-500">
          2D Floor Plan - Click and drag furniture to move
        </div>
      </div>
    </div>
  )
}

// Design Editor Component
export default function DesignEditor() {
  const router = useRouter()
  const params = useParams()
  const designId = params.id

  const [view, setView] = useState("3d")
  const [roomSize, setRoomSize] = useState([5, 3, 5])
  const [wallColor, setWallColor] = useState("#f5f5f5")
  const [floorColor, setFloorColor] = useState("#e0e0e0")
  const [selectedFurniture, setSelectedFurniture] = useState(null)
  const [furniture, setFurniture] = useState([])
  const [designName, setDesignName] = useState("New Room Design")
  const [lightIntensity, setLightIntensity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  // Load design data
  useEffect(() => {
    const loadDesign = () => {
      try {
        const savedDesigns = localStorage.getItem("furnitureDesigns")
        if (savedDesigns) {
          const designs = JSON.parse(savedDesigns)
          const design = designs.find((d) => d.id === designId)

          if (design) {
            setDesignName(design.name)
            setRoomSize(design.data.roomSize || [5, 3, 5])
            setWallColor(design.data.wallColor || "#f5f5f5")
            setFloorColor(design.data.floorColor || "#e0e0e0")
            setFurniture(design.data.furniture || [])
            setLightIntensity(design.data.lightIntensity || 1)
          } else {
            // Design not found, create a new one
            const newDesign = {
              id: designId,
              name: "New Room Design",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              thumbnail: "/placeholder.svg?height=100&width=200",
              data: {
                roomSize: [5, 3, 5],
                wallColor: "#f5f5f5",
                floorColor: "#e0e0e0",
                furniture: [],
                lightIntensity: 1,
              },
            }

            const updatedDesigns = [...designs, newDesign]
            localStorage.setItem("furnitureDesigns", JSON.stringify(updatedDesigns))
          }
        } else {
          // No designs exist yet, create a new one
          const newDesign = {
            id: designId,
            name: "New Room Design",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            thumbnail: "/placeholder.svg?height=100&width=200",
            data: {
              roomSize: [5, 3, 5],
              wallColor: "#f5f5f5",
              floorColor: "#e0e0e0",
              furniture: [],
              lightIntensity: 1,
            },
          }

          localStorage.setItem("furnitureDesigns", JSON.stringify([newDesign]))
        }
      } catch (error) {
        console.error("Error loading design:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDesign()
  }, [designId])

  const handleUpdatePosition = (id, newPosition) => {
    setFurniture(furniture.map((item) => (item.id === id ? { ...item, position: newPosition } : item)))
  }

  const handleAddFurniture = (type) => {
    const newId = Math.max(0, ...furniture.map((f) => f.id || 0), 0) + 1
    let newFurniture

    if (type === "chair") {
      newFurniture = { id: newId, type, position: [0, 0, 0], rotation: [0, 0, 0], color: "#8B4513" }
    } else if (type === "table") {
      newFurniture = {
        id: newId,
        type,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        color: "#A0522D",
        size: [1.5, 0.05, 1],
      }
    }

    setFurniture([...furniture, newFurniture])
    setSelectedFurniture(newId)
  }

  const handleUpdateFurniture = (id, updates) => {
    setFurniture(furniture.map((item) => (item.id === id ? { ...item, ...updates } : item)))
  }

  const handleDeleteFurniture = (id) => {
    setFurniture(furniture.filter((item) => item.id !== id))
    if (selectedFurniture === id) {
      setSelectedFurniture(null)
    }
  }

  const handleSaveDesign = () => {
    try {
      const savedDesigns = localStorage.getItem("furnitureDesigns")
      const designs = savedDesigns ? JSON.parse(savedDesigns) : []

      const designData = {
        roomSize,
        wallColor,
        floorColor,
        furniture,
        lightIntensity,
      }

      const existingDesignIndex = designs.findIndex((d) => d.id === designId)

      if (existingDesignIndex >= 0) {
        // Update existing design
        designs[existingDesignIndex] = {
          ...designs[existingDesignIndex],
          name: designName,
          updatedAt: new Date().toISOString(),
          data: designData,
        }
      } else {
        // Create new design
        designs.push({
          id: designId,
          name: designName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          thumbnail: "/placeholder.svg?height=100&width=200",
          data: designData,
        })
      }

      localStorage.setItem("furnitureDesigns", JSON.stringify(designs))
      toast({
        title: "Design saved",
        description: `"${designName}" has been saved successfully.`,
      })
    } catch (error) {
      console.error("Error saving design:", error)
      toast({
        title: "Error saving design",
        description: "There was a problem saving your design. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading design...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="flex h-14 items-center px-4 lg:px-6">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Input
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              className="h-8 w-[200px] lg:w-[300px]"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDesign}
              className="border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-50"
            >
              <Save className="mr-2 h-4 w-4 text-blue-500" />
              Save
            </Button>
          </div>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - Tools */}
        <div className="w-64 border-r bg-white/80 backdrop-blur-sm p-4 overflow-auto">
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-sm font-medium text-blue-600">Room Settings</h3>
              <div className="space-y-3">
                <div className="grid gap-2">
                  <Label htmlFor="room-width">Width (m)</Label>
                  <Slider
                    id="room-width"
                    min={2}
                    max={10}
                    step={0.1}
                    value={[roomSize[0]]}
                    onValueChange={(value) => setRoomSize([value[0], roomSize[1], roomSize[2]])}
                    className="[&>span]:bg-blue-500"
                  />
                  <div className="text-xs text-muted-foreground">{roomSize[0].toFixed(1)}m</div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="room-height">Height (m)</Label>
                  <Slider
                    id="room-height"
                    min={2}
                    max={5}
                    step={0.1}
                    value={[roomSize[1]]}
                    onValueChange={(value) => setRoomSize([roomSize[0], value[0], roomSize[2]])}
                    className="[&>span]:bg-blue-500"
                  />
                  <div className="text-xs text-muted-foreground">{roomSize[1].toFixed(1)}m</div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="room-depth">Depth (m)</Label>
                  <Slider
                    id="room-depth"
                    min={2}
                    max={10}
                    step={0.1}
                    value={[roomSize[2]]}
                    onValueChange={(value) => setRoomSize([roomSize[0], roomSize[1], value[0]])}
                    className="[&>span]:bg-blue-500"
                  />
                  <div className="text-xs text-muted-foreground">{roomSize[2].toFixed(1)}m</div>
                </div>
                <div className="grid gap-2">
                  <Label>Wall Color</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal border-blue-500/20"
                      >
                        <div className="mr-2 h-4 w-4 rounded-full" style={{ backgroundColor: wallColor }} />
                        {wallColor}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <HexColorPicker color={wallColor} onChange={setWallColor} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label>Floor Color</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal border-blue-500/20"
                      >
                        <div className="mr-2 h-4 w-4 rounded-full" style={{ backgroundColor: floorColor }} />
                        {floorColor}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <HexColorPicker color={floorColor} onChange={setFloorColor} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="light-intensity">Light Intensity</Label>
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-muted-foreground" />
                    <Slider
                      id="light-intensity"
                      min={0.1}
                      max={2}
                      step={0.1}
                      value={[lightIntensity]}
                      onValueChange={(value) => setLightIntensity(value[0])}
                      className="[&>span]:bg-blue-500"
                    />
                    <Sun className="h-5 w-5 text-yellow-500" />
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-blue-100" />

            <div>
              <h3 className="mb-2 text-sm font-medium text-purple-600">Add Furniture</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleAddFurniture("chair")}
                  className="border-purple-500/20 hover:border-purple-500/50 hover:bg-purple-50"
                >
                  Chair
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleAddFurniture("table")}
                  className="border-purple-500/20 hover:border-purple-500/50 hover:bg-purple-50"
                >
                  Table
                </Button>
              </div>
            </div>

            {selectedFurniture && (
              <>
                <Separator className="bg-pink-100" />

                <div>
                  <h3 className="mb-2 text-sm font-medium text-pink-600">Edit Furniture</h3>
                  {(() => {
                    const selected = furniture.find((f) => f.id === selectedFurniture)
                    if (!selected) return null

                    return (
                      <div className="space-y-3">
                        <div className="grid gap-2">
                          <Label>Type</Label>
                          <div className="text-sm">
                            {selected.type.charAt(0).toUpperCase() + selected.type.slice(1)}
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label>Position X</Label>
                          <Slider
                            min={-roomSize[0] / 2 + 0.25}
                            max={roomSize[0] / 2 - 0.25}
                            step={0.1}
                            value={[selected.position[0]]}
                            onValueChange={(value) => {
                              const newPosition = [...selected.position]
                              newPosition[0] = value[0]
                              handleUpdateFurniture(selected.id, { position: newPosition })
                            }}
                            className="[&>span]:bg-pink-500"
                          />
                          <div className="text-xs text-muted-foreground">{selected.position[0].toFixed(1)}m</div>
                        </div>

                        <div className="grid gap-2">
                          <Label>Position Z</Label>
                          <Slider
                            min={-roomSize[2] / 2 + 0.25}
                            max={roomSize[2] / 2 - 0.25}
                            step={0.1}
                            value={[selected.position[2]]}
                            onValueChange={(value) => {
                              const newPosition = [...selected.position]
                              newPosition[2] = value[0]
                              handleUpdateFurniture(selected.id, { position: newPosition })
                            }}
                            className="[&>span]:bg-pink-500"
                          />
                          <div className="text-xs text-muted-foreground">{selected.position[2].toFixed(1)}m</div>
                        </div>

                        <div className="grid gap-2">
                          <Label>Color</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal border-pink-500/20"
                              >
                                <div
                                  className="mr-2 h-4 w-4 rounded-full"
                                  style={{ backgroundColor: selected.color }}
                                />
                                {selected.color}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <HexColorPicker
                                color={selected.color}
                                onChange={(color) => handleUpdateFurniture(selected.id, { color })}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="grid gap-2">
                          <Label>Rotation (Y)</Label>
                          <Slider
                            min={0}
                            max={360}
                            step={15}
                            value={[selected.rotation[1] * (180 / Math.PI)]}
                            onValueChange={(value) => {
                              const newRotation = [...selected.rotation]
                              newRotation[1] = value[0] * (Math.PI / 180)
                              handleUpdateFurniture(selected.id, { rotation: newRotation })
                            }}
                            className="[&>span]:bg-pink-500"
                          />
                        </div>

                        {selected.type === "table" && (
                          <>
                            <div className="grid gap-2">
                              <Label>Width</Label>
                              <Slider
                                min={0.5}
                                max={3}
                                step={0.1}
                                value={[selected.size[0]]}
                                onValueChange={(value) => {
                                  const newSize = [...selected.size]
                                  newSize[0] = value[0]
                                  handleUpdateFurniture(selected.id, { size: newSize })
                                }}
                                className="[&>span]:bg-pink-500"
                              />
                              <div className="text-xs text-muted-foreground">{selected.size[0].toFixed(1)}m</div>
                            </div>

                            <div className="grid gap-2">
                              <Label>Depth</Label>
                              <Slider
                                min={0.5}
                                max={3}
                                step={0.1}
                                value={[selected.size[2]]}
                                onValueChange={(value) => {
                                  const newSize = [...selected.size]
                                  newSize[2] = value[0]
                                  handleUpdateFurniture(selected.id, { size: newSize })
                                }}
                                className="[&>span]:bg-pink-500"
                              />
                              <div className="text-xs text-muted-foreground">{selected.size[2].toFixed(1)}m</div>
                            </div>
                          </>
                        )}

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteFurniture(selected.id)}
                          className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
                        >
                          Delete
                        </Button>
                      </div>
                    )
                  })()}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Main content - Canvas */}
        <div className="flex-1 overflow-hidden relative">
          <div className="absolute top-4 left-4 z-10">
            <Tabs value={view} onValueChange={setView} className="w-[200px]">
              <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm">
                <TabsTrigger value="2d">2D</TabsTrigger>
                <TabsTrigger value="3d">3D</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="absolute bottom-4 right-4 z-10 flex gap-2">
            <Button variant="outline" size="icon" className="bg-white/80 backdrop-blur-sm border-blue-500/20">
              <ZoomIn className="h-4 w-4 text-blue-500" />
            </Button>
            <Button variant="outline" size="icon" className="bg-white/80 backdrop-blur-sm border-blue-500/20">
              <ZoomOut className="h-4 w-4 text-blue-500" />
            </Button>
            <Button variant="outline" size="icon" className="bg-white/80 backdrop-blur-sm border-blue-500/20">
              <Move className="h-4 w-4 text-blue-500" />
            </Button>
            <Button variant="outline" size="icon" className="bg-white/80 backdrop-blur-sm border-blue-500/20">
              <RotateCcw className="h-4 w-4 text-blue-500" />
            </Button>
          </div>

          {view === "3d" ? (
            <Canvas shadows>
              <PerspectiveCamera makeDefault position={[0, 2, 5]} />
              <OrbitControls />
              <ambientLight intensity={0.5 * lightIntensity} />
              <directionalLight position={[5, 5, 5]} intensity={1 * lightIntensity} castShadow />

              <Room size={roomSize} wallColor={wallColor} floorColor={floorColor} />

              {furniture.map((item) => {
                if (item.type === "chair") {
                  return (
                    <DraggableFurniture
                      key={item.id}
                      id={item.id}
                      position={item.position}
                      onPositionChange={handleUpdatePosition}
                      isSelected={selectedFurniture === item.id}
                      onSelect={setSelectedFurniture}
                      view={view}
                    >
                      <Chair rotation={item.rotation} color={item.color} />
                    </DraggableFurniture>
                  )
                } else if (item.type === "table") {
                  return (
                    <DraggableFurniture
                      key={item.id}
                      id={item.id}
                      position={item.position}
                      onPositionChange={handleUpdatePosition}
                      isSelected={selectedFurniture === item.id}
                      onSelect={setSelectedFurniture}
                      view={view}
                    >
                      <Table rotation={item.rotation} color={item.color} size={item.size} />
                    </DraggableFurniture>
                  )
                }
                return null
              })}

              <Grid infiniteGrid cellSize={1} sectionSize={1} fadeDistance={50} fadeStrength={1.5} />
              <Environment preset="apartment" />
            </Canvas>
          ) : (
            <TwoDView
              roomSize={roomSize}
              furniture={furniture}
              selectedFurniture={selectedFurniture}
              onSelectFurniture={setSelectedFurniture}
              onUpdatePosition={handleUpdatePosition}
            />
          )}
        </div>
      </div>
      <Toaster />
    </div>
  )
}
