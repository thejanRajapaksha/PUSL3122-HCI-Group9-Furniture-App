"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Settings, LogOut, Folder, User, Trash2, Edit } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Define the Design type
interface Design {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  thumbnail: string
  data: {
    roomSize: number[]
    wallColor: string
    floorColor: string
    furniture: any[]
    lightIntensity: number
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [designs, setDesigns] = useState<Design[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newDesignName, setNewDesignName] = useState("New Room Design")
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [designToRename, setDesignToRename] = useState<Design | null>(null)
  const [newName, setNewName] = useState("")

  // Load designs from localStorage on component mount
  useEffect(() => {
    const savedDesigns = localStorage.getItem("furnitureDesigns")
    if (savedDesigns) {
      setDesigns(JSON.parse(savedDesigns))
    }
  }, [])

  // Create a new design
  const handleCreateDesign = () => {
    const newDesign: Design = {
      id: Date.now().toString(),
      name: newDesignName,
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
    setDesigns(updatedDesigns)
    localStorage.setItem("furnitureDesigns", JSON.stringify(updatedDesigns))
    setIsCreateDialogOpen(false)
    router.push(`/dashboard/design/${newDesign.id}`)
  }

  // Delete a design
  const handleDeleteDesign = (id: string) => {
    const updatedDesigns = designs.filter((design) => design.id !== id)
    setDesigns(updatedDesigns)
    localStorage.setItem("furnitureDesigns", JSON.stringify(updatedDesigns))
  }

  // Duplicate a design
  const handleDuplicateDesign = (design: Design) => {
    const duplicatedDesign: Design = {
      ...design,
      id: Date.now().toString(),
      name: `${design.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updatedDesigns = [...designs, duplicatedDesign]
    setDesigns(updatedDesigns)
    localStorage.setItem("furnitureDesigns", JSON.stringify(updatedDesigns))
  }

  // Open rename dialog
  const openRenameDialog = (design: Design) => {
    setDesignToRename(design)
    setNewName(design.name)
    setIsRenameDialogOpen(true)
  }

  // Rename a design
  const handleRenameDesign = () => {
    if (!designToRename) return

    const updatedDesigns = designs.map((design) =>
      design.id === designToRename.id
        ? {
            ...design,
            name: newName,
            updatedAt: new Date().toISOString(),
          }
        : design,
    )

    setDesigns(updatedDesigns)
    localStorage.setItem("furnitureDesigns", JSON.stringify(updatedDesigns))
    setIsRenameDialogOpen(false)
    setDesignToRename(null)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="flex min-h-screen flex-col geometric-bg">
      <div className="decoration-dot decoration-dot-1"></div>
      <div className="decoration-dot decoration-dot-2"></div>
      <div className="decoration-dot decoration-dot-3"></div>

      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
              FurnitureVision
            </span>
          </Link>
          <nav className="ml-6 hidden md:flex gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-primary">
              Dashboard
            </Link>
            <Link href="/dashboard/designs" className="text-sm font-medium text-muted-foreground hover:text-primary">
              My Designs
            </Link>
            <Link href="/dashboard/templates" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Templates
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-blue-500/20">
                  <Plus className="mr-2 h-4 w-4 text-blue-500" />
                  New Design
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle>Create New Design</DialogTitle>
                  <DialogDescription>Enter a name for your new design project.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Design Name</Label>
                    <Input
                      id="name"
                      value={newDesignName}
                      onChange={(e) => setNewDesignName(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateDesign}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-user.jpg" alt="User" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                Welcome back, Designer
              </span>
            </h1>
            <p className="text-muted-foreground">Manage your designs and create new visualizations</p>
          </div>
          <Tabs defaultValue="recent">
            <div className="flex items-center justify-between">
              <TabsList className="bg-white/50 backdrop-blur-sm">
                <TabsTrigger value="recent">Recent Designs</TabsTrigger>
                <TabsTrigger value="all">All Designs</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
              </TabsList>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                    <Plus className="mr-2 h-4 w-4" />
                    New Design
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
            <TabsContent value="recent" className="mt-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {designs.length > 0 ? (
                  designs
                    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                    .slice(0, 5)
                    .map((design) => (
                      <Card key={design.id} className="overflow-hidden bg-white card-hover-effect">
                        <div className="aspect-video w-full bg-muted">
                          <img
                            src={design.thumbnail || "/placeholder.svg?height=100&width=200"}
                            alt={design.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <CardHeader className="p-4">
                          <CardTitle className="line-clamp-1 text-lg">{design.name}</CardTitle>
                          <CardDescription>Last edited on {formatDate(design.updatedAt)}</CardDescription>
                        </CardHeader>
                        <CardFooter className="p-4 pt-0 flex justify-between">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-50"
                          >
                            <Link href={`/dashboard/design/${design.id}`}>Edit</Link>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Folder className="mr-2 h-4 w-4 text-blue-500" />
                                Options
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openRenameDialog(design)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicateDesign(design)}>
                                <Folder className="mr-2 h-4 w-4" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete the design "{design.name}". This action cannot be
                                      undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteDesign(design.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </CardFooter>
                      </Card>
                    ))
                ) : (
                  <p className="col-span-full text-center text-muted-foreground py-8">
                    You don't have any designs yet. Create your first design to get started.
                  </p>
                )}
                <Card className="flex h-[250px] flex-col items-center justify-center bg-white/80 backdrop-blur-sm card-hover-effect">
                  <div className="flex flex-col items-center justify-center space-y-2 p-6 text-center">
                    <div className="rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-3">
                      <Plus className="h-6 w-6 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-medium">Create New Design</h3>
                    <p className="text-sm text-muted-foreground">Start a new furniture design visualization</p>
                  </div>
                  <CardFooter className="p-4 pt-0">
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                          Create New
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="all" className="mt-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {designs.length > 0 ? (
                  designs
                    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                    .map((design) => (
                      <Card key={design.id} className="overflow-hidden bg-white card-hover-effect">
                        <div className="aspect-video w-full bg-muted">
                          <img
                            src={design.thumbnail || "/placeholder.svg?height=100&width=200"}
                            alt={design.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <CardHeader className="p-4">
                          <CardTitle className="line-clamp-1 text-lg">{design.name}</CardTitle>
                          <CardDescription>Last edited on {formatDate(design.updatedAt)}</CardDescription>
                        </CardHeader>
                        <CardFooter className="p-4 pt-0 flex justify-between">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-50"
                          >
                            <Link href={`/dashboard/design/${design.id}`}>Edit</Link>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Folder className="mr-2 h-4 w-4 text-blue-500" />
                                Options
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openRenameDialog(design)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicateDesign(design)}>
                                <Folder className="mr-2 h-4 w-4" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete the design "{design.name}". This action cannot be
                                      undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteDesign(design.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </CardFooter>
                      </Card>
                    ))
                ) : (
                  <p className="col-span-full text-center text-muted-foreground py-8">
                    You don't have any designs yet. Create your first design to get started.
                  </p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="templates" className="mt-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="overflow-hidden bg-white card-hover-effect">
                  <div className="aspect-video w-full bg-muted">
                    <img
                      src="/placeholder.svg?height=100&width=200"
                      alt="Living Room Template"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <CardHeader className="p-4">
                    <CardTitle className="line-clamp-1 text-lg">Modern Living Room</CardTitle>
                    <CardDescription>Basic living room layout with sofa and coffee table</CardDescription>
                  </CardHeader>
                  <CardFooter className="p-4 pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-50"
                    >
                      Use Template
                    </Button>
                  </CardFooter>
                </Card>
                <Card className="overflow-hidden bg-white card-hover-effect">
                  <div className="aspect-video w-full bg-muted">
                    <img
                      src="/placeholder.svg?height=100&width=200"
                      alt="Dining Room Template"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <CardHeader className="p-4">
                    <CardTitle className="line-clamp-1 text-lg">Dining Room</CardTitle>
                    <CardDescription>Dining table with chairs for 6 people</CardDescription>
                  </CardHeader>
                  <CardFooter className="p-4 pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-50"
                    >
                      Use Template
                    </Button>
                  </CardFooter>
                </Card>
                <Card className="overflow-hidden bg-white card-hover-effect">
                  <div className="aspect-video w-full bg-muted">
                    <img
                      src="/placeholder.svg?height=100&width=200"
                      alt="Office Template"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <CardHeader className="p-4">
                    <CardTitle className="line-clamp-1 text-lg">Home Office</CardTitle>
                    <CardDescription>Desk, chair and bookshelf arrangement</CardDescription>
                  </CardHeader>
                  <CardFooter className="p-4 pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-50"
                    >
                      Use Template
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Rename Design</DialogTitle>
            <DialogDescription>Enter a new name for your design.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rename">Design Name</Label>
              <Input id="rename" value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRenameDesign}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
